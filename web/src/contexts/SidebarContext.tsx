import { createContext, useContext, useState, ReactNode } from "react";

interface SidebarContextType {
  isOpen: boolean;
  setIsOpen: (value: boolean) => void;
  isPinned: boolean;
  setIsPinned: (value: boolean) => void;
  isMobileOpen: boolean;
  setIsMobileOpen: (value: boolean) => void;
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

export function SidebarProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isPinned, setIsPinned] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  return (
    <SidebarContext.Provider
      value={{ isOpen, setIsOpen, isPinned, setIsPinned, isMobileOpen, setIsMobileOpen }}
    >
      {children}
    </SidebarContext.Provider>
  );
}

export function useSidebar() {
  const context = useContext(SidebarContext);
  if (!context) {
    throw new Error("useSidebar deve ser usado dentro de SidebarProvider");
  }
  return context;
}
