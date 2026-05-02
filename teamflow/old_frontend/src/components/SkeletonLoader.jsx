export default function SkeletonLoader({ type = 'card', count = 1 }) {
  const items = Array.from({ length: count });

  if (type === 'stat') {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {items.map((_, i) => (
          <div key={i} className="neu-raised p-6">
            <div className="skeleton w-12 h-12 rounded-xl mb-4" />
            <div className="skeleton h-9 w-16 mb-2 rounded-lg" />
            <div className="skeleton h-4 w-24 rounded-lg" />
          </div>
        ))}
      </div>
    );
  }

  if (type === 'project') {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {items.map((_, i) => (
          <div key={i} className="neu-raised p-6">
            <div className="skeleton h-6 w-36 mb-3 rounded-lg" />
            <div className="skeleton h-4 w-full mb-2 rounded-lg" />
            <div className="skeleton h-4 w-3/4 mb-5 rounded-lg" />
            <div className="flex gap-1 mb-4">{[1,2,3].map(j => <div key={j} className="skeleton w-7 h-7 rounded-full" />)}</div>
            <div className="skeleton h-1.5 w-full mb-5 rounded-lg" />
            <div className="skeleton h-11 w-full rounded-xl" />
          </div>
        ))}
      </div>
    );
  }

  if (type === 'kanban') {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[1, 2, 3].map((col) => (
          <div key={col} className="neu-raised p-4">
            <div className="skeleton h-4 w-28 mb-4 rounded-lg" />
            {items.map((_, i) => (
              <div key={i} className="neu-inset p-4 mb-3">
                <div className="skeleton h-4 w-40 mb-2 rounded-lg" />
                <div className="skeleton h-3 w-full mb-3 rounded-lg" />
                <div className="flex justify-between">
                  <div className="skeleton h-3 w-16 rounded-lg" />
                  <div className="skeleton h-7 w-7 rounded-full" />
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {items.map((_, i) => (
        <div key={i} className="neu-raised p-6">
          <div className="skeleton h-5 w-48 mb-3 rounded-lg" />
          <div className="skeleton h-4 w-full mb-2 rounded-lg" />
          <div className="skeleton h-4 w-2/3 rounded-lg" />
        </div>
      ))}
    </div>
  );
}
