import EventCard from "@/components/EventCard";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Calendar } from "lucide-react";

const Events = () => {
  const upcomingEvents = [
    {
      title: "Annual Tech Symposium 2024",
      description: "Join us for the biggest tech event of the year featuring industry leaders",
      date: "March 15, 2024",
      time: "10:00 AM",
      location: "Main Auditorium, Building A",
      participants: 245,
      type: "event" as const,
      skills: ["Networking", "Technology"],
      expiresIn: "5 days",
      status: "open" as const
    },
    {
      title: "48-Hour Code Sprint",
      description: "Build innovative solutions. Amazing prizes await!",
      date: "March 22, 2024",
      time: "9:00 AM",
      location: "Computer Lab Complex",
      participants: 189,
      type: "hackathon" as const,
      skills: ["JavaScript", "Python", "React"],
      expiresIn: "12 days",
      status: "open" as const
    }
  ];

  const myEvents = [
    {
      title: "AI Workshop Series",
      description: "Learn AI fundamentals through hands-on projects",
      date: "March 18, 2024",
      time: "2:00 PM",
      location: "Online & Hybrid",
      participants: 312,
      type: "event" as const,
      skills: ["Python", "TensorFlow"],
      expiresIn: "8 days",
      status: "open" as const
    }
  ];

  const projects = [
    {
      title: "Sustainable Campus Initiative",
      description: "Develop eco-friendly solutions for campus sustainability",
      date: "Ongoing",
      time: "Flexible",
      location: "Environmental Science Building",
      participants: 34,
      type: "project" as const,
      skills: ["Research", "Data Analysis"],
      expiresIn: "2 days",
      status: "closing" as const
    }
  ];

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Events & Projects</h1>
        <div className="flex gap-2">
          <Button variant="outline">
            <Calendar className="h-4 w-4 mr-2" />
            Calendar View
          </Button>
          <Button>
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
            {[...upcomingEvents, ...projects].map((event, index) => (
              <EventCard key={index} {...event} />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="my" className="space-y-4">
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {myEvents.map((event, index) => (
              <EventCard key={index} {...event} />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="hackathons" className="space-y-4">
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {upcomingEvents
              .filter(e => e.type === "hackathon")
              .map((event, index) => (
                <EventCard key={index} {...event} />
              ))}
          </div>
        </TabsContent>

        <TabsContent value="projects" className="space-y-4">
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {projects.map((event, index) => (
              <EventCard key={index} {...event} />
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Events;
