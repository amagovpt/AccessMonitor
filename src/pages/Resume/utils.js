export function refWebsite(ref) {
  let result;
  if (!(/^[A-Za-z]\d+$|^[A-Z]{4}\d+$/.test(ref))) {
    result = refWebsiteACT(ref);
  } else {
    result = refWebsiteTecnique(ref);
  }
  return result;
}

export function refWebsiteACT(ref) {
  return "https://www.w3.org/WAI/standards-guidelines/act/rules/" + ref + "/";
}

export function refWebsiteTecnique(ref) {
  let path;
  if (ref.startsWith("C")) path = "css/";
  else if (ref.startsWith("H")) path = "html/";
  else if (ref.startsWith("A")) path = "aria/";
  else if (ref.startsWith("S")) path = "client-side-script/";
  else if (ref.startsWith("G")) path = "general/";
  else path = "failures/";
  return "https://www.w3.org/WAI/WCAG21/Techniques/" + path + ref + ".html";
}

export function testView(ele, txt, test, color, tot, url) {
  const item = {};

  item["txt"] = txt;
  item["tot"] = tot ? tot : 0;

  if (ele === "dtdOld") {
    return item;
  }

  if (ele === "w3cValidatorErrors") {
    item["html_validator"] = true;
    item["ele"] =
      "https://validator.w3.org/nu/?doc=" + encodeURIComponent(url);
  } else if (tot || tot > 0) {
    item["ele"] = ele;

    if (
      (test === "aSkip" ||
        test === "langNo" ||
        test === "h1" ||
        test === "titleNo") &&
      color === "err"
    ) {
      delete item["ele"];
    }
  } else if (test === "aSkipFirst") {
    item["ele"] = ele;
  }

  if (test === "ehandBoth" || test === "ehandler") {
    item["ele"] = "ehandBoth";
  }

  return item;
}

export function sumValuesByKey(key, object) {
  if (!object) {
    return 0;
  }

  let value = object[key];

  if (!value) {
    return 0;
  }

  let result = (value.ok || 0) + (value.err || 0) + (value.war || 0);
  return result;
}

export function sumAllValues(object) {
  if (object === null) {
    return { ok: 0, err: 0, war: 0 };
  }

  let allsum = { ok: 0, err: 0, war: 0 };
  for (let key in object) {
    let value = object[key];
    allsum.ok += value.ok || 0;
    allsum.err += value.err || 0;
    allsum.war += value.war || 0;
  }
  return allsum;
}

// Format Result second table

export function optionForAccordion(t, data) {
  const optionsArray = data.results
    .map((result) => {
      const testResultType = result.value === 1 ? "s" : "p";
      const testResult = t(`TESTS_RESULTS.${result.msg}.${testResultType}`);

      if (!testResult) {
        return null;
      }

      const sc_text =
        result.ref_related_sc &&
        Array.isArray(result.ref_related_sc) &&
        result.ref_related_sc.length > 0
          ? result.ref_related_sc.map((item) => item.sc)
          : null;

      const linkcs =
        result.ref_related_sc &&
        Array.isArray(result.ref_related_sc) &&
        result.ref_related_sc.length > 0
          ? result.ref_related_sc.map((item) => item.link)
          : null;

      const sc_level =
        result.ref_related_sc &&
        Array.isArray(result.ref_related_sc) &&
        result.ref_related_sc.length > 0
          ? result.ref_related_sc.map((item) => item.lvl)
          : null;

      const additionalInfo = t(`TXT_TECHNIQUES.${result.ref}`) || "";
      const additionalInfoLink = t(`TECHS.${result.ref}`) || "";
      const additionalInfoWagError = t(`TECHFAIL.${result.relation}`) || "";

      let iconName;

      if (result.color === "err") {
        iconName = "AMA-Wrong-Line";
      } else if (result.color === "war") {
        iconName = "AMA-Middle-Line";
      } else {
        iconName = "AMA-Check-Line";
      }

      let tdClassName;

      if (result.color === "err") {
        tdClassName = "error-cell";
      } else if (result.color === "war") {
        tdClassName = "warning-cell";
      } else {
        tdClassName = "success-cell";
      }

      return {
        id: result.msg,
        lvl: result.lvl,
        cs: sc_text,
        iconName: iconName,
        tdClassName: tdClassName,
        ele: result?.tech_list?.ele,
        title: (
          <span
            className="custom-title"
            dangerouslySetInnerHTML={{
              __html: testResult.replace("{{value}}", result.value),
            }}
          />
        ),

        ref_website: result.ref_website,
        component: (
          <div className="content_info">
            <div className="d-flex flex-column">
              <div dangerouslySetInnerHTML={{ __html: additionalInfo }} />
              <a
                href={result?.ref_website}
              >{`${result.ref}: ${additionalInfoLink}`}</a>
              <span>{additionalInfoWagError}</span>
            </div>

            <div className="criterio d-block">
              {sc_text && (
                <ul className="d-flex flex-column">
                  {sc_text.map((sc, index) => (
                    <li key={index}>
                      Critérios de sucesso: {sc}
                      <span>
                        <i>(Nível {sc_level[index]})</i>
                      </span>
                      <a href={linkcs[index]} className="fw-normal m-1">
                        Noções sobre o CS {sc}
                      </a>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        ),
      };
    })
    .filter((option) => option !== null);

  return optionsArray;
}

export function callbackImgT(t, img) {
  return t(`RESULTS.results.image_title.${img}`)
}