import ProfileCard from "@/components/ProfileCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Award, BookOpen, Code } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const Profile = () => {
  const achievements = [
    { title: "Hackathon Winner 2023", icon: Award },
    { title: "Research Publication", icon: BookOpen },
    { title: "Open Source Contributor", icon: Code },
  ];

  const projects = [
    {
      title: "Smart Campus Navigation App",
      description: "Mobile app for campus navigation using AR",
      tech: ["React Native", "ARKit", "Firebase"]
    },
    {
      title: "Student Collaboration Platform",
      description: "Web platform for academic collaboration",
      tech: ["React", "Node.js", "MongoDB"]
    }
  ];

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <ProfileCard
        name="Alex Johnson"
        email="alex.johnson@university.edu"
        branch="Computer Science & Engineering"
        bio="Passionate about technology, innovation, and building solutions that matter. Always eager to collaborate on exciting projects!"
        location="San Francisco, CA"
        skills={["JavaScript", "React", "Node.js", "Python", "Machine Learning", "UI/UX Design"]}
        isOwnProfile={true}
        onEdit={() => console.log("Edit profile")}
      />

      {/* Achievements */}
      <Card className="animate-fade-in">
        <CardHeader>
          <CardTitle>Achievements</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid sm:grid-cols-3 gap-4">
            {achievements.map((achievement, index) => {
              const Icon = achievement.icon;
              return (
                <div
                  key={index}
                  className="flex flex-col items-center text-center p-4 rounded-lg border bg-card hover:bg-accent/5 transition-colors"
                >
                  <div className="h-12 w-12 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center mb-2">
                    <Icon className="h-6 w-6 text-primary-foreground" />
                  </div>
                  <p className="font-medium text-sm">{achievement.title}</p>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Projects */}
      <Card className="animate-fade-in">
        <CardHeader>
          <CardTitle>Projects</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {projects.map((project, index) => (
            <div
              key={index}
              className="p-4 rounded-lg border bg-card hover:bg-accent/5 transition-colors"
            >
              <h3 className="font-semibold mb-1">{project.title}</h3>
              <p className="text-sm text-muted-foreground mb-3">{project.description}</p>
              <div className="flex flex-wrap gap-1.5">
                {project.tech.map((tech, i) => (
                  <Badge key={i} variant="secondary" className="text-xs">
                    {tech}
                  </Badge>
                ))}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
};

export default Profile;
