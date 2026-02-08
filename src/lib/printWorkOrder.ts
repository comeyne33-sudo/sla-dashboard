import type { SLA, DoorItem } from '../types/sla';

export const generateAndPrintWorkOrder = (sla: SLA, doors: DoorItem[]) => {
  const printWindow = window.open('', '', 'height=800,width=900');
  if (!printWindow) return;

  let contentHtml = '';

  // 1. CONTENT BEPALEN (Tabel of Tekst)
  if (sla.category === 'Toegangscontrole') {
      const rows = doors.map(d => `
          <tr style="border-bottom: 1px solid #eee;">
              <td style="padding:8px;">${d.door_name}<br/><span style="font-size:10px;color:#666;">${d.zone || '-'}</span></td>
              <td style="padding:8px;text-align:center;">${d.check_battery ? '✅' : '-'}</td>
              <td style="padding:8px;text-align:center;">${d.check_rights ? '✅' : '-'}</td>
              <td style="padding:8px;text-align:center;">${d.check_firmware ? '✅' : '-'}</td>
              <td style="padding:8px;font-size:12px;">${d.remarks || ''}</td>
          </tr>
      `).join('');

      contentHtml = `
          <h3>Deurlijst & Uitgevoerde Acties</h3>
          <table style="width:100%; border-collapse:collapse; font-size:13px;">
              <thead style="background:#f3f4f6;">
                  <tr>
                      <th style="padding:8px;text-align:left;">Deur / Zone</th>
                      <th style="padding:8px;">Batterij</th>
                      <th style="padding:8px;">Rechten</th>
                      <th style="padding:8px;">Firmware</th>
                      <th style="padding:8px;text-align:left;">Opmerking</th>
                  </tr>
              </thead>
              <tbody>${rows.length > 0 ? rows : '<tr><td colspan="5" style="padding:10px;font-style:italic;">Geen deuren in lijst.</td></tr>'}</tbody>
          </table>
      `;
  } else {
      // Andere categorieën: Tekstverslag
      contentHtml = `
          <h3>Uitgevoerde Werken</h3>
          <div style="background:#f9fafb; padding:15px; border:1px solid #e5e7eb; border-radius:8px; min-height:100px; white-space: pre-wrap;">
              ${sla.execution_report || 'Geen details ingegeven.'}
          </div>
      `;
  }

  // 2. HTML GENEREREN
  printWindow.document.write(`
    <html>
      <head><title>Werkbon - ${sla.clientName}</title></head>
      <body style="font-family: 'Segoe UI', sans-serif; padding: 40px; color: #1f2937; max-width: 800px; margin: 0 auto;">
        
        <div style="display:flex; align-items:center; justify-content:space-between; border-bottom: 2px solid #2563eb; padding-bottom: 20px; margin-bottom: 30px;">
           <div>
              <h1 style="margin:0; color:#111827; font-size: 24px;">Santens Automatics</h1>
              <p style="margin:5px 0 0 0; color:#2563eb; font-weight:bold; text-transform:uppercase; letter-spacing:1px; font-size:14px;">Service Level Agreement</p>
           </div>
           <div style="text-align:right; font-size:12px; color:#6b7280;">
              <p>Datum: ${new Date().toLocaleDateString('nl-BE')}</p>
              <p>Ref: ${sla.vo_number || '-'}</p>
           </div>
        </div>

        <div style="display:grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 30px;">
           <div style="background:#f9fafb; padding:15px; border-radius:8px;">
              <strong style="display:block; margin-bottom:5px; color:#374151;">Klantlocatie</strong>
              ${sla.clientName}<br/>
              ${sla.location}<br/>
              ${sla.city}
           </div>
           <div style="background:#f9fafb; padding:15px; border-radius:8px;">
              <strong style="display:block; margin-bottom:5px; color:#374151;">Contact</strong>
              ${sla.contactName || '-'}<br/>
              Type: ${sla.category}
           </div>
        </div>

        ${contentHtml}

        <div style="margin-top: 50px; page-break-inside: avoid;">
          <div style="display:grid; grid-template-columns: 1fr 1fr; gap: 40px;">
              <div>
                  <p style="font-size:12px; font-weight:bold; text-transform:uppercase; color:#9ca3af; margin-bottom:10px;">Voor uitvoerder:</p>
                  <p style="font-weight:bold;">Santens Automatics</p>
              </div>
              <div>
                  <p style="font-size:12px; font-weight:bold; text-transform:uppercase; color:#9ca3af; margin-bottom:10px;">Voor akkoord klant:</p>
                  <p style="font-weight:bold; margin-bottom:5px;">${sla.signer_name || '(Geen naam)'}</p>
                  ${sla.signature_url ? `<img src="${sla.signature_url}" style="max-height: 60px; border-bottom: 1px solid #000;" />` : '<p style="font-style:italic;color:#999;">Geen handtekening</p>'}
              </div>
          </div>
        </div>

        <script>
           window.onload = function() { setTimeout(function() { window.print(); }, 500); }
        </script>
      </body>
    </html>
  `);
  printWindow.document.close();
};