# 🗣️ SpeakVerse

SpeakVerse is an innovative open-source project that brings AI-powered conversations to life! 🚀 It seamlessly combines Deepgram for lightning-fast speech-to-text, ElevenLabs for ultra-realistic voice synthesis, and OpenAI's cutting-edge GPT-4o for intelligent, human-like dialogue.

## ✨ Features

- 🎙️ Real-time speech-to-text using Deepgram
- 🔊 High-quality text-to-speech with ElevenLabs
- 🧠 Intelligent conversation powered by OpenAI's GPT-4o
- ⚡ Smooth interactions with instant speech interruptions
- 📊 Visual audio feedback with a dynamic visualizer

## 🚀 Getting Started

### Prerequisites

- Node.js (version 14 or higher)
- npm or yarn

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/iamsrikanthnani/SpeakVerse.git
   cd SpeakVerse
   ```

2. Install dependencies:

   ```bash
   npm install
   # or
   yarn install
   ```

3. Set up environment variables:
   Rename `.env.example` to `.env.local` in the root directory and add your API keys:

   ```
   DEEPGRAM_API_KEY=your_deepgram_api_key
   ELEVENLABS_API_KEY=your_elevenlabs_api_key
   OPENAI_API_KEY=your_openai_api_key
   ```

4. Run the development server:

   ```bash
   npm run dev
   # or
   yarn dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) with your browser and start conversing! 🎉

## 🎭 Usage

1. 🎤 Allow microphone access when prompted by your browser.
2. 🗣️ Speak clearly into your microphone.
3. 📝 Watch as the app transcribes your speech in real-time.
4. 🤖 GPT-4o processes your input and generates a witty response.
5. 🔉 The response is converted to lifelike speech using ElevenLabs.
6. 👂 Listen to the AI's response through your speakers.

## 🛠️ Tech Stack

- [Next.js](https://nextjs.org/) - React framework for building the UI
- [Tailwind CSS](https://tailwindcss.com/) - For styling
- [Deepgram SDK](https://github.com/deepgram/deepgram-node-sdk) - For real-time speech recognition
- [ElevenLabs](https://github.com/elevenlabs/elevenlabs-node) - For high-quality text-to-speech
- [OpenAI API](https://github.com/openai/openai-node) - For GPT-4o language model integration

## 🤝 Contributing

We love contributions! Here's how you can help:

1. 🍴 Fork the repository
2. 🌿 Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. 💻 Code your magic
4. 🔍 Ensure your code follows the project's style and passes all tests
5. 📝 Commit your changes (`git commit -m 'Add some AmazingFeature'`)
6. 🚀 Push to the branch (`git push origin feature/AmazingFeature`)
7. 🎉 Open a Pull Request

For major changes, please open an issue first to discuss what you would like to change.

### Pull Request Guidelines

- Ensure your code follows the project's coding standards
- Update the README.md with details of changes to the interface, if applicable
- Increase the version numbers in any examples files and the README.md to the new version that this Pull Request would represent

## 📜 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Deepgram](https://deepgram.com/) for their awesome speech-to-text API
- [ElevenLabs](https://elevenlabs.io/) for the mind-blowing voice synthesis
- [OpenAI](https://openai.com/) for the incredible GPT-4o language model

## 📞 Contact

Srikanth Nani - [srikanthnani.com](https://srikanthnani.com) - [@truly_sn](https://twitter.com/truly_sn)

---

Happy coding! 🎈 May your conversations with AI be ever-engaging and your code ever-elegant!
