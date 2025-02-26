import { REQUEST_BASE_URL } from "@/common/request";
import {
  Button,
  Card,
  CardFooter,
  cn,
  Image,
  Modal,
  ModalBody,
  ModalContent,
  ModalHeader,
  useDisclosure,
} from "@heroui/react";
import { message, Typography, Modal as AntdModal } from "antd";
import styles from "./styles.module.css";
import PdfPreview from "../PDFView";
import { LessonType } from "@/api/type";
import {
  DeleteOutlined,
  DownloadOutlined,
  EyeOutlined,
} from "@ant-design/icons";
import { createPortal } from "react-dom";
import { useEffect, useRef, useState } from "react";
import { deleteLessonFile } from "@/api";
type Props = {
  coverUrl?: string;
  fileName: string;
  lesson?: LessonType;
  refresh: () => void;
};

const LessonFileCard = (props: Props) => {
  const { coverUrl, fileName, lesson, refresh } = props;
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [forceUpdate, setForceUpdate] = useState(0);
  const fileExt = fileName.split(".").pop()?.toLowerCase() || "";
  const handleForceUpdate = () => {
    setForceUpdate((prev) => prev + 1); // 修改状态以触发渲染
  };
  const downloadFile = () => {
    window.open(
      `${REQUEST_BASE_URL}/upload/lesson/${lesson!.ownerId}/${
        lesson!.lessonId
      }/${fileName}`,
      "_blank",
    );
  };

  useEffect(() => {
    handleForceUpdate();
  }, []);
  return (
    <>
      <div
        className=" group w-40 h-28 shadow-2xl rounded-lg transition-all duration-300 ease-in-out flex-grow max-w-[200px] relative animate-opacity"
        ref={wrapperRef}
      >
        <div className="absolute w-full h-full opacity-70 hidden group-hover:block bg-black  rounded-xl z-[40]">
          {wrapperRef.current
            ? createPortal(
                <div className=" z-50 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 group-hover:flex hidden gap-1">
                  <Button
                    title="文件预览"
                    isIconOnly
                    variant="light"
                    className=" text-white "
                    onPress={() => {
                      onOpen();
                    }}
                  >
                    <EyeOutlined />
                  </Button>
                  <Button
                    title="下载文件"
                    isIconOnly
                    variant="light"
                    className=" text-white "
                    onPress={() => {
                      downloadFile();
                    }}
                  >
                    <DownloadOutlined />
                  </Button>
                  {/* <Button
                    isIconOnly
                    variant="light"
                    className=" text-white "
                    title="更换封面"
                  >
                    <svg
                      viewBox="0 0 1024 1024"
                      version="1.1"
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                    >
                      <path
                        d="M123.904 413.779c16.28 0 29.52 13.009 29.896 29.199l0.008 0.706v129.265c0 124.62 94.217 225.265 210.364 227.266l3.527 0.03 354.283-0.001v-72.543c0-10.163 8.239-18.4 18.4-18.4a18.4 18.4 0 0 1 9.783 2.815l163.218 102.45c8.607 5.402 11.204 16.759 5.802 25.366a18.4 18.4 0 0 1-5.802 5.802l-163.218 102.45c-8.607 5.402-19.964 2.804-25.367-5.803a18.4 18.4 0 0 1-2.815-9.782l-0.001-72.544H367.699c-150.013 0-271.253-126.324-273.662-282.369L94 572.95V443.684c0-16.516 13.388-29.905 29.904-29.905z m185.81-280.158a18.4 18.4 0 0 1 2.815 9.782l-0.001 72.541H646.11c150.013 0 271.252 126.325 273.662 282.37l0.037 4.737v129.265c0 16.516-13.389 29.905-29.904 29.905-16.28 0-29.521-13.009-29.896-29.199l-0.008-0.706V503.051c0-124.62-94.218-225.265-210.365-227.266l-3.526-0.03H312.528V348.3c0 10.162-8.237 18.4-18.4 18.4a18.4 18.4 0 0 1-9.781-2.816l-163.218-102.45c-8.607-5.402-11.205-16.759-5.803-25.366a18.4 18.4 0 0 1 5.803-5.802l163.218-102.448c8.607-5.402 19.964-2.804 25.366 5.803z"
                        fill="currentColor"
                      ></path>
                    </svg>
                  </Button> */}
                  <Button
                    title="删除文件"
                    isIconOnly
                    variant="light"
                    color="danger"
                    className=" "
                    onPress={async () => {
                      const res = await new Promise((resolve, reject) => {
                        AntdModal.confirm({
                          title: "确认删除",
                          content: "确认删除该文件吗？",
                          onOk: () => {
                            resolve(true);
                          },
                          onCancel: () => {
                            resolve(false);
                          },
                        });
                      });
                      try {
                        if (res) {
                          await deleteLessonFile({
                            lessonId: lesson!.lessonId,
                            fileName,
                          });
                          message.success("删除成功");
                          refresh();
                        }
                      } catch (error: any) {
                        message.error(
                          error?.error_msg || error?.message || error,
                        );
                      }
                    }}
                  >
                    <DeleteOutlined />
                  </Button>
                </div>,
                wrapperRef.current,
              )
            : null}
        </div>
        <Card isFooterBlurred className="border-none" radius="lg">
          <Image
            className=""
            classNames={{
              wrapper: cn(
                "w-full flex justify-center items-center",
                styles.maxWidth,
              ),
            }}
            loading="lazy"
            height={112}
            src={`${REQUEST_BASE_URL}${coverUrl}`}
            fallbackSrc={"/src/assets/defaultBgOfLesson.jpg"}
          />
          <CardFooter className="justify-start before:bg-white/10 border-white/20 border-1 overflow-hidden py-1 absolute before:rounded-xl rounded-large bottom-1 w-[calc(100%_-_8px)] shadow-small ml-1 z-10">
            <Typography.Paragraph
              ellipsis={{
                tooltip: true,
                rows: 2,
              }}
              className={cn(
                "text-tiny text-white/80  invert mix-blend-difference",
                styles["mb-0"],
              )}
            >
              {fileName}
            </Typography.Paragraph>
          </CardFooter>
        </Card>
        <Modal
          isDismissable={false}
          onOpenChange={onOpenChange}
          isOpen={isOpen}
          size="5xl"
        >
          <ModalContent>
            {(onClose) => {
              return (
                <>
                  <ModalHeader>
                    {fileName}
                    <Button
                      size="sm"
                      color="primary"
                      variant="ghost"
                      className=" ml-3"
                      onPress={() => {
                        downloadFile();
                      }}
                    >
                      下载
                    </Button>
                  </ModalHeader>
                  <ModalBody>
                    <PdfPreview
                      className="h-[80vh]"
                      uId={lesson!.ownerId}
                      lessonId={lesson!.lessonId}
                      fileName={fileName}
                      fileExt={fileExt}
                    ></PdfPreview>
                  </ModalBody>
                </>
              );
              return <></>;
            }}
          </ModalContent>
        </Modal>
      </div>
    </>
  );
};

export default LessonFileCard;
