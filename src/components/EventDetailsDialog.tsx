import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Calendar, Clock, User, Tag, Info, MapPin, Users, Award, Mail, Phone, Zap, Code, Briefcase } from "lucide-react";
import { format } from "date-fns";

interface EventDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  event: {
    id: number;
    title: string;
    description: string;
    requiredSkills?: string;
    expiresIn?: string;
    date?: string;
    time?: string;
    creatorName?: string;
    createdAt?: string;
    expirationTime?: string;
    eventDate?: string;
    eventStartTime?: string;
    eventEndTime?: string;
    location?: string;
    venue?: string;
    maxParticipants?: number;
    currentParticipants?: number;
    prizes?: string;
    organizerEmail?: string;
    organizerPhone?: string;
    imageUrl?: string;
    eventType?: "event" | "hackathon" | "project";
  };
  userId?: number;
  isCreator?: boolean;
  hasApplied?: boolean;
  onApply?: () => void;
}

export default function EventDetailsDialog({
  open,
  onOpenChange,
  event,
  userId,
  isCreator = false,
  hasApplied = false,
  onApply,
}: EventDetailsDialogProps) {
  const skills = event.requiredSkills?.split(',').map(s => s.trim()) || [];
  
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Not specified';
    try {
      return format(new Date(dateString), 'PPP');
    } catch {
      return dateString;
    }
  };

  const formatDateTime = (dateString?: string) => {
    if (!dateString) return 'Not specified';
    try {
      return format(new Date(dateString), 'PPP p');
    } catch {
      return dateString;
    }
  };

  const isExpired = event.expirationTime ? new Date(event.expirationTime) < new Date() : false;
  const canApply = userId && !isCreator && !hasApplied && !isExpired;

  const eventType = event.eventType || 'event';
  
  const typeColors = {
    event: "bg-blue-100 text-blue-700",
    hackathon: "bg-purple-100 text-purple-700",
    project: "bg-green-100 text-green-700"
  };

  const typeIcons = {
    event: <Zap className="h-3 w-3 mr-1" />,
    hackathon: <Code className="h-3 w-3 mr-1" />,
    project: <Briefcase className="h-3 w-3 mr-1" />
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">{event.title}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Event Status */}
          <div className="flex gap-2 flex-wrap">
            <Badge className={typeColors[eventType]}>
              {typeIcons[eventType]}
              {eventType.charAt(0).toUpperCase() + eventType.slice(1)}
            </Badge>
            {isCreator && (
              <Badge variant="default" className="bg-blue-500">
                Your Event
              </Badge>
            )}
            {hasApplied && !isCreator && (
              <Badge variant="default" className="bg-green-500">
                Applied
              </Badge>
            )}
            {isExpired && (
              <Badge variant="destructive">
                Expired
              </Badge>
            )}
            {!isExpired && (
              <Badge variant="default" className="bg-green-500">
                Active
              </Badge>
            )}
          </div>

          {/* Event Banner Image */}
          {event.imageUrl && (
            <>
              <img 
                src={event.imageUrl} 
                alt={event.title}
                className="w-full h-48 object-cover rounded-lg"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
              <Separator />
            </>
          )}

          {/* Description Section */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-semibold">
              <Info className="w-4 h-4" />
              <span>Description</span>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
              {event.description}
            </p>
          </div>

          <Separator />

          {/* Event Details */}
          <div className="space-y-4">
            <h3 className="font-semibold text-sm">Event Details</h3>
            
            {/* Organizer */}
            {event.creatorName && (
              <div className="flex items-start gap-3">
                <User className="w-4 h-4 mt-0.5 text-muted-foreground" />
                <div className="flex-1">
                  <p className="text-xs text-muted-foreground">Organized by</p>
                  <p className="text-sm font-medium">{event.creatorName}</p>
                </div>
              </div>
            )}

            {/* Event Date */}
            {event.eventDate && (
              <div className="flex items-start gap-3">
                <Calendar className="w-4 h-4 mt-0.5 text-muted-foreground" />
                <div className="flex-1">
                  <p className="text-xs text-muted-foreground">Event Date</p>
                  <p className="text-sm font-medium">{formatDateTime(event.eventDate)}</p>
                </div>
              </div>
            )}

            {/* Event Time */}
            {(event.eventStartTime || event.eventEndTime) && (
              <div className="flex items-start gap-3">
                <Clock className="w-4 h-4 mt-0.5 text-muted-foreground" />
                <div className="flex-1">
                  <p className="text-xs text-muted-foreground">Time</p>
                  <p className="text-sm font-medium">
                    {event.eventStartTime && event.eventEndTime 
                      ? `${event.eventStartTime} - ${event.eventEndTime}`
                      : event.eventStartTime || event.eventEndTime}
                  </p>
                </div>
              </div>
            )}

            {/* Location */}
            {event.location && (
              <div className="flex items-start gap-3">
                <MapPin className="w-4 h-4 mt-0.5 text-muted-foreground" />
                <div className="flex-1">
                  <p className="text-xs text-muted-foreground">Location</p>
                  <p className="text-sm font-medium">{event.location}</p>
                  {event.venue && (
                    <p className="text-xs text-muted-foreground mt-1 whitespace-pre-wrap">{event.venue}</p>
                  )}
                </div>
              </div>
            )}

            {/* Participants */}
            {event.maxParticipants && (
              <div className="flex items-start gap-3">
                <Users className="w-4 h-4 mt-0.5 text-muted-foreground" />
                <div className="flex-1">
                  <p className="text-xs text-muted-foreground">Participants</p>
                  <p className="text-sm font-medium">
                    {event.currentParticipants || 0} / {event.maxParticipants} registered
                  </p>
                </div>
              </div>
            )}

            {/* Posted Date */}
            {event.createdAt && (
              <div className="flex items-start gap-3">
                <Calendar className="w-4 h-4 mt-0.5 text-muted-foreground" />
                <div className="flex-1">
                  <p className="text-xs text-muted-foreground">Posted on</p>
                  <p className="text-sm font-medium">{formatDate(event.createdAt)}</p>
                </div>
              </div>
            )}

            {/* Expiration Date */}
            {event.expirationTime && (
              <div className="flex items-start gap-3">
                <Clock className="w-4 h-4 mt-0.5 text-muted-foreground" />
                <div className="flex-1">
                  <p className="text-xs text-muted-foreground">Registration Deadline</p>
                  <p className="text-sm font-medium">{formatDateTime(event.expirationTime)}</p>
                  {event.expiresIn && (
                    <p className="text-xs text-muted-foreground mt-1">{event.expiresIn}</p>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Prizes */}
          {event.prizes && (
            <>
              <Separator />
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm font-semibold">
                  <Award className="w-4 h-4" />
                  <span>Prizes & Incentives</span>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
                  {event.prizes}
                </p>
              </div>
            </>
          )}

          {/* Required Skills */}
          {skills.length > 0 && (
            <>
              <Separator />
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm font-semibold">
                  <Tag className="w-4 h-4" />
                  <span>Required Skills</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {skills.map((skill, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* Contact Information */}
          {(event.organizerEmail || event.organizerPhone) && (
            <>
              <Separator />
              <div className="space-y-3">
                <h3 className="font-semibold text-sm">Contact Information</h3>
                {event.organizerEmail && (
                  <div className="flex items-center gap-3">
                    <Mail className="w-4 h-4 text-muted-foreground" />
                    <a 
                      href={`mailto:${event.organizerEmail}`}
                      className="text-sm text-blue-600 hover:underline"
                    >
                      {event.organizerEmail}
                    </a>
                  </div>
                )}
                {event.organizerPhone && (
                  <div className="flex items-center gap-3">
                    <Phone className="w-4 h-4 text-muted-foreground" />
                    <a 
                      href={`tel:${event.organizerPhone}`}
                      className="text-sm text-blue-600 hover:underline"
                    >
                      {event.organizerPhone}
                    </a>
                  </div>
                )}
              </div>
            </>
          )}

          {/* Apply Button */}
          {onApply && (
            <>
              <Separator />
              <div className="flex justify-end gap-3">
                <Button
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                >
                  Close
                </Button>
                <Button
                  onClick={onApply}
                  disabled={!canApply}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                >
                  {isCreator 
                    ? "Your Event" 
                    : hasApplied 
                      ? "Already Applied" 
                      : isExpired 
                        ? "Registration Closed" 
                        : "Apply Now"}
                </Button>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
