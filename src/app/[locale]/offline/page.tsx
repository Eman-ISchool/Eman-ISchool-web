'use client';

export default function OfflinePage() {
  return (
    <div
      dir="rtl"
      className="flex min-h-screen flex-col items-center justify-center bg-[#f6f6f7] px-6 text-center"
    >
      <div className="rounded-2xl bg-white p-10 shadow-sm">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-slate-100">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-8 w-8 text-slate-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M18.364 5.636a9 9 0 11-12.728 0M12 9v4m0 4h.01"
            />
          </svg>
        </div>
        <h1 className="text-2xl font-black text-slate-950">غير متصل بالإنترنت</h1>
        <p className="mt-3 text-sm text-slate-500">
          يبدو أنك غير متصل بالإنترنت. تحقق من اتصالك وحاول مرة أخرى.
        </p>
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="mt-6 rounded-2xl bg-slate-950 px-8 py-3 text-sm font-bold text-white transition hover:bg-slate-800"
        >
          إعادة المحاولة
        </button>
      </div>
    </div>
  );
}
