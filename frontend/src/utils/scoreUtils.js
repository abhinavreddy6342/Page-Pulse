export function getScoreColor(score) {
  const s = Number(score ?? 0);
  if (s >= 90) return '#16a34a'; // Green
  if (s >= 75) return '#2563eb'; // Blue
  if (s >= 60) return '#f59e0b'; // Yellow
  if (s >= 40) return '#f97316'; // Orange
  return '#ef4444'; // Red
}

export function getGrade(score) {
  const s = Number(score ?? 0);
  // New grade mapping
  if (s >= 90) return 'A+';
  if (s >= 80) return 'A';
  if (s >= 70) return 'B';
  if (s >= 60) return 'C';
  if (s >= 50) return 'D';
  return 'F';
}

export function clampScore(val) {
  const n = Number(val);
  if (Number.isNaN(n)) return 0;
  return Math.max(0, Math.min(100, Math.round(n)));
}
