import React from "react";
import {
  Activity,
  Clock3,
  Search,
  ShieldCheck,
  CheckCircle,
} from "lucide-react";
import CircularScore from "./CircularScore";
import { getScoreColor, getGrade, clampScore } from '../utils/scoreUtils';

function StatsGrid({ report }) {
  const seo = clampScore(report?.seoScore ?? 0);
  const perf = clampScore(report?.performanceScore ?? 0);
  const acc = clampScore(report?.accessibilityScore ?? 0);
  const sec = clampScore(report?.securityScore ?? 0);
  // Weighted overall score: SEO 35%, Performance 25%, Accessibility 20%, Security 20%
  const overall = clampScore(Math.round((seo * 0.35) + (perf * 0.25) + (acc * 0.20) + (sec * 0.20)));
  const grade = getGrade(overall);

  const stats = [
    {
      title: "Overall Grade",
      value: grade,
      icon: <CheckCircle size={28} />,
      type: "grade",
      color: getScoreColor(overall),
    },
    {
      title: "Overall Score",
      value: `${overall}%`,
      icon: <CheckCircle size={28} />,
      type: "plain",
      color: getScoreColor(overall),
    },
    {
      title: "HTTP Status",
      value: report?.statusCode ?? "--",
      icon: <Activity size={28} />,
      type: "plain",
    },
    {
      title: "Response Time",
      value: report?.responseTime ? `${report.responseTime} ms` : "-- ms",
      icon: <Clock3 size={28} />,
      type: "plain",
    },
    {
      title: "SEO Score",
      value: seo,
      icon: <Search size={28} />,
      type: "circular",
      color: getScoreColor(seo),
    },
    {
      title: "Performance Score",
      value: perf,
      icon: <Clock3 size={28} />,
      type: "circular",
      color: getScoreColor(perf),
    },
    {
      title: "Accessibility Score",
      value: acc,
      icon: <ShieldCheck size={28} />,
      type: "circular",
      color: getScoreColor(acc),
    },
    {
      title: "Security Score",
      value: sec,
      icon: <ShieldCheck size={28} />,
      type: "circular",
      color: getScoreColor(sec),
    },
  ];

  return (
    <section className="mt-12">
      <h2 className="mb-6 text-2xl font-bold">Overview</h2>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((item) => (
          <div
            key={item.title}
            className="col-span-1 rounded-2xl border border-slate-700 bg-slate-900 p-6 shadow transition transform hover:-translate-y-0.5 h-full"
            style={{ borderColor: item.color || undefined }}
          >
            <div className="flex items-center justify-between">
              <div className="text-slate-200">{item.icon}</div>
              <div className="text-sm text-slate-400">{item.title}</div>
            </div>

            <div className="mt-4">
              {item.type === "circular" ? (
                <CircularScore label={item.title} value={Number(item.value) || 0} />
              ) : item.type === 'grade' ? (
                <div className="flex items-center gap-3">
                  <div className="rounded-full p-3" style={{ background: item.color }}>
                    <div className="text-xl font-bold text-black">{item.value}</div>
                  </div>
                  <div>
                    <div className="text-sm text-slate-400">Overall Grade</div>
                    <div className="text-2xl font-semibold text-slate-200">{item.value}</div>
                  </div>
                </div>
              ) : (
                <div className="text-2xl font-semibold text-slate-200">{item.value}</div>
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export default StatsGrid;