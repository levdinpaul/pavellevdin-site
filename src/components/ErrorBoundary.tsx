import { Component, type ErrorInfo, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

/**
 * Глобальный Error Boundary: ловит ошибки рендера в дереве и показывает
 * дружелюбный экран вместо белой страницы. Оборачивает приложение в App.
 */
export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    if ((import.meta as { env?: { DEV?: boolean } }).env?.DEV) {
      console.error('ErrorBoundary поймал ошибку:', error, info);
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-slate-950 px-6 text-center text-white">
          <h1 className="text-2xl font-bold">Что-то пошло не так</h1>
          <p className="max-w-md text-white/60">
            Попробуйте обновить страницу. Если ошибка повторяется — напишите в Telegram{' '}
            <a href="https://t.me/PavelLevdin" className="text-cyan-300 underline">@PavelLevdin</a>.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="rounded-xl bg-cyan-300 px-5 py-3 font-bold text-slate-950 transition hover:bg-cyan-200"
          >
            Обновить страницу
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
