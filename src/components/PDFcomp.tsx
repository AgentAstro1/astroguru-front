import React, { useEffect, useState, Suspense } from "react";
import { API_URL } from "../static/constants/cons";

interface PDFcompProps {
  link: string;
  task: string;
}

const PDFcomp: React.FC<PDFcompProps> = ({ link, task }) => {
  const [isSafariBrowser, setIsSafariBrowser] = useState<boolean | "">(false);

  useEffect(() => {
    const isMac = /(Mac|iPhone|iPod|iPad)/i.test(navigator.userAgent)

    if (isMac) {
      setIsSafariBrowser(false);
    } else {
      setIsSafariBrowser(isMac);
    }
  }, []);

  const download = () => {
    window.open(`${API_URL}/api/v1/download/${task}`);
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
