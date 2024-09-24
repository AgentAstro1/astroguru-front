import React, { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import PDFcomp from "./PDFcomp";
import "../static/styles/pdfpage.scss";

const PDFPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const pdfLink = searchParams.get("pdfLink");
  const taskId = searchParams.get("taskId");
  const navigate = useNavigate();

  useEffect(() => {
    const root = document.getElementById("root") as HTMLElement;
    root.style.overflowY = "scroll";
  }, []);

  if (!pdfLink || !taskId) {
    navigate("/");
    return null;
  }

  return (
    <div className="pdf-container">
      <PDFcomp link={pdfLink} task={taskId} />
    </div>
  );
};

export default PDFPage;