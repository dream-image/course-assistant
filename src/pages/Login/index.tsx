import welcome from "@/assets/欢迎.svg";
import { Button, cn, Image, Input, Link, NumberInput } from "@heroui/react";
import { useNavigate } from "react-router-dom";
import Background from "@/assets/背景图.jpg";
import { useContext, useEffect, useRef, useState } from "react";
import { login, sendVerifyCode } from "@/api";
import { message } from "antd";
import { LoginInfo } from "@/api/type";
import { setToken } from "@/utils";
import { UserInfo } from "@/types";
import { UserInfoContext } from "@/context/UserInfoContext";
import styles from "./style.module.css";
import { autoRefreshToken } from "@/utils/autoRefreshToken";
import { MobileContext } from "@/context/MobileContext";
import { SHA256 } from "crypto-js";
const verifyPhoneNumber = (phoneNumber: string) => {
  return /^1[3-9]\d{9}$/.test(phoneNumber)
    ? {
        status: true,
      }
    : {
        status: false,
        message: "请输入正确的手机号",
      };
};
let interval: number;
const Login = () => {
  const { setUserInfoContext } = useContext(UserInfoContext);
  const [loginInfo, setLoginInfo] = useState<LoginInfo>();
  const [isLoginByPhone, setIsLoginByPhone] = useState(false);
  const [_, setUserInfo] = useState<UserInfo>();
  const [countDown, setCountDown] = useState(0);
  const { isMobile } = useContext(MobileContext);
  const passwordRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const loginFn = async () => {
    try {
      if (!isLoginByPhone && !loginInfo?.password && !loginInfo?.username) {
        message.error("请填写密码和用户名");
        return;
      }
      if (isLoginByPhone && !loginInfo?.phoneNumber && !loginInfo?.code) {
        if (
          loginInfo?.phoneNumber &&
          !verifyPhoneNumber(loginInfo?.phoneNumber).status
        ) {
          return;
        }
        message.error("请填写手机号和验证码");
        return;
      }
      const res = await login({
        ...loginInfo,
        isLoginByPhone,
        password: SHA256(loginInfo?.password || "").toString(),
      });
      setUserInfo({
        ...res.data?.data,
        hasLogin: true,
      });
      setUserInfoContext({ ...res.data?.data, hasLogin: true });
      setToken(res.headers["authorization"]);
      autoRefreshToken();
      message.success("登录成功");
      navigate("/ai/lesson");
    } catch (error: any) {
      const msg = error.error_msg || error.message;
      message.error(msg);
      console.log(msg);
    }
  };
  const sendCode = async () => {
    if (!loginInfo?.phoneNumber) {
      message.error("请填写手机号");
      return;
    }
    if (!verifyPhoneNumber(loginInfo?.phoneNumber).status) {
      return;
    }
    try {
      await sendVerifyCode({
        phone: loginInfo?.phoneNumber,
      });
      message.success("发送成功");
      setCountDown(60);
    } catch (error: any) {
      const msg = error.error_msg || error.message || "发送失败";
      message.error(msg);
    }
  };
  useEffect(() => {
    if (countDown === 60) {
      let time = 60;
      interval = setInterval(() => {
        setCountDown(time--);
      }, 1000);
    }
    if (!countDown && interval) {
      clearInterval(interval);
    }
  }, [countDown]);
  return (
    <div
      className={cn(
        "grid h-screen  animate-opacity",
        isMobile
          ? "grid-cols-1 justify-items-center"
          : "grid-cols-2 min-w-[800px] ",
      )}
    >
      <div
        className={cn(
          " w-full   flex flex-col  items-center",
          isMobile ? "px-5 max-w-[400px]" : "",
        )}
      >
        {isMobile ? (
          <div className="flex justify-center  items-center w-96 mb-5 mt-10 ">
            <Image
              src="/logo.svg"
              alt="天书"
              width={100}
              height={100}
              className=" border border-slate-100  shadow-lg"
            />
          </div>
        ) : (
          <div className="flex mb-32 items-center w-96">
            <Image src="/logo.svg" alt="天书" width={50} height={50} />
            <span className="font-semibold font-kai text-2xl">天书</span>
          </div>
        )}
        <div
          className={cn(
            "flex-col  animate__animated  animate__bounceIn ",
            isMobile ? "w-full" : " h-[400px]  w-96 ",
          )}
        >
          <div className="flex content-center w-full h-min mb-5 animate-pulse">
            <Image src={welcome} alt="欢迎" width={40} height={40}></Image>
            <span className="text-3xl align-bottom h-min my-auto font-bold">
              Welcome!
            </span>
          </div>
          {isLoginByPhone ? (
            <>
              <div className="flex flex-col gap-3">
                <Input
                  type="tel"
                  autoComplete="on"
                  validate={(value) => {
                    return verifyPhoneNumber(value)?.message;
                  }}
                  className={styles["input-container"]}
                  variant="faded"
                  labelPlacement="outside"
                  placeholder="请输入手机号"
                  label="手机号"
                  value={loginInfo?.phoneNumber}
                  onValueChange={(value) => {
                    setLoginInfo({
                      ...loginInfo,
                      phoneNumber: value,
                    });
                  }}
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      passwordRef.current?.focus();
                    }
                  }}
                ></Input>
                <div className="flex justify-between items-end h-full">
                  <Input
                    variant="faded"
                    type="text"
                    labelPlacement="outside"
                    placeholder="请输入验证码"
                    label="验证码"
                    onChange={(e) => {
                      setLoginInfo({
                        ...loginInfo,
                        code: e.target.value,
                      });
                    }}
                    ref={passwordRef}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        loginFn();
                      }
                    }}
                  ></Input>
                  <Button
                    className="ml-3 from-blue-300 to-sky-500 text-white shadow-lg bg-gradient-to-tr"
                    onPress={() => {
                      sendCode();
                    }}
                    isDisabled={!!countDown}
                  >
                    {countDown ? countDown + "S" : "发送验证码"}
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="flex flex-col gap-3">
                <Input
                  type="text"
                  autoComplete="on"
                  className={styles["input-container"]}
                  variant="faded"
                  labelPlacement="outside"
                  placeholder="请输入用户名"
                  label="用户名"
                  value={loginInfo?.username}
                  onChange={(e) => {
                    setLoginInfo({
                      ...loginInfo,
                      username: e.target.value,
                    });
                  }}
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      passwordRef.current?.focus();
                    }
                  }}
                ></Input>
                <Input
                  variant="faded"
                  type="password"
                  labelPlacement="outside"
                  placeholder="请输入密码"
                  label="密码"
                  onChange={(e) => {
                    setLoginInfo({
                      ...loginInfo,
                      password: e.target.value,
                    });
                  }}
                  ref={passwordRef}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      loginFn();
                    }
                  }}
                ></Input>
              </div>
              <div className="w-full flex justify-between mt-2">
                <Link
                  className="text-sm text-sky-400 hover:text-sky-600 hover:cursor-pointer"
                  onPress={() => {
                    navigate("/register");
                  }}
                >
                  注册
                </Link>
                <Link
                  className="text-sm text-gray-500 hover:text-sky-600 hover:cursor-pointer"
                  onPress={() => {}}
                >
                  忘记密码？
                </Link>
              </div>
            </>
          )}

          <div className="mt-2">
            <Button
              color="primary"
              className="bg-gradient-to-tr from-blue-200 to-sky-500 text-white shadow-lg w-full"
              onPress={() => {
                loginFn();
              }}
            >
              登录
            </Button>
          </div>
          <div
            className="flex justify-start items-center mt-2 text-sm opacity-60 font-medium cursor-pointer hover:text-slate-500"
            onClick={() => {
              setIsLoginByPhone(!isLoginByPhone);
            }}
          >
            {isLoginByPhone ? "使用账号密码进行登录" : "使用手机号进行登录"}
          </div>
        </div>
      </div>
      {!isMobile ? (
        <div
          className="bg-gray-300 bg-cover blur-sm bg-no-repeat"
          style={{ backgroundImage: `url(${Background})` }}
        ></div>
      ) : null}
    </div>
  );
};
export default Login;
