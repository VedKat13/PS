import { Users, Lock, Globe, Crown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface GroupCardProps {
  name: string;
  description: string;
  members: number;
  privacy: "public" | "private";
  isAdmin?: boolean;
  isMember?: boolean;
  category?: string;
}

const GroupCard = ({
  name,
  description,
  members,
  privacy,
  isAdmin = false,
  isMember = false,
  category
}: GroupCardProps) => {
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
                <Crown className="h-4 w-4 text-warning shrink-0" />
              )}
            </div>
            <p className="text-sm text-muted-foreground line-clamp-2">{description}</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <Badge variant="secondary" className="text-xs">
            {privacy === "private" ? (
              <>
                <Lock className="h-3 w-3 mr-1" />
                Private
              </>
            ) : (
              <>
                <Globe className="h-3 w-3 mr-1" />
                Public
              </>
            )}
          </Badge>
          {category && (
            <Badge variant="outline" className="text-xs">
              {category}
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Users className="h-4 w-4" />
          <span>{members} members</span>
        </div>
      </CardContent>

      <CardFooter className="gap-2 flex-wrap">
        {isMember ? (
          <>
            <Button className="flex-1">
              View Group
            </Button>
            {isAdmin && (
              <Button variant="outline" className="flex-1">
                Manage
              </Button>
            )}
          </>
        ) : (
          <Button className="w-full">
            Join Group
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};

export default GroupCard;
