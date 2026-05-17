export default function Input({ label, icon: Icon, className = '', ...props }) {
  return (
    <div className="space-y-1.5">
      {label && (
        <label className="block text-sm font-medium text-gray-700">{label}</label>
      )}
      <div className="relative">
        {Icon && (
          <Icon className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        )}
        <input
          className={`
            w-full rounded-xl border border-gray-200 bg-gray-50/50
            px-4 py-2.5 text-sm text-gray-800
            placeholder:text-gray-400
            focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500
            transition-all duration-200
            ${Icon ? 'pr-10' : ''}
            ${className}
          `}
          {...props}
        />
      </div>
    </div>
  );
}
