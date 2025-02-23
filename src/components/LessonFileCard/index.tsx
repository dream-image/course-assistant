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
import { Typography } from "antd";
import styles from "./styles.module.css";
import PdfPreview from "../PDFView";
import { LessonType } from "@/api/type";
type Props = {
  coverUrl?: string;
  fileName: string;
  lesson?: LessonType;
};
const PDFExt = ["pdf"];
const LessonFileCard = (props: Props) => {
  const { coverUrl, fileName, lesson } = props;
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  return (
    <>
      <div
        className=" w-40 h-28 shadow-2xl rounded-lg hover:cursor-pointer hover:scale-[120%] transition-all duration-300 ease-in-out flex-grow max-w-[200px]"
        onClick={() => {
          onOpen();
        }}
      >
        <Card isFooterBlurred className="border-none" radius="lg">
          <Image
            alt="Woman listing to music"
            className="w-full flex-1"
            height={112}
            src={`${REQUEST_BASE_URL}/cover/defaultBackgroundOfLesson.jpg`}
          />
          <CardFooter className="justify-start before:bg-white/10 border-white/20 border-1 overflow-hidden py-1 absolute before:rounded-xl rounded-large bottom-1 w-[calc(100%_-_8px)] shadow-small ml-1 z-10">
            <Typography.Paragraph
              ellipsis={{
                tooltip: true,
                rows: 2,
              }}
              className={cn("text-tiny text-white/80", styles["mb-0"])}
            >
              {fileName}
            </Typography.Paragraph>
          </CardFooter>
        </Card>
        <Modal onOpenChange={onOpenChange} isOpen={isOpen} size="5xl">
          <ModalContent>
            {(onClose) => {
              if (PDFExt.includes(fileName?.split(".")?.pop() || "")) {
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
                          window.open(
                            `${REQUEST_BASE_URL}/upload/lesson/${
                              lesson!.ownerId
                            }/${lesson!.lessonId}/${fileName}`,
                            "_blank",
                          );
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
                      ></PdfPreview>
                    </ModalBody>
                  </>
                );
              }
              return <></>;
            }}
          </ModalContent>
        </Modal>
      </div>
    </>
  );
};

export default LessonFileCard;
