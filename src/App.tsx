import { Spinner } from "@heroui/react";
import { Suspense, useEffect, useState } from "react";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { authRouter, NotAuthRouterList } from "./router";
import { UserInfoContext } from "./context/UserInfoContext";
import { UserInfo } from "./types";
import { getUserInfo } from "./api";
import { autoRefreshToken } from "./utils/autoRefreshToken";
import { message } from "antd";
import { PermissionEnum } from "./common/permission";
import { PageLoading } from "@ant-design/pro-components";

function App() {
  const [userInfo, setUserInfo] = useState<UserInfo>({} as UserInfo);
  const [isLoading, setIsLoading] = useState(true);
  const init = async () => {
    try {
      setIsLoading(true);
      const res = await getUserInfo();
      setUserInfo({
        ...res.data,
        hasLogin: true,
      });
      console.log("已登录");
      autoRefreshToken();
    } catch (error: any) {
      const msg = error?.error_msg || error?.message || error;
      console.log(msg);
      message.error({ content: msg });
      setTimeout(() => {
        location.replace("/login");
      }, 1000);
    }
    setIsLoading(false);
  };
  useEffect(() => {
    if (
      userInfo.hasLogin ||
      NotAuthRouterList.some((i) =>
        new RegExp(`/${i}$`).test(window.location.pathname),
      )
    ) {
      setIsLoading(false);
      return;
    }
    init();
  }, []);

  return (
    <>
      {isLoading ? (
        <Spinner></Spinner>
      ) : (
        <UserInfoContext.Provider
          value={{
            userInfo,
            setUserInfoContext: (props) => {
              setUserInfo(props);
            },
          }}
        >
          <Suspense fallback={<PageLoading />}>
            <RouterProvider
              router={createBrowserRouter(authRouter(userInfo.uGroup ?? []))}
            ></RouterProvider>
          </Suspense>
        </UserInfoContext.Provider>
      )}
    </>
  );
}

export default App;
