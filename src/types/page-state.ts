/**
 * Shared page state type used across all pages
 * Provides a consistent state machine for data-driven components
 */

export type DataState<T> =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'empty' }
  | { status: 'error'; message: string; retryFn?: () => void }
  | { status: 'success'; data: T };

/**
 * Helper functions for creating state objects
 */
export const createIdleState = (): DataState<never> => ({ status: 'idle' });

export const createLoadingState = (): DataState<never> => ({ status: 'loading' });

export const createEmptyState = (): DataState<never> => ({ status: 'empty' });

export const createErrorState = <T>(
  message: string,
  retryFn?: () => void
): DataState<T> => ({ status: 'error', message, retryFn });

export const createSuccessState = <T>(data: T): DataState<T> => ({
  status: 'success',
  data,
});

/**
 * Type guards for checking state status
 */
export const isIdle = <T>(state: DataState<T>): state is { status: 'idle' } =>
  state.status === 'idle';

export const isLoading = <T>(state: DataState<T>): state is { status: 'loading' } =>
  state.status === 'loading';

export const isEmpty = <T>(state: DataState<T>): state is { status: 'empty' } =>
  state.status === 'empty';

export const isError = <T>(
  state: DataState<T>
): state is { status: 'error'; message: string; retryFn?: () => void } =>
  state.status === 'error';

export const isSuccess = <T>(
  state: DataState<T>
): state is { status: 'success'; data: T } => state.status === 'success';
