import { getLessonList } from "@/api";
import { LessonStatusMap, LessonType } from "@/api/type";
import { EllipsisOutlined, SearchOutlined } from "@ant-design/icons";
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
} from "@nextui-org/react";
import { forwardRef, useContext, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import InfiniteScroll from "@/components/InfiniteScroll";
import { debounce, pick } from "lodash-es";
import styles from "./style.module.css";
import dayjs from "dayjs";
import { message } from "antd";
import { UserInfoContext } from "@/context/UserInfoContext";
const LessonCard = forwardRef(
  (props: LessonType & { isShowManage?: boolean }, ref) => {
    const {
      name,
      status,
      teacherName,
      startTime,
      endTime,
      lessonId,
      isShowManage = false,
    } = props;
    const statusInfo = LessonStatusMap[status];
    const [selectedKeys, setSelectedKeys] = useState(new Set(["0"]));
    const navigate = useNavigate();
    return (
      <Card
        isFooterBlurred
        className="border-none relative min-w-[300px] max-w-[370px] h-[200px] overflow-visible flex-1"
        radius="lg"
      >
        <Image
          alt={name}
          className=" bg-contain hover:cursor-pointer min-w-[300px] flex-1"
          height={200}
          src="/src/assets/defaultBgOfLesson.jpg"
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
        <div className=" z-10 absolute top-0 right-2 hover:cursor-pointer">
          <Dropdown>
            <DropdownTrigger>
              <EllipsisOutlined
                className="capitalize"
                style={{ fontSize: 20, color: "#bfbfbf" }}
              />
            </DropdownTrigger>
            <DropdownMenu aria-label="Dropdown Variants" variant={"faded"}>
              <DropdownItem key="new">收藏</DropdownItem>
              <DropdownItem key="delete" className="text-danger" color="danger">
                移除
              </DropdownItem>
            </DropdownMenu>
          </Dropdown>
        </div>
        <CardFooter className="justify-between before:bg-white/10 border-white/20 border-1 overflow-hidden py-1 absolute before:rounded-xl rounded-large bottom-1 w-[calc(100%_-_8px)] shadow-small ml-1 z-10">
          <div className="text-xs text-white/80 flex-1">
            <Chip
              //@ts-ignore
              color={statusInfo.color}
              className=" mr-2 text-white/80 text-[10px]"
              size="sm"
              variant="dot"
            >
              {statusInfo.text}
            </Chip>
            <span>{name}</span>
          </div>
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
        </CardFooter>
      </Card>
    );
  },
);

const DEFAULT_LIMIT = 5;
const Lesson = () => {
  const { userInfo } = useContext(UserInfoContext);
  const [tabKey, setTabKey] = useState<string>("center");
  const [searchConfig, setSearchConfig] = useState({
    limit: DEFAULT_LIMIT,
    offset: 0,
    total: 0,
    hasMore: true,
    lessonName: "",
  });
  const [lessonList, setLessonList] = useState<LessonType[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const getLessons = async (config: typeof searchConfig) => {
    if (isLoading) {
      return;
    }
    setSearchConfig(config);
    setIsLoading(true);
    try {
      const res = await getLessonList({
        ...pick(config, "limit", "offset", "lessonName"),
      });
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
  const refresh = async () => {
    const res = await getLessonList({
      limit: DEFAULT_LIMIT,
      offset: 0,
    });
    setLessonList(res.data.lessonList);
    setSearchConfig({
      ...searchConfig,
      limit: DEFAULT_LIMIT,
      offset: DEFAULT_LIMIT,
      total: res.data.total,
      hasMore: DEFAULT_LIMIT < res.data.total,
    });
  };
  const search = async (name: string) => {};
  useEffect(() => {}, [tabKey]);

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
              <CardHeader>
                <div className="flex flex-row justify-between w-full items-center">
                  <span className="text-xl flex-1">我的课程</span>
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
                  <Button
                    className="bg-gradient-to-tr  from-blue-400 to-sky-500 text-white shadow-lg"
                    onClick={() => {}}
                  >
                    + 添加课程
                  </Button>
                </div>
              </CardHeader>
              <CardBody>
                <InfiniteScroll
                  dataLength={lessonList.length}
                  next={() => getLessons(searchConfig)}
                  hasMore={searchConfig.hasMore}
                  loader={
                    <div className="flex justify-center  w-full">
                      <Spinner size="md" />
                    </div>
                  }
                  className={styles.scroll}
                  endMessage={
                    <p style={{ textAlign: "center" }}>
                      {searchConfig.total > DEFAULT_LIMIT && <b>已经到底啦</b>}
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
                          isShowManage={userInfo.role === "teacher"}
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
  );
};
export default Lesson;
