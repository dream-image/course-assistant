import { getLessonInfo } from "@/api";
import { useXAgent, useXChat, Sender, Bubble } from "@ant-design/x";
import React, { useEffect, useRef, useState } from "react";
import { message, Space } from "antd";
import styles from "./style.module.css";
import { Button, Card, CardBody } from "@nextui-org/react";
import { useNavigate, useParams } from "react-router-dom";
import { isNaN, isUndefined } from "lodash-es";
import { LessonType } from "@/api/type";
import { BubbleListProps } from "@ant-design/x/es/bubble/BubbleList";
import { CopyOutlined, SyncOutlined, UserOutlined } from "@ant-design/icons";
import { getToken } from "@/utils";
const LOADING = "loading";

const ChatAI: React.FC = () => {
  const bubbleWrapperRef = React.useRef<HTMLDivElement>(null);
  const params = useParams();
  const navigate = useNavigate();
  const [lesson, setLesson] = useState<LessonType>();
  const [value, setValue] = useState<string>();
  const controllerRef = useRef<AbortController>();
  const [agent] = useXAgent({
    request: async (info, callbacks) => {
      const { messages, message: _message } = info;

      const { onSuccess, onUpdate } = callbacks;
      onUpdate(LOADING);
      // current message
      console.log("message", _message);

      // history messages
      console.log("messages", messages);

      // scroll to bottom
      bubbleWrapperRef.current?.scrollTo(
        0,
        bubbleWrapperRef.current?.scrollHeight,
      );
      const controller = new AbortController();
      controllerRef.current = controller;
      try {
        const response = await fetch("http://localhost:8888/chat", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: getToken() || "",
          },
          signal: controller.signal,
          body: JSON.stringify({ question: "" }),
        });

        //@ts-ignore
        const reader = response?.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";
        onUpdate("");
        // 循环读取流
        while (true) {
          const { done, value } = await reader.read();
          if (done) {
            onSuccess(buffer);
            break;
          }

          // 解码并处理数据块
          buffer += decoder.decode(value, { stream: true });
          onUpdate(buffer);
        }
        console.log("流接收完成");
      } catch (error: any) {
        setValue(_message);

        let msg = error?.message || error?.error_msg || error;
        if (error?.name === "AbortError") {
          msg = "回答已中止";
        }
        console.error(error);
        onSuccess(msg);
      }
    },
  });

  const {
    // use to send message
    onRequest,
    // use to render messages
    messages,
  } = useXChat({ agent });

  const items = messages.map(({ message, id }, index) => {
    return {
      // key is required, used to identify the message
      key: id,
      content: message,
      loading: message === LOADING ? true : false,
      placement: (index % 2 === 1
        ? "start"
        : "end") as Required<BubbleListProps>["items"][number]["placement"],
      avatar: index % 2 === 1 ? { icon: <UserOutlined /> } : undefined,
      footer:
        index % 2 === 1 ? (
          <>
            <Space>
              <Button size="sm" variant="light" color="default" isIconOnly>
                <SyncOutlined />
              </Button>
              <Button
                size="sm"
                variant="light"
                color="default"
                isIconOnly
                onClick={() => {
                  navigator.clipboard.writeText(message);
                }}
              >
                <CopyOutlined />
              </Button>
            </Space>
          </>
        ) : undefined,
    };
  });
  const init = async () => {
    try {
      if (isUndefined(params.id) || isNaN(Number(params.id))) {
        navigate(-1);
        return;
      }
      const res = await getLessonInfo(Number(params.id));
      if (res.data.total) {
        setLesson(res.data.list[0]);
      } else {
        message.error("该课程不存在");
        navigate(-1);
      }
    } catch (error: any) {
      message.error(error?.error_msg || error?.message || "获取课程信息失败");
      navigate(-1);
    }
  };

  useEffect(() => {
    init();
  }, []);
  return (
    <div
      className={`group absolute w-10/12 bg-white h-full px-6 flex flex-col border rounded-lg max-w-[750px]`}
    >
      <div className="left-0 right-0 mx-auto w-full ">
        <Card className=" shadow-none transition-shadow  group-hover:shadow-md">
          <CardBody className="  flex flex-row items-end align-bottom justify-center mix-blend-normal">
            <span className="w-max h-min">{lesson?.name}</span>
            <span className="w-max text-xs h-min text-gray-600 ml-2 -translate-y-[2px]">
              {lesson?.teacherName}
            </span>
          </CardBody>
        </Card>
      </div>
      <div
        className={`flex-1 overflow-auto py-4 ${styles.scroll}`}
        ref={bubbleWrapperRef}
      >
        <Bubble.List items={items} autoScroll />
      </div>
      <div className="w-full mt-2 mx-auto left-0 right-0 bottom-5">
        <Sender
          value={value}
          onChange={(str) => setValue(str)}
          onSubmit={(message) => {
            setValue("");
            onRequest(message);
          }}
          loading={agent.isRequesting()}
          onCancel={() => {
            controllerRef.current?.abort("回答已中止");
          }}
        />
        <div className="h-5"></div>
      </div>
    </div>
  );
};

export default ChatAI;
