import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ArrowUp } from "lucide-react";
import { cn } from "@/lib/utils";

const SCROLL_THRESHOLD = 400;

export function BackToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setVisible(window.scrollY > SCROLL_THRESHOLD);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (!visible) return null;

  return (
    <Button
      type="button"
      size="icon"
      onClick={scrollToTop}
      aria-label="Back to top"
      className={cn(
        "fixed bottom-20 right-5 z-[9998] h-10 w-10 rounded-full shadow-lg",
        "bg-primary text-primary-foreground hover:bg-primary/90",
        "ring-2 ring-background"
      )}
    >
      <ArrowUp className="h-5 w-5" />
    </Button>
  );
}
