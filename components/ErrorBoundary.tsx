import React, { Component, ErrorInfo, ReactNode } from "react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(_: Error): State {
    return { hasError: true };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center h-screen bg-cyber-black text-cyber-secondary p-4">
          <h1 className="text-2xl font-bold mb-4">SYSTEM_FAILURE</h1>
          <p className="text-center mb-4">Ocorreu uma falha crítica na renderização. Verifique o console para mais detalhes.</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-cyber-secondary text-cyber-black font-bold rounded hover:bg-cyber-primary hover:text-cyber-black transition-colors"
          >
            REBOOT_INTERFACE
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
