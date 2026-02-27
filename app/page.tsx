'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { GraduationCap, Brain, Eye, Shield, Zap, Users, ArrowRight, BookOpen, Target } from 'lucide-react';

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
            <div className="w-8 h-8 gradient-primary rounded-xl flex items-center justify-center shadow-md">
              <GraduationCap className="w-4 h-4 text-white" />
            </div>
            <div>
              <span className="text-sm font-bold gradient-text">ECR</span>
              <span className="hidden sm:block text-[10px] text-slate-500 -mt-0.5 leading-none">ELSEI Co-Regulator</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/student" className="text-sm text-slate-600 hover:text-violet-600 font-medium transition-colors px-3 py-1.5">
              Student
            </Link>
            <Link href="/instructor" className="gradient-primary text-white text-sm font-medium px-4 py-1.5 rounded-xl hover:opacity-90 transition-opacity">
              Instructor
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
              href="/student"
              className="group flex items-center justify-center gap-2 gradient-primary text-white font-semibold px-8 py-3.5 rounded-2xl shadow-lg shadow-violet-500/30 hover:opacity-90 transition-opacity"
            >
              <GraduationCap className="w-4 h-4" />
              Student Dashboard
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              href="/instructor"
              className="flex items-center justify-center gap-2 bg-white border border-violet-200 text-violet-700 font-semibold px-8 py-3.5 rounded-2xl hover:bg-violet-50 transition-colors"
            >
              <Users className="w-4 h-4" />
              Instructor Analytics
            </Link>
          </motion.div>

          {/* Hero visual */}
          <motion.div
            className="relative mx-auto max-w-3xl glass rounded-3xl p-6 shadow-xl"
            initial={{ opacity: 0, y: 40, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ delay: 0.5, duration: 0.8 }}
          >
            <div className="grid grid-cols-3 gap-4">
              {[
                { label: 'Cognitive Load', value: 'Medium', color: 'text-amber-600', bg: 'bg-amber-50', icon: '🧠' },
                { label: 'Attention', value: 'High', color: 'text-emerald-600', bg: 'bg-emerald-50', icon: '👁️' },
                { label: 'Motivation', value: 'Medium', color: 'text-amber-600', bg: 'bg-amber-50', icon: '⚡' },
              ].map(({ label, value, color, bg, icon }) => (
                <div key={label} className={`${bg} rounded-2xl p-4 text-center`}>
                  <div className="text-2xl mb-1">{icon}</div>
                  <p className="text-xs text-slate-500">{label}</p>
                  <p className={`text-sm font-bold ${color}`}>{value}</p>
                </div>
              ))}
            </div>
            <div className="mt-4 p-4 rounded-2xl" style={{ background: 'linear-gradient(135deg, #7c3aed20, #06b6d420)' }}>
              <div className="flex items-start gap-3">
                <span className="text-xl">💭</span>
                <div>
                  <p className="text-xs font-semibold text-violet-700">Reflective Prompt</p>
                  <p className="text-sm text-slate-700 mt-0.5">
                    "Before continuing, can you summarize in one sentence what you've just learned?"
                  </p>
                </div>
              </div>
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
