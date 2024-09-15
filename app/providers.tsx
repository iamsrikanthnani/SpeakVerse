"use client";
import { MicrophoneContextProvider } from "@/contexts/microphone";
import { DeepgramContextProvider } from "@/contexts/deepgram";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <MicrophoneContextProvider>
      <DeepgramContextProvider>{children}</DeepgramContextProvider>
    </MicrophoneContextProvider>
  );
}
