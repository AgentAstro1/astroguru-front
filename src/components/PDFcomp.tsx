// PDFcomp.tsx
import React, { useEffect, useState, Suspense } from "react";

interface PDFcompProps {
  link: string;
  task: string;
}

const PDFcomp: React.FC<PDFcompProps> = ({ link, task }) => {
  const [isSafariBrowser, setIsSafariBrowser] = useState<boolean | "">(false);

  useEffect(() => {
    const isSafari =
      navigator.vendor &&
      navigator.vendor.indexOf("Apple") > -1 &&
      navigator.userAgent &&
      navigator.userAgent.indexOf("CriOS") === -1 &&
      navigator.userAgent.indexOf("FxiOS") === -1;

    const isIphone = /iPhone/.test(navigator.userAgent);

    console.log("Safari: " + isSafari);
    console.log("iPhone: " + isIphone);

    if (isIphone) {
      setIsSafariBrowser(false);
    } else {
      setIsSafariBrowser(isSafari);
    }
  }, []);

  const download = () => {
    window.open(`https://astroacademy1.com/api/v1/download/${task}`);
  };

  if (isSafariBrowser) {
    return (
      <div>
        <div
          className="pdf-download"
          onClick={download}
        >
          Скачать
        </div>
      </div>
    );
  } else {
    const PDFViewer = React.lazy(() => import("./PDFViewer"));

    return (
      <Suspense fallback={<div>Загрузка...</div>}>
        <PDFViewer link={link} task={task} />
      </Suspense>
    );
  }
};

export default PDFcomp;
