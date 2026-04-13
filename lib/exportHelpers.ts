import { SimulatedLearner } from '@/lib/types';

export function downloadCSV(learners: SimulatedLearner[]) {
    const headers = [
        'Student Name',
        'Profile',
        'Current Activity',
        'Cognitive Load',
        'Attention',
        'Motivation',
        'Interventions Today',
        'Opt Out',
        'Timestamp'
    ];

    const rows = learners.map(l => [
        `"${l.name}"`,
        l.profile,
        `"${l.currentActivity}"`,
        l.state.cognitiveLoad,
        l.state.attention,
        l.state.motivation,
        l.interventionCount,
        l.optOut,
        new Date().toISOString()
    ]);

    // Added UTF-8 BOM for Excel compatibility (\ufeff)
    const csvContent = '\ufeff' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `ecr_class_report_${new Date().getTime()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

export function downloadClassPDF(learners: SimulatedLearner[]) {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const highCL = learners.filter(l => l.state.cognitiveLoad === 'high').length;
    const lowAtt = learners.filter(l => l.state.attention === 'low').length;
    const interventions = learners.reduce((acc, l) => acc + l.interventionCount, 0);

    const HOTSPOTS_PDF = [
        { activity: 'M112: PROGRAMMATION EN PYTHON : FONDAMENTAUX', dropoff: 34, struggle: 74 },
        { activity: 'M125: Fondements d\'apprentissage automatique', dropoff: 21, struggle: 62 },
        { activity: 'M121: Ingénierie pédagogique d’elearning', dropoff: 12, struggle: 45 },
    ];

    const html = `
        <!DOCTYPE html>
        <html>
        <head>
            <title>Class Analytics Report - ECR</title>
            <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;600;700&display=swap" rel="stylesheet">
            <style>
                @media print {
                    * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
                    @page { margin: 0; }
                    body { -webkit-print-color-adjust: exact; }
                }
                body { font-family: 'Outfit', sans-serif; color: #1e293b; margin: 0; padding: 0; background: #fff; line-height: 1.5; }
                .page { width: 210mm; height: 297mm; padding: 25mm !important; box-sizing: border-box; page-break-after: always; position: relative; background: #fff; }
                .header { display: flex; align-items: center; justify-content: space-between; border-bottom: 2px solid #e2e8f0; padding-bottom: 15px; margin-bottom: 30px; }
                .logo { display: flex; align-items: center; gap: 15px; }
                .logo-icon { width: 50px; height: 50px; border-radius: 10px; overflow: hidden; display: flex; justify-content: center; align-items: center; }
                .logo-icon img { width: 100%; height: 100%; object-fit: contain; }
                .institution { font-size: 10px; color: #64748b; text-transform: uppercase; font-weight: 700; border-left: 2px solid #e2e8f0; padding-left: 15px; }
                
                h1 { font-size: 24px; color: #0f172a; margin: 0; }
                .meta { font-size: 12px; color: #94a3b8; margin-top: 5px; }
                
                .kpi-container { display: flex; gap: 15px; margin-bottom: 40px; }
                .kpi-card { padding: 15px; border-radius: 16px; background: #f8fafc; border: 1px solid #e2e8f0; flex: 1; text-align: left; }
                .kpi-val { font-size: 24px; font-weight: 800; color: #4f46e5; }
                .kpi-label { font-size: 10px; color: #64748b; text-transform: uppercase; font-weight: 700; margin-top: 5px; }
                
                .section-title { font-size: 16px; font-weight: 700; color: #334155; margin-bottom: 20px; display: flex; align-items: center; gap: 8px; }
                .section-title::before { content: ''; width: 4px; height: 16px; background: #4f46e5; border-radius: 2px; }
                
                table { width: 100%; border-collapse: collapse; font-size: 12px; border-radius: 12px; overflow: hidden; border: 1px solid #e2e8f0; }
                th { text-align: left; padding: 14px; border-bottom: 2px solid #e2e8f0; color: #64748b; font-weight: 700; background: #f8fafc; }
                td { padding: 14px; border-bottom: 1px solid #e2e8f0; color: #334155; }
                .badge { padding: 4px 10px; border-radius: 6px; font-weight: 700; font-size: 10px; background-clip: padding-box; border: 1px solid transparent; }
                .badge-high { background: #fee2e2; color: #ef4444; border-color: #fca5a5; }
                .badge-medium { background: #fef3c7; color: #d97706; border-color: #fcd34d; }
                .badge-low { background: #dcfce7; color: #22c55e; border-color: #86efac; }
                
                .footer { position: absolute; bottom: 15mm; left: 25mm; right: 25mm; font-size: 10px; color: #94a3b8; display: flex; justify-content: space-between; border-top: 1px solid #e2e8f0; padding-top: 15px; font-weight: 500; }

                /* Analysis Page */
                .chart-placeholder { height: 180px; width: 100%; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 16px; display: flex; align-items: center; justify-content: center; font-size: 12px; color: #94a3b8; margin-bottom: 20px; box-sizing: border-box; }
                .insight-box { padding: 25px; border-radius: 16px; background: #f5f3ff; border: 1px solid #ede9fe; margin-bottom: 25px; }
                .insight-title { font-weight: 800; font-size: 14px; color: #4f46e5; margin-bottom: 10px; }
                .insight-text { font-size: 12px; color: #475569; line-height: 1.6; }
            </style>
        </head>
        <body>
            <!-- PAGE 1: HEATMAP -->
            <div class="page">
                <div class="header">
                    <div class="logo">
                        <div class="logo-icon"><img src="/logo.png" alt="ECR Logo" width="50" height="50" style="object-fit: contain;" /></div>
                        <div>
                            <h1>ECR Analytics</h1>
                            <p class="meta">Class Cognitive Regulation Overview • ${new Date().toLocaleDateString()}</p>
                        </div>
                    </div>
                    <div class="institution">
                        Master ELSEI<br/>ENS Abdelmalek Essaadi
                    </div>
                </div>

                <div class="kpi-container">
                    <div class="kpi-card">
                        <div class="kpi-val">${learners.length}</div>
                        <div class="kpi-label">Active Learners</div>
                    </div>
                    <div class="kpi-card">
                        <div class="kpi-val">${highCL}</div>
                        <div class="kpi-label">High Cog. Load</div>
                    </div>
                    <div class="kpi-card">
                        <div class="kpi-val">${lowAtt}</div>
                        <div class="kpi-label">Low Attention</div>
                    </div>
                    <div class="kpi-card">
                        <div class="kpi-val">${interventions}</div>
                        <div class="kpi-label">Total Suggestions</div>
                    </div>
                </div>

                <div class="section-title">Learner Heatmap Snapshot</div>
                <table>
                    <thead>
                        <tr>
                            <th>Learner Name</th>
                            <th>Profile</th>
                            <th>Cog. Load</th>
                            <th>Attention</th>
                            <th>Motivation</th>
                            <th>Interv.</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${learners.map(l => `
                            <tr>
                                <td style="font-weight:700">${l.name}</td>
                                <td style="text-transform: capitalize">${l.profile}</td>
                                <td><span class="badge ${l.state.cognitiveLoad === 'high' ? 'badge-high' : l.state.cognitiveLoad === 'medium' ? 'badge-medium' : 'badge-low'}">${l.state.cognitiveLoad.toUpperCase()}</span></td>
                                <td><span class="badge ${l.state.attention === 'low' ? 'badge-high' : l.state.attention === 'medium' ? 'badge-medium' : 'badge-low'}">${l.state.attention.toUpperCase()}</span></td>
                                <td><span class="badge ${l.state.motivation === 'low' ? 'badge-high' : l.state.motivation === 'medium' ? 'badge-medium' : 'badge-low'}">${l.state.motivation.toUpperCase()}</span></td>
                                <td style="font-weight:700">${l.interventionCount}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>

                <div class="footer">
                    <span>Generated by ELSEI Co-Regulator System (ECR)</span>
                    <span>Confidential Instructor Report • Page 1 of 2</span>
                </div>
            </div>

            <!-- PAGE 2: ANALYTICS & INSIGHTS -->
            <div style="page-break-before: always;"></div>
            <div class="page">
                <div class="section-title">Class Distribution Analysis</div>
                
                <div style="display:flex; gap: 20px; align-items: stretch;">
                    <div style="flex: 1; display:flex; flex-direction:column; background:#f8fafc; border:1px solid #e2e8f0; border-radius:16px; padding:20px;">
                        <div class="insight-title text-center" style="margin-bottom:15px;">Motivation Risk Distribution</div>
                        <div class="chart-placeholder" style="border:none; background:transparent; margin:auto;">
                            <svg width="120" height="120" viewBox="0 0 42 42">
                                <circle cx="21" cy="21" r="15.915" fill="transparent" stroke="#e2e8f0" stroke-width="6"></circle>
                                <circle cx="21" cy="21" r="15.915" fill="transparent" stroke="#4f46e5" stroke-width="6" stroke-dasharray="70 30" stroke-dashoffset="25"></circle>
                            </svg>
                        </div>
                    </div>
                    <div style="flex: 1; display:flex;">
                        <div class="insight-box" style="margin:0; width:100%;">
                            <div class="insight-title">Smart Insight</div>
                            <p class="insight-text">
                                The class currently shows a <strong>${Math.round((highCL / learners.length) * 100)}% high cognitive load</strong> rate. 
                                Most affected students are following the "Overloaded" profile. Recommended intervention: Slow down the delivery of complex Python modules.
                            </p>
                        </div>
                    </div>
                </div>

                <div class="section-title" style="margin-top: 30px;">Moodle Module Bottlenecks</div>
                <div style="padding: 20px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 16px;">
                    ${HOTSPOTS_PDF.map((h, i) => `
                        <div style="${i !== 0 ? 'margin-top:20px;' : ''}">
                            <div style="display:flex; justify-content:space-between; font-size:11px; font-weight:700; color:#334155; margin-bottom:8px">
                                <span>${h.activity}</span>
                                <span style="color:#ef4444">${h.struggle}% High Load</span>
                            </div>
                            <div style="height:12px; background:#e2e8f0; border-radius:6px; overflow:hidden; margin-bottom:4px">
                                <div style="height:100%; width:${h.struggle}%; background:linear-gradient(90deg, #4f46e5, #ef4444); border-radius:6px"></div>
                            </div>
                            <div style="font-size:10px; color:#64748b;">Est. Drop-off Risk: ${h.dropoff}%</div>
                        </div>
                    `).join('')}
                </div>

                <div class="section-title" style="margin-top: 30px;">Automated AI Summary</div>
                <div class="insight-box" style="background: #f8fafc; border: 1px solid #e2e8f0;">
                    <p class="insight-text" style="font-style: italic;">
                        "Overall class attention is stable at 72%. However, the 'Python Fundamentals' session has triggered multiple reflective prompts due to rapid navigation speed and high error rates. The ECR system has effectively reduced frustration by suggesting micro-breaks to 3 students."
                    </p>
                </div>

                <div class="footer" style="position: absolute; bottom: 25mm; left: 25mm; right: 25mm;">
                    <span>Generated by ELSEI Co-Regulator System (ECR) • Smart Report</span>
                    <span>Confidential Instructor Report • Page 2 of 2</span>
                </div>
            </div>

            <script>
                window.onload = () => { setTimeout(() => { window.print(); window.close(); }, 500); }
            </script>
        </body>
        </html>
    `;

    printWindow.document.write(html);
    printWindow.document.close();
}

export function downloadStudentPDF(learner: SimulatedLearner, notes: string) {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const html = `
        <!DOCTYPE html>
        <html>
        <head>
            <title>Learner Analysis - ${learner.name}</title>
            <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;600;700&display=swap" rel="stylesheet">
            <style>
            <style>
                @media print {
                    * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
                    @page { margin: 0; }
                    body { -webkit-print-color-adjust: exact; }
                }
                body { font-family: 'Outfit', sans-serif; color: #1e293b; margin: 0; padding: 0; background: #fff; line-height: 1.5; }
                .page { width: 210mm; min-height: 297mm; padding: 25mm !important; box-sizing: border-box; position: relative; background: #fff; }
                .header { display: flex; align-items: center; justify-content: space-between; border-bottom: 2px solid #e2e8f0; padding-bottom: 15px; margin-bottom: 30px; }
                .logo { display: flex; align-items: center; gap: 15px; }
                .logo-icon { width: 50px; height: 50px; border-radius: 10px; overflow: hidden; display: flex; justify-content: center; align-items: center; }
                .logo-icon img { width: 100%; height: 100%; object-fit: contain; }
                
                h1 { font-size: 20px; color: #0f172a; margin: 0; }
                .user-info { display: flex; align-items: center; gap: 15px; margin-bottom: 40px; border: 1px solid #e2e8f0; padding: 20px; border-radius: 16px; background: #f8fafc; }
                .avatar { width: 50px; height: 50px; background: linear-gradient(135deg, #4f46e5, #9333ea); border-radius: 14px; display: flex; align-items: center; justify-content: center; color: white; font-weight: 800; font-size: 24px; box-shadow: 0 4px 6px -1px rgba(79, 70, 229, 0.2); }
                
                .grid { display: flex; gap: 15px; margin-bottom: 30px; }
                .card { flex: 1; padding: 20px; border: 1px solid #e2e8f0; border-radius: 16px; background: #f8fafc; }
                .card-val { font-size: 20px; font-weight: 800; color: #4f46e5; text-transform: capitalize; margin-top: 5px; }
                .card-label { font-size: 10px; color: #64748b; text-transform: uppercase; font-weight: 700; }
                
                .section-title { font-size: 16px; font-weight: 700; color: #334155; margin-bottom: 20px; display: flex; align-items: center; gap: 8px; }
                .section-title::before { content: ''; width: 4px; height: 16px; background: #4f46e5; border-radius: 2px; }
                
                .box { padding: 25px; border-radius: 16px; background: #f8fafc; border: 1px dashed #cbd5e1; font-size: 13px; color: #475569; min-height: 120px; line-height: 1.6; }
                
                .footer { position: absolute; bottom: 15mm; left: 25mm; right: 25mm; font-size: 10px; color: #94a3b8; display: flex; justify-content: space-between; border-top: 1px solid #e2e8f0; padding-top: 15px; font-weight: 500; }
            </style>
        </head>
        <body>
            <div class="page">
                <div class="header">
                    <div class="logo">
                        <div class="logo-icon"><img src="/logo.png" alt="ECR Logo" width="50" height="50" style="object-fit: cover;" /></div>
                        <h1>Learner Diagnostic</h1>
                    </div>
                </div>

                <div class="user-info">
                    <div class="avatar">${learner.avatar}</div>
                    <div>
                        <h2 style="margin:0; font-size:18px">${learner.name}</h2>
                        <p style="margin:0; font-size:12px; color:#6366f1">${learner.profile.toUpperCase()} LEARNER PROFILE</p>
                    </div>
                </div>

                <div class="section-title">Cognitive State Overview</div>
                <div class="grid">
                    <div class="card">
                        <div class="card-label">Cognitive Load</div>
                        <div class="card-val">${learner.state.cognitiveLoad}</div>
                    </div>
                    <div class="card">
                        <div class="card-label">Attention Level</div>
                        <div class="card-val">${learner.state.attention}</div>
                    </div>
                    <div class="card">
                        <div class="card-label">Motivation</div>
                        <div class="card-val">${learner.state.motivation}</div>
                    </div>
                </div>

                <div class="section-title">Activity Metrics</div>
                <div class="grid">
                    <div class="card">
                        <div class="card-label">Current/Last Activity</div>
                        <div class="card-val" style="font-size:12px">${learner.currentActivity}</div>
                    </div>
                    <div class="card">
                        <div class="card-label">Direct AI Suggestions</div>
                        <div class="card-val">${learner.interventionCount}</div>
                    </div>
                </div>

                <div class="section-title">Instructor Observations & Notes</div>
                <div class="box">
                    ${notes ? notes.replace(/\\n/g, '<br/>') : '<em>No pedagogical notes recorded for this session.</em>'}
                </div>

                <div class="footer">
                    <span>Generated by ELSEI Co-Regulator System (ECR)</span>
                    <span>Student ID: ${learner.id} • Confidential Diagnostic</span>
                </div>
            </div>
            <script>
                window.onload = () => { setTimeout(() => { window.print(); window.close(); }, 500); }
            </script>
        </body>
        </html>
    `;

    printWindow.document.write(html);
    printWindow.document.close();
}
