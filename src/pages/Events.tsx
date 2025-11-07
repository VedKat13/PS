import EventCard from "@/components/EventCard";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Calendar } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";

const Events = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  console.log('Current user in Events:', currentUser);

  // Fetch current user data to get userID
  const { data: userData, isLoading: userLoading, error: userError } = useQuery({
    queryKey: ['user', currentUser?.email],
    queryFn: () => api.users.getByEmail(currentUser?.email || ''),
    enabled: !!currentUser?.email,
  });

  console.log('User data in Events:', userData, 'Loading:', userLoading, 'Error:', userError);

  // TEMPORARY: If userData exists but userid is missing, use a fallback
  const userIdToPass = userData?.userid || userData?.userId || userData?.id || 6;
  console.log('Final userId being passed in Events:', userIdToPass);

  // Fetch all events - always fetch
  const { data: allEvents = [], isLoading: eventsLoading, error: eventsError } = useQuery({
    queryKey: ['events'],
    queryFn: () => api.events.getAll(),
  });

  console.log('Events data:', allEvents, 'Is array?', Array.isArray(allEvents));
  console.log('User data in Events:', userData);

  // Fetch user's applications to check which events they've applied to
  const { data: userApplications = [] } = useQuery({
    queryKey: ['applications', userData?.userid],
    queryFn: () => api.applications.getByUser(userData?.userid?.toString()),
    enabled: !!userData?.userid,
  });

  // Get event IDs user has already applied to
  const appliedEventIds = Array.isArray(userApplications) 
    ? userApplications.map((app: any) => app.postid) 
    : [];

  console.log('User applications:', userApplications);
  console.log('Applied event IDs:', appliedEventIds);

  if (eventsLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg">Loading events...</div>
      </div>
    );
  }

  if (eventsError) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg text-red-500">Error loading events. Please check the backend.</div>
      </div>
    );
  }

  const upcomingEvents = Array.isArray(allEvents) ? allEvents.map((event: any, index: number) => {
    const eventDate = event.eventDate || event.eventdate;
    const formattedDate = eventDate ? new Date(eventDate).toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    }) : 'TBA';
    
    // Use postid if available, otherwise use index as fallback
    const eventId = event.postid || (index + 1);
    
    // Check if this event was created by the current user
    const isMyEvent = event.creatorId === userIdToPass || event.creatorid === userIdToPass;
    
    // Calculate expiration status and time remaining
    const expirationDate = event.expirationTime ? new Date(event.expirationTime) : null;
    const now = new Date();
    const isExpired = expirationDate ? expirationDate < now : false;
    
    let expiresIn = '';
    if (expirationDate && !isExpired) {
      const diffMs = expirationDate.getTime() - now.getTime();
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
      const diffHours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      
      if (diffDays > 0) {
        expiresIn = `Expires in ${diffDays} day${diffDays > 1 ? 's' : ''}`;
      } else if (diffHours > 0) {
        expiresIn = `Expires in ${diffHours} hour${diffHours > 1 ? 's' : ''}`;
      } else {
        expiresIn = 'Expires soon';
      }
    }
    
    // Parse skills from requiredSkills string
    const skillsArray = event.requiredSkills 
      ? event.requiredSkills.split(',').map((s: string) => s.trim())
      : [];
    
    return {
      id: eventId,
      title: event.title || event.Title,
      description: event.description,
      date: formattedDate,
      time: event.eventTime || event.eventtime || "TBA",
      location: event.location || "TBA",
      participants: event.currentParticipants || event.participants || 0,
      type: (event.eventType || "event") as "event" | "hackathon" | "project",
      eventType: event.eventType || "event",
      skills: skillsArray,
      status: isExpired ? "expired" as const : "open" as const,
      hasApplied: appliedEventIds.includes(eventId),
      isCreator: isMyEvent,
      expiresIn,
      creatorName: event.creatorName,
      createdAt: event.createdAt,
      expirationTime: event.expirationTime,
      requiredSkills: event.requiredSkills,
      eventDate: event.eventDate,
      eventStartTime: event.eventStartTime,
      eventEndTime: event.eventEndTime,
      venue: event.venue,
      maxParticipants: event.maxParticipants,
      currentParticipants: event.currentParticipants,
      prizes: event.prizes,
      organizerEmail: event.organizerEmail,
      organizerPhone: event.organizerPhone,
      imageUrl: event.imageUrl
    };
  }) : [];

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Events & Projects</h1>
        <div className="flex gap-2">
          <Button variant="outline">
            <Calendar className="h-4 w-4 mr-2" />
            Calendar View
          </Button>
          <Button onClick={() => navigate('/create-event')}>
            <Plus className="h-4 w-4 mr-2" />
            Create Event
          </Button>
        </div>
      </div>

      <Tabs defaultValue="all" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="all">All Events</TabsTrigger>
          <TabsTrigger value="my">My Events</TabsTrigger>
          <TabsTrigger value="hackathons">Hackathons</TabsTrigger>
          <TabsTrigger value="projects">Projects</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {upcomingEvents.map((event: any) => (
              <EventCard 
                key={event.id} 
                {...event}
                userId={userIdToPass}
              />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="my" className="space-y-4">
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {upcomingEvents
              .filter((e: any) => e.isCreator)
              .map((event: any) => (
                <EventCard 
                  key={event.id} 
                  {...event}
                  userId={userIdToPass}
                />
              ))}
          </div>
          {upcomingEvents.filter((e: any) => e.isCreator).length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium">No events created yet</p>
              <p className="text-sm mt-2">Click "Create Event" to get started!</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="hackathons" className="space-y-4">
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {upcomingEvents
              .filter((e: any) => e.type === "hackathon")
              .map((event: any) => (
                <EventCard 
                  key={event.id} 
                  {...event}
                  userId={userIdToPass}
                />
              ))}
          </div>
        </TabsContent>

        <TabsContent value="projects" className="space-y-4">
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {upcomingEvents
              .filter((e: any) => e.type === "project")
              .map((event: any) => (
                <EventCard 
                  key={event.id} 
                  {...event}
                  userId={userIdToPass}
                />
              ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Events;
