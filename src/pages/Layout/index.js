import { useContext } from "react";
import { ThemeContext } from "../../context/ThemeContext";
import { Footer, Header } from 'ama-design-system'
import { useLocation } from 'react-router-dom'
import "./styles.css";
import { useTranslation } from "react-i18next";

import { pathURL } from "../../App";

export default function Layout({ children }) {
  const { theme, toggleTheme } = useContext(ThemeContext);
  const location = useLocation()
  const mainDark = theme === "light" ? "" : "main_dark";

  const { t, i18n: {language, changeLanguage} } = useTranslation();

  const toggleLanguage = () => {
    if (language === "en") {
      changeLanguage("pt");
      document.querySelector("html")?.setAttribute("lang", "pt-PT");
    } else {
      changeLanguage("en");
      document.querySelector("html")?.setAttribute("lang", "en");
    }
  };

  return (
    <>
      <Header
        darkTheme={theme}
        logo={theme === "light" ? `${pathURL}img/logo.svg` : `${pathURL}img/logo-dark.svg`}
        description={t("HEADER.line_text")}
        homePage={location.pathname === `${pathURL}` ? true : false}
        language={language}
        changeLanguage={toggleLanguage}
        changeTheme={toggleTheme}
        linkTo={`${pathURL}`}
        ariaLabel={t("HEADER.header_arial_label")}
        altLogo={"AccessMonitor, WCAG 2.1"}
      />
      <main
        className={`main ${mainDark}`}
        id="content"
        aria-label={t("HOME_PAGE.main_aria")}
      >
        {children}
      </main>

      <Footer darkTheme={theme} />
    </>
  );
}
