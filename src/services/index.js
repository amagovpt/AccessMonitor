/* eslint-disable no-array-constructor */

import scs from "../lib/scs";
import tests from "../lib/tests";
import tests_colors from "../lib/tests_colors";
import { refWebsite, testView } from "../pages/Resume/utils";

import { convertBytes } from "../utils/utils";

export function processData(tot, url) {
  if (tot === null || tot === undefined) {
    return null;
  }
  const datax = {};

  datax["metadata"] = {};
  datax["metadata"]["url"] = tot["info"]["url"];
  datax["metadata"]["title"] = tot["info"]["title"];
  datax["metadata"]["n_elements"] = tot["info"]["htmlTags"];
  datax["metadata"]["score"] = tot["info"]["score"];
  datax["metadata"]["size"] = convertBytes(tot["info"]["size"]);
  datax["metadata"]["last_update"] = tot["info"]["date"];
  datax["metadata"]["count_results"] = Object.keys(tot["results"]).length;
  datax["metadata"]["validator"] = tot.elems["w3cValidator"] === "true";
  datax["results"] = [];

  const infoak = {
    A: {
      ok: 0,
      err: 0,
      war: 0,
    },
    AA: {
      ok: 0,
      err: 0,
      war: 0,
    },
    AAA: {
      ok: 0,
      err: 0,
      war: 0,
    },
  };

  for (const test in tests) {
    if (test) {
      if (tot.results[test]) {
        let tes = tests[test]["test"];
        const lev = tests[test]["level"];
        const ref = tests[test]["ref"];
        const ele = tests[test]["elem"];

        let color;

        if (tests_colors[test] === "R") {
          color = "err";
        } else if (tests_colors[test] === "Y") {
          color = "war";
        } else if (tests_colors[test] === "G") {
          color = "ok";
        }

        const level = lev.toUpperCase();

        infoak[level][color]++;

        let tnum;

        if (tot.elems[tes] !== undefined) {
          if (tes === "titleOk") {
            tnum = tot.info.title;
          } else if (tes === "lang") {
            tnum = tot.info.lang;
          } else if (tes === "langNo") {
            tnum = "lang";
          } else if (tes === "titleLong") {
            tnum = tot.info.title.length;
          } else {
            tnum = tot["elems"][tes];
          }
        } else if (tes === "imgAltNo") {
          tnum = tot.elems["img"];
          tes = "img";
        } else if (tes === "inputLabelNo") {
          tnum = tot.elems["label"];
        } else {
          tnum = tot["elems"][ele];
        }

        const result = {};
        result["ico"] = "assets/images/ico" + color + ".png";
        result["color"] = color;
        result["lvl"] = level;
        result["msg"] = test;
        result["ref"] = ref;

        result["ref_website"] = refWebsite(ref);
        if (/^[A-Za-z]\d+$|^[A-Z]{4}\d+$/.test(tests[test]["ref"])) {
          result["relation"] = "relationT"
        } else {
          result["relation"] = "relationACT"
        }
        result["ref_related_sc"] = new Array();
        result["value"] = tnum;
        result["prio"] = color === "ok" ? 3 : color === "err" ? 1 : 2;

        const scstmp = tests[test]["scs"].split(",");

        for (let s in scstmp) {
          if (s) {
            const li = {};
            s = scstmp[s].trim();
            if (s !== "") {
              li["sc"] = s;
              li["lvl"] = scs[s]["1"];
              li["link"] =
                "https://www.w3.org/WAI/WCAG21/Understanding/" +
                scs[s]["0"] +
                ".html";

              result["ref_related_sc"].push(li);
            }
          }
        }

        result["tech_list"] = testView(tes, tes, tes, color, tnum, url);
        datax["results"].push(result);
      }
    }
  }

  datax["infoak"] = infoak;

  return datax;
}

export function getTestResults(test, data, tot) {
  const { nodes } = data;
  const allNodes = nodes;
  const ele = test;

  return getElements(allNodes, ele, tot);
}

export function getElements(allNodes, ele, tot) {
  // const ead = processData(tot);

  const dataTransform = processData(tot);

  if (ele === "form") {
    ele = "formSubmitNo";
  }

  const elements = getElementsList(allNodes && allNodes[ele], tot);

  let result = "G";
  const results = dataTransform?.results.map((r) => r.msg);
  for (const test in tests || {}) {
    const _test = tests[test];
    if (_test.test === ele && results?.includes(test)) {
      result = tests_colors[test];
      break;
    }
  }

  return {
    type: "html",
    result,
    elements,
    size: elements.length,
    finalUrl: dataTransform?.metadata.url,
  };
}

export function getTagName(element) {
  let name = element.htmlCode.slice(1);

  let k = 0;
  for (let i = 0; i < name.length; i++, k++) {
    if (name[i] === " " || name[i] === ">") {
      break;
    }
  }

  name = name.substring(0, k);

  return name;
}

export function fixCode(code, tot, showCode) {
  code = code.replace(/_cssrules="true"/g, "");
  code = code.replace(/_documentselector="undefined"/g, "");

  let index = code.indexOf('_selector="');
  while (index !== -1) {
    let foundEnd = false;
    let foundStart = false;
    let k = index;
    while (!foundEnd) {
      k++;
      if (code[k] === '"') {
        if (!foundStart) {
          foundStart = true;
        } else {
          foundEnd = true;
        }
      }
    }

    code = code.replace(code.substring(index, k), "");
    index = code.indexOf('_selector="');
  }
  return showCode ? removeImgStyles(code) : code;
}

export function getElementsList(nodes, tot) {
  const elements = new Array();
  for (const node of nodes || []) {
    if (node.elements) {
      const ele = getTagName(node.elements[0]);
      elements.push({
        ele,
        code:
          ele === "style"
            ? node.elements[0].attributes
            : fixCode(node.elements[0].htmlCode, tot),
        showCode: ele === "style" ? undefined : fixCode(node.elements[0].htmlCode, tot, true),
        pointer: node.elements[0].pointer,
      });
    } else {
      const ele = getTagName(node);
      elements.push({
        ele,
        code: ele === "style" ? node.attributes : fixCode(node.htmlCode, tot),
        showCode: ele === "style" ? undefined : fixCode(node.htmlCode, tot, true),
        pointer: node.pointer,
      });
    }
  }

  return elements;
}

function fixeSrcAttribute(code, tot) {
  const ead = processData(tot);

  if (code.startsWith("<img")) {
    const protocol = ead.metadata.url.startsWith("https://")
      ? "https://"
      : "http://";
    const www = ead.metadata.url.includes("www.") ? "www." : "";

    let fixSrcUrl = ead.metadata.url
      .replace("http://", "")
      .replace("https://", "")
      .replace("www.", "")
      .split("/")[0];
    if (fixSrcUrl[fixSrcUrl.length - 1] === "/") {
      fixSrcUrl = fixSrcUrl.substring(0, fixSrcUrl.length - 2);
    }

    let srcAttribute = "";
    const index = code.indexOf('src="');
    if (index !== -1) {
      let foundEnd = false;
      let foundStart = false;
      let k = index;
      let startIndex = -1;
      while (!foundEnd) {
        k++;
        if (code[k] === '"') {
          if (!foundStart) {
            foundStart = true;
            startIndex = k;
          } else {
            foundEnd = true;
          }
        }
      }
      srcAttribute = code.substring(startIndex + 1, k);

      if (
        srcAttribute &&
        !srcAttribute.startsWith("http") &&
        !srcAttribute.startsWith("https")
      ) {
        if (srcAttribute.startsWith("/")) {
          srcAttribute = `"${protocol}${www}${fixSrcUrl}${srcAttribute}`;
        } else {
          srcAttribute = `"${protocol}${www}${fixSrcUrl}/${srcAttribute}`;
        }

        code = splice(code, startIndex, 0, srcAttribute);
      }
    }
  }

  return code;
}

function splice(code, idx, rem, str) {
  return code.slice(0, idx) + str + code.slice(idx + Math.abs(rem));
}

function removeImgStyles(code) {

  let htmlString = code.replace(/<img[^>]*>/g, function(imgTag) {
    // Remove style, width, and height attributes from the <img> tag
    imgTag = imgTag.replace(/style="[^"]*"/g, '');  // Remove the style attribute
    imgTag = imgTag.replace(/width="[^"]*"/g, '');  // Remove the width attribute
    imgTag = imgTag.replace(/height="[^"]*"/g, ''); // Remove the height attribute

    // Clean up any extra spaces that may be left behind
    imgTag = imgTag.replace(/\s+/g, ' ').trim();
    return imgTag;
  });
  return htmlString;
}
