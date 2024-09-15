"use client";
import { useCallback, useEffect, useRef, useState } from "react";
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

// Define the chunk size for processing text
const CHUNK_SIZE = 100;

export function useSpeakVerse() {
  // State variables
  const [caption, setCaption] = useState<string | undefined>();
  const [botResponse, setBotResponse] = useState("");
  const [loadingState, setLoadingState] = useState<string>("");

  // Refs for managing various aspects of the application
  const accumulatedTextRef = useRef("");
  const CHUNK_SIZE = 100; // Adjust this value to balance between responsiveness and continuity
  const captionTimeout = useRef<any>();
  const keepAliveInterval = useRef<any>();
  const audioRef = useRef<HTMLAudioElement>(null);
  const isSpeakingRef = useRef(false);
  const audioQueue = useRef<string[]>([]);
  const isGeneratingResponse = useRef(false);
  const interruptTimeout = useRef<NodeJS.Timeout | null>(null);
  const currentRequestRef = useRef<AbortController | null>(null);
  const latestContextRef = useRef<string>("");
  const responseTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const audioSourceRef = useRef<AudioBufferSourceNode | null>(null);
  const audioBufferQueue = useRef<AudioBuffer[]>([]);
  const isPlayingRef = useRef(false);

  // Custom hooks for Deepgram and microphone functionality
  const { connection, connectToDeepgram, connectionState } = useDeepgram();
  const { setupMicrophone, microphone, startMicrophone, microphoneState } =
    useMicrophone();

  // Initialize microphone on component mount
  useEffect(() => {
    setupMicrophone();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Initialize Deepgram when microphone is ready
  useEffect(() => {
    if (microphoneState === MicrophoneState.Ready) {
      setLoadingState(
        "Initializing Deepgram for advanced speech recognition..."
      );
      connectToDeepgram({
        model: "nova-2",
        interim_results: true,
        smart_format: true,
        filler_words: true,
        utterance_end_ms: 3000,
      });
      // Simulate connection process with loading states
      setTimeout(() => {
        setLoadingState(
          "Deepgram connected. Speech recognition system online."
        );
        setTimeout(
          () =>
            setLoadingState("Listening attentively. Please speak clearly..."),
          2000
        );
      }, 1000);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [microphoneState]);

  // Function to stop all ongoing processes
  const stopEverything = useCallback(() => {
    setLoadingState("Interrupting all ongoing processes...");
    stopAudio();
    audioQueue.current = [];
    audioBufferQueue.current = [];
    setBotResponse("");
    if (currentRequestRef.current) {
      currentRequestRef.current.abort();
    }
    if (responseTimeoutRef.current) {
      clearTimeout(responseTimeoutRef.current);
    }
    if (interruptTimeout.current) {
      clearTimeout(interruptTimeout.current);
    }
    isGeneratingResponse.current = false;
    isSpeakingRef.current = false;
    isPlayingRef.current = false;
    setLoadingState("All processes halted. System ready for new interaction.");
  }, []);

  // Function to play the next audio in the queue
  const playNextInQueue = useCallback(async () => {
    if (isSpeakingRef.current || audioQueue.current.length === 0) return;

    isSpeakingRef.current = true;
    const text = audioQueue.current.shift()!;

    try {
      setLoadingState("Generating audio");
      await playAudio(text);
      setTimeout(() => setLoadingState(""), 1000);
    } catch (error) {
      console.error("Error playing audio:", error);
      setLoadingState("");
    } finally {
      isSpeakingRef.current = false;
      if (audioQueue.current.length > 0) {
        playNextInQueue();
      }
    }
  }, []);

  // Function to get bot response
  const getBotResponse = useCallback(
    async (text: string, signal: AbortSignal) => {
      try {
        setBotResponse("");
        accumulatedTextRef.current = "";
        // Simulate processing steps with loading states
        setLoadingState("Analyzing your input for context and intent...");
        await new Promise((resolve) => setTimeout(resolve, 500));
        setLoadingState("Formulating optimal query for GPT-4o...");
        await new Promise((resolve) => setTimeout(resolve, 500));
        setLoadingState(
          "Establishing secure, encrypted connection to AI server..."
        );
        const response = await fetch("/api/chat", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ message: text }),
          signal,
        });

        if (response.ok) {
          setLoadingState(
            "Secure connection established. GPT-4o processing query..."
          );
          const reader = response.body?.getReader();
          if (reader) {
            let accumulatedText = "";
            let lastChunkTime = Date.now();

            while (true) {
              const { done, value } = await reader.read();
              if (done) break;

              const chunk = new TextDecoder().decode(value);
              const lines = chunk
                .split("\n")
                .filter((line) => line.trim() !== "");

              for (const line of lines) {
                const message = line.replace(/^data: /, "");
                if (message === "[DONE]") {
                  if (accumulatedTextRef.current) {
                    audioQueue.current.push(accumulatedTextRef.current);
                    setLoadingState(
                      "GPT-4o response complete. Initiating voice synthesis..."
                    );
                    playNextInQueue();
                  }
                  break;
                }
                try {
                  const parsed = JSON.parse(message);
                  setBotResponse((prev) => prev + parsed.response);
                  accumulatedText += parsed.response;

                  setLoadingState(
                    "Receiving and processing GPT-4o's real-time thoughts..."
                  );

                  // Check if it's time to queue the accumulated text for audio synthesis
                  if (
                    isPunctuationOrEndOfSentence(parsed.response) ||
                    accumulatedText.length > CHUNK_SIZE
                  ) {
                    audioQueue.current.push(accumulatedText);
                    accumulatedText = "";
                    setLoadingState(
                      "Queueing response segment for natural voice synthesis..."
                    );
                    playNextInQueue();
                  }
                } catch (error) {
                  console.error("Error parsing SSE message:", error);
                  setLoadingState(
                    "Encountered data parsing issue. Attempting to recover..."
                  );
                }
              }
            }
          }
        } else {
          setLoadingState(
            "Unable to reach GPT-4o. Verifying network stability..."
          );
          throw new Error("Failed to get bot response");
        }
      } catch (error) {
        if (error instanceof Error && error.name === "AbortError") {
          console.log("Request was aborted");
          setLoadingState(
            "AI response interrupted. Resetting for new conversation."
          );
        } else {
          console.error("Error getting bot response:", error);
          setLoadingState(
            "Unexpected error occurred. Initiating system reset. Please standby..."
          );
        }
      } finally {
        setTimeout(
          () =>
            setLoadingState(
              "System reset complete. Listening for new input..."
            ),
          2000
        );
      }
    },
    [playNextInQueue]
  );

  // Function to handle speech completion
  const handleSpeechCompletion = useCallback(
    async (text: string) => {
      if (text.trim()) {
        isGeneratingResponse.current = true;
        latestContextRef.current = text;

        currentRequestRef.current = new AbortController();

        try {
          await getBotResponse(text, currentRequestRef.current.signal);
        } catch (error) {
          if (error instanceof Error && error.name === "AbortError") {
            console.log("Request was aborted");
          } else {
            console.error("Error in getBotResponse:", error);
          }
        } finally {
          isGeneratingResponse.current = false;
        }
      }
    },
    [getBotResponse]
  );

  // Function to handle transcription events
  const onTranscript = useCallback(
    (data: LiveTranscriptionEvent) => {
      const { is_final: isFinal, speech_final: speechFinal } = data;
      let thisCaption = data.channel.alternatives[0].transcript;

      if (thisCaption !== "") {
        setCaption(thisCaption);
        stopEverything();
        interruptTimeout.current = setTimeout(() => {
          if (isFinal && speechFinal) {
            handleSpeechCompletion(thisCaption);
          }
        }, 1500);
      }

      if (isFinal && speechFinal) {
        clearTimeout(captionTimeout.current);
        captionTimeout.current = setTimeout(() => {
          setCaption(undefined);
          clearTimeout(captionTimeout.current);
        }, 3000);
      }
    },
    [stopEverything, handleSpeechCompletion]
  );

  // Effect to set up microphone and Deepgram connection
  useEffect(() => {
    if (!microphone || !connection) return;

    const onData = (e: BlobEvent) => {
      if (e.data.size > 0) {
        connection?.send(e.data);
      }
    };

    if (connectionState === LiveConnectionState.OPEN) {
      connection.addListener(LiveTranscriptionEvents.Transcript, onTranscript);
      microphone.addEventListener(MicrophoneEvents.DataAvailable, onData);
      startMicrophone();
    }

    return () => {
      connection.removeListener(
        LiveTranscriptionEvents.Transcript,
        onTranscript
      );
      microphone.removeEventListener(MicrophoneEvents.DataAvailable, onData);
      clearTimeout(captionTimeout.current);
    };
  }, [connectionState, connection, microphone, onTranscript, startMicrophone]);

  // Effect to manage keep-alive interval for Deepgram connection
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

  // Function to play audio
  const playAudio = async (text: string) => {
    setLoadingState("Initiating advanced voice synthesis via ElevenLabs...");
    const botVoiceResponse = await getElevenLabsResponse(text);
    setLoadingState("Voice data received. Optimizing for seamless playback...");
    const arrayBuffer = await botVoiceResponse.arrayBuffer();

    setLoadingState("Decoding and processing audio data...");
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext ||
        (window as any).webkitAudioContext)();
    }

    const audioBuffer = await audioContextRef.current.decodeAudioData(
      arrayBuffer
    );
    audioBufferQueue.current.push(audioBuffer);

    if (!isPlayingRef.current) {
      setLoadingState(
        "Audio processing complete. Initiating playback sequence..."
      );
      playNextAudioBuffer();
    }
  };

  // Function to play the next audio buffer in the queue
  const playNextAudioBuffer = () => {
    if (audioBufferQueue.current.length === 0) {
      isPlayingRef.current = false;
      setLoadingState(
        "Audio playback complete. Preparing for next interaction..."
      );
      setTimeout(
        () =>
          setLoadingState("Ready and listening. Awaiting your next query..."),
        2000
      );
      return;
    }

    isPlayingRef.current = true;
    setLoadingState("Now playing: AI's synthesized voice response...");
    const audioBuffer = audioBufferQueue.current.shift()!;
    const source = audioContextRef.current!.createBufferSource();
    source.buffer = audioBuffer;
    source.connect(audioContextRef.current!.destination);
    audioSourceRef.current = source;

    source.onended = () => {
      playNextAudioBuffer();
    };

    source.start();
  };

  // Function to stop audio playback
  const stopAudio = () => {
    if (audioSourceRef.current) {
      setLoadingState("Halting current audio playback...");
      audioSourceRef.current.stop();
      audioSourceRef.current.onended = null;
    }
    audioBufferQueue.current = [];
    isPlayingRef.current = false;
    setLoadingState("Audio playback terminated. Resetting audio system...");
  };

  // Function to check if text ends with punctuation or is end of sentence
  const isPunctuationOrEndOfSentence = (text: string) => {
    return /[.!?]$/.test(text.trim());
  };

  // Function to get ElevenLabs voice response
  const getElevenLabsResponse = async (text: string) => {
    console.log("getElevenLabsResponse", text);
    const response = await fetch("/api/elevenlabs", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message: text,
        voice: "Alice",
      }),
    });

    const data = await response.blob();

    return data;
  };

  // Return object with all necessary functions and state
  return {
    caption,
    botResponse,
    connection,
    connectToDeepgram,
    connectionState,
    setupMicrophone,
    microphone,
    startMicrophone,
    microphoneState,
    onTranscript,
    loadingState,
  };
}
