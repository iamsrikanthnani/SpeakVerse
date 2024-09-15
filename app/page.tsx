"use client";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import {
  LiveConnectionState,
  LiveTranscriptionEvent,
  LiveTranscriptionEvents,
  useDeepgram,
} from "@/contexts/deepgram";
import {
  MicrophoneEvents,
  MicrophoneState,
  useMicrophone,
} from "@/contexts/microphone";
import Visualizer from "@/components/Visualizer";
import { useCompletion } from "ai/react";

export default function Home() {
  const [caption, setCaption] = useState<string | undefined>("");
  const { connection, connectToDeepgram, connectionState } = useDeepgram();
  const { setupMicrophone, microphone, startMicrophone, microphoneState } =
    useMicrophone();
  const captionTimeout = useRef<any>();
  const keepAliveInterval = useRef<any>();

  const { complete, completion } = useCompletion({
    api: "/api/chat",
    onFinish: async (prompt, completion) => {
      console.log("completion", completion);
    },
  });

  useEffect(() => {
    setupMicrophone();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (microphoneState === MicrophoneState.Ready) {
      connectToDeepgram({
        model: "nova-2",
        interim_results: true,
        smart_format: true,
        filler_words: true,
        utterance_end_ms: 3000,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [microphoneState]);

  useEffect(() => {
    if (!microphone) return;
    if (!connection) return;

    const onData = (e: BlobEvent) => {
      // iOS SAFARI FIX:
      // Prevent packetZero from being sent. If sent at size 0, the connection will close.
      if (e.data.size > 0) {
        connection?.send(e.data);
      }
    };

    const onTranscript = (data: LiveTranscriptionEvent) => {
      const { is_final: isFinal, speech_final: speechFinal } = data;
      let thisCaption = data.channel.alternatives[0].transcript;

      console.log("thisCaption", thisCaption);
      if (thisCaption !== "") {
        console.log('thisCaption !== ""', thisCaption);
        setCaption(thisCaption);
      }

      if (isFinal && speechFinal) {
        clearTimeout(captionTimeout.current);
        captionTimeout.current = setTimeout(() => {
          setCaption(undefined);
          clearTimeout(captionTimeout.current);
        }, 3000);
      }
    };

    if (connectionState === LiveConnectionState.OPEN) {
      connection.addListener(LiveTranscriptionEvents.Transcript, onTranscript);
      microphone.addEventListener(MicrophoneEvents.DataAvailable, onData);

      startMicrophone();
    }

    return () => {
      // prettier-ignore
      connection.removeListener(LiveTranscriptionEvents.Transcript, onTranscript);
      microphone.removeEventListener(MicrophoneEvents.DataAvailable, onData);
      clearTimeout(captionTimeout.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [connectionState]);

  useEffect(() => {
    if (!connection) return;

    if (
      microphoneState !== MicrophoneState.Open &&
      connectionState === LiveConnectionState.OPEN
    ) {
      connection.keepAlive();

      keepAliveInterval.current = setInterval(() => {
        connection.keepAlive();
      }, 10000);
    } else {
      clearInterval(keepAliveInterval.current);
    }

    return () => {
      clearInterval(keepAliveInterval.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [microphoneState, connectionState]);

  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <main className="flex flex-col gap-8 row-start-2 justify-center items-center sm:items-start">
        {microphone ? (
          <Visualizer microphone={microphone} />
        ) : (
          <div>microphone is not ready, try turning on your microphone</div>
        )}
        {caption ? (
          <div className="bg-black/90 dark:bg-white/90 self-center px-8 py-4 text-center rounded-xl shadow-md">
            <span className="text-white dark:text-black">{caption}</span>
          </div>
        ) : null}
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
