import { Mail, MapPin, Briefcase, GraduationCap, Edit } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
interface ProfileCardProps {
  name: string;
  email: string;
  branch: string;
  bio?: string;
  location?: string;
  skills?: string[];
  isOwnProfile?: boolean;
  onEdit?: () => void;
}
const ProfileCard = ({
  name,
  email,
  branch,
  bio,
  location,
  skills = [],
  isOwnProfile = false,
  onEdit
}: ProfileCardProps) => {
  return <Card className="overflow-hidden animate-fade-in">
      <div className="h-24 bg-gradient-to-r from-primary to-accent" />
      
      <CardHeader className="relative">
        <div className="flex flex-col sm:flex-row gap-4 -mt-16">
          <Avatar className="h-24 w-24 border-4 border-card shrink-0">
            <AvatarFallback className="bg-gradient-to-br from-primary to-accent text-primary-foreground text-2xl font-bold">
              {name.split(' ').map(n => n[0]).join('').toUpperCase()}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1 min-w-0 mt-12 sm:mt-8 mx-px">
            <div className="flex items-start justify-between gap-2 mb-2">
              <div className="flex-1 min-w-0">
                <h2 className="text-2xl font-bold">{name}</h2>
                <p className="text-muted-foreground">{branch}</p>
              </div>
              {isOwnProfile && <Button onClick={onEdit} size="sm" variant="outline" className="shrink-0">
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </Button>}
            </div>
            
            {bio && <p className="text-sm mt-2 mb-3">{bio}</p>}
            
            <div className="flex flex-col gap-2 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 shrink-0" />
                <span className="break-all">{email}</span>
              </div>
              {location && <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 shrink-0" />
                  <span>{location}</span>
                </div>}
            </div>
          </div>
        </div>
      </CardHeader>

      {skills.length > 0 && <CardContent>
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-medium">
              <Briefcase className="h-4 w-4" />
              Skills
            </div>
            <div className="flex flex-wrap gap-1.5">
              {skills.map((skill, index) => <Badge key={index} variant="secondary">
                  {skill}
                </Badge>)}
            </div>
          </div>
        </CardContent>}
    </Card>;
};
export default ProfileCard;