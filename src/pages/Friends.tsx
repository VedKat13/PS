import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { UserPlus, UserCheck, UserX, Mail, Search, Clock } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { toast } from "sonner";

const Friends = () => {
  const [activeTab, setActiveTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const { currentUser } = useAuth();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  // Get all users for suggestions
  const { data: allUsers = [], isLoading: isLoadingUsers } = useQuery({
    queryKey: ['users'],
    queryFn: api.users.getAll,
  });

  // Find current user from allUsers array (workaround for email endpoint issue)  
  const userDataRaw = allUsers.find((u: any) => u.email === currentUser?.email);
  
  // MySQL might return column names in different casing, normalize the userID field
  const userData = userDataRaw ? {
    ...userDataRaw,
    userID: userDataRaw.userID || userDataRaw.userid || userDataRaw.userId || userDataRaw.UserID
  } : undefined;

  console.log('Debug - userData:', userData);
  console.log('Debug - currentUser?.email:', currentUser?.email);
  console.log('Debug - allUsers:', allUsers);
  console.log('Debug - Found userData with email match:', userData);
  
  if (userData) {
    console.log('Debug - userData.userID:', userData.userID);
    console.log('Debug - userData keys:', Object.keys(userData));
    console.log('Debug - userDataRaw direct access:', userDataRaw);
    console.log('Debug - userDataRaw["userID"]:', userDataRaw["userID"]);
    console.log('Debug - userDataRaw.userID:', userDataRaw.userID);
  } else {
    console.log('Debug - No user found with email:', currentUser?.email);
    console.log('Debug - Available emails:', allUsers.map((u: any) => u.email));
  }

  // Get all friendships for current user
  const { data: friendshipsData = [], isLoading } = useQuery({
    queryKey: ['friendships', userData?.userID],
    queryFn: () => api.friendships.getByUser(userData?.userID.toString()),
    enabled: !!userData?.userID,
  });

  // Ensure friendships is always an array
  const friendships = Array.isArray(friendshipsData) ? friendshipsData : [];

  console.log('Debug - friendships:', friendships);
  console.log('Debug - friendshipsData:', friendshipsData);

  // Filter friendships by status
  const acceptedFriends = friendships.filter((f: any) => 
    f.status?.toLowerCase() === 'accepted'
  );
  const pendingRequests = friendships.filter((f: any) => 
    f.status?.toLowerCase() === 'pending' && f.userTwoId === userData?.userID
  );

  // Mutation to send friend request
  const sendRequestMutation = useMutation({
    mutationFn: (friendId: number) => {
      const payload = {
        userOneId: userData?.userID,
        userTwoId: friendId,
        status: 'Pending'
      };
      console.log('Debug - Sending friend request with payload:', payload);
      console.log('Debug - userData?.userID:', userData?.userID);
      console.log('Debug - friendId:', friendId);
      return api.friendships.create(payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['friendships'] });
      toast.success('Friend request sent!');
    },
    onError: (error) => {
      console.error('Debug - Friend request error:', error);
      toast.error('Failed to send friend request');
    },
  });

  // Mutation to accept friend request
  const acceptRequestMutation = useMutation({
    mutationFn: (friendshipId: number) =>
      api.friendships.updateStatus(friendshipId.toString(), 'accepted'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['friendships'] });
      toast.success('Friend request accepted!');
    },
    onError: () => {
      toast.error('Failed to accept friend request');
    },
  });

  // Mutation to reject friend request
  const rejectRequestMutation = useMutation({
    mutationFn: (friendshipId: number) =>
      api.friendships.delete(friendshipId.toString()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['friendships'] });
      toast.success('Friend request rejected');
    },
    onError: () => {
      toast.error('Failed to reject friend request');
    },
  });

  // Mutation to cancel sent friend request
  const cancelRequestMutation = useMutation({
    mutationFn: (friendshipId: number) =>
      api.friendships.delete(friendshipId.toString()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['friendships'] });
      toast.success('Friend request cancelled');
    },
    onError: () => {
      toast.error('Failed to cancel friend request');
    },
  });

  // Get all user IDs that have ACCEPTED friendship with current user
  const acceptedFriendIds = acceptedFriends.map((f: any) => {
    const otherId = f.userOneId === userData?.userID ? f.userTwoId : f.userOneId;
    return otherId;
  });
  
  // Get sent pending requests with friendshipId for cancellation
  const sentRequests = friendships
    .filter((f: any) => 
      f.status?.toLowerCase() === 'pending' && f.userOneId === userData?.userID
    )
    .map((f: any) => ({
      userId: f.userTwoId,
      friendshipId: f.friendshipId || f.friendshipid
    }));
  
  const sentRequestIds = sentRequests.map(r => r.userId);
  
  console.log('Debug - acceptedFriendIds:', acceptedFriendIds);
  console.log('Debug - sentRequests:', sentRequests);
  console.log('Debug - userData?.userID:', userData?.userID);
  
  const suggestions = userData ? allUsers
    .filter((user: any) => {
      const userIdToCheck = user.userID || user.userId;
      console.log('Checking user:', userIdToCheck, user.name, 'against current user:', userData.userID);
      
      // Exclude current user
      if (userIdToCheck === userData.userID) {
        console.log('  -> Excluded: is current user');
        return false;
      }
      
      // Exclude users who are already accepted friends
      if (acceptedFriendIds.includes(userIdToCheck)) {
        console.log('  -> Excluded: already accepted friends');
        return false;
      }
      
      // Apply search filter
      if (searchQuery !== '') {
        const search = searchQuery.toLowerCase();
        const matches = (
          user.name?.toLowerCase().includes(search) ||
          user.branch?.toLowerCase().includes(search) ||
          user.email?.toLowerCase().includes(search)
        );
        console.log('  -> Search filter:', matches);
        return matches;
      }
      
      console.log('  -> Included!');
      return true;
    })
    .slice(0, 10) : [];
    
  console.log('Debug - Final suggestions:', suggestions);

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Friends & Connections</h1>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Search users by name, branch, or email..."
          className="pl-10"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="all">All Friends ({acceptedFriends.length})</TabsTrigger>
          <TabsTrigger value="pending">
            Requests ({pendingRequests.length})
            {pendingRequests.length > 0 && (
              <Badge variant="destructive" className="ml-2 h-5 w-5 flex items-center justify-center p-0">
                {pendingRequests.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="suggestions">Find Friends</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          <Card className="animate-fade-in">
            <CardHeader>
              <CardTitle>Your Friends</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {isLoading ? (
                <div className="text-center py-8">Loading friends...</div>
              ) : acceptedFriends.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No friends yet. Add some friends to get started!
                </div>
              ) : (
                acceptedFriends.map((friendship: any) => {
                  // The backend returns the friend's userID directly from the JOIN
                  // We just need to find that user in allUsers
                  const friend = allUsers.find((u: any) => 
                    (u.userID || u.userId) === friendship.userID
                  );
                  
                  if (!friend) return null;
                  
                  return (
                    <div
                      key={friendship.friendshipId || friendship.friendshipid}
                      className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-accent/5 transition-colors cursor-pointer"
                      onClick={() => navigate(`/profile/${friend.userID || friend.userId}`)}
                    >
                      <div className="flex items-center gap-3">
                        <Avatar className="h-12 w-12">
                          <AvatarFallback className="bg-gradient-to-br from-primary to-accent text-primary-foreground font-semibold">
                            {friend.name?.split(' ').map((n: string) => n[0]).join('') || 'U'}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-semibold">{friend.name || 'User'}</p>
                          <p className="text-sm text-muted-foreground">
                            {friend.branch || 'No branch specified'}
                          </p>
                          {friend.specialization && (
                            <p className="text-xs text-muted-foreground">
                              {friend.specialization}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                        <Button 
                          size="sm" 
                          variant="destructive"
                          onClick={() => {
                            if (confirm(`Remove ${friend.name} from friends?`)) {
                              rejectRequestMutation.mutate(friendship.friendshipId || friendship.friendshipid);
                            }
                          }}
                          disabled={rejectRequestMutation.isPending}
                        >
                          <UserX className="h-4 w-4 mr-2" />
                          Remove Friend
                        </Button>
                      </div>
                    </div>
                  );
                })
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pending" className="space-y-4">
          <Card className="animate-fade-in">
            <CardHeader>
              <CardTitle>Pending Requests</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {isLoading ? (
                <div className="text-center py-8">Loading requests...</div>
              ) : pendingRequests.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No pending requests
                </div>
              ) : (
                pendingRequests.map((request: any) => {
                  // The sender is userOneId (the person who sent the request)
                  const requester = allUsers.find((u: any) => 
                    (u.userID || u.userId) === request.userOneId
                  );
                  
                  if (!requester) return null;
                  
                  return (
                    <div
                      key={request.friendshipId || request.friendshipid}
                      className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-accent/5 transition-colors cursor-pointer"
                      onClick={() => navigate(`/profile/${requester.userID || requester.userId}`)}
                    >
                      <div className="flex items-center gap-3">
                        <Avatar className="h-12 w-12">
                          <AvatarFallback className="bg-gradient-to-br from-primary to-accent text-primary-foreground font-semibold">
                            {requester.name?.split(' ').map((n: string) => n[0]).join('') || 'U'}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-semibold">{requester.name || 'User'}</p>
                          <p className="text-sm text-muted-foreground">
                            {requester.branch || 'No branch specified'}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                        <Button 
                          size="sm" 
                          variant="default"
                          onClick={() => acceptRequestMutation.mutate(request.friendshipId || request.friendshipid)}
                          disabled={acceptRequestMutation.isPending}
                        >
                          <UserCheck className="h-4 w-4 mr-2" />
                          Accept
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => rejectRequestMutation.mutate(request.friendshipId || request.friendshipid)}
                          disabled={rejectRequestMutation.isPending}
                        >
                          <UserX className="h-4 w-4 mr-2" />
                          Decline
                        </Button>
                      </div>
                    </div>
                  );
                })
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="suggestions" className="space-y-4">
          <Card className="animate-fade-in">
            <CardHeader>
              <CardTitle>Find Friends</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {isLoadingUsers ? (
                <div className="text-center py-8">Loading users...</div>
              ) : suggestions.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  {searchQuery ? 'No users found matching your search' : 'No suggestions available'}
                </div>
              ) : (
                suggestions.map((user: any) => {
                  const userId = user.userID || user.userId || user.userid;
                  const sentRequest = sentRequests.find(r => r.userId === userId);
                  const hasRequestSent = !!sentRequest;
                  
                  return (
                    <div
                      key={userId}
                      className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-accent/5 transition-colors cursor-pointer"
                      onClick={() => navigate(`/profile/${userId}`)}
                    >
                      <div className="flex items-center gap-3">
                        <Avatar className="h-12 w-12">
                          <AvatarFallback className="bg-gradient-to-br from-primary to-accent text-primary-foreground font-semibold">
                            {user.name?.split(' ').map((n: string) => n[0]).join('') || 'U'}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-semibold">{user.name || 'User'}</p>
                          <p className="text-sm text-muted-foreground">
                            {user.branch || 'No branch specified'}
                          </p>
                          {user.specialization && (
                            <p className="text-xs text-muted-foreground">
                              {user.specialization}
                            </p>
                          )}
                        </div>
                      </div>
                      <div onClick={(e) => e.stopPropagation()}>
                        {hasRequestSent ? (
                          <Button 
                            size="sm" 
                            variant="secondary"
                            onClick={() => cancelRequestMutation.mutate(sentRequest.friendshipId)}
                            disabled={cancelRequestMutation.isPending}
                          >
                            <Clock className="h-4 w-4 mr-2" />
                            Request Sent
                          </Button>
                        ) : (
                          <Button 
                            size="sm" 
                            variant="default"
                            onClick={() => sendRequestMutation.mutate(userId)}
                            disabled={sendRequestMutation.isPending}
                          >
                            <UserPlus className="h-4 w-4 mr-2" />
                            Add Friend
                          </Button>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Friends;
