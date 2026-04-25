/**
 * JoinRequestManager — admin-only widget to approve/reject pending requests.
 * Project created by Shahidul Islam.
 */
import { Check, X, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { useAppStore } from "@/store/useAppStore";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

export function JoinRequestManager({ communityId }: { communityId: string }) {
  const communities = useAppStore((s) => s.communities);
  const users = useAppStore((s) => s.users);
  const approve = useAppStore((s) => s.approveJoin);
  const reject = useAppStore((s) => s.rejectJoin);

  const community = communities.find((c) => c.id === communityId);
  if (!community) return null;
  const pending = community.pendingRequests;

  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-soft">
      <div className="mb-3 flex items-center gap-2 text-sm font-semibold">
        <ShieldCheck className="h-4 w-4 text-primary" />
        Pending requests
        <span className="ml-auto rounded-full bg-primary/15 px-2 py-0.5 text-[11px] font-bold text-primary">
          {pending.length}
        </span>
      </div>
      {pending.length === 0 ? (
        <p className="text-xs text-muted-foreground">No pending requests right now.</p>
      ) : (
        <div className="space-y-3">
          {pending.map((uid) => {
            const u = users.find((x) => x.id === uid);
            if (!u) return null;
            return (
              <div key={uid} className="flex items-center gap-2.5">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={u.avatar} />
                  <AvatarFallback>{u.name[0]}</AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-medium">{u.name}</div>
                  <div className="truncate text-xs text-muted-foreground">@{u.username}</div>
                </div>
                <Button
                  size="icon"
                  variant="outline"
                  className="h-8 w-8"
                  onClick={() => {
                    reject(communityId, uid);
                    toast.success(`Rejected ${u.name}`);
                  }}
                >
                  <X className="h-4 w-4" />
                </Button>
                <Button
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => {
                    approve(communityId, uid);
                    toast.success(`Approved ${u.name}`);
                  }}
                >
                  <Check className="h-4 w-4" />
                </Button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
