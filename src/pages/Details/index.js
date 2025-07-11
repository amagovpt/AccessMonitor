/* eslint-disable react-hooks/exhaustive-deps */
import { getTestResults } from "../../services";
import { useEffect, useState, useContext } from "react";
import { TableDetails } from "./_components/TableDetails";
import "./styles.css";
import { useTranslation } from "react-i18next";
import { ThemeContext } from "../../context/ThemeContext";
import { Breadcrumb, Icon, LoadingComponent } from "ama-design-system";

// Api
import { getEvalData } from "../../config/api";
import tests from "../../lib/tests";

import { useParams, useNavigate, useLocation } from "react-router-dom";

import { tot } from '../Resume'

import LZString from 'lz-string';

import { pathURL } from "../../App";

export let tot2;

export default function Details({ allData, setAllData }) {
  const location = useLocation();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { details } = useParams();
  const { theme } = useContext(ThemeContext);

  const [loadingProgress, setLoadingProgress] = useState(true);
  const [error, setError] = useState(false);

  const contentHtml = location.state?.contentHtml || null;

  const themeClass = theme === "light" ? "" : "dark_mode-details";

  const url = allData?.rawUrl;

  const handleGoBack = () => {
    if(!url) {
      navigate(`${pathURL}results/html`, {
        state: {
          contentHtml: contentHtml
        },
      })
    } else {
      const test = location.pathname.split("/")
      navigate(`${pathURL}results/${test[test.length-2]}`);
    }
  };

  let resultKey = null;
  for (const key in tests) {
    if (tests[key].test === details) {
      resultKey = key;
      break;
    }
  }

  // const textHeading = t(`ELEMS.${details}`);
  const [dataTable, setDataTable] = useState([]);

  const testResultType = dataTable?.size === 1 ? "s" : "p";
  const testResult = t(`TESTS_RESULTS.${resultKey}.${testResultType}`);

  const dataBreadCrumb = [
    {
      title: "Acessibilidade.gov.pt",
      href: "https://www.acessibilidade.gov.pt/",
    },
    { title: "Access Monitor", href: `${pathURL}` },
    {
      title: url || "html",
      href: "",
    },
    {
      title: <span
        dangerouslySetInnerHTML={{ __html: testResult.replace("{{value}}", dataTable?.size) }}
      />,
      href: "#",
    },
  ];

  function getDetailsData(data, tt) {
    const response = getTestResults(details, data, tt);
    setDataTable(response);
  }

  useEffect(() => {
    const fetchData = async () => {
      setLoadingProgress(true);

      try {
        if(allData && allData.tot && allData.elems) {
          getDetailsData(allData, tot);
          setLoadingProgress(false);
          return;
        }
        const compressedData = localStorage.getItem("evaluation");
        const storedData = LZString.decompressFromUTF16(compressedData);
        const storedUrl = localStorage.getItem("evaluationUrl");
        const test = location.pathname.split("/")
        let url = test[test.length-2]
        
        const currentUrl = decodeURIComponent(url)

        if (storedData && storedUrl === currentUrl) {
          const parsedStoredData = JSON.parse(storedData);
          setAllData(parsedStoredData.result?.data);
          tot2 = parsedStoredData?.result?.data?.tot;
          getDetailsData(parsedStoredData.result?.data, tot2);
          setLoadingProgress(false);
          return;
        }
        const response = await getEvalData(false, currentUrl);
        if(response.data.success !== 1 && !response.result) {
          setError(t("MISC.unexpected_error"))
          setLoadingProgress(false);
        } else {
          if (url !== "html") {
            const compressedData = LZString.compressToUTF16(JSON.stringify(response.data));
            localStorage.setItem("evaluation", compressedData);
            localStorage.setItem("evaluationUrl", currentUrl);
          }
          
          tot2 = response?.data?.result?.data.tot;
          setAllData(response.data?.result?.data);
          getDetailsData(response.data?.result?.data);
          setLoadingProgress(false);
        }
      } catch (error) {
        console.error("Erro", error);
        setLoadingProgress(false);
        setError(t("MISC.unexpected_error"))
      }
    };

    fetchData();
  }, []);

  let iconName;

  if (dataTable?.result === "R") {
    iconName = "AMA-Wrong-Line";
  } else if (dataTable?.result === "Y") {
    iconName = "AMA-Middle-Line";
  } else {
    iconName = "AMA-Check-Line";
  }

  let tdClassName;

  if (dataTable?.result === "R") {
    tdClassName = "error-cell";
  } else if (dataTable?.result === "Y") {
    tdClassName = "warning-cell";
  } else {
    tdClassName = "success-cell";
  }

  return (
    <>
      <div className={`container ${themeClass}`}>
        <div className="link_breadcrumb_container">
          <Breadcrumb data={dataBreadCrumb} onClick={handleGoBack} darkTheme={theme} tagHere={t("HEADER.DROPDOWN.youarehere")} />
        </div>

        <div className="report_container">
          <h1 className="report_container_title mb-5">
            {t("ELEMENT_RESULTS.subtitle")}
          </h1>
        </div>

        {loadingProgress ? (
          <section className={`loading_container bg-white`}>
            <LoadingComponent loadingText={t("MISC.loading")} darkTheme={theme} />
          </section>
        ) : 
        !error ? <>
            <div className="bg-white show_details">
              <div className="d-flex flex-row justify-content-between align-items-center show_details-container">
                <div className="d-flex flex-row align-items-center">
                  <div className={`d-flex align-items-center justify-content-center m-2 p-3 ${tdClassName}`}>
                    <Icon name={iconName} />
                  </div>

                  <span
                    className="textHeader ama-typography-body-large bold"
                    dangerouslySetInnerHTML={{ __html: testResult.replace("{{value}}", dataTable?.size) }}
                  />
                </div>

                <div className="result_left_container">
                  <span className="ama-typography-display-6 bold p-2 ps-4">{dataTable?.size}</span>
                  <span className="ama-typography-body p-2">{t("ELEMENT_RESULTS.total_elements")}</span>
                </div>
              </div>
            </div>

            <div className="tabContent_container-details">
              <TableDetails data={dataTable?.elements} />
            </div>
          </> : <h3>{error}</h3>
        }
      </div>
    </>
  );
}
