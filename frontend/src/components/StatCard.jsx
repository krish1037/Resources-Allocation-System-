import React from 'react';

const COLOR_MAP = {
  orange: { bg: 'bg-orange-50', text: 'text-orange-600', num: 'text-orange-700' },
  blue:   { bg: 'bg-blue-50',   text: 'text-blue-500',   num: 'text-blue-700'   },
  teal:   { bg: 'bg-teal-50',   text: 'text-teal-500',   num: 'text-teal-700'   },
  green:  { bg: 'bg-green-50',  text: 'text-green-500',  num: 'text-green-700'  },
};

export default function StatCard({ label, value, color = 'teal' }) {
  const c = COLOR_MAP[color] ?? COLOR_MAP.teal;
  return (
    <div className={`${c.bg} rounded-xl px-4 py-3`}>
      <p className={`text-xs font-medium ${c.text}`}>{label}</p>
      <p className={`text-2xl font-medium mt-0.5 ${c.num}`}>{value ?? 0}</p>
    </div>
  );
}
