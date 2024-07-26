// import axios from "axios";

// export const api = axios.create({
//   baseURL: "http://10.55.37.16:/api/amp",
// });

import axios from "axios";

const baseURLDEV = process.env.REACT_APP_AMP_DEV_SERVER;
const baseURLPPR = process.env.REACT_APP_AMP_PPR_SERVER;
const baseURLPRD = process.env.REACT_APP_AMP_PRD_SERVER;

export const api = axios.create({
  baseURL: baseURLPRD,
});
