'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { GraduationCap, LayoutDashboard, Users, Settings } from 'lucide-react';

const NAV_ITEMS = [
    { href: '/student', label: 'Student View', icon: LayoutDashboard },
    { href: '/instructor', label: 'Instructor', icon: Users },
];

export default function Navbar() {
    const path = usePathname();

    return (
        <nav className="sticky top-0 z-40 glass border-b border-white/30 shadow-sm">
            <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
                {/* Logo */}
                <Link href="/" className="flex items-center gap-2.5 group">
                    <div className="w-8 h-8 gradient-primary rounded-xl flex items-center justify-center shadow-md">
                        <GraduationCap className="w-4 h-4 text-white" />
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
                    {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
                        const active = path === href;
                        return (
                            <Link
                                key={href}
                                href={href}
                                className={`relative flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-medium transition-colors ${active
                                        ? 'text-violet-700'
                                        : 'text-slate-600 hover:text-violet-600 hover:bg-violet-50'
                                    }`}
                            >
                                {active && (
                                    <motion.div
                                        className="absolute inset-0 rounded-xl bg-violet-100"
                                        layoutId="navPill"
                                        transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                                    />
                                )}
                                <Icon className="w-3.5 h-3.5 relative z-10" />
                                <span className="relative z-10 hidden sm:inline">{label}</span>
                            </Link>
                        );
                    })}
                </div>

                {/* ENS badge */}
                <div className="hidden md:flex items-center gap-2 text-xs text-slate-500">
                    <div className="w-5 h-5 rounded-full gradient-primary flex items-center justify-center">
                        <span className="text-white text-[8px] font-bold">ENS</span>
                    </div>
                    <span>Master ELSEI</span>
                </div>
            </div>
        </nav>
    );
}
