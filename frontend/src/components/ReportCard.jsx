function ReportCard({ title, content }) {
  return (
    <div className="rounded-2xl border border-slate-700 bg-slate-900 p-6 shadow-lg min-h-[160px] h-full">
      <h3 className="mb-3 text-xl font-bold text-blue-400">
        {title}
      </h3>

      <p className="text-slate-300">
        {content}
      </p>
    </div>
  );
}

export default ReportCard;