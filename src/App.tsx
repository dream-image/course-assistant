import { Spinner } from "@heroui/react";
import { Suspense, useEffect, useMemo, useState } from "react";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { authRouter, NotAuthRouterList } from "./router";
import { UserInfoContext } from "./context/UserInfoContext";
import { UserInfo } from "./types";
import { getUserInfo } from "./api";
import { autoRefreshToken } from "./utils/autoRefreshToken";
import { message } from "antd";
import { PermissionEnum } from "./common/permission";
import { PageLoading } from "@ant-design/pro-components";
import { MobileContext } from "./context/MobileContext";
import { debounce } from "lodash-es";

function App() {
  const [userInfo, setUserInfo] = useState<UserInfo>({} as UserInfo);
  const [isMobile, setIsMobile] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const observe = useMemo(() => {
    return new ResizeObserver(
      debounce(
        (entries) => {
          const bodyEntries = entries?.[0];
          if (bodyEntries) {
            const body = bodyEntries.target;
            const width = body.clientWidth;
            if (width < 1000) {
              setIsMobile(true);
            } else {
              setIsMobile(false);
            }
          }
        },
        1000,
        {
          leading: true,
        },
      ),
    );
  }, []);
  useEffect(() => {
    observe.observe(document.body);
    return () => {
      observe.unobserve(document.body);
    };
  }, []);
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
        <MobileContext.Provider
          value={{
            isMobile,
            setIsMobile,
          }}
        >
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
        </MobileContext.Provider>
      )}
    </>
  );
}

export default App;
