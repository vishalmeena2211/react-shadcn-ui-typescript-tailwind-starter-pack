import { useState, type RefObject } from "react"
import type { PrintOptions, UsePrintReturn } from "./types"

/**
 * Hook to print content from a ref or URL
 * @param source - Either a ref to an HTML element or a URL to print
 * @param options - Print configuration options
 */
export function usePrint(source: RefObject<HTMLElement> | string, options: PrintOptions = {}): UsePrintReturn {
  const [isPrinting, setIsPrinting] = useState(false)

  const handlePrint = async () => {
    setIsPrinting(true)

    try {
      // Call onBeforePrint callback
      if (options.onBeforePrint) {
        await options.onBeforePrint()
      }

      // Determine if source is a ref or URL
      const isUrl = typeof source === "string"

      if (isUrl) {
        await printFromUrl(source, options)
      } else {
        await printFromRef(source, options)
      }

      // Call onAfterPrint callback
      if (options.onAfterPrint) {
        options.onAfterPrint()
      }
    } catch (error) {
      console.error("Print error:", error)
    } finally {
      setIsPrinting(false)
    }
  }

  return { handlePrint, isPrinting }
}

async function printFromRef(ref: RefObject<HTMLElement>, options: PrintOptions): Promise<void> {
  if (!ref.current) {
    console.warn("Print ref is not attached to any element")
    return
  }

  const iframe = document.createElement("iframe")
  iframe.style.position = "absolute"
  iframe.style.width = "0"
  iframe.style.height = "0"
  iframe.style.border = "none"

  document.body.appendChild(iframe)

  const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document
  if (!iframeDoc) {
    document.body.removeChild(iframe)
    return
  }

  // Set document title
  if (options.documentTitle) {
    iframeDoc.title = options.documentTitle
  }

  // Copy styles from parent document
  if (options.copyStyles !== false) {
    const styles = document.querySelectorAll('style, link[rel="stylesheet"]')
    styles.forEach((style) => {
      const clonedStyle = style.cloneNode(true)
      iframeDoc.head.appendChild(clonedStyle)
    })
  }

  // Add custom print styles
  if (options.printStyles) {
    const styleElement = iframeDoc.createElement("style")
    styleElement.textContent = options.printStyles
    iframeDoc.head.appendChild(styleElement)
  }

  // Add body class if specified
  if (options.bodyClass) {
    iframeDoc.body.className = options.bodyClass
  }

  // Clone and append the content
  const clonedContent = ref.current.cloneNode(true) as HTMLElement
  iframeDoc.body.appendChild(clonedContent)

  // Wait for images and resources to load
  await new Promise<void>((resolve) => {
    iframe.contentWindow?.addEventListener("load", () => resolve())
    // Fallback timeout
    setTimeout(resolve, 100)
  })

  // Trigger print
  iframe.contentWindow?.focus()
  iframe.contentWindow?.print()

  // Remove iframe after printing
  if (options.removeAfterPrint !== false) {
    setTimeout(() => {
      document.body.removeChild(iframe)
    }, 100)
  }
}

async function printFromUrl(url: string, options: PrintOptions): Promise<void> {
  const normalizedUrl = normalizeUrl(url)
  const urlType = detectUrlType(normalizedUrl)

  const iframe = document.createElement("iframe")
  iframe.style.position = "absolute"
  iframe.style.width = "0"
  iframe.style.height = "0"
  iframe.style.border = "none"

  document.body.appendChild(iframe)

  const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document
  if (!iframeDoc) {
    document.body.removeChild(iframe)
    throw new Error("Failed to create print iframe")
  }

  // Set document title
  if (options.documentTitle) {
    iframeDoc.title = options.documentTitle
  }

  // Add custom print styles
  if (options.printStyles) {
    const styleElement = iframeDoc.createElement("style")
    styleElement.textContent = options.printStyles
    iframeDoc.head.appendChild(styleElement)
  }

  // Handle different URL types
  if (urlType === "pdf") {
    // For PDFs, embed directly
    const embed = iframeDoc.createElement("embed")
    embed.src = normalizedUrl
    embed.type = "application/pdf"
    embed.style.width = "100%"
    embed.style.height = "100vh"
    iframeDoc.body.appendChild(embed)
  } else if (urlType === "image") {
    const img = iframeDoc.createElement("img")
    img.crossOrigin = "anonymous" // Handle CORS for CDN images
    img.src = normalizedUrl
    img.style.maxWidth = "100%"
    img.style.height = "auto"
    img.style.display = "block"
    img.style.margin = "0 auto"

    // Add default print styles for images
    const defaultImageStyles = iframeDoc.createElement("style")
    defaultImageStyles.textContent = `
      @media print {
        body { margin: 0; padding: 0; }
        img { page-break-inside: avoid; max-width: 100%; height: auto; }
      }
    `
    iframeDoc.head.appendChild(defaultImageStyles)

    iframeDoc.body.appendChild(img)

    await new Promise<void>((resolve, reject) => {
      let retryCount = 0
      const maxRetries = 2

      const attemptLoad = () => {
        img.onload = () => {
          console.log("[v0] Image loaded successfully from:", normalizedUrl)
          resolve()
        }

        img.onerror = (error) => {
          console.error("[v0] Image load error:", error)

          if (retryCount < maxRetries) {
            retryCount++
            console.log(`[v0] Retrying image load (${retryCount}/${maxRetries})...`)
            // Try without CORS on retry
            if (retryCount === 1) {
              img.crossOrigin = ""
            }
            // Force reload with cache busting
            img.src = normalizedUrl + (normalizedUrl.includes("?") ? "&" : "?") + `_retry=${retryCount}`
          } else {
            reject(new Error(`Failed to load image after ${maxRetries} retries. URL: ${normalizedUrl}`))
          }
        }
      }

      attemptLoad()

      // Fallback timeout (increased for slow CDN/cloud URLs)
      setTimeout(() => {
        console.warn("[v0] Image load timeout, proceeding anyway")
        resolve()
      }, 5000)
    })
  }

  // Wait a bit for content to render
  await new Promise<void>((resolve) => setTimeout(resolve, 200))

  // Trigger print
  iframe.contentWindow?.focus()
  iframe.contentWindow?.print()

  // Remove iframe after printing
  if (options.removeAfterPrint !== false) {
    setTimeout(() => {
      document.body.removeChild(iframe)
    }, 100)
  }
}

function normalizeUrl(url: string): string {
  // Handle Google Drive URLs
  if (url.includes("drive.google.com")) {
    // Convert Google Drive share links to direct download links
    const fileIdMatch = url.match(/\/d\/([a-zA-Z0-9_-]+)/)
    if (fileIdMatch) {
      return `https://drive.google.com/uc?export=download&id=${fileIdMatch[1]}`
    }
  }

  // Handle Dropbox URLs
  if (url.includes("dropbox.com")) {
    // Convert Dropbox share links to direct download
    return url.replace("www.dropbox.com", "dl.dropboxusercontent.com").replace("?dl=0", "").replace("?dl=1", "")
  }

  // Handle OneDrive URLs
  if (url.includes("1drv.ms") || url.includes("onedrive.live.com")) {
    // OneDrive requires embed parameter for direct access
    if (!url.includes("embed")) {
      return url + (url.includes("?") ? "&" : "?") + "embed=1"
    }
  }

  // Handle AWS S3 URLs (already direct, but ensure proper format)
  if (url.includes("s3.amazonaws.com") || url.includes("s3-")) {
    return url
  }

  // Handle Cloudinary URLs
  if (url.includes("cloudinary.com")) {
    return url
  }

  // Handle imgix URLs
  if (url.includes("imgix.net")) {
    return url
  }

  // Return original URL if no special handling needed
  return url
}

function detectUrlType(url: string): "image" | "pdf" | "unknown" {
  const lowerUrl = url.toLowerCase()

  // Check for image extensions (including query parameters)
  if (/\.(jpg|jpeg|png|gif|bmp|webp|svg|ico|tiff|tif)(\?|&|$)/i.test(lowerUrl)) {
    return "image"
  }

  // Check for PDF extension
  if (/\.pdf(\?|&|$)/i.test(lowerUrl)) {
    return "pdf"
  }

  // Check for common CDN and cloud storage patterns
  if (
    lowerUrl.includes("cloudinary.com") ||
    lowerUrl.includes("imgix.net") ||
    lowerUrl.includes("cloudfront.net") ||
    lowerUrl.includes("s3.amazonaws.com") ||
    lowerUrl.includes("storage.googleapis.com") ||
    lowerUrl.includes("blob.core.windows.net")
  ) {
    // Assume image for CDN URLs unless explicitly PDF
    return lowerUrl.includes("pdf") ? "pdf" : "image"
  }

  // Check for image hosting patterns
  if (lowerUrl.includes("image") || lowerUrl.includes("img") || lowerUrl.includes("photo")) {
    return "image"
  }

  // Check for Google Drive image preview
  if (lowerUrl.includes("drive.google.com") && lowerUrl.includes("uc?")) {
    return "image"
  }

  return "unknown"
}
