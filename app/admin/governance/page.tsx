'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function DataGovernance() {
  const [governance, setGovernance] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/governance')
      .then(res => res.json())
      .then(data => {
        setGovernance(data);
        setLoading(false);
      });
  }, []);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a0a0f] text-white font-sans">
      <div className="animate-pulse text-xl font-light tracking-tighter">Analizando linaje de datos...</div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white p-8 font-sans">
      <div className="max-w-7xl mx-auto pt-16">
        <header className="mb-12">
          <Link href="/admin" className="text-blue-400 hover:text-blue-300 mb-4 inline-block text-sm transition-all hover:translate-x-[-4px]">
            ← Volver a la Consola
          </Link>
          <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-green-400 to-blue-500 mb-2">
            Gobernanza de Datos (Moodle)
          </h1>
          <p className="text-gray-400 font-light max-w-2xl">
            Catálogo técnico de las entidades consumidas vía Moodle API. Incluye descripciones de campos, tipos y patrones de datos reales.
          </p>
        </header>

        <div className="grid grid-cols-1 gap-12">
          {governance.metadata.map((category: any) => (
            <section key={category.table} className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-8 shadow-2xl">
              <div className="flex justify-between items-start mb-8">
                <div>
                  <h2 className="text-2xl font-bold text-white mb-2 flex items-center">
                    <span className="w-8 h-8 rounded-lg bg-green-500/20 text-green-400 flex items-center justify-center mr-3 text-sm">
                      TBL
                    </span>
                    {category.table}
                  </h2>
                  <p className="text-gray-400 text-sm italic">{category.description}</p>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-gray-500 uppercase tracking-widest block mb-1">WS Function</span>
                  <code className="text-xs bg-black/40 px-3 py-1 rounded text-green-300 border border-green-500/20">
                    {category.wsFunction}
                  </code>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Field Definitions */}
                <div>
                  <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4">Esquema de Campos</h3>
                  <div className="space-y-4">
                    {category.fields.map((field: any) => (
                      <div key={field.name} className="flex items-start group">
                        <div className="min-w-[140px]">
                          <span className="text-blue-300 font-mono text-sm">{field.name}</span>
                          <span className="block text-[10px] text-gray-600 font-bold uppercase">{field.type}</span>
                        </div>
                        <div className="text-gray-400 text-sm leading-relaxed border-l border-white/10 pl-4 group-hover:text-gray-200 transition-colors">
                          {field.description}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Sample Record View */}
                <div className="bg-black/30 rounded-xl p-6 border border-white/5 relative overflow-hidden">
                  <div className="absolute top-0 right-0 px-3 py-1 bg-green-500/10 text-green-400 text-[10px] font-bold uppercase border-b border-l border-white/10">
                    Live Sample Record
                  </div>
                  <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4">Datos Reales (JSON)</h3>
                  {governance.samples[category.table] ? (
                    <pre className="text-xs text-blue-200/80 font-mono overflow-auto max-h-[300px] scrollbar-thin scrollbar-thumb-white/10">
                      {JSON.stringify(governance.samples[category.table], null, 2)}
                    </pre>
                  ) : (
                    <div className="h-[200px] flex items-center justify-center text-gray-600 italic text-sm border-2 border-dashed border-white/5 rounded-lg">
                      No hay registros de prueba disponibles para esta tabla
                    </div>
                  )}
                </div>
              </div>
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}
