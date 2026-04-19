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
    <div className="min-h-screen flex items-center justify-center bg-[#0a0a0f] text-white">
      <div className="animate-pulse text-xl font-light">Sincronizando registros de eventos...</div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white p-8 font-sans">
      <div className="max-w-7xl mx-auto pt-16">
        <header className="mb-12">
          <Link href="/admin" className="text-purple-400 hover:text-purple-300 mb-4 inline-block text-sm transition-all hover:translate-x-[-4px]">
            ← Volver a la Consola
          </Link>
          <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-500 mb-2">
            Registros del Sistema (Logs)
          </h1>
          <p className="text-gray-400 font-light max-w-2xl">
            Trazabilidad completa de acciones, llamadas API y eventos del sistema en tiempo real.
          </p>
        </header>

        <section className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
          <div className="p-6 border-b border-white/10 flex justify-between items-center bg-white/5">
            <h2 className="text-lg font-semibold flex items-center">
               <span className="w-2 h-2 rounded-full bg-blue-500 mr-2 animate-pulse"></span>
               Eventos Recientes
            </h2>
            <div className="flex space-x-2">
              {['moodle', 'gemini', 'system', 'auth'].map(cat => (
                <span key={cat} className="text-[10px] px-2 py-1 bg-white/10 rounded border border-white/5 text-gray-500 uppercase font-bold tracking-tighter">
                  {cat}
                </span>
              ))}
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="text-gray-500 text-[10px] uppercase tracking-widest border-b border-white/5">
                  <th className="px-6 py-4 font-bold">Timestamp</th>
                  <th className="px-6 py-4 font-bold">Categoría</th>
                  <th className="px-6 py-4 font-bold">Nivel</th>
                  <th className="px-6 py-4 font-bold">Mensaje</th>
                </tr>
              </thead>
              <tbody className="text-sm font-mono">
                {logs.map((log: any) => (
                  <tr key={log.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                    <td className="px-6 py-4 text-gray-500 text-xs">
                       {new Date(log.timestamp).toLocaleString()}
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-blue-400 opacity-80">{log.category}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`capitalize ${log.level === 'error' ? 'text-red-400' : log.level === 'warn' ? 'text-yellow-400' : log.level === 'success' ? 'text-green-400' : 'text-blue-200'}`}>
                        {log.level}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-300">
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
