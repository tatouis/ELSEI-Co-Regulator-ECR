'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Users, LogOut, LogIn, Settings, ShieldAlert, Terminal } from 'lucide-react';
import ECRLogo from './ECRLogo';
import StudentSelectorModal from './StudentSelectorModal';
import { useSim } from '@/lib/simulationStore';
import { useRouter } from 'next/navigation';

export default function Navbar() {
    const path = usePathname();
    const router = useRouter();
    const { user, logout } = useSim();
    const [isStudentModalOpen, setIsStudentModalOpen] = useState(false);

    const handleLogout = () => {
        logout();
        router.push('/login');
    };

    return (
        <>
            <nav className="sticky top-0 z-40 glass border-b border-white/30 shadow-sm">
                <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-2.5 group">
                        <div className="w-8 h-8 rounded-xl flex items-center justify-center shadow-md overflow-hidden bg-white">
                            <ECRLogo className="w-8 h-8" />
                        </div>
                        <div className="leading-tight">
                            <span className="text-sm font-bold gradient-text">ECR</span>
                            <span className="hidden sm:block text-[10px] text-slate-500 -mt-0.5">
                                ELSEI Co-Regulator
                            </span>
                        </div>
                    </Link>

                    {/* Nav links */}
                    <div className="flex items-center gap-1">
                        {user ? (
                            <>
                                {/* Instructor Dashboard */}
                                {user.role === 'instructor' && (
                                    <Link
                                        href="/instructor"
                                        className={`relative flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-medium transition-colors ${path === '/instructor'
                                            ? 'text-violet-700'
                                            : 'text-slate-600 hover:text-violet-600 hover:bg-violet-50'
                                            }`}
                                    >
                                        {path === '/instructor' && (
                                            <motion.div
                                                className="absolute inset-0 rounded-xl bg-violet-100"
                                                layoutId="navPill"
                                                transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                                            />
                                        )}
                                        <Users className="w-3.5 h-3.5 relative z-10" />
                                        <span className="relative z-10 hidden sm:inline">Overview</span>
                                    </Link>
                                )}

                                 {/* Admin Console */}
                                {user.role === 'admin' && (
                                    <div className="flex items-center gap-1">
                                        <Link
                                            href="/admin"
                                            className={`relative flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-medium transition-colors ${path === '/admin'
                                                ? 'text-purple-700'
                                                : 'text-slate-600 hover:text-purple-600 hover:bg-purple-50'
                                                }`}
                                        >
                                            <ShieldAlert className="w-3.5 h-3.5 relative z-10" />
                                            <span className="relative z-10 hidden sm:inline">Admin</span>
                                        </Link>
                                        <Link
                                            href="/admin/prompts"
                                            className={`relative flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-medium transition-colors ${path === '/admin/prompts'
                                                ? 'text-indigo-700'
                                                : 'text-slate-600 hover:text-indigo-600 hover:bg-indigo-50'
                                                }`}
                                        >
                                            <Terminal className="w-3.5 h-3.5 relative z-10" />
                                            <span className="relative z-10 hidden sm:inline text-xs">Prompts</span>
                                        </Link>
                                        <Link
                                            href="/admin/settings"
                                            className={`relative flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-medium transition-colors ${path === '/admin/settings'
                                                ? 'text-emerald-700'
                                                : 'text-slate-600 hover:text-emerald-600 hover:bg-emerald-50'
                                                }`}
                                        >
                                            <Settings className="w-3.5 h-3.5 relative z-10" />
                                            <span className="relative z-10 hidden sm:inline text-xs underline font-black">Configuración</span>
                                        </Link>
                                    </div>
                                )}
                                
                                {/* Settings */}
                                {user.role === 'instructor' && (
                                    <Link
                                        href="/instructor/settings"
                                        className={`relative flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-medium transition-colors ${path === '/instructor/settings'
                                            ? 'text-violet-700'
                                            : 'text-slate-600 hover:text-violet-600 hover:bg-violet-50'
                                            }`}
                                    >
                                        {path === '/instructor/settings' && (
                                            <motion.div
                                                className="absolute inset-0 rounded-xl bg-violet-100"
                                                layoutId="navPill"
                                                transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                                            />
                                        )}
                                        <Settings className="w-3.5 h-3.5 relative z-10" />
                                        <span className="relative z-10 hidden sm:inline">Settings</span>
                                    </Link>
                                )}

                                {/* Logout */}
                                <button
                                    onClick={handleLogout}
                                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-medium text-slate-600 hover:text-red-600 hover:bg-red-50 transition-colors ml-2"
                                >
                                    <LogOut className="w-3.5 h-3.5" />
                                    <span className="hidden sm:inline">Logout</span>
                                </button>
                            </>
                        ) : (
                            <Link
                                href="/login"
                                className="flex items-center gap-1.5 px-4 py-1.5 bg-violet-600 text-white rounded-xl text-sm font-bold shadow-lg shadow-violet-200 hover:bg-violet-700 transition-all active:scale-95"
                            >
                                <LogIn className="w-3.5 h-3.5" />
                                Login
                            </Link>
                        )}
                    </div>

                    {/* ENS badge */}
                    <div className="hidden md:flex items-center gap-2 text-xs text-slate-500">
                        <div className="w-5 h-5 rounded-full gradient-primary flex items-center justify-center">
                            <span className="text-white text-[8px] font-bold">ENS</span>
                        </div>
                        {user && <span className="font-bold text-slate-700">{user.username}</span>}
                        {!user && <span>Master ELSEI</span>}
                    </div>
                </div>
            </nav>
            <StudentSelectorModal isOpen={isStudentModalOpen} onClose={() => setIsStudentModalOpen(false)} />
        </>
    );
}
