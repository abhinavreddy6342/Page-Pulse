import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    // Log to console for now; could be sent to analytics service
    console.error('ErrorBoundary caught an error', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center p-6">
          <div className="rounded-2xl border border-slate-700 bg-slate-900 p-8 text-center">
            <h2 className="text-xl font-bold text-red-400">Something went wrong</h2>
            <p className="mt-2 text-slate-400">An unexpected error occurred while rendering the UI. The team has been notified.</p>
            <div className="mt-4">
              <button onClick={() => window.location.reload()} className="rounded-md bg-blue-600 px-4 py-2">Reload</button>
            </div>
            <details className="mt-4 text-left text-xs text-slate-500">
              <summary>Error details</summary>
              <pre className="whitespace-pre-wrap">{String(this.state.error)}</pre>
            </details>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
