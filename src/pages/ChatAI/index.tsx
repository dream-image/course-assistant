import { getAiVersions, getLessonInfo } from "@/api";
import { useXAgent, useXChat, Sender, Bubble } from "@ant-design/x";
import React, { useEffect, useRef, useState } from "react";
import { message, Space, Typography } from "antd";
import styles from "./style.module.css";
import { Button, Card, CardBody } from "@nextui-org/react";
import { useNavigate, useParams } from "react-router-dom";
import { isNaN, isUndefined } from "lodash-es";
import { LessonType, Modal } from "@/api/type";
import hljs from "highlight.js";
import "highlight.js/styles/tokyo-night-dark.min.css";
import { BubbleListProps } from "@ant-design/x/es/bubble/BubbleList";
import {
  CopyOutlined,
  DownOutlined,
  SyncOutlined,
  UpOutlined,
} from "@ant-design/icons";
import { getToken } from "@/utils";
import markdownit from "markdown-it";
import CustomeButtonRadioGroup from "@/components/Radio";
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
const md = markdownit({
  html: true,
  breaks: true,
});
md.renderer.rules.fence = (tokens, idx) => {
  const content = tokens[idx].content;
  const lang = tokens[idx].info;
  let hlContent = content;
  if (lang && hljs.getLanguage(lang)) {
    try {
      hlContent = hljs.highlight(content, { language: lang }).value;
    } catch (err) {
      console.log("err", err);
    }
  }

  return `
   <div class="${styles["code-block-wrapper"]} bg-[#181d28] text-slate-50 flex flex-col ring-inset ring-1 ring-offset-cyan-100 rounded-lg overflow-hidden">
  <div class=" flex justify-between items-center pl-3 bg-[#50505a]">
  <span>${lang}</span>
    <button class="copy-button flex items-center ${styles["copy-button"]}" data-clipboard-text="${content}">
    <svg
    viewBox="0 0 24 24"
    height="12"
    width="12"
    xmlns="http://www.w3.org/2000/svg"
  >
    <g fill="none">
      <path
        d="m12.594 23.258l-.012.002l-.071.035l-.02.004l-.014-.004l-.071-.036q-.016-.004-.024.006l-.004.01l-.017.428l.005.02l.01.013l.104.074l.015.004l.012-.004l.104-.074l.012-.016l.004-.017l-.017-.427q-.004-.016-.016-.018m.264-.113l-.014.002l-.184.093l-.01.01l-.003.011l.018.43l.005.012l.008.008l.201.092q.019.005.029-.008l.004-.014l-.034-.614q-.005-.019-.02-.022m-.715.002a.02.02 0 0 0-.027.006l-.006.014l-.034.614q.001.018.017.024l.015-.002l.201-.093l.01-.008l.003-.011l.018-.43l-.003-.012l-.01-.01z"
      ></path>
      <path
        d="M9.107 5.448c.598-1.75 3.016-1.803 3.725-.159l.06.16l.807 2.36a4 4 0 0 0 2.276 2.411l.217.081l2.36.806c1.75.598 1.803 3.016.16 3.725l-.16.06l-2.36.807a4 4 0 0 0-2.412 2.276l-.081.216l-.806 2.361c-.598 1.75-3.016 1.803-3.724.16l-.062-.16l-.806-2.36a4 4 0 0 0-2.276-2.412l-.216-.081l-2.36-.806c-1.751-.598-1.804-3.016-.16-3.724l.16-.062l2.36-.806A4 4 0 0 0 8.22 8.025l.081-.216zM11 6.094l-.806 2.36a6 6 0 0 1-3.49 3.649l-.25.091l-2.36.806l2.36.806a6 6 0 0 1 3.649 3.49l.091.25l.806 2.36l.806-2.36a6 6 0 0 1 3.49-3.649l.25-.09l2.36-.807l-2.36-.806a6 6 0 0 1-3.649-3.49l-.09-.25zM19 2a1 1 0 0 1 .898.56l.048.117l.35 1.026l1.027.35a1 1 0 0 1 .118 1.845l-.118.048l-1.026.35l-.35 1.027a1 1 0 0 1-1.845.117l-.048-.117l-.35-1.026l-1.027-.35a1 1 0 0 1-.118-1.845l.118-.048l1.026-.35l.35-1.027A1 1 0 0 1 19 2"
        fill="currentColor"
      ></path>
    </g>
  </svg>
    <span class="${styles["sp"]}">复制</span>
    </button>
  </div>
    <pre class="hljs language-${lang} border-0 flex-1 m-0"><code>${hlContent}</code></pre>
  </div>
  `;
};
const copy = async (e: MouseEvent) => {
  //@ts-ignore
  if (e?.target?.classList.contains("copy-button")) {
    //@ts-ignore
    const text = e.target?.dataset?.clipboardText;

    try {
      await navigator.clipboard.writeText(text);
      message.success("复制成功!"); // 自定义提示
    } catch (err) {
      message.error("复制失败，请手动复制");
    }
  }
};
const ChatAI: React.FC = () => {
  const bubbleWrapperRef = React.useRef<HTMLDivElement>(null);
  const params = useParams();
  const navigate = useNavigate();
  const [lesson, setLesson] = useState<LessonType>();
  const [value, setValue] = useState<string>();
  const controllerRef = useRef<AbortController>();
  const [modalList, setModalList] = useState<Modal[]>([]);
  const [modal, setModal] = useState<Modal>();
  const modalRef = useRef<string>();
  const messageRef = useRef<string>();
  const [modalBarVisible, setModalBarVisible] = useState(true);
  const [agent] = useXAgent({
    request: async (info, callbacks) => {
      const { messages, message: _message } = info;

      const { onSuccess, onUpdate } = callbacks;
      onUpdate(AbnormalState.LOADING);
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
          body: JSON.stringify({
            questions: messages,
            lessonId: Number(params.id),
            modalName: modalRef.current,
          }),
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
            if (!buffer) {
              onUpdate(AbnormalState.OVER_TIME);
              onSuccess(AbnormalState.OVER_TIME);
              setValue(_message);
              messageRef.current = undefined;
              break;
            }
            onSuccess(buffer);
            break;
          }
          // 解码并处理数据块
          buffer += decoder.decode(value, { stream: true });
          messageRef.current = buffer;
          bubbleWrapperRef.current?.scrollTo(
            0,
            bubbleWrapperRef.current?.scrollHeight,
          );
          onUpdate(buffer);
        }
        console.log("流接收完成");
      } catch (error: any) {
        setValue(_message);
        let msg = error?.message || error?.error_msg || error;
        if (error?.name === "AbortError") {
          msg = `${
            messageRef.current
              ? "> " + messageRef.current + "\n\n" + AbnormalState.STOP
              : AbnormalState.STOP
          }`;
        } else {
          msg = `${
            messageRef.current ? "> " + messageRef.current + "\n\n" + msg : msg
          }`;
        }
        messageRef.current = undefined;
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

  const items: BubbleListProps["items"] = messages.map(
    ({ message: _message, id }, index) => {
      return {
        key: id,
        content:
          index % 2 === 1 ? (
            <Typography.Text>
              <div
                dangerouslySetInnerHTML={{
                  __html: md.render(`
> 嗯，我现在需要写一个最简单的冒泡排序算法，用JavaScript。那应该是怎样的呢？让我先回忆一下冒泡排序的原理。
> 
> 冒泡排序的基本思想是重复地遍历要排序的列表，每次比较相邻的两个元素，如果顺序不对就交换它们。这样，每一轮遍历都会把当前最大的元素放到最后。重复这个过程，直到整个列表都排序完成。
> 
> 首先，我需要创建一个函数，可能叫bubbleSort，接收一个数组作为参数。然后，我需要两个循环，外层循环控制遍历的次数，内层循环用于比较相邻元素。
> 
> 比如，数组长度是n的话，外层循环应该从0到n-1，或者是不是可以优化一下？因为每一轮都会把最大的元素放到最后，所以其实后面的元素已经排好了序，内层循环不需要每次都比较到末尾。比如，外层循环i从0到n-1，然后内层循环j从0到n-1-i，这样每次减少一次比较。这样可以减少不必要的比较次数，提高效率。不过对于最简单的实现，可能不需要这个优化，但加上可能更好。
> 
> 但是用户要求的是最简单的冒泡排序，可能不需要优化，而是标准的实现。不过标准的话是不是还是会有优化后的版本？
> 
> 让我先写出总体结构。外层循环遍历数组的每个元素，内层循环进行相邻比较。每次比较如果前面的元素比后面的大，就交换。这样，最大的元素会像气泡一样浮到后面。
> 
> 那么具体的步骤：
> 
> 函数名是bubbleSort，传入arr。
> 
> 外层循环用for，i从0到arr.length-1。或者是否可以用while循环？不过for可能更直观。
> 
> 内层循环的j从0到arr.length - 1 - i，因为每次外层循环i之后，后面的i个元素已经排好序了。或者不减去i的话，每次都会比较所有元素，可能更简单，但效率稍低，但代码可能更少。
> 
> 例如，不管有没有优化，两种方式都可能。但更简单的话，可能不减去i。或者用户想看到的是否是有优化的版本？
> 
> 比如，如果冒泡排序的最简单实现可能并不包含优化步骤，那外层循环的次数会影响吗？
> 
> 比如，假设不管怎样，都会遍历足够的次数，而内层循环每次比较j和j+1。这样即使数组已经有序，仍然会进行所有循环。这样虽然效率低，但代码少，比较直观。
> 
> 比如，一个简单的版本可能如下：
> 
> function bubbleSort(arr) {
  for (let i = 0; i < arr.length; i++) {
    for (let j = 0; j < arr.length - 1; j++) {
      if (arr[j] > arr[j+1]) {
        let temp = arr[j];
        arr[j] = arr[j+1];
        arr[j+1] = temp;
      }
    }
  }
  return arr;
}
>

以下是一个使用 JavaScript 实现的最简单的冒泡排序算法：

\`\`\`javascript
function bubbleSort(arr) {
  for (let i = 0; i < arr.length; i++) {
    for (let j = 0; j < arr.length - 1; j++) {
      if (arr[j] > arr[j + 1]) {
        // 交换相邻元素
        let temp = arr[j];
        arr[j] = arr[j + 1];
        arr[j + 1] = temp;
      }
    }
  }
  return arr;
}
\`\`\`

### 使用示例：
\`\`\`javascript
const unsortedArray = [5, 3, 8, 4, 6];
console.log(bubbleSort(unsortedArray)); // 输出: [3, 4, 5, 6, 8]
\`\`\`

                `),
                }}
              />
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
                  onClick={() => {
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
        data: { modal },
      } = await getAiVersions();
      setModalList(modal);
    } catch (error: any) {
      message.error(error?.error_msg || error?.message || "获取课程信息失败");
      navigate(-1);
    }
  };
  useEffect(() => {
    modalRef.current = modal?.name;
  }, [modal]);
  useEffect(() => {
    init();
    document.addEventListener("click", copy);
    return () => {
      document.removeEventListener("click", copy);
    };
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
                !modalBarVisible
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
              {modalBarVisible ? (
                <>
                  <div className=" max-w-[650px] overflow-auto">
                    <CustomeButtonRadioGroup
                      defaultValue={modalList[0]?.name}
                      value={modal?.name}
                      className="flex gap-3 flex-none max-w-max"
                      onSelect={(v) => {
                        setModal(modalList.find((i) => i.name === v));
                      }}
                      list={modalList.map((i) => {
                        return {
                          label: i.name,
                          value: i.name,
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
                  variant={modalBarVisible ? "light" : "bordered"}
                  style={
                    modalBarVisible
                      ? {
                          marginLeft: 4,
                        }
                      : {}
                  }
                  onClick={() => {
                    setModalBarVisible(!modalBarVisible);
                  }}
                >
                  {modalBarVisible ? (
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
