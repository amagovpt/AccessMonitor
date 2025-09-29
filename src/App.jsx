import "./styles/theme.css";
import "./styles/fontStyle.css";
import "./styles/main.css";

import 'ama-design-system/dist/index.css';

import { useState, useEffect } from "react";
import { ThemeProvider } from "./context/ThemeContext";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "./i18n";

import Layout from "./pages/Layout";
import Home from "./pages/Home/";
import Resume from "./pages/Resume";
import Detail from "./pages/Details";
import PageCode from "./pages/PageCode";
import Error from "./pages/Error";

 //export const pathURL = process.env.REACT_APP_DEV_SERVER_URL;
//export const pathURL = process.env.REACT_APP_PPR_SERVER_URL;
export const pathURL = process.env.REACT_APP_PRD_SERVER_URL;

export default function App() {
  const [allData, setAllData] = useState([]);
  const [setEle] = useState([]);

  /*TODO: Script para mudar o ano no footer  remover até actualizar o design system */
 useEffect(() => {
    const footerEl = document.querySelector("footer .ama-typography-body");
    if (footerEl) {
      footerEl.textContent = footerEl.textContent.replace(
        /\b\d{4}\b/,
        new Date().getFullYear()
      );
    }
  }, []);

  return (
    <ThemeProvider>
      <Router>
        <Layout>
          <Routes basename={`${pathURL}`}>
            <Route path={`${pathURL}`} element={<Home />} />

            <Route
              path={`${pathURL}results/:content`}
              element={<Resume setAllData={setAllData} setEle={setEle} />}
            />

            <Route
              path={`${pathURL}results/:content/:details`}
              element={<Detail setAllData={setAllData} allData={allData} />}
            />

            <Route
              path={`${pathURL}results/:content/code`}
              element={<PageCode setAllData={setAllData} setEle={setEle} />}
            />

            {/* Outras rotas */}

            {/* Error page needs to be last */}
            <Route path={`${pathURL}*`} element={<Error />} />
          </Routes>
        </Layout>
      </Router>
    </ThemeProvider>
  );
}
