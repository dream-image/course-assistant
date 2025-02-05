import { refreshToken } from "@/api";
import { UserInfoContext } from "@/context/UserInfoContext";
import { useContext } from "react";

export const getToken = () => {
  return localStorage.getItem("token");
};
export const setToken = (token: string) => {
  localStorage.setItem("token", token);
};

export const useUserInfo = () => {
  const userInfo = useContext(UserInfoContext);
  return userInfo;
};

export const loadingText = (loading: boolean) => {
  return loading ? "加载中..." : "";
};
