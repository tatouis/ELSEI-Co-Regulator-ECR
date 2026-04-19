'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { LayoutDashboard, Lock, User, ArrowRight } from 'lucide-react';
import { useSim } from '@/lib/simulationStore';
import ECRLogo from '@/components/ECRLogo';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useSim();
    const router = useRouter();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const success = await login(username, password);
            if (success) {
                // Determine redirect based on username until user role is fully returned from login
                const userLower = username.toLowerCase();
                if (userLower.includes('admin')) {
                    router.push('/admin');
                } else if (userLower.includes('instructor')) {
                    router.push('/instructor');
                } else {
                    router.push('/student');
                }
            } else {
                setError('Invalid username or password');
            }
        } catch (err) {
            setError('An error occurred during login');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden"
            style={{ background: 'linear-gradient(135deg, #eef2ff 0%, #f5f0ff 50%, #ecfeff 100%)' }}>

            {/* Background elements */}
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-violet-200/40 rounded-full blur-3xl animate-pulse" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-cyan-200/40 rounded-full blur-3xl animate-pulse" />

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-md relative z-10"
            >
                <div className="glass rounded-[40px] p-8 md:p-10 shadow-2xl border border-white/50">
                    {/* Header */}
                    <div className="text-center mb-10">
                        <div className="w-16 h-16 bg-white rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl shadow-violet-200 ring-4 ring-white/50 overflow-hidden">
                            <ECRLogo className="w-16 h-16" />
                        </div>
                        <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">ECR Portal</h1>
                        <p className="text-slate-500 mt-2 font-medium">ELSEI Co-Regulator System</p>
                    </div>

                    {error && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="bg-red-50 border border-red-100 text-red-600 p-4 rounded-2xl mb-6 text-sm font-medium flex items-center gap-3"
                        >
                            <span className="w-2 h-2 rounded-full bg-red-400" />
                            {error}
                        </motion.div>
                    )}

                    <form onSubmit={handleLogin} className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-700 ml-1">Username</label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <User className="h-5 w-5 text-slate-400 group-focus-within:text-violet-500 transition-colors" />
                                </div>
                                <input
                                    type="text"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    className="block w-full pl-11 pr-4 py-4 bg-white/60 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-violet-400 focus:border-transparent outline-none transition-all placeholder:text-slate-300 font-medium text-slate-700"
                                    placeholder="Enter your username"
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-700 ml-1">Password</label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <Lock className="h-5 w-5 text-slate-400 group-focus-within:text-violet-500 transition-colors" />
                                </div>
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="block w-full pl-11 pr-4 py-4 bg-white/60 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-violet-400 focus:border-transparent outline-none transition-all placeholder:text-slate-300 font-medium text-slate-700"
                                    placeholder="••••••••"
                                    required
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-bold py-4 rounded-2xl shadow-lg shadow-indigo-200 hover:shadow-indigo-300 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 group disabled:opacity-70"
                        >
                            {loading ? (
                                <div className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                <>
                                    Sign In
                                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                </>
                            )}
                        </button>
                    </form>

                    <div className="mt-10 pt-8 border-t border-slate-100 flex flex-col gap-4">
                        <div className="flex items-center gap-3">
                            <div className="flex -space-x-2">
                                <div className="w-8 h-8 rounded-full bg-violet-100 border-2 border-white flex items-center justify-center text-[10px] font-bold text-violet-600">6</div>
                                <div className="w-8 h-8 rounded-full bg-cyan-100 border-2 border-white flex items-center justify-center text-[10px] font-bold text-cyan-600">S</div>
                            </div>
                            <p className="text-xs text-slate-400 leading-relaxed italic">
                                Demo Environment: Connected to Master ELSEI database.
                            </p>
                        </div>
                    </div>
                </div>

                <p className="text-center mt-8 text-slate-400 text-xs font-medium">
                    &copy; 2026 ELSEI Co-Regulator &bull; ENS Tétouan
                </p>
            </motion.div>
        </div>
    );
}
