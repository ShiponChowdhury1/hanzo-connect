/**
 * ChatWindow — group chat for community members.
 * - Auto-scrolls to newest message
 * - Members can send messages, authors can delete their own
 *
 * Project created by Shahidul Islam.
 */
import { useEffect, useMemo, useRef, useState } from "react";
import { Send, Trash2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useAppStore } from "@/store/useAppStore";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export function ChatWindow({ communityId, canChat }: { communityId: string; canChat: boolean }) {
  const allMessages = useAppStore((s) => s.chatMessages);
  const users = useAppStore((s) => s.users);
  const currentUserId = useAppStore((s) => s.currentUserId);
  const send = useAppStore((s) => s.sendChatMessage);
  const remove = useAppStore((s) => s.deleteChatMessage);

  const messages = useMemo(
    () => allMessages.filter((m) => m.communityId === communityId).sort((a, b) => a.createdAt - b.createdAt),
    [allMessages, communityId]
  );

  const [text, setText] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages.length]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = text.trim();
    if (!trimmed) return;
    send(communityId, trimmed);
    setText("");
  };

  return (
    <div className="flex h-[600px] flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-soft">
      <div className="border-b border-border bg-muted/40 px-4 py-3">
        <h3 className="font-display text-sm font-bold">Community Chat</h3>
        <p className="text-xs text-muted-foreground">Talk in real time with other members.</p>
      </div>

      <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto p-4">
        {messages.length === 0 ? (
          <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
            No messages yet. Say hello 👋
          </div>
        ) : (
          messages.map((m) => {
            const u = users.find((x) => x.id === m.authorId);
            if (!u) return null;
            const mine = m.authorId === currentUserId;
            return (
              <div key={m.id} className={cn("flex items-end gap-2", mine && "flex-row-reverse")}>
                <Avatar className="h-7 w-7 flex-shrink-0">
                  <AvatarImage src={u.avatar} />
                  <AvatarFallback>{u.name[0]}</AvatarFallback>
                </Avatar>
                <div className={cn("group max-w-[75%] space-y-0.5", mine && "items-end text-right")}>
                  <div className={cn("flex items-center gap-2 text-[11px] text-muted-foreground", mine && "flex-row-reverse")}>
                    <span className="font-medium">{mine ? "You" : u.name}</span>
                    <span>{formatDistanceToNow(m.createdAt, { addSuffix: true })}</span>
                  </div>
                  <div
                    className={cn(
                      "inline-block rounded-2xl px-3.5 py-2 text-sm leading-relaxed",
                      mine
                        ? "gradient-brand text-white shadow-soft"
                        : "bg-muted text-foreground"
                    )}
                  >
                    {m.content}
                  </div>
                  {mine && (
                    <button
                      onClick={() => remove(m.id)}
                      className="ml-1 text-[10px] text-muted-foreground opacity-0 transition group-hover:opacity-100 hover:text-destructive"
                    >
                      <Trash2 className="inline h-3 w-3" /> delete
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      <form onSubmit={submit} className="flex items-center gap-2 border-t border-border bg-background/50 p-3">
        <Input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={canChat ? "Type a message..." : "Join this community to chat"}
          disabled={!canChat}
          className="rounded-full"
        />
        <Button type="submit" disabled={!canChat || !text.trim()} size="icon" className="rounded-full">
          <Send className="h-4 w-4" />
        </Button>
      </form>
    </div>
  );
}
