import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { NextUIProvider, Spinner } from "@nextui-org/react";
import "animate.css";
import { ConfigProvider } from "antd";
import zhCN from "antd/locale/zh_CN";
createRoot(document.getElementById("root")!).render(
  <NextUIProvider>
    <ConfigProvider locale={zhCN}>
      <App />
    </ConfigProvider>
  </NextUIProvider>,
);
