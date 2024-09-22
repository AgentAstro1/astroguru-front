import React, { Suspense } from "react";
import { Routes, Route, useNavigate } from "react-router-dom";
import "./static/styles/index.scss";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import ChatBubbleIcon from "@mui/icons-material/ChatBubble";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";

import logo from "./static/img/logo.png";
const MainForm = React.lazy(() => import("./components/MainForm"));
const PDFPage = React.lazy(() => import("./components/PDFPage"));

function App() {
  const navigate = useNavigate();

  const navigateHome = () => {
    navigate("/");
  };
  return (
    <div className="app">
      <div className="header">
        <img
          id="logo"
          src={logo}
          className="header-logo"
          alt="Logo"
          onClick={navigateHome}
        />
        {/* <div className="header-content">
          <div className="header-content-items">
            <ChatBubbleIcon className="header-content-profile" />
            <HelpOutlineIcon className="header-content-profile" />
            <AccountCircleIcon className="header-content-profile" />
          </div>
        </div> */}
      </div>

      <Suspense fallback={<div>Загрузка...</div>}>
        <Routes>
          <Route path="/" element={<MainForm />} />
          <Route path="/pdf" element={<PDFPage />} />
        </Routes>
      </Suspense>
    </div>
  );
}

export default App;
