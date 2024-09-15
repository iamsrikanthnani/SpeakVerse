"use client";
import Visualizer from "@/components/Visualizer";
import { useSpeakVerse } from "./useSpeakVerse";

export default function Home() {
  const { caption, botResponse, microphone, loadingState } = useSpeakVerse();

  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <main className="flex flex-col gap-8 row-start-2 justify-center items-center sm:items-start">
        <div className="text-[14px]">{loadingState || ""}</div>
        {microphone ? (
          <Visualizer microphone={microphone} />
        ) : (
          <div>Microphone is not ready. Please turn on your microphone.</div>
        )}
        {caption && (
          <div className="bg-black/90 dark:bg-white/90 self-center px-8 py-4 text-center rounded-xl shadow-md">
            <span className="text-white dark:text-black">{caption}</span>
          </div>
        )}
        {botResponse && (
          <div className="bg-blue-500/90 self-center px-8 py-4 text-center rounded-xl shadow-md">
            <span className="text-white">{botResponse}</span>
          </div>
        )}
      </main>
      <footer className="row-start-3 flex gap-6 flex-wrap items-center justify-center">
        <a
          className="flex items-center gap-2 hover:underline hover:underline-offset-4"
          href="https://deepgram.com/"
          target="_blank"
          rel="noopener noreferrer"
        >
          Deepgram
        </a>
        +
        <a
          className="flex items-center gap-2 hover:underline hover:underline-offset-4"
          href="https://elevenlabs.io/"
          target="_blank"
          rel="noopener noreferrer"
        >
          ElevenLabs
        </a>
        +
        <a
          className="flex items-center gap-2 hover:underline hover:underline-offset-4"
          href="https://openai.com/index/hello-gpt-4o/"
          target="_blank"
          rel="noopener noreferrer"
        >
          OpenAI GPT-4o
        </a>
        =
        <a
          className="flex items-center gap-2 hover:underline hover:underline-offset-4"
          href="https://github.com/iamsrikanthnani/SpeakVerse"
          target="_blank"
          rel="noopener noreferrer"
        >
          SpeakVerse
        </a>
      </footer>
    </div>
  );
}
