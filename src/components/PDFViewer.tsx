import React, { useState } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/esm/Page/AnnotationLayer.css";

if (typeof import.meta !== "undefined" && import.meta.url) {
  pdfjs.GlobalWorkerOptions.workerSrc = new URL(
    "pdfjs-dist/build/pdf.worker.min.mjs",
    import.meta.url
  ).toString();
} else {
  pdfjs.GlobalWorkerOptions.workerSrc =
    "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.10.377/pdf.worker.min.js";
}

interface PDFViewerProps {
  link: string;
  task: string;
}

const PDFViewer: React.FC<PDFViewerProps> = ({ link, task }) => {
  const [numPages, setNumPages] = useState<number>(0);
  const [pageNumber, setPageNumber] = useState<number>(1);

  function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
    setNumPages(numPages);
  }

  const download = () => {
    window.open(`https://astroacademy1.com/api/v1/download/${task}`);
  };

  return (
    <div>
      <div>
        <Document file={link} onLoadSuccess={onDocumentLoadSuccess}>
          <Page pageNumber={pageNumber} />
        </Document>
      </div>
      <div className="pdf-actions">
        <div>
          Страница {pageNumber} из {numPages}
        </div>
        {numPages > 1 && (
          <div className="pdf-page-buttons">
            <button
              className="pdf-change-page"
              disabled={pageNumber <= 1}
              onClick={() => setPageNumber(pageNumber - 1)}
            >
              &lt;
            </button>
            <button
              className="pdf-change-page"
              disabled={pageNumber >= numPages}
              onClick={() => setPageNumber(pageNumber + 1)}
            >
              &gt;
            </button>
          </div>
        )}
        <div className="pdf-download" onClick={download}>
          Скачать
        </div>
      </div>
    </div>
  );
};

export default PDFViewer;
