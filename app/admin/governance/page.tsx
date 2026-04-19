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
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);
  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  const [showDictionary, setShowDictionary] = useState(false);

  useEffect(() => {
    setLoading(true);
    const url = selectedCourseId ? `/api/admin/governance?courseId=${selectedCourseId}` : '/api/admin/governance';
    fetch(url)
      .then(res => res.json())
      .then(result => {
        setData(result);
        setLoading(false);
      });
  }, [selectedCourseId]);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center text-slate-800 font-sans">
      <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <div className="animate-pulse text-lg font-light tracking-widest text-blue-400">SINCRONIZANDO CON MOODLE...</div>
      </div>
    </div>
  );

  const statusColor = data?.moodleStatus === 'connected' ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30' : 'text-rose-400 bg-rose-500/10 border-rose-500/30';

  return (
    <div className="min-h-screen text-slate-900 font-sans selection:bg-indigo-500/10">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 pt-24 pb-12">
        <header className="mb-12">
          <Link href="/admin" className="text-indigo-600 hover:text-indigo-700 font-bold mb-6 inline-flex items-center gap-2 text-sm transition-all hover:-translate-x-1">
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
                <div className={`px-4 py-2.5 rounded-2xl border flex items-center justify-between shadow-sm ${data?.moodleStatus === 'connected' ? 'bg-emerald-50 border-emerald-100 text-emerald-700' : 'bg-rose-50 border-rose-100 text-rose-700'}`}>
                    <span className="text-xs font-bold uppercase tracking-wider flex items-center gap-2">
                        {data?.moodleStatus === 'connected' ? <CheckCircle2 className="w-4 h-4"/> : <AlertCircle className="w-4 h-4"/>}
                        Estado Conexin
                    </span>
                    <span className="text-sm font-black">{data?.moodleStatus === 'connected' ? 'ACTIVA' : 'ERROR'}</span>
                </div>
                <div className="px-4 py-2 bg-white border border-slate-100 rounded-xl shadow-sm">
                    <p className="text-[10px] text-slate-400 uppercase font-bold tracking-widest mb-0.5">Endpoint API</p>
                    <p className="text-xs font-mono text-indigo-600 font-bold truncate">{data?.moodleUrl}</p>
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
                                <button 
                                    key={c.id} 
                                    onClick={() => setSelectedCourseId(c.id.toString())}
                                    className={`w-full text-left p-4 rounded-2xl border transition-all group ${
                                        (selectedCourseId === c.id.toString() || (!selectedCourseId && data.data.Courses[0]?.id === c.id))
                                        ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-200' 
                                        : 'bg-white border-slate-100 hover:border-indigo-200 shadow-sm'
                                    }`}>
                                    <h3 className={`text-sm font-bold mb-1 line-clamp-1 ${(selectedCourseId === c.id.toString() || (!selectedCourseId && data.data.Courses[0]?.id === c.id)) ? 'text-white' : 'text-slate-800'}`}>{c.fullname}</h3>
                                    <div className={`flex items-center justify-between text-[10px] ${(selectedCourseId === c.id.toString() || (!selectedCourseId && data.data.Courses[0]?.id === c.id)) ? 'text-indigo-100' : 'text-slate-400'}`}>
                                        <span className="font-mono uppercase">{c.shortname}</span>
                                        <span>ID {c.id}</span>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </section>

                    <section className="bg-white rounded-[32px] border border-slate-100 p-6 shadow-sm">
                        <h2 className="text-lg font-bold mb-4 flex items-center gap-2 text-slate-800">
                            <FileCheck className="w-5 h-5 text-indigo-500" /> Tareas Globales
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
                    <section className="bg-white rounded-[32px] border border-slate-100 overflow-hidden shadow-xl shadow-slate-200/50">
                        <div className="p-6 border-b border-slate-50 flex justify-between items-center">
                            <div>
                                <h2 className="text-lg font-bold flex items-center gap-2 text-slate-800">
                                    <UserCheck className="w-5 h-5 text-emerald-500" /> Estudiantes en Curso
                                </h2>
                                <p className="text-xs text-slate-500 mt-1">Haz clic en un alumno para ver su log de actividad detallado.</p>
                            </div>
                            <button 
                                onClick={() => setShowDictionary(!showDictionary)}
                                className="px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-100 text-[10px] font-bold text-slate-600 uppercase tracking-wider hover:bg-indigo-50 hover:text-indigo-600 transition-colors"
                            >
                                {showDictionary ? 'Ocultar Variables' : 'Explorar Variables'}
                            </button>
                        </div>
                        
                        {showDictionary && (
                            <div className="p-6 bg-indigo-50/50 border-b border-indigo-100 animate-in slide-in-from-top-2 duration-300">
                                <h4 className="text-[10px] font-black uppercase text-indigo-600 mb-4 tracking-widest text-center">Diccionario de Datos (Moodle + ECR)</h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    <div className="p-4 bg-white rounded-2xl border border-indigo-100/50 shadow-sm">
                                        <p className="text-[11px] font-bold text-slate-800 mb-1">fullname / username</p>
                                        <p className="text-[10px] text-slate-500">Identidad del alumno sincronizada directamente desde el ncleo de Moodle (LMS).</p>
                                    </div>
                                    <div className="p-4 bg-white rounded-2xl border border-indigo-100/50 shadow-sm">
                                        <p className="text-[11px] font-bold text-indigo-600 mb-1">interactionTimeMinutes</p>
                                        <p className="text-[10px] text-slate-500">**ECR Inteligencia**: Tiempo estimado de uso basado en pulsos de actividad (1 pulso = 10 seg).</p>
                                    </div>
                                    <div className="p-4 bg-white rounded-2xl border border-indigo-100/50 shadow-sm">
                                        <p className="text-[11px] font-bold text-indigo-600 mb-1">totalInterventions</p>
                                        <p className="text-[10px] text-slate-500">**ECR Inteligencia**: Contador total de sugerencias de Gemini generadas para este usuario.</p>
                                    </div>
                                    <div className="p-4 bg-white rounded-2xl border border-indigo-100/50 shadow-sm">
                                        <p className="text-[11px] font-bold text-slate-800 mb-1">moodle_id</p>
                                        <p className="text-[10px] text-slate-500">Clave primaria única del usuario en la base de datos externa de Moodle.</p>
                                    </div>
                                    <div className="p-4 bg-white rounded-2xl border border-indigo-100/50 shadow-sm">
                                        <p className="text-[11px] font-bold text-slate-800 mb-1">Grade Items</p>
                                        <p className="text-[10px] text-slate-500">Resultados de tareas y exmenes obtenidos va `gradereport_user_get_grade_items`.</p>
                                    </div>
                                </div>
                            </div>
                        )}
                        <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead className="bg-slate-50 text-slate-500 text-[10px] uppercase tracking-widest font-black">
                                        <tr>
                                            <th className="px-6 py-4">Alumno</th>
                                            <th className="px-6 py-4">Tiempo ECR</th>
                                            <th className="px-6 py-4 text-right">Acción</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100 text-sm">
                                        {data.data.Students.map((s: any) => (
                                            <tr key={s.id} 
                                                onClick={() => setSelectedStudent(s)}
                                                className={`cursor-pointer transition-all ${selectedStudent?.id === s.id ? 'bg-indigo-50' : 'hover:bg-slate-50'}`}>
                                                <td className="px-6 py-5">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-xs font-bold text-indigo-600">
                                                            {s.fullname.charAt(0)}
                                                        </div>
                                                        <div>
                                                            <div className="font-bold text-slate-800">{s.fullname}</div>
                                                            <div className="text-[10px] text-slate-400">ID Moodle: {s.id}</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-5">
                                                    <div className="flex items-center gap-2 text-xs font-bold text-indigo-600">
                                                        <Clock className="w-3.5 h-3.5" />
                                                        {s.interactionTimeMinutes} min
                                                    </div>
                                                </td>
                                                <td className="px-6 py-5 text-right">
                                                    <button className="text-[10px] font-black uppercase text-indigo-600 hover:text-indigo-800 transition-colors">Ver Log</button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </section>

                    {/* Student Detail View */}
                    {selectedStudent && (
                        <section className="bg-white rounded-[32px] border border-indigo-200 p-8 shadow-2xl shadow-indigo-500/10 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <div className="flex justify-between items-start mb-8">
                                <div className="flex items-center gap-5">
                                    <div className="w-14 h-14 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shadow-xl shadow-indigo-500/20">
                                        <User className="w-7 h-7" />
                                    </div>
                                    <div>
                                        <h3 className="text-2xl font-black text-slate-900">{selectedStudent.fullname}</h3>
                                        <p className="text-xs text-indigo-600 font-bold uppercase tracking-widest">Auditora Detallada de Actividad</p>
                                    </div>
                                </div>
                                <button 
                                    onClick={() => setSelectedStudent(null)}
                                    className="p-2 hover:bg-slate-50 rounded-xl transition-colors text-slate-400 hover:text-slate-600">
                                    <AlertCircle className="w-6 h-6 rotate-45" />
                                </button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                {/* Interaction Metrics */}
                                <div className="space-y-6">
                                    <h4 className="text-[10px] font-black uppercase text-slate-400 tracking-widest block">Métricas de Compromiso</h4>
                                    <div className="p-5 rounded-2xl bg-slate-50 border border-slate-100 space-y-5">
                                        <div>
                                            <p className="text-xs text-slate-500 mb-1 font-medium">Tiempo de Uso</p>
                                            <p className="text-3xl font-black text-slate-900">{selectedStudent.interactionTimeMinutes} <span className="text-xs font-bold text-slate-400 uppercase">min</span></p>
                                        </div>
                                        <div className="pt-5 border-t border-slate-200">
                                            <p className="text-xs text-slate-500 mb-1 font-medium">Intervenciones IA</p>
                                            <p className="text-3xl font-black text-indigo-600">{selectedStudent.totalInterventions}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Activity Logs List */}
                                <div className="md:col-span-2 space-y-6">
                                    <h4 className="text-[10px] font-black uppercase text-slate-400 tracking-widest block">Log de Interacciones Recientes (ECR)</h4>
                                    <div className="space-y-3">
                                        {selectedStudent.activityLogs?.length > 0 ? (
                                            selectedStudent.activityLogs.map((log: any, idx: number) => (
                                                <div key={idx} className="p-4 rounded-2xl bg-white border border-slate-100 flex items-center justify-between group hover:border-indigo-200 transition-all shadow-sm hover:shadow-md">
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-2.5 h-2.5 rounded-full bg-indigo-500 shadow-sm shadow-indigo-500/50" />
                                                        <div>
                                                            <p className="text-xs font-bold text-slate-800">Gemini: {log.interventionType}</p>
                                                            <p className="text-[10px] text-slate-500 font-medium">{new Date(log.timestamp).toLocaleString()}</p>
                                                        </div>
                                                    </div>
                                                    <span className={`text-[10px] font-black px-2.5 py-1 rounded-lg uppercase tracking-tight ${log.reaction === 'ACCEPTED' ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-50 text-slate-500'}`}>
                                                        {log.reaction || 'SENT'}
                                                    </span>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="p-12 text-center text-slate-400 border-2 border-dashed border-slate-100 rounded-[32px] flex flex-col items-center gap-3">
                                                <MessageSquare className="w-8 h-8 opacity-20" />
                                                <p className="text-xs font-medium italic">No se registran intervenciones automáticas para este alumno todavía.</p>
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
          background: rgba(255, 255, 255, 0.7);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
        }
      `}</style>
    </div>
  );
}
