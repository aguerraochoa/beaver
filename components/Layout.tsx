'use client'

import { useState, useEffect } from 'react'
import Sidebar from './Sidebar'

export default function Layout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 1024
      setIsMobile(mobile)
      
      if (mobile) {
        setSidebarOpen(false)
      } else {
        setSidebarOpen(true)
      }
    }
    
    const initialMobile = window.innerWidth < 1024
    setIsMobile(initialMobile)
    if (initialMobile) {
      setSidebarOpen(false)
    }
    
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  return (
    <div className="flex h-screen overflow-hidden bg-[#e8f0f8]">
      <Sidebar isOpen={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />
      
      <div
        className={`
          flex-1 flex flex-col overflow-hidden
          transition-all duration-300 ease-in-out
          ${sidebarOpen ? 'lg:ml-64' : 'lg:ml-20'}
        `}
      >
        {isMobile && (
          <header className="lg:hidden bg-white border-b border-gray-200 h-14 flex items-center justify-between px-4 z-30 relative shadow-sm">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                aria-label={sidebarOpen ? 'Close menu' : 'Open menu'}
              >
                <svg
                  className="w-6 h-6 text-gray-700"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  {sidebarOpen ? (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  ) : (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 6h16M4 12h16M4 18h16"
                    />
                  )}
                </svg>
              </button>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-[#1e3a5f] flex items-center justify-center">
                  <svg
                    className="w-5 h-5 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                    />
                  </svg>
                </div>
                <h1 className="text-xl font-bold text-[#1e3a5f]">Beaver</h1>
              </div>
            </div>
          </header>
        )}

        <main className="flex-1 overflow-y-auto">
          <div className="p-4 lg:p-6 max-w-7xl mx-auto w-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
