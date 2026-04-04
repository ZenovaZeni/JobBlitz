import React, { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'

/**
 * MobileDrawer: A pull-up drawer for mobile interfaces.
 * @param {boolean} isOpen - Whether the drawer is visible.
 * @param {function} onClose - Function to call when backdrop or close button is clicked.
 * @param {string} title - Optional title for the drawer header.
 * @param {React.ReactNode} children - Content to render inside the drawer.
 */
export default function MobileDrawer({ isOpen, onClose, title, children }) {
  const [mounted, setMounted] = useState(false)
  const [shouldRender, setShouldRender] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (isOpen) {
      setShouldRender(true)
      document.body.style.overflow = 'hidden'
    } else {
      const timer = setTimeout(() => {
        setShouldRender(false)
        document.body.style.overflow = ''
      }, 300) // Match animation duration
      return () => clearTimeout(timer)
    }
  }, [isOpen])

  if (!mounted || !shouldRender) return null

  return createPortal(
    <div className="fixed inset-0 z-[100] flex flex-col justify-end overflow-hidden lg:hidden">
      {/* Backdrop */}
      <div 
        className={`absolute inset-0 bg-black/40 transition-opacity duration-300 ease-out ${isOpen ? 'opacity-100' : 'opacity-0'}`}
        onClick={onClose}
      />

      {/* Drawer */}
      <div 
        className={`relative bg-white rounded-t-[32px] w-full max-h-[85vh] flex flex-col shadow-2xl transition-transform duration-300 ease-out transform ${
          isOpen ? 'translate-y-0' : 'translate-y-full'
        }`}
        style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
      >
        {/* Handle */}
        <div className="flex justify-center py-3" onClick={onClose}>
          <div className="w-10 h-1 rounded-full bg-[#eceef0]" />
        </div>

        {/* Header */}
        <div className="px-6 pb-4 flex items-center justify-between border-b" style={{ borderColor: 'rgba(197,198,206,0.1)' }}>
          <h2 className="text-base font-extrabold" style={{ fontFamily: 'Manrope', color: '#031631' }}>{title}</h2>
          <button onClick={onClose} className="p-2 -mr-2 text-[#8293b4]">
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto custom-scroll p-4">
          {children}
        </div>
      </div>
    </div>,
    document.body
  )
}
