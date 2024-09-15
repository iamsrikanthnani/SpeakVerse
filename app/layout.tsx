import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import Providers from "./providers";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "SpeakVerse - AI-Powered Conversations",
  description:
    "SpeakVerse combines Deepgram for speech-to-text, ElevenLabs for realistic voice, and OpenAI's GPT-4o for real-time, human-like conversations.",
  keywords: [
    "speech-to-text",
    "text-to-speech",
    "AI",
    "conversation",
    "Deepgram",
    "ElevenLabs",
    "OpenAI",
    "GPT-4o",
  ],
  authors: [{ name: "Srikanth Nani", url: "https://srikanthnani.com" }],
  openGraph: {
    title: "SpeakVerse - AI-Powered Conversations",
    description:
      "Experience natural, lifelike dialogue with SpeakVerse's AI-powered conversation platform.",
    url: "https://github.com/iamsrikanthnani/SpeakVerse",
    siteName: "SpeakVerse",
    images: [
      {
        url: "https://raw.githubusercontent.com/iamsrikanthnani/SpeakVerse/master/app/og-image.png",
        width: 1200,
        height: 630,
        alt: "SpeakVerse - AI-Powered Conversations",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "SpeakVerse - AI-Powered Conversations",
    description:
      "Experience natural, lifelike dialogue with SpeakVerse's AI-powered conversation platform.",
    creator: "@truly_sn",
    images: [
      "https://raw.githubusercontent.com/iamsrikanthnani/SpeakVerse/master/app/og-image.png",
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <Providers>
        <body
          className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        >
          {children}
        </body>
      </Providers>
    </html>
  );
}
