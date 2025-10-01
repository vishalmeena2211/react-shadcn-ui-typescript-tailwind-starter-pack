import type React from "react"
export interface PrintOptions {
  /**
   * Custom styles to apply only during printing
   */
  printStyles?: string

  /**
   * Document title for the print window
   */
  documentTitle?: string

  /**
   * Callback fired before printing starts
   */
  onBeforePrint?: () => void | Promise<void>

  /**
   * Callback fired after printing completes
   */
  onAfterPrint?: () => void

  /**
   * Remove the iframe after printing (default: true)
   */
  removeAfterPrint?: boolean

  /**
   * Copy all styles from parent document (default: true)
   */
  copyStyles?: boolean

  /**
   * Additional class names to add to the print container
   */
  bodyClass?: string
}

export type PrintSource =
  | { type: "ref"; ref: React.RefObject<HTMLElement> }
  | { type: "url"; url: string; urlType?: "image" | "pdf" | "auto" }

export interface UsePrintReturn {
  /**
   * Function to trigger the print dialog
   */
  handlePrint: () => Promise<void>

  /**
   * Whether printing is currently in progress
   */
  isPrinting: boolean
}
