import { TrendingUp, Users, Calendar } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const TrendingWidget = () => {
  const trendingItems = [
    { title: "AI/ML Workshop", type: "event", participants: 234 },
    { title: "Web Dev Hackathon", type: "hackathon", participants: 156 },
    { title: "Data Science Group", type: "group", members: 89 },
    { title: "Mobile App Project", type: "project", participants: 45 },
  ];

  return (
    <Card className="animate-fade-in">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <TrendingUp className="h-5 w-5 text-accent" />
          Trending Now
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {trendingItems.map((item, index) => (
          <div
            key={index}
            className="flex items-center justify-between gap-3 p-3 rounded-lg border bg-card hover:bg-accent/5 transition-colors cursor-pointer"
          >
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm line-clamp-1">{item.title}</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {item.type === "group" ? (
                  <>
                    <Users className="h-3 w-3 inline mr-1" />
                    {item.members} members
                  </>
                ) : (
                  <>
                    <Calendar className="h-3 w-3 inline mr-1" />
                    {item.participants} interested
                  </>
                )}
              </p>
            </div>
            <Badge variant="secondary" className="text-xs shrink-0">
              {item.type}
            </Badge>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

export default TrendingWidget;
