import axios from 'axios';

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? 'http://localhost:5000/api',
  headers: { 'Content-Type': 'application/json' },
});

let accessToken: string | null = null;

export function setAccessToken(token: string | null): void {
  accessToken = token;
}

api.interceptors.request.use((config) => {
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

export function getApiErrorMessage(error: unknown): string {
  if (!axios.isAxiosError(error)) {
    return 'Ocorreu um erro inesperado. Tente novamente.';
  }

  if (!error.response) {
    return 'Não foi possível conectar à API. Verifique se o servidor está disponível.';
  }

  const data: unknown = error.response.data;
  if (typeof data === 'object' && data !== null) {
    const body = data as Record<string, unknown>;
    if (typeof body.detail === 'string') return body.detail;
    if (typeof body.title === 'string') return body.title;
    if (typeof body.mensagem === 'string') return body.mensagem;

    const validationErrors = body.errors;
    if (typeof validationErrors === 'object' && validationErrors !== null) {
      const messages = Object.values(validationErrors)
        .flatMap((value) => (Array.isArray(value) ? value : []))
        .filter((value): value is string => typeof value === 'string');
      if (messages.length > 0) return messages.join(' ');
    }
  }

  return 'Não foi possível concluir a solicitação. Tente novamente.';
}
