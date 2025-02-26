import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { HeroUIProvider, Spinner } from "@heroui/react";
import "animate.css";
import { ConfigProvider } from "antd";
import zhCN from "antd/locale/zh_CN";
import "./index.less";
createRoot(document.getElementById("root")!).render(
  <HeroUIProvider>
    <ConfigProvider
      locale={zhCN}
      prefixCls="course-assistant"
      iconPrefixCls="course-assistant-icon"
    >
      <App />
    </ConfigProvider>
  </HeroUIProvider>,
);
