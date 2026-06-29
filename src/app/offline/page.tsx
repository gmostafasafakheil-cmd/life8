"use client";

export default function OfflinePage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 via-indigo-50/30 to-purple-50/20 p-6">
      <div className="text-center max-w-sm">
        <div className="w-20 h-20 bg-gradient-to-br from-primary to-secondary rounded-3xl flex items-center justify-center shadow-xl mx-auto mb-6">
          <span className="text-white text-3xl">📴</span>
        </div>
        <h1 className="text-xl font-extrabold text-slate-800 mb-3">آفلاین هستید</h1>
        <p className="text-sm text-slate-500 leading-7 mb-6">
          اتصال اینترنت شما قطع شده است. لطفاً اتصال خود را بررسی کنید و دوباره تلاش کنید.
        </p>
        <button
          onClick={() => window.location.reload()}
          className="px-6 py-3 bg-gradient-to-l from-primary to-secondary text-white rounded-xl text-sm font-medium hover:opacity-90 transition-opacity shadow-lg shadow-primary/25 cursor-pointer"
        >
          تلاش مجدد
        </button>
      </div>
    </div>
  );
}
