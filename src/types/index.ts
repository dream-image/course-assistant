export type UserInfo = {
  hasLogin: boolean;
  uGroup: string[];
  username: string;
  nickname: string;
  role: string;
  userid: number;
  sex: number;
  permissions: string[];
  avatar: string;
  email: string;
};

export enum ESex {
  MALE = 1,
  FEMALE = 0,
  OTHER = 3,
}
