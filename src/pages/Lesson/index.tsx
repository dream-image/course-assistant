import { addLesson, deleteLesson, getLessonList, joinLesson } from "@/api";
import { LessonStatus, LessonStatusMap, LessonType } from "@/api/type";
import {
  CloseSquareOutlined,
  DeleteOutlined,
  EllipsisOutlined,
  ExclamationCircleOutlined,
  SearchOutlined,
} from "@ant-design/icons";
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
import { message, Typography } from "antd";
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
import LoaderAnimation from "@/components/LoaderAnimation";
import { getQueryFromUrl } from "@/utils";
import { MobileContext } from "@/context/MobileContext";

export enum ETab {
  MY_LESSON = "myLesson",
  LESSON_CENTER = "lessonCenter",
  INFO = "info",
  PASSWORD = "password",
}
const DEFAULT_LIMIT = 5;
const LessonCard = forwardRef(
  (
    props: LessonType & {
      isShowManage?: boolean;
      tabKey: ETab;
      userInfo: UserInfo;
      setList: (value: LessonType[]) => void;
      lessonList: LessonType[];
      refresh: () => Promise<void>;
      index: number;
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
      ownerId,
      setList,
      lessonList,
      refresh,
      index,
    } = props;
    const statusInfo = LessonStatusMap[status];
    const [selectedKeys, setSelectedKeys] = useState(new Set(["0"]));
    const navigate = useNavigate();
    const titleBoxRef = useRef<HTMLDivElement>(null);
    const [titleWidth, setTitleWidth] = useState(0);
    const [isDeleteLoading, setIsDeleteLoading] = useState(false);
    const [isDeleteDisabled, setIsDeleteDisabled] = useState(true);
    const [isJoinLoading, setIsJoinLoading] = useState(false);
    const { isOpen, onOpen, onOpenChange } = useDisclosure();
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
      <>
        <Card
          isFooterBlurred
          className={cn(
            "border-none relative min-w-[300px] max-w-[370px] h-[200px] overflow-visible flex-1 animate-opacity",
            styles.lessonCard,
          )}
          radius="lg"
        >
          {status === LessonStatus.OVER ? (
            <div className="absolute top-0 rounded-xl z-10 left-0 w-full h-full bg-black/50 flex justify-center items-center text-white text-2xl">
              已结束
            </div>
          ) : null}
          <Image
            alt={name}
            className=" bg-cover hover:cursor-pointer w-full flex-1 z-0"
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
          {tabKey === ETab.MY_LESSON &&
            userInfo.permissions.includes(PermissionEnum.MANAGE_LESSON) &&
            ownerId === userInfo.userid && (
              <div className=" z-10 absolute top-0 right-2 hover:cursor-pointer">
                <Dropdown>
                  <DropdownTrigger>
                    <EllipsisOutlined
                      className="capitalize"
                      style={{ fontSize: 20, color: "#bfbfbf" }}
                    />
                  </DropdownTrigger>
                  <DropdownMenu
                    aria-label="Dropdown Variants"
                    variant={"faded"}
                  >
                    {/* <DropdownItem key="new">收藏</DropdownItem> */}
                    <DropdownItem
                      key="delete"
                      className="text-danger"
                      color="danger"
                      onPress={async () => {
                        onOpen();
                      }}
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
                  onPress={() => {
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
                onPress={() => {
                  navigate(`/ai/manage/${lessonId}`);
                }}
              >
                管理
              </Button>
            ) : null}
            {tabKey === ETab.LESSON_CENTER &&
              !hasChosen &&
              status !== LessonStatus.OVER && (
                <Button
                  className="text-tiny text-white bg-black/20 ml-2"
                  color="default"
                  radius="lg"
                  size="sm"
                  variant="flat"
                  isLoading={isJoinLoading}
                  onPress={async () => {
                    try {
                      setIsJoinLoading(true);
                      await joinLesson({ lessonId });
                      message.success(`成功加入${name}`);
                      const list = [...lessonList];
                      list[index] = {
                        ...list[index],
                        hasChosen: true,
                      };
                      setList(list);
                    } catch (error: any) {
                      const msg = error?.error_msg || error?.message || error;
                      message.error(msg);
                    }
                    setIsJoinLoading(false);
                  }}
                >
                  加入课程
                </Button>
              )}
          </CardFooter>
        </Card>
        <Modal
          backdrop="blur"
          isOpen={isOpen}
          onOpenChange={onOpenChange}
          isDismissable={false}
        >
          <ModalContent>
            {(onClose) => (
              <>
                <ModalHeader>
                  <ExclamationCircleOutlined className=" text-danger-500 mr-2" />
                  删除课程
                </ModalHeader>
                <ModalBody>
                  <>
                    <span>
                      确定要删除<strong className="mx-2">{name}</strong>
                      吗？(该过程不可逆)
                    </span>
                    <Input
                      label="确认删除"
                      placeholder={name}
                      validate={(value) => {
                        if (value === name) {
                          setIsDeleteDisabled(false);
                          return true;
                        } else {
                          setIsDeleteDisabled(true);
                          return "请确认课程名称";
                        }
                      }}
                    ></Input>
                  </>
                </ModalBody>
                <ModalFooter>
                  <Button color="danger" variant="light" onPress={onClose}>
                    取消
                  </Button>
                  <Button
                    color="primary"
                    isLoading={isDeleteLoading}
                    isDisabled={isDeleteDisabled}
                    onPress={async () => {
                      try {
                        setIsDeleteLoading(true);
                        await deleteLesson({ lessonId });
                        message.success("删除成功");
                        refresh();
                        onClose();
                      } catch (error: any) {
                        const msg = error?.error_msg || error?.message || error;
                        message.error(msg);
                      }
                      setIsDeleteLoading(false);
                    }}
                  >
                    确定
                  </Button>
                </ModalFooter>
              </>
            )}
          </ModalContent>
        </Modal>
      </>
    );
  },
);
const Lesson = () => {
  const { userInfo } = useContext(UserInfoContext);
  const { isMobile } = useContext(MobileContext);
  const [tabKey, setTabKey] = useState<string>(
    getQueryFromUrl("tab") || ETab.MY_LESSON,
  );
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
    if (isLoading) {
      return false;
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
      setIsLoading(false);
      return true;
    } catch (error: any) {
      const msg = error?.error_msg || error?.message || error;
      message.error(msg);
    }
    setIsLoading(false);
    //给无限滚动组件里面做是否错误的判断
    return false;
  };
  const refresh = async () => {
    setLessonList([]);

    await getLessons(
      {
        limit: DEFAULT_LIMIT,
        offset: 0,
        total: 0,
        hasMore: true,
        lessonName: "",
      },
      tabKey === ETab.LESSON_CENTER,
    );
  };
  useEffect(() => {}, [tabKey]);

  return (
    <>
      <div className=" w-[1680px] h-full flex ml-4 relative">
        {!isMobile ? (
          <div className="h-full mr-8 hover:bg-indigo-50 hover:shadow-sky-100 hover:shadow-md transition-all w-max rounded-xl">
            <Tabs
              aria-label="Options"
              variant="light"
              isVertical={true}
              isDisabled={isLoading}
              selectedKey={tabKey}
              onSelectionChange={(e) => {
                setSearchConfig({
                  limit: DEFAULT_LIMIT,
                  offset: 0,
                  total: 0,
                  hasMore: true,
                  lessonName: "",
                });
                setLessonList([]);
                setTabKey(e.toString());
              }}
            >
              <Tab key={ETab.MY_LESSON} title="我的课程"></Tab>
              <Tab key={ETab.LESSON_CENTER} title="课程中心"></Tab>
            </Tabs>
          </div>
        ) : null}
        <div className="w-full flex justify-start h-full">
          {tabKey === ETab.MY_LESSON && (
            <>
              <Card className={`w-11/12   animate-opacity h-[95%] `}>
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
                    next={async () => {
                      return await getLessons(searchConfig);
                    }}
                    hasMore={searchConfig.hasMore}
                    loader={<LoaderAnimation></LoaderAnimation>}
                    className={styles.scroll}
                    endMessage={
                      <p style={{ textAlign: "center" }}>
                        {searchConfig.total > DEFAULT_LIMIT && (
                          <b>已经到底啦</b>
                        )}
                      </p>
                    }
                    refreshFunction={() => {}}
                    hasChildren={true}
                  >
                    <div className="flex flex-wrap justify-start gap-8">
                      {lessonList.map((i, index) => {
                        return (
                          <LessonCard
                            key={i.id}
                            {...i}
                            index={index}
                            setList={setLessonList}
                            lessonList={lessonList}
                            refresh={refresh}
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
              </Card>
            </>
          )}
          {tabKey === ETab.LESSON_CENTER && (
            <>
              <Card className={`w-11/12   animate-opacity h-[95%] `}>
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
                    next={async () => await getLessons(searchConfig, true)}
                    hasMore={searchConfig.hasMore}
                    loader={<LoaderAnimation></LoaderAnimation>}
                    className={styles.scroll}
                    endMessage={
                      <p style={{ textAlign: "center" }}>
                        {searchConfig.total > DEFAULT_LIMIT && (
                          <b>已经到底啦</b>
                        )}
                      </p>
                    }
                    refreshFunction={() => {
                      console.log("aa");
                    }}
                    hasChildren={true}
                  >
                    <div className="flex flex-wrap justify-start gap-8">
                      {lessonList.map((i, index) => {
                        return (
                          <LessonCard
                            key={i.id}
                            {...i}
                            index={index}
                            setList={setLessonList}
                            lessonList={lessonList}
                            refresh={refresh}
                            userInfo={userInfo}
                            tabKey={tabKey}
                          ></LessonCard>
                        );
                      })}
                    </div>
                  </InfiniteScroll>
                </CardBody>
              </Card>
            </>
          )}
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
                      try {
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
                        onClose();
                      } catch (error: any) {
                        const msg = error?.error_msg || error?.message || error;
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
  );
};
export default Lesson;
