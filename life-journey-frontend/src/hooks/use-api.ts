import { useState, useCallback, useRef, useEffect } from "react";
import { apiFetch, ApiError, ApiOptions, isApiError } from "@/lib/api-client";

interface UseApiState<T> {
  data: T | null;
  error: ApiError | null;
  isLoading: boolean;
  isError: boolean;
  isSuccess: boolean;
}

interface UseApiOptions extends ApiOptions {
  onSuccess?: (data: unknown) => void;
  onError?: (error: ApiError) => void;
}

/**
 * Custom hook for making API calls with loading and error states
 *
 * @example
 * const { data, isLoading, error, execute } = useApi<User>();
 *
 * const handleLogin = async () => {
 *   await execute('/auth/login', {
 *     method: 'POST',
 *     body: JSON.stringify({ email, password })
 *   });
 * };
 */
export function useApi<T = unknown>(options?: UseApiOptions) {
  const [state, setState] = useState<UseApiState<T>>({
    data: null,
    error: null,
    isLoading: false,
    isError: false,
    isSuccess: false,
  });

  const abortControllerRef = useRef<AbortController | null>(null);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  const execute = useCallback(
    async (path: string, init?: RequestInit, execOptions?: UseApiOptions) => {
      // Cancel any ongoing requests
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      abortControllerRef.current = new AbortController();

      setState({
        data: null,
        error: null,
        isLoading: true,
        isError: false,
        isSuccess: false,
      });

      try {
        const mergedOptions = { ...options, ...execOptions };
        const data = await apiFetch<T>(path, init, {
          ...mergedOptions,
          signal: abortControllerRef.current.signal,
        });

        setState({
          data,
          error: null,
          isLoading: false,
          isError: false,
          isSuccess: true,
        });

        if (mergedOptions?.onSuccess) {
          mergedOptions.onSuccess(data);
        }

        return data;
      } catch (err) {
        // Ignore abort errors
        if (err instanceof DOMException && err.name === "AbortError") {
          return;
        }

        const apiError = isApiError(err)
          ? err
          : {
              message: err instanceof Error ? err.message : "Er is een onbekende fout opgetreden",
              status: 0,
              code: "UNKNOWN_ERROR",
            };

        setState({
          data: null,
          error: apiError,
          isLoading: false,
          isError: true,
          isSuccess: false,
        });

        const mergedOptions = { ...options, ...execOptions };
        if (mergedOptions?.onError) {
          mergedOptions.onError(apiError);
        }

        throw apiError;
      }
    },
    [options]
  );

  const reset = useCallback(() => {
    setState({
      data: null,
      error: null,
      isLoading: false,
      isError: false,
      isSuccess: false,
    });
  }, []);

  return {
    ...state,
    execute,
    reset,
  };
}

/**
 * Hook for making a GET request that executes immediately on mount
 *
 * @example
 * const { data, isLoading, error, refetch } = useQuery<Journey>('/journeys/123', {
 *   token: authToken
 * });
 */
export function useQuery<T = unknown>(
  path: string | null,
  options?: UseApiOptions
) {
  const { execute, ...state } = useApi<T>(options);
  const [hasExecuted, setHasExecuted] = useState(false);

  useEffect(() => {
    if (path && !hasExecuted) {
      execute(path, { method: "GET" }, options).catch(() => {
        // Error already handled by useApi
      });
      setHasExecuted(true);
    }
  }, [path, execute, hasExecuted, options]);

  const refetch = useCallback(() => {
    if (path) {
      setHasExecuted(false);
    }
  }, [path]);

  return {
    ...state,
    refetch,
  };
}

/**
 * Hook for making mutations (POST, PUT, DELETE, PATCH)
 *
 * @example
 * const { mutate, isLoading } = useMutation<LoginResponse>({
 *   onSuccess: (data) => {
 *     saveAuthToken(data.access_token);
 *   }
 * });
 *
 * const handleSubmit = () => {
 *   mutate('/auth/login', {
 *     method: 'POST',
 *     body: JSON.stringify({ email, password })
 *   });
 * };
 */
export function useMutation<T = unknown>(options?: UseApiOptions) {
  const { execute, ...state } = useApi<T>(options);

  const mutate = useCallback(
    async (path: string, init?: RequestInit, execOptions?: UseApiOptions) => {
      return execute(path, init, execOptions);
    },
    [execute]
  );

  return {
    ...state,
    mutate,
  };
}
