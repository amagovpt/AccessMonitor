import { useContext } from "react";
import { useTranslation } from "react-i18next";
import { ThemeContext } from "../../context/ThemeContext";
import { useNavigate } from "react-router-dom";
import { Button, Icon } from 'ama-design-system'
import "./styles.css";

import { pathURL } from "../../App";

export default function Resume() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const { theme } = useContext(ThemeContext);
  const themeClass = theme === "light" ? "" : "dark_mode-error";

  return (
    <div className={`container_error ${themeClass}`}>
      <h1>{t("MISC._404.title")}</h1>
      <p>{t("MISC._404.description")}</p>
      <Button
        darkTheme={theme}
        text={t("MISC._404.homepage")}
        size="small"
        id="btn-url"
        onClick={() => navigate(`${pathURL}`)}
        iconRight={<Icon name="AMA-Entrar-Line" />}
      />
    </div>
  );
}
