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

import { useTranslation } from '@/lib/LanguageContext';

export default function AdminDashboard() {
    const { t } = useTranslation();
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
        <div className="min-h-screen flex items-center justify-center bg-white text-slate-800">
            <div className="flex flex-col items-center gap-6">
                <div className="w-14 h-14 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                <div className="animate-pulse text-xl font-black tracking-[0.3em] text-indigo-600 uppercase">ECR ADMIN CONSOLE</div>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen text-slate-900 font-sans selection:bg-indigo-500/10">
            <Navbar />
            
            <div className="max-w-7xl mx-auto px-4 pt-24 pb-12">
                {/* Header Section */}
                <header className="mb-12 flex flex-col lg:flex-row lg:items-end justify-between gap-10">
                    <div className="space-y-2">
                        <div className="flex items-center gap-3 text-indigo-600 mb-2">
                            <ShieldAlert className="w-5 h-5" />
                            <span className="text-[10px] font-black uppercase tracking-[0.2em]">System Overlord</span>
                        </div>
                        <h1 className="text-5xl font-black bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-indigo-600">
                            {t('admin.title')}
                        </h1>
                        <p className="text-slate-500 font-medium text-sm max-w-xl">
                            {t('admin.description')}
                        </p>
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full">
                        <AdminQuickLink href="/admin/prompts" icon={<Terminal className="w-6 h-6" />} label={t('nav.prompts')} color="indigo" description={t('admin.prompts.description')} />
                        <AdminQuickLink href="/admin/governance" icon={<Database className="w-6 h-6" />} label={t('nav.governance')} color="blue" description={t('admin.governance.title')} />
                        <AdminQuickLink href="/admin/logs" icon={<FileText className="w-6 h-6" />} label={t('nav.logs')} color="purple" description={t('admin.logs.description')} />
                    </div>
                </header>

                {/* Primary Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                    <StatCard title={t('admin.stats.activeUsers')} value={stats?.summary.totalUsers} icon={<Users className="w-5 h-5 text-indigo-600" />} trend="+2 hoy" />
                    <StatCard title="Active APIs" value={`${stats?.summary.activeApis}/${stats?.summary.totalApis}`} icon={<Zap className="w-5 h-5 text-emerald-600" />} isSuccess />
                    <StatCard title="API Usage (24h)" value={stats?.summary.usageCount24h} icon={<TrendingUp className="w-5 h-5 text-indigo-600" />} />
                    <StatCard title={t('admin.stats.systemHealth')} value={stats?.health.gemini === 'active' ? 'Optimal' : 'Error'} icon={<Activity className="w-5 h-5 text-rose-600" />} isCritical={stats?.health.gemini !== 'active'} />
                </div>

                {/* Analytics Row */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                    {/* Activity Heatmap Trend */}
                    <div className="lg:col-span-2 bg-white border border-slate-100 rounded-[2.5rem] p-8 shadow-2xl shadow-indigo-500/5 relative overflow-hidden group">
                        <div className="flex items-center justify-between mb-8">
                            <div>
                                <h3 className="text-xl font-black flex items-center gap-3 text-slate-800">
                                    State Trends <span className="text-[10px] bg-indigo-50 px-2 py-1 rounded-lg text-indigo-600 font-black tracking-widest uppercase">Real-time</span>
                                </h3>
                                <p className="text-xs text-slate-400 font-medium">Cognitive Load & Attention Detection Trends.</p>
                            </div>
                            <div className="flex gap-4">
                                <LegendItem color="#6366f1" label="Load" />
                                <LegendItem color="#10b981" label="Attention" />
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
                                    <CartesianGrid strokeDasharray="3 3" stroke="#00000005" vertical={false} />
                                    <XAxis dataKey="time" stroke="#00000030" fontSize={10} tickLine={false} axisLine={false} />
                                    <YAxis hide />
                                    <ReTooltip 
                                        contentStyle={{ backgroundColor: '#fff', border: '1px solid #00000008', borderRadius: '20px', fontSize: '12px', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)' }}
                                        itemStyle={{ color: '#1e293b', fontWeight: 'bold' }}
                                    />
                                    <Area type="monotone" dataKey="CL" stroke="#6366f1" fillOpacity={1} fill="url(#colorCL)" strokeWidth={3} />
                                    <Area type="monotone" dataKey="ATT" stroke="#10b981" fillOpacity={1} fill="url(#colorATT)" strokeWidth={3} />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Intervention Success Rate */}
                    <div className="bg-white border border-slate-100 rounded-[2.5rem] p-8 shadow-2xl shadow-indigo-500/5 flex flex-col">
                        <div className="mb-6">
                            <h3 className="text-xl font-black text-slate-800">IA Effectiveness</h3>
                            <p className="text-xs text-slate-400 font-medium italic">Accepted vs. Ignored.</p>
                        </div>
                        
                        <div className="flex-1 min-h-[220px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={analytics?.successData}
                                        cx="50%" cy="50%"
                                        innerRadius={70}
                                        outerRadius={95}
                                        paddingAngle={8}
                                        dataKey="value"
                                    >
                                        {analytics?.successData.map((entry: any, index: number) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <ReTooltip 
                                        contentStyle={{ backgroundColor: '#fff', border: '1px solid #00000008', borderRadius: '20px', fontSize: '10px', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                                    />
                                    <Legend iconType="circle" wrapperStyle={{ fontSize: '10px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.05em', paddingTop: '20px' }} />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>

                {/* Intelligence Row */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                    {/* Activity Feed */}
                    <div className="bg-white border border-slate-100 rounded-[2.5rem] p-8 shadow-2xl shadow-indigo-500/5 transition-all hover:shadow-indigo-500/10">
                        <h3 className="text-xl font-black mb-8 flex items-center gap-3 text-slate-800">
                            <Activity className="w-6 h-6 text-rose-600" /> Live Activity Audit
                        </h3>
                        <div className="space-y-4 max-h-[450px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-slate-200">
                            {analytics?.liveEvents.map((event: any) => (
                                <div key={event.id} className="flex gap-5 p-5 rounded-3xl bg-slate-50 border border-slate-100 group hover:border-indigo-200 transition-all shadow-sm hover:shadow-md">
                                    <div className="mt-1.5 w-2.5 h-2.5 rounded-full bg-indigo-600 animate-pulse shadow-sm shadow-indigo-500/50 shrink-0" />
                                    <div className="flex-1">
                                        <div className="flex justify-between items-start mb-1">
                                            <span className="text-sm font-black text-slate-800">{event.user}</span>
                                            <span className="text-[10px] text-slate-400 font-bold uppercase">{new Date(event.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                        </div>
                                        <p className="text-xs text-slate-500 font-medium mb-3 leading-relaxed">{event.description}</p>
                                        <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-xl shadow-sm ${
                                            event.status === 'ACCEPTED' ? 'bg-emerald-50 text-emerald-700' : 
                                            event.status === 'DISMISSED' ? 'bg-rose-50 text-rose-700' : 'bg-slate-100 text-slate-500'
                                        }`}>
                                            {event.status}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Engagement Leaderboard */}
                    <div className="bg-white border border-slate-100 rounded-[2.5rem] p-8 shadow-2xl shadow-emerald-500/5 transition-all hover:shadow-emerald-500/10">
                        <h3 className="text-xl font-black mb-8 flex items-center gap-3 text-slate-800">
                            <TrendingUp className="w-6 h-6 text-emerald-600" /> Engagement Ranking
                        </h3>
                        <div className="space-y-4">
                            {analytics?.leaderboard.map((student: any, idx: number) => (
                                <div key={student.id} className="flex items-center gap-5 p-5 rounded-3xl bg-slate-50 border border-transparent hover:bg-white hover:border-emerald-200 transition-all shadow-sm hover:shadow-md group">
                                    <div className="w-10 h-10 rounded-2xl bg-white flex items-center justify-center font-black text-slate-400 border border-slate-100 group-hover:text-emerald-600 transition-colors">
                                        #{idx + 1}
                                    </div>
                                    <div className="flex-1">
                                        <h4 className="text-sm font-black text-slate-800">{student.name}</h4>
                                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest italic">{student.interactions} IA Interventions</p>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-sm font-black text-indigo-600">{student.timeMinutes}m</div>
                                        <div className="text-[9px] text-slate-400 font-bold uppercase">Total Time</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* User Management Section */}
                <section className="bg-white border border-slate-100 rounded-[2.5rem] overflow-hidden shadow-2xl shadow-indigo-500/5 mb-12">
                    <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-slate-50/30">
                        <div>
                            <h2 className="text-2xl font-black flex items-center gap-4 text-slate-800">
                                <Users className="w-6 h-6 text-indigo-600" /> 
                                User Management
                            </h2>
                            <p className="text-xs text-slate-400 font-medium italic mt-1">Identities registered in the ECR system.</p>
                        </div>
                        <button className="px-6 py-3 bg-indigo-50 text-indigo-600 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-indigo-600 hover:text-white transition-all flex items-center gap-2">
                            View all <ChevronRight className="w-4 h-4" />
                        </button>
                    </div>
                    
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-slate-50 text-slate-400 text-[10px] uppercase tracking-[0.2em] font-black">
                                <tr>
                                    <th className="px-8 py-5">Identity</th>
                                    <th className="px-8 py-5 text-center">Role</th>
                                    <th className="px-8 py-5 text-right">Integration</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {stats?.users.map((u: any) => (
                                    <tr key={u.id} className="hover:bg-indigo-50/30 transition-all group">
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-4">
                                                <div className="w-11 h-11 rounded-2xl bg-indigo-50 flex items-center justify-center text-xs font-black text-indigo-600 border border-indigo-100 shadow-sm group-hover:bg-white transition-all">
                                                    {u.name.charAt(0)}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-black text-slate-800 transition-colors">{u.name}</p>
                                                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">@{u.username}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6 text-center">
                                            <span className={`inline-block px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-[0.1em] border shadow-sm ${
                                                u.role === 'ADMIN' ? 'bg-slate-900 border-slate-900 text-white' :
                                                u.role === 'INSTRUCTOR' ? 'bg-indigo-50 border-indigo-100 text-indigo-700' :
                                                'bg-emerald-50 border-emerald-100 text-emerald-700'
                                            }`}>
                                                {u.role}
                                            </span>
                                        </td>
                                        <td className="px-8 py-6 text-right">
                                            <div className="flex items-center justify-end gap-2 text-[10px] font-black uppercase tracking-tight text-emerald-600">
                                                <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-sm shadow-emerald-400 animate-pulse" />
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
                    background: rgba(255, 255, 255, 0.7);
                    backdrop-filter: blur(20px);
                    -webkit-backdrop-filter: blur(20px);
                }
            `}</style>
        </div>
    );
}

function StatCard({ title, value, icon, trend, isSuccess, isCritical }: any) {
    return (
        <div className="bg-white border border-slate-100 p-8 rounded-[2.5rem] hover:border-indigo-200 transition-all hover:bg-white shadow-2xl shadow-indigo-500/5 group relative overflow-hidden">
            <div className={`absolute top-0 right-0 w-32 h-32 blur-[60px] opacity-10 transition-opacity group-hover:opacity-20 ${isSuccess ? 'bg-emerald-500' : isCritical ? 'bg-rose-500' : 'bg-indigo-500'}`} />
            <div className="flex justify-between items-start mb-6 relative z-10">
                <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center border border-slate-100 group-hover:scale-110 transition-transform group-hover:bg-white shadow-sm">
                    {icon}
                </div>
                {trend && <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-xl uppercase tracking-widest shadow-sm">{trend}</span>}
            </div>
            <h3 className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] mb-2 relative z-10">{title}</h3>
            <div className={`text-4xl font-black relative z-10 tracking-tight ${isSuccess ? 'text-emerald-600' : isCritical ? 'text-rose-600' : 'text-slate-900'}`}>
                {value}
            </div>
        </div>
    );
}

function AdminQuickLink({ href, icon, label, color, description }: any) {
    const colors: any = {
        indigo: 'from-indigo-600 to-indigo-800 hover:shadow-indigo-500/40',
        blue: 'from-slate-900 to-slate-800 hover:shadow-slate-500/40',
        purple: 'from-indigo-800 to-indigo-950 hover:shadow-indigo-900/40',
    };
    return (
        <Link href={href} className={`flex flex-col gap-3 p-7 rounded-[2rem] bg-gradient-to-br ${colors[color] || ''} shadow-2xl hover:-translate-y-2 transition-all group w-full`}>
            <div className="flex items-center justify-between">
                <div className="bg-white/10 p-3 rounded-2xl text-white shadow-inner backdrop-blur-md">
                    {icon}
                </div>
                <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center group-hover:bg-white/20 transition-all">
                    <ChevronRight className="w-5 h-5 text-white group-hover:translate-x-1 transition-all" />
                </div>
            </div>
            <div className="mt-4">
                <h3 className="text-lg font-black text-white tracking-tight">{label}</h3>
                <p className="text-[11px] text-white/50 mt-1.5 leading-relaxed font-medium">{description}</p>
            </div>
        </Link>
    );
}

function LegendItem({ color, label }: any) {
    return (
        <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full shadow-sm" style={{ backgroundColor: color }} />
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</span>
        </div>
    );
}
