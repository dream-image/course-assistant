export enum ESex {
  MALE = 1, //男性
  FEMALE = 0, //女性
  OTHER = 3, //其他
}

export type UserInfo = {
  hasLogin: boolean; //登录状态
  uGroup: string[]; //用户路由权限组
  username: string; //用户名
  nickname: string; //用户昵称
  role: string; //用户角色
  userid: number; //用户id
  sex: ESex; //用户性别
  permissions: string[]; //用户权限
  avatar: string; //用户头像
  email: string; //用户邮箱
};
