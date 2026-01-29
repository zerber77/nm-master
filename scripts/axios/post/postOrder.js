import { usePost } from "../axiosPostApi";

export async function postOrder(orderData) {
    const { request } = usePost('/api/orders/postOrder/', orderData, {})
    try {
        const response = await request()
        //////здесь обрабатываем результат как вам надо
        console.log(response)
        return { response }
    } catch (e) {
        console.log('ERROR in postOrder usePost', e)
        throw e
    }
}