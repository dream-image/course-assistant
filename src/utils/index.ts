import { UserInfoContext } from "@/context/UserInfoContext";
import { GetProp, UploadProps } from "antd";
import { useContext } from "react";
export const PDFExt = ["pdf"];
export const WRODExt = ["doc", "docx"];
export const PPTExt = ["ppt", "pptx"];
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

export type FileType = Parameters<GetProp<UploadProps, "beforeUpload">>[0];
export const getBase64 = (img: FileType, callback: (url: string) => void) => {
  const reader = new FileReader();
  reader.addEventListener("load", () => callback(reader.result as string));
  reader.readAsDataURL(img);
};
