// src/components/PDFPage.tsx
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
    // logo.style.display = "none";
    // logo.style.margin = "0";
  }, []);

  // Если pdfLink отсутствует, перенаправляем обратно на главную страницу
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
