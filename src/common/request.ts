import { getToken } from "@/utils";
import { message } from "antd";
import axios from "axios";
export type BaseResponse<T> = {
    result: number;
    error_msg: string;
    data: T;
}
const request = axios.create({
    baseURL: 'http://localhost:8888/',
    timeout: 2000,
});
request.interceptors.request.use(function (config) {
    config.headers.Authorization = getToken() || ""
    return config
})
request.interceptors.response.use(function (response) {


    if (response.status === 404) {
        return Promise.reject(new Error('网络错误，请稍后再试'))
    }
    if (response.data?.result !== 1) {
        return Promise.reject(response.data)
    }

    return response
}, function (error) {
    return Promise.reject(error)
})
export const get = async <T>(url: string, params?: Record<string, any>): Promise<BaseResponse<T>> => {
    
    const res = await request.get(url, { params })
    return res.data

}
export const post = async (url: string, data: Record<string, any>): Promise<BaseResponse<any>> => {
    const res = await request.post(url, data)

    return res.data
}
export default request;