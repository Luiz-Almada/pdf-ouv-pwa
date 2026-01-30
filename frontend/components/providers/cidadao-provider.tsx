"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { axiosInstance } from "@/services/apiHttp";
import { useRouter } from "next/navigation";

// Tipagem para o objeto do cidadão
type Cidadao = {
  id: string;
  nome: string;
  email: string;
};

// Tipagem para o contexto
type CidadaoContextType = {
  cidadao: Cidadao | null;
  login: (nome: string, email: string) => Promise<Cidadao>;
  logout: () => void;
  loading: boolean;
};

// Criação do contexto
const CidadaoContext = createContext<CidadaoContextType | undefined>(undefined);

// Props do Provider
type CidadaoProviderProps = {
  children: ReactNode;
};

// Componente Provider
export function CidadaoProvider({ children }: CidadaoProviderProps) {
  const [cidadao, setCidadao] = useState<Cidadao | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Tenta carregar o cidadão do localStorage ao iniciar
    try {
      const storedCidadao = localStorage.getItem("cidadao");
      if (storedCidadao) {
        setCidadao(JSON.parse(storedCidadao));
      }
    } catch (error) {
      console.error("Failed to parse citizen from localStorage", error);
      localStorage.removeItem("cidadao");
    } finally {
      setLoading(false);
    }
  }, []);

  const login = async (nome: string, email: string): Promise<Cidadao> => {
    try {
      const response = await axiosInstance.post<Cidadao>("/cidadaos/login", {
        nome,
        email,
      });
      const loggedCidadao = response.data;
      
      localStorage.setItem("cidadao", JSON.stringify(loggedCidadao));
      setCidadao(loggedCidadao);
      
      return loggedCidadao;
    } catch (error) {
      console.error("Login failed:", error);
      throw new Error("Não foi possível autenticar. Tente novamente.");
    }
  };

  const logout = () => {
    localStorage.removeItem("cidadao");
    setCidadao(null);
    router.push("/");
  };

  return (
    <CidadaoContext.Provider value={{ cidadao, login, logout, loading }}>
      {children}
    </CidadaoContext.Provider>
  );
}

// Hook customizado para usar o contexto
export const useCidadao = () => {
  const context = useContext(CidadaoContext);
  if (context === undefined) {
    throw new Error("useCidadao must be used within a CidadaoProvider");
  }
  return context;
};
