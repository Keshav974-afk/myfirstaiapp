# Keshav AI

A beautiful, fully-featured AI chat application built with Expo and React Native.

## Features

- 🎨 Beautiful, production-ready UI/UX
- 🌓 Light/Dark mode with system preference support
- 📱 Cross-platform (iOS, Android, Web)
- 💬 Real-time chat with AI
- 🖼️ Image generation capabilities
- 📚 Built-in model library
- 🌐 Network status monitoring
- 🔄 Stream responses in real-time
- 📊 Chat history management
- ⚡️ Performance optimized

## Tech Stack

- [Expo](https://expo.dev/) - React Native framework
- [Expo Router](https://docs.expo.dev/router/introduction/) - File-based routing
- [React Native Reanimated](https://docs.swmansion.com/react-native-reanimated/) - Animations
- [React Native Gesture Handler](https://docs.swmansion.com/react-native-gesture-handler/) - Gesture handling
- [Lucide Icons](https://lucide.dev/) - Beautiful icons
- [KaTeX](https://katex.org/) - Math rendering
- [@expo-google-fonts/inter](https://github.com/expo/google-fonts) - Typography

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Expo CLI

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/keshav-ai.git
cd keshav-ai
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

## Environment Variables

Create a `.env` file in the root directory:

```env
EXPO_PUBLIC_API_URL=your_api_url
EXPO_PUBLIC_API_KEY=your_api_key
```

## Project Structure

```
keshav-ai/
├── app/                   # Application routes
│   ├── (tabs)/           # Tab-based routes
│   └── _layout.tsx       # Root layout
├── components/           # Reusable components
├── constants/           # App constants
├── hooks/              # Custom hooks
└── types/             # TypeScript types
```

## Features in Detail

### AI Chat
- Real-time chat interface
- Support for multiple AI models
- Streaming responses
- Message history
- Copy, share, and bookmark messages

### Image Generation
- Generate images from text
- View generated images gallery
- Save and share images

### Settings
- Theme customization
- API configuration
- Chat preferences
- Network status monitoring

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.