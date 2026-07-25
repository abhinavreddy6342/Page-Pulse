import {
  Gauge,
  Search,
  ShieldCheck,
  Clock3,
} from "lucide-react";

function Features({ report }) {
const features = [
  {
    icon: <Gauge size={32} />,
    title: "Performance",
    description: report
      ? `Response Time: ${report.responseTime} ms`
      : "Measure website response time.",
  },
  {
    icon: <Search size={32} />,
    title: "SEO Analysis",
    description: report
      ? `Title: ${report.title || "Not Found"}`
      : "Check title, meta description and H1.",
  },
  {
    icon: <ShieldCheck size={32} />,
    title: "Accessibility",
    description: report
      ? `Missing Alt Images: ${report.missingAltImages}`
      : "Detect images missing alt text.",
  },
  {
    icon: <Clock3 size={32} />,
    title: "Fast Audit",
    description: report
      ? `HTTP Status: ${report.httpStatus || report.status || report.httpStatusCode || "200"}`
      : "Complete analysis within seconds.",
  },
];

  return (
    <section className="grid gap-6 py-20 md:grid-cols-2 lg:grid-cols-4">

      {features.map((item) => (

        <div
          key={item.title}
          className="rounded-2xl border border-slate-700 bg-slate-900/70 p-8 transition hover:-translate-y-2 hover:border-blue-500 hover:shadow-2xl"
        >

          <div className="mb-5 text-blue-400">
            {item.icon}
          </div>

          <h3 className="text-xl font-bold">
            {item.title}
          </h3>

          <p className="mt-3 text-slate-400">
            {item.description}
          </p>

        </div>

      ))}

    </section>
  );
}

export default Features;