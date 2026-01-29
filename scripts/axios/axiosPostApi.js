import api from "./api";
/// с параметрами все понятно вроде, добавлен showLoader для отображения спиннера загрузки, при false не отображать.
/// Не отображать, если элемент (например select имеет свой индикатор загрузки)
export function usePost(url,dataToSend = {},options={}){
    let response
    const request = async () => {
        try {
            const res = await api.post(url, dataToSend, options);
            response = res.data;
            return response;
        } catch (e) {
            console.error('ERROR in usePost:', e);
            throw e.message;
        }
    }
    return {response, request}
}
