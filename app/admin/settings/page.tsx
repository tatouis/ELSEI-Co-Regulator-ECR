'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
    Settings, Database, Key, Shield, 
    Save, ChevronRight, AlertCircle, CheckCircle2,
    RefreshCw, Globe
} from 'lucide-react';
import Navbar from '@/components/Navbar';

export default function AdminSettings() {
  const [config, setConfig] = useState({
    moodle_url: '',
    moodle_token: '',
    gemini_api_key: ''
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [testStatus, setTestStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');
  const [testError, setTestError] = useState('');

  useEffect(() => {
    fetch('/api/admin/config')
      .then(res => res.json())
      .then(data => {
        setConfig({
          moodle_url: data.moodle_url || '',
          moodle_token: data.moodle_token || '',
          gemini_api_key: data.gemini_api_key || ''
        });
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage({ type: '', text: '' });

    try {
      const res = await fetch('/api/admin/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config)
      });

      if (res.ok) {
        setMessage({ type: 'success', text: 'Configuración actualizada correctamente.' });
      } else {
        const error = await res.json();
        setMessage({ type: 'error', text: `Error: ${error.error}` });
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Error al conectar con el servidor.' });
    } finally {
      setSaving(false);
    }
  };

  const testConnection = async () => {
    setTestStatus('testing');
    try {
      // We'll use the existing moodle test API if it exists or just try site info
      const res = await fetch('/api/moodle/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          url: config.moodle_url, 
          token: config.moodle_token === '********' ? undefined : config.moodle_token 
        })
      });
      
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
            setTestStatus('success');
            setTestError('');
        } else {
            setTestStatus('error');
            setTestError(data.error || 'Error desconocido');
        }
      } else {
        const errData = await res.json().catch(() => ({}));
        setTestStatus('error');
        setTestError(errData.error || `HTTP ${res.status}`);
      }
    } catch (err: any) {
      setTestStatus('error');
      setTestError(err.message || 'Fallo de red');
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center text-slate-800">
      <div className="animate-pulse text-lg font-light tracking-widest text-emerald-600 uppercase">Cargando Configuracin...</div>
    </div>
  );

  return (
    <div className="min-h-screen text-slate-900 font-sans selection:bg-emerald-500/10">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 pt-24 pb-12">
        <header className="mb-12">
          <Link href="/admin" className="text-emerald-600 hover:text-emerald-700 font-bold mb-6 inline-flex items-center gap-2 text-sm transition-all hover:-translate-x-1">
            <ChevronRight className="w-4 h-4 rotate-180" /> Volver a la Consola
          </Link>
          <h1 className="text-4xl font-black bg-clip-text text-transparent bg-gradient-to-r from-emerald-600 to-indigo-600 mb-2 flex items-center gap-3">
            <Settings className="w-8 h-8 text-emerald-600" />
            Configuracin Global
          </h1>
          <p className="text-slate-500 font-medium">
            Gestiona las credenciales del sistema y la integracin con servicios externos como Moodle y Gemini AI.
          </p>
        </header>

        <div className="grid grid-cols-1 gap-8">
          <form onSubmit={handleSave} className="space-y-6">
            {/* Moodle Configuration Card */}
            <section className="bg-white rounded-[40px] border border-slate-100 p-8 md:p-12 shadow-2xl shadow-indigo-500/5 relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-8 opacity-[0.03] pointer-events-none group-hover:opacity-[0.05] transition-opacity">
                    <Database className="w-48 h-48 text-indigo-900" />
                </div>
                
                <h2 className="text-xl font-black mb-8 flex items-center gap-3 text-slate-800">
                    <div className="w-10 h-10 rounded-2xl bg-indigo-50 flex items-center justify-center">
                        <Globe className="w-5 h-5 text-indigo-600" />
                    </div>
                    Integracin con Moodle (LMS)
                </h2>

                <div className="space-y-6 relative z-10">
                    <div className="space-y-4">
                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">URL del Sitio Moodle</label>
                        <input 
                            type="url"
                            value={config.moodle_url}
                            onChange={e => setConfig({...config, moodle_url: e.target.value})}
                            placeholder="https://tu-moodle.com"
                            className="w-full bg-slate-50 border border-slate-100 rounded-[20px] px-6 py-4 text-slate-900 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500/30 transition-all font-mono text-sm placeholder:text-slate-300"
                        />
                        <p className="text-[10px] text-slate-400 mt-1 italic">La URL base de tu instalacin de Moodle (ej: https://lms.ejemplo.com).</p>
                    </div>

                    <div className="space-y-4">
                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Token de Servicio Web</label>
                        <div className="relative">
                            <input 
                                type="password"
                                value={config.moodle_token}
                                onChange={e => setConfig({...config, moodle_token: e.target.value})}
                                placeholder="Ingresa el token de Moodle"
                                className="w-full bg-slate-50 border border-slate-100 rounded-[20px] px-6 py-4 text-slate-900 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500/30 transition-all font-mono text-sm placeholder:text-slate-300"
                            />
                            <Key className="absolute right-6 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                        </div>
                        <p className="text-[10px] text-slate-400 mt-1 italic">Token obtenido en 'Administracin del sitio &gt; Plugins &gt; Servicios web &gt; Tokens'.</p>
                    </div>

                    <div className="pt-6 flex items-center gap-6 border-t border-slate-50 mt-6">
                        <button 
                            type="button"
                            onClick={testConnection}
                            disabled={testStatus === 'testing' || !config.moodle_url}
                            className="flex items-center gap-2 px-6 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-black uppercase tracking-wider text-slate-600 hover:bg-slate-100 transition-all disabled:opacity-50 active:scale-95"
                        >
                            {testStatus === 'testing' ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
                            Probar Conexin
                        </button>
                        
                        {testStatus === 'success' && (
                            <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-100 animate-in fade-in zoom-in duration-300">
                                <CheckCircle2 className="w-4 h-4" />
                                <span className="text-[10px] font-black uppercase tracking-widest">Conexin Exitosa</span>
                            </div>
                        )}
                        {testStatus === 'error' && (
                            <div className="flex flex-col gap-1 animate-in slide-in-from-left-2 duration-300">
                                <span className="text-[10px] text-rose-600 font-black uppercase tracking-widest flex items-center gap-1">
                                    <AlertCircle className="w-3 h-3" /> Error de Conexin
                                </span>
                                <span className="text-[10px] text-rose-400 font-mono ml-4 max-w-xs">{testError}</span>
                            </div>
                        )}
                    </div>
                </div>
            </section>

            {/* AI Configuration Card */}
            <section className="bg-white rounded-[40px] border border-slate-100 p-8 md:p-12 shadow-2xl shadow-indigo-500/5 relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-8 opacity-[0.03] pointer-events-none group-hover:opacity-[0.05] transition-opacity">
                    <Shield className="w-48 h-48 text-indigo-900" />
                </div>

                <h2 className="text-xl font-black mb-8 flex items-center gap-3 text-slate-800">
                    <div className="w-10 h-10 rounded-2xl bg-amber-50 flex items-center justify-center">
                        <Key className="w-5 h-5 text-amber-600" />
                    </div>
                    Inteligencia Artificial (Gemini)
                </h2>

                <div className="space-y-4 relative z-10">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Google Gemini API Key</label>
                    <input 
                        type="password"
                        value={config.gemini_api_key}
                        onChange={e => setConfig({...config, gemini_api_key: e.target.value})}
                        placeholder="Ingresa tu API Key de Gemini"
                        className="w-full bg-slate-50 border border-slate-100 rounded-[20px] px-6 py-4 text-slate-900 focus:outline-none focus:ring-4 focus:ring-amber-500/10 focus:border-amber-500/30 transition-all font-mono text-sm placeholder:text-slate-300"
                    />
                </div>
            </section>

            {/* Action Bar */}
            <div className="flex flex-col md:flex-row items-center justify-between gap-6 py-8 border-t border-slate-100 mt-8">
                <div className="flex-1">
                    {message.text && (
                        <div className={`px-5 py-3 rounded-2xl text-xs font-black uppercase tracking-[0.1em] border flex items-center gap-3 animate-in fade-in slide-in-from-bottom-2 duration-300 ${
                            message.type === 'success' ? 'bg-emerald-50 border-emerald-100 text-emerald-700' : 'bg-rose-50 border-rose-100 text-rose-700'
                        }`}>
                            {message.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
                            {message.text}
                        </div>
                    )}
                </div>
                <button 
                    type="submit"
                    disabled={saving}
                    className="w-full md:w-auto px-10 py-5 bg-slate-900 text-white rounded-[24px] font-black text-sm shadow-xl shadow-slate-200 hover:bg-slate-800 transition-all flex items-center justify-center gap-3 disabled:opacity-50 active:scale-95 group"
                >
                    {saving ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5 group-hover:scale-110 transition-transform" />}
                    GUARDAR CONFIGURACIN
                </button>
            </div>
          </form>
        </div>
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
