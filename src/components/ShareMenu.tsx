import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Share2, Copy, Check, Facebook, Twitter, Mail, MessageCircle } from "lucide-react";
import { toast } from "sonner";

interface ShareMenuProps {
  title: string;
  url?: string;
  variant?: "ghost" | "outline" | "default";
  size?: "sm" | "default" | "icon";
}

const ShareMenu = ({ title, url, variant = "ghost", size = "sm" }: ShareMenuProps) => {
  const [copied, setCopied] = useState(false);
  const shareUrl = url || window.location.href;
  const encodedUrl = encodeURIComponent(shareUrl);
  const encodedTitle = encodeURIComponent(title);

  const copyLink = async () => {
    await navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    toast.success("Link copied!");
    setTimeout(() => setCopied(false), 2000);
  };

  const socials = [
    {
      name: "WhatsApp",
      icon: <MessageCircle className="h-4 w-4" />,
      href: `https://wa.me/?text=${encodedTitle}%20${encodedUrl}`,
      color: "text-green-600 hover:bg-green-50 dark:hover:bg-green-950/20",
    },
    {
      name: "Facebook",
      icon: <Facebook className="h-4 w-4" />,
      href: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
      color: "text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/20",
    },
    {
      name: "X (Twitter)",
      icon: <Twitter className="h-4 w-4" />,
      href: `https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`,
      color: "text-foreground hover:bg-muted",
    },
    {
      name: "Email",
      icon: <Mail className="h-4 w-4" />,
      href: `mailto:?subject=${encodedTitle}&body=Check%20this%20out:%20${encodedUrl}`,
      color: "text-orange-600 hover:bg-orange-50 dark:hover:bg-orange-950/20",
    },
  ];

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant={variant} size={size}>
          <Share2 className="h-4 w-4 mr-1" /> Share
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-56 p-2">
        <p className="text-xs font-semibold text-muted-foreground px-2 py-1.5">Share via</p>
        {socials.map((s) => (
          <a
            key={s.name}
            href={s.href}
            target="_blank"
            rel="noopener noreferrer"
            className={`flex items-center gap-3 px-2 py-2 rounded-lg text-sm font-medium transition-colors ${s.color}`}
          >
            {s.icon}
            {s.name}
          </a>
        ))}
        <div className="border-t my-1" />
        <button
          onClick={copyLink}
          className="flex items-center gap-3 px-2 py-2 rounded-lg text-sm font-medium w-full text-muted-foreground hover:bg-muted transition-colors"
        >
          {copied ? <Check className="h-4 w-4 text-primary" /> : <Copy className="h-4 w-4" />}
          {copied ? "Copied!" : "Copy Link"}
        </button>
      </PopoverContent>
    </Popover>
  );
};

export default ShareMenu;
