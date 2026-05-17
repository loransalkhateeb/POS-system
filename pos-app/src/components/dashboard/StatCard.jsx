import { useEffect, useRef, useState } from 'react';

export default function StatCard({ title, value, icon: Icon, subtitle, color = 'primary', delay = 0 }) {
  const [visible, setVisible] = useState(false);
  const ref = useRef();

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);

  const colorClasses = {
    primary: { bg: 'bg-primary-50', text: 'text-primary-600', glow: 'shadow-primary-500/10' },
    green: { bg: 'bg-emerald-50', text: 'text-emerald-600', glow: 'shadow-emerald-500/10' },
    blue: { bg: 'bg-blue-50', text: 'text-blue-600', glow: 'shadow-blue-500/10' },
    orange: { bg: 'bg-orange-50', text: 'text-orange-600', glow: 'shadow-orange-500/10' },
  };

  const c = colorClasses[color];

  return (
    <div
      ref={ref}
      className={`
        bg-white rounded-2xl shadow-sm border border-gray-100 p-5
        hover:shadow-lg hover:border-primary-100 hover:-translate-y-1
        transition-all duration-500 ease-out cursor-default
        ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}
      `}
      style={{ transitionDelay: `${delay}ms` }}
    >
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-sm text-gray-500 font-medium">{title}</p>
          <p
            className={`text-2xl md:text-3xl font-bold text-gray-800 transition-all duration-700 ease-out ${
              visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3'
            }`}
            style={{ transitionDelay: `${delay + 200}ms` }}
          >
            {value}
          </p>
          {subtitle && (
            <p className="text-xs text-gray-400 font-medium mt-1">{subtitle}</p>
          )}
        </div>
        <div className={`p-3 rounded-xl ${c.bg} ${c.text} shadow-lg ${c.glow}`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </div>
  );
}
