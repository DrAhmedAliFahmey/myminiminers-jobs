const axios = require("axios");
axios.defaults.withCredentials = true;
const axiosCookieJarSupport = require("axios-cookiejar-support").default;
const tough = require("tough-cookie");
axios.defaults.withCredentials = true;
axiosCookieJarSupport(axios);
axios.defaults.jar = new tough.CookieJar();

exports.httpClient = axios;
