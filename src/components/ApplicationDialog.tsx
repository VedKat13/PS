import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { toast } from "sonner";

interface ApplicationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  eventId: number;
  eventTitle: string;
  userId: number;
}

const ApplicationDialog = ({ open, onOpenChange, eventId, eventTitle, userId }: ApplicationDialogProps) => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    branch: "",
    year: "",
    skills: "",
    experience: "",
    motivation: "",
  });

  const queryClient = useQueryClient();

  const submitMutation = useMutation({
    mutationFn: () => api.applications.create({
      userid: userId,
      postid: eventId,
      status: 'pending',
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      branch: formData.branch,
      year: formData.year,
      skills: formData.skills,
      experience: formData.experience,
      motivation: formData.motivation
    }),
    onSuccess: async () => {
      console.log('Application submitted successfully, refreshing data...');
      // Invalidate and refetch queries to immediately update UI
      await queryClient.invalidateQueries({ queryKey: ['applications', userId] });
      await queryClient.invalidateQueries({ queryKey: ['events'] });
      // Force immediate refetch
      await queryClient.refetchQueries({ queryKey: ['applications', userId] });
      await queryClient.refetchQueries({ queryKey: ['events'] });
      console.log('Data refreshed, hasApplied should now be true');
      
      toast.success('Application submitted successfully! You cannot apply again to this event.');
      onOpenChange(false);
      // Reset form
      setFormData({
        name: "",
        email: "",
        phone: "",
        branch: "",
        year: "",
        skills: "",
        experience: "",
        motivation: "",
      });
    },
    onError: (error: any) => {
      console.error('Application submission error:', error);
      const errorMessage = error?.response?.data?.error || error?.response?.data?.message || 'Failed to submit application';
      
      if (errorMessage.includes('already applied') || errorMessage.includes('Duplicate')) {
        toast.error('You have already applied to this event!');
      } else {
        toast.error(errorMessage);
      }
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields
    if (!formData.name || !formData.email || !formData.phone || !formData.branch || !formData.motivation) {
      toast.error('Please fill in all required fields');
      return;
    }

    console.log('Submitting application:', { userId, eventId, formData });
    submitMutation.mutate();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Apply for {eventTitle}</DialogTitle>
          <DialogDescription>
            Fill in your details to apply for this event. All fields marked with * are required.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="John Doe"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="john@example.com"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number *</Label>
              <Input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+1 234 567 8900"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="branch">Branch/Department *</Label>
              <Input
                id="branch"
                value={formData.branch}
                onChange={(e) => setFormData({ ...formData, branch: e.target.value })}
                placeholder="Computer Science"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="year">Academic Year</Label>
              <Input
                id="year"
                value={formData.year}
                onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                placeholder="3rd Year"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="skills">Relevant Skills</Label>
              <Input
                id="skills"
                value={formData.skills}
                onChange={(e) => setFormData({ ...formData, skills: e.target.value })}
                placeholder="React, Node.js, Python"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="experience">Previous Experience (Optional)</Label>
            <Textarea
              id="experience"
              value={formData.experience}
              onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
              placeholder="Describe your relevant experience..."
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="motivation">Why do you want to participate? *</Label>
            <Textarea
              id="motivation"
              value={formData.motivation}
              onChange={(e) => setFormData({ ...formData, motivation: e.target.value })}
              placeholder="Tell us why you're interested in this event..."
              rows={4}
              required
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={submitMutation.isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={submitMutation.isPending}>
              {submitMutation.isPending ? "Submitting..." : "Submit Application"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ApplicationDialog;
