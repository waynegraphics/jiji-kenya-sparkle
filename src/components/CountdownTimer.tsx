import { useState, useEffect } from "react";
import { Clock } from "lucide-react";
import { cn } from "@/lib/utils";

interface CountdownTimerProps {
  expiresAt: string | null;
  className?: string;
  showIcon?: boolean;
  variant?: "default" | "compact" | "badge";
}

export const CountdownTimer = ({ 
  expiresAt, 
  className,
  showIcon = true,
  variant = "default"
}: CountdownTimerProps) => {
  const [timeRemaining, setTimeRemaining] = useState<{
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
    expired: boolean;
  } | null>(null);

  useEffect(() => {
    if (!expiresAt) {
      setTimeRemaining(null);
      return;
    }

    const calculateTimeRemaining = () => {
      const now = new Date().getTime();
      const expiry = new Date(expiresAt).getTime();
      const difference = expiry - now;

      if (difference <= 0) {
        return {
          days: 0,
          hours: 0,
          minutes: 0,
          seconds: 0,
          expired: true,
        };
      }

      return {
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((difference % (1000 * 60)) / 1000),
        expired: false,
      };
    };

    setTimeRemaining(calculateTimeRemaining());

    const interval = setInterval(() => {
      setTimeRemaining(calculateTimeRemaining());
    }, 1000);

    return () => clearInterval(interval);
  }, [expiresAt]);

  if (!expiresAt || !timeRemaining) {
    return null;
  }

  if (timeRemaining.expired) {
    return (
      <span className={cn("text-destructive text-sm font-medium", className)}>
        {showIcon && <Clock className="h-3 w-3 inline mr-1" />}
        Expired
      </span>
    );
  }

  if (variant === "compact") {
    return (
      <span className={cn("text-sm text-muted-foreground flex items-center gap-1", className)}>
        {showIcon && <Clock className="h-3 w-3" />}
        {timeRemaining.days > 0 ? `${timeRemaining.days}d` : ""}
        {timeRemaining.days > 0 ? " " : ""}
        {timeRemaining.hours}h {timeRemaining.minutes}m
      </span>
    );
  }

  if (variant === "badge") {
    return (
      <span className={cn(
        "inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium",
        timeRemaining.days <= 3 ? "bg-destructive/10 text-destructive" : "bg-primary/10 text-primary",
        className
      )}>
        {showIcon && <Clock className="h-3 w-3" />}
        {timeRemaining.days > 0 && `${timeRemaining.days}d `}
        {timeRemaining.hours}h {timeRemaining.minutes}m
      </span>
    );
  }

  return (
    <div className={cn("flex items-center gap-2", className)}>
      {showIcon && <Clock className="h-4 w-4 text-muted-foreground" />}
      <div className="flex items-center gap-1 text-sm">
        {timeRemaining.days > 0 && (
          <span className="font-semibold">
            {timeRemaining.days} {timeRemaining.days === 1 ? "day" : "days"}
          </span>
        )}
        {timeRemaining.days > 0 && <span className="text-muted-foreground">,</span>}
        <span className="font-semibold">
          {timeRemaining.hours} {timeRemaining.hours === 1 ? "hour" : "hours"}
        </span>
        {timeRemaining.days === 0 && (
          <>
            <span className="text-muted-foreground">,</span>
            <span className="font-semibold">
              {timeRemaining.minutes} {timeRemaining.minutes === 1 ? "minute" : "minutes"}
            </span>
          </>
        )}
        <span className="text-muted-foreground">remaining</span>
      </div>
    </div>
  );
};
