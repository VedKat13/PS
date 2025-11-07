import EventCard from "@/components/EventCard";
import TrendingWidget from "@/components/TrendingWidget";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

const Home = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  
  console.log('Current user in Home:', currentUser);
  console.log('Current user email:', currentUser?.email);
  
  // Fetch current user's data from MySQL
  const { data: userData, isLoading: userLoading, error: userError } = useQuery({
    queryKey: ['user', currentUser?.email],
    queryFn: async () => {
      if (!currentUser?.email) {
        console.log('No email, returning null');
        return null;
      }
      console.log('Fetching user by email:', currentUser.email);
      try {
        const result = await api.users.getByEmail(currentUser.email);
        console.log('User fetch result:', result);
        console.log('User keys:', Object.keys(result));
        console.log('userid field:', result.userid);
        console.log('userId field:', result.userId);
        console.log('id field:', result.id);
        return result;
      } catch (err) {
        console.error('User fetch error:', err);
        throw err;
      }
    },
    enabled: !!currentUser?.email,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
  
  console.log('User data in Home:', userData, 'Loading:', userLoading, 'Error:', userError);
  console.log('userData?.userid value:', userData?.userid);
  console.log('Passing userId to EventCard:', userData?.userid);
  
  // TEMPORARY: If userData exists but userid is missing, use a fallback
  const userIdToPass = userData?.userid || userData?.userId || userData?.id || 6;
  console.log('Final userId being passed:', userIdToPass);

  // Fetch events from API - always fetch, not dependent on userData
  const { data: events = [], isLoading } = useQuery({
    queryKey: ['events'],
    queryFn: api.events.getAll,
  });

  console.log('Events from API:', events, 'Length:', events.length, 'IsLoading:', isLoading);

  // Fetch user's applications to check which events they've applied to
  const { data: userApplications = [] } = useQuery({
    queryKey: ['applications', userData?.userid],
    queryFn: () => api.applications.getByUser(userData?.userid?.toString()),
    enabled: !!userData?.userid,
  });

  // Get event IDs user has already applied to
  const appliedEventIds = userApplications.map((app: any) => app.postid);

  console.log('Home - User applications:', userApplications);
  console.log('Home - Applied event IDs:', appliedEventIds);

  // Fallback sample events if database is empty
  const sampleEvents = [
    {
      title: "Annual Tech Symposium 2024",
      description: "Join us for the biggest tech event of the year featuring industry leaders and cutting-edge innovations",
      date: "March 15, 2024",
      time: "10:00 AM",
      location: "Main Auditorium, Building A",
      participants: 245,
      type: "event" as const,
      skills: ["Networking", "Technology", "Innovation"],
      expiresIn: "5 days",
      status: "open" as const
    },
    {
      title: "48-Hour Code Sprint Hackathon",
      description: "Build innovative solutions to real-world problems. Amazing prizes and mentorship opportunities await!",
      date: "March 22, 2024",
      time: "9:00 AM",
      location: "Computer Lab Complex",
      participants: 189,
      type: "hackathon" as const,
      skills: ["JavaScript", "Python", "React", "Node.js"],
      expiresIn: "12 days",
      status: "open" as const
    },
    {
      title: "Sustainable Campus Initiative",
      description: "Join our team to develop eco-friendly solutions for campus sustainability challenges",
      date: "Ongoing",
      time: "Flexible",
      location: "Environmental Science Building",
      participants: 34,
      type: "project" as const,
      skills: ["Research", "Data Analysis", "Environmental Science"],
      expiresIn: "2 days",
      status: "closing" as const
    },
    {
      title: "AI & Machine Learning Workshop Series",
      description: "Learn the fundamentals of AI and ML through hands-on projects and expert guidance",
      date: "March 18, 2024",
      time: "2:00 PM",
      location: "Online & Hybrid",
      participants: 312,
      type: "event" as const,
      skills: ["Python", "TensorFlow", "Data Science"],
      expiresIn: "8 days",
      status: "open" as const
    }
  ];

  // Use database events if available, otherwise use sample events
  const displayEvents = events.length > 0 
    ? events.map((event: any, index: number) => {
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
      })
    : sampleEvents;

  return (
    <div className="space-y-6">
      {/* Hero Section */}
      <div className="rounded-xl bg-gradient-to-r from-primary to-accent p-8 text-primary-foreground shadow-lg">
        <h1 className="text-3xl font-bold mb-2">
          Welcome back, {userData?.name || currentUser?.displayName || 'User'}!
        </h1>
        <p className="text-primary-foreground/90 mb-4">
          Connect, collaborate, and grow with peers in your academic journey
        </p>
        <Button variant="secondary" size="lg" onClick={() => navigate('/events/create')}>
          <Plus className="h-4 w-4 mr-2" />
          Create Event
        </Button>
      </div>

      {/* Main Content Grid */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Feed */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">Latest Events & Opportunities</h2>
          </div>
          
          {isLoading ? (
            <div className="text-center py-8">Loading events...</div>
          ) : (
            <div className="grid sm:grid-cols-2 gap-4">
              {displayEvents.map((event: any, index: number) => {
                return (
                  <EventCard 
                    key={event.id || index} 
                    {...event}
                    userId={userIdToPass}
                  />
                );
              })}
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <TrendingWidget />
        </div>
      </div>
    </div>
  );
};

export default Home;
