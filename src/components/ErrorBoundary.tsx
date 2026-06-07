import React, { Component, ErrorInfo, ReactNode } from "react";

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  showDetails: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    showDetails: false
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, showDetails: false };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  private handleReload = () => {
    window.location.reload();
  };

  private handleGoHome = () => {
    window.location.href = "/home";
  };

  private toggleDetails = () => {
    this.setState((prev) => ({ showDetails: !prev.showDetails }));
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gradient-to-b from-emerald-50/40 via-white to-slate-50 flex items-center justify-center p-6 font-sans">
          <div className="max-w-md w-full bg-white rounded-3xl border border-slate-100 shadow-xl shadow-slate-200/50 overflow-hidden">
            {/* Top decorative accent */}
            <div className="h-2 w-full bg-gradient-to-r from-emerald-500 to-teal-500" />
            
            <div className="p-8 text-center">
              {/* Animated Warning Icon */}
              <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-6 text-red-500 shadow-inner">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-8 h-8">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                </svg>
              </div>

              {/* Title & Description */}
              <h2 className="text-xl font-black text-slate-800 mb-2">দুঃখিত, কিছু সমস্যা হয়েছে!</h2>
              <p className="text-xs font-semibold text-emerald-600/90 mb-4">Oops! Something went wrong.</p>
              
              <p className="text-sm text-slate-500 leading-relaxed mb-8">
                আমাদের সিস্টেম এটি স্বয়ংক্রিয়ভাবে লগ করেছে। অনুগ্রহ করে পেজটি রিফ্রেশ করুন অথবা মূল ড্যাশবোর্ডে ফিরে যান।
              </p>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 justify-center mb-6">
                <button
                  onClick={this.handleReload}
                  className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold shadow-md shadow-emerald-200 active:scale-95 transition-all w-full sm:w-auto"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
                  </svg>
                  রিফ্রেশ করুন
                </button>
                <button
                  onClick={this.handleGoHome}
                  className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-sm font-bold active:scale-95 transition-all w-full sm:w-auto"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
                  </svg>
                  হোম পেজে যান
                </button>
              </div>

              {/* Technical Details Toggle */}
              <div className="border-t border-slate-100 pt-4 text-left">
                <button
                  onClick={this.toggleDetails}
                  className="flex items-center justify-between w-full text-slate-400 hover:text-slate-600 transition-colors py-2 text-xs font-bold"
                >
                  <span>TECHNICAL DETAILS</span>
                  <span className="text-lg leading-none">
                    {this.state.showDetails ? "▲" : "▼"}
                  </span>
                </button>

                {this.state.showDetails && (
                  <div className="mt-3 space-y-2">
                    <div className="p-3 bg-slate-900 text-red-400 rounded-xl font-mono text-[11px] leading-relaxed overflow-x-auto max-h-32 shadow-inner border border-slate-800">
                      {this.state.error?.toString()}
                    </div>
                    {this.state.error?.stack && (
                      <pre className="p-3 bg-slate-900 text-slate-400 rounded-xl font-mono text-[10px] leading-relaxed overflow-auto max-h-48 shadow-inner border border-slate-800 whitespace-pre-wrap">
                        {this.state.error.stack}
                      </pre>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
