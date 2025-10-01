"use client"

import { createContext, useContext, type ReactNode } from "react"
import type { PrintOptions } from "./types"

interface PrintContextValue {
  defaultOptions: PrintOptions
}

const PrintContext = createContext<PrintContextValue | undefined>(undefined)

interface PrintProviderProps {
  children: ReactNode
  defaultOptions?: PrintOptions
}

export function PrintProvider({ children, defaultOptions = {} }: PrintProviderProps) {
  return <PrintContext.Provider value={{ defaultOptions }}>{children}</PrintContext.Provider>
}

export function usePrintContext() {
  const context = useContext(PrintContext)
  return context?.defaultOptions || {}
}
