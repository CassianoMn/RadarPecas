import { Component } from 'react';
import type { ReactNode } from 'react';
import { ErrorState } from './ui';

interface State {
  failed: boolean;
}

export class ErrorBoundary extends Component<{ children: ReactNode }, State> {
  state: State = { failed: false };

  static getDerivedStateFromError(): State {
    return { failed: true };
  }

  render() {
    if (this.state.failed) {
      return (
        <ErrorState
          text="A tela travou. Recarregue a página."
          onRetry={() => window.location.reload()}
        />
      );
    }
    return this.props.children;
  }
}
