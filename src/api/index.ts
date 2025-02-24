import request, { BaseResponse, get, post } from "@/common/request";
import { UserInfo } from "@/types";
import {
  GetAiVersionsResponse,
  GetLessonFileListResponse,
  GetLessonInfoResponse,
  GetLessonListParams,
  GetLessonListResponse,
  LoginInfo,
  UpdateLessonParams,
} from "./type";

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

export const getLessonInfo = async (
  id: number,
): Promise<GetLessonInfoResponse> => {
  return get(`/lesson/detail/${id}`);
};

export const getAiVersions = async (): Promise<GetAiVersionsResponse> => {
  return get("/ai/version");
};

export const changeLessonCover = async (params: { lessonId: number }) => {
  return post("/cover/new/lesson", params);
};

export const updateLesson = async (params: UpdateLessonParams) => {
  return post("/updateLesson", params);
};

export const removeLessonFile = async (params: {
  lessonId: number;
  fileName: string;
}) => {
  return request.delete("/upload/lesson", { params });
};

export const getLessonFileList = async (params: {
  lessonId: number;
}): Promise<GetLessonFileListResponse> => {
  return get("/upload/lesson", params);
};

export const deleteLessonFile = async (params: {
  lessonId: number;
  fileName: string;
}) => {
  return request.delete("/upload/lesson", { params });
};
