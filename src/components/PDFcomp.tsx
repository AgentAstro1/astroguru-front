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
}

const PDFcomp: React.FC<PDFcompProps> = ({ link }) => {
  const [numPages, setNumPages] = useState<number>(0);
  const [pageNumber, setPageNumber] = useState<number>(1);

  function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
    setNumPages(numPages);
  }

  const download = () => {
    fetch(link)
      .then((response) => response.blob())
      .then((blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "ЭКСПРЕСС ПРОГНОЗ НА 2025 ГОД.pdf";
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(url);
      })
      .catch((err) => console.error(err));
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
              <ArrowBackIosIcon style={{ fontSize: "1em" }} />
            </button>
            <button
              className="pdf-change-page"
              disabled={pageNumber >= numPages}
              onClick={() => setPageNumber(pageNumber + 1)}
            >
              <ArrowForwardIosIcon style={{ fontSize: "1em" }} />
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
