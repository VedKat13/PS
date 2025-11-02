import { Calendar, Clock, Users, MapPin, Award } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";

interface EventCardProps {
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  participants: number;
  type: "event" | "hackathon" | "project";
  skills?: string[];
  expiresIn?: string;
  status?: "open" | "closing" | "expired";
}

const EventCard = ({
  title,
  description,
  date,
  time,
  location,
  participants,
  type,
  skills = [],
  expiresIn,
  status = "open"
}: EventCardProps) => {
  const typeColors = {
    event: "bg-primary/10 text-primary border-primary/20",
    hackathon: "bg-accent/10 text-accent border-accent/20",
    project: "bg-success/10 text-success border-success/20"
  };

  const statusColors = {
    open: "bg-success text-success-foreground",
    closing: "bg-warning text-warning-foreground",
    expired: "bg-muted text-muted-foreground"
  };

  return (
    <Card className="overflow-hidden transition-all hover:shadow-md animate-fade-in">
      <CardHeader className="space-y-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-lg mb-2 line-clamp-1">{title}</h3>
            <p className="text-sm text-muted-foreground line-clamp-2">{description}</p>
          </div>
          <Badge className={typeColors[type]} variant="outline">
            {type === "hackathon" ? <Award className="h-3 w-3 mr-1" /> : null}
            {type.charAt(0).toUpperCase() + type.slice(1)}
          </Badge>
        </div>
        
        {expiresIn && (
          <Badge className={statusColors[status]} variant="secondary">
            <Clock className="h-3 w-3 mr-1" />
            {status === "expired" ? "Expired" : `Expires in ${expiresIn}`}
          </Badge>
        )}
      </CardHeader>

      <CardContent className="space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Calendar className="h-4 w-4" />
            <span>{date}</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Clock className="h-4 w-4" />
            <span>{time}</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <MapPin className="h-4 w-4" />
            <span className="line-clamp-1">{location}</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Users className="h-4 w-4" />
            <span>{participants} participants</span>
          </div>
        </div>

        {skills.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {skills.slice(0, 3).map((skill, index) => (
              <Badge key={index} variant="secondary" className="text-xs">
                {skill}
              </Badge>
            ))}
            {skills.length > 3 && (
              <Badge variant="secondary" className="text-xs">
                +{skills.length - 3} more
              </Badge>
            )}
          </div>
        )}
      </CardContent>

      <CardFooter className="gap-2 flex-wrap">
        <Button className="flex-1" disabled={status === "expired"}>
          {status === "expired" ? "Closed" : "Apply Now"}
        </Button>
        <Button variant="outline" className="flex-1">
          View Details
        </Button>
      </CardFooter>
    </Card>
  );
};

export default EventCard;
