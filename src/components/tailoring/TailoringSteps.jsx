export function TailoringSteps({ steps, currentStep, stepErrors, results, onRetry }) {
  return (
    <div className="space-y-3 w-full max-w-sm">
      {steps.map(step => {
        const done   = currentStep > step.id || (currentStep === 5 && results)
        const active = currentStep === step.id && !stepErrors[step.id]
        const failed = !!stepErrors[step.id]

        return (
          <div
            key={step.id}
            className="flex items-center gap-4 p-4 rounded-xl transition-all"
            style={{
              backgroundColor: active || failed ? 'white' : 'transparent',
              boxShadow: active || failed ? '0 4px 20px rgba(3,22,49,0.08)' : 'none',
              border: failed ? '1px solid #ffdad6' : 'none',
            }}
          >
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{
                backgroundColor: done ? '#031631' : failed ? '#ffdad6' : active ? '#e1e0ff' : '#eceef0',
              }}
            >
              {done ? (
                <span className="material-symbols-outlined icon-filled text-[16px] text-white">check</span>
              ) : failed ? (
                <span className="material-symbols-outlined icon-filled text-[16px] text-[#93000a]">report</span>
              ) : (
                <span
                  className={`material-symbols-outlined icon-filled text-[16px] ${active ? 'animate-spin' : ''}`}
                  style={{ color: active ? '#0e0099' : '#c5c6ce' }}
                >
                  {active ? 'progress_activity' : step.icon}
                </span>
              )}
            </div>

            <div className="flex-1">
              <p
                className="font-semibold text-sm"
                style={{ color: done || active ? '#031631' : failed ? '#93000a' : '#c5c6ce' }}
              >
                {step.label}
              </p>
              {failed && (
                <p className="text-[10px] font-bold text-[#93000a] mt-0.5">
                  Connection lost or AI timed out
                </p>
              )}
            </div>

            {done   && <span className="text-xs font-bold" style={{ color: '#0e0099' }}>Done</span>}
            {active && <span className="text-xs font-bold animate-pulse" style={{ color: '#0e0099' }}>Working...</span>}
            {failed && (
              <button
                onClick={() => onRetry(step.id)}
                className="px-3 py-1.5 rounded-lg bg-[#93000a] text-white text-[10px] font-bold uppercase tracking-widest active:scale-95 transition-all"
              >
                Retry
              </button>
            )}
          </div>
        )
      })}
    </div>
  )
}
