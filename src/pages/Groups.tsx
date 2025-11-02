import GroupCard from "@/components/GroupCard";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

const Groups = () => {
  const myGroups = [
    {
      name: "Web Development Club",
      description: "Learn and build modern web applications together",
      members: 234,
      privacy: "public" as const,
      isAdmin: true,
      isMember: true,
      category: "Technology"
    },
    {
      name: "AI Research Team",
      description: "Exploring cutting-edge AI and machine learning topics",
      members: 89,
      privacy: "private" as const,
      isAdmin: false,
      isMember: true,
      category: "Research"
    }
  ];

  const suggestedGroups = [
    {
      name: "Competitive Programming",
      description: "Practice coding challenges and prepare for competitions",
      members: 456,
      privacy: "public" as const,
      isMember: false,
      category: "Programming"
    },
    {
      name: "Robotics & IoT",
      description: "Build innovative hardware and IoT solutions",
      members: 178,
      privacy: "public" as const,
      isMember: false,
      category: "Engineering"
    }
  ];

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Groups</h1>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Create Group
        </Button>
      </div>

      {/* My Groups */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">My Groups</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {myGroups.map((group, index) => (
            <GroupCard key={index} {...group} />
          ))}
        </div>
      </div>

      {/* Suggested Groups */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Suggested Groups</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {suggestedGroups.map((group, index) => (
            <GroupCard key={index} {...group} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Groups;
