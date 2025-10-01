import { useRef } from "react"
import { usePrint } from "./lib/use-print"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Printer, FileText, Receipt, ImageIcon, FileImage } from "lucide-react"

export default function App() {
  const invoiceRef = useRef<HTMLDivElement>(null)
  const reportRef = useRef<HTMLDivElement>(null)

  const { handlePrint: printInvoice, isPrinting: isPrintingInvoice } = usePrint(invoiceRef, {
    documentTitle: "Invoice #12345",
    printStyles: `
      .no-print { display: none !important; }
      body { font-family: Arial, sans-serif; }
      h2 { color: #1a1a1a; }
    `,
    onBeforePrint: () => {
      console.log("Preparing invoice for printing...")
    },
    onAfterPrint: () => {
      console.log("Invoice print completed!")
    },
  })

  const { handlePrint: printReport, isPrinting: isPrintingReport } = usePrint(reportRef, {
    documentTitle: "Monthly Report",
    printStyles: `
      .no-print { display: none !important; }
      table { width: 100%; border-collapse: collapse; }
      th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
      th { background-color: #f2f2f2; }
    `,
  })

  const { handlePrint: printImage, isPrinting: isPrintingImage } = usePrint("/beautiful-landscape.png", {
    documentTitle: "Landscape Photo",
    printStyles: `
        @media print {
          body { margin: 0; }
          img { max-width: 100%; height: auto; }
        }
      `,
  })

  const { handlePrint: printPdf, isPrinting: isPrintingPdf } = usePrint(
    "https://morth.nic.in/sites/default/files/dd12-13_0.pdf",
    {
      documentTitle: "Sample PDF Document",
    },
  )

  const { handlePrint: printCdnImage, isPrinting: isPrintingCdn } = usePrint(
    "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800",
    {
      documentTitle: "CDN Image - Mountain Landscape",
    },
  )

  const { handlePrint: printCloudImage, isPrinting: isPrintingCloud } = usePrint(
    "https://storage.googleapis.com/proudcity/mebanenc/uploads/2021/03/placeholder-image.png",
    {
      documentTitle: "Cloud Storage Image",
    },
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <div className="mx-auto max-w-6xl space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-gray-900">react-print-ref</h1>
          <p className="text-lg text-gray-600">
            Print React components or URLs (images & PDFs) from any source - CDN, cloud storage, or local files
          </p>
          <div className="flex gap-4 justify-center">
            <code className="px-4 py-2 bg-gray-900 text-white rounded-lg text-sm">npm install react-print-ref</code>
          </div>
        </div>

        {/* Demo Cards */}
        <div className="grid gap-8 md:grid-cols-2">
          {/* Invoice Example */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Receipt className="h-5 w-5" />
                Invoice Example
              </CardTitle>
              <CardDescription>Print a styled invoice with custom print options</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button onClick={printInvoice} disabled={isPrintingInvoice} className="w-full">
                <Printer className="mr-2 h-4 w-4" />
                {isPrintingInvoice ? "Printing..." : "Print Invoice"}
              </Button>

              <div ref={invoiceRef} className="border rounded-lg p-6 bg-white space-y-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">INVOICE</h2>
                    <p className="text-gray-600">#12345</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">Acme Corp</p>
                    <p className="text-sm text-gray-600">123 Business St</p>
                    <p className="text-sm text-gray-600">New York, NY 10001</p>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <p className="text-sm text-gray-600">Bill To:</p>
                  <p className="font-semibold">John Doe</p>
                  <p className="text-sm text-gray-600">john@example.com</p>
                </div>

                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2">Item</th>
                      <th className="text-right py-2">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b">
                      <td className="py-2">Web Development Services</td>
                      <td className="text-right">$2,500.00</td>
                    </tr>
                    <tr className="border-b">
                      <td className="py-2">Design Consultation</td>
                      <td className="text-right">$750.00</td>
                    </tr>
                    <tr className="font-bold">
                      <td className="py-2">Total</td>
                      <td className="text-right">$3,250.00</td>
                    </tr>
                  </tbody>
                </table>

                <div className="no-print pt-4 border-t">
                  <p className="text-sm text-gray-500 italic">This button won't appear in print</p>
                  <Button variant="outline" size="sm" className="mt-2 bg-transparent">
                    Edit Invoice
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Report Example */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Report Example
              </CardTitle>
              <CardDescription>Print a data report with table formatting</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button onClick={printReport} disabled={isPrintingReport} className="w-full" variant="secondary">
                <Printer className="mr-2 h-4 w-4" />
                {isPrintingReport ? "Printing..." : "Print Report"}
              </Button>

              <div ref={reportRef} className="border rounded-lg p-6 bg-white space-y-4">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Monthly Sales Report</h2>
                  <p className="text-gray-600">January 2025</p>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Revenue:</span>
                    <span className="font-semibold">$45,230</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Orders:</span>
                    <span className="font-semibold">127</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Average Order:</span>
                    <span className="font-semibold">$356</span>
                  </div>
                </div>

                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2">Product</th>
                      <th className="text-right py-2">Units</th>
                      <th className="text-right py-2">Revenue</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b">
                      <td className="py-2">Product A</td>
                      <td className="text-right">45</td>
                      <td className="text-right">$15,750</td>
                    </tr>
                    <tr className="border-b">
                      <td className="py-2">Product B</td>
                      <td className="text-right">32</td>
                      <td className="text-right">$12,480</td>
                    </tr>
                    <tr className="border-b">
                      <td className="py-2">Product C</td>
                      <td className="text-right">50</td>
                      <td className="text-right">$17,000</td>
                    </tr>
                  </tbody>
                </table>

                <div className="no-print pt-4 border-t">
                  <p className="text-sm text-gray-500 italic">Interactive elements hidden in print</p>
                  <Button variant="outline" size="sm" className="mt-2 bg-transparent">
                    Export Data
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ImageIcon className="h-5 w-5" />
                Print Local Image
              </CardTitle>
              <CardDescription>Print an image from local storage</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button
                onClick={printImage}
                disabled={isPrintingImage}
                className="w-full bg-transparent"
                variant="outline"
              >
                <Printer className="mr-2 h-4 w-4" />
                {isPrintingImage ? "Printing..." : "Print Local Image"}
              </Button>

              <div className="border rounded-lg p-4 bg-white">
                <img src="/beautiful-landscape.png" alt="Landscape" className="w-full h-auto rounded" />
                <p className="text-sm text-gray-600 mt-2 text-center">Local file example</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileImage className="h-5 w-5" />
                Print PDF URL
              </CardTitle>
              <CardDescription>Print a PDF document from any URL</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button onClick={printPdf} disabled={isPrintingPdf} className="w-full bg-transparent" variant="outline">
                <Printer className="mr-2 h-4 w-4" />
                {isPrintingPdf ? "Printing..." : "Print PDF"}
              </Button>

              <div className="border rounded-lg p-6 bg-white text-center space-y-2">
                <FileText className="h-16 w-16 mx-auto text-gray-400" />
                <p className="font-semibold">Sample PDF Document</p>
                <p className="text-sm text-gray-600">Works with any PDF URL</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ImageIcon className="h-5 w-5" />
                Print CDN Image
              </CardTitle>
              <CardDescription>Print images from CDN services (Unsplash, Cloudinary, etc.)</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button
                onClick={printCdnImage}
                disabled={isPrintingCdn}
                className="w-full bg-transparent"
                variant="outline"
              >
                <Printer className="mr-2 h-4 w-4" />
                {isPrintingCdn ? "Printing..." : "Print CDN Image"}
              </Button>

              <div className="border rounded-lg p-4 bg-white">
                <img
                  src="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800"
                  alt="Mountain"
                  className="w-full h-auto rounded"
                />
                <p className="text-sm text-gray-600 mt-2 text-center">Unsplash CDN example</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ImageIcon className="h-5 w-5" />
                Print Cloud Storage
              </CardTitle>
              <CardDescription>Print from cloud storage (AWS S3, Google Cloud, Azure, etc.)</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button
                onClick={printCloudImage}
                disabled={isPrintingCloud}
                className="w-full bg-transparent"
                variant="outline"
              >
                <Printer className="mr-2 h-4 w-4" />
                {isPrintingCloud ? "Printing..." : "Print Cloud Image"}
              </Button>

              <div className="border rounded-lg p-4 bg-white">
                <img
                  src="https://storage.googleapis.com/proudcity/mebanenc/uploads/2021/03/placeholder-image.png"
                  alt="Cloud"
                  className="w-full h-auto rounded"
                />
                <p className="text-sm text-gray-600 mt-2 text-center">Google Cloud Storage example</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Usage Example */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Start</CardTitle>
            <CardDescription>Basic usage examples for refs and URLs</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">Print from Ref:</h3>
              <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm">
                <code>{`import { useRef } from 'react'
import { usePrint } from 'react-print-ref'

function MyComponent() {
  const printRef = useRef<HTMLDivElement>(null)
  const { handlePrint, isPrinting } = usePrint(printRef)

  return (
    <div>
      <button onClick={handlePrint}>Print</button>
      <div ref={printRef}>Content to print</div>
    </div>
  )
}`}</code>
              </pre>
            </div>

            <div>
              <h3 className="font-semibold mb-2">Print from URL (CDN, Cloud, Drive):</h3>
              <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm">
                <code>{`import { usePrint } from 'react-print-ref'

function MyComponent() {
  // CDN Image (Unsplash, Cloudinary, imgix, etc.)
  const { handlePrint: printCdn } = usePrint(
    'https://images.unsplash.com/photo-123.jpg'
  )
  
  // Cloud Storage (AWS S3, Google Cloud, Azure)
  const { handlePrint: printCloud } = usePrint(
    'https://storage.googleapis.com/bucket/image.png'
  )
  
  // Google Drive (automatically converted to direct link)
  const { handlePrint: printDrive } = usePrint(
    'https://drive.google.com/file/d/FILE_ID/view'
  )

  return (
    <div>
      <button onClick={printCdn}>Print CDN</button>
      <button onClick={printCloud}>Print Cloud</button>
      <button onClick={printDrive}>Print Drive</button>
    </div>
  )
}`}</code>
              </pre>
            </div>
          </CardContent>
        </Card>

        {/* Supported URL Sources */}
        <Card>
          <CardHeader>
            <CardTitle>Supported URL Sources</CardTitle>
            <CardDescription>Works with all major CDN, cloud storage, and file hosting services</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <h4 className="font-semibold mb-2">CDN Services</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Cloudinary</li>
                  <li>• imgix</li>
                  <li>• CloudFront (AWS)</li>
                  <li>• Unsplash</li>
                  <li>• Any CDN with direct image URLs</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Cloud Storage</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• AWS S3</li>
                  <li>• Google Cloud Storage</li>
                  <li>• Azure Blob Storage</li>
                  <li>• DigitalOcean Spaces</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2">File Hosting</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Google Drive (auto-converted)</li>
                  <li>• Dropbox (auto-converted)</li>
                  <li>• OneDrive (auto-converted)</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Features</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Automatic URL normalization</li>
                  <li>• CORS handling</li>
                  <li>• Retry on failure</li>
                  <li>• Loading timeout protection</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
