import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { getApiErrorMessage, setAccessToken } from '../services/api';
import { encerrarSessao, login as loginService, renovarSessao } from '../services/auth.service';
import type { DadosSessao } from '../types/usuario';

interface AuthContextValue {
  sessao: DadosSessao | null;
  erroSessao: string | null;
  entrar: (tipo: 'Email' | 'Telefone', identificador: string, senha: string) => Promise<void>;
  sair: () => Promise<void>;
  atualizarSessao: (sessao: DadosSessao) => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [sessao, setSessao] = useState<DadosSessao | null>(null);
  const [erroSessao, setErroSessao] = useState<string | null>(null);

  const atualizarSessao = useCallback((novaSessao: DadosSessao) => {
    setAccessToken(novaSessao.accessToken);
    setSessao(novaSessao);
    setErroSessao(null);
  }, []);

  const entrar = useCallback(async (tipo: 'Email' | 'Telefone', identificador: string, senha: string) => {
    atualizarSessao(await loginService(tipo, identificador, senha));
  }, [atualizarSessao]);

  const limparSessao = useCallback(() => {
    setAccessToken(null);
    setSessao(null);
  }, []);

  const sair = useCallback(async () => {
    if (!sessao) return;
    try {
      await encerrarSessao(sessao.refreshToken);
    } catch (error) {
      setErroSessao(`A sessão foi encerrada neste navegador, mas não foi possível confirmar a revogação no servidor. ${getApiErrorMessage(error)}`);
    } finally {
      limparSessao();
    }
  }, [limparSessao, sessao]);

  useEffect(() => {
    if (!sessao) return undefined;
    const expiresIn = new Date(sessao.expiresAt).getTime() - Date.now();
    const refreshDelay = Math.max(1000, expiresIn - 60_000);
    const timer = window.setTimeout(() => {
      void renovarSessao(sessao.refreshToken)
        .then(atualizarSessao)
        .catch((error: unknown) => {
          setErroSessao(getApiErrorMessage(error));
          limparSessao();
        });
    }, refreshDelay);
    return () => window.clearTimeout(timer);
  }, [atualizarSessao, limparSessao, sessao]);

  const value = useMemo(() => ({ sessao, erroSessao, entrar, sair, atualizarSessao }), [
    sessao, erroSessao, entrar, sair, atualizarSessao,
  ]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth deve ser usado dentro de AuthProvider.');
  return context;
}
