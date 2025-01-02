import request, { get, post } from "@/common/request";
import { UserInfo } from "@/types";
import { GetLessonListParams, GetLessonListResponse, LoginInfo } from "./type";

export const refreshToken = async () => {
  return get<{ availableTime: number }>("/token/refresh");
};
export const getUserInfo = async () => {
  return get<UserInfo>("/userInfo");
};
export const login = async (params: LoginInfo) => {
  return request.post("/login", params);
};

export const getLessonList = async (
  params: GetLessonListParams,
): Promise<GetLessonListResponse> => {
  return get("/lesson/list", params);
};
