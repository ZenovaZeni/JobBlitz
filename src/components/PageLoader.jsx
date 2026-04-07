export default function PageLoader() {
  return (
    <div className="flex h-screen items-center justify-center flex-col gap-4"
      style={{ backgroundColor: '#f7f9fb' }}>
      <div className="relative w-12 h-12">
        <div className="absolute inset-0 rounded-full border-4 border-[#eceef0]" />
        <div className="absolute inset-0 rounded-full border-4 border-t-[#0e0099] border-r-transparent border-b-transparent border-l-transparent animate-spin" />
      </div>
      <p className="text-[11px] font-black uppercase tracking-[0.2em]" style={{ color: '#c5c6ce' }}>
        Loading
      </p>
    </div>
  )
}
