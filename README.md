# 🤖 AI Chat Application

A modern ChatGPT-like application with a **Next.js 14** frontend and **Python FastAPI** backend.

![Tech Stack](https://img.shields.io/badge/Next.js-14-black?logo=next.js) ![FastAPI](https://img.shields.io/badge/FastAPI-0.115-009688?logo=fastapi) ![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript) ![Python](https://img.shields.io/badge/Python-3.12-3776AB?logo=python)

## ✨ Features

- 🌊 **Real-time Streaming**: Server-Sent Events (SSE) for instant AI responses
- 🎨 **Gen-Z Aesthetics**: Neo-Brutalism + Glassmorphism design
- ⚡ **Optimistic Updates**: Messages appear instantly before API response
- 💫 **Breathing Glow**: Animated input when AI is thinking
- 🔄 **Type-Safe**: Pydantic schemas auto-generate TypeScript types

## 📁 Project Structure

```
ai-chat/
├── frontend/          # Next.js 14 (TypeScript)
│   ├── src/
│   │   ├── app/           # App Router pages
│   │   ├── components/    # React components
│   │   ├── hooks/         # Custom hooks
│   │   ├── stores/        # Zustand state
│   │   ├── lib/           # Utilities & API
│   │   └── types/         # TypeScript types
│   └── package.json
│
├── backend/           # Python FastAPI
│   ├── app/
│   │   ├── api/           # API endpoints
│   │   ├── schemas/       # Pydantic models
│   │   ├── services/      # AI service
│   │   └── main.py        # Entry point
│   ├── venv/              # Virtual environment
│   └── requirements.txt
│
└── .env.example       # Environment template
```

## 🚀 Quick Start

### Prerequisites

- **Node.js 20+** (for Next.js)
- **Python 3.10+** (for FastAPI)
- **OpenAI API Key** or **Anthropic API Key**

### 1. Clone and Setup

```bash
cd ai-chat

# Setup Backend
cd backend
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt

# Setup Frontend
cd ../frontend
npm install
```

### 2. Configure Environment

```bash
# Backend (backend/.env)
OPENAI_API_KEY=sk-your-key-here
# OR
ANTHROPIC_API_KEY=sk-ant-your-key-here
```

### 3. Run the Application

**Terminal 1 - Backend:**
```bash
cd backend
source venv/bin/activate
uvicorn app.main:app --reload --port 8000
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) 🎉

## 🔌 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/chat/stream` | Stream chat completion (SSE) |
| POST | `/api/v1/chat` | Non-streaming chat |
| GET | `/api/v1/conversations` | List conversations |
| POST | `/api/v1/conversations` | Create conversation |

## 🧪 Streaming Pipeline

```
User Input → Next.js → POST /chat/stream → FastAPI → OpenAI SDK
                                                ↓
UI Update ← Zustand Store ← SSE Parser ← StreamingResponse
```

## 🎨 Design System

- **Colors**: Purple gradients, dark mode first
- **Borders**: 2-4px black, offset shadows
- **Animations**: Framer Motion (spring physics)
- **Typography**: Geist Sans/Mono

## 📝 Development

```bash
# Generate TypeScript types from OpenAPI
./shared/scripts/generate-types.sh

# Run backend tests
cd backend && pytest

# Run frontend type check
cd frontend && npm run lint
```

## 🛠 Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | Next.js 14, TypeScript, Tailwind, Framer Motion, Zustand |
| Backend | Python, FastAPI, Pydantic, OpenAI SDK |
| Database | PostgreSQL (via Supabase) - coming soon |
| Auth | Supabase Auth - coming soon |

---

Built with 💜 by AI
