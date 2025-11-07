import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar, Clock, MapPin, Tag, Zap, Code, Briefcase } from "lucide-react";
import { api } from "@/lib/api";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";

const CreateEvent = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { currentUser } = useAuth();
  
  // Fetch current user data to get userId
  const { data: userData } = useQuery({
    queryKey: ['user', currentUser?.email],
    queryFn: () => api.users.getByEmail(currentUser?.email || ''),
    enabled: !!currentUser?.email,
  });

  const userIdToUse = userData?.userId || userData?.userid;
  
  const [formData, setFormData] = useState({
    eventType: "event",
    title: "",
    description: "",
    requiredSkills: "",
    expirationTime: "",
    eventDate: "",
    eventStartTime: "",
    eventEndTime: "",
    location: "",
    venue: "",
    maxParticipants: "",
    prizes: "",
    organizerEmail: "",
    organizerPhone: "",
    imageUrl: "",
  });

  const createEventMutation = useMutation({
    mutationFn: (data: any) => api.events.create(data),
    onSuccess: () => {
      toast.success("Event created successfully!");
      queryClient.invalidateQueries({ queryKey: ['events'] });
      navigate('/');
    },
    onError: (error: any) => {
      toast.error(error?.message || "Failed to create event");
    }
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!formData.title || !formData.description || !formData.expirationTime) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (!userIdToUse) {
      toast.error("User not authenticated. Please log in again.");
      return;
    }

    // Create event with the logged-in user's ID and all new fields
    createEventMutation.mutate({
      userid: userIdToUse,
      eventType: formData.eventType,
      Title: formData.title,
      description: formData.description,
      requiredSkills: formData.requiredSkills,
      expirationTime: formData.expirationTime,
      eventDate: formData.eventDate || null,
      eventStartTime: formData.eventStartTime || null,
      eventEndTime: formData.eventEndTime || null,
      location: formData.location || null,
      venue: formData.venue || null,
      maxParticipants: formData.maxParticipants ? parseInt(formData.maxParticipants) : null,
      prizes: formData.prizes || null,
      organizerEmail: formData.organizerEmail || null,
      organizerPhone: formData.organizerPhone || null,
      imageUrl: formData.imageUrl || null,
    });
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Create New Event</h1>
        <p className="text-muted-foreground mt-2">
          Share your event or opportunity with the community
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Event Details</CardTitle>
          <CardDescription>
            Fill in the information about your event, hackathon, or project opportunity
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Event Type Selector */}
            <div className="space-y-2">
              <Label htmlFor="eventType">
                Event Type <span className="text-red-500">*</span>
              </Label>
              <Select 
                value={formData.eventType} 
                onValueChange={(value) => setFormData({...formData, eventType: value})}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select event type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="event">
                    <div className="flex items-center gap-2">
                      <Zap className="h-4 w-4" />
                      <span>Event</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="hackathon">
                    <div className="flex items-center gap-2">
                      <Code className="h-4 w-4" />
                      <span>Hackathon</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="project">
                    <div className="flex items-center gap-2">
                      <Briefcase className="h-4 w-4" />
                      <span>Project</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
              <p className="text-sm text-muted-foreground">
                {formData.eventType === 'event' && 'General events, workshops, seminars, conferences'}
                {formData.eventType === 'hackathon' && 'Coding competitions, hackathons, code sprints'}
                {formData.eventType === 'project' && 'Long-term projects, collaborations, research opportunities'}
              </p>
            </div>

            {/* Title */}
            <div className="space-y-2">
              <Label htmlFor="title">
                {formData.eventType === 'hackathon' ? 'Hackathon Name' : 
                 formData.eventType === 'project' ? 'Project Title' : 'Event Title'} <span className="text-red-500">*</span>
              </Label>
              <Input
                id="title"
                name="title"
                placeholder={
                  formData.eventType === 'hackathon' ? 'e.g., Code Sprint 2025' :
                  formData.eventType === 'project' ? 'e.g., AI Research Initiative' :
                  'e.g., Tech Symposium 2025'
                }
                value={formData.title}
                onChange={handleChange}
                required
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">
                Description <span className="text-red-500">*</span>
              </Label>
              <Textarea
                id="description"
                name="description"
                placeholder={
                  formData.eventType === 'hackathon' 
                    ? 'Describe the hackathon theme, challenges, judging criteria...' :
                  formData.eventType === 'project'
                    ? 'Describe the project goals, scope, team requirements...' :
                    'Describe your event, what participants will do, and what they can expect...'
                }
                value={formData.description}
                onChange={handleChange}
                rows={5}
                required
              />
            </div>

            {/* Required Skills */}
            <div className="space-y-2">
              <Label htmlFor="requiredSkills">
                <Tag className="h-4 w-4 inline mr-2" />
                Required Skills (comma-separated)
              </Label>
              <Input
                id="requiredSkills"
                name="requiredSkills"
                placeholder="e.g., JavaScript, React, Node.js"
                value={formData.requiredSkills}
                onChange={handleChange}
              />
              <p className="text-sm text-muted-foreground">
                Separate multiple skills with commas
              </p>
            </div>

            {/* Expiration Date/Time */}
            <div className="space-y-2">
              <Label htmlFor="expirationTime">
                <Clock className="h-4 w-4 inline mr-2" />
                Registration Deadline <span className="text-red-500">*</span>
              </Label>
              <Input
                id="expirationTime"
                name="expirationTime"
                type="datetime-local"
                value={formData.expirationTime}
                onChange={handleChange}
                required
              />
              <p className="text-sm text-muted-foreground">
                Last date/time for accepting applications
              </p>
            </div>

            {/* Event Date */}
            <div className="space-y-2">
              <Label htmlFor="eventDate">
                <Calendar className="h-4 w-4 inline mr-2" />
                Event Date
              </Label>
              <Input
                id="eventDate"
                name="eventDate"
                type="datetime-local"
                value={formData.eventDate}
                onChange={handleChange}
              />
              <p className="text-sm text-muted-foreground">
                When will the event actually take place?
              </p>
            </div>

            {/* Event Times */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="eventStartTime">Start Time</Label>
                <Input
                  id="eventStartTime"
                  name="eventStartTime"
                  type="time"
                  value={formData.eventStartTime}
                  onChange={handleChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="eventEndTime">End Time</Label>
                <Input
                  id="eventEndTime"
                  name="eventEndTime"
                  type="time"
                  value={formData.eventEndTime}
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* Location */}
            <div className="space-y-2">
              <Label htmlFor="location">
                <MapPin className="h-4 w-4 inline mr-2" />
                Location
              </Label>
              <Input
                id="location"
                name="location"
                placeholder="e.g., Online, Seminar Hall, or City Name"
                value={formData.location}
                onChange={handleChange}
              />
            </div>

            {/* Venue Details */}
            <div className="space-y-2">
              <Label htmlFor="venue">Venue Details</Label>
              <Textarea
                id="venue"
                name="venue"
                placeholder="Building name, room number, address, or meeting link..."
                value={formData.venue}
                onChange={handleChange}
                rows={2}
              />
            </div>

            {/* Max Participants */}
            <div className="space-y-2">
              <Label htmlFor="maxParticipants">Maximum Participants</Label>
              <Input
                id="maxParticipants"
                name="maxParticipants"
                type="number"
                min="1"
                placeholder="e.g., 100"
                value={formData.maxParticipants}
                onChange={handleChange}
              />
              <p className="text-sm text-muted-foreground">
                Leave blank for unlimited
              </p>
            </div>

            {/* Prizes - Show for events and hackathons */}
            {(formData.eventType === 'event' || formData.eventType === 'hackathon') && (
              <div className="space-y-2">
                <Label htmlFor="prizes">
                  {formData.eventType === 'hackathon' ? 'Prizes & Awards' : 'Prizes & Incentives'}
                  {formData.eventType === 'hackathon' && <span className="text-red-500"> *</span>}
                </Label>
                <Textarea
                  id="prizes"
                  name="prizes"
                  placeholder={
                    formData.eventType === 'hackathon'
                      ? "e.g., 1st Place: $5000, 2nd Place: $3000, 3rd Place: $1000, Special Category Prizes"
                      : "e.g., Prizes, certificates, swag, networking opportunities"
                  }
                  value={formData.prizes}
                  onChange={handleChange}
                  rows={3}
                  required={formData.eventType === 'hackathon'}
                />
              </div>
            )}

            {/* Organizer Contact */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="organizerEmail">Organizer Email</Label>
                <Input
                  id="organizerEmail"
                  name="organizerEmail"
                  type="email"
                  placeholder="contact@example.com"
                  value={formData.organizerEmail}
                  onChange={handleChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="organizerPhone">Organizer Phone</Label>
                <Input
                  id="organizerPhone"
                  name="organizerPhone"
                  type="tel"
                  placeholder="+1234567890"
                  value={formData.organizerPhone}
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* Event Image URL */}
            <div className="space-y-2">
              <Label htmlFor="imageUrl">Event Banner/Image URL</Label>
              <Input
                id="imageUrl"
                name="imageUrl"
                type="url"
                placeholder="https://example.com/event-banner.jpg"
                value={formData.imageUrl}
                onChange={handleChange}
              />
              <p className="text-sm text-muted-foreground">
                Link to your event poster or banner image
              </p>
            </div>

            {/* Buttons */}
            <div className="flex gap-4 pt-4">
              <Button 
                type="submit" 
                className="flex-1"
                disabled={createEventMutation.isPending}
              >
                {createEventMutation.isPending ? "Creating..." : "Create Event"}
              </Button>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => navigate('/')}
                disabled={createEventMutation.isPending}
              >
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default CreateEvent;
