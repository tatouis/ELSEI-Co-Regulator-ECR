'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function AdminLogs() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/logs?limit=100')
      .then(res => res.json())
      .then(data => {
        setLogs(data);
        setLoading(false);
      });
  }, []);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center text-slate-800">
      <div className="animate-pulse text-xl font-light tracking-widest text-indigo-600 uppercase italic">Sincronizando registros de eventos...</div>
    </div>
  );

  return (
    <div className="min-h-screen text-slate-900 p-8 font-sans selection:bg-indigo-500/10">
      <div className="max-w-7xl mx-auto pt-16">
        <header className="mb-12">
          <Link href="/admin" className="text-indigo-600 hover:text-indigo-700 font-bold mb-4 inline-block text-sm transition-all hover:translate-x-[-4px]">
            ← Volver a la Consola
          </Link>
          <h1 className="text-4xl font-black bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-indigo-600 mb-2">
            Registros del Sistema (Logs)
          </h1>
          <p className="text-slate-500 font-medium max-w-2xl">
            Trazabilidad completa de acciones, llamadas API y eventos del sistema en tiempo real.
          </p>
        </header>

        <section className="bg-white border border-slate-100 rounded-[32px] overflow-hidden shadow-2xl shadow-indigo-500/5 transition-all hover:shadow-indigo-500/10 mb-12">
          <div className="p-8 border-b border-slate-50 flex justify-between items-center">
            <h2 className="text-lg font-black flex items-center text-slate-800">
               <span className="w-2.5 h-2.5 rounded-full bg-indigo-600 mr-3 animate-pulse shadow-sm shadow-indigo-500"></span>
               Eventos Recientes
            </h2>
            <div className="flex space-x-2">
              {['moodle', 'gemini', 'system', 'auth'].map(cat => (
                <span key={cat} className="text-[10px] px-3 py-1.5 bg-slate-50 rounded-xl border border-slate-100 text-slate-400 uppercase font-black tracking-widest">
                  {cat}
                </span>
              ))}
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50/50 text-slate-400 text-[10px] uppercase tracking-[0.2em] font-black border-b border-slate-50">
                  <th className="px-8 py-5">Timestamp</th>
                  <th className="px-8 py-5">Categoría</th>
                  <th className="px-8 py-5">Nivel</th>
                  <th className="px-8 py-5">Mensaje</th>
                </tr>
              </thead>
              <tbody className="text-xs font-mono">
                {logs.map((log: any) => (
                  <tr key={log.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                    <td className="px-8 py-5 text-slate-400 font-medium">
                       {new Date(log.timestamp).toLocaleString()}
                    </td>
                    <td className="px-8 py-5">
                      <span className="text-indigo-600 font-bold uppercase tracking-tighter opacity-80">{log.category}</span>
                    </td>
                    <td className="px-8 py-5">
                      <span className={`px-2 py-1 rounded-lg text-[10px] font-black uppercase tracking-tight ${
                        log.level === 'error' ? 'bg-rose-50 text-rose-600' : 
                        log.level === 'warn' ? 'bg-amber-50 text-amber-600' : 
                        log.level === 'success' ? 'bg-emerald-50 text-emerald-600' : 
                        'bg-indigo-50 text-indigo-600'}`}>
                        {log.level}
                      </span>
                    </td>
                    <td className="px-8 py-5 text-slate-700 font-medium">
                      {log.message}
                    </td>
                  </tr>
                ))}
                {logs.length === 0 && (
                   <tr>
                     <td colSpan={4} className="px-6 py-12 text-center text-gray-500 italic">No hay registros disponibles en este momento.</td>
                   </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
}
