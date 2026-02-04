////настройки axios
////НЕ ТРОГАТЬ!!!!!!

import axios from "axios";
import { isTokenExpired } from '../tokenExpired.js';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL, // Динамическое определение baseURL
  withCredentials:true,
  crossDomain:true
})

api.interceptors.request.use(config => {
    const token = localStorage.getItem('authToken')
    
    // Проверяем, не истек ли токен
    if (token && isTokenExpired(token)) {
        // Если токен истек, удаляем его из localStorage
        localStorage.removeItem('authToken');
        // Перенаправляем на главную страницу, если мы не на странице логина
        if (!window.location.pathname.includes('/login')) {
            window.location.href = '/';
        }
        // Не добавляем истекший токен в заголовок
        return config;
    }
    
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
