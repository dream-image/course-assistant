import { chat } from "@/api";
import { useXAgent, useXChat, Sender, Bubble } from "@ant-design/x";
import React, { useEffect } from "react";
import { message } from "antd";
import styles from "./style.module.css";
const Demo: React.FC = () => {
  const bubbleWrapperRef = React.useRef<HTMLDivElement>(null);
  const [agent] = useXAgent({
    request: async (info, callbacks) => {
      const { messages, _message } = info;

      const { onSuccess, onUpdate, onError } = callbacks;

      // current message
      console.log("message", _message);

      // history messages
      console.log("messages", _message);

      let content: string = "";
      bubbleWrapperRef.current?.scrollTo(
        0,
        bubbleWrapperRef.current?.scrollHeight,
      );

      try {
        const stream = await chat({
          history: [],
          message: "",
        });
        console.log("steam", stream);

        //@ts-ignore
        for await (const chunk of stream) {
          content += chunk.choices[0]?.delta?.content || "";

          onUpdate(content);
        }

        onSuccess(content);
      } catch (error: any) {
        console.log("error", error.error_msg);
        message.error(error.error_msg);
        // handle error
        // onError();
      }
    },
  });

  const {
    // use to send message
    onRequest,
    // use to render messages
    messages,
  } = useXChat({ agent });

  const items = messages.map(({ message, id }) => ({
    // key is required, used to identify the message
    key: id,
    content: message,
  }));
  const getLessonInfo = () => {};
  const init = async () => {};

  useEffect(() => {
    init();
  }, []);
  return (
    <div
      className={`absolute w-10/12 bg-white h-full px-6 flex flex-col border rounded-lg `}
    >
      <div
        className={`flex-1 overflow-auto py-4 ${styles.scroll}`}
        ref={bubbleWrapperRef}
      >
        <Bubble.List items={items} />
      </div>
      <div className="w-full mt-4 mx-auto left-0 right-0 bottom-5">
        <Sender onSubmit={onRequest} />
        <div className="h-5"></div>
      </div>
    </div>
  );
};

export default Demo;
