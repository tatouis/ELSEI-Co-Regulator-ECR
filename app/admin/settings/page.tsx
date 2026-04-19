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
    <div className="min-h-screen flex items-center justify-center bg-[#0a0a0f] text-white">
      <div className="animate-pulse text-lg font-light tracking-widest text-emerald-400 uppercase">Cargando Configuración...</div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white font-sans selection:bg-emerald-500/30">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 pt-24 pb-12">
        <header className="mb-12">
          <Link href="/admin" className="text-emerald-400 hover:text-emerald-300 font-bold mb-6 inline-flex items-center gap-2 text-sm transition-all hover:-translate-x-1">
            <ChevronRight className="w-4 h-4 rotate-180" /> Volver a la Consola
          </Link>
          <h1 className="text-4xl font-black bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-cyan-500 mb-2 flex items-center gap-3">
            <Settings className="w-8 h-8 text-emerald-400" />
            Configuración Global
          </h1>
          <p className="text-slate-400 font-light">
            Gestiona las credenciales del sistema y la integración con servicios externos como Moodle y Gemini AI.
          </p>
        </header>

        <div className="grid grid-cols-1 gap-8">
          <form onSubmit={handleSave} className="space-y-6">
            {/* Moodle Configuration Card */}
            <section className="glass rounded-3xl border border-white/10 p-8 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 p-6 opacity-5 pointer-events-none">
                    <Database className="w-32 h-32 text-white" />
                </div>
                
                <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                    <Globe className="w-5 h-5 text-blue-400" /> Integración con Moodle (LMS)
                </h2>

                <div className="space-y-6 relative z-10">
                    <div className="space-y-2">
                        <label className="text-xs font-black uppercase tracking-widest text-slate-500 ml-1">URL del Sitio Moodle</label>
                        <input 
                            type="url"
                            value={config.moodle_url}
                            onChange={e => setConfig({...config, moodle_url: e.target.value})}
                            placeholder="https://tu-moodle.com"
                            className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all font-mono text-sm"
                        />
                        <p className="text-[10px] text-slate-500 mt-1">La URL base de tu instalación de Moodle (ej: https://lms.ejemplo.com).</p>
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-black uppercase tracking-widest text-slate-500 ml-1">Token de Servicio Web</label>
                        <div className="relative">
                            <input 
                                type="password"
                                value={config.moodle_token}
                                onChange={e => setConfig({...config, moodle_token: e.target.value})}
                                placeholder="Ingresa el token de Moodle"
                                className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all font-mono text-sm"
                            />
                            <Key className="absolute right-6 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600" />
                        </div>
                        <p className="text-[10px] text-slate-500 mt-1">Token obtenido en 'Administración del sitio &gt; Plugins &gt; Servicios web &gt; Tokens'.</p>
                    </div>

                    <div className="pt-4 flex items-center gap-4">
                        <button 
                            type="button"
                            onClick={testConnection}
                            disabled={testStatus === 'testing' || !config.moodle_url}
                            className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-xs font-bold hover:bg-white/10 transition-all disabled:opacity-50"
                        >
                            {testStatus === 'testing' ? <RefreshCw className="w-3 h-3 animate-spin" /> : <RefreshCw className="w-3 h-3" />}
                            Probar Conexión
                        </button>
                        
                        {testStatus === 'success' && (
                            <span className="text-[10px] text-emerald-400 font-bold flex items-center gap-1">
                                <CheckCircle2 className="w-3 h-3" /> Conexión Exitosa
                            </span>
                        )}
                        {testStatus === 'error' && (
                            <div className="flex flex-col gap-1">
                                <span className="text-[10px] text-rose-400 font-bold flex items-center gap-1">
                                    <AlertCircle className="w-3 h-3" /> Error de Conexión
                                </span>
                                <span className="text-[9px] text-rose-300/70 font-mono ml-4">{testError}</span>
                            </div>
                        )}
                    </div>
                </div>
            </section>

            {/* AI Configuration Card */}
            <section className="glass rounded-3xl border border-white/10 p-8 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 p-6 opacity-5 pointer-events-none">
                    <Shield className="w-32 h-32 text-white" />
                </div>

                <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                    <Key className="w-5 h-5 text-amber-400" /> Inteligencia Artificial (Gemini)
                </h2>

                <div className="space-y-2 relative z-10">
                    <label className="text-xs font-black uppercase tracking-widest text-slate-500 ml-1">Google Gemini API Key</label>
                    <input 
                        type="password"
                        value={config.gemini_api_key}
                        onChange={e => setConfig({...config, gemini_api_key: e.target.value})}
                        placeholder="Ingresa tu API Key de Gemini"
                        className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50 transition-all font-mono text-sm"
                    />
                </div>
            </section>

            {/* Action Bar */}
            <div className="flex flex-col md:flex-row items-center justify-between gap-4 py-4">
                <div className="flex-1">
                    {message.text && (
                        <div className={`px-4 py-2 rounded-xl text-xs font-bold border flex items-center gap-2 ${
                            message.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'bg-rose-500/10 border-rose-500/30 text-rose-400'
                        }`}>
                            {message.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                            {message.text}
                        </div>
                    )}
                </div>
                <button 
                    type="submit"
                    disabled={saving}
                    className="w-full md:w-auto px-8 py-4 bg-gradient-to-r from-emerald-500 to-cyan-600 rounded-2xl font-black text-sm shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/40 transition-all flex items-center justify-center gap-2 disabled:opacity-50 active:scale-95"
                >
                    {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    GUARDAR CONFIGURACIÓN
                </button>
            </div>
          </form>
        </div>
      </div>
      <style jsx global>{`
        .glass {
          background: rgba(255, 255, 255, 0.02);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
        }
      `}</style>
    </div>
  );
}
