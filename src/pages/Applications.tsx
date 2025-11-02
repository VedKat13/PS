import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, CheckCircle, XCircle, Eye } from "lucide-react";

const Applications = () => {
  const applications = [
    {
      title: "Annual Tech Symposium 2024",
      type: "Event",
      appliedDate: "March 1, 2024",
      status: "pending"
    },
    {
      title: "48-Hour Code Sprint Hackathon",
      type: "Hackathon",
      appliedDate: "Feb 28, 2024",
      status: "selected"
    },
    {
      title: "Sustainable Campus Initiative",
      type: "Project",
      appliedDate: "Feb 25, 2024",
      status: "pending"
    },
    {
      title: "Mobile App Development Workshop",
      type: "Event",
      appliedDate: "Feb 20, 2024",
      status: "rejected"
    },
    {
      title: "AI Research Collaboration",
      type: "Project",
      appliedDate: "Feb 15, 2024",
      status: "selected"
    }
  ];

  const getStatusBadge = (status: string) => {
    const variants = {
      pending: { icon: Clock, className: "bg-warning/10 text-warning border-warning/20" },
      selected: { icon: CheckCircle, className: "bg-success/10 text-success border-success/20" },
      rejected: { icon: XCircle, className: "bg-destructive/10 text-destructive border-destructive/20" }
    };

    const variant = variants[status as keyof typeof variants];
    const Icon = variant.icon;

    return (
      <Badge variant="outline" className={variant.className}>
        <Icon className="h-3 w-3 mr-1" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const stats = {
    pending: applications.filter(a => a.status === "pending").length,
    selected: applications.filter(a => a.status === "selected").length,
    rejected: applications.filter(a => a.status === "rejected").length
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold">Application Status</h1>

      {/* Stats Overview */}
      <div className="grid sm:grid-cols-3 gap-4">
        <Card className="animate-fade-in">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Pending</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-warning" />
              <span className="text-3xl font-bold">{stats.pending}</span>
            </div>
          </CardContent>
        </Card>

        <Card className="animate-fade-in">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Selected</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-success" />
              <span className="text-3xl font-bold">{stats.selected}</span>
            </div>
          </CardContent>
        </Card>

        <Card className="animate-fade-in">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Rejected</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <XCircle className="h-5 w-5 text-destructive" />
              <span className="text-3xl font-bold">{stats.rejected}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Applications List */}
      <Card className="animate-fade-in">
        <CardHeader>
          <CardTitle>All Applications</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {applications.map((app, index) => (
              <div
                key={index}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-lg border bg-card hover:bg-accent/5 transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold line-clamp-1">{app.title}</h3>
                    <Badge variant="secondary" className="text-xs shrink-0">
                      {app.type}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Applied on {app.appliedDate}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {getStatusBadge(app.status)}
                  <Button size="sm" variant="outline">
                    <Eye className="h-4 w-4 mr-2" />
                    View
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Applications;
