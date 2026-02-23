import { useState } from "react";
import { BrainCircuit, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import AISearchBar from "./AISearchBar";

const FloatingAIButton = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {isOpen && (
        <div className="absolute bottom-16 right-0 w-[90vw] max-w-md bg-card border border-border rounded-xl shadow-2xl p-5 mb-3 animate-in slide-in-from-bottom-4 fade-in duration-200">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <BrainCircuit className="h-5 w-5 text-primary" />
              <span className="text-sm font-semibold">AI Smart Search</span>
            </div>
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setIsOpen(false)}>
              <X className="h-4 w-4" />
            </Button>
          </div>
          <div className="min-h-[80px]">
            <AISearchBar />
          </div>
        </div>
      )}
      <Button
        onClick={() => setIsOpen(!isOpen)}
        size="icon"
        className="h-14 w-14 rounded-full shadow-lg bg-primary hover:bg-primary/90 text-primary-foreground"
      >
        {isOpen ? <X className="h-6 w-6" /> : <BrainCircuit className="h-6 w-6" />}
      </Button>
    </div>
  );
};

export default FloatingAIButton;
