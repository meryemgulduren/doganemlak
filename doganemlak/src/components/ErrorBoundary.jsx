import { Component } from "react";

/**
 * Beklenmeyen render hatalarında beyaz ekran yerine mesaj gösterir.
 */
export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    console.error("ErrorBoundary:", error, info?.componentStack);
  }

  render() {
    if (this.state.hasError) {
      const msg = this.state.error?.message || String(this.state.error);
      return (
        <div className="min-h-screen bg-background text-text-dark flex items-center justify-center p-6 font-sans">
          <div className="max-w-lg rounded-2xl border border-border bg-surface p-6 shadow-sm space-y-3">
            <h1 className="text-lg font-bold text-text-dark">Bir sorun oluştu</h1>
            <p className="text-sm text-muted">
              Sayfa yüklenirken hata oluştu. Konsolu (F12) kontrol edin veya sayfayı yenileyin.
            </p>
            <pre className="text-xs bg-accent/40 p-3 rounded-lg overflow-auto max-h-32 text-danger">
              {msg}
            </pre>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="px-4 py-2 rounded-xl bg-bordeaux text-white text-sm font-semibold hover:bg-bordeaux/90"
            >
              Yenile
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
