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

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
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
    const interventions = learners.reduce((acc, l) => acc + l.interventionCount, 0);

    const html = `
        <!DOCTYPE html>
        <html>
        <head>
            <title>Class Report - ECR</title>
            <style>
                body { font-family: 'Inter', sans-serif; color: #333; padding: 40px; }
                h1 { color: #4338ca; }
                p { font-size: 14px; color: #666; }
                .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 30px; }
                .card { padding: 15px; border: 1px solid #e5e7eb; border-radius: 8px; }
                table { width: 100%; border-collapse: collapse; margin-top: 20px; font-size: 14px; }
                th, td { text-align: left; padding: 10px; border-bottom: 1px solid #e5e7eb; }
                th { background-color: #f9fafb; font-weight: 600; }
                .high-risk { color: #ef4444; font-weight: bold; }
                .footer { margin-top: 50px; font-size: 12px; color: #9ca3af; text-align: center; }
            </style>
        </head>
        <body>
            <h1>Class Cognitive Regulation Report</h1>
            <p><strong>Master ELSEI &mdash; ENS Abdelmalek Essaadi University</strong></p>
            <p>Generated on: ${new Date().toLocaleString()}</p>
            
            <div class="grid">
                <div class="card">
                    <h3>High Cognitive Load</h3>
                    <p style="font-size: 24px; color: #ef4444; margin: 0;">${highCL} Students</p>
                </div>
                <div class="card">
                    <h3>Interventions Today</h3>
                    <p style="font-size: 24px; color: #7c3aed; margin: 0;">${interventions}</p>
                </div>
            </div>

            <h2>Learner Heatmap snapshot</h2>
            <table>
                <thead>
                    <tr>
                        <th>Learner</th>
                        <th>Profile</th>
                        <th>Cognitive Load</th>
                        <th>Attention</th>
                        <th>Motivation</th>
                    </tr>
                </thead>
                <tbody>
                    ${learners.map(l => `
                        <tr>
                            <td><strong>${l.name}</strong></td>
                            <td>${l.profile}</td>
                            <td class="${l.state.cognitiveLoad === 'high' ? 'high-risk' : ''}">${l.state.cognitiveLoad}</td>
                            <td class="${l.state.attention === 'low' ? 'high-risk' : ''}">${l.state.attention}</td>
                            <td class="${l.state.motivation === 'low' ? 'high-risk' : ''}">${l.state.motivation}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>

            <div class="footer">
                ELSEI Co-Regulator System &bull; Automated Analytics Export
            </div>
            <script>
                window.onload = () => { window.print(); window.close(); }
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
            <title>Student Report - ${learner.name}</title>
            <style>
                body { font-family: 'Inter', sans-serif; color: #333; padding: 40px; }
                h1 { color: #4338ca; border-bottom: 2px solid #e5e7eb; padding-bottom: 10px; }
                h2 { color: #4b5563; margin-top: 30px; }
                p, li { font-size: 14px; color: #4b5563; line-height: 1.6; }
                .badge { display: inline-block; padding: 4px 8px; background: #f3f4f6; border-radius: 4px; font-weight: 600; font-size: 12px; }
                .box { border: 1px solid #e5e7eb; padding: 15px; border-radius: 8px; background: #f9fafb; margin-top: 15px; }
                .footer { margin-top: 50px; font-size: 12px; color: #9ca3af; text-align: center; }
            </style>
        </head>
        <body>
            <h1>Learner Report: ${learner.name}</h1>
            <p><strong>Master ELSEI &mdash; ENS Abdelmalek Essaadi University</strong></p>
            <p>Generated on: ${new Date().toLocaleString()}</p>

            <h2>Current Cognitive State</h2>
            <ul>
                <li><strong>Profile:</strong> <span class="badge">${learner.profile}</span></li>
                <li><strong>Cognitive Load:</strong> ${learner.state.cognitiveLoad}</li>
                <li><strong>Attention:</strong> ${learner.state.attention}</li>
                <li><strong>Motivation:</strong> ${learner.state.motivation}</li>
            </ul>

            <h2>Activity & Interventions</h2>
            <ul>
                <li><strong>Current Activity:</strong> ${learner.currentActivity}</li>
                <li><strong>Interventions Received:</strong> ${learner.interventionCount} this session</li>
            </ul>

            <h2>Instructor Notes</h2>
            <div class="box">
                ${notes ? notes.replace(/\\n/g, '<br/>') : '<em>No notes recorded.</em>'}
            </div>

            <div class="footer">
                ELSEI Co-Regulator System &bull; Automated Analytics Export
            </div>
            <script>
                window.onload = () => { window.print(); window.close(); }
            </script>
        </body>
        </html>
    `;

    printWindow.document.write(html);
    printWindow.document.close();
}
