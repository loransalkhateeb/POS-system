function Pulse({ className }) {
  return <div className={`bg-gray-200 rounded-xl animate-pulse ${className}`} />;
}

export default function LoadingSkeleton() {
  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="bg-white rounded-2xl border border-gray-100 p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <Pulse className="h-10 w-48" />
          <Pulse className="h-10 flex-1" />
          <Pulse className="h-10 w-24" />
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white rounded-2xl border border-gray-100 p-5 space-y-3">
            <Pulse className="h-4 w-24" />
            <Pulse className="h-8 w-32" />
            <Pulse className="h-3 w-20" />
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 p-5">
          <Pulse className="h-5 w-40 mb-4" />
          <Pulse className="h-64 w-full" />
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 p-5 space-y-4">
          <Pulse className="h-5 w-36" />
          <Pulse className="h-48 w-full" />
          {[...Array(3)].map((_, i) => (
            <Pulse key={i} className="h-10 w-full" />
          ))}
        </div>
      </div>
      <div className="bg-white rounded-2xl border border-gray-100 p-5 space-y-3">
        <Pulse className="h-5 w-36" />
        {[...Array(3)].map((_, i) => (
          <Pulse key={i} className="h-14 w-full" />
        ))}
      </div>
    </div>
  );
}
