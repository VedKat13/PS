import { Users, Lock, Globe, Crown, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useNavigate } from "react-router-dom";

interface GroupCardProps {
  id?: number;
  name: string;
  description: string;
  members: number;
  isAdmin?: boolean;
  isMember?: boolean;
  creatorName?: string;
  userId?: number;
}

const GroupCard = ({
  id,
  name,
  description,
  members,
  isAdmin = false,
  isMember = false,
  creatorName
}: GroupCardProps) => {
  const navigate = useNavigate();

  const handleViewGroup = () => {
    console.log('GroupCard clicked, id:', id);
    if (id) {
      console.log('Navigating to /groups/' + id);
      navigate(`/groups/${id}`);
    } else {
      console.error('Group ID is undefined or falsy:', id);
    }
  };

  return (
    <Card className="overflow-hidden transition-all hover:shadow-md animate-fade-in">
      <CardHeader className="space-y-3">
        <div className="flex items-start gap-3">
          <Avatar className="h-12 w-12 shrink-0">
            <AvatarFallback className="bg-gradient-to-br from-primary to-accent text-primary-foreground font-semibold">
              {name.substring(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-semibold text-lg line-clamp-1">{name}</h3>
              {isAdmin && (
                <Crown className="h-4 w-4 text-warning shrink-0" title="Admin" />
              )}
            </div>
            <p className="text-sm text-muted-foreground line-clamp-2">{description}</p>
          </div>
        </div>

        {creatorName && (
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Shield className="h-3 w-3" />
            <span>Created by {creatorName}</span>
          </div>
        )}
      </CardHeader>

      <CardContent>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Users className="h-4 w-4" />
          <span>{members} {members === 1 ? 'member' : 'members'}</span>
        </div>
      </CardContent>

      <CardFooter className="gap-2 flex-wrap">
        {isMember ? (
          <Button className="w-full" onClick={handleViewGroup}>
            {isAdmin ? 'Manage Group' : 'View Group'}
          </Button>
        ) : (
          <Button className="w-full" onClick={handleViewGroup}>
            View Details
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};

export default GroupCard;
