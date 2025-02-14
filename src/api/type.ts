import { ScrollNumberProps } from "antd/lib/badge";

export type LoginInfo = {
  username?: string;
  password?: string;
};

export interface GetLessonListParams {
  limit: number;
  offset: number;
  lessonName?: string;
}
export enum LessonStatus {
  READY = "ready",
  ON = "on",
  OVER = "over",
}
export const LessonStatusMap = {
  [LessonStatus.ON]: {
    text: "进行中",
    color: "success",
  },
  [LessonStatus.OVER]: {
    text: "已结束",
    color: "default",
  },
  [LessonStatus.READY]: {
    text: "未开始",
    color: "warning",
  },
};

export type LessonType = {
  id: number;
  lessonId: number;
  name: string;
  createTime: ScrollNumberProps;
  ownerId: number;
  status: LessonStatus;
  startTime: number;
  endTime: number;
  teacherName: string;
};
export interface GetLessonInfoResponse {
  data: {
    total: number;
    list: LessonType[];
  };
}
export interface GetLessonListResponse {
  data: {
    total: number;
    lessonList: LessonType[];
  };
}

export interface GetAiVersionsResponse {
  data: {
    modal: Modal[];
  };
}

export interface Modal {
  version: string;
  url: string;
  name: string;
}
