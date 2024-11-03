import request, { get, post } from "@/common/request"
import { UserInfo } from "@/types"
import { LoginInfo } from "./type";




export const refreshToken = async () => {
    return get("/token/refresh")
}
export const getUserInfo = async () => {
    return get<UserInfo>('/userInfo')
}
export const login = async (params: LoginInfo) => {
    return request.post("/login", params)
}

