import request, { BaseResponse, get, post } from "@/common/request";
import { UserInfo } from "@/types";
import { GetLessonListParams, GetLessonListResponse, LoginInfo } from "./type";
import { Stream } from "openai/src/streaming.js";
import OpenAI from "openai";
import { APIPromise } from "openai/core.mjs";

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
export const chat = async (params: {
  history: any[];
  message: string;
}): Promise<
  BaseResponse<
    APIPromise<
      | Stream<OpenAI.Chat.Completions.ChatCompletionChunk>
      | OpenAI.Chat.Completions.ChatCompletion
    >
  >
> => {
  return await post("/chat", params);
};
