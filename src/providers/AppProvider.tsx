"use client";

import React from "react";
import { Provider as JotaiProvider } from "jotai";
import { ReactQueryProviders } from "./ReactQueryProvider";

interface AppProviderProps {
  children: React.ReactNode;
}

export const AppProvider = ({ children }: AppProviderProps) => {
  return (
    <JotaiProvider>
      <ReactQueryProviders>{children}</ReactQueryProviders>
    </JotaiProvider>
  );
};
