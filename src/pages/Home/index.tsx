import {
  Avatar,
  Button,
  Chip,
  Divider,
  Dropdown,
  DropdownTrigger,
  Image,
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@heroui/react";
import { Outlet, useNavigate } from "react-router-dom";
import background from "@/assets/background.png";
import image from "@/assets/头像.png";
import { useContext } from "react";
import { UserInfoContext } from "@/context/UserInfoContext";
import { DownOutlined } from "@ant-design/icons";
import { UserInfo } from "@/types";
import student from "@/assets/student.svg";
import hduLogo from "@/assets/hdulogo.png";
import legal from "@/assets/官方认证.svg";
import { setToken } from "@/utils";
const RoleTag = (props: {
  userInfo?: UserInfo;
  text?: string;
  icon?: string;
}) => {
  const { userInfo, text } = props;
  if (text) {
    return (
      <>
        <Chip
          variant="faded"
          startContent={
            props.icon ? (
              <Image src={props.icon} width={20} height={20}></Image>
            ) : null
          }
        >
          <span className="font-kai">{text}</span>
        </Chip>
      </>
    );
  }
  if (userInfo?.role === "student")
    return (
      <>
        <Chip
          variant="faded"
          startContent={<Image src={student} width={20} height={20}></Image>}
        >
          <span className="font-kai">学生</span>
        </Chip>
      </>
    );
  return (
    <>
      <Chip variant="bordered" className="flex">
        <Image src={student}></Image>
        <span>老师</span>
      </Chip>
    </>
  );
};

const AvatarInfo = (props: {
  userInfo: UserInfo;
  hasIcon?: boolean;
  widthFlex?: boolean;
}) => {
  const { userInfo, hasIcon = true, widthFlex = true } = props;
  return (
    <>
      <Avatar src={image} size="md" />
      <div className={` h-full flex items-center ${widthFlex ? "flex-1" : ""}`}>
        <div className="flex flex-col justify-center items-center">
          <span className="text-[#1f1f1f] text-sm w-max">
            {userInfo.nickname}
          </span>
          <span className="text-[#A5A5AB] w-full text-xs">
            ID:{userInfo.userid}
          </span>
        </div>
        {hasIcon ? <DownOutlined style={{ fontSize: 10 }} /> : null}
      </div>
    </>
  );
};
const nav = [
  {
    name: "课程中心",
    key: ["all"],
    path: "lesson",
  },
  {
    name: "个人主页",
    key: ["all"],
    path: "info",
  },
];
const Home = () => {
  const navigate = useNavigate();
  const { userInfo } = useContext(UserInfoContext);
  console.log("userInfo", userInfo);

  return (
    <div
      className="bg-cover w-full h-full absolute"
      style={{ backgroundImage: `url(${background})` }}
    >
      <div className="fixed top-0 w-full h-[76px] border-b-1 border-blue-50  flex justify-center">
        <div className="w-[1680px] flex">
          <div className="flex  items-center w-max ml-4 h-full">
            <Image src="/logo.svg" alt="天书" width={50} height={50} />
            <span className="font-semibold font-kai text-2xl text-gray-700">
              天书
            </span>
          </div>
          <div className="flex-1 ml-8 flex items-center">
            {nav
              .filter(
                (item) =>
                  item.key.includes("all") || item.key.includes(userInfo?.role),
              )
              .map((item) => {
                return (
                  <div className="flex h-[40px]" key={item.name}>
                    <Divider className=" h-full" orientation="vertical" />
                    <Button
                      className=""
                      radius="none"
                      variant="light"
                      onClick={() => {
                        navigate(item.path);
                      }}
                    >
                      {item.name}
                    </Button>
                  </div>
                );
              })}
          </div>
          <Popover placement="bottom" showArrow offset={0}>
            <PopoverTrigger className="mr-6">
              <div className="h-full flex items-center gap-2 cursor-pointer">
                <AvatarInfo userInfo={userInfo}></AvatarInfo>
              </div>
            </PopoverTrigger>
            <PopoverContent>
              <div className="min-w-[200px] w-min flex flex-col  gap-2 justify-center">
                <div className="flex justify-between ">
                  <div className="flex gap-2 ">
                    <AvatarInfo
                      userInfo={userInfo}
                      hasIcon={false}
                      widthFlex={false}
                    ></AvatarInfo>
                  </div>
                  <Button
                    variant="flat"
                    className="min-w-5 font-medium ml-2"
                    onClick={() => {
                      //@ts-expect-error
                      window.refreshToken && clearTimeout(window.refreshToken);
                      setTimeout(() => {
                        setToken("");
                        navigate("/login");
                      }, 300);
                    }}
                  >
                    退出
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2 items-center justify-start ">
                  <RoleTag text="杭州电子科技大学" icon={hduLogo}></RoleTag>
                  <RoleTag userInfo={userInfo}></RoleTag>
                  <RoleTag text="官方认证" icon={legal}></RoleTag>
                </div>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </div>
      <div
        className="absolute flex justify-center top-[76px]"
        style={{
          height: `calc(100vh - 76px)`,
          width: "100vw",
        }}
      >
        <Outlet></Outlet>
      </div>
    </div>
  );
};
export default Home;
