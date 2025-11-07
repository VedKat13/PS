import { Calendar, Clock, Users, MapPin, Award, Code, Zap, Briefcase } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { useState } from "react";
import ApplicationDialog from "./ApplicationDialog";
import EventDetailsDialog from "./EventDetailsDialog";

interface EventCardProps {
  id?: number;
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  participants: number;
  type: "event" | "hackathon" | "project";
  eventType?: "event" | "hackathon" | "project";
  skills?: string[];
  expiresIn?: string;
  status?: "open" | "closing" | "expired";
  hasApplied?: boolean;
  userId?: number;
  isCreator?: boolean;
  creatorName?: string;
  createdAt?: string;
  expirationTime?: string;
  requiredSkills?: string;
  eventDate?: string;
  eventStartTime?: string;
  eventEndTime?: string;
  venue?: string;
  maxParticipants?: number;
  currentParticipants?: number;
  prizes?: string;
  organizerEmail?: string;
  organizerPhone?: string;
  imageUrl?: string;
}

const EventCard = ({
  id,
  title,
  description,
  date,
  time,
  location,
  participants,
  type,
  eventType,
  skills = [],
  expiresIn,
  status = "open",
  hasApplied = false,
  userId,
  isCreator = false,
  creatorName,
  createdAt,
  expirationTime,
  requiredSkills,
  eventDate,
  eventStartTime,
  eventEndTime,
  venue,
  maxParticipants,
  currentParticipants,
  prizes,
  organizerEmail,
  organizerPhone,
  imageUrl
}: EventCardProps) => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);

  // Use eventType from DB, fallback to type prop
  const displayType = eventType || type;

  // Button is disabled if: event expired, already applied, no userId, no event ID, OR user is the creator
  const isDisabled = status === "expired" || hasApplied || !userId || !id || isCreator;

  console.log(`EventCard "${title}": userId=${userId}, id=${id}, isCreator=${isCreator}, isDisabled=${isDisabled}`);

  const handleApplyClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (!userId || !id) {
      console.error('Cannot apply: Missing userId or eventId', { userId, id });
      return;
    }
    setDialogOpen(true);
  };

  const typeColors = {
    event: "bg-blue-100 text-blue-700 border-blue-300",
    hackathon: "bg-purple-100 text-purple-700 border-purple-300",
    project: "bg-green-100 text-green-700 border-green-300"
  };

  const typeIcons = {
    event: <Zap className="h-3 w-3 mr-1" />,
    hackathon: <Code className="h-3 w-3 mr-1" />,
    project: <Briefcase className="h-3 w-3 mr-1" />
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
          <Badge className={typeColors[displayType]} variant="outline">
            {typeIcons[displayType]}
            {displayType.charAt(0).toUpperCase() + displayType.slice(1)}
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
        <Button 
          className="flex-1" 
          disabled={isDisabled}
          onClick={handleApplyClick}
          type="button"
        >
          {isCreator ? "Your Event" : status === "expired" ? "Closed" : hasApplied ? "Applied" : "Apply Now"}
        </Button>
        <Button 
          variant="outline" 
          className="flex-1"
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setDetailsDialogOpen(true);
          }}
        >
          View Details
        </Button>
      </CardFooter>

      {userId && id && (
        <>
          <ApplicationDialog
            open={dialogOpen}
            onOpenChange={setDialogOpen}
            eventId={id}
            eventTitle={title}
            userId={userId}
          />
          
          <EventDetailsDialog
            open={detailsDialogOpen}
            onOpenChange={setDetailsDialogOpen}
            event={{
              id,
              title,
              description,
              requiredSkills: requiredSkills || skills?.join(', '),
              expiresIn,
              date,
              time,
              creatorName,
              createdAt,
              expirationTime,
              eventDate,
              eventStartTime,
              eventEndTime,
              location,
              venue,
              maxParticipants,
              currentParticipants,
              prizes,
              organizerEmail,
              organizerPhone,
              imageUrl
            }}
            userId={userId}
            isCreator={isCreator}
            hasApplied={hasApplied}
            onApply={() => {
              setDetailsDialogOpen(false);
              setDialogOpen(true);
            }}
          />
        </>
      )}
    </Card>
  );
};

export default EventCard;
