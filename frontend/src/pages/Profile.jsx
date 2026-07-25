import React, { useEffect, useState } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { getApiUrl, getAuthHeaders } from '../apiClient';

export default function Profile(){
  const [user,setUser] = useState(null);
  const [reports,setReports] = useState([]);
  const [loading,setLoading] = useState(true);

  useEffect(()=>{
    (async ()=>{
      try{
        const token = localStorage.getItem('pp_token');
        if (!token) { window.location.href = '/login'; return; }
        const resp = await fetch(getApiUrl(`/api/auth/me`), { headers: getAuthHeaders() });
        const body = await resp.json();
        if (resp.ok && body.success) {
          setUser(body.user);
        }
        const r2 = await fetch(getApiUrl(`/api/reports`), { headers: getAuthHeaders() });
        const b2 = await r2.json();
        if (r2.ok && b2.success) setReports(b2.reports || []);
      } catch (err) { console.error(err); }
      setLoading(false);
    })();
  },[]);

  const logout = () => {
    localStorage.removeItem('pp_token');
    localStorage.removeItem('pp_user');
    window.location.href = '/';
  };

  const downloadReport = async (r) => {
    try {
      const blob = new Blob([JSON.stringify(r.fullReportJSON || r.fullReport || r, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `report-${r.id || 'report'}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) { console.error(err); }
  };

  if (loading) return (<div className="min-h-screen bg-slate-950 text-white"><Header /><main className="mx-auto max-w-[1280px] px-4 md:px-6 py-12">Loading...</main><Footer/></div>);

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <Header />
      <main className="mx-auto max-w-[1280px] px-4 md:px-6 py-12">
        <div className="rounded-2xl border border-slate-700 bg-slate-900 p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="text-sm text-slate-400">Signed in as</div>
              <div className="text-lg font-bold">{user?.name} â€” <span className="text-slate-300">{user?.email}</span></div>
            </div>
            <div>
              <button onClick={logout} className="rounded-md bg-red-600 px-3 py-1">Sign out</button>
            </div>
          </div>

          <h3 className="text-lg font-semibold mb-2">My Reports</h3>
          {reports.length === 0 ? <div className="text-slate-400">No reports yet</div> : (
            <div className="space-y-3">
              {reports.map(r => (
                <div key={r.id} className="rounded-md border border-slate-800 bg-slate-950 p-3 flex items-center justify-between">
                  <div>
                    <div className="text-sm text-slate-300">{r.websiteURL}</div>
                    <div className="text-xs text-slate-500">{new Date(r.createdAt).toLocaleString()} â€¢ Score: {r.overallScore} â€¢ Grade: {r.grade}</div>
                  </div>
                  <div className="flex gap-2">
                    <a href={`/report/${r.id}`} className="rounded-md bg-indigo-600 px-3 py-1">Open</a>
                    <button onClick={()=>downloadReport(r)} className="rounded-md bg-blue-600 px-3 py-1">Download</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}

