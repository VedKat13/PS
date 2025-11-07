import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  ArrowLeft, 
  Users, 
  Crown, 
  UserPlus, 
  Plus, 
  Trash2,
  MessageSquare,
  Shield,
  Search,
  LogOut,
  AlertTriangle
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { format } from "date-fns";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export default function GroupDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const queryClient = useQueryClient();

  const [addMemberDialogOpen, setAddMemberDialogOpen] = useState(false);
  const [createPostDialogOpen, setCreatePostDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [postFormData, setPostFormData] = useState({
    title: "",
    content: ""
  });

  // Fetch current user data
  const { data: userData } = useQuery({
    queryKey: ['user', currentUser?.email],
    queryFn: () => api.users.getByEmail(currentUser?.email || ''),
    enabled: !!currentUser?.email,
  });

  const userId = userData?.userid || userData?.userId || userData?.id;

  // Fetch group details
  const { data: group, isLoading: groupLoading } = useQuery({
    queryKey: ['group', id],
    queryFn: () => api.groups.getById(id!),
    enabled: !!id,
  });

  // Fetch group members
  const { data: members = [], isLoading: membersLoading } = useQuery({
    queryKey: ['group', id, 'members'],
    queryFn: () => api.groups.getMembers(id!),
    enabled: !!id,
  });

  // Fetch group posts
  const { data: posts = [] } = useQuery({
    queryKey: ['group', id, 'posts'],
    queryFn: () => api.groups.getPosts(id!),
    enabled: !!id,
  });

  console.log('Posts data:', posts);

  // Search users to add
  const { data: searchResults = [] } = useQuery({
    queryKey: ['group', id, 'search', searchQuery],
    queryFn: () => api.groups.searchUsers(id!, searchQuery),
    enabled: !!id && searchQuery.length >= 2,
  });

  const isAdmin = members.some((m: any) => m.userId === userId && m.role === 'admin');
  const isMember = members.some((m: any) => m.userId === userId);

  // Add member mutation
  const addMemberMutation = useMutation({
    mutationFn: (userid: number) => api.groups.addMember(id!, { userid }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['group', id, 'members'] });
      queryClient.invalidateQueries({ queryKey: ['group', id] });
      toast.success('Member added successfully!');
      setSearchQuery("");
    },
    onError: (error: any) => {
      const errorMessage = error?.response?.data?.error || 'Failed to add member';
      toast.error(errorMessage);
    }
  });

  // Remove member mutation
  const removeMemberMutation = useMutation({
    mutationFn: (userid: number) => api.groups.removeMember(id!, userid.toString()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['group', id, 'members'] });
      queryClient.invalidateQueries({ queryKey: ['group', id] });
      toast.success('Member removed successfully!');
    },
    onError: (error: any) => {
      const errorMessage = error?.response?.data?.error || 'Failed to remove member';
      toast.error(errorMessage);
    }
  });

  // Create post mutation
  const createPostMutation = useMutation({
    mutationFn: (data: any) => api.groups.createPost(id!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['group', id, 'posts'] });
      toast.success('Instruction posted successfully!');
      setCreatePostDialogOpen(false);
      setPostFormData({ title: "", content: "" });
    },
    onError: (error: any) => {
      const errorMessage = error?.response?.data?.error || 'Failed to create post';
      toast.error(errorMessage);
    }
  });

  // Delete post mutation
  const deletePostMutation = useMutation({
    mutationFn: (postid: number) => api.groups.deletePost(id!, postid.toString(), userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['group', id, 'posts'] });
      toast.success('Instruction deleted successfully!');
    },
    onError: (error: any) => {
      const errorMessage = error?.response?.data?.error || 'Failed to delete post';
      toast.error(errorMessage);
    }
  });

  // Leave group mutation
  const leaveGroupMutation = useMutation({
    mutationFn: () => api.groups.removeMember(id!, userId.toString()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['groups'] });
      toast.success('You have left the group');
      navigate('/groups');
    },
    onError: (error: any) => {
      const errorMessage = error?.response?.data?.error || 'Failed to leave group';
      toast.error(errorMessage);
    }
  });

  // Delete group mutation
  const deleteGroupMutation = useMutation({
    mutationFn: () => api.groups.delete(id!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['groups'] });
      toast.success('Group deleted successfully');
      navigate('/groups');
    },
    onError: (error: any) => {
      const errorMessage = error?.response?.data?.error || 'Failed to delete group';
      toast.error(errorMessage);
    }
  });

  const handleAddMember = (userid: number) => {
    addMemberMutation.mutate(userid);
  };

  const handleRemoveMember = (userid: number, userName: string) => {
    if (window.confirm(`Remove ${userName} from the group?`)) {
      removeMemberMutation.mutate(userid);
    }
  };

  const handleCreatePost = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!postFormData.title.trim() || !postFormData.content.trim()) {
      toast.error('Title and content are required');
      return;
    }

    createPostMutation.mutate({
      adminId: userId,
      title: postFormData.title,
      content: postFormData.content
    });
  };

  const handleDeletePost = (postid: number) => {
    console.log('Attempting to delete post with ID:', postid);
    if (window.confirm('Delete this instruction?')) {
      console.log('User confirmed, calling mutation');
      deletePostMutation.mutate(postid);
    }
  };

  if (groupLoading || membersLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg">Loading group...</div>
      </div>
    );
  }

  if (!group) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <p className="text-lg text-muted-foreground mb-4">Group not found</p>
        <Button onClick={() => navigate('/groups')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Groups
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={() => navigate('/groups')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Groups
        </Button>
        <div className="flex gap-2">
          {isAdmin && (
            <>
              <Button onClick={() => setAddMemberDialogOpen(true)}>
                <UserPlus className="h-4 w-4 mr-2" />
                Add Members
              </Button>
              <Button onClick={() => setCreatePostDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Post Instruction
              </Button>
              {/* Delete Group - Admin only */}
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive">
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete Group
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete Group?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to delete "{group.groupName}"? This will permanently delete the group and all its posts. This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => deleteGroupMutation.mutate()}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                      Delete Group
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </>
          )}
          {!isAdmin && isMember && (
            /* Leave Group - Regular members only */
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline">
                  <LogOut className="h-4 w-4 mr-2" />
                  Leave Group
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Leave Group?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to leave "{group.groupName}"? You will need to be re-added by an admin to rejoin.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => leaveGroupMutation.mutate()}
                  >
                    Leave Group
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>
      </div>

      {/* Group Info */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16">
                <AvatarFallback className="bg-gradient-to-br from-primary to-accent text-primary-foreground text-xl font-bold">
                  {group.groupName?.substring(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <CardTitle className="text-2xl">{group.groupName}</CardTitle>
                <p className="text-sm text-muted-foreground mt-1">{group.description}</p>
                <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
                  <Shield className="h-4 w-4" />
                  <span>Created by {group.creatorName}</span>
                </div>
              </div>
            </div>
            <div className="flex flex-col items-end gap-2">
              <Badge variant="secondary" className="text-sm">
                <Users className="h-3 w-3 mr-1" />
                {group.memberCount} {group.memberCount === 1 ? 'member' : 'members'}
              </Badge>
              {isAdmin && (
                <Badge variant="default" className="text-sm bg-warning">
                  <Crown className="h-3 w-3 mr-1" />
                  Admin
                </Badge>
              )}
            </div>
          </div>
        </CardHeader>
      </Card>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main Content - Posts/Instructions */}
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Instructions & Announcements
              </CardTitle>
            </CardHeader>
            <CardContent>
              {posts.length > 0 ? (
                <div className="space-y-4">
                  {posts.map((post: any) => (
                    <Card key={post.postid} className="border-l-4 border-l-primary">
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h3 className="font-semibold text-lg">{post.title}</h3>
                            <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                              <Avatar className="h-5 w-5">
                                <AvatarImage src={post.authorPhoto} />
                                <AvatarFallback className="text-xs">
                                  {post.authorName?.substring(0, 2).toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                              <span>{post.authorName}</span>
                              <span>•</span>
                              <span>{format(new Date(post.createdAt), 'MMM d, yyyy')}</span>
                            </div>
                          </div>
                          {isAdmin && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeletePost(post.postId || post.postid)}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          )}
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm whitespace-pre-wrap">{post.content}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <MessageSquare className="h-12 w-12 mx-auto mb-2 opacity-20" />
                  <p>No instructions posted yet</p>
                  {isAdmin && (
                    <Button 
                      variant="link" 
                      onClick={() => setCreatePostDialogOpen(true)}
                      className="mt-2"
                    >
                      Post your first instruction
                    </Button>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar - Members */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Members ({members.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 max-h-[500px] overflow-y-auto">
                {members.map((member: any) => (
                  <div key={member.userId} className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                      <Avatar className="h-8 w-8 shrink-0">
                        <AvatarImage src={member.profilePhoto} />
                        <AvatarFallback className="text-xs">
                          {member.name?.substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium truncate">{member.name}</p>
                        <p className="text-xs text-muted-foreground truncate">{member.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {member.role === 'admin' && (
                        <Crown className="h-4 w-4 text-warning" title="Admin" />
                      )}
                      {isAdmin && member.role !== 'admin' && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveMember(member.userId, member.name)}
                        >
                          <Trash2 className="h-3 w-3 text-destructive" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Add Member Dialog */}
      <Dialog open={addMemberDialogOpen} onOpenChange={setAddMemberDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Members</DialogTitle>
            <DialogDescription>
              Search for users by name or email to add them to the group
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search users..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>

            {searchQuery.length >= 2 && (
              <div className="max-h-[300px] overflow-y-auto space-y-2">
                {searchResults.length > 0 ? (
                  searchResults.map((user: any) => (
                    <div key={user.userId} className="flex items-center justify-between gap-2 p-2 rounded-lg border">
                      <div className="flex items-center gap-2 min-w-0 flex-1">
                        <Avatar className="h-8 w-8 shrink-0">
                          <AvatarImage src={user.profilePhoto} />
                          <AvatarFallback className="text-xs">
                            {user.name?.substring(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium truncate">{user.name}</p>
                          <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        onClick={() => handleAddMember(user.userId)}
                        disabled={addMemberMutation.isPending}
                      >
                        <UserPlus className="h-3 w-3 mr-1" />
                        Add
                      </Button>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No users found
                  </p>
                )}
              </div>
            )}

            {searchQuery.length < 2 && (
              <p className="text-sm text-muted-foreground text-center py-4">
                Type at least 2 characters to search
              </p>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Create Post Dialog */}
      <Dialog open={createPostDialogOpen} onOpenChange={setCreatePostDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Post Instruction</DialogTitle>
            <DialogDescription>
              Share instructions or announcements with group members
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreatePost} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                value={postFormData.title}
                onChange={(e) => setPostFormData({ ...postFormData, title: e.target.value })}
                placeholder="e.g., Meeting Schedule"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="content">Content *</Label>
              <Textarea
                id="content"
                value={postFormData.content}
                onChange={(e) => setPostFormData({ ...postFormData, content: e.target.value })}
                placeholder="Write your instructions or announcement here..."
                rows={6}
                required
              />
            </div>

            <DialogFooter>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setCreatePostDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={createPostMutation.isPending}>
                {createPostMutation.isPending ? 'Posting...' : 'Post Instruction'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
