import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { UserPlus, Users, Check, X } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { useEffect } from "react";

const Notifications = () => {
  const { currentUser } = useAuth();
  const queryClient = useQueryClient();

  // Fetch current user data
  const { data: userData } = useQuery({
    queryKey: ['user', currentUser?.email],
    queryFn: () => api.users.getByEmail(currentUser?.email || ''),
    enabled: !!currentUser?.email,
  });

  const userId = userData?.userid || userData?.userId || userData?.id;

  // Fetch pending friend requests (where user is the receiver)
  const { data: friendships = [] } = useQuery({
    queryKey: ['friendships', userId],
    queryFn: () => api.friendships.getByUser(userId?.toString()),
    enabled: !!userId,
  });

  // Fetch groups user is a member of
  const { data: userGroups = [] } = useQuery({
    queryKey: ['groups', 'user', userId],
    queryFn: () => api.groups.getUserGroups(userId?.toString()),
    enabled: !!userId,
  });

  // Filter pending friend requests where current user is the receiver
  const pendingRequests = friendships.filter(
    (f: any) => 
      (f.userId2 === userId || f.user2Id === userId) && 
      f.status === 'pending'
  );

  // Get recent group additions (joined within last 7 days)
  const recentGroups = userGroups.filter((g: any) => {
    const joinedDate = new Date(g.joinedAt || g.createdAt);
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    return joinedDate > sevenDaysAgo && g.userRole !== 'admin'; // Not admin means they were added
  });

  // Accept friend request mutation
  const acceptFriendMutation = useMutation({
    mutationFn: (friendshipId: number) => 
      api.friendships.updateStatus(friendshipId.toString(), 'accepted'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['friendships'] });
      toast.success('Friend request accepted!');
    },
    onError: () => {
      toast.error('Failed to accept friend request');
    }
  });

  // Reject friend request mutation
  const rejectFriendMutation = useMutation({
    mutationFn: (friendshipId: number) => 
      api.friendships.delete(friendshipId.toString()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['friendships'] });
      toast.success('Friend request declined');
    },
    onError: () => {
      toast.error('Failed to decline friend request');
    }
  });

  const handleAccept = (friendshipId: number) => {
    acceptFriendMutation.mutate(friendshipId);
  };

  const handleReject = (friendshipId: number) => {
    rejectFriendMutation.mutate(friendshipId);
  };

  const totalNotifications = pendingRequests.length + recentGroups.length;

  // Mark notifications as viewed when this page is opened
  useEffect(() => {
    if (userId && totalNotifications > 0) {
      const viewedKey = `notifications_viewed_${userId}`;
      const currentViewed = {
        timestamp: new Date().toISOString(),
        friendRequests: pendingRequests.map((r: any) => r.friendshipId || r.friendshipid),
        groupAdditions: recentGroups.map((g: any) => g.groupId || g.groupid),
      };
      localStorage.setItem(viewedKey, JSON.stringify(currentViewed));
    }
  }, [userId, totalNotifications, pendingRequests, recentGroups]);

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Notifications</h1>
          <p className="text-muted-foreground mt-1">
            {totalNotifications === 0 
              ? "You're all caught up!" 
              : `You have ${totalNotifications} notification${totalNotifications > 1 ? 's' : ''}`}
          </p>
        </div>
        {totalNotifications > 0 && (
          <Badge variant="default" className="text-lg px-3 py-1">
            {totalNotifications}
          </Badge>
        )}
      </div>

      {/* Friend Requests */}
      {pendingRequests.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserPlus className="h-5 w-5" />
              Friend Requests
              <Badge variant="secondary">{pendingRequests.length}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {pendingRequests.map((request: any) => (
              <div
                key={request.friendshipId || request.friendshipid}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={request.senderPhoto} />
                    <AvatarFallback>
                      {request.senderName?.charAt(0).toUpperCase() || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold">{request.senderName}</p>
                    <p className="text-sm text-muted-foreground">
                      {request.senderEmail}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {format(new Date(request.createdAt), 'MMM d, yyyy')}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={() => handleAccept(request.friendshipId || request.friendshipid)}
                    disabled={acceptFriendMutation.isPending}
                  >
                    <Check className="h-4 w-4 mr-1" />
                    Accept
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleReject(request.friendshipId || request.friendshipid)}
                    disabled={rejectFriendMutation.isPending}
                  >
                    <X className="h-4 w-4 mr-1" />
                    Decline
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Group Additions */}
      {recentGroups.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Recent Group Additions
              <Badge variant="secondary">{recentGroups.length}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {recentGroups.map((group: any) => (
              <div
                key={group.groupId || group.groupid}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <Users className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold">{group.groupName}</p>
                    <p className="text-sm text-muted-foreground">
                      You were added to this group
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Created by {group.creatorName} • {group.memberCount} members
                    </p>
                  </div>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => window.location.href = `/groups/${group.groupId || group.groupid}`}
                >
                  View Group
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Empty State */}
      {totalNotifications === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <div className="flex justify-center mb-4">
              <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center">
                <Check className="h-8 w-8 text-muted-foreground" />
              </div>
            </div>
            <h3 className="text-lg font-semibold mb-2">No new notifications</h3>
            <p className="text-muted-foreground">
              You're all caught up! Check back later for updates.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Notifications;
