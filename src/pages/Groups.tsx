import GroupCard from "@/components/GroupCard";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus } from "lucide-react";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

const Groups = () => {
  const { currentUser } = useAuth();
  const queryClient = useQueryClient();
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    groupName: "",
    description: ""
  });

  // Fetch current user data
  const { data: userData } = useQuery({
    queryKey: ['user', currentUser?.email],
    queryFn: () => api.users.getByEmail(currentUser?.email || ''),
    enabled: !!currentUser?.email,
  });

  const userId = userData?.userid || userData?.userId || userData?.id;

  // Fetch user's groups
  const { data: myGroups = [], isLoading: myGroupsLoading, error: myGroupsError } = useQuery({
    queryKey: ['groups', 'user', userId],
    queryFn: () => api.groups.getUserGroups(userId?.toString()),
    enabled: !!userId,
  });

  // Fetch all groups for suggestions
  const { data: allGroups = [], error: allGroupsError } = useQuery({
    queryKey: ['groups', 'all'],
    queryFn: () => api.groups.getAll(),
  });

  console.log('User ID:', userId);
  console.log('My Groups:', myGroups);
  console.log('All Groups:', allGroups);
  console.log('My Groups Error:', myGroupsError);
  console.log('All Groups Error:', allGroupsError);

  // Filter suggested groups (not a member of)
  const myGroupIds = myGroups.map((g: any) => g.groupId || g.groupid);
  const suggestedGroups = allGroups.filter((g: any) => !myGroupIds.includes(g.groupId || g.groupid));

  // Create group mutation
  const createMutation = useMutation({
    mutationFn: (data: any) => api.groups.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['groups'] });
      toast.success('Group created successfully!');
      setCreateDialogOpen(false);
      setFormData({ groupName: "", description: "" });
    },
    onError: (error: any) => {
      console.error('Create group error:', error);
      toast.error('Failed to create group');
    }
  });

  const handleCreateGroup = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.groupName.trim()) {
      toast.error('Group name is required');
      return;
    }

    if (!userId) {
      toast.error('User not found');
      return;
    }

    createMutation.mutate({
      groupName: formData.groupName,
      description: formData.description,
      creatorId: userId
    });
  };

  if (myGroupsLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg">Loading groups...</div>
      </div>
    );
  }

  if (myGroupsError || allGroupsError) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <p className="text-lg text-red-500 mb-4">Error loading groups</p>
        <p className="text-sm text-muted-foreground mb-4">
          {myGroupsError?.toString() || allGroupsError?.toString()}
        </p>
        <Button onClick={() => window.location.reload()}>
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Groups</h1>
        <Button onClick={() => setCreateDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Create Group
        </Button>
      </div>

      {/* My Groups */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">My Groups ({myGroups.length})</h2>
        {myGroups.length > 0 ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {myGroups.map((group: any) => (
              <GroupCard 
                key={group.groupId || group.groupid} 
                id={group.groupId || group.groupid}
                name={group.groupName}
                description={group.description}
                members={group.memberCount || 0}
                isAdmin={group.userRole === 'admin'}
                isMember={true}
                creatorName={group.creatorName}
                userId={userId}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-muted rounded-lg">
            <p className="text-muted-foreground">You haven't joined any groups yet</p>
            <Button 
              variant="link" 
              onClick={() => setCreateDialogOpen(true)}
              className="mt-2"
            >
              Create your first group
            </Button>
          </div>
        )}
      </div>

      {/* Create Group Dialog */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Group</DialogTitle>
            <DialogDescription>
              Create a group to share instructions and collaborate with others
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreateGroup} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="groupName">Group Name *</Label>
              <Input
                id="groupName"
                value={formData.groupName}
                onChange={(e) => setFormData({ ...formData, groupName: e.target.value })}
                placeholder="e.g., Web Development Team"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="What is this group about?"
                rows={4}
              />
            </div>

            <DialogFooter>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setCreateDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={createMutation.isPending}>
                {createMutation.isPending ? 'Creating...' : 'Create Group'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Groups;
