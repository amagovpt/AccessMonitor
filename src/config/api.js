import axios from "axios";

import dataJSON from '../utils/data.json'

const baseURLDEV = process.env.REACT_APP_AMP_DEV_SERVER;
const baseURLPPR = process.env.REACT_APP_AMP_PPR_SERVER;
const baseURLPRD = process.env.REACT_APP_AMP_PROD_SERVER;

export const api = axios.create({
  baseURL: baseURLDEV,
});

export const getEvalData = async (content, currentURL) => {
  const response = await getEvalDataByAPI(content, currentURL);
  //const response = await getEvalDataByLocal(content, currentURL);

  return response;
}

const getEvalDataByAPI = async (content, currentURL) => {
  const response = content === "html" ? 
      await api.post("/eval/html", { html: currentURL })
    : await api.get(`/eval/${encodeURIComponent(currentURL)}`);

  return response;
}

const getEvalDataByLocal = async (content, currentURL) => {
  const response = dataJSON
  return response;
}
