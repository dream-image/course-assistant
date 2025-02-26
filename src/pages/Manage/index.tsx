import {
  changeLessonCover,
  getLessonFileList,
  getLessonInfo,
  removeLessonFile,
  updateLesson,
} from "@/api";
import { LessonFile, LessonType } from "@/api/type";
import { FileType, getBase64, getToken, stop } from "@/utils";
import { UploadOutlined } from "@ant-design/icons";
import { ProDescriptions, ProFormItemRender } from "@ant-design/pro-components";
import {
  Accordion,
  AccordionItem,
  BreadcrumbItem,
  Breadcrumbs,
  Button,
  Card,
  CardBody,
  CardHeader,
  Chip,
  CircularProgress,
  cn,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Tab,
  Tabs,
  Tooltip,
  useDisclosure,
} from "@heroui/react";
import {
  Form,
  Image,
  message,
  Upload,
  Button as AntdButton,
  Modal as AntdModal,
} from "antd";
import { isUndefined } from "lodash-es";
import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import styles from "./style.module.less";
import { REQUEST_BASE_URL } from "@/common/request";
import dayjs, { Dayjs } from "dayjs";
import LessonFileCard from "@/components/LessonFileCard";
import { UploadFile } from "antd/lib";
import LoaderAnimation from "@/components/LoaderAnimation";
const acceptFileExtension = ["pdf", "ppt", "pptx", "doc", "docx"];
const beforeUpload = (file: FileType) => {
  const isJpgOrPng = file.type === "image/jpeg" || file.type === "image/png";
  if (!isJpgOrPng) {
    message.error("只支持png和jpeg格式的图片");
  }
  const isLt2M = file.size / 1024 / 1024 < 4;
  if (!isLt2M) {
    message.error("图片大小必须小于4MB!");
  }
  return isJpgOrPng && isLt2M;
};
const Manage = () => {
  const [tabKey, setTabKey] = useState<string>("center");
  const navigate = useNavigate();
  const params = useParams();
  const [lesson, setLesson] = useState<LessonType>();
  const [isLoading, setIsLoading] = useState(false);
  const [lessonFiles, setLessonFiles] = useState<LessonFile[]>([]);
  const [uploadFileListInModal, setUploadFileListInModal] = useState<
    UploadFile[]
  >([]);
  const { isOpen, onOpen, onOpenChange } = useDisclosure({ id: "cover" });
  const {
    isOpen: isFileModalOpen,
    onOpenChange: onFileModalOpenChange,
    onOpen: onFileModalOpen,
    onClose: onFileModalClose,
  } = useDisclosure({ id: "files" });
  const [isCoverLoading, setIsCoverLoading] = useState<boolean>(false);

  const getLesson = async () => {
    try {
      if (isUndefined(params.id) || isNaN(Number(params.id))) {
        navigate(-1);
        return;
      }
      const res = await getLessonInfo(Number(params.id));
      if (res.data.total) {
        setLesson(res.data.list[0]);
        return res.data.list[0];
      } else {
        message.error("该课程不存在");
        navigate(-1);
      }
    } catch (error: any) {
      message.error(error?.error_msg || error?.message || "获取课程信息失败");
      navigate(-1);
    }
  };
  const getLessonFiles = async () => {
    try {
      setIsLoading(true);
      if (isUndefined(params.id) || isNaN(Number(params.id))) {
        navigate(-1);
        setIsLoading(false);
        return;
      }
      const res = await getLessonFileList({ lessonId: Number(params.id) });
      setLessonFiles(res.data);
    } catch (error: any) {
      message.error(
        error?.error_msg || error?.message || "获取课程文件列表失败",
      );
    }
    setIsLoading(false);
  };
  const init = async () => {
    getLesson();
    getLessonFiles();
  };
  useEffect(() => {
    init();
  }, []);
  return (
    <div className=" w-[1680px] h-full flex ml-4 relative">
      <div className="h-full mr-8 hover:bg-indigo-50 hover:shadow-sky-100 hover:shadow-md transition-all w-max rounded-xl">
        <Tabs
          aria-label="Options"
          variant="light"
          isVertical={true}
          onSelectionChange={(e) => {
            setTabKey(e.toString());
          }}
        >
          <Tab key="center" title="我的课程"></Tab>
          {/* <Tab key="myLesson" title="我教的课">
  
            </Tab> */}
        </Tabs>
      </div>
      <div className="w-full flex justify-start h-full">
        <Card className={`w-11/12 animate__animated  animate__fadeIn h-[95%] `}>
          {tabKey === "center" && (
            <>
              <CardHeader className="pb-0">
                <div className="flex flex-row justify-between w-full items-center">
                  <div className="flex-1 h-10 items-center flex">
                    <Breadcrumbs
                      itemClasses={{
                        separator: "px-2",
                      }}
                      size="lg"
                      separator="/"
                    >
                      <BreadcrumbItem
                        onClick={() => {
                          navigate("/ai/lesson");
                        }}
                      >
                        我的课程
                      </BreadcrumbItem>
                      <BreadcrumbItem>管理</BreadcrumbItem>
                    </Breadcrumbs>
                  </div>
                </div>
              </CardHeader>
              <CardBody className="flex flex-col gap-3">
                <Accordion
                  variant="splitted"
                  defaultExpandedKeys={["1"]}
                  selectionMode="multiple"
                >
                  <AccordionItem key="1" aria-label="课程信息" title="课程信息">
                    <div className="w-full rounded-lg flex items-center justify-between gap-3 h-[206px]">
                      <div className=" relative ">
                        <Image
                          alt={"封面"}
                          className=" bg-contain min-w-[300px] flex-1"
                          wrapperClassName="rounded-lg overflow-hidden"
                          height={200}
                          src={
                            lesson?.cover
                              ? `${REQUEST_BASE_URL}/cover/${lesson?.cover}`
                              : ""
                          }
                        />
                        <div className="absolute bottom-1 right-0  w-min h-min">
                          <Button
                            variant="light"
                            size="sm"
                            className="mix-blend-hard-light"
                            onClick={() => {
                              onOpen();
                            }}
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
                            更换封面
                          </Button>
                        </div>
                      </div>

                      <div className="flex-1 flex-col justify-between h-full gap-3">
                        <ProDescriptions
                          dataSource={lesson}
                          column={1}
                          title=""
                          editable={{
                            onSave: async (keypath, newInfo, oriInfo) => {
                              try {
                                const {
                                  lessonId,
                                  createTime,
                                  startTime,
                                  endTime,
                                  teacherName,
                                  name,
                                  college,
                                } = newInfo;
                                await updateLesson({
                                  lessonId,
                                  createTime: dayjs(createTime).valueOf(),
                                  startTime: dayjs(startTime).valueOf(),
                                  endTime: dayjs(endTime).valueOf(),
                                  teacherName,
                                  name,
                                  college,
                                });
                                message.success("更新成功");
                                await getLesson();
                                return Promise.resolve();
                              } catch (error: any) {
                                console.log("error", error);
                                message.error(error?.error_msg || "修改失败");
                                return false;
                              }
                            },
                          }}
                        >
                          <ProDescriptions.Item
                            dataIndex={["name"]}
                            label="课程名称"
                            valueType="text"
                            fieldProps={{
                              className: "inputSuffix",
                            }}
                            formItemProps={{
                              rules: [
                                {
                                  validator: (_, value) => {
                                    if (value.length < 1) {
                                      return Promise.reject(
                                        "昵称长度不得小于1",
                                      );
                                    }
                                    if (value.length > 20) {
                                      return Promise.reject(
                                        "昵称长度不得大于20",
                                      );
                                    }
                                    return Promise.resolve();
                                  },
                                },
                              ],
                            }}
                          />
                          <ProDescriptions.Item
                            label="开课人"
                            dataIndex={["teacherName"]}
                            valueType="text"
                            editable={false}
                          />
                          <ProDescriptions.Item
                            label="开始时间"
                            dataIndex={["startTime"]}
                            valueType="date"
                            fieldProps={{
                              name: "startTime",
                              format: "YYYY-MM-DD HH:mm",
                              showTime: { format: "HH:mm" },

                              disabledDate: (current: Dayjs) => {
                                if (current < dayjs().startOf("day")) {
                                  return true;
                                }
                                return false;
                              },
                            }}
                          />
                          <ProDescriptions.Item
                            label="结束时间"
                            dataIndex={["endTime"]}
                            valueType="date"
                            fieldProps={{
                              name: "endTime",
                              format: "YYYY-MM-DD HH:mm",
                              showTime: { format: "HH:mm" },
                              disabledDate: (current: Dayjs) => {
                                if (current < dayjs().startOf("day")) {
                                  return true;
                                }
                                return false;
                              },
                            }}
                          />
                          <ProDescriptions.Item
                            label="开课学院"
                            dataIndex={["college"]}
                            valueType="text"
                            fieldProps={{
                              className: "inputSuffix",
                            }}
                          />
                        </ProDescriptions>
                      </div>
                    </div>
                  </AccordionItem>
                  <AccordionItem
                    key="2"
                    aria-label="课程资料"
                    classNames={{
                      content: "flex gap-5 flex-wrap",
                    }}
                    title={
                      <div className=" flex justify-start gap-3">
                        <div>课程资料</div>
                        <Tooltip
                          content="最多允许20份课程资料"
                          showArrow={true}
                          color="primary"
                          closeDelay={100}
                        >
                          <Button
                            className=" h-7 "
                            size="sm"
                            variant="ghost"
                            color="primary"
                            onPress={() => {
                              onFileModalOpen();
                            }}
                          >
                            新增 +
                          </Button>
                        </Tooltip>
                      </div>
                    }
                  >
                    {isLoading ? (
                      <LoaderAnimation></LoaderAnimation>
                    ) : (
                      lessonFiles?.map((i, index) => {
                        return (
                          <LessonFileCard
                            {...i}
                            key={index}
                            lesson={lesson}
                            fileName={i.name}
                            refresh={getLessonFiles}
                          ></LessonFileCard>
                        );
                      })
                    )}
                  </AccordionItem>
                  <AccordionItem
                    key="3"
                    aria-label="学生列表"
                    title="学生列表"
                  ></AccordionItem>
                </Accordion>
              </CardBody>
            </>
          )}
        </Card>
      </div>
      {/* 下面是悬浮层 */}
      <>
        <Modal isOpen={isOpen} onOpenChange={onOpenChange} size="3xl">
          <ModalContent>
            {(onClose) => {
              return (
                <>
                  <ModalHeader className="flex flex-col gap-1">
                    更改封面
                  </ModalHeader>
                  <ModalBody>
                    <Form
                      className=""
                      labelAlign="right"
                      labelCol={{ span: 3 }}
                      wrapperCol={{ span: 12 }}
                    >
                      <Form.Item label="当前封面">
                        <Image
                          preview={false}
                          alt={"封面"}
                          className=" bg-contain"
                          wrapperClassName="rounded-lg overflow-hidden"
                          height={200}
                          src={
                            lesson?.cover
                              ? `${REQUEST_BASE_URL}/cover/${lesson?.cover}`
                              : ""
                          }
                        />
                      </Form.Item>
                      <ProFormItemRender
                        name="newCover"
                        label="新封面"
                        className="h-[200px]"
                      >
                        {({ value, onChange }) => {
                          return (
                            <Upload
                              name="avatar"
                              listType="picture-card"
                              rootClassName={cn(styles.upload, "")}
                              action={REQUEST_BASE_URL + "/upload/cover/lesson"}
                              showUploadList={false}
                              beforeUpload={beforeUpload}
                              maxCount={1}
                              data={{ lessonId: lesson?.lessonId }}
                              headers={{
                                Authorization: getToken() || "",
                              }}
                              onChange={(info) => {
                                if (
                                  info.file.status === "error" ||
                                  (info.file.response?.result &&
                                    info.file.response?.result !== 1)
                                ) {
                                  message.error("上传失败,请稍后重试");
                                  setIsCoverLoading(false);
                                  onChange("");
                                  return;
                                }
                                if (info.file.status === "uploading") {
                                  setIsCoverLoading(true);
                                  onChange("");
                                  return;
                                }
                                if (info.file.status === "done") {
                                  getBase64(
                                    info.file.originFileObj as FileType,
                                    (url) => {
                                      setIsCoverLoading(false);
                                      onChange(url);
                                    },
                                  );
                                }
                              }}
                            >
                              {value ? (
                                <Image
                                  preview={false}
                                  src={value}
                                  alt="新封面"
                                  className=" bg-contain"
                                  height={200}
                                  width={360}
                                  wrapperClassName="rounded-lg overflow-hidden"
                                />
                              ) : isCoverLoading ? (
                                <>
                                  <CircularProgress label="上传中" />
                                </>
                              ) : (
                                <>
                                  <Chip variant="light">
                                    <div className="flex flex-col items-center justify-center">
                                      <UploadOutlined />
                                      <span>上传</span>
                                      <span className="text-xs text-gray-500">
                                        （图片只支持png和jpeg格式）
                                      </span>
                                    </div>
                                  </Chip>
                                </>
                              )}
                            </Upload>
                          );
                        }}
                      </ProFormItemRender>
                    </Form>
                  </ModalBody>
                  <ModalFooter>
                    <Button color="danger" variant="light" onPress={onClose}>
                      取消
                    </Button>
                    <Button
                      color="primary"
                      onPress={async () => {
                        try {
                          if (!lesson?.lessonId) {
                            message.error("课程信息不存在");
                            return;
                          }
                          await changeLessonCover({
                            lessonId: lesson?.lessonId,
                          });
                          message.success("修改成功");
                          onClose();
                          //刷新信息
                          await getLesson();
                        } catch (error: any) {
                          const msg =
                            error?.error_msg ||
                            error?.message ||
                            "网络错误，请稍后再试";
                          console.error(error);
                          message.error(msg);
                        }
                      }}
                    >
                      确定
                    </Button>
                  </ModalFooter>
                </>
              );
            }}
          </ModalContent>
        </Modal>
        <Modal
          isOpen={isFileModalOpen}
          onOpenChange={onFileModalOpenChange}
          size="4xl"
          onClose={() => {
            onFileModalClose();
          }}
          isDismissable={false}
          hideCloseButton
        >
          <ModalContent>
            {(onClose) => {
              return (
                <>
                  <ModalHeader className="flex items-center">
                    上传文件
                    <span className=" text-gray-600  text-sm font-normal">
                      (一次最多上传5份文件,支持pdf、ppt、pptx、doc、docx类型文件)
                    </span>
                  </ModalHeader>
                  <ModalBody>
                    <Upload
                      multiple
                      maxCount={5}
                      listType="picture"
                      action={`${REQUEST_BASE_URL}/upload/lesson/file`}
                      data={{ lessonId: lesson?.lessonId }}
                      headers={{
                        Authorization: getToken() || "",
                      }}
                      onRemove={async (file) => {
                        try {
                          if (file.status === "done") {
                            await removeLessonFile({
                              lessonId: lesson!.lessonId,
                              fileName: file.name,
                            });
                            getLessonFiles();
                            return;
                          }
                          if (file.status === "uploading") {
                            message.error("文件上传中，请稍后再试");
                            return;
                          }
                        } catch (error: any) {
                          console.log(error);
                          if (error?.result === 404) {
                            return;
                          }
                          const msg =
                            error?.error_msg || error?.message || error;
                          message.error(msg);
                          return Promise.reject();
                        }
                      }}
                      onChange={(info) => {
                        setUploadFileListInModal(info.fileList);
                        const { file } = info;
                        if (info.file.status === "error") {
                          const msg =
                            file.response?.error_msg ||
                            file.response ||
                            "网络错误，请稍后再试";
                          info.file.response = msg;
                        }
                      }}
                      beforeUpload={async (file) => {
                        if (
                          uploadFileListInModal.some(
                            (i) => i.name === file.name,
                          )
                        ) {
                          message.error("文件已在上传列表，请勿重复上传");
                          return Upload.LIST_IGNORE;
                        }
                        const fileExt =
                          file.name.split(".").pop()?.toLocaleLowerCase() || "";
                        if (!acceptFileExtension.includes(fileExt)) {
                          message.error("文件格式不支持");

                          return Upload.LIST_IGNORE;
                        }
                        if (lessonFiles.some((i) => i.name === file.name)) {
                          const res = await new Promise((res, rej) => {
                            const modal = AntdModal.confirm({
                              title: "文件已存在，是否覆盖？",
                              onOk: async () => {
                                res(true);
                                modal.destroy();
                              },
                              onCancel: async () => {
                                res(false);
                                modal.destroy();
                              },
                            });
                          });
                          if (!res) return Upload.LIST_IGNORE;
                          return true;
                        }
                      }}
                    >
                      <AntdButton type="primary" className=" rounded-xl h-10">
                        <UploadOutlined />
                        上传文件
                      </AntdButton>
                    </Upload>
                  </ModalBody>
                  <ModalFooter>
                    <Button
                      color="primary"
                      onPress={async () => {
                        try {
                          getLessonFiles();
                          setUploadFileListInModal([]);
                          onClose();
                        } catch (error: any) {
                          const msg =
                            error?.error_msg ||
                            error?.message ||
                            "网络错误，请稍后再试";
                          console.error(error);
                          message.error(msg);
                        }
                      }}
                    >
                      确定
                    </Button>
                  </ModalFooter>
                </>
              );
            }}
          </ModalContent>
        </Modal>
      </>
    </div>
  );
};

export default Manage;
