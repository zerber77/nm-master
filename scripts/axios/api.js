////настройки axios
////НЕ ТРОГАТЬ!!!!!!

import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL, // Динамическое определение baseURL
  withCredentials:true,
  crossDomain:true
})

api.interceptors.request.use(config => {
    const token = localStorage.getItem('authToken')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`; // Добавляем токен в заголовок
    }
    // config.headers['Content-Type'] = 'application/x-www-form-urlencoded'
    return config
  },
  error=>{
    console.log('ERROR  in api. rejected'+error)
  })

api.interceptors.response.use(config=>{
  return config
}, error=>{
    console.log('ERROR  in api. '+ error)
    return Promise.reject(error);
})

export default api
