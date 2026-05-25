# Audicle Frontend 🎙️✨

The frontend repository for **Audicle**, an AI-powered meeting assistant that records, transcribes, and generates intelligent summaries and action items for your meetings.

## 📚 Documentation
For a deep dive into how the frontend is structured, state management, and real-time WebSocket implementations, please read the [Frontend Architecture Documentation](docs/ARCHITECTURE.md).

## 🚀 Features
- **Dashboard**: View all your scheduled, processing, and completed meetings at a glance.
- **Meeting Details**: Read full interactive transcripts synced with the meeting audio.
- **AI Summaries**: Instantly view AI-generated key points, decisions, and action items.
- **Calendar Integration**: Connect your Google Calendar to automatically schedule bots to join your meetings.
- **Real-time Notifications**: Get notified instantly via WebSockets when your meeting transcription is ready.

## 🛠 Tech Stack
- **Framework**: React.js (Vite)
- **Styling**: Tailwind CSS / Vanilla CSS
- **State Management**: Redux Toolkit
- **Routing**: React Router
- **Networking**: Axios, WebSockets

## 📦 Getting Started (Local Development)

### Prerequisites
- Node.js (v18+)
- npm or yarn

### Installation
1. Clone the repository and install dependencies:
   ```bash
   npm install
   ```
2. Create a `.env` file in the root directory:
   ```env
   VITE_API_URL=http://localhost
   VITE_API_VERSION=v1
   VITE_GOOGLE_CLIENT_ID=your_google_client_id
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```

## 🌐 Deployment
This project is configured to be deployed effortlessly on Vercel or Netlify. Make sure to update the `VITE_API_URL` to point to your production backend.
