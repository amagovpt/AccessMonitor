import { ButtonsActions } from "./_components/buttons-revalidation";
import "./styles.css";
import { useLocation, useNavigate } from "react-router-dom";
import { Breadcrumb, LoadingComponent } from 'ama-design-system'
import { processData } from "../../services";
// Api
import { getEvalData } from "../../config/api";

import { useTranslation } from "react-i18next";
import { useContext, useState, useEffect } from "react";
import { ThemeContext } from "../../context/ThemeContext";

import { downloadCSV } from "../../utils/utils";

import { pathURL } from "../../App";

export default function Resume() {
  const location = useLocation();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const [dataProcess, setDataProcess] = useState([]);
  const [loadingProgress, setLoadingProgress] = useState(true);
  const [originalData, setOriginalData] = useState([]);
  const [pageCode, setPageCode] = useState();
  
  const { theme } = useContext(ThemeContext);
  const themeClass = theme === "light" ? "" : "dark_mode-code";

  const dataProcessPrev = location.state?.content || null;
  const originalDataPrev = location.state?.original || null;

  const code = location.state?.code || null;

  const handleGoBack = () => {
    const test = location.pathname.split("/")

    navigate(`${pathURL}results/${test[test.length-2]}`);
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoadingProgress(true);

      try {
        if(dataProcessPrev && originalDataPrev && code) {
          setOriginalData(originalDataPrev);
          setDataProcess(dataProcessPrev);
          setPageCode(code);
          setLoadingProgress(false);
          return;
        }
        const storedData = localStorage.getItem("evaluation");
        const storedUrl = localStorage.getItem("evaluationUrl");
        const test = location.pathname.split("/")
        let url = test[test.length-2]
        const currentUrl = decodeURIComponent(url)
        if (storedData && storedUrl === currentUrl) {
          const parsedStoredData = JSON.parse(storedData);
          setOriginalData(parsedStoredData);
          setDataProcess(processData(parsedStoredData?.result?.data?.tot));
          setPageCode(parsedStoredData?.result?.pagecode || "html");
          setLoadingProgress(false);
          return;
        }
        const response = await getEvalData(false, currentUrl);
        if (url !== "html") {
          localStorage.setItem("evaluation", JSON.stringify(response.data));
          localStorage.setItem("evaluationUrl", currentUrl);
        }
        
        setOriginalData(response.data);
        setDataProcess(processData(response.data?.result?.data?.tot));
        setPageCode(response.data?.result?.pagecode || "html");
        setLoadingProgress(false);
      } catch (error) {
        console.error("Erro", error);
        setLoadingProgress(false);
      }
    };

    fetchData();
  }, []);

  const dataBreadCrumb = [
    {
      title: "Acessibilidade.gov.pt",
      href: "https://www.acessibilidade.gov.pt/",
    },
    { title: "Access Monitor", href: `${pathURL}` },
    {
      title: dataProcess?.metadata?.url || "html",
      href: "",
    },
    {
      title: t("HEADER.NAV.code"),
    },
  ];

  return (
    <div className={`container ${themeClass} `}>
      <div className="link_breadcrumb_container">
        <Breadcrumb data={dataBreadCrumb} onClick={handleGoBack} darkTheme={theme} />
      </div>
      <div className="report_container">
        <div className="acess_monitor" lang="en">
          AccessMonitor
        </div>
        <h1 className="report_container_title py-3">
          {dataProcess?.metadata?.url || "html"}
        </h1>
        <p className="report_container_subtitle">{t("HEADER.NAV.code")}</p>
        {loadingProgress ? (
          <section className={`loading_container bg-white`}>
            <LoadingComponent loadingText={t("MISC.loading")} darkTheme={theme} />
          </section>
        ) : (
          <ButtonsActions
            downloadCSV={() => downloadCSV(dataProcess, originalData, t)}
            handleGoBack={() => handleGoBack()}
            themeClass={themeClass}
          />
        )}
      </div>
      {!loadingProgress ? <section className="html_code">
        <pre tabIndex="0">{pageCode || `<></>`}</pre>
      </section> : null}
    </div>
  );
}
