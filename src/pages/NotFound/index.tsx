import Logo from "@/assets/404.svg";
import { setToken } from "@/utils";
import { Button, Image } from "@heroui/react";
import { useNavigate } from "react-router-dom";
export default function NotFound() {
  const navigate = useNavigate();
  return (
    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
      <Image src={Logo} alt="404" />
      <Button
        onClick={() => {
          navigate("/chatai");
        }}
        variant="flat"
      >
        页面跑丢了,回到主页
      </Button>
      <Button
        onClick={() => {
          setToken("");
        }}
      >
        注销
      </Button>
    </div>
  );
}
