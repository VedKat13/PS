import EventCard from "@/components/EventCard";
import TrendingWidget from "@/components/TrendingWidget";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

const Home = () => {
  const events = [
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

  return (
    <div className="space-y-6">
      {/* Hero Section */}
      <div className="rounded-xl bg-gradient-to-r from-primary to-accent p-8 text-primary-foreground shadow-lg">
        <h1 className="text-3xl font-bold mb-2">Welcome to PeerSync</h1>
        <p className="text-primary-foreground/90 mb-4">
          Connect, collaborate, and grow with peers in your academic journey
        </p>
        <Button variant="secondary" size="lg">
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
          
          <div className="grid sm:grid-cols-2 gap-4">
            {events.map((event, index) => (
              <EventCard key={index} {...event} />
            ))}
          </div>
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
