'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { Brain, Eye, Shield, Zap, Users, ArrowRight, BookOpen, Target, LogIn } from 'lucide-react';
import ECRLogo from '@/components/ECRLogo';

const FEATURES = [
  { icon: Brain, title: 'Cognitive Load Detection', desc: 'Real-time estimation of mental workload from behavioral signals.' },
  { icon: Eye, title: 'Attention Recovery', desc: 'Identifies focus drift and triggers gentle re-engagement prompts.' },
  { icon: Zap, title: 'Motivation Support', desc: 'Encouragement and reframing messages when engagement drops.' },
  { icon: Shield, title: 'Privacy First', desc: 'No biometrics. No keystroke logging. Only anonymized interaction patterns.' },
  { icon: Target, title: 'Non-Intrusive', desc: 'Max 1 intervention per 5 min. Never during quizzes. Always dismissible.' },
  { icon: BookOpen, title: 'Transparent AI', desc: 'Every suggestion includes a "Why am I seeing this?" explanation.' },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(160deg, #eef2ff 0%, #f5f0ff 50%, #ecfeff 100%)' }}>
      {/* Nav */}
      <nav className="sticky top-0 z-40 glass border-b border-white/30">
        <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-white rounded-xl flex items-center justify-center shadow-md overflow-hidden">
              <ECRLogo className="w-8 h-8" />
            </div>
            <div>
              <span className="text-sm font-bold gradient-text">ECR</span>
              <span className="hidden sm:block text-[10px] text-slate-500 -mt-0.5 leading-none">ELSEI Co-Regulator</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/login" className="gradient-primary text-white text-sm font-bold px-6 py-2 rounded-xl hover:opacity-90 transition-opacity shadow-lg shadow-violet-200">
              Access Portal
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden pb-24 pt-16">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-20 left-1/4 w-96 h-96 bg-violet-300/20 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-cyan-300/20 rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-4xl mx-auto px-4 text-center space-y-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
          >
            <div className="inline-flex items-center gap-2 bg-white/80 border border-violet-200 rounded-full px-4 py-1.5 mb-6 shadow-sm">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs font-medium text-slate-600">
                Master ELSEI · École Normale Supérieure, Tétouan
              </span>
            </div>

            <h1 className="text-5xl sm:text-6xl font-extrabold leading-tight tracking-tight">
              <span className="gradient-text">ELSEI</span>{' '}
              <span className="text-slate-800">Co-Regulator</span>
            </h1>
            <p className="mt-4 text-xl text-slate-600 font-light">
              AI for Self-Regulated Learning
            </p>
            <p className="mt-4 max-w-2xl mx-auto text-slate-500 leading-relaxed">
              A human-centered AI that monitors learning behavior and delivers lightweight
              metacognitive support — without generating content, without being intrusive.
            </p>
          </motion.div>

          <motion.div
            className="flex flex-col sm:flex-row gap-4 justify-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
          >
            <Link
              href="/login"
              className="group flex items-center justify-center gap-2 gradient-primary text-white font-bold px-10 py-4 rounded-2xl shadow-xl shadow-violet-500/30 hover:opacity-90 transition-all hover:scale-[1.02]"
            >
              <LogIn className="w-5 h-5" />
              Sign in to ECR
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </motion.div>

          <motion.div
            className="relative mx-auto max-w-4xl glass rounded-[40px] p-2 sm:p-4 shadow-2xl border border-white/60 overflow-hidden"
            initial={{ opacity: 0, y: 40, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ delay: 0.5, duration: 0.8 }}
          >
            {/* Interactive SVG Animation */}
            <div className="relative w-full aspect-[2/1] min-h-[300px] bg-slate-900/5 rounded-[32px] overflow-hidden flex items-center justify-center">
              <svg viewBox="0 0 800 400" className="w-full h-full drop-shadow-sm">
                <defs>
                  <linearGradient id="flowGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.2" />
                    <stop offset="50%" stopColor="#06b6d4" stopOpacity="0.8" />
                    <stop offset="100%" stopColor="#10b981" stopOpacity="0.2" />
                  </linearGradient>
                  <linearGradient id="aiGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#6366f1" />
                    <stop offset="100%" stopColor="#8b5cf6" />
                  </linearGradient>
                  <filter id="glow">
                    <feGaussianBlur stdDeviation="4" result="coloredBlur" />
                    <feMerge>
                      <feMergeNode in="coloredBlur" />
                      <feMergeNode in="SourceGraphic" />
                    </feMerge>
                  </filter>
                </defs>

                {/* Connecting Lines */}
                <path d="M 150 200 C 300 200, 300 100, 400 100" fill="none" stroke="url(#flowGrad)" strokeWidth="4" strokeDasharray="8 8" className="animate-pulse" />
                <path d="M 150 200 C 300 200, 300 300, 400 300" fill="none" stroke="url(#flowGrad)" strokeWidth="4" strokeDasharray="8 8" className="animate-pulse" />
                <path d="M 400 100 C 500 100, 500 200, 650 200" fill="none" stroke="#e2e8f0" strokeWidth="3" />
                <path d="M 400 300 C 500 300, 500 200, 650 200" fill="none" stroke="#e2e8f0" strokeWidth="3" />

                {/* Data Packets Animation */}
                <circle cx="0" cy="0" r="4" fill="#06b6d4" filter="url(#glow)">
                  <animateMotion dur="3s" repeatCount="indefinite" path="M 150 200 C 300 200, 300 100, 400 100" />
                </circle>
                <circle cx="0" cy="0" r="4" fill="#8b5cf6" filter="url(#glow)">
                  <animateMotion dur="2.5s" repeatCount="indefinite" path="M 150 200 C 300 200, 300 300, 400 300" />
                </circle>
                <circle cx="0" cy="0" r="5" fill="#10b981" filter="url(#glow)">
                  <animateMotion dur="4s" repeatCount="indefinite" path="M 400 100 C 500 100, 500 200, 650 200" />
                </circle>

                {/* Left Node: Student/Moodle */}
                <g transform="translate(150, 200)">
                  <circle cx="0" cy="0" r="45" fill="white" stroke="#e2e8f0" strokeWidth="2" className="shadow-lg" />
                  <circle cx="0" cy="0" r="35" fill="#f8fafc" />
                  <path d="M-15,-10 A15,15 0 1,1 15,-10 A15,15 0 1,1 -15,-10" fill="none" stroke="#64748b" strokeWidth="3" strokeLinecap="round" />
                  <path d="M-20,15 C-20,5 20,5 20,15" fill="none" stroke="#64748b" strokeWidth="3" strokeLinecap="round" />
                  <text x="0" y="65" textAnchor="middle" fill="#475569" fontSize="14" fontWeight="bold">Student Activity</text>
                  <text x="0" y="82" textAnchor="middle" fill="#94a3b8" fontSize="11">Moodle LMS</text>
                </g>

                {/* Top Node: Telemetry */}
                <g transform="translate(400, 100)">
                  <rect x="-60" y="-30" width="120" height="60" rx="16" fill="white" stroke="#e2e8f0" strokeWidth="2" />
                  <text x="0" y="-5" textAnchor="middle" fill="#0ea5e9" fontSize="13" fontWeight="bold">Telemetry</text>
                  <text x="0" y="12" textAnchor="middle" fill="#94a3b8" fontSize="10">Clicks, Time, Nav</text>
                </g>

                {/* Bottom Node: AI Inference */}
                <g transform="translate(400, 300)">
                  <rect x="-65" y="-35" width="130" height="70" rx="20" fill="url(#aiGrad)" className="shadow-lg" />
                  <text x="0" y="-8" textAnchor="middle" fill="white" fontSize="14" fontWeight="bold">AI Engine</text>
                  <text x="0" y="8" textAnchor="middle" fill="rgba(255,255,255,0.8)" fontSize="10">Cognitive Load</text>
                  <text x="0" y="22" textAnchor="middle" fill="rgba(255,255,255,0.8)" fontSize="10">&amp; Policy Rules</text>
                </g>

                {/* Right Node: Intervention */}
                <g transform="translate(650, 200)">
                  <circle cx="0" cy="0" r="50" fill="white" stroke="#10b981" strokeWidth="3" strokeDasharray="4 4" className="animate-[spin_20s_linear_infinite]" />
                  <circle cx="0" cy="0" r="40" fill="#ecfdf5" />
                  <path d="M-12,-5 L-4,3 L12,-10" fill="none" stroke="#10b981" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
                  <text x="0" y="70" textAnchor="middle" fill="#059669" fontSize="14" fontWeight="bold">Intervention</text>
                  <text x="0" y="86" textAnchor="middle" fill="#6ee7b7" fontSize="11">Metacognitive Prompt</text>
                </g>
              </svg>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features grid */}
      <section className="max-w-6xl mx-auto px-4 pb-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-slate-800">Designed for Learning</h2>
          <p className="text-slate-500 mt-2">Not for surveillance — for support.</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {FEATURES.map(({ icon: Icon, title, desc }, i) => (
            <motion.div
              key={title}
              className="glass rounded-3xl p-5 hover:shadow-lg transition-shadow"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.07 }}
            >
              <div className="w-10 h-10 gradient-primary rounded-2xl flex items-center justify-center mb-3 shadow-md">
                <Icon className="w-5 h-5 text-white" />
              </div>
              <h3 className="font-semibold text-slate-800 mb-1">{title}</h3>
              <p className="text-sm text-slate-500 leading-relaxed">{desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="glass border-t border-white/30 py-6">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-sm text-slate-500">
            Master ELSEI · Ecole Normale Superieure, Abdelmalek Essaadi University
          </p>
        </div>
      </footer>
    </div>
  );
}
