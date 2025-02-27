'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import './style.css';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorInfo: null
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    this.setState({
      error,
      errorInfo
    });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-boundary">
          <h2>Что-то пошло не так!</h2>
          <details>
            <summary>Подробности ошибки</summary>
            <p>{this.state.error?.toString()}</p>
            <p>Компонент: {this.state.errorInfo?.componentStack}</p>
          </details>
          <button 
            className="try-again-button"
            onClick={() => window.location.reload()}
          >
            Попробовать снова
          </button>
        </div>
      );
    }

    return this.props.children;
  }
} 