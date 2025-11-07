import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Moon, User, Plus, X } from "lucide-react";
import { useTheme } from "next-themes";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useState, useEffect } from "react";
import { toast } from "sonner";

const Settings = () => {
  const { theme, setTheme } = useTheme();
  const { currentUser, logout } = useAuth();
  const queryClient = useQueryClient();
  
  // Fetch user data from MySQL
  const { data: userData, isLoading } = useQuery({
    queryKey: ['user', currentUser?.email],
    queryFn: () => api.users.getByEmail(currentUser?.email || ''),
    enabled: !!currentUser?.email,
  });
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    branch: '',
    bio: '',
    location: '',
    specialization: '',
    academicYear: '',
    profilePhoto: '',
    projects: '',
  });

  // Achievements state as array of objects
  const [achievements, setAchievements] = useState<Array<{title: string, description: string}>>([]);
  
  // Update form when userData loads
  useEffect(() => {
    if (userData) {
      setFormData({
        name: userData.name || '',
        branch: userData.branch || '',
        bio: userData.bio || '',
        location: userData.location || '',
        specialization: userData.specialization || '',
        academicYear: userData.academicYear?.toString() || '',
        profilePhoto: userData.profilePhoto || '',
        projects: userData.projects || '',
      });
      
      // Parse achievements if exists
      if (userData.achievements) {
        try {
          const parsedAchievements = typeof userData.achievements === 'string' 
            ? JSON.parse(userData.achievements) 
            : userData.achievements;
          setAchievements(Array.isArray(parsedAchievements) ? parsedAchievements : []);
        } catch (error) {
          setAchievements([]);
        }
      } else {
        setAchievements([]);
      }
    }
  }, [userData]);
  
  // Mutation to update user
  const updateMutation = useMutation({
    mutationFn: (data: any) => {
      const userId = userData?.userid || userData?.userId;
      if (!userId) {
        throw new Error('User ID not found');
      }
      return api.users.update(userId.toString(), data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user', currentUser?.email] });
      toast.success('Profile updated successfully!');
    },
    onError: (error: any) => {
      toast.error('Failed to update profile');
      console.error('Update error:', error);
    },
  });

  // Mutation to delete user account - DISABLED
  // const deleteAccountMutation = useMutation({
  //   mutationFn: () => {
  //     const userId = userData?.userid || userData?.userId;
  //     if (!userId) {
  //       throw new Error('User ID not found');
  //     }
  //     return api.users.delete(userId.toString());
  //   },
  //   onSuccess: async () => {
  //     toast.success('Account deleted successfully');
  //     // Clear all cached queries
  //     queryClient.clear();
  //     // Log out and redirect to login
  //     await logout();
  //     navigate('/login');
  //   },
  //   onError: (error: any) => {
  //     toast.error('Failed to delete account');
  //     console.error('Delete error:', error);
  //   },
  // });
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Send achievements as array (or null if empty)
    const achievementsData = achievements.length > 0 ? achievements : null;
    
    const updateData = {
      ...formData,
      achievements: achievementsData,
      email: userData.email,
      password: userData.password,
    };
    
    console.log('Submitting update with data:', updateData);
    updateMutation.mutate(updateData);
  };
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // Achievement management functions
  const addAchievement = () => {
    setAchievements([...achievements, { title: '', description: '' }]);
  };

  const removeAchievement = (index: number) => {
    setAchievements(achievements.filter((_, i) => i !== index));
  };

  const updateAchievement = (index: number, field: 'title' | 'description', value: string) => {
    const updated = [...achievements];
    updated[index][field] = value;
    setAchievements(updated);
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold">Settings</h1>

      {/* Profile Settings */}
      <Card className="animate-fade-in">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5 text-primary" />
            Profile Information
          </CardTitle>
          <CardDescription>
            Update your profile information stored in the database
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-4">Loading profile...</div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Your full name"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="profilePhoto">Profile Photo URL</Label>
                <Input
                  id="profilePhoto"
                  name="profilePhoto"
                  value={formData.profilePhoto}
                  onChange={handleChange}
                  placeholder="https://example.com/photo.jpg"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="branch">Branch/Department</Label>
                <Input
                  id="branch"
                  name="branch"
                  value={formData.branch}
                  onChange={handleChange}
                  placeholder="e.g., Computer Science, Mechanical Engineering"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="academicYear">Academic Year</Label>
                <Input
                  id="academicYear"
                  name="academicYear"
                  type="number"
                  value={formData.academicYear}
                  onChange={handleChange}
                  placeholder="e.g., 1, 2, 3, 4"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="specialization">Specialization</Label>
                <Input
                  id="specialization"
                  name="specialization"
                  value={formData.specialization}
                  onChange={handleChange}
                  placeholder="e.g., Machine Learning, Web Development"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  placeholder="e.g., San Francisco, CA"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="bio">Bio</Label>
                <Textarea
                  id="bio"
                  name="bio"
                  value={formData.bio}
                  onChange={handleChange}
                  placeholder="Tell us about yourself..."
                  rows={4}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="projects">Projects</Label>
                <Textarea
                  id="projects"
                  name="projects"
                  value={formData.projects}
                  onChange={handleChange}
                  placeholder="Describe your projects..."
                  rows={3}
                />
              </div>

              {/* Achievements Section */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label>Achievements</Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addAchievement}
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Add Achievement
                  </Button>
                </div>
                
                {achievements.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    No achievements added yet. Click "Add Achievement" to start.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {achievements.map((achievement, index) => (
                      <div key={index} className="border rounded-lg p-4 space-y-3 bg-muted/30">
                        <div className="flex items-start justify-between gap-2">
                          <span className="text-sm font-medium">Achievement #{index + 1}</span>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeAchievement(index)}
                            className="h-6 w-6 p-0"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                        <div className="space-y-2">
                          <Input
                            placeholder="Achievement title (e.g., Hackathon Winner)"
                            value={achievement.title}
                            onChange={(e) => updateAchievement(index, 'title', e.target.value)}
                          />
                          <Textarea
                            placeholder="Description (e.g., Won first place in College Hackathon 2025)"
                            value={achievement.description}
                            onChange={(e) => updateAchievement(index, 'description', e.target.value)}
                            rows={2}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              
              <Button 
                type="submit" 
                disabled={updateMutation.isPending}
                className="w-full"
              >
                {updateMutation.isPending ? 'Saving...' : 'Save Changes'}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>

      {/* Appearance */}
      <Card className="animate-fade-in">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Moon className="h-5 w-5 text-primary" />
            Appearance
          </CardTitle>
          <CardDescription>
            Customize how PeerSync looks to you
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="dark-mode">Dark Mode</Label>
              <p className="text-sm text-muted-foreground">
                Use dark theme across the app
              </p>
            </div>
            <Switch 
              id="dark-mode" 
              checked={theme === "dark"}
              onCheckedChange={(checked) => setTheme(checked ? "dark" : "light")}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Settings;
