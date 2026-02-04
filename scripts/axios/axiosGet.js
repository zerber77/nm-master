////НЕ ТРОГАТЬ!!!!!!
/////функция для GET-запросов
////запускаем лоадер $q.loading.show
////выполняем запрос, если ошибка, кидаем ее наверх
////если все норм, прячем лоадер и отдаем ответ и функцию request (в замыкании)

import api from "./api";
import axios from "axios";
export function useGet(url,options={},showLoader =true){
  let response
  
  const request = async () => {
    try {
      const res = await api.get(url)
      response = await res.data
      return response // Возвращаем данные
    }catch (e) {
      throw e.message
    }
  }
  return {response, request}
}
