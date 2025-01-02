import { UserInfo } from "@/types";
import { createContext } from "react";

export const UserInfoContext = createContext<{
  userInfo: UserInfo;
  setUserInfoContext: React.Dispatch<React.SetStateAction<UserInfo>>;
}>(
  {} as {
    userInfo: UserInfo;
    setUserInfoContext: React.Dispatch<React.SetStateAction<UserInfo>>;
  },
);
