# ELSEI Co-Regulator (ECR)

**AI for Self-Regulated Learning** — École Normale Supérieure (Abdelmalek Essaâdi University).

## 🚀 Getting Started

This project consists of a **Next.js frontend** and a **NestJS backend**.

### 1. Backend Setup
```bash
cd backend
npm install
npm run start:dev
```
The backend runs on `http://localhost:4000/api`. It simulates 8 learners and broadcasts their state via WebSockets.

### 2. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
The frontend runs on `http://localhost:3000`.

## 🧠 Core Features

- **Learner State Detection**: Estimates Cognitive Load, Attention, and Motivation.
- **Pedagogical Policy Engine**: Delivers interventions (pacing, reflection, etc.) based on state.
- **Student Dashboard**: Beautiful Glassmorphism UI with real-time state gauges.
- **Instructor Dashboard**: Executive analytics heatmap and attention timelines.
- **Simulation Mode**: Includes 4 learner profiles (Focused, Overloaded, Distracted, Disengaged).
- **Ethical AI**: Transparent explanations ("Why am I seeing this?") and full privacy controls.

## 🛠️ Tech Stack

- **Frontend**: Next.js 15, TypeScript, Tailwind CSS, Framer Motion, Recharts.
- **Backend**: NestJS, Socket.io, In-memory store.
- **Design**: Modern academic aesthetic with glassmorphism and subtle animations.

## 👥 Master ELSEI
Designed for the Master ELSEI program at ENS Tétouan.
