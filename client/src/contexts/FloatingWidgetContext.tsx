import React, { createContext, useContext, useState } from "react";

type OpenWidget = "none" | "chat" | "callback";

interface FloatingWidgetContextType {
  openWidget: OpenWidget;
  setOpenWidget: (widget: OpenWidget) => void;
}

const FloatingWidgetContext = createContext<FloatingWidgetContextType | undefined>(undefined);

export function FloatingWidgetProvider({ children }: { children: React.ReactNode }) {
  const [openWidget, setOpenWidget] = useState<OpenWidget>("none");

  return (
    <FloatingWidgetContext.Provider value={{ openWidget, setOpenWidget }}>
      {children}
    </FloatingWidgetContext.Provider>
  );
}

export function useFloatingWidget() {
  const context = useContext(FloatingWidgetContext);
  if (!context) {
    return {
      openWidget: "none" as const,
      setOpenWidget: () => {},
    };
  }
  return context;
}
