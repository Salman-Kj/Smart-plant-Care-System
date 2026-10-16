import { useState, useRef, useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  getChatbotReply,
  CHATBOT_GREETING,
  chatbotQuickActions,
  chatbotReplyLinks,
} from "@/data/chatbot-faq";
import { MessageCircle, X } from "lucide-react";
import { cn } from "@/lib/utils";

type Message = { role: "user" | "bot"; text: string };

function renderReplyWithLinks(text: string, onNavigate: (path: string) => void) {
  const parts = text.split(/\*\*(.*?)\*\*/g);
  return parts.map((part, i) => {
    if (i % 2 === 0) return <span key={i}>{part}</span>;
    const path = chatbotReplyLinks[part];
    if (path) {
      return (
        <button
          key={i}
          type="button"
          onClick={() => onNavigate(path)}
          className="underline font-semibold text-primary hover:opacity-80 inline"
        >
          {part}
        </button>
      );
    }
    return <strong key={i}>{part}</strong>;
  });
}

export function ChatbotWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: "bot", text: CHATBOT_GREETING },
  ]);
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [, setLocation] = useLocation();

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = (text: string) => {
    const trimmed = text.trim();
    if (!trimmed) return;

    setMessages((prev) => [...prev, { role: "user", text: trimmed }]);
    const reply = getChatbotReply(trimmed);
    setMessages((prev) => [...prev, { role: "bot", text: reply }]);
    setInput("");
  };

  const handleQuickAction = (keyword: string, path?: string) => {
    sendMessage(keyword);
    if (path) setLocation(path);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  return (
    <>
      {/* Fixed chat button */}
      <Button
        type="button"
        size="icon"
        className={cn(
          "fixed bottom-5 right-5 z-[9999] h-12 w-12 rounded-full shadow-lg",
          "bg-primary text-primary-foreground hover:bg-primary/90",
          "ring-2 ring-background"
        )}
        onClick={() => setOpen((o) => !o)}
        aria-label={open ? "Close chat" : "Open chat"}
      >
        {open ? <X className="h-6 w-6" /> : <MessageCircle className="h-6 w-6" />}
      </Button>

      {/* Chat panel - compact, green header, clear bubbles */}
      {open && (
        <Card
          className={cn(
            "fixed bottom-24 right-4 z-[9999]",
            "w-[min(320px,calc(100vw-2rem))]",
            "shadow-xl border border-border rounded-xl overflow-hidden"
          )}
          aria-label="Chat panel"
        >
          <CardHeader className="py-2.5 px-3 border-0 bg-primary text-primary-foreground rounded-t-xl">
            <h3 className="text-sm font-semibold">Smart Plant Care Assistant</h3>
          </CardHeader>
          <CardContent className="p-0 flex flex-col bg-background">
            <div className="h-[220px] overflow-y-auto px-3 bg-muted/30">
              <div className="py-2 space-y-2.5">
                {messages.map((msg, i) => (
                  <div
                    key={i}
                    className={cn(
                      "flex",
                      msg.role === "user" ? "justify-end" : "justify-start"
                    )}
                  >
                    <div
                      className={cn(
                        "max-w-[90%] rounded-xl px-3 py-2 text-xs shadow-sm",
                        msg.role === "user"
                          ? "bg-primary text-primary-foreground"
                          : "bg-background border border-border text-foreground"
                      )}
                    >
                      {msg.role === "bot"
                        ? renderReplyWithLinks(msg.text, setLocation)
                        : msg.text}
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
            </div>

            {/* Quick actions - theme green */}
            <div className="px-3 py-2 border-t border-border bg-background flex flex-wrap gap-1.5">
              {chatbotQuickActions.map((action, i) => (
                <Button
                  key={i}
                  type="button"
                  variant="secondary"
                  size="sm"
                  className="text-xs h-8 px-2.5 border border-border bg-secondary/50 hover:bg-primary hover:text-primary-foreground hover:border-primary"
                  onClick={() => handleQuickAction(action.keyword, action.path)}
                >
                  {action.label}
                </Button>
              ))}
            </div>

            {/* Input */}
            <form onSubmit={handleSubmit} className="p-2.5 border-t border-border bg-background">
              <div className="flex gap-2">
                <Input
                  type="text"
                  placeholder="Type your question..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  className="flex-1 h-9 text-sm rounded-lg border-border"
                  aria-label="Chat message"
                />
                <Button type="submit" size="sm" className="h-9 px-4 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90">
                  Send
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}
    </>
  );
}
