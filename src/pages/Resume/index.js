import { useContext, useEffect, useState } from "react";
import { Breadcrumb, Gauge, LoadingComponent, StatsTable, TableComponent } from "ama-design-system";

// Api
import { getEvalData } from "../../config/api";

import { processData } from "../../services";
import { ButtonsActions } from "./_components/buttons-revalidation";
import { useNavigate, useParams, useLocation } from "react-router-dom";

import { useTranslation } from "react-i18next";
import { downloadCSV } from "../../utils/utils";
import { ThemeContext } from "../../context/ThemeContext";
import { optionForAccordion, callbackImgT } from "./utils";
import "./styles.css";

import LZString from 'lz-string';

import { pathURL } from "../../App";

export let tot;

export default function Resume({ setAllData, setEle }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();

  const [loadingProgress, setLoadingProgress] = useState(true);
  const [error, setError] = useState(false);

  const [dataProcess, setDataProcess] = useState([]);
  const [originalData, setOriginalData] = useState([]);
  const [pageCode, setPageCode] = useState();
  const contentHtml = location.state?.contentHtml || null;
  const { content } = useParams();

  const { theme } = useContext(ThemeContext);
  const themeClass = theme === "light" ? "" : "dark_mode-resume";

  useEffect(() => {
    const fetchData = async () => {
      setLoadingProgress(true);

      const urlParams = new URLSearchParams(window.location.search);
      const forceRefresh = urlParams.get('refresh');
      const noRefresh = urlParams.get('noRefresh');
      const currentUrl = content === "html" ? contentHtml : content;

      try {
        // Check for recent evaluation based on timestamp
        const evaluationTimestamp = localStorage.getItem("evaluationTimestamp");
        const currentTime = Date.now();
        const cacheMaxAge = 60000; // 60 seconds in milliseconds
        const isCacheExpired = !evaluationTimestamp || (currentTime - parseInt(evaluationTimestamp)) > cacheMaxAge;
      
        // Skip localStorage check if forceRefresh parameter exists
        if (noRefresh || (!forceRefresh && !isCacheExpired)) {
          const compressedData = localStorage.getItem("evaluation");
          const type = localStorage.getItem("evaluationType");
          const storedData = LZString.decompressFromUTF16(compressedData);
          const storedUrl = type === "html" ? LZString.decompressFromUTF16(localStorage.getItem("evaluationHtml")) : localStorage.getItem("evaluationUrl");

          if (storedData && currentUrl.startsWith(storedUrl)) {
            const parsedStoredData = JSON.parse(storedData);
            setOriginalData(parsedStoredData);
            setDataProcess(processData(parsedStoredData?.result?.data?.tot, currentUrl));
            setPageCode(parsedStoredData?.result?.pagecode || "html");
            setLoadingProgress(false);

            tot = parsedStoredData?.result?.data?.tot;

            return;
          }
        }
        
        // Fetch new data if no cache or forceRefresh is set
        const response = await getEvalData(content, currentUrl);
        if(response.data.success !== 1 && !response.result) {
          setError(t("MISC.unexpected_error"))
          setLoadingProgress(false);
        } else {
          const compressedData = LZString.compressToUTF16(JSON.stringify(response.data));
          localStorage.setItem("evaluation", compressedData);
          localStorage.setItem("evaluationType", content);
          localStorage.setItem("evaluationTimestamp", currentTime.toString()); // Save timestamp
        
          if (content !== "html") {
            localStorage.setItem("evaluationUrl", currentUrl);
          } else {
            const compressedHTML = LZString.compressToUTF16(response.data.result?.pagecode);
            localStorage.setItem("evaluationHtml", compressedHTML);
          }
  
          tot = response?.data?.result?.data.tot;
  
          setOriginalData(response.data);
          setDataProcess(processData(response.data?.result?.data?.tot, currentUrl));
          setPageCode(response.data?.result?.pagecode || "html");
          setLoadingProgress(false);
        }
      } catch (error) {
        console.error("Erro", error);
        setLoadingProgress(false);
        setError(t("MISC.unexpected_error"))
      }
    };

    fetchData();
  }, [content, contentHtml, location.search]);

  const reRequest = () => {
    const timestamp = Date.now();

    if (content === "html") {
      const currentURL = window.location.pathname + window.location.search;

      if (`${pathURL}results/${content}` === currentURL) {
        window.location.href = currentURL;
      } else {
        navigate(`${pathURL}results/${content}`, { state: { contentHtml } });
      }
    } else {
      const encodedURL = encodeURIComponent(content);
      navigate(`${pathURL}results/${encodedURL}?refresh=${timestamp}`);
      // const currentURL = window.location.pathname + window.location.search;

      // if (`${pathURL}results/${encodedURL}` === currentURL) {
      //   window.location.href = currentURL;
      // } else {
      //   navigate(`${pathURL}results/${encodedURL}`);
      // }
    }
  };

  const seeCode = () => {
    const encodedURL = encodeURIComponent(content);
    navigate(`${pathURL}results/${encodedURL}/code`, {
      state: {
        content: dataProcess,
        original: originalData,
        code: pageCode,
      },
    });
  };

  function setAllDataResult(ele, allData) {
    setAllData(allData);
    const type = allData.rawUrl;

    if (type === "") {
      const content = "html";
      if(ele.startsWith('http://') || ele.startsWith('https://')) {
        window.open(ele, '_blank');
      } else {
        navigate(`${pathURL}results/${content}/${ele}`, {
          state: {
            contentHtml: pageCode,
          },
        });
      }
    } else {
      if(ele.startsWith('http://') || ele.startsWith('https://')) {
        window.open(ele, '_blank');
      } else {
        const encodedURL = encodeURIComponent(allData?.rawUrl);
        navigate(`${pathURL}results/${encodedURL}/${ele}`);
      }
    }
  }

  const dataBreadCrumb = [
    {
      title: "Acessibilidade.gov.pt",
      href: "https://www.acessibilidade.gov.pt/",
    },
    { title: "Access Monitor", href: `${pathURL}` },
    {
      title: dataProcess?.metadata?.url || "html",
      href: dataProcess?.metadata?.url,
    },
  ];

  const scoreData = dataProcess?.metadata?.score;
  let scoreDataFormatted = scoreData && scoreData.toString();

  if (scoreDataFormatted === "10.0") {
    scoreDataFormatted = "10";
  }

  return (
    <div className={`container ${themeClass}`}>
      <div className="link_breadcrumb_container">
        <Breadcrumb data={dataBreadCrumb} darkTheme={theme} tagHere={t("HEADER.DROPDOWN.youarehere")} />
      </div>

      <div className="report_container">
        <h1 className="report_container_subtitle">{t("RESULTS.title")}</h1>
        {loadingProgress ? (
          <section className={`loading_container bg-white`}>
            <LoadingComponent loadingText={t("MISC.loading")} darkTheme={theme} />
          </section>
        ) : (
          !error ? <ButtonsActions
            reRequest={reRequest}
            seeCode={seeCode}
            downloadCSV={() => downloadCSV(dataProcess, originalData, t)}
            href={dataProcess?.metadata?.url}
            themeClass={themeClass}
          /> : <h3>{error}</h3>
        )}
      </div>
      {!loadingProgress && !error && (
        <>
          <section className="sumary_container bg-white">
            <h2>{t("RESULTS.summary.title")}</h2>
            <div className="d-flex flex-row mt-5 mb-5 justify-content-between container_uri_chart">
              <div className="chart_container">
                <Gauge
                  percentage={scoreDataFormatted}
                  darkTheme={theme}
                  title={[t("RESULTS.summary.score")]}
                  screenReaderTitle={t("RESULTS.summary.gauge.title", {value: scoreDataFormatted})}
                />
              </div>
              <div className="resume_info_about_uri d-flex flex-column gap-4">
                <div className="d-flex flex-column">
                  <span>URL</span>
                  <span className="break_url">{dataProcess?.metadata?.url}</span>
                </div>

                <div className="d-flex flex-column">
                  <span>{t("RESULTS.summary.metadata.title_label")}</span>
                  <span>{dataProcess?.metadata?.title}</span>
                </div>
              </div>
            </div>
            <div className="d-flex flex-row justify-content-between size_and_table_container">
              <div className="size_container d-flex flex-column gap-4">
                <div className="d-flex flex-column">
                  <span>{dataProcess?.metadata?.n_elements}</span>
                  <span>{t("RESULTS.summary.metadata.n_elements_label")}</span>
                </div>

                <div className="d-flex flex-column">
                  <span>{dataProcess?.metadata?.size}</span>
                  <span>{t("RESULTS.summary.metadata.page_size_label")}</span>
                </div>
              </div>
              <div className="table_container_sumary">
                <StatsTable
                  data={{data: dataProcess}}
                  darkTheme={theme}
                  ok={t("RESULTS.summary.table.labels.ok")}
                  warning={t("RESULTS.summary.table.labels.warn")}
                  error={t("RESULTS.summary.table.labels.err")}
                  title={t("RESULTS.summary.table.title")}
                  caption={t("RESULTS.summary.metadata.caption")}
                  type={t("RESULTS.summary.table.typeLabel")}
                />
              </div>
            </div>
          </section>
          <section className="bg-white avaliation_container">
            <h2 className="avaliation_title mb-3">{t("RESULTS.results.title")}</h2>
            <TableComponent
              data={optionForAccordion(t, dataProcess)}
              onClick={(ele) => setAllDataResult(ele, originalData?.result?.data)}
              imageTitlesCallback={(img) => callbackImgT(t, img)}
              caption={t("RESULTS.results.caption")}
              col1={t("RESULTS.results.practice")}
              col2={t("RESULTS.results.lvl")}
              col3={t("RESULTS.results.details")}
              lvlTitle={t("RESULTS.results.lvl") + ": "}
              ariaLabel={t("RESULTS.results.details")}
              darkTheme={theme}
              ariaLabels={{
                button: t("RESULTS.results.details"),
                A: t("RESULTS.results.ariaLabels.A"),
                AA: t("RESULTS.results.ariaLabels.AA"),
                AAA: t("RESULTS.results.ariaLabels.AAA")
              }}
            />
          </section>
        </>
      )}
    </div>
  );
}
