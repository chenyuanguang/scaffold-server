let axios=require("axios")
module.exports=(token)=>{
    // 添加请求拦截器
  axios.interceptors.request.use(function (config) {
    config.headers={
      ...config.headers,
      "PRIVATE-TOKEN":token
    }
    return config;
  }, function (error) {
    return Promise.reject(error);
  });
  return axios
}
