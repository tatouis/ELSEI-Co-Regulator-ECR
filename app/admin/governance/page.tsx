'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Database, UserCheck, BookOpen, FileCheck, AlertCircle, CheckCircle2, ChevronRight, Activity } from 'lucide-react';
import Navbar from '@/components/Navbar';

export default function DataGovernance() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/governance')
      .then(res => res.json())
      .then(result => {
        setData(result);
        setLoading(false);
      });
  }, []);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a0a0f] text-white font-sans">
      <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <div className="animate-pulse text-lg font-light tracking-widest text-blue-400">SINCRONIZANDO CON MOODLE...</div>
      </div>
    </div>
  );

  const statusColor = data?.moodleStatus === 'connected' ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30' : 'text-rose-400 bg-rose-500/10 border-rose-500/30';

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white font-sans selection:bg-blue-500/30">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 pt-24 pb-12">
        <header className="mb-12">
          <Link href="/admin" className="text-blue-400 hover:text-blue-300 font-bold mb-6 inline-flex items-center gap-2 text-sm transition-all hover:-translate-x-1">
            <ChevronRight className="w-4 h-4 rotate-180" /> Volver a la Consola
          </Link>
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
            <div>
              <h1 className="text-4xl font-black bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-cyan-500 mb-2 flex items-center gap-3">
                <Database className="w-8 h-8 text-blue-400" />
                Explorador de Datos (Moodle)
              </h1>
              <p className="text-slate-400 font-light max-w-2xl">
                Monitorea la sincronización directa con el LMS. Accede a los resultados de los estudiantes, logs de actividades, tareas y el estado de los cursos integrados.
              </p>
            </div>
            {/* Status indicators */}
            <div className="flex flex-col gap-2 min-w-[240px]">
                <div className={`px-4 py-2.5 rounded-2xl border flex items-center justify-between ${statusColor}`}>
                    <span className="text-xs font-bold uppercase tracking-wider flex items-center gap-2">
                        {data?.moodleStatus === 'connected' ? <CheckCircle2 className="w-4 h-4"/> : <AlertCircle className="w-4 h-4"/>}
                        Estado Conexión
                    </span>
                    <span className="text-sm font-black">{data?.moodleStatus === 'connected' ? 'ACTIVA' : 'ERROR'}</span>
                </div>
                <div className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl">
                    <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest mb-0.5">Endpoint API</p>
                    <p className="text-xs font-mono text-cyan-300 truncate">{data?.moodleUrl}</p>
                </div>
            </div>
          </div>
        </header>

        {data?.moodleStatus !== 'connected' ? (
             <div className="p-8 rounded-3xl bg-rose-500/10 border border-rose-500/30 text-center">
                 <AlertCircle className="w-12 h-12 text-rose-400 mx-auto mb-4" />
                 <h2 className="text-xl font-bold text-rose-200">No se pudo acceder a los datos</h2>
                 <p className="text-rose-400/80 mt-2 text-sm max-w-lg mx-auto">Revisa la configuración del token de servicio web en Moodle o asegúrate de que el servidor LMS responda correctamente.</p>
             </div>
        ) : (
            <div className="space-y-8">
                {/* Courses Row */}
                <section>
                    <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                        <BookOpen className="w-5 h-5 text-indigo-400" /> Cursos Activos
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {data.data.Courses.map((c: any) => (
                            <div key={c.id} className="glass p-5 rounded-2xl border border-white/10 relative overflow-hidden group">
                                <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/0 to-indigo-500/5 group-hover:to-indigo-500/10 transition-colors" />
                                <span className="absolute top-4 right-4 text-[10px] bg-indigo-500/20 text-indigo-300 font-mono px-2 py-1 rounded">ID: {c.id}</span>
                                <h3 className="text-lg font-bold text-white mb-1 pr-12 line-clamp-1">{c.fullname}</h3>
                                <p className="text-xs text-slate-400">{c.shortname}</p>
                                <div className="mt-4 pt-4 border-t border-white/10 flex justify-between items-center text-xs">
                                    <span className="text-slate-500 font-medium">Categoría ID {c.categoryid}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Alumnado y Actividad Reciente */}
                    <section className="glass rounded-3xl border border-white/10 overflow-hidden shadow-2xl flex flex-col">
                        <div className="p-5 border-b border-white/5 bg-white/[0.02]">
                            <h2 className="text-lg font-bold flex items-center gap-2">
                                <UserCheck className="w-5 h-5 text-emerald-400" /> Estudiantes Registrados
                            </h2>
                            <p className="text-xs text-slate-400 mt-1">Usuarios sincronizados desde el primer curso (Muestra top 10).</p>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-white/5 text-slate-400 text-[10px] uppercase tracking-widest">
                                    <tr>
                                        <th className="px-6 py-4 font-semibold">Alumno</th>
                                        <th className="px-6 py-4 font-semibold">Rol Moodle</th>
                                        <th className="px-6 py-4 font-semibold">Acceso ECR</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5 text-sm">
                                    {data.data.Students.map((s: any) => (
                                        <tr key={s.id} className="hover:bg-white/[0.02] transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="font-semibold text-slate-200">{s.fullname}</div>
                                                <div className="text-[10px] text-slate-500">Moodle ID: {s.id}</div>
                                            </td>
                                            <td className="px-6 py-4">
                                                {s.roles?.length ? s.roles.map((r:any) => (
                                                    <span key={r.roleid} className="inline-block bg-white/10 text-slate-300 text-[10px] px-2 py-0.5 rounded">{r.shortname}</span>
                                                )) : <span className="text-slate-500 text-xs italic">TBD</span>}
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-medium">
                                                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Validado
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                    {data.data.Students.length === 0 && (
                                        <tr><td colSpan={3} className="p-6 text-center text-slate-500 text-sm">No se pudieron recuperar estudiantes matriculados de la API de Moodle.</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </section>

                    {/* Actividades y Resultados */}
                    <section className="glass rounded-3xl border border-white/10 overflow-hidden shadow-2xl flex flex-col">
                        <div className="p-5 border-b border-white/5 bg-white/[0.02]">
                            <h2 className="text-lg font-bold flex items-center gap-2">
                                <FileCheck className="w-5 h-5 text-cyan-400" /> Tareas y Actividades del Curso
                            </h2>
                            <p className="text-xs text-slate-400 mt-1">Extraído del reporte de calificaciones general.</p>
                        </div>
                        <div className="flex-1 p-5 overflow-auto">
                            {data.data.Grades.length > 0 ? (
                                <div className="space-y-3">
                                    {data.data.Grades.map((g: any) => (
                                        <div key={g.id} className="p-4 rounded-xl border border-white/5 bg-black/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                            <div className="flex items-start gap-3">
                                                <div className="mt-1 w-8 h-8 rounded-lg bg-cyan-500/10 flex items-center justify-center text-cyan-400">
                                                    <Activity className="w-4 h-4" />
                                                </div>
                                                <div>
                                                    <h4 className="font-bold text-sm text-slate-200">{g.itemname || `Actividad ID ${g.id}`}</h4>
                                                    <p className="text-[10px] text-slate-500 uppercase tracking-wider">{g.itemmodule || g.itemtype}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded-lg border border-white/10">
                                                <span className="text-xs text-slate-400">Peso en curso:</span>
                                                <span className="text-sm font-bold text-white">{g.weightformatted || 'N/A'}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="h-full min-h-[200px] flex flex-col items-center justify-center text-slate-500 text-sm border-2 border-dashed border-white/10 rounded-xl p-6 text-center">
                                    <FileCheck className="w-8 h-8 mb-2 opacity-50" />
                                    No hay tareas, actividades creadas o datos de calificaciones expuestos en el curso sincronizado en Moodle.
                                </div>
                            )}
                        </div>
                    </section>
                </div>
            </div>
        )}
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
