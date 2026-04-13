import "./styles.css";
import { useTranslation } from "react-i18next";

// Helper function to check if a URL is absolute
const isAbsoluteUrl = (url) => {
  try {
    // If URL constructor succeeds, it's a valid absolute URL
    new URL(url);
    return true;
  } catch {
    // If URL constructor fails, check for protocol-relative URLs (//example.com)
    return url.startsWith('//');
  }
};

// Helper function to extract just the domain (origin) from a URL
const extractDomain = (url) => {
  if (!url) return '';
  
  try {
    const urlObj = new URL(url);
    return urlObj.origin; // Returns protocol + hostname + port (e.g., "https://example.com")
  } catch {
    // If URL is invalid, try to construct a basic origin
    // Handle cases where domainUrl might just be a hostname
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url.split('/').slice(0, 3).join('/'); // Extract protocol://hostname:port
    } else {
      return `https://${url}`; // Assume https if no protocol
    }
  }
};

const processImageSources = (htmlString, domainUrl) => {
  if (!htmlString) return htmlString;
  
  // Create a temporary DOM element to parse the HTML
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = htmlString;
  
  // Find all img tags
  const imgTags = tempDiv.querySelectorAll('img');
  
  imgTags.forEach(img => {
    const src = img.getAttribute('src');
    
    // Skip if no src, empty src, or if it's already an absolute URL
    if (!src || !src.trim() || isAbsoluteUrl(src)) {
      return;
    }
    
    // Extract just the domain (origin) from domainUrl
    const currentOrigin = extractDomain(domainUrl);
    
    // If src starts with '/', it's an absolute path, just prepend the origin
    // If it doesn't start with '/', it's a relative path, prepend origin + current path
    const newSrc = src.startsWith('/') 
      ? currentOrigin + src 
      : currentOrigin + '/' + src.replace(/^\.\//, '');
    
    img.setAttribute('src', newSrc);
  });
  
  return tempDiv.innerHTML;
};

const renderHTML = (htmlString, domainUrl) => {
  const processedHtml = processImageSources(htmlString, domainUrl);
  return { __html: processedHtml };
};

export function TableDetails({ data, domainUrl }) {
  const { t } = useTranslation();
  return (
    <table className="table1 table">
      <caption className="visually-hidden">
        {t("ELEMENT_RESULTS.result.caption")}
      </caption>
      <thead>
        <tr>
          <th scope="col" className="th_size">{t("ELEMENT_RESULTS.result.ocurrenceNumber")}</th>
          <th scope="col" >{t("ELEMENT_RESULTS.result.ocurrenceDetail")}</th>
        </tr>
      </thead>
      <tbody>
        {data &&
          data.map((item, index) => (
            <>
              <tr key={index}>
                <td className="ama-typography-display-4 align-middle text-center">{index + 1}</td>
                <td>
                  <dl className="text-start">
                    <dt className="mb-2">{t("ELEMENT_RESULTS.result.element")}</dt>
                    <dd className="mb-4">{item?.ele}</dd>
                    <dt className="mb-2">{t("ELEMENT_RESULTS.result.code")}</dt>
                    <dd className="mb-4"><code>{item?.code}</code></dd>
                    <dt>{t("ELEMENT_RESULTS.result.content")}</dt>
                    <dd className="mb-4">
                      <div
                        className="big-width"
                        dangerouslySetInnerHTML={renderHTML(item.showCode, domainUrl)}
                      />
                    </dd>
                    <dt className="mb-2">{t("ELEMENT_RESULTS.result.location")}</dt>
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
