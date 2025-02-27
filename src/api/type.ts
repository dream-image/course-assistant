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
  createTime: number;
  ownerId: number;
  status: LessonStatus;
  startTime: number;
  endTime: number;
  teacherName: string;
  //学院
  college: string;
  //封面图片文件名称
  cover: string;
  delete: boolean;
  //是否已选
  hasChosen?: boolean;
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
    model: Modal[];
  };
}

export interface Modal {
  version: string;
  url: string;
  name: string;
}
export interface AddLessonParams {
  name: string;
  startTime: number;
  endTime: number;
  college: string;
}
export interface UpdateLessonParams {
  lessonId: number;
  name: string;
  createTime: number;
  startTime: number;
  endTime: number;
  teacherName: string;
  college: string;
}

export interface LessonFile {
  name: string;
  coverUrl?: string;
}
export interface GetLessonFileListResponse {
  data: LessonFile[];
}
export type LessonUserType = {
  createTime: "2024-12-30T17:43:01.000Z";
  userId: 1000001;
  nickname: "挂逼再次";
  avatar: "wxfile://tmp_1a8d2ae1c613965f7bb0a79f67d0492b6123da0646caaa1a.jpg";
  sex: 1;
  school: string;
  role: "student" | "teacher";
  email: string | null;
  joinTime: number;
  actions?: any;
  useCount: number;
};
export interface GetLessonStudentsListResponse {
  data: {
    total: number;
    list: LessonUserType[];
  };
}
