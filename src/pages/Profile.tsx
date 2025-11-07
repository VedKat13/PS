import ProfileCard from "@/components/ProfileCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Award, BookOpen, Code } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { UserPlus, UserX, Clock, UserCheck } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "sonner";

const Profile = () => {
  const { currentUser } = useAuth();
  const { userId } = useParams(); // Get userId from URL
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  
  // Fetch current user's data to get their userID
  const { data: currentUserData } = useQuery({
    queryKey: ['currentUser', currentUser?.email],
    queryFn: () => api.users.getByEmail(currentUser?.email || ''),
    enabled: !!currentUser?.email,
  });
  
  // Fetch user data from MySQL database
  // If userId is in URL, fetch that user's profile, otherwise fetch current user's profile
  const { data: user, isLoading, error } = useQuery({
    queryKey: userId ? ['user', userId] : ['user', currentUser?.email],
    queryFn: userId 
      ? () => api.users.getById(userId)
      : () => api.users.getByEmail(currentUser?.email || ''),
    enabled: userId ? !!userId : !!currentUser?.email,
    retry: false, // Don't retry if user not found
  });

  // Check if viewing own profile (must be before friendships query)
  // If no userId in URL, it's own profile
  // If userId matches current user's email, it's own profile
  const isOwnProfile = !userId || user?.email === currentUser?.email;

  // Fetch friendships for current user (only when viewing another user's profile)
  const { data: friendships = [] } = useQuery({
    queryKey: ['friendships', currentUserData?.userid],
    queryFn: () => api.friendships.getByUser(currentUserData?.userid?.toString() || ''),
    enabled: !!currentUserData && !isOwnProfile,
  });

  // Determine friendship status with the viewed user
  const viewedUserId = user?.userid;
  const currentUserId = currentUserData?.userid;
  
  const friendship = friendships.find((f: any) => {
    const isUserOne = f.userOneId === currentUserId && f.userTwoId === viewedUserId;
    const isUserTwo = f.userTwoId === currentUserId && f.userOneId === viewedUserId;
    return isUserOne || isUserTwo;
  });

  const friendshipStatus = friendship?.status?.toLowerCase();
  const isFriend = friendshipStatus === 'accepted';
  const hasSentRequest = friendshipStatus === 'pending' && friendship?.userOneId === currentUserId;
  const hasReceivedRequest = friendshipStatus === 'pending' && friendship?.userTwoId === currentUserId;

  // Mutations
  const sendRequestMutation = useMutation({
    mutationFn: () => 
      api.friendships.create({
        userOneId: currentUserId,
        userTwoId: viewedUserId,
        status: 'Pending'
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['friendships', currentUserData?.userID || currentUserData?.userId], refetchType: 'active' });
      toast.success('Friend request sent!');
    },
    onError: () => {
      toast.error('Failed to send friend request');
    },
  });

  const cancelRequestMutation = useMutation({
    mutationFn: () => api.friendships.delete((friendship?.friendshipId || friendship?.friendshipid)?.toString()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['friendships', currentUserData?.userID || currentUserData?.userId], refetchType: 'active' });
      toast.success('Friend request cancelled');
    },
    onError: () => {
      toast.error('Failed to cancel request');
    },
  });

  const acceptRequestMutation = useMutation({
    mutationFn: () => api.friendships.updateStatus((friendship?.friendshipId || friendship?.friendshipid)?.toString(), 'Accepted'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['friendships', currentUserData?.userID || currentUserData?.userId], refetchType: 'active' });
      toast.success('Friend request accepted!');
    },
    onError: () => {
      toast.error('Failed to accept request');
    },
  });

  const removeFriendMutation = useMutation({
    mutationFn: () => api.friendships.delete((friendship?.friendshipId || friendship?.friendshipid)?.toString()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['friendships', currentUserData?.userID || currentUserData?.userId], refetchType: 'active' });
      toast.success('Friend removed');
    },
    onError: () => {
      toast.error('Failed to remove friend');
    },
  });

  // Parse achievements from user data
  let achievements: Array<{title: string, description?: string, icon?: any}> = [];
  if (user?.achievements) {
    try {
      const parsedAchievements = typeof user.achievements === 'string' 
        ? JSON.parse(user.achievements) 
        : user.achievements;
      achievements = Array.isArray(parsedAchievements) ? parsedAchievements : [];
    } catch (error) {
      console.error('Error parsing achievements:', error);
    }
  }

  // Parse projects from user data - for now just display as text
  // We can enhance this later to parse structured project data
  const projectsText = user?.projects || '';
  
  // Fallback hardcoded achievements if none in database (for demo)
  const defaultAchievements = achievements.length === 0 ? [
    { title: "Hackathon Winner 2023", icon: Award },
    { title: "Research Publication", icon: BookOpen },
    { title: "Open Source Contributor", icon: Code },
  ] : achievements.map(ach => ({ ...ach, icon: Award })); // Add default icon

  const projects = [
    {
      title: "Smart Campus Navigation App",
      description: "Mobile app for campus navigation using AR",
      tech: ["React Native", "ARKit", "Firebase"]
    },
    {
      title: "Student Collaboration Platform",
      description: "Web platform for academic collaboration",
      tech: ["React", "Node.js", "MongoDB"]
    }
  ];

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg">Loading profile...</div>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="flex flex-col justify-center items-center h-64 space-y-4">
        <div className="text-lg text-red-500">
          {error ? 'User not found or has been deleted.' : 'Error loading profile.'}
        </div>
        <Button onClick={() => navigate('/home')}>
          Go to Home
        </Button>
      </div>
    );
  }

  // Render friend action button based on status
  const renderFriendActionButton = () => {
    if (isOwnProfile) return null;

    if (isFriend) {
      return (
        <Button 
          size="sm"
          variant="destructive"
          onClick={() => {
            if (confirm(`Remove ${user?.name} from friends?`)) {
              removeFriendMutation.mutate();
            }
          }}
          disabled={removeFriendMutation.isPending}
        >
          <UserX className="h-4 w-4 mr-2" />
          Remove Friend
        </Button>
      );
    }

    if (hasReceivedRequest) {
      return (
        <>
          <Button 
            size="sm"
            variant="default"
            onClick={() => acceptRequestMutation.mutate()}
            disabled={acceptRequestMutation.isPending}
          >
            <UserCheck className="h-4 w-4 mr-2" />
            Accept
          </Button>
          <Button 
            size="sm"
            variant="outline"
            onClick={() => cancelRequestMutation.mutate()}
            disabled={cancelRequestMutation.isPending}
          >
            <UserX className="h-4 w-4 mr-2" />
            Decline
          </Button>
        </>
      );
    }

    if (hasSentRequest) {
      return (
        <Button 
          size="sm"
          variant="secondary"
          onClick={() => cancelRequestMutation.mutate()}
          disabled={cancelRequestMutation.isPending}
        >
          <Clock className="h-4 w-4 mr-2" />
          Request Sent
        </Button>
      );
    }

    return (
      <Button 
        size="sm"
        variant="default"
        onClick={() => sendRequestMutation.mutate()}
        disabled={sendRequestMutation.isPending}
      >
        <UserPlus className="h-4 w-4 mr-2" />
        Add Friend
      </Button>
    );
  };

  // Parse skills from specialization field (comma-separated)
  const skills = user?.specialization 
    ? user.specialization.split(',').map((s: string) => s.trim()).filter((s: string) => s.length > 0)
    : [];

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <ProfileCard
        name={user?.name || "User"}
        email={user?.email || ""}
        branch={user?.branch || ""}
        bio={user?.bio || ""}
        location={user?.location || ""}
        profilePhoto={user?.profilePhoto || ""}
        academicYear={user?.academicYear}
        skills={skills}
        isOwnProfile={isOwnProfile}
        onEdit={() => navigate('/settings')}
        friendActionButton={renderFriendActionButton()}
      />

      {/* Achievements */}
      <Card className="animate-fade-in">
        <CardHeader>
          <CardTitle>Achievements</CardTitle>
        </CardHeader>
        <CardContent>
          {achievements.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              No achievements added yet.
            </p>
          ) : (
            <div className="grid sm:grid-cols-3 gap-4">
              {defaultAchievements.map((achievement, index) => {
                const Icon = achievement.icon || Award;
                return (
                  <div
                    key={index}
                    className="flex flex-col items-center text-center p-4 rounded-lg border bg-card hover:bg-accent/5 transition-colors"
                  >
                    <div className="h-12 w-12 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center mb-2">
                      <Icon className="h-6 w-6 text-primary-foreground" />
                    </div>
                    <p className="font-medium text-sm mb-1">{achievement.title}</p>
                    {achievement.description && (
                      <p className="text-xs text-muted-foreground">{achievement.description}</p>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Projects */}
      <Card className="animate-fade-in">
        <CardHeader>
          <CardTitle>Projects</CardTitle>
        </CardHeader>
        <CardContent>
          {projectsText ? (
            <div className="prose prose-sm max-w-none">
              <p className="text-sm whitespace-pre-wrap">{projectsText}</p>
            </div>
          ) : (
            <div className="space-y-4">
              {projects.map((project, index) => (
                <div
                  key={index}
                  className="p-4 rounded-lg border bg-card hover:bg-accent/5 transition-colors"
                >
                  <h3 className="font-semibold mb-1">{project.title}</h3>
                  <p className="text-sm text-muted-foreground mb-3">{project.description}</p>
                  <div className="flex flex-wrap gap-1.5">
                    {project.tech.map((tech, i) => (
                      <Badge key={i} variant="secondary" className="text-xs">
                        {tech}
                      </Badge>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Profile;