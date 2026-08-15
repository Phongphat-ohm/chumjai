/**
 * PDF Generation & Printing Utility Helper
 * Converts DOM Elements (rendered in official Thai Sarabun font) to PDF Blob and triggers auto-print dialog
 */

export interface PrintPdfOptions {
  filename?: string;
  autoPrint?: boolean;
  orientation?: "portrait" | "landscape";
  format?: "a4" | "a5" | [number, number];
  marginMm?: number;
}

export async function generatePdfBlob(
  element: HTMLElement,
  options: PrintPdfOptions = {}
): Promise<{ blob: Blob; blobUrl: string }> {
  // Ensure all fonts (including Sarabun / TH Sarabun) are fully loaded
  if (typeof document !== "undefined" && document.fonts) {
    await document.fonts.ready;
  }

  // Dynamically import client libraries
  const [{ default: jsPDF }, { default: html2canvas }] = await Promise.all([
    import("jspdf"),
    import("html2canvas"),
  ]);

  const {
    orientation = "portrait",
    format = "a4",
    marginMm = 10,
  } = options;

  const targetWidth = element.offsetWidth || element.scrollWidth || 794;

  // Capture element to ultra-crisp high-res canvas at its natural unconstrained width
  const canvas = await html2canvas(element, {
    scale: 2.5,
    useCORS: true,
    logging: false,
    backgroundColor: "#ffffff",
    width: targetWidth,
    windowWidth: targetWidth,
    onclone: (clonedDoc, clonedElement) => {
      // Ensure the cloned body has the TH Sarabun New font family applied
      if (clonedElement) {
        clonedElement.style.fontFamily = "'TH Sarabun New', var(--font-sarabun), 'Sarabun', sans-serif";
        clonedElement.style.margin = "0";
        clonedElement.style.transform = "none";
      }
    },
  });

  const imgData = canvas.toDataURL("image/png");

  const pdf = new jsPDF({
    orientation,
    unit: "mm",
    format,
    compress: true,
  });

  const pdfPageWidth = pdf.internal.pageSize.getWidth();
  const pdfPageHeight = pdf.internal.pageSize.getHeight();

  const contentWidth = pdfPageWidth - marginMm * 2;
  const contentHeight = (canvas.height * contentWidth) / canvas.width;

  let heightLeft = contentHeight;
  let position = marginMm;

  // First page
  pdf.addImage(imgData, "PNG", marginMm, position, contentWidth, contentHeight, undefined, "FAST");
  heightLeft -= pdfPageHeight - marginMm * 2;

  // Multi-page handling if document exceeds one page
  while (heightLeft > 0) {
    position = heightLeft - contentHeight + marginMm;
    pdf.addPage();
    pdf.addImage(imgData, "PNG", marginMm, position, contentWidth, contentHeight, undefined, "FAST");
    heightLeft -= pdfPageHeight - marginMm * 2;
  }

  const blob = pdf.output("blob");
  const blobUrl = URL.createObjectURL(blob);

  return { blob, blobUrl };
}

/**
 * Generates PDF from DOM element and triggers print dialog
 */
export async function printElementAsPdf(
  element: HTMLElement,
  options: PrintPdfOptions = {}
): Promise<void> {
  const { blobUrl } = await generatePdfBlob(element, options);

  // Create temporary hidden iframe for seamless browser print dialog
  const printIframe = document.createElement("iframe");
  printIframe.style.position = "fixed";
  printIframe.style.right = "0";
  printIframe.style.bottom = "0";
  printIframe.style.width = "0";
  printIframe.style.height = "0";
  printIframe.style.border = "0";
  printIframe.src = blobUrl;

  document.body.appendChild(printIframe);

  printIframe.onload = () => {
    try {
      setTimeout(() => {
        printIframe.contentWindow?.focus();
        printIframe.contentWindow?.print();
        setTimeout(() => {
          if (document.body.contains(printIframe)) {
            document.body.removeChild(printIframe);
          }
        }, 60000); // Clean up after 1 min
      }, 350);
    } catch {
      // Fallback: Open in new tab if iframe printing is blocked
      const win = window.open(blobUrl, "_blank");
      win?.focus();
    }
  };
}

/**
 * Downloads the PDF directly to user machine
 */
export async function downloadElementAsPdf(
  element: HTMLElement,
  filename = "document.pdf",
  options: PrintPdfOptions = {}
): Promise<void> {
  const { blobUrl } = await generatePdfBlob(element, options);
  const link = document.createElement("a");
  link.href = blobUrl;
  link.download = filename.endsWith(".pdf") ? filename : `${filename}.pdf`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(blobUrl);
}
