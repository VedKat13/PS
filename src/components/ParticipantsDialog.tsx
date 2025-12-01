import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useEffect } from "react";

interface ParticipantsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  eventId: string | number;
  requesterId?: string | number;
}

export default function ParticipantsDialog({ open, onOpenChange, eventId, requesterId }: ParticipantsDialogProps) {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['applications', 'event', eventId, requesterId],
    queryFn: () => api.applications.getByEvent(String(eventId), requesterId),
    enabled: !!open
  });

  useEffect(() => {
    if (open) refetch();
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Registered Participants</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">Only visible to the event creator.</p>
          <Separator />

          {isLoading && <div className="text-center py-4">Loading participants...</div>}
          {error && <div className="text-center py-4 text-red-500">Failed to load participants.</div>}

          {!isLoading && Array.isArray(data) && data.length === 0 && (
            <div className="text-center py-6 text-muted-foreground">No participants have registered yet.</div>
          )}

          <div className="space-y-2">
            {Array.isArray(data) && data.map((p: any) => (
              <div key={p.applicationid} className="flex items-center justify-between p-3 border rounded">
                <div>
                  <div className="font-medium">{p.applicantName || p.name || 'Unnamed'}</div>
                  <div className="text-xs text-muted-foreground">{p.applicantEmail || p.email || ''} {p.branch ? `• ${p.branch}` : ''}</div>
                </div>
                <div className="text-right text-sm">
                  <div className="text-muted-foreground">{p.status}</div>
                  <div className="text-muted-foreground">Applied: {p.createdAt ? new Date(p.createdAt).toLocaleString() : '-'}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-end mt-4">
            <Button variant="outline" onClick={() => onOpenChange(false)}>Close</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
