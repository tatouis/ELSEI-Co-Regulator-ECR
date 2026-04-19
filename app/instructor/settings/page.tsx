'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Navbar from '@/components/Navbar';
import { Settings, Server, Brain, Save, ArrowLeft, RefreshCw, Key, ShieldCheck, Database, Eye, EyeOff, CheckCircle, AlertTriangle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useSim } from '@/lib/simulationStore';

export default function InstructorSettings() {
    const router = useRouter();
    const [geminiKey, setGeminiKey] = useState('');
    const [moodleUrl, setMoodleUrl] = useState('');
    const [moodleToken, setMoodleToken] = useState('');
    const [showMoodleToken, setShowMoodleToken] = useState(false);
    const [showGeminiKey, setShowGeminiKey] = useState(false);
    const [moodleTestResult, setMoodleTestResult] = useState<{status: 'idle'|'testing'|'success'|'error', msg?: string}>({status: 'idle'});
    const [loading, setLoading] = useState(false);
    const [saved, setSaved] = useState(false);
    const [envConfig, setEnvConfig] = useState<any>(null);
    const { user, refreshMoodleData, setUserData } = useSim();

    useEffect(() => {
        if (!user) return;
        setGeminiKey(user.geminiKey || '');
        setMoodleUrl(user.moodleUrl || '');
        setMoodleToken(user.moodleToken || '');

        // Check server-side env config
        fetch('/api/config')
            .then(res => res.json())
            .then(data => setEnvConfig(data))
            .catch(err => console.error("Failed to check server config", err));
    }, [user]);

    const handleTestMoodle = async () => {
        setMoodleTestResult({status: 'testing'});
        try {
            const queryParams = new URLSearchParams();
            if (moodleUrl) queryParams.append('url', moodleUrl);
            if (moodleToken) queryParams.append('token', moodleToken);

            const res = await fetch(`/api/moodle/test?${queryParams.toString()}`);
            const data = await res.json();
            if (data.success && data.siteInfo) {
                setMoodleTestResult({status: 'success', msg: `Connected to: ${data.siteInfo.sitename}`});
            } else {
                setMoodleTestResult({status: 'error', msg: data.error || 'Connection failed.'});
            }
        } catch (error: any) {
            setMoodleTestResult({status: 'error', msg: 'Network error while testing connection.'});
        }
    };

    const handleSave = async () => {
        if (!user?.id) return;
        setLoading(true);

        try {
            const res = await fetch('/api/user/settings', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId: user.id,
                    moodleUrl,
                    moodleToken,
                    geminiKey
                })
            });

            const data = await res.json();
            if (data.success && data.user) {
                // Update global store (updates state and localStorage)
                setUserData(data.user);
                
                // Re-sync Moodle real data instantly
                await refreshMoodleData();
                
                setSaved(true);
                setTimeout(() => setSaved(false), 3000);
            } else {
                alert(data.message || 'Failed to save settings');
            }
        } catch (error) {
            console.error('Save error:', error);
            alert('Network error while saving settings');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen" style={{ background: 'linear-gradient(135deg, #eef2ff 0%, #f5f0ff 50%, #ecfeff 100%)' }}>
            <Navbar />

            <div className="max-w-4xl mx-auto px-4 py-12">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-8"
                >
                    {/* Page Header */}
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <div>
                            <button
                                onClick={() => router.push('/instructor')}
                                className="flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-violet-600 transition-colors uppercase tracking-widest mb-2"
                            >
                                <ArrowLeft className="w-3 h-3" /> Dashboard
                            </button>
                            <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight flex items-center gap-3">
                                <Settings className="w-8 h-8 text-violet-600" />
                                System Configuration
                            </h1>
                            <p className="text-slate-500 mt-1 font-medium italic">Manage data sources, API keys, and platform behavior.</p>
                        </div>

                        <div className="bg-emerald-100 flex items-center gap-2 px-4 py-2 rounded-2xl border border-emerald-200">
                            <ShieldCheck className="w-4 h-4 text-emerald-700" />
                            <span className="text-xs font-bold text-emerald-700 uppercase">Secure Storage</span>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {/* Sidebar */}
                        <div className="space-y-2">
                            {[
                                { label: 'General Connectors', icon: Server, active: true },
                                { label: 'AI Policy Settings', icon: Brain, active: false, soon: true },
                                { label: 'Data Governance', icon: Database, active: false, soon: true },
                            ].map((item, i) => (
                                <button
                                    key={i}
                                    disabled={!item.active}
                                    className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl text-sm font-bold transition-all ${item.active
                                        ? 'bg-violet-600 text-white shadow-lg shadow-violet-200'
                                        : 'text-slate-400 bg-slate-50 border border-slate-100 cursor-not-allowed'
                                        }`}
                                >
                                    <div className="flex items-center gap-3">
                                        <item.icon className="w-4 h-4" />
                                        {item.label}
                                    </div>
                                    {item.soon && (
                                        <span className="text-[9px] uppercase tracking-wider font-extrabold px-2 py-0.5 rounded-md bg-slate-200 text-slate-500">
                                            Soon
                                        </span>
                                    )}
                                </button>
                            ))}
                        </div>

                        {/* Main Settings Panel */}
                        <div className="md:col-span-2 space-y-6">
                            <section className="glass rounded-[32px] p-8 border border-white shadow-xl shadow-slate-200/50 space-y-8">

                                {/* Moodle Section */}
                                <div className="space-y-6">
                                    <div className="flex items-center gap-3 pb-2 border-b border-slate-100">
                                        <div className="w-10 h-10 rounded-2xl bg-orange-50 flex items-center justify-center text-orange-600">
                                            <RefreshCw className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-slate-800">Moodle Integration</h3>
                                            <p className="text-[10px] text-slate-400 font-bold uppercase">Learning Management System</p>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold text-slate-700 ml-1">Platform URL</label>
                                            <div className="relative group">
                                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                                    <Database className="h-4 w-4 text-slate-400" />
                                                </div>
                                                <input
                                                    type="text"
                                                    value={moodleUrl}
                                                    onChange={(e) => setMoodleUrl(e.target.value)}
                                                    className="block w-full pl-10 pr-4 py-3 bg-slate-50/50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-violet-400 focus:border-transparent outline-none transition-all placeholder:text-slate-300 text-sm"
                                                    placeholder={envConfig?.moodleUrl || "https://moodle.your-uni.edu"}
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-xs font-bold text-slate-700 ml-1">REST API Token</label>
                                            <div className="relative group">
                                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                                    <Key className="h-4 w-4 text-slate-400" />
                                                </div>
                                                <input
                                                    type={showMoodleToken ? "text" : "password"}
                                                    value={moodleToken}
                                                    onChange={(e) => setMoodleToken(e.target.value)}
                                                    className="block w-full pl-10 pr-12 py-3 bg-slate-50/50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-violet-400 focus:border-transparent outline-none transition-all placeholder:text-slate-300 text-sm"
                                                    placeholder={envConfig?.moodleTokenMasked ? `Active: ${envConfig.moodleTokenMasked}` : "••••••••••••••••"}
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setShowMoodleToken(!showMoodleToken)}
                                                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-violet-600 transition-colors"
                                                >
                                                    {showMoodleToken ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                                </button>
                                            </div>
                                            <p className="text-[10px] text-slate-400 italic px-1">
                                                {moodleToken ? 'Local override active.' : envConfig?.moodleConfigured ? `System default detected: ${envConfig.moodleTokenMasked}` : 'Leave blank to use Simulated Mode (Master ELSEI Catalog).'}
                                            </p>
                                        </div>

                                        {/* Test Connection Button & Result */}
                                        <div className="flex flex-col gap-2 pt-2">
                                            <button 
                                                onClick={handleTestMoodle}
                                                disabled={moodleTestResult.status === 'testing'}
                                                className="self-start flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors disabled:opacity-50"
                                            >
                                                {moodleTestResult.status === 'testing' ? <RefreshCw className="w-3 h-3 animate-spin"/> : <Database className="w-3 h-3" />}
                                                Test Connection
                                            </button>
                                            
                                            {moodleTestResult.status === 'success' && (
                                                <div className="flex items-center gap-2 text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-2 rounded-lg border border-emerald-100 mt-1">
                                                    <CheckCircle className="w-4 h-4" />
                                                    {moodleTestResult.msg}
                                                </div>
                                            )}
                                            {moodleTestResult.status === 'error' && (
                                                <div className="flex items-center gap-2 text-xs font-bold text-rose-600 bg-rose-50 px-3 py-2 rounded-lg border border-rose-100 mt-1">
                                                    <AlertTriangle className="w-4 h-4" />
                                                    {moodleTestResult.msg}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Gemini Section */}
                                <div className="space-y-6 pt-4 border-t border-slate-100">
                                    <div className="flex items-center gap-3 pb-2 border-b border-slate-100">
                                        <div className="w-10 h-10 rounded-2xl bg-violet-50 flex items-center justify-center text-violet-600">
                                            <Brain className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-slate-800">Google Gemini AI</h3>
                                            <p className="text-[10px] text-slate-400 font-bold uppercase">Intervention Language Model</p>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold text-slate-700 ml-1">Gemini API Key</label>
                                            <div className="relative group">
                                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                                    <Key className="h-4 w-4 text-slate-400" />
                                                </div>
                                                <input
                                                    type={showGeminiKey ? "text" : "password"}
                                                    value={geminiKey}
                                                    onChange={(e) => setGeminiKey(e.target.value)}
                                                    className="block w-full pl-10 pr-12 py-3 bg-slate-50/50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-violet-400 focus:border-transparent outline-none transition-all placeholder:text-slate-300 text-sm"
                                                    placeholder={envConfig?.geminiConfigured ? `Active: ${envConfig.geminiKeyMasked}` : "AIzaSy..."}
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setShowGeminiKey(!showGeminiKey)}
                                                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-violet-600 transition-colors"
                                                >
                                                    {showGeminiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                                </button>
                                            </div>
                                            <p className="text-[10px] text-slate-400 italic px-1">
                                                {geminiKey ? 'Local override active.' : envConfig?.geminiConfigured ? `System default detected: ${envConfig.geminiKeyMasked}` : 'Requires a Gemini API Key.'}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                                    <button
                                        disabled={loading}
                                        onClick={handleSave}
                                        className="flex items-center gap-2 px-8 py-3 bg-violet-600 text-white rounded-2xl text-sm font-bold shadow-lg shadow-violet-200 hover:bg-violet-700 transition-all active:scale-95 disabled:opacity-70 group"
                                    >
                                        {loading ? (
                                            <RefreshCw className="w-4 h-4 animate-spin" />
                                        ) : saved ? (
                                            <ShieldCheck className="w-4 h-4" />
                                        ) : (
                                            <Save className="w-4 h-4 group-hover:scale-110 transition-transform" />
                                        )}
                                        {loading ? 'Saving Settings...' : saved ? 'Successfully Saved!' : 'Apply Configuration'}
                                    </button>
                                </div>
                            </section>

                            {/* Status Alert */}
                            {saved && (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="bg-emerald-50 border border-emerald-100 text-emerald-700 p-4 rounded-2xl text-xs font-bold flex items-center justify-center gap-3"
                                >
                                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                                    The ECR system is now synchronized with your new settings.
                                </motion.div>
                            )}
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
