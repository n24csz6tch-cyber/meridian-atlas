import { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle } from 'lucide-react';

interface WebGLErrorBoundaryProps {
  children: ReactNode;
  fallbackTitle?: string;
  fallbackDescription?: string;
}

interface WebGLErrorBoundaryState {
  hasError: boolean;
  message: string;
}

export class WebGLErrorBoundary extends Component<
  WebGLErrorBoundaryProps,
  WebGLErrorBoundaryState
> {
  state: WebGLErrorBoundaryState = {
    hasError: false,
    message: '',
  };

  static getDerivedStateFromError(error: Error): WebGLErrorBoundaryState {
    return {
      hasError: true,
      message: error.message || 'WebGL context could not be initialized.',
    };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('WebGL viewport error:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="w-full h-full min-h-[320px] flex flex-col items-center justify-center p-6 text-center bg-[#0D1119] border border-[rgba(237,235,228,0.12)] rounded">
          <AlertTriangle className="w-6 h-6 text-[#38BDF8] mb-3" />
          <p className="font-serif-editorial text-lg text-[#EDEBE4] mb-1">
            {this.props.fallbackTitle ?? '3D Instrument Unavailable'}
          </p>
          <p className="text-xs text-[#9CA6B8] max-w-md mb-3">
            {this.props.fallbackDescription ??
              'Hardware-accelerated WebGL could not start in this viewport. Mathematical telemetry remains live below.'}
          </p>
          <span className="font-mono-data text-[11px] text-[#6C7689]">
            {this.state.message}
          </span>
        </div>
      );
    }

    return this.props.children;
  }
}
