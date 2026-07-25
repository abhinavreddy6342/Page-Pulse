import React from 'react';
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, CartesianGrid, Cell } from 'recharts';
import { getScoreColor, clampScore } from '../utils/scoreUtils';

export function AuditRadar({ report }) {
  const data = [
    { subject: 'SEO', A: clampScore(report?.seoScore ?? 0) },
    { subject: 'Performance', A: clampScore(report?.performanceScore ?? 0) },
    { subject: 'Accessibility', A: clampScore(report?.accessibilityScore ?? 0) },
    { subject: 'Security', A: clampScore(report?.securityScore ?? 0) },
  ];

  const avg = Math.round(data.reduce((s, d) => s + d.A, 0) / data.length || 0);
  const color = getScoreColor(avg);

  return (
    <div className="rounded-2xl border border-slate-700 bg-slate-900 p-6">
      <h4 className="mb-2 text-lg font-semibold">Scores Radar</h4>
      <ResponsiveContainer width="100%" height={260}>
        <RadarChart cx="50%" cy="50%" outerRadius={90} data={data}>
          <PolarGrid />
          <PolarAngleAxis dataKey="subject" stroke="#94a3b8" />
          <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: '#94a3b8' }} />
          <Radar name="Site" dataKey="A" stroke={color} fill={color} fillOpacity={0.18} isAnimationActive={true} animationDuration={900} />
          <Legend verticalAlign="top" wrapperStyle={{ color: '#94a3b8' }} />
          <Tooltip formatter={(v) => `${v}%`} />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function AuditBar({ report }) {
  const data = [
    { name: 'Response Time (ms)', value: report?.responseTime ?? 0 },
    { name: 'Word Count', value: report?.wordCount ?? 0 },
    { name: 'Images', value: report?.images ?? 0 },
    { name: 'Links', value: report?.links ?? 0 },
    { name: 'Missing Alt Images', value: report?.missingAltImages ?? 0 },
  ];

  const barColors = ['#60a5fa', '#f472b6', '#34d399', '#60a5fa', '#f87171'];

  return (
    <div className="rounded-2xl border border-slate-700 bg-slate-900 p-6">
      <h4 className="mb-2 text-lg font-semibold">Content & Response</h4>
      <ResponsiveContainer width="100%" height={260}>
        <BarChart data={data} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#0f172a" />
          <XAxis dataKey="name" tick={{ fill: '#94a3b8' }} />
          <YAxis tick={{ fill: '#94a3b8' }} />
          <Tooltip formatter={(v) => (typeof v === 'number' ? v.toLocaleString() : v)} />
          <Legend verticalAlign="top" wrapperStyle={{ color: '#94a3b8' }} />
          <Bar dataKey="value" isAnimationActive={true} animationDuration={900}>
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={barColors[index % barColors.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export default function Charts({ report }) {
  return (
    <section className="mt-8 grid gap-6 md:grid-cols-2">
      <AuditRadar report={report} />
      <AuditBar report={report} />
    </section>
  );
}
