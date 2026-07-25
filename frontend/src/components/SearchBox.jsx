import { useState, useRef, useEffect } from "react";
import axios from "axios";
import { getApiUrl, getAuthHeaders } from "../apiClient";

function normalizeTargetUrl(rawUrl) {
  const trimmed = (rawUrl || "").trim();
  if (!trimmed) return "";
  return /^https?:\/\//i.test(trimmed) ? trimmed : `http://${trimmed}`;
}

function SearchBox({ setReport }) {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [statusText, setStatusText] = useState("");
  const progressRef = useRef(null);
  const [recent, setRecent] = useState([]);

  const stages = [
    'Fetching website',
    'Checking SEO',
    'Checking Performance',
    'Checking Accessibility',
    'Checking Security',
    'Generating Report',
    'Completed'
  ];

  useEffect(() => {
    try {
      const raw = localStorage.getItem('page_pulse_history');
      const parsed = raw ? JSON.parse(raw) : [];
      setRecent(parsed.slice(0,5));
    } catch (e) {
      setRecent([]);
    }
  }, []);

  useEffect(() => {
    return () => {
      if (progressRef.current) clearInterval(progressRef.current);
    };
  }, []);

  const startProgress = () => {
    let idx = 0;
    setStatusText(stages[0]);
    progressRef.current = setInterval(() => {
      idx = Math.min(stages.length - 1, idx + 1);
      setStatusText(stages[idx]);
    }, 800);
  };

  const stopProgress = () => {
    if (progressRef.current) {
      clearInterval(progressRef.current);
      progressRef.current = null;
    }
    setStatusText("");
  };

  const analyzeWebsite = async (targetUrl) => {
    setError("");
    const useUrl = targetUrl || url;
    const normalizedUrl = normalizeTargetUrl(useUrl);

    if (!normalizedUrl) {
      setError("Please enter website URL");
      return;
    }

    // validate URL early
    try {
      new URL(normalizedUrl);
    } catch (e) {
      setError('Invalid URL');
      return;
    }

    try {
      setLoading(true);
      startProgress();

      const response = await axios.post(
        getApiUrl('/api/analyze'),
        {
          url: normalizedUrl,
        },
        { timeout: 60000 }
      );

      if (response.data && response.data.success) {
        const data = response.data;
        const mapped = {
          // basic page info
          url: normalizedUrl,
          date: new Date().toISOString(),
          title: data.title ?? data.metaTitle ?? null,
          description: data.metaDescription ?? data.description ?? null,

          // scores and checks
          seoScore: Number(data.seoScore ?? data.seo?.score ?? 0),
          seoChecks: Array.isArray(data.seoChecks) ? data.seoChecks : (Array.isArray(data.seoChecks) ? data.seoChecks : (data.seo && Array.isArray(data.seo.seoChecks) ? data.seo.seoChecks : [])),

          // headings
          headings: (Number(data.h1) || 0) + (Number(data.h2) || 0),
          h1: Number(data.h1) || 0,
          h2: Number(data.h2) || 0,

          // counts
          links: Number(data.links) || 0,
          images: Number(data.images) || 0,
          missingAltImages: Number(data.imagesWithoutAlt ?? data.missingAltImages ?? (data.accessibility && data.accessibility.imagesWithoutAlt) ?? 0),

          pageSize: Number(data.pageSize) || 0,

          statusCode: data.statusCode ?? data.status ?? null,

          responseTime: Number(data.responseTime) || null,
          performanceScore: Number(data.performanceScore) || null,
          performanceRating: data.performanceRating ?? null,

          wordCount: Number(data.wordCount) || null,

          accessibilityScore: data.accessibilityScore ?? ((data.accessibility && data.accessibility.altCoverage) ? Math.round(data.accessibility.altCoverage) : null),
          accessibilityChecks: Array.isArray(data.accessibilityChecks) ? data.accessibilityChecks : (data.accessibility && Array.isArray(data.accessibility.checks) ? data.accessibility.checks : []),

          securityScore: Number(data.securityScore) || null,
          securityHeaders: data.securityHeaders && typeof data.securityHeaders === 'object' ? data.securityHeaders : (data.security && data.security.securityHeaders && typeof data.security.securityHeaders === 'object' ? data.security.securityHeaders : {}),

          internalLinks: Number(data.internalLinks) || 0,
          externalLinks: Number(data.externalLinks) || 0,
          brokenLinks: Array.isArray(data.brokenLinks) ? data.brokenLinks : (Array.isArray(data.linksBroken) ? data.linksBroken : []),
          brokenImages: Array.isArray(data.brokenImages) ? data.brokenImages : [],

          recommendations: Array.isArray(data.recommendations) ? data.recommendations : (Array.isArray(data.seoRecommendations) ? data.seoRecommendations : []),

          // misc - support both new and legacy shapes and ensure safe values
          // open_graph / og
          open_graph: data.open_graph ?? data.openGraph ?? (data.og ? { exists: Object.keys(data.og).length > 0, title: data.og.title || null, description: data.og.description || null, image: data.og.image || null } : { exists: false, title: null, description: null, image: null }),
          // legacy og for components that still expect it
          og: data.og ?? (data.open_graph && data.open_graph.exists ? { title: data.open_graph.title || null, description: data.open_graph.description || null, image: data.open_graph.image || null } : {}),

          // twitter_card / twitter
          twitter_card: data.twitter_card ?? (data.twitter ? { exists: Object.keys(data.twitter).length > 0, title: data.twitter.title || null, description: data.twitter.description || null, image: data.twitter.image || null } : { exists: false, title: null, description: null, image: null }),
          twitter: data.twitter ?? (data.twitter_card && data.twitter_card.exists ? { card: 'summary', title: data.twitter_card.title || null, description: data.twitter_card.description || null, image: data.twitter_card.image || null } : {}),

          // structured data
          structured_data: data.structured_data ?? (Array.isArray(data.structuredData) ? { exists: data.structuredData.length > 0, schemas: data.structuredData } : { exists: false, schemas: [] }),
          structuredData: Array.isArray(data.structuredData) ? data.structuredData : (Array.isArray(data.structured_data?.schemas) ? data.structured_data.schemas : []),

          hasViewport: data.hasViewport ?? (data.seo && data.seo.viewport ? true : false) ?? (data.open_graph?.exists ? true : (data.openGraph?.viewport ? true : false)),
          hasCanonical: data.hasCanonical ?? (data.seo && data.seo.canonical ? true : false),

          // accessibility bundle
          accessibility: data.accessibility && typeof data.accessibility === 'object' ? data.accessibility : {
            totalImages: Number(data.images) || 0,
            imagesWithAlt: Number(data.images) - Number(data.imagesWithoutAlt || 0) || 0,
            imagesWithoutAlt: Number(data.imagesWithoutAlt ?? 0) || 0,
            altCoverage: data.accessibility?.altCoverage ?? 0,
            headings: data.accessibility?.headings ?? { h1: Number(data.h1) || 0, h2: Number(data.h2) || 0 },
            formsCount: data.accessibility?.formsCount ?? (data.accessibility && Array.isArray(data.accessibility.formsSummary) ? data.accessibility.formsSummary.length : 0),
            formsSummary: Array.isArray(data.accessibility?.formsSummary) ? data.accessibility.formsSummary : (data.formsSummary ? data.formsSummary : []),
          },

          // images lists
          largestImages: Array.isArray(data.largestImages) ? data.largestImages : (Array.isArray(data.imagesWithSizes) ? data.imagesWithSizes : []),
          brokenImagesList: Array.isArray(data.brokenImages) ? data.brokenImages : [],
        };

        // compute overall & grade
        try {
          const seo = Number(mapped.seoScore || 0);
          const perf = Number(mapped.performanceScore || 0);
          const acc = Number(mapped.accessibilityScore || mapped.accessibility?.altCoverage || 0);
          const sec = Number(mapped.securityScore || 0);
          const overall = Math.round((seo * 0.35) + (perf * 0.25) + (acc * 0.20) + (sec * 0.20));
          mapped.overallScore = overall;
          if (overall >= 90) mapped.grade = 'A';
          else if (overall >= 75) mapped.grade = 'B';
          else if (overall >= 60) mapped.grade = 'C';
          else if (overall >= 40) mapped.grade = 'D';
          else mapped.grade = 'F';
        } catch (e) { mapped.overallScore = 0; mapped.grade = 'N/A'; }

        setReport(mapped);

        // attempt to save to server if authenticated (non-blocking)
        try {
          const token = localStorage.getItem('pp_token');
          if (token) {
            // send minimal report to backend
            (async () => {
              try {
                await axios.post(getApiUrl('/api/reports'), {
                  websiteURL: mapped.url,
                  overallScore: mapped.overallScore,
                  grade: mapped.grade,
                  seoScore: mapped.seoScore,
                  performanceScore: mapped.performanceScore,
                  accessibilityScore: mapped.accessibilityScore,
                  securityScore: mapped.securityScore,
                  fullReportJSON: mapped
                }, { headers: getAuthHeaders() });
              } catch (err) {
                // non-fatal, keep client-side history
                console.warn('Remote save failed', err?.message || err);
              }
            })();
          }
        } catch (e) { /* ignore */ }

        // save to history with more metadata
        try {
          const raw = localStorage.getItem('page_pulse_history');
          const arr = raw ? JSON.parse(raw) : [];
          const historyItem = {
            url: normalizedUrl,
            date: mapped.date,
            report: mapped,
            reportId: null,
            overallScore: mapped.overallScore,
            grade: mapped.grade,
            seoScore: mapped.seoScore,
            performanceScore: mapped.performanceScore,
            accessibilityScore: mapped.accessibilityScore,
            securityScore: mapped.securityScore
          };
          arr.unshift(historyItem);
          const trimmed = arr.slice(0, 50);
          localStorage.setItem('page_pulse_history', JSON.stringify(trimmed));
          setRecent(trimmed.slice(0,5));
        } catch (e) {
          // ignore storage errors
        }
      } else {
        setError(response.data?.message || "Analysis failed");
      }
    } catch (err) {
      console.error(err);
      // handle errors more specifically
      if (err.code === 'ECONNABORTED' || (err.message && err.message.toLowerCase().includes('timeout'))) {
        setError('Request timed out. The server or target site may be slow.');
      } else if (err.response && err.response.status >= 500) {
        setError('Server error while analyzing the site. Try again later.');
      } else if (err.message && err.message.toLowerCase().includes('network')) {
        setError('Network error — the site may be blocked or unreachable.');
      } else {
        setError('Analysis failed: ' + (err?.message || 'Unknown error'));
      }
    } finally {
      stopProgress();
      setLoading(false);
    }
  };

  const popular = [
    { name: 'Google', url: 'https://www.google.com' },
    { name: 'GitHub', url: 'https://github.com' },
    { name: 'Wikipedia', url: 'https://www.wikipedia.org' },
    { name: 'OpenAI', url: 'https://openai.com' },
    { name: 'Microsoft', url: 'https://www.microsoft.com' },
    { name: 'Amazon', url: 'https://www.amazon.com' },
  ];

  return (
    <section className="mx-auto max-w-4xl">
      <div className="rounded-3xl border border-slate-700 bg-slate-900 p-8 shadow-2xl">
        <input
          type="text"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://example.com"
          className="w-full rounded-xl border border-slate-700 bg-slate-800 p-4 text-lg text-white outline-none focus:border-blue-500"
        />

        <button
          onClick={() => analyzeWebsite()}
          className="mt-6 w-full rounded-xl bg-blue-600 py-4 text-lg font-semibold transition hover:bg-blue-700 flex items-center justify-center gap-3"
          disabled={loading}
        >
          {loading ? (
            <>
              <svg className="h-5 w-5 animate-spin text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path></svg>
              <span>{statusText || 'Analyzing...'}</span>
            </>
          ) : (
            "🔍 Analyze Website"
          )}
        </button>

        {error && (
          <p className="mt-4 text-sm text-red-400" role="alert">{error}</p>
        )}

        <div className="mt-6 grid gap-2 md:grid-cols-2">
          <div>
            <div className="text-sm text-slate-400">Recent Searches</div>
            <div className="mt-2 flex flex-wrap gap-2">
              {recent.length === 0 ? <div className="text-slate-500">None</div> : recent.map((r, i) => (
                <button key={i} onClick={() => analyzeWebsite(r.url)} className="rounded-md bg-slate-800 px-3 py-1 text-sm hover:bg-slate-700">{r.url}</button>
              ))}
            </div>
          </div>

          <div>
            <div className="text-sm text-slate-400">Quick Tests</div>
            <div className="mt-2 flex flex-wrap gap-2">
              {popular.map((p) => (
                <button key={p.name} onClick={() => analyzeWebsite(p.url)} className="rounded-md bg-slate-800 px-3 py-1 text-sm hover:bg-slate-700">{p.name}</button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default SearchBox;
