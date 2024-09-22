// src/components/PDFcomp.tsx
import React, { useEffect, useState } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/esm/Page/AnnotationLayer.css";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import ArrowBackIosIcon from "@mui/icons-material/ArrowBackIos";

// Устанавливаем путь к pdf.worker.js
pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.mjs",
  import.meta.url
).toString();

interface PDFcompProps {
  link: string;
  task: string;
}

const PDFcomp: React.FC<PDFcompProps> = ({ link, task }) => {
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
              {/* <ArrowBackIosIcon style={{ fontSize: "1em" }} /> */}
              &lt;
            </button>
            <button
              className="pdf-change-page"
              disabled={pageNumber >= numPages}
              onClick={() => setPageNumber(pageNumber + 1)}
            >
              {/* <ArrowForwardIosIcon style={{ fontSize: "1em" }} /> */}
              &gt;
            </button>
          </div>
        )}

        <div
          className="pdf-download"
          style={{ marginTop: "50px", color: "black" }}
          onClick={download}
        >
          Скачать
        </div>
      </div>
    </div>
  );
};

export default PDFcomp;
