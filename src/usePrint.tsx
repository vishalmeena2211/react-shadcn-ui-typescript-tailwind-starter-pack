"use client"

import { type RefObject, useCallback, useState } from "react"
import type { PrintOptions, UsePrintReturn } from "./provider/types"

export function usePrint(contentRef: RefObject<HTMLElement>, options: PrintOptions = {}): UsePrintReturn {
  const [isPrinting, setIsPrinting] = useState(false)

  const {
    printStyles = "",
    documentTitle = document.title,
    onBeforePrint,
    onAfterPrint,
    removeAfterPrint = true,
    copyStyles = true,
    bodyClass = "",
  } = options

  const handlePrint = useCallback(async () => {
    if (!contentRef.current || isPrinting) return

    setIsPrinting(true)

    try {
      // Call onBeforePrint callback
      if (onBeforePrint) {
        await onBeforePrint()
      }

      // Create iframe for printing
      const iframe = document.createElement("iframe")
      iframe.style.position = "absolute"
      iframe.style.width = "0"
      iframe.style.height = "0"
      iframe.style.border = "none"
      document.body.appendChild(iframe)

      const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document
      if (!iframeDoc) {
        throw new Error("Could not access iframe document")
      }

      // Open document for writing
      iframeDoc.open()

      // Copy styles from parent document
      let styles = ""
      if (copyStyles) {
        const styleSheets = Array.from(document.styleSheets)
        styleSheets.forEach((styleSheet) => {
          try {
            if (styleSheet.href) {
              styles += `<link rel="stylesheet" href="${styleSheet.href}">`
            } else if (styleSheet.cssRules) {
              const cssText = Array.from(styleSheet.cssRules)
                .map((rule) => rule.cssText)
                .join("\n")
              styles += `<style>${cssText}</style>`
            }
          } catch (e) {
            // Cross-origin stylesheets may throw errors
            console.warn("Could not access stylesheet:", e)
          }
        })
      }

      // Add custom print styles
      const customStyles = printStyles ? `<style>@media print { ${printStyles} }</style>` : ""

      // Write content to iframe
      iframeDoc.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <title>${documentTitle}</title>
            ${styles}
            ${customStyles}
            <style>
              @media print {
                body { margin: 0; padding: 0; }
                @page { margin: 0.5cm; }
              }
            </style>
          </head>
          <body class="${bodyClass}">
            ${contentRef.current.innerHTML}
          </body>
        </html>
      `)

      iframeDoc.close()

      // Wait for content to load
      await new Promise<void>((resolve) => {
        iframe.onload = () => {
          setTimeout(() => resolve(), 100)
        }
        // Fallback if onload doesn't fire
        setTimeout(() => resolve(), 500)
      })

      // Trigger print
      iframe.contentWindow?.focus()
      iframe.contentWindow?.print()

      // Cleanup
      const cleanup = () => {
        if (removeAfterPrint) {
          document.body.removeChild(iframe)
        }
        setIsPrinting(false)
        if (onAfterPrint) {
          onAfterPrint()
        }
      }

      // Listen for print dialog close
      if (iframe.contentWindow) {
        iframe.contentWindow.onafterprint = cleanup
        // Fallback cleanup after 1 second
        setTimeout(cleanup, 1000)
      } else {
        cleanup()
      }
    } catch (error) {
      console.error("Print error:", error)
      setIsPrinting(false)
    }
  }, [
    contentRef,
    isPrinting,
    printStyles,
    documentTitle,
    onBeforePrint,
    onAfterPrint,
    removeAfterPrint,
    copyStyles,
    bodyClass,
  ])

  return {
    handlePrint,
    isPrinting,
  }
}
