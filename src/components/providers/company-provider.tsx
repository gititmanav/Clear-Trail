"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

interface Company {
  id: string;
  name: string;
  financialYearStart: string;
  financialYearEnd: string;
}

interface CompanyContextValue {
  activeCompanyId: string | null;
  activeCompany: Company | null;
  setActiveCompany: (company: Company | null) => void;
  isLoading: boolean;
}

const CompanyContext = createContext<CompanyContextValue>({
  activeCompanyId: null,
  activeCompany: null,
  setActiveCompany: () => {},
  isLoading: true,
});

export function CompanyProvider({
  initialCompanyId,
  children,
}: {
  initialCompanyId?: string | null;
  children: React.ReactNode;
}) {
  const [activeCompany, setActiveCompanyState] = useState<Company | null>(null);
  const [activeCompanyId, setActiveCompanyId] = useState<string | null>(
    initialCompanyId ?? null
  );
  const [isLoading, setIsLoading] = useState(!!initialCompanyId);

  const setActiveCompany = useCallback((company: Company | null) => {
    setActiveCompanyState(company);
    setActiveCompanyId(company?.id ?? null);
    if (company) {
      document.cookie = `activeCompanyId=${company.id}; path=/; max-age=${60 * 60 * 24 * 365}`;
    } else {
      document.cookie =
        "activeCompanyId=; path=/; max-age=0";
    }
  }, []);

  useEffect(() => {
    if (!initialCompanyId) {
      setIsLoading(false);
      return;
    }
    // In a real app, fetch company data here
    // For now, set loading to false
    setIsLoading(false);
  }, [initialCompanyId]);

  return (
    <CompanyContext.Provider
      value={{ activeCompanyId, activeCompany, setActiveCompany, isLoading }}
    >
      {children}
    </CompanyContext.Provider>
  );
}

export function useCompany() {
  const context = useContext(CompanyContext);
  if (!context) {
    throw new Error("useCompany must be used within a CompanyProvider");
  }
  return context;
}
