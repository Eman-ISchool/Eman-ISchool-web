import ReferenceDashboardShell from '@/components/dashboard/ReferenceDashboardShell';

export default function DashboardLoading() {
  return (
    <ReferenceDashboardShell>
      <div className="space-y-6 p-6">
        {/* Header skeleton */}
        <div className="flex items-center justify-between">
          <div className="h-10 w-40 animate-pulse rounded-full bg-slate-200" />
          <div className="h-8 w-48 animate-pulse rounded bg-slate-200" />
        </div>

        {/* Stat cards skeleton */}
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="rounded-2xl border border-slate-200 bg-white p-5">
              <div className="flex items-center justify-between">
                <div className="h-4 w-24 animate-pulse rounded bg-slate-200" />
                <div className="h-5 w-5 animate-pulse rounded bg-slate-200" />
              </div>
              <div className="mt-3 h-8 w-16 animate-pulse rounded bg-slate-200" />
            </div>
          ))}
        </div>

        {/* Table skeleton */}
        <div className="rounded-2xl border border-slate-200 bg-white">
          <div className="border-b border-slate-200 p-5">
            <div className="h-6 w-40 animate-pulse rounded bg-slate-200" />
          </div>
          <div className="p-4 space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center gap-4">
                <div className="h-4 w-12 animate-pulse rounded bg-slate-200" />
                <div className="h-4 w-32 animate-pulse rounded bg-slate-200" />
                <div className="h-4 flex-1 animate-pulse rounded bg-slate-200" />
                <div className="h-4 w-20 animate-pulse rounded bg-slate-200" />
                <div className="h-4 w-24 animate-pulse rounded bg-slate-200" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </ReferenceDashboardShell>
  );
}
