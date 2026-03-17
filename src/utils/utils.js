import {ruleset} from "@a12e/accessmonitor-rulesets";
import { saveAs } from "file-saver";

export function validateURL(url) {
  try {
    const newUrl = new URL(url);
    const hostname = newUrl.hostname;
    const wwwIndex = hostname.indexOf("www.");

    if (wwwIndex !== -1) {
      if (hostname.indexOf(".", wwwIndex + 4) === -1) {
        return false;
      }
    }

    const dotIndex = hostname.lastIndexOf(".");
    const lastChar = hostname.charAt(hostname.length - 1);
    if (
      dotIndex === -1 ||
      dotIndex === hostname.length - 1 ||
      !lastChar.match(/[a-zA-Z]/)
    ) {
      return false;
    }

    return (
      (newUrl.protocol === "http:" || newUrl.protocol === "https:") &&
      hostname.includes(".")
    );
  } catch (err) {
    return false;
  }
}

export function convertBytes(length) {
  if (length < 1024) {
    return length + " bytes";
  } else if (length < 1024000) {
    return Math.round(length / 1024) + " KB";
  } else {
    return Math.round(length / 1048576) + " MB";
  }
}

export function downloadCSV(dataProcess, originalData, t) {
  const data = [];

  let error, level, sc, desc, num;
  const descs = [
    "CSV.date",
    "CSV.errorType",
    "CSV.level",
    "CSV.criteria",
    "CSV.desc",
    "CSV.count",
    "CSV.value",
    "RESULTS.summary.score",
  ];

  for (const row in dataProcess["results"]) {
    if (dataProcess["results"][row]) {
      const rowData = [];
      error =
        "CSV." +
        (dataProcess["results"][row]["prio"] === 3
          ? "scoreok"
          : dataProcess["results"][row]["prio"] === 2
            ? "scorewar"
            : "scorerror");
      level = dataProcess["results"][row]["lvl"];
      num = dataProcess["results"][row]["value"];
      desc =
        "TESTS_RESULTS." +
        dataProcess["results"][row]["msg"] +
        (num === 1 ? ".s" : ".p");
      sc = ruleset[dataProcess["results"][row]["msg"]]?.["scs"]?.join(" ") || "";

      descs.push(desc, error);
      rowData.push(
        dataProcess?.metadata?.url,
        originalData.date,
        dataProcess["results"][row]["msg"],
        error,
        level,
        sc,
        desc,
        num === undefined ? 0 : isNaN(parseInt(num)) ? 1 : num,
        !isNaN(parseInt(num)) ? "" : num,
        dataProcess?.metadata?.score.replace(".", ",")
      );
      data.push(rowData);
    }
  }

  const labels = [];
  for(const row in data){
    if(data[row]){
      data[row][6] = t(`${data[row][6]}`).replace("{{value}}", data[row][8] ? data[row][8] : data[row][7])
      data[row][6] = data[row][6].replace(new RegExp("<mark>", "g"), "");
      data[row][6] = data[row][6].replace(new RegExp("</mark>", "g"), "");
      data[row][6] = data[row][6].replace(new RegExp("<code>", "g"), "");
      data[row][6] = data[row][6].replace(new RegExp("</code>", "g"), "");
      data[row][6] = data[row][6].replace(new RegExp("&lt;", "g"), "");
      data[row][6] = data[row][6].replace(new RegExp("&gt;", "g"), "");
      data[row][3] = t(`${data[row][3]}`);
    }
  }
  labels.push("URI");
  labels.push(t("CSV.date"));
  labels.push("ID");
  labels.push(t("CSV.errorType"));
  labels.push(t("CSV.level"));
  labels.push(t("CSV.criteria"));
  labels.push(t("CSV.desc"));
  labels.push(t("CSV.count"));
  labels.push(t("CSV.value"));
  labels.push(t("RESULTS.summary.score"));

  let csvContent = labels.join(";") + "\r\n";
  for (const row of data || []) {
    csvContent += row.join(";") + "\r\n";
  }

  const blob = new Blob([csvContent], { type: "text/csv" });
  saveAs(blob, "eval.csv");
}
