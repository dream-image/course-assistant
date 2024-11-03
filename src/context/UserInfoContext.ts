import { UserInfo } from "@/types";
import { createContext } from "react";


export const UserInfoContext = createContext<UserInfo&{setUserInfoContext: React.Dispatch<React.SetStateAction<UserInfo>>}>({} as UserInfo&{setUserInfoContext: React.Dispatch<React.SetStateAction<UserInfo>>});
