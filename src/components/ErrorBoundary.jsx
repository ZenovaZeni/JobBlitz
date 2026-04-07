import { Component } from 'react'

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, info) {
    console.error('[ErrorBoundary]', error, info)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex h-screen items-center justify-center p-6 text-center"
          style={{ backgroundColor: '#f7f9fb' }}>
          <div className="max-w-sm">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6"
              style={{ backgroundColor: '#ffdad6' }}>
              <span className="material-symbols-outlined text-[32px]" style={{ color: '#93000a' }}>
                error_outline
              </span>
            </div>
            <h2 className="text-xl font-extrabold mb-2 tracking-tight"
              style={{ fontFamily: 'Manrope', color: '#031631' }}>
              Something went wrong
            </h2>
            <p className="text-sm mb-6 leading-relaxed" style={{ color: '#8293b4' }}>
              An unexpected error occurred. Your data is safe — refresh the page to continue.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-3 text-white font-bold rounded-xl ai-glow-btn inline-flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px]">refresh</span>
              Reload Page
            </button>
            {this.props.showDetail && this.state.error && (
              <p className="mt-4 text-[10px] font-mono text-left p-3 rounded-lg overflow-auto"
                style={{ backgroundColor: '#f2f4f6', color: '#75777e' }}>
                {this.state.error.toString()}
              </p>
            )}
          </div>
        </div>
      )
    }
    return this.props.children
  }
}
