import { getAiVersions, getLessonFileList, getLessonInfo } from "@/api";
import { useXAgent, useXChat, Sender, Bubble } from "@ant-design/x";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { Carousel, message, Space, Typography } from "antd";
import styles from "./style.module.css";
import { Button, Card, CardBody, Alert, CardHeader, cn } from "@heroui/react";
import { useNavigate, useParams } from "react-router-dom";
import { isNaN, isUndefined } from "lodash-es";
import { LessonFile, LessonType, Modal } from "@/api/type";
import { BubbleListProps } from "@ant-design/x/es/bubble/BubbleList";
import {
  CopyOutlined,
  DownOutlined,
  SyncOutlined,
  UpOutlined,
} from "@ant-design/icons";

import { getToken } from "@/utils";
import CustomeButtonRadioGroup from "@/components/Radio";
import NewChat from "@/components/newChat";
import MarkdownRenderer from "@/components/CodeBlock";
import { REQUEST_BASE_URL } from "@/common/request";
import LessonFileCard from "@/components/LessonFileCard";
const enum AbnormalState {
  LOADING = "loading",
  ERROR = "error",
  OVER_TIME = "回答超时,请重试",
  STOP = "回答已中止",
}
const abnormalState: { type: AbnormalState; style?: React.CSSProperties }[] = [
  {
    type: AbnormalState.LOADING,
    style: {
      background: "transparent",
      padding: "0",
      height: 22,
    },
  },
  {
    type: AbnormalState.ERROR,
    style: {
      background: "transparent",
      padding: "0",
      height: 22,
      transform: "translateY(5px)",
    },
  },
  {
    type: AbnormalState.OVER_TIME,
    style: {
      background: "transparent",
      padding: "0",
      height: 22,
      transform: "translateY(5px)",
    },
  },
];

const ChatAI: React.FC = () => {
  const bubbleWrapperRef = React.useRef<HTMLDivElement>(null);
  const params = useParams();
  const navigate = useNavigate();
  const [lesson, setLesson] = useState<LessonType>();
  const [value, setValue] = useState<string>();
  const controllerRef = useRef<AbortController>();
  const [modelList, setModalList] = useState<Modal[]>([]);
  const [model, setModal] = useState<Modal>();
  const modelRef = useRef<string>();
  const messageRef = useRef<string>("");
  const [modelBarVisible, setModalBarVisible] = useState(true);
  const [lessonFiles, setLessonFiles] = useState<LessonFile[]>([]);
  const defaultModalName = useMemo(() => {
    const currentDefalut = localStorage.getItem("defaultModalName");
    if (modelList.find((i) => i.name === currentDefalut)) {
      return currentDefalut;
    }
    return modelList[0]?.name;
  }, [modelList]);
  const [agent] = useXAgent({
    request: async (info, callbacks) => {
      const { messages, message: _message } = info;

      const { onSuccess, onUpdate } = callbacks;
      onUpdate(AbnormalState.LOADING);
      // current message

      // history messages

      // scroll to bottom
      bubbleWrapperRef.current?.scrollTo(
        0,
        bubbleWrapperRef.current?.scrollHeight,
      );
      const controller = new AbortController();
      controllerRef.current = controller;

      try {
        const response = await fetch(`${REQUEST_BASE_URL}/chat`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: getToken() || "",
          },
          signal: controller.signal,
          body: JSON.stringify({
            questions: messages,
            lessonId: Number(params.id),
            lessonName:lesson?.name,
            modelName: modelRef.current,
          }),
        });
        if (!response.ok) {
          let text = "";
          try {
            text = await response.json();
          } catch (error) {
            text = response.statusText;
          }
          await Promise.reject(text);
        }
        console.log("response开始生产信息");

        //@ts-ignore
        const reader = response?.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";
        onUpdate("");
        // 循环读取流
        while (true) {
          const { done, value } = await reader.read();

          if (done) {
            if (!buffer) {
              onUpdate(AbnormalState.OVER_TIME);
              onSuccess(AbnormalState.OVER_TIME);
              setValue(_message);
              bubbleWrapperRef.current?.scrollTo(
                0,
                bubbleWrapperRef.current?.scrollHeight,
              );
              messageRef.current = "";
              break;
            }
            onSuccess(buffer);
            break;
          }

          // 解码并处理数据块
          buffer += decoder.decode(value, { stream: true });
          messageRef.current = buffer;
          onUpdate(buffer);
        }
        messageRef.current = "";
      } catch (error: any) {
        setValue(_message);
        let msg = error?.message || error?.error_msg || error;
        console.log("msg", msg, error);

        if (error?.name === "AbortError") {
          msg =
            messageRef.current +
            `<error-3ee1a747-f116-11ef-ae3b-00163e0e374c>${AbnormalState.STOP}</error-3ee1a747-f116-11ef-ae3b-00163e0e374c>`;
        } else {
          msg =
            messageRef.current +
            `<error-3ee1a747-f116-11ef-ae3b-00163e0e374c>${msg}</error-3ee1a747-f116-11ef-ae3b-00163e0e374c>`;
        }
        messageRef.current = "";
        console.error(error);
        bubbleWrapperRef.current?.scrollTo(
          0,
          bubbleWrapperRef.current?.scrollHeight,
        );
        onSuccess(msg);
      }
    },
  });

  const {
    // use to send message
    onRequest,
    // use to render messages
    messages,
    setMessages,
  } = useXChat({ agent });

  const items: BubbleListProps["items"] = messages.map(
    ({ message: _message, id }, index) => {
      let thinkContent: any = _message.match(
        /<think-3ee1a747-f116-11ef-ae3b-00163e0e374c>[\s\S]*?(?=<\/think-3ee1a747-f116-11ef-ae3b-00163e0e374c>|<error-3ee1a747-f116-11ef-ae3b-00163e0e374c>|$)/,
      )?.[0];

      if (thinkContent) {
        _message = _message.replace(thinkContent, "");
        _message = _message.replace(
          /<\/think-3ee1a747-f116-11ef-ae3b-00163e0e374c>/,
          "",
        );
        thinkContent = thinkContent.replace(
          /<think-3ee1a747-f116-11ef-ae3b-00163e0e374c>/,
          "",
        );

        thinkContent = thinkContent.replace(
          /<\/think-3ee1a747-f116-11ef-ae3b-00163e0e374c>/,
          "",
        );
      }
      let errorContent: any = _message.match(
        /<error-3ee1a747-f116-11ef-ae3b-00163e0e374c>[\s\S]*?(?:<\/error-3ee1a747-f116-11ef-ae3b-00163e0e374c>|$)/,
      )?.[0];
      if (errorContent) {
        _message = _message.replace(errorContent, "");
        errorContent = errorContent.replace(
          /<error-3ee1a747-f116-11ef-ae3b-00163e0e374c>/,
          "",
        );
        errorContent = errorContent.replace(
          /<\/error-3ee1a747-f116-11ef-ae3b-00163e0e374c>/,
          "",
        );
        if (AbnormalState.STOP === errorContent) {
          errorContent = <Alert color="primary" title={errorContent}></Alert>;
        } else {
          errorContent = <Alert color="danger" title={errorContent}></Alert>;
        }
      }

      return {
        key: id,
        content:
          index % 2 === 1 ? (
            <Typography.Text>
              <MarkdownRenderer
                data={[
                  {
                    content: thinkContent,
                    isThink: true,
                  },
                  {
                    content: _message,
                    className: "",
                  },
                  {
                    content: errorContent,
                    className: styles["error-block"],
                  },
                ]}
              ></MarkdownRenderer>
            </Typography.Text>
          ) : (
            <Typography className=" whitespace-pre-wrap break-all">
              {_message}
            </Typography>
          ),
        loading: _message === AbnormalState.LOADING ? true : false,
        styles: {
          content: abnormalState.find((item) => item.type === _message)?.style,
        },
        placement: (index % 2 === 1
          ? "start"
          : "end") as Required<BubbleListProps>["items"][number]["placement"],
        avatar:
          index % 2 === 1
            ? {
                icon: (
                  <svg
                    viewBox="0 0 30 30"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    xmlnsXlink="http://www.w3.org/1999/xlink"
                  >
                    <path
                      id="path"
                      d="M27.501 8.46875C27.249 8.3457 27.1406 8.58008 26.9932 8.69922C26.9434 8.73828 26.9004 8.78906 26.8584 8.83398C26.4902 9.22852 26.0605 9.48633 25.5 9.45508C24.6787 9.41016 23.9785 9.66797 23.3594 10.2969C23.2275 9.52148 22.79 9.05859 22.125 8.76172C21.7764 8.60742 21.4238 8.45312 21.1807 8.11719C21.0098 7.87891 20.9639 7.61328 20.8779 7.35156C20.8242 7.19336 20.7695 7.03125 20.5879 7.00391C20.3906 6.97266 20.3135 7.13867 20.2363 7.27734C19.9258 7.84375 19.8066 8.46875 19.8174 9.10156C19.8447 10.5234 20.4453 11.6562 21.6367 12.4629C21.7725 12.5547 21.8076 12.6484 21.7646 12.7832C21.6836 13.0605 21.5869 13.3301 21.501 13.6074C21.4473 13.7852 21.3662 13.8242 21.1768 13.7461C20.5225 13.4727 19.957 13.0684 19.458 12.5781C18.6104 11.7578 17.8438 10.8516 16.8877 10.1426C16.6631 9.97656 16.4395 9.82227 16.207 9.67578C15.2314 8.72656 16.335 7.94727 16.5898 7.85547C16.8574 7.75977 16.6826 7.42773 15.8193 7.43164C14.957 7.43555 14.167 7.72461 13.1611 8.10938C13.0137 8.16797 12.8594 8.21094 12.7002 8.24414C11.7871 8.07227 10.8389 8.0332 9.84766 8.14453C7.98242 8.35352 6.49219 9.23633 5.39648 10.7441C4.08105 12.5547 3.77148 14.6133 4.15039 16.7617C4.54883 19.0234 5.70215 20.8984 7.47559 22.3633C9.31348 23.8809 11.4307 24.625 13.8457 24.4824C15.3125 24.3984 16.9463 24.2012 18.7881 22.6406C19.2529 22.8711 19.7402 22.9629 20.5498 23.0332C21.1729 23.0918 21.7725 23.002 22.2373 22.9062C22.9648 22.752 22.9141 22.0781 22.6514 21.9531C20.5186 20.959 20.9863 21.3633 20.5605 21.0371C21.6445 19.752 23.2783 18.418 23.917 14.0977C23.9668 13.7539 23.9238 13.5391 23.917 13.2598C23.9131 13.0918 23.9512 13.0254 24.1445 13.0059C24.6787 12.9453 25.1973 12.7988 25.6738 12.5352C27.0557 11.7793 27.6123 10.5391 27.7441 9.05078C27.7637 8.82422 27.7402 8.58789 27.501 8.46875ZM15.46 21.8613C13.3926 20.2344 12.3906 19.6992 11.9766 19.7227C11.5898 19.7441 11.6592 20.1875 11.7441 20.4766C11.833 20.7617 11.9492 20.959 12.1123 21.209C12.2246 21.375 12.3018 21.623 12 21.8066C11.334 22.2207 10.1768 21.668 10.1221 21.6406C8.77539 20.8477 7.64941 19.7988 6.85547 18.3652C6.08984 16.9844 5.64453 15.5039 5.57129 13.9238C5.55176 13.541 5.66406 13.4062 6.04297 13.3379C6.54199 13.2461 7.05762 13.2266 7.55664 13.2988C9.66602 13.6074 11.4619 14.5527 12.9668 16.0469C13.8262 16.9004 14.4766 17.918 15.1465 18.9121C15.8584 19.9688 16.625 20.9746 17.6006 21.7988C17.9443 22.0879 18.2197 22.3086 18.4824 22.4707C17.6895 22.5586 16.3652 22.5781 15.46 21.8613ZM16.4502 15.4805C16.4502 15.3105 16.5859 15.1758 16.7568 15.1758C16.7949 15.1758 16.8301 15.1836 16.8613 15.1953C16.9033 15.2109 16.9424 15.2344 16.9727 15.2695C17.0273 15.3223 17.0586 15.4004 17.0586 15.4805C17.0586 15.6504 16.9229 15.7852 16.7529 15.7852C16.582 15.7852 16.4502 15.6504 16.4502 15.4805ZM19.5273 17.0625C19.3301 17.1426 19.1328 17.2129 18.9434 17.2207C18.6494 17.2344 18.3281 17.1152 18.1533 16.9688C17.8828 16.7422 17.6895 16.6152 17.6074 16.2168C17.5732 16.0469 17.5928 15.7852 17.623 15.6348C17.6934 15.3105 17.6152 15.1035 17.3877 14.9141C17.2012 14.7598 16.9658 14.7188 16.7061 14.7188C16.6094 14.7188 16.5205 14.6758 16.4541 14.6406C16.3457 14.5859 16.2568 14.4512 16.3418 14.2852C16.3691 14.2324 16.501 14.1016 16.5322 14.0781C16.8838 13.877 17.29 13.9434 17.666 14.0938C18.0146 14.2363 18.2773 14.498 18.6562 14.8672C19.0439 15.3145 19.1133 15.4395 19.334 15.7734C19.5078 16.0371 19.667 16.3066 19.7754 16.6152C19.8408 16.8066 19.7559 16.9648 19.5273 17.0625Z"
                      fillRule="nonzero"
                      fill="#4D6BFE"
                    ></path>
                  </svg>
                ),
                style: {
                  backgroundColor: "white",
                  boxShadow: "0 0 0 1px #d5e4ff",
                } as React.CSSProperties,
              }
            : undefined,
        footer:
          index % 2 === 1 && _message !== AbnormalState.LOADING ? (
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
                  onPress={() => {
                    navigator.clipboard.writeText(_message);
                    message.success("复制成功");
                  }}
                >
                  <CopyOutlined />
                </Button>
              </Space>
            </>
          ) : undefined,
      };
    },
  );
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
      const {
        data: { model },
      } = await getAiVersions();
      setModalList(model);
      const res2 = await getLessonFileList({ lessonId: Number(params.id) });
      setLessonFiles(res2.data);
    } catch (error: any) {
      message.error(error?.error_msg || error?.message || "获取课程信息失败");
      navigate(-1);
    }
  };

  const CreateNewChat = async () => {
    setMessages([]);
  };

  useEffect(() => {
    modelRef.current = model?.name;
  }, [model]);
  useEffect(() => {
    init();
    // document.addEventListener("click", copy);
    // return () => {
    //   document.removeEventListener("click", copy);
    // };
  }, []);
  return (
    <div
      className={`group absolute w-10/12 bg-white h-full px-6 flex flex-col border rounded-lg max-w-[750px]`}
    >
      <div className="left-0 right-0 mx-auto w-full ">
        <Card className=" shadow-none transition-shadow  group-hover:shadow-md">
          <CardBody className="  flex flex-row items-end align-bottom justify-center mix-blend-normal relative">
            <span className="w-max h-min">{lesson?.name}</span>
            <span className="w-max text-xs h-min text-gray-600 ml-2 -translate-y-[2px]">
              {lesson?.teacherName}
            </span>
          </CardBody>
        </Card>
      </div>
      {lessonFiles.length ? (
        <Card className="absolute top-0 w-min h-min -right-48 ">
          <CardHeader className=" opacity-70 font-medium">课程资料</CardHeader>
          <CardBody className="flex flex-col gap-3">
            {new Array(Math.ceil(lessonFiles.length / 5))
              .fill(1)
              .map((i, index) => {
                const list = lessonFiles.slice(index * 5, (index + 1) * 5); // 切片
                return (
                  <Carousel
                    key={index}
                    className={cn(
                      "w-40 h-28 rounded-2xl overflow-hidden",
                      styles.carouselArrows,
                    )}
                    autoplay={{ dotDuration: true }}
                    autoplaySpeed={5000}
                    arrows
                  >
                    {list.map((i, index) => {
                      return (
                        <LessonFileCard
                          {...i}
                          key={index}
                          isPreview={true}
                          lesson={lesson}
                          fileName={i.name}
                        ></LessonFileCard>
                      );
                    })}
                  </Carousel>
                );
              })}
          </CardBody>
        </Card>
      ) : null}
      <div
        className={`flex-1 overflow-auto py-4 ${styles.scroll}`}
        ref={bubbleWrapperRef}
      >
        <Bubble.List items={items} autoScroll />
        {messages.length !== 0 ? (
          <NewChat className=" scale-[60%] mx-auto" onClick={CreateNewChat}>
            开启新对话
          </NewChat>
        ) : null}
      </div>
      <div className="w-full mt-2 mx-auto left-0 right-0 bottom-5 z-[2]">
        <Sender
          value={value}
          onChange={(str) => setValue(str)}
          onSubmit={(message) => {
            setValue("");
            onRequest(message);
          }}
          loading={agent.isRequesting()}
          onCancel={() => {
            controllerRef.current?.abort(
              messageRef.current || AbnormalState.STOP,
            );
          }}
          header={
            <Sender.Header
              closable={false}
              style={
                !modelBarVisible
                  ? {
                      width: 20,
                      height: 20,
                      position: "absolute",
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      right: 15,
                      top: -35,
                      zIndex: 1,
                      borderBottom: 0,
                    }
                  : {}
              }
              styles={{
                content: {
                  padding: " 5px 5px",
                  position: "relative",
                  display: "flex",
                },
              }}
            >
              {modelBarVisible ? (
                <>
                  <div className=" max-w-[650px] overflow-auto no-scrollbar">
                    <CustomeButtonRadioGroup
                      defaultValue={defaultModalName}
                      value={model?.name}
                      className="flex gap-3 flex-none max-w-max w-max"
                      onSelect={(v) => {
                        localStorage.setItem("defaultModalName", v || "");
                        setModal(modelList.find((i) => i.name === v));
                      }}
                      list={modelList.map((i) => {
                        return {
                          label: i.name,
                          value: i.name,
                          description: i.description,
                        };
                      })}
                    ></CustomeButtonRadioGroup>
                  </div>
                </>
              ) : null}
              <div className="flex items-center justify-center w-auto">
                <Button
                  isIconOnly
                  size="sm"
                  variant={modelBarVisible ? "light" : "bordered"}
                  style={
                    modelBarVisible
                      ? {
                          marginLeft: 4,
                        }
                      : {}
                  }
                  onPress={() => {
                    setModalBarVisible(!modelBarVisible);
                  }}
                >
                  {modelBarVisible ? (
                    <DownOutlined
                      width={20}
                      height={20}
                      className=" text-gray-500"
                    />
                  ) : (
                    <UpOutlined
                      width={20}
                      height={20}
                      className=" text-gray-500"
                    />
                  )}
                </Button>
              </div>
            </Sender.Header>
          }
        />
        <div className="h-5"></div>
      </div>
    </div>
  );
};

export default ChatAI;
