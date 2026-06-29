export default function Loading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-indigo-600 via-purple-600 to-violet-700">
      <div className="text-center">
        <div className="w-20 h-20 bg-white/20 backdrop-blur-xl rounded-3xl flex items-center justify-center shadow-2xl mx-auto mb-6">
          <span className="text-white text-4xl">✓</span>
        </div>
        <h1 className="text-2xl font-extrabold text-white mb-1">لایف استایل</h1>
        <p className="text-white/60 text-sm">مدیریت زندگی</p>
        <div className="w-8 h-8 border-3 border-white/30 border-t-white rounded-full animate-spin mx-auto mt-8" />
      </div>
    </div>
  );
}
