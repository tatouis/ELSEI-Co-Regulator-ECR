'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
    PieChart, Pie, Cell, ResponsiveContainer, Tooltip as ReTooltip, Legend,
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip
} from 'recharts';
import { 
    LayoutDashboard, Database, FileText, Terminal, 
    TrendingUp, CheckCircle2, XCircle, Activity,
    ShieldAlert, ChevronRight, Zap, Users
} from 'lucide-react';
import Navbar from '@/components/Navbar';

const COLORS = ['#10b981', '#f43f5e', '#6366f1'];

export default function AdminDashboard() {
    const [stats, setStats] = useState<any>(null);
    const [analytics, setAnalytics] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        Promise.all([
            fetch('/api/admin/stats').then(res => res.json()),
            fetch('/api/admin/analytics').then(res => res.json())
        ]).then(([statsData, analyticsData]) => {
            setStats(statsData);
            setAnalytics(analyticsData);
            setLoading(false);
        }).catch(err => {
            console.error("Failed to load admin data:", err);
            setLoading(false);
        });
    }, []);

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-[#0a0a0f] text-white">
            <div className="flex flex-col items-center gap-4">
                <div className="w-12 h-12 border-4 border-violet-500 border-t-transparent rounded-full animate-spin" />
                <div className="animate-pulse text-xl font-light tracking-widest text-violet-400">ECR ADMIN CONSOLE</div>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-[#0a0a0f] text-white font-sans selection:bg-violet-500/30">
            <Navbar />
            
            <div className="max-w-7xl mx-auto px-4 pt-24 pb-12">
                {/* Header Section */}
                <header className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div className="space-y-1">
                        <div className="flex items-center gap-2 text-violet-400 mb-2">
                            <ShieldAlert className="w-5 h-5" />
                            <span className="text-xs font-bold uppercase tracking-[0.2em]">System Overlord</span>
                        </div>
                        <h1 className="text-4xl font-black bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-200 to-slate-500">
                            Dashboard Administrativo
                        </h1>
                        <p className="text-slate-400 font-light text-sm max-w-xl">
                            Monitorea el ecosistema de co-regulación, analiza la efectividad de la IA y gestiona el flujo de datos.
                        </p>
                    </div>
                    
                    <div className="flex flex-wrap gap-3">
                        <AdminQuickLink href="/admin/prompts" icon={<Terminal className="w-4 h-4" />} label="IA Prompts" color="indigo" />
                        <AdminQuickLink href="/admin/governance" icon={<Database className="w-4 h-4" />} label="Gobernanza" color="blue" />
                        <AdminQuickLink href="/admin/logs" icon={<FileText className="w-4 h-4" />} label="System Logs" color="purple" />
                    </div>
                </header>

                {/* Primary Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                    <StatCard title="Usuarios" value={stats?.summary.totalUsers} icon={<Users className="w-5 h-5 text-blue-400" />} trend="+2 hoy" />
                    <StatCard title="APIs Activas" value={`${stats?.summary.activeApis}/${stats?.summary.totalApis}`} icon={<Zap className="w-5 h-5 text-emerald-400" />} isSuccess />
                    <StatCard title="Uso API (24h)" value={stats?.summary.usageCount24h} icon={<TrendingUp className="w-5 h-5 text-indigo-400" />} />
                    <StatCard title="Salud Gemini" value={stats?.health.gemini === 'active' ? 'Óptima' : 'Error'} icon={<Activity className="w-5 h-5 text-rose-400" />} isCritical={stats?.health.gemini !== 'active'} />
                </div>

                {/* Analytics Row */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                    {/* Activity Heatmap Trend */}
                    <div className="lg:col-span-2 glass border border-white/5 rounded-3xl p-6 shadow-2xl relative overflow-hidden group">
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h3 className="text-lg font-bold flex items-center gap-2">
                                    Mapa de Calor de Actividad <span className="text-[10px] bg-white/10 px-1.5 py-0.5 rounded text-slate-400 font-mono tracking-tighter uppercase">Real-time</span>
                                </h3>
                                <p className="text-xs text-slate-400">Tendencias de Carga Cognitiva y Atención en las últimas sesiones.</p>
                            </div>
                            <div className="flex gap-4">
                                <LegendItem color="#6366f1" label="Carga Cognitiva" />
                                <LegendItem color="#10b981" label="Atención" />
                            </div>
                        </div>
                        
                        <div className="h-[280px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={analytics?.heatmapData}>
                                    <defs>
                                        <linearGradient id="colorCL" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                                            <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                                        </linearGradient>
                                        <linearGradient id="colorATT" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                                            <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                                    <XAxis dataKey="time" stroke="#ffffff30" fontSize={10} tickLine={false} axisLine={false} />
                                    <YAxis hide />
                                    <Tooltip 
                                        contentStyle={{ backgroundColor: '#111827', border: '1px solid #ffffff10', borderRadius: '12px', fontSize: '12px' }}
                                        itemStyle={{ color: '#fff' }}
                                    />
                                    <Area type="monotone" dataKey="CL" stroke="#6366f1" fillOpacity={1} fill="url(#colorCL)" strokeWidth={2} />
                                    <Area type="monotone" dataKey="ATT" stroke="#10b981" fillOpacity={1} fill="url(#colorATT)" strokeWidth={2} />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Intervention Success Rate */}
                    <div className="glass border border-white/5 rounded-3xl p-6 shadow-2xl flex flex-col">
                        <div className="mb-4">
                            <h3 className="text-lg font-bold">Efectividad de IA</h3>
                            <p className="text-xs text-slate-400">IntervencionesAceptadas vs. Ignoradas.</p>
                        </div>
                        
                        <div className="flex-1 min-h-[220px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={analytics?.successData}
                                        cx="50%" cy="50%"
                                        innerRadius={60}
                                        outerRadius={80}
                                        paddingAngle={5}
                                        dataKey="value"
                                    >
                                        {analytics?.successData.map((entry: any, index: number) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <ReTooltip 
                                        contentStyle={{ backgroundColor: '#111827', border: '1px solid #ffffff10', borderRadius: '12px', fontSize: '10px' }}
                                    />
                                    <Legend iconType="circle" wrapperStyle={{ fontSize: '10px', paddingTop: '20px' }} />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>

                {/* User Management Section */}
                <section className="glass border border-white/5 rounded-3xl overflow-hidden shadow-2xl">
                    <div className="p-6 border-b border-white/5 flex justify-between items-center bg-white/[0.02]">
                        <div>
                            <h2 className="text-xl font-bold flex items-center gap-2">
                                <Users className="w-5 h-5 text-slate-400" /> 
                                Gestión de Usuarios
                            </h2>
                            <p className="text-xs text-slate-500 mt-1">Identidades registradas en el sistema ECR.</p>
                        </div>
                        <button className="text-xs font-bold text-violet-400 hover:text-white transition-colors flex items-center gap-1">
                            Ver todos <ChevronRight className="w-3 h-3" />
                        </button>
                    </div>
                    
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-white/[0.01] text-slate-400 text-[10px] uppercase tracking-[0.2em]">
                                <tr>
                                    <th className="px-8 py-5 font-semibold">Identidad</th>
                                    <th className="px-8 py-5 font-semibold text-center">Rol</th>
                                    <th className="px-8 py-5 font-semibold text-right">Integración</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {stats?.users.map((u: any) => (
                                    <tr key={u.id} className="hover:bg-white/[0.02] transition-colors group">
                                        <td className="px-8 py-5">
                                            <div className="flex items-center gap-3">
                                                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-slate-700 to-slate-800 flex items-center justify-center text-xs font-bold ring-1 ring-white/10">
                                                    {u.name.charAt(0)}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-semibold text-slate-200 group-hover:text-white transition-colors">{u.name}</p>
                                                    <p className="text-[10px] text-slate-500">@{u.username}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-5 text-center">
                                            <span className={`inline-block px-2.5 py-0.5 rounded-lg text-[9px] font-black tracking-widest uppercase border ${
                                                u.role === 'ADMIN' ? 'bg-indigo-500/10 border-indigo-500/30 text-indigo-400' :
                                                u.role === 'INSTRUCTOR' ? 'bg-blue-500/10 border-blue-500/30 text-blue-400' :
                                                'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                                            }`}>
                                                {u.role}
                                            </span>
                                        </td>
                                        <td className="px-8 py-5 text-right">
                                            <div className="flex items-center justify-end gap-1.5 text-[10px] font-bold text-emerald-400">
                                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)] animate-pulse" />
                                                Cloud Sync
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </section>
            </div>
            
            <style jsx global>{`
                .glass {
                    background: rgba(255, 255, 255, 0.03);
                    backdrop-filter: blur(20px);
                    -webkit-backdrop-filter: blur(20px);
                }
            `}</style>
        </div>
    );
}

function StatCard({ title, value, icon, trend, isSuccess, isCritical }: any) {
    return (
        <div className="glass border border-white/5 p-6 rounded-3xl hover:border-white/10 transition-all hover:bg-white/[0.04] group relative overflow-hidden">
            <div className={`absolute top-0 right-0 w-24 h-24 blur-[60px] opacity-20 transition-opacity group-hover:opacity-40 ${isSuccess ? 'bg-emerald-500' : isCritical ? 'bg-rose-500' : 'bg-blue-500'}`} />
            <div className="flex justify-between items-start mb-4 relative z-10">
                <div className="w-10 h-10 rounded-2xl bg-white/5 flex items-center justify-center border border-white/10 group-hover:scale-110 transition-transform">
                    {icon}
                </div>
                {trend && <span className="text-[10px] font-bold text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded-full">{trend}</span>}
            </div>
            <h3 className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-1 relative z-10">{title}</h3>
            <div className={`text-3xl font-black relative z-10 ${isSuccess ? 'text-emerald-400' : isCritical ? 'text-rose-400' : 'text-white'}`}>
                {value}
            </div>
        </div>
    );
}

function AdminQuickLink({ href, icon, label, color }: any) {
    const colors: any = {
        indigo: 'hover:bg-indigo-500/20 hover:border-indigo-500/40 text-indigo-400',
        blue: 'hover:bg-blue-500/20 hover:border-blue-500/40 text-blue-400',
        purple: 'hover:bg-purple-500/20 hover:border-purple-500/40 text-purple-400',
    };
    return (
        <Link href={href} className={`flex items-center gap-2.5 px-4 py-2.5 rounded-2xl border border-white/10 bg-white/5 transition-all text-sm font-bold ${colors[color] || ''} group`}>
            {icon}
            {label}
            <ChevronRight className="w-3.5 h-3.5 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
        </Link>
    );
}

function LegendItem({ color, label }: any) {
    return (
        <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">{label}</span>
        </div>
    );
}
