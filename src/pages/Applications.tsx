import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Clock, CheckCircle, XCircle, Eye, Calendar, MapPin, Phone, Mail, User, Book, Briefcase, Target, Trash2 } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { useState } from "react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const Applications = () => {
  const { currentUser } = useAuth();
  const [selectedApp, setSelectedApp] = useState<any>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const queryClient = useQueryClient();

  // Fetch current user data
  const { data: userData, isLoading: isLoadingUser } = useQuery({
    queryKey: ['user', currentUser?.email],
    queryFn: () => api.users.getByEmail(currentUser?.email || ''),
    enabled: !!currentUser?.email,
  });

  console.log('Current user email:', currentUser?.email);
  console.log('User data from DB:', userData);

  // Use userId (capital I) from the database
  const userIdForQuery = userData?.userId || userData?.userid;

  // Fetch user's applications
  const { data: applications = [], isLoading, error } = useQuery({
    queryKey: ['applications', userIdForQuery],
    queryFn: () => {
      console.log('Fetching applications for userID:', userIdForQuery);
      return api.applications.getByUser(userIdForQuery?.toString());
    },
    enabled: !!userIdForQuery,
  });

  console.log('Applications data:', applications);
  console.log('Applications error:', error);

  // Delete application mutation
  const deleteMutation = useMutation({
    mutationFn: (applicationId: number) => api.applications.delete(applicationId.toString()),
    onSuccess: async () => {
      // Invalidate and refetch queries to immediately update UI
      await queryClient.invalidateQueries({ queryKey: ['applications', userIdForQuery] });
      await queryClient.invalidateQueries({ queryKey: ['events'] });
      // Force immediate refetch so "Apply Now" button becomes available again
      await queryClient.refetchQueries({ queryKey: ['applications', userIdForQuery] });
      await queryClient.refetchQueries({ queryKey: ['events'] });
      
      toast.success('Application deleted successfully! You can apply again now.');
    },
    onError: (error: any) => {
      console.error('Delete error:', error);
      toast.error('Failed to delete application');
    }
  });

  const handleDelete = (applicationId: number, eventTitle: string) => {
    if (window.confirm(`Are you sure you want to delete your application for "${eventTitle}"?`)) {
      deleteMutation.mutate(applicationId);
    }
  };

  if (isLoadingUser || isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg">Loading applications...</div>
      </div>
    );
  }

  const getStatusBadge = (status: string) => {
    const statusLower = status?.toLowerCase();
    const variants = {
      pending: { icon: Clock, className: "bg-warning/10 text-warning border-warning/20" },
      selected: { icon: CheckCircle, className: "bg-success/10 text-success border-success/20" },
      accepted: { icon: CheckCircle, className: "bg-success/10 text-success border-success/20" },
      rejected: { icon: XCircle, className: "bg-destructive/10 text-destructive border-destructive/20" }
    };

    const variant = variants[statusLower as keyof typeof variants] || variants.pending;
    const Icon = variant.icon;

    return (
      <Badge variant="outline" className={variant.className}>
        <Icon className="h-3 w-3 mr-1" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const stats = {
    total: applications.length,
    pending: applications.filter((a: any) => a.status?.toLowerCase() === "pending").length,
    selected: applications.filter((a: any) => ['selected', 'accepted'].includes(a.status?.toLowerCase())).length,
    rejected: applications.filter((a: any) => a.status?.toLowerCase() === "rejected").length
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold">My Applications</h1>

      {/* Stats Overview */}
      <div className="grid sm:grid-cols-4 gap-4">
        <Card className="animate-fade-in">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>

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
          {applications.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No applications yet. Start applying to events!
            </div>
          ) : (
            <div className="space-y-3">
              {applications.map((app: any, index: number) => (
                <div
                  key={index}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-lg border bg-card hover:bg-accent/5 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold line-clamp-1">
                        {app.eventTitle || app.eventtitle || 'Event'}
                      </h3>
                      <Badge variant="secondary" className="text-xs shrink-0">
                        Event
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Application Status
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusBadge(app.status)}
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => {
                        setSelectedApp(app);
                        setDetailsOpen(true);
                      }}
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      View
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                      className="text-destructive hover:bg-destructive/10"
                      onClick={() => handleDelete(app.applicationid, app.eventTitle || app.eventtitle || 'Event')}
                      disabled={deleteMutation.isPending}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Application Details Dialog */}
      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl">Application Details</DialogTitle>
          </DialogHeader>
          
          {selectedApp && (
            <div className="space-y-6 mt-4">
              {/* Status and Event */}
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-lg font-semibold">{selectedApp.eventTitle || selectedApp.eventtitle || 'Event'}</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Applied on {new Date(selectedApp.createdAt || Date.now()).toLocaleDateString()}
                  </p>
                </div>
                {getStatusBadge(selectedApp.status)}
              </div>

              <Separator />

              {/* Personal Information */}
              <div className="space-y-4">
                <h4 className="font-semibold flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Personal Information
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-muted-foreground">Name</label>
                    <p className="font-medium">{selectedApp.name || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="text-sm text-muted-foreground">Email</label>
                    <p className="font-medium flex items-center gap-1">
                      <Mail className="h-3 w-3" />
                      {selectedApp.email || 'N/A'}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm text-muted-foreground">Phone</label>
                    <p className="font-medium flex items-center gap-1">
                      <Phone className="h-3 w-3" />
                      {selectedApp.phone || 'N/A'}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm text-muted-foreground">Branch</label>
                    <p className="font-medium">{selectedApp.branch || 'N/A'}</p>
                  </div>
                  {selectedApp.year && (
                    <div>
                      <label className="text-sm text-muted-foreground">Academic Year</label>
                      <p className="font-medium">{selectedApp.year}</p>
                    </div>
                  )}
                </div>
              </div>

              {selectedApp.skills && (
                <>
                  <Separator />
                  <div className="space-y-2">
                    <h4 className="font-semibold flex items-center gap-2">
                      <Briefcase className="h-4 w-4" />
                      Skills
                    </h4>
                    <p className="text-sm">{selectedApp.skills}</p>
                  </div>
                </>
              )}

              {selectedApp.experience && (
                <>
                  <Separator />
                  <div className="space-y-2">
                    <h4 className="font-semibold flex items-center gap-2">
                      <Book className="h-4 w-4" />
                      Experience
                    </h4>
                    <p className="text-sm whitespace-pre-wrap">{selectedApp.experience}</p>
                  </div>
                </>
              )}

              {selectedApp.motivation && (
                <>
                  <Separator />
                  <div className="space-y-2">
                    <h4 className="font-semibold flex items-center gap-2">
                      <Target className="h-4 w-4" />
                      Motivation
                    </h4>
                    <p className="text-sm whitespace-pre-wrap">{selectedApp.motivation}</p>
                  </div>
                </>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Applications;
