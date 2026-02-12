import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Mic, Square, Loader2 } from "lucide-react";

interface VoiceRecorderProps {
  onRecordingComplete: (blob: Blob) => void;
  disabled?: boolean;
}

export function VoiceRecorder({ onRecordingComplete, disabled }: VoiceRecorderProps) {
  const [recording, setRecording] = useState(false);
  const [duration, setDuration] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        onRecordingComplete(blob);
        stream.getTracks().forEach((t) => t.stop());
        setDuration(0);
      };

      mediaRecorder.start();
      setRecording(true);
      setDuration(0);
      intervalRef.current = setInterval(() => setDuration((d) => d + 1), 1000);
    } catch {
      console.error("Microphone access denied");
    }
  };

  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
    setRecording(false);
    if (intervalRef.current) clearInterval(intervalRef.current);
  };

  const formatDuration = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;

  if (recording) {
    return (
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-2 bg-destructive/10 text-destructive px-3 py-1.5 rounded-full text-sm animate-pulse">
          <div className="w-2 h-2 rounded-full bg-destructive" />
          {formatDuration(duration)}
        </div>
        <Button variant="destructive" size="icon" className="h-9 w-9 shrink-0 rounded-full" onClick={stopRecording}>
          <Square className="h-4 w-4" />
        </Button>
      </div>
    );
  }

  return (
    <Button variant="ghost" size="icon" className="h-9 w-9 shrink-0" onClick={startRecording} disabled={disabled}>
      <Mic className="h-5 w-5 text-muted-foreground" />
    </Button>
  );
}
