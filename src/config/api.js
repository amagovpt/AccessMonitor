import axios from "axios";

import dataJSON from '../utils/data.json'

const baseURLEnv = process.env.REACT_APP_AMP_SERVER;

export const api = axios.create({
  baseURL: baseURLEnv,
});

export const getEvalData = async (content, currentURL) => {
  if (process.env.REACT_APP_API_DATA_SOURCE === "local") {
    return await getEvalDataByLocal(content, currentURL);
  }
  return await getEvalDataByAPI(content, currentURL);
}

// TODO: SRP , cannot receive argument that can be a URL or HTML content
// Refactor into two pure functions one for evaluation of html post and 
const getEvalDataByAPI = async (content, currentURLorHTML) => {
  if(content === "html") {
   return await api.post(`/eval/html`, { html: currentURLorHTML })
  } else {
    const encodedURL = encondeBase64Url(currentURLorHTML);
   return await api.get(`/eval/${encodedURL}`);  
  }
}

function encondeBase64Url(url) {
  return btoa(url);
}

const getEvalDataByLocal = async (content, currentURL) => {
  const response = dataJSON
  return response;
}
