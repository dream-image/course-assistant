import { ScrollNumberProps } from "antd/lib/badge";

export type LoginInfo = {
  username?: string;
  password?: string;
};

export interface GetLessonListParams {
  limit: number;
  offset: number;
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
  name: string;
  createTime: ScrollNumberProps;
  ownerId: number;
  status: LessonStatus;
  startTime: number;
  endTime: number;
  teacherName: string;
};
export interface GetLessonListResponse {
  data: {
    total: number;
    lessonList: LessonType[];
  };
}
