import { addLesson, getLessonList } from "@/api";
import { LessonStatus, LessonStatusMap, LessonType } from "@/api/type";
import { EllipsisOutlined, SearchOutlined } from "@ant-design/icons";
import Logo from "/src/assets/logo.svg";
import {
  Accordion,
  AccordionItem,
  Button,
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  Chip,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
  Image,
  Input,
  Spinner,
  Tab,
  Tabs,
  Breadcrumbs,
  BreadcrumbItem,
  cn,
  Modal,
  ModalContent,
  useDisclosure,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "@heroui/react";
import {
  forwardRef,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useNavigate } from "react-router-dom";
import InfiniteScroll from "@/components/InfiniteScroll";
import { debounce, pick, throttle } from "lodash-es";
import styles from "./style.module.less";
import dayjs from "dayjs";
import { Col, message, Row, Space, Typography } from "antd";
import { UserInfoContext } from "@/context/UserInfoContext";
import { REQUEST_BASE_URL } from "@/common/request";
import { UserInfo } from "@/types";
import { PermissionEnum } from "@/common/permission";
import {
  ProForm,
  ProFormDateTimeRangePicker,
  ProFormInstance,
  ProFormText,
} from "@ant-design/pro-components";
import { stop } from "@/utils";

export enum ETab {
  MY_LESSON = "myLesson",
  LESSON_CENTER = "lessonCenter",
}
const DEFAULT_LIMIT = 5;
const LessonCard = forwardRef(
  (
    props: LessonType & {
      isShowManage?: boolean;
      tabKey: ETab;
      userInfo: UserInfo;
    },
    ref,
  ) => {
    const {
      name,
      status,
      teacherName,
      startTime,
      endTime,
      lessonId,
      isShowManage = false,
      hasChosen,
      cover,
      tabKey,
      userInfo,
    } = props;
    const statusInfo = LessonStatusMap[status];
    const [selectedKeys, setSelectedKeys] = useState(new Set(["0"]));
    const navigate = useNavigate();
    const titleBoxRef = useRef<HTMLDivElement>(null);
    const [titleWidth, setTitleWidth] = useState(0);
    const observer = useMemo(() => {
      return new ResizeObserver(
        throttle((entries) => {
          for (const entry of entries) {
            const { width } = entry.contentRect;
            setTitleWidth(width);
          }
        }, 500),
      );
    }, []);
    useEffect(() => {
      observer.observe(titleBoxRef.current!);
      return () => {
        observer.disconnect();
      };
    }, []);
    return (
      <Card
        isFooterBlurred
        className={cn(
          "border-none relative min-w-[300px] max-w-[370px] h-[200px] overflow-visible flex-1",
          styles.lessonCard,
        )}
        radius="lg"
      >
        <Image
          alt={name}
          className=" bg-cover hover:cursor-pointer w-full flex-1"
          height={200}
          isZoomed
          src={`${REQUEST_BASE_URL}/cover/${cover}`}
          fallbackSrc={"/src/assets/defaultBgOfLesson.jpg"}
          onClick={() => {
            setSelectedKeys(selectedKeys.has("1") ? new Set() : new Set("1"));
          }}
        />
        <Accordion
          className=" absolute z-10 top-0"
          selectedKeys={selectedKeys}
          //@ts-ignore
          onSelectionChange={setSelectedKeys}
        >
          <AccordionItem
            key="1"
            aria-label="1"
            startContent={<span className="text-xs text-white/80">详情</span>}
            indicator={<></>}
            className={`${styles.accordionItem} `}
          >
            <div
              className="flex flex-col gap-2 text-slate-500 bg-white text-sm p-2 rounded-md border-1 border-cyan-500 hover:cursor-pointer"
              onClick={() => {
                setSelectedKeys(
                  selectedKeys.has("1") ? new Set() : new Set("1"),
                );
              }}
            >
              <p>{teacherName}</p>
              <p>
                开课时间：{dayjs(startTime).format("YYYY-MM-DD HH:mm")}至
                {dayjs(endTime).format("YYYY-MM-DD HH:mm")}
              </p>
            </div>
          </AccordionItem>
        </Accordion>
        {tabKey === ETab.MY_LESSON && (
          <div className=" z-10 absolute top-0 right-2 hover:cursor-pointer">
            <Dropdown>
              <DropdownTrigger>
                <EllipsisOutlined
                  className="capitalize"
                  style={{ fontSize: 20, color: "#bfbfbf" }}
                />
              </DropdownTrigger>
              <DropdownMenu aria-label="Dropdown Variants" variant={"faded"}>
                {/* <DropdownItem key="new">收藏</DropdownItem> */}
                <DropdownItem
                  key="delete"
                  className="text-danger"
                  color="danger"
                >
                  移除
                </DropdownItem>
              </DropdownMenu>
            </Dropdown>
          </div>
        )}
        <CardFooter className="justify-between before:bg-white/10 border-white/20 border-1 overflow-hidden py-1 absolute before:rounded-xl rounded-large bottom-1 w-[calc(100%_-_8px)] shadow-small ml-1 z-10">
          <div
            className="text-xs text-white/80 w-full flex-nowrap  items-center"
            ref={titleBoxRef}
          >
            {tabKey === ETab.LESSON_CENTER && hasChosen ? (
              <Chip
                //@ts-ignore
                color={"primary"}
                className=" mr-2 text-white/80 text-[10px]"
                size="sm"
                variant="dot"
              >
                已选择
              </Chip>
            ) : (
              <Chip
                //@ts-ignore
                color={statusInfo.color}
                className=" mr-2 text-white/80 text-[10px]"
                size="sm"
                variant="dot"
              >
                {statusInfo.text}
              </Chip>
            )}

            <Typography.Text
              className={cn("text-xs text-white/80 -translate-y-1")}
              style={{
                width: titleWidth ? titleWidth - 68 : "auto",
              }}
              ellipsis={{
                tooltip: name,
              }}
            >
              {name}
            </Typography.Text>
          </div>
          {status === LessonStatus.ON &&
            tabKey === ETab.MY_LESSON &&
            userInfo.permissions.includes(PermissionEnum.CHAT) && (
              <Button
                className="text-tiny text-white bg-black/20"
                color="default"
                radius="lg"
                size="sm"
                variant="flat"
                onClick={() => {
                  navigate(`/ai/chat/${lessonId}`);
                }}
              >
                提问
              </Button>
            )}
          {isShowManage ? (
            <Button
              className="text-tiny text-white bg-black/20 ml-2"
              color="default"
              radius="lg"
              size="sm"
              variant="flat"
              onClick={() => {
                navigate(`/ai/manage/${lessonId}`);
              }}
            >
              管理
            </Button>
          ) : null}
          {tabKey === ETab.LESSON_CENTER && !hasChosen && (
            <Button
              className="text-tiny text-white bg-black/20 ml-2"
              color="default"
              radius="lg"
              size="sm"
              variant="flat"
              onPress={() => {}}
            >
              加入课程
            </Button>
          )}
        </CardFooter>
      </Card>
    );
  },
);
const Lesson = () => {
  const { userInfo } = useContext(UserInfoContext);
  const [tabKey, setTabKey] = useState<string>(ETab.MY_LESSON);
  const [searchConfig, setSearchConfig] = useState({
    limit: DEFAULT_LIMIT,
    offset: 0,
    total: 0,
    hasMore: true,
    lessonName: "",
  });
  const [lessonList, setLessonList] = useState<LessonType[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { isOpen, onOpenChange, onOpen } = useDisclosure();
  const formRef = useRef<ProFormInstance>();
  const getLessons = async (
    config: typeof searchConfig,
    isCenter?: boolean,
  ) => {
    await stop(1000);
    if (isLoading) {
      return;
    }
    setSearchConfig(config);
    setIsLoading(true);
    try {
      const res = await getLessonList(
        {
          ...pick(config, "limit", "offset", "lessonName"),
        },
        isCenter,
      );
      setLessonList((list) => [...list, ...res.data.lessonList]);
      setSearchConfig({
        ...config,
        limit: DEFAULT_LIMIT,
        offset: config.offset + DEFAULT_LIMIT,
        total: res.data.total,
        hasMore: config.offset + DEFAULT_LIMIT < res.data.total,
      });
    } catch (error: any) {
      const msg = error?.error_msg || error?.message || error;
      message.error(msg);
    }

    setIsLoading(false);
  };

  useEffect(() => {
    setSearchConfig({
      limit: DEFAULT_LIMIT,
      offset: 0,
      total: 0,
      hasMore: true,
      lessonName: "",
    });
    setLessonList([]);
  }, [tabKey]);

  return (
    <>
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
            <Tab key={ETab.MY_LESSON} title="我的课程"></Tab>
            <Tab key={ETab.LESSON_CENTER} title="课程中心"></Tab>
          </Tabs>
        </div>
        <div className="w-full flex justify-start h-full">
          <Card
            className={`w-11/12 animate__animated  animate__fadeIn h-[95%] `}
          >
            {tabKey === ETab.MY_LESSON && (
              <>
                <CardHeader>
                  <div className="flex flex-row justify-between w-full items-center">
                    <div className="flex-1">
                      <Breadcrumbs
                        itemClasses={{
                          separator: "px-2",
                        }}
                        size="lg"
                        separator="/"
                      >
                        <BreadcrumbItem>我的课程</BreadcrumbItem>
                      </Breadcrumbs>
                    </div>

                    <Input
                      autoComplete="on"
                      isClearable
                      radius="lg"
                      className="w-[200px] mr-6 opacity-80"
                      placeholder="课程搜索"
                      startContent={<SearchOutlined className="opacity-50" />}
                      onClear={debounce(() => {
                        setLessonList([]);
                        getLessons({
                          ...searchConfig,
                          lessonName: "",
                          offset: 0,
                          total: 0,
                          hasMore: true,
                        });
                      }, 100)}
                      onChange={debounce((e) => {
                        setLessonList([]);
                        getLessons({
                          ...searchConfig,
                          lessonName: e.target.value,
                          offset: 0,
                          total: 0,
                          hasMore: true,
                        });
                      }, 500)}
                    />
                    {userInfo.permissions.includes(
                      PermissionEnum.CREATE_LESSON,
                    ) && (
                      <Button
                        className="bg-gradient-to-tr  from-blue-400 to-sky-500 text-white shadow-lg"
                        onPress={() => {
                          onOpen();
                        }}
                      >
                        + 添加课程
                      </Button>
                    )}
                  </div>
                </CardHeader>
                <CardBody>
                  <InfiniteScroll
                    dataLength={lessonList.length}
                    next={() => getLessons(searchConfig)}
                    hasMore={searchConfig.hasMore}
                    loader={
                      <div
                        className={cn(
                          "flex justify-center flex-col  w-full h-full items-center",
                        )}
                      >
                        <svg
                          viewBox="0 0 1024 1024"
                          width="48"
                          height="48"
                          xmlns="http://www.w3.org/2000/svg"
                          version="1.1"
                          className="animation"
                        >
                          <g>
                            <path
                              className={"animation-delay-1"}
                              id="svg_1"
                              p-id="5280"
                              fill="#4dabf7"
                              d="m887.296,259.328l-162.304,-23.808a83.456,83.456 0 0 1 3.072,15.104l47.104,483.84a82.944,82.944 0 0 1 -74.496,90.624l-219.136,21.248a82.432,82.432 0 0 0 41.216,18.688l270.848,39.68a82.944,82.944 0 0 0 94.208,-70.144l69.632,-481.28a82.944,82.944 0 0 0 -70.144,-93.952z"
                            />
                            <path
                              id="svg_2"
                              p-id="5281"
                              opacity="0.55"
                              fill="#4dabf7"
                              className={"animation-delay-2"}
                              d="m774.912,734.464l-47.104,-483.84a83.2,83.2 0 0 0 -90.624,-74.496l-87.296,8.448l13.312,45.824l112.64,418.56a82.944,82.944 0 0 1 -58.368,102.4l-165.12,44.8l-96.512,25.6a82.944,82.944 0 0 0 71.936,29.696l53.248,-5.12l219.136,-21.248a82.944,82.944 0 0 0 74.752,-90.624z"
                            />
                            <path
                              id="svg_3"
                              p-id="5282"
                              opacity="0.15"
                              fill="#4dabf7"
                              className={"animation-delay-3"}
                              d="m675.84,650.96l-112.64,-418.56l-12.544,-46.08l0,-4.608a82.944,82.944 0 0 0 -102.4,-58.368l-265.728,71.68a82.944,82.944 0 0 0 -28.928,15.104l139.008,102.4l204.8,150.528l11.264,8.192a82.944,82.944 0 0 1 17.92,115.968l-58.88,80.384l-102.4,140.032a82.944,82.944 0 0 1 -11.776,12.8l2.56,3.328l96.512,-25.6l165.12,-44.8a82.944,82.944 0 0 0 58.112,-102.4z"
                            />
                            <text
                              opacity="0.9"
                              font-weight="bold"
                              xmlSpace="preserve"
                              text-anchor="start"
                              font-family="Noto Sans JP"
                              font-size="100"
                              id="svg_4"
                              y="488.99997"
                              x="150.99998"
                              fill="#4dabfc"
                              className={"animation-delay-4"}
                            >
                              Tian
                            </text>
                            <text
                              opacity="0.9"
                              font-weight="bold"
                              xmlSpace="preserve"
                              text-anchor="start"
                              font-family="Noto Sans JP"
                              font-size="100"
                              id="svg_5"
                              y="623.99997"
                              x="151"
                              fill="#4dabfc"
                              className={"animation-delay-4"}
                            >
                              Book
                            </text>
                          </g>
                        </svg>
                        <p className="opacity-55 font-medium">加载中</p>
                      </div>
                    }
                    className={styles.scroll}
                    endMessage={
                      <p style={{ textAlign: "center" }}>
                        {searchConfig.total > DEFAULT_LIMIT && (
                          <b>已经到底啦</b>
                        )}
                      </p>
                    }
                    refreshFunction={() => {}}
                  >
                    <div className="flex flex-wrap justify-start gap-8">
                      {lessonList.map((i) => {
                        return (
                          <LessonCard
                            key={i.id}
                            {...i}
                            userInfo={userInfo}
                            isShowManage={
                              userInfo.userid === i.ownerId &&
                              userInfo.permissions.includes(
                                PermissionEnum.MANAGE_LESSON,
                              )
                            }
                            tabKey={tabKey}
                          ></LessonCard>
                        );
                      })}
                    </div>
                  </InfiniteScroll>
                </CardBody>
              </>
            )}
            {tabKey === ETab.LESSON_CENTER && (
              <>
                <CardHeader>
                  <div className="flex flex-row justify-between w-full items-center">
                    <div className="flex-1">
                      <Breadcrumbs
                        itemClasses={{
                          separator: "px-2",
                        }}
                        size="lg"
                        separator="/"
                      >
                        <BreadcrumbItem>课程中心</BreadcrumbItem>
                      </Breadcrumbs>
                    </div>

                    <Input
                      autoComplete="on"
                      isClearable
                      radius="lg"
                      className="w-[200px] mr-6 opacity-80"
                      placeholder="课程搜索"
                      startContent={<SearchOutlined className="opacity-50" />}
                      onClear={debounce(() => {
                        setLessonList([]);
                        getLessons(
                          {
                            ...searchConfig,
                            lessonName: "",
                            offset: 0,
                            total: 0,
                            hasMore: true,
                          },
                          true,
                        );
                      }, 100)}
                      onChange={debounce((e) => {
                        setLessonList([]);
                        getLessons(
                          {
                            ...searchConfig,
                            lessonName: e.target.value,
                            offset: 0,
                            total: 0,
                            hasMore: true,
                          },
                          true,
                        );
                      }, 500)}
                    />
                  </div>
                </CardHeader>
                <CardBody>
                  <InfiniteScroll
                    dataLength={lessonList.length}
                    next={() => getLessons(searchConfig, true)}
                    hasMore={searchConfig.hasMore}
                    loader={
                      <div className="flex justify-center  w-full">
                        <Spinner size="md" />
                      </div>
                    }
                    className={styles.scroll}
                    endMessage={
                      <p style={{ textAlign: "center" }}>
                        {searchConfig.total > DEFAULT_LIMIT && (
                          <b>已经到底啦</b>
                        )}
                      </p>
                    }
                    refreshFunction={() => {}}
                  >
                    <div className="flex flex-wrap justify-start gap-8">
                      {lessonList.map((i) => {
                        return (
                          <LessonCard
                            key={i.id}
                            {...i}
                            userInfo={userInfo}
                            tabKey={tabKey}
                          ></LessonCard>
                        );
                      })}
                    </div>
                  </InfiniteScroll>
                </CardBody>
              </>
            )}
          </Card>
        </div>
      </div>
      <Modal
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        size="xl"
        isDismissable={false}
      >
        <ModalContent>
          {(onClose) => {
            return (
              <>
                <ModalHeader>添加课程</ModalHeader>
                <ModalBody>
                  <ProForm<{
                    name: string;
                    company?: string;
                    useMode?: string;
                  }>
                    formRef={formRef}
                    labelCol={{ span: 5 }}
                    wrapperCol={{ span: 15 }}
                    layout={"horizontal"}
                    submitter={{
                      render: (props, doms) => {
                        return <></>;
                      },
                    }}
                    labelAlign="right"
                    onFinish={async (values) => {}}
                    params={{}}
                  >
                    <ProFormText
                      width="sm"
                      name="name"
                      label="课程名称"
                      tooltip="最长为 20 位"
                      placeholder="请输入名称"
                      fieldProps={{
                        className: "inputSuffix",
                      }}
                      rules={[
                        {
                          required: true,
                          message: "课程名称不能为空",
                        },
                        {
                          max: 20,
                          message: "最长为 20 位",
                        },
                      ]}
                    />
                    <ProFormDateTimeRangePicker
                      name="time"
                      label="课程时间"
                      placeholder={["请输入开始时间", "请输入结束时间"]}
                      rules={[
                        {
                          required: true,
                          message: "课程时间不能为空",
                        },
                        {
                          validator(rule, value, callback) {
                            if (value?.[0] > value?.[1]) {
                              callback("开始时间不能大于结束时间");
                            }
                            if (value?.[0] < new Date()) {
                              callback("开始时间不能小于当前时间");
                            }
                            callback();
                          },
                        },
                      ]}
                      fieldProps={{
                        format: "YYYY-MM-DD HH:mm",
                        showTime: { format: "HH:mm" },
                      }}
                    />
                    <ProFormText
                      name={"college"}
                      width="sm"
                      label="开课学院"
                      placeholder="请输入学院"
                      fieldProps={{
                        className: "inputSuffix",
                      }}
                      rules={[
                        {
                          required: true,
                          message: "开课学院不能为空",
                        },
                        {
                          max: 20,
                          message: "最长为 20 位",
                        },
                      ]}
                    />
                  </ProForm>
                </ModalBody>
                <ModalFooter>
                  <Button color="danger" variant="light" onPress={onClose}>
                    取消
                  </Button>
                  <Button
                    color="primary"
                    onPress={async () => {
                      await formRef.current?.validateFields();
                      const values = formRef.current?.getFieldsValue();
                      await addLesson({
                        name: values.name,
                        startTime: dayjs(values.time[0]).valueOf(),
                        endTime: dayjs(values.time[1]).valueOf(),
                        college: values.college,
                      });
                      setLessonList([]);
                      await getLessons({
                        ...searchConfig,
                        lessonName: "",
                        offset: 0,
                        total: 0,
                        hasMore: true,
                      });
                      console.log("values", formRef.current?.getFieldsValue());
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
  );
};
export default Lesson;
