import React, { useEffect, useState } from 'react';
import { getScoreColor, clampScore } from '../utils/scoreUtils';

function CircularScore({ size = 96, stroke = 10, value = 0, label }) {
  const [animated, setAnimated] = useState(0);

  useEffect(() => {
    // animate smoothly to value
    let raf;
    let start;
    const duration = 900;
    const from = animated;
    const to = clampScore(value);

    const step = (timestamp) => {
      if (!start) start = timestamp;
      const progress = Math.min(1, (timestamp - start) / duration);
      const current = Math.round(from + (to - from) * easeOutCubic(progress));
      setAnimated(current);
      if (progress < 1) raf = requestAnimationFrame(step);
    };

    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (animated / 100) * circumference;

  function easeOutCubic(t) {
    return 1 - Math.pow(1 - t, 3);
  }

  // color scale
  const color = getScoreColor(animated);
  const lighter = '#ffffff33';

  return (
    <div className="flex items-center gap-4">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <defs>
          <linearGradient id={`grad-${label}`} x1="0%" x2="100%">
            <stop offset="0%" stopColor={color} />
            <stop offset="100%" stopColor={lighter} />
          </linearGradient>
        </defs>
        <g transform={`translate(${size/2}, ${size/2})`}>
          <circle
            r={radius}
            fill="transparent"
            stroke="#0b1220"
            strokeWidth={stroke}
          />

          <circle
            r={radius}
            fill="transparent"
            stroke={`url(#grad-${label})`}
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={`${circumference} ${circumference}`}
            strokeDashoffset={offset}
            style={{ transition: 'stroke-dashoffset 0.9s ease-out, stroke 0.6s' }}
            transform={`rotate(-90)`}
          />

          <text
            x="0"
            y="6"
            textAnchor="middle"
            fontSize={18}
            fill={color}
            fontWeight="700"
          >
            {animated}%
          </text>
        </g>
      </svg>
      <div>
        <div className="text-sm text-slate-300">{label}</div>
      </div>
    </div>
  );
}

export default CircularScore;
