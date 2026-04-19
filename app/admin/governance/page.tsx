'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
    Database, UserCheck, BookOpen, FileCheck, 
    AlertCircle, CheckCircle2, ChevronRight, Activity,
    Clock, MessageSquare, Target, User
} from 'lucide-react';
import Navbar from '@/components/Navbar';

export default function DataGovernance() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedStudent, setSelectedStudent] = useState<any>(null);

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
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Lateral Column: Courses & Summary */}
                <div className="lg:col-span-4 space-y-6">
                    <section>
                        <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                            <BookOpen className="w-5 h-5 text-indigo-400" /> Cursos Sincronizados
                        </h2>
                        <div className="space-y-3">
                            {data.data.Courses.map((c: any) => (
                                <div key={c.id} className="glass p-4 rounded-2xl border border-white/10 hover:border-indigo-500/30 transition-all group">
                                    <h3 className="text-sm font-bold text-white mb-1 line-clamp-1">{c.fullname}</h3>
                                    <div className="flex items-center justify-between text-[10px] text-slate-500">
                                        <span className="font-mono uppercase">{c.shortname}</span>
                                        <span>ID {c.id}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>

                    <section className="glass rounded-3xl border border-white/10 p-6">
                        <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                            <FileCheck className="w-5 h-5 text-cyan-400" /> Tareas Globales
                        </h2>
                        <div className="space-y-4">
                            {data.data.Grades.slice(0, 5).map((g: any) => (
                                <div key={g.id} className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center shrink-0">
                                        <Target className="w-4 h-4 text-slate-400" />
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-xs font-bold text-slate-200 truncate">{g.itemname || 'Actividad Unnamed'}</p>
                                        <p className="text-[9px] text-slate-500 uppercase">{g.itemmodule}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                </div>

                {/* Main Content: Student List & Detail */}
                <div className="lg:col-span-8 flex flex-col gap-8">
                    {/* Student List */}
                    <section className="glass rounded-3xl border border-white/10 overflow-hidden shadow-2xl">
                        <div className="p-5 border-b border-white/5 bg-white/[0.02] flex justify-between items-center">
                            <div>
                                <h2 className="text-lg font-bold flex items-center gap-2">
                                    <UserCheck className="w-5 h-5 text-emerald-400" /> Estudiantes en Curso
                                </h2>
                                <p className="text-xs text-slate-400 mt-1">Haz clic en un alumno para ver su log de actividad detallado.</p>
                            </div>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-white/5 text-slate-400 text-[10px] uppercase tracking-widest">
                                    <tr>
                                        <th className="px-6 py-4 font-semibold">Alumno</th>
                                        <th className="px-6 py-4 font-semibold">Tiempo ECR</th>
                                        <th className="px-6 py-4 font-semibold text-right">Acción</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5 text-sm">
                                    {data.data.Students.map((s: any) => (
                                        <tr key={s.id} 
                                            onClick={() => setSelectedStudent(s)}
                                            className={`cursor-pointer transition-all ${selectedStudent?.id === s.id ? 'bg-indigo-500/10' : 'hover:bg-white/[0.02]'}`}>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-[10px] font-bold border border-white/10 text-slate-400">
                                                        {s.fullname.charAt(0)}
                                                    </div>
                                                    <div>
                                                        <div className="font-semibold text-slate-200">{s.fullname}</div>
                                                        <div className="text-[10px] text-slate-500">ID Moodle: {s.id}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2 text-xs font-bold text-emerald-400">
                                                    <Clock className="w-3.5 h-3.5" />
                                                    {s.interactionTimeMinutes} min
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <button className="text-[10px] font-black uppercase text-indigo-400 hover:text-white transition-colors">Ver Log</button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </section>

                    {/* Student Detail View */}
                    {selectedStudent && (
                        <section className="glass rounded-3xl border border-indigo-500/30 p-6 shadow-2xl animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <div className="flex justify-between items-start mb-6">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-2xl bg-indigo-500 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20">
                                        <User className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-black text-white">{selectedStudent.fullname}</h3>
                                        <p className="text-xs text-indigo-400 font-medium">Auditoría Detallada de Actividad</p>
                                    </div>
                                </div>
                                <button 
                                    onClick={() => setSelectedStudent(null)}
                                    className="p-2 hover:bg-white/5 rounded-xl transition-colors text-slate-500 hover:text-white">
                                    <AlertCircle className="w-5 h-5 rotate-45" />
                                </button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                {/* Interaction Metrics */}
                                <div className="space-y-4">
                                    <h4 className="text-[10px] font-black uppercase text-slate-500 tracking-widest block">Métricas de Compromiso</h4>
                                    <div className="p-4 rounded-2xl bg-white/5 border border-white/5 space-y-4">
                                        <div>
                                            <p className="text-xs text-slate-400 mb-1">Tiempo de Uso</p>
                                            <p className="text-2xl font-black text-white">{selectedStudent.interactionTimeMinutes} <span className="text-xs font-normal text-slate-500">minutos</span></p>
                                        </div>
                                        <div className="pt-4 border-t border-white/5">
                                            <p className="text-xs text-slate-400 mb-1">Intervenciones IA</p>
                                            <p className="text-2xl font-black text-indigo-400">{selectedStudent.totalInterventions}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Activity Logs List */}
                                <div className="md:col-span-2 space-y-4">
                                    <h4 className="text-[10px] font-black uppercase text-slate-500 tracking-widest block">Log de Interacciones Recientes (ECR)</h4>
                                    <div className="space-y-2">
                                        {selectedStudent.activityLogs?.length > 0 ? (
                                            selectedStudent.activityLogs.map((log: any, idx: number) => (
                                                <div key={idx} className="p-3 rounded-xl bg-white/[0.02] border border-white/5 flex items-center justify-between group hover:bg-white/[0.04] transition-colors">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-2 h-2 rounded-full bg-indigo-500" />
                                                        <div>
                                                            <p className="text-xs font-bold text-slate-200">Gemini: {log.type}</p>
                                                            <p className="text-[9px] text-slate-500">{new Date(log.createdAt).toLocaleString()}</p>
                                                        </div>
                                                    </div>
                                                    <span className={`text-[9px] font-bold px-2 py-0.5 rounded ${log.reaction === 'ACCEPTED' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>
                                                        {log.reaction || 'SENT'}
                                                    </span>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="p-8 text-center text-slate-500 border-2 border-dashed border-white/5 rounded-2xl flex flex-col items-center gap-2">
                                                <MessageSquare className="w-6 h-6 opacity-30" />
                                                <p className="text-xs italic">No se registran intervenciones automáticas para este alumno todavía.</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </section>
                    )}
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
