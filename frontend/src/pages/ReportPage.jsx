import React, { useEffect, useState } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import ReportSection from '../components/ReportSection';
import { getApiUrl, getAuthHeaders } from '../apiClient';

function ReportPage() {
  const [report, setReport] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    // parse id from path /report/:id
    (async () => {
      try {
        const parts = window.location.pathname.split('/').filter(Boolean);
        const id = parts[1] || parts[0];
        if (!id) {
          setError('No report id provided');
          return;
        }

        // If authenticated, try server first
        const token = localStorage.getItem('pp_token');
        if (token) {
          try {
            const resp = await fetch(getApiUrl(`/api/reports/${id}`), { headers: getAuthHeaders() });
            if (resp.ok) {
              const body = await resp.json();
              if (body.success && body.report) {
                setReport(body.report.fullReportJSON || body.report.fullReport || body.report);
                return;
              }
            }
          } catch (err) {
            console.warn('Failed to fetch report from server', err?.message || err);
          }
        }

        // fallback to localStorage
        const stores = JSON.parse(localStorage.getItem('page_pulse_reports') || '{}');
        const r = stores[id];
        if (!r) {
          setError('Report not found or expired');
          return;
        }
        setReport(r);
      } catch (e) {
        console.error(e);
        setError('Failed to load report');
      }
    })();
  }, []);

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-950 text-white">
      <div className="absolute -left-32 top-0 h-96 w-96 rounded-full bg-blue-600/20 blur-[120px]"></div>
      <div className="absolute bottom-0 right-0 h-96 w-96 rounded-full bg-cyan-500/20 blur-[120px]"></div>

      <Header />
      <main className="relative z-10 mx-auto max-w-[1280px] px-4 md:px-6 py-12">
        <div className="rounded-3xl border border-slate-700 bg-slate-900 p-6">
          {error ? (
            <div className="text-red-400">{error}</div>
          ) : report ? (
            <div>
              <div className="mb-6">
                <div className="text-sm text-slate-400">Report for</div>
                <div className="text-2xl font-bold">{report.title || report.url}</div>
                <div className="text-sm text-slate-500">{report.url} â€¢ {new Date(report.date).toLocaleString()}</div>
              </div>

              <ReportSection report={report} />
            </div>
          ) : (
            <div className="text-slate-400">Loading report...</div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}

export default ReportPage;
