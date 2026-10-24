import React, { Component, ErrorInfo, ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error caught by ErrorBoundary:", error, errorInfo);
    this.setState({ error, errorInfo });
  }

  private handleReload = () => {
    window.location.reload();
  };

  private handleGoHome = () => {
    window.location.href = "/";
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 text-center">
          <div className="max-w-md w-full bg-card rounded-2xl border border-border shadow-lg p-6 space-y-4">
            <div className="w-12 h-12 rounded-full bg-destructive/10 text-destructive flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>
            
            <h1 className="text-lg font-bold text-foreground">
              কোথাও একটি সমস্যা হয়েছে
            </h1>
            
            <p className="text-xs text-muted-foreground leading-relaxed">
              পেজটি লোড করার সময় একটি অপ্রত্যাশিত ত্রুটি ঘটেছে। অনুগ্রহ করে পেজটি রিফ্রেশ দিন বা হোমপেজে ফিরে যান।
            </p>

            {this.state.error && (
              <div className="bg-muted/50 p-3 rounded-xl text-left border border-border text-[11px] font-mono text-destructive overflow-auto max-h-32">
                <p className="font-semibold mb-1">{this.state.error.name}: {this.state.error.message}</p>
                {this.state.errorInfo?.componentStack && (
                  <pre className="text-[10px] opacity-70 whitespace-pre-wrap">
                    {this.state.errorInfo.componentStack.slice(0, 300)}
                  </pre>
                )}
              </div>
            )}

            <div className="flex gap-2 pt-2">
              <Button onClick={this.handleReload} variant="default" className="flex-1 rounded-xl gap-1.5 h-10 text-xs">
                <RefreshCw className="w-3.5 h-3.5" /> পেজ রিফ্রেশ দিন
              </Button>
              <Button onClick={this.handleGoHome} variant="outline" className="flex-1 rounded-xl gap-1.5 h-10 text-xs">
                <Home className="w-3.5 h-3.5" /> হোমপেজ
              </Button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
