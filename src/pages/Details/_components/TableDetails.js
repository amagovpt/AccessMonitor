import "./styles.css";
import { useTranslation } from "react-i18next";

const renderHTML = (htmlString) => {
  return { __html: htmlString };
};

export function TableDetails({ data }) {
  const { t } = useTranslation();
  return (
    <table className="table1 table">
      <caption className="visually-hidden">
        {t("ELEMENT_RESULTS.result.caption")}
      </caption>
      <thead>
        <tr>
          <th className="th_size">{t("ELEMENT_RESULTS.result.ocurrenceNumber")}</th>
          <th>{t("ELEMENT_RESULTS.result.ocurrenceDetail")}</th>
        </tr>
      </thead>
      <tbody>
        {data &&
          data.map((item, index) => (
            <>
              <tr key={index} className="table_container-details">
                <td className="counter">{index + 1}</td>
                <td>
                  <dl className="text-start">
                    <dt>{t("ELEMENT_RESULTS.result.element")}</dt>
                    <dd className="mb-4">{item?.ele}</dd>
                    <dt>{t("ELEMENT_RESULTS.result.code")}</dt>
                    <dd className="mb-4"><code>{item?.code}</code></dd>
                    <dt>{t("ELEMENT_RESULTS.result.content")}</dt>
                    <dd className="mb-4">
                      <div
                        className="img"
                        dangerouslySetInnerHTML={renderHTML(item.showCode)}
                      />
                    </dd>
                    <dt>{t("ELEMENT_RESULTS.result.location")}</dt>
                    <dd>{item?.pointer}</dd>
                  </dl>
                </td>
              </tr>
            </>
          ))}
      </tbody>
    </table>
  );
}
