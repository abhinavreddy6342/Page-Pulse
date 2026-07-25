import React, { useEffect, useState } from 'react';
import { getApiUrl, getAuthHeaders } from '../apiClient';

function HistoryPanel({ onLoad }) {
  const [items, setItems] = useState([]);
  const [query, setQuery] = useState('');

  const loadFromStorage = async () => {
    try {
      const token = localStorage.getItem('pp_token');
      if (token) {
        // fetch from server for authenticated user
        try {
          const resp = await fetch(getApiUrl(`/api/reports`), { headers: getAuthHeaders() });
          if (resp.ok) {
            const body = await resp.json();
            if (body.success && Array.isArray(body.reports)) {
              const list = body.reports.map(r => ({
                url: r.websiteURL,
                date: r.createdAt,
                reportId: r.id,
                overallScore: r.overallScore,
                grade: r.grade,
                seoScore: r.seoScore,
                performanceScore: r.performanceScore,
                accessibilityScore: r.accessibilityScore,
                securityScore: r.securityScore,
                report: r.fullReportJSON || r.fullReport
              }));
              setItems(list.slice(0,50));
              return;
            }
          }
        } catch (err) {
          console.warn('Failed to load server history', err?.message || err);
        }
      }

      // fallback to localStorage
      const raw = localStorage.getItem('page_pulse_history');
      const parsed = raw ? JSON.parse(raw) : [];
      setItems(parsed.slice(0,50));
    } catch (e) {
      setItems([]);
    }
  };

  useEffect(() => {
    loadFromStorage();
  }, []);

  useEffect(() => {
    const onStorage = () => loadFromStorage();
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const reloadItem = (it) => {
    if (onLoad) onLoad(it.report);
  };

  const viewReport = (it) => {
    // navigate to report page if id available
    if (it.reportId) {
      window.location.href = `/report/${it.reportId}`;
    } else {
      // ensure stored and get id
      try {
        const stores = JSON.parse(localStorage.getItem('page_pulse_reports') || '{}');
        const id = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2,8)}`;
        it.report.reportId = id;
        stores[id] = it.report;
        localStorage.setItem('page_pulse_reports', JSON.stringify(stores));
        // update history
        const raw = localStorage.getItem('page_pulse_history');
        const arr = raw ? JSON.parse(raw) : [];
        for (let i=0;i<arr.length;i++){
          if (arr[i].url === it.url && arr[i].date === it.date) { arr[i].reportId = id; break; }
        }
        localStorage.setItem('page_pulse_history', JSON.stringify(arr));
        window.location.href = `/report/${id}`;
      } catch (e) { console.error(e); }
    }
  };

  const deleteItem = async (index) => {
    try {
      const token = localStorage.getItem('pp_token');
      if (token && items[index] && items[index].reportId) {
        // attempt server delete
        try {
          await fetch(getApiUrl(`/api/reports/${items[index].reportId}`), { method: "DELETE", headers: getAuthHeaders() });
        } catch (err) { /* continue to remove locally */ }
        // refresh list from server
        await loadFromStorage();
        return;
      }

      const raw = localStorage.getItem('page_pulse_history');
      const parsed = raw ? JSON.parse(raw) : [];
      parsed.splice(index, 1);
      localStorage.setItem('page_pulse_history', JSON.stringify(parsed));
      setItems(parsed.slice(0,50));
    } catch (e) {
      // ignore
    }
  };

  const clearHistory = () => {
    try {
      localStorage.removeItem('page_pulse_history');
      setItems([]);
    } catch (e) { }
  };

  const filtered = items.filter(it => {
    if (!query) return true;
    return (it.url || '').toLowerCase().includes(query.toLowerCase()) || (it.report && (it.report.title || '').toLowerCase().includes(query.toLowerCase()));
  });

  if (items.length === 0) return (
    <div className="rounded-2xl border border-slate-700 bg-slate-900 p-4 text-slate-400">No history yet</div>
  );

  return (
    <div className="rounded-2xl border border-slate-700 bg-slate-900 p-4">
      <div className="flex items-center justify-between mb-2">
        <h4 className="text-lg font-semibold">History</h4>
        <div className="flex items-center gap-2">
          <input value={query} onChange={(e)=>setQuery(e.target.value)} placeholder="Search" className="text-sm rounded-md bg-slate-800 px-2 py-1 text-slate-200" />
          <button onClick={clearHistory} className="text-xs text-slate-400 hover:text-red-400">Clear</button>
        </div>
      </div>
      <div className="space-y-2 max-h-[480px] overflow-auto">
        {filtered.map((it, idx) => (
          <div key={idx} className="w-full rounded-md p-2 bg-slate-950 border border-slate-800">
            <div className="flex items-center justify-between">
              <div className="text-sm text-slate-300">{it.url}</div>
              <div className="text-xs text-slate-500">{new Date(it.date).toLocaleString()}</div>
            </div>
            <div className="mt-2 text-xs text-slate-400 flex items-center justify-between">
              <div>
                <span className="mr-2">Overall: <strong className="text-slate-200">{it.overallScore ?? (it.report && it.report.overallScore) ?? 'â€”'}</strong></span>
                <span className="mr-2">Grade: <strong className="text-slate-200">{it.grade ?? (it.report && it.report.grade) ?? 'â€”'}</strong></span>
              </div>
              <div className="flex gap-2">
                <button onClick={()=>reloadItem(it)} className="text-xs rounded-md bg-blue-600 px-3 py-1 hover:bg-blue-700">Load</button>
                <button onClick={()=>viewReport(it)} className="text-xs rounded-md bg-indigo-600 px-3 py-1 hover:bg-indigo-700">View</button>
                <button onClick={()=>deleteItem(idx)} className="text-xs rounded-md bg-red-600 px-3 py-1 hover:bg-red-700">Delete</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default HistoryPanel;


