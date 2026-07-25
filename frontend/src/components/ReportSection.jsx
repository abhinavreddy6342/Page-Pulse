import React from 'react';
import ReportCard from "./ReportCard";
import Charts from './Charts';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { getScoreColor, getGrade, clampScore } from '../utils/scoreUtils';
import { renderValue } from '../utils/renderValue';

function Check({ passed, label, details }) {
  return (
    <div className="flex items-start gap-3">
      <span className={passed ? "text-green-400 mt-1" : "text-red-400 mt-1"}>
        {passed ? "✔" : "✖"}
      </span>
      <div>
        <div className="text-sm text-slate-300 font-medium">{label}</div>
        {details ? (
                  <div className="mt-0.5 text-xs text-slate-500">{renderValue(details)}</div>
        ) : null}
      </div>
    </div>
  );
}

function ReportSection({ report }) {
  const GradeCard = ({ report }) => {
    const seo = Number(report?.seoScore ?? 0);
    const perf = Number(report?.performanceScore ?? 0);
    const acc = Number(report?.accessibilityScore ?? report?.accessibility?.altCoverage ?? 0);
    const sec = Number(report?.securityScore ?? 0);
    // Weighted overall score: SEO 35%, Performance 25%, Accessibility 20%, Security 20%
    const avg = Math.round((seo * 0.35) + (perf * 0.25) + (acc * 0.20) + (sec * 0.20));
    const grade = getGrade(avg);
    const color = getScoreColor(avg);

    return (
      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="rounded-3xl border border-slate-700 bg-slate-900 p-6 shadow flex items-center gap-6">
          <div className="rounded-full p-4" style={{ background: color }}>
            <div className="text-4xl font-bold leading-none text-black">{grade}</div>
            <div className="text-sm text-slate-800">Overall Grade</div>
          </div>

          <div>
            <div className="text-sm text-slate-400">Overall Score</div>
            <div className="text-3xl font-semibold">{avg}%</div>
            <div className="mt-1 text-sm text-slate-500">Based on SEO, Performance, Accessibility and Security</div>
          </div>
        </div>

        <div className="flex gap-3">
          <button id="export-report-btn" className="rounded-xl bg-blue-600 px-4 py-3 font-semibold hover:bg-blue-700">Export PDF</button>
          <button id="copy-link-btn" className="rounded-xl border border-slate-700 px-4 py-3 font-semibold">Copy Link</button>
          <button id="copy-json-btn" className="rounded-xl border border-slate-700 px-4 py-3 font-semibold">Copy JSON</button>
        </div>
      </div>
    );
  };

  if (!report) {
    return (
      <section className="mt-12 space-y-6">
        <ReportCard title="Waiting" content="No report available. Run an analysis to see detailed results." />
      </section>
    );
  }

  const SEOChecksTable = ({ seoChecks }) => {
    const recs = report?.seoRecommendations || [];
    if (!Array.isArray(seoChecks) || seoChecks.length === 0) return <div className="text-slate-500">No SEO checks available.</div>;

    const findRecFor = (checkName) => {
      const lower = (checkName || '').toString().toLowerCase();
      // try to match by problem text
      for (const r of recs) {
        if (!r) continue;
        const prob = (r.problem || r.issue || r.title || '').toString().toLowerCase();
        if (prob && lower.includes(prob)) return r;
        if (prob && prob.includes(lower)) return r;
      }
      return null;
    };

    return (
      <div className="overflow-x-auto rounded-2xl border border-slate-700 bg-slate-900 p-6">
        <table className="w-full table-auto">
          <thead>
            <tr className="text-left text-sm text-slate-400">
              <th className="px-3 py-2">Check Name</th>
              <th className="px-3 py-2">Status</th>
              <th className="px-3 py-2">Value</th>
              <th className="px-3 py-2">Recommendation</th>
              <th className="px-3 py-2">Example</th>
            </tr>
          </thead>
          <tbody className="text-sm text-slate-200">
            {seoChecks.map((c, i) => {
              const name = c?.name ?? c?.label ?? `check-${i}`;
              const rec = findRecFor(name || (c?.details && typeof c.details === 'string' ? c.details : ''));
              const value = c?.value ?? c?.details ?? '—';
              const recText = rec ? (rec.explanation ?? rec.recommendation ?? rec.problem ?? rec.issue) : (c?.recommendation ?? 'Review this check');
              const exampleText = rec ? (rec.example ?? rec.fix ?? '—') : (c?.example ?? '—');
              return (
                <tr key={i} className="border-t border-slate-800">
                  <td className="px-3 py-3">{renderValue(name)}</td>
                  <td className="px-3 py-3">{c?.passed ? <span className="text-green-400">✔</span> : <span className="text-red-400">✖</span>}</td>
                  <td className="px-3 py-3">{renderValue(value)}</td>
                  <td className="px-3 py-3 text-slate-400">{renderValue(recText)}</td>
                  <td className="px-3 py-3 text-slate-400">{renderValue(exampleText)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    );
  };

  const AccessibilityPanel = ({ report }) => {
    const missingAlt = report?.imagesWithoutAlt ?? report?.missingAltImages ?? report?.accessibility?.imagesWithoutAlt ?? 0;
    const totalImages = report?.images ?? report?.accessibility?.totalImages ?? 0;
    const imagesWithAlt = (totalImages - missingAlt) > 0 ? (totalImages - missingAlt) : (report?.accessibility?.imagesWithAlt ?? 0);

    return (
      <div className="rounded-2xl border border-slate-700 bg-slate-900 p-6">
        <h4 className="mb-3 text-lg font-semibold">Accessibility Overview</h4>
        <div className="grid gap-3 md:grid-cols-3">
          <div className="p-3">
            <div className="text-sm text-slate-400">Images with Alt</div>
            <div className="text-xl font-semibold">{imagesWithAlt}</div>
          </div>
          <div className="p-3">
            <div className="text-sm text-slate-400">Images Missing Alt</div>
            <div className={`text-xl font-semibold ${missingAlt > 0 ? 'text-red-400' : 'text-green-400'}`}>{missingAlt}</div>
          </div>
          <div className="p-3">
            <div className="text-sm text-slate-400">Headings</div>
            <div className="text-xl font-semibold">H1: {report?.h1 ?? report?.accessibility?.headings?.h1 ?? 0} • H2: {report?.h2 ?? report?.accessibility?.headings?.h2 ?? 0}</div>
          </div>
        </div>
      </div>
    );
  };


  const SecurityPanel = ({ report }) => {
    const headers = report.securityHeaders || {};
    const items = [
      { key: 'csp', label: 'Content-Security-Policy', desc: 'Helps prevent XSS and data injection', importance: 'High' },
      { key: 'hsts', label: 'Strict-Transport-Security (HSTS)', desc: 'Enforces HTTPS', importance: 'High' },
      { key: 'xFrameOptions', label: 'X-Frame-Options', desc: 'Prevents clickjacking', importance: 'Medium' },
      { key: 'xContentTypeOptions', label: 'X-Content-Type-Options', desc: 'Prevents MIME sniffing', importance: 'Medium' },
      { key: 'referrerPolicy', label: 'Referrer-Policy', desc: 'Controls referrer information', importance: 'Low' },
    ];

    return (
      <div className="grid gap-3 md:grid-cols-2">
        {items.map((it) => (
          <div key={it.key} className="rounded-xl border border-slate-700 bg-slate-900 p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-slate-400">{it.label}</div>
                <div className="text-slate-200 mt-1">{headers[it.key] ? 'Present' : 'Missing'}</div>
              </div>
              <div className={`text-sm ${headers[it.key] ? 'text-green-400' : 'text-red-400'}`}>{headers[it.key] ? '✔' : '✖'}</div>
            </div>
            <div className="mt-2 text-sm text-slate-400">{it.desc}</div>
            <div className="mt-1 text-xs text-slate-500">Importance: {it.importance}</div>
          </div>
        ))}
      </div>
    );
  };

  const RecommendationsPanel = ({ recommendations }) => {
    if (!Array.isArray(recommendations) || recommendations.length === 0) return <ReportCard title="Recommendations" content="No recommendations — page looks healthy." />;

    const grouped = { High: [], Medium: [], Low: [] };
    recommendations.forEach((r) => {
      const p = (r.priority || 'Medium');
      if (p.toLowerCase && p.toLowerCase().startsWith('h')) grouped.High.push(r);
      else if (p.toLowerCase && p.toLowerCase().startsWith('l')) grouped.Low.push(r);
      else grouped.Medium.push(r);
    });

    return (
      <div className="grid gap-4 md:grid-cols-3">
        {['High','Medium','Low'].map((level) => (
          <div key={level} className="rounded-2xl border border-slate-700 bg-slate-900 p-6">
            <div className="text-lg font-semibold">{level} Priority</div>
            <div className="mt-2 space-y-2">
              {grouped[level].length === 0 ? <div className="text-slate-500">No items</div> : grouped[level].map((r,i)=> (
                <div key={i} className="p-2 rounded-md border border-slate-800 bg-slate-950">
                                <div className="font-medium text-slate-200">{renderValue(r.issue ?? r.title ?? r)}</div>
                                <div className="text-sm text-slate-400">{renderValue(r.explanation ?? r.reason ?? r.description ?? '')}</div>
                                <div className="mt-1 text-xs text-slate-500">Impact: {renderValue(r.impact ?? 'Medium')}</div>
                                <div className="mt-1 text-xs text-slate-500">Fix: {renderValue(r.fix ?? r.howToFix ?? 'See recommendation details')}</div>
                                <div className="mt-1 text-xs text-slate-500">Example: <pre className="whitespace-pre-wrap text-xs text-slate-400">{renderValue(r.example ?? r.exampleHtml ?? '—')}</pre></div>
                  {r.docs ? <div className="mt-1 text-xs text-blue-400"><a href={r.docs} target="_blank" rel="noreferrer">Docs</a></div> : null}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  };

  const exportPDF = async () => {
    try {
      // create a clean printable node to produce a professional report
      const root = document.getElementById('report-root');
      if (!root) return;

      // small clone to avoid UI chrome
      const clone = root.cloneNode(true);
      clone.style.padding = '20px';
      clone.style.background = '#ffffff';
      clone.style.color = '#000000';
      const wrapper = document.createElement('div');
      wrapper.appendChild(clone);
      document.body.appendChild(wrapper);

      const canvas = await html2canvas(clone, { scale: 2, useCORS: true });
      const img = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p','mm','a4');
      const width = pdf.internal.pageSize.getWidth();
      const height = (canvas.height * width) / canvas.width;
      pdf.addImage(img, 'PNG', 0, 0, width, height);

      // add footer metadata
      pdf.setFontSize(10);
      pdf.text(`Website: ${report.url}`, 10, pdf.internal.pageSize.getHeight() - 20);
      pdf.text(`Date: ${new Date(report.date).toLocaleString()}`, 10, pdf.internal.pageSize.getHeight() - 12);

      const filename = `${(report.title || report.url || 'report').toString().replace(/[^a-z0-9]/gi,'_')}_audit.pdf`;
      pdf.save(filename);

      // cleanup
      wrapper.remove();
    } catch (e) {
      console.error('PDF export failed', e);
      alert('Failed to export PDF');
    }
  };

  const ensureReportIdAndStore = () => {
    // persist a copy of the report and return id
    try {
      const stores = JSON.parse(localStorage.getItem('page_pulse_reports') || '{}');
      // if report already has an id, reuse
      if (report.reportId) {
        stores[report.reportId] = report;
        localStorage.setItem('page_pulse_reports', JSON.stringify(stores));
        return report.reportId;
      }
      // generate a short id
      const id = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2,8)}`;
      report.reportId = id;
      stores[id] = report;
      localStorage.setItem('page_pulse_reports', JSON.stringify(stores));

      // also update history entries that match this URL+date to attach id
      try {
        const raw = localStorage.getItem('page_pulse_history');
        const arr = raw ? JSON.parse(raw) : [];
        for (let i=0;i<arr.length;i++){
          const it = arr[i];
          if (it.url === report.url && it.date === report.date) {
            it.reportId = id;
            arr[i] = it;
            break;
          }
        }
        localStorage.setItem('page_pulse_history', JSON.stringify(arr));
      } catch (e) { /* ignore */ }

      return id;
    } catch (e) {
      console.error('Failed to store report', e);
      return null;
    }
  };

  const copyLink = async () => {
    try {
      const id = ensureReportIdAndStore();
      if (!id) throw new Error('no id');
      const link = `${window.location.origin}/report/${id}`;
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(link);
        alert('Report link copied to clipboard');
      } else {
        const ta = document.createElement('textarea');
        ta.value = link;
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        ta.remove();
        alert('Report link copied to clipboard');
      }
    } catch (e) {
      console.error(e);
      alert('Failed to copy link');
    }
  };

  const copyJSON = async () => {
    try {
      const id = ensureReportIdAndStore();
      const payload = JSON.stringify(report || {}, null, 2);
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(payload);
        alert('Report JSON copied to clipboard');
      } else {
        const ta = document.createElement('textarea');
        ta.value = payload;
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        ta.remove();
        alert('Report JSON copied to clipboard');
      }
    } catch (e) {
      console.error(e);
      alert('Failed to copy report JSON');
    }
  };

  setTimeout(()=>{
    const el = document.getElementById('export-report-btn');
    if (el && !el.dataset.bound) {
      el.addEventListener('click', exportPDF);
      el.dataset.bound = '1';
    }
    const lnk = document.getElementById('copy-link-btn');
    if (lnk && !lnk.dataset.bound) {
      lnk.addEventListener('click', copyLink);
      lnk.dataset.bound = '1';
    }
    const jsonBtn = document.getElementById('copy-json-btn');
    if (jsonBtn && !jsonBtn.dataset.bound) {
      jsonBtn.addEventListener('click', copyJSON);
      jsonBtn.dataset.bound = '1';
    }
  }, 500);

  return (
    <section className="mt-8 space-y-6" id="report-root">
      <GradeCard report={report} />

      <Charts report={report} />

      <div className="grid gap-6 md:grid-cols-2">
        <div>
          <h3 className="mb-3 text-xl font-bold">SEO Checks</h3>
          <SEOChecksTable seoChecks={report.seoChecks || []} />
        </div>

        <div>
          <h3 className="mb-3 text-xl font-bold">Accessibility</h3>
          <AccessibilityPanel report={report} />

          <div className="mt-4">
            <h4 className="mb-2 text-lg font-semibold">Accessibility Checks</h4>
            <div className="space-y-2">
              {Array.isArray(report.accessibilityChecks) && report.accessibilityChecks.length > 0 ? (
                report.accessibilityChecks.map((c) => (
                  <Check key={c.name} passed={!!c.passed} label={c.name} details={c.details} />
                ))
              ) : (
                <div className="text-slate-500">No accessibility checks available.</div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div>
        <h3 className="mb-3 text-xl font-bold">Security</h3>
        <SecurityPanel report={report} />
      </div>

      <div>
        <h3 className="mb-3 text-xl font-bold">Recommendations</h3>
        <RecommendationsPanel recommendations={report.recommendations || []} />
      </div>
    </section>
  );
}

export default ReportSection;