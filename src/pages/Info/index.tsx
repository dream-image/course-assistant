import {
  Avatar,
  Button,
  Card,
  CardBody,
  CardHeader,
  Chip,
  CircularProgress,
  cn,
  commonColors,
  Divider,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Tab,
  Tabs,
  useDisclosure,
} from "@heroui/react";
import { useContext, useRef, useState } from "react";
import {
  FormControlRender,
  ProDescriptions,
  ProDescriptionsActionType,
  ProFormItemRender,
} from "@ant-design/pro-components";
import { UserInfoContext } from "@/context/UserInfoContext";
import { post, REQUEST_BASE_URL } from "@/common/request";
import { Form, Input, message, Progress, Upload } from "antd";
import { isMatch, isUndefined } from "lodash-es";
import { CameraOutlined, UploadOutlined } from "@ant-design/icons";
import styles from "./style.module.less";
import { beforeUpload } from "../Manage";
import { FileType, getBase64, getQueryFromUrl, getToken } from "@/utils";
import { changeUserAvatar, getUserInfo } from "@/api";
import { MobileContext } from "@/context/MobileContext";
import { ETab } from "../Lesson";
const Info = () => {
  const { userInfo, setUserInfoContext } = useContext(UserInfoContext);
  const [tabKey, setTabKey] = useState<string>(
    getQueryFromUrl("tab") || ETab.INFO,
  );
  const { isMobile } = useContext(MobileContext);
  const actionRef = useRef<ProDescriptionsActionType>();
  const [isCoverLoading, setIsCoverLoading] = useState<boolean>(false);
  const [percent, setPercent] = useState<number>(0);
  const { isOpen, onOpenChange, onOpen } = useDisclosure();
  const [form] = Form.useForm();
  return (
    <div className=" w-[1680px] h-full flex ml-4 relative">
      {!isMobile ? (
        <div className="h-full mr-8 hover:bg-indigo-50 hover:shadow-sky-100 hover:shadow-md transition-all w-max rounded-xl">
          <Tabs
            aria-label="Options"
            variant="light"
            isVertical={true}
            onSelectionChange={(e) => {
              setTabKey(e.toString());
              setPercent(0);
              form.resetFields();
            }}
          >
            <Tab key={ETab.INFO} title="基本资料"></Tab>
            <Tab key={ETab.PASSWORD} title="密码管理"></Tab>
          </Tabs>
        </div>
      ) : null}
      <div className="w-full flex justify-start">
        <Card className={`w-11/12 animate__animated  animate__fadeIn h-max`}>
          {tabKey === ETab.INFO && (
            <>
              <CardHeader className="flex gap-3 ">
                <div className="relative">
                  <Avatar
                    alt="头像"
                    radius="full"
                    size="lg"
                    className=" w-24 h-24"
                    src={`${REQUEST_BASE_URL}/cover/${userInfo?.avatar}`}
                  />
                  <CameraOutlined
                    className="absolute bottom-1 right-2 text-sm z-10 text-stone-600 cursor-pointer"
                    onClick={() => {
                      onOpen();
                    }}
                  />
                </div>
              </CardHeader>
              <Divider />
              <CardBody>
                <ProDescriptions
                  actionRef={actionRef}
                  title="基础信息"
                  request={async () => {
                    return Promise.resolve({
                      success: true,
                      data: {
                        info: {
                          ...userInfo,
                          sex: userInfo.sex?.toString(),
                        },
                      },
                    });
                  }}
                  editable={{
                    onSave: async (keypath, newInfo, oriInfo) => {
                      if (isMatch(newInfo, oriInfo)) {
                        return true;
                      }
                      try {
                        if (
                          newInfo.info.nickname.length < 2 ||
                          newInfo.info.nickname.length > 8
                        ) {
                          message.error("昵称长度不得小于2大于8");
                          return false;
                        }
                        await post("/updateUserInfo", {
                          ...newInfo.info,
                        });
                        message.success("修改成功");
                        setUserInfoContext({ ...userInfo, ...newInfo.info });
                        return true;
                      } catch (error: any) {
                        message.error(error?.error_msg || "修改失败");
                        return false;
                      }
                    },
                  }}
                >
                  <ProDescriptions.Item
                    dataIndex={["info", "nickname"]}
                    label="名称"
                    valueType="text"
                    formItemProps={{
                      rules: [
                        {
                          validator: (_, value) => {
                            if (value.length < 2) {
                              return Promise.reject("昵称长度不得小于2");
                            }
                            if (value.length > 8) {
                              return Promise.reject("昵称长度不得大于8");
                            }
                            return Promise.resolve();
                          },
                        },
                      ],
                    }}
                  />
                  <ProDescriptions.Item
                    dataIndex={["info", "email"]}
                    label="邮箱"
                    valueType="text"
                    formItemProps={{
                      rules: [
                        {
                          message: "请输入正确的邮箱",
                          pattern:
                            /^([a-zA-Z0-9_-])+@([a-zA-Z0-9_-])+((\.[a-zA-Z0-9_-]{2,3}){1,2})$/,
                        },
                      ],
                    }}
                  />
                  <ProDescriptions.Item
                    label="id"
                    dataIndex={["info", "userid"]}
                    valueType="text"
                    editable={false}
                    copyable
                  />
                  <ProDescriptions.Item
                    label="性别"
                    dataIndex={["info", "sex"]}
                    valueType="radio"
                    formItemProps={{
                      rules: [
                        {
                          validator(rule, value, callback) {
                            if (value === undefined) {
                              return Promise.reject("该项必填");
                            } else {
                              return Promise.resolve();
                            }
                          },
                        },
                      ],
                    }}
                    valueEnum={{
                      "1": "男",
                      "2": "女",
                      "0": "其他",
                    }}
                  />
                  <ProDescriptions.Item
                    label="身份"
                    dataIndex={["info", "role"]}
                    valueType="text"
                    renderText={(value) => {
                      return value === "student"
                        ? "学生"
                        : value === "teacher"
                          ? "老师"
                          : "神秘人士";
                    }}
                    editable={false}
                  />
                  <ProDescriptions.Item
                    label="学校"
                    dataIndex={["info", "school"]}
                    valueType="text"
                    editable={false}
                  />
                </ProDescriptions>
              </CardBody>
              <Divider />
            </>
          )}
          {tabKey === ETab.PASSWORD && (
            <>
              <CardHeader>
                <span>更改密码</span>
              </CardHeader>
              <Divider />
              <CardBody className="no-scrollbar ">
                <Form
                  className="w-72"
                  labelCol={{ span: 10 }}
                  form={form}
                  onValuesChange={(changedValues, allValues) => {
                    if (!isUndefined(changedValues.newPassword)) {
                      let score = 0;
                      const { newPassword } = changedValues;
                      if (newPassword.length >= 8 && newPassword.length <= 16) {
                        score += 20;
                      }
                      if (/\d+/.test(newPassword)) {
                        score += 20;
                      }
                      if (/[a-z]+/.test(newPassword)) {
                        score += 20;
                      }
                      if (/[A-Z]+/.test(newPassword)) {
                        score += 20;
                      }
                      if (
                        /[\W]+/.test(newPassword) ||
                        /[_].+/.test(newPassword)
                      ) {
                        score += 20;
                      }
                      setPercent(score);
                    }
                  }}
                  onFinish={(values) => {
                    console.log("修改密码");
                  }}
                >
                  <Form.Item
                    rules={[
                      {
                        required: true,
                        message: "该项必填",
                      },
                    ]}
                    hasFeedback
                    label="旧密码"
                    name={"oldPassword"}
                  >
                    <Input.Password type="password"></Input.Password>
                  </Form.Item>
                  <Form.Item
                    rules={[
                      {
                        validator(rule, value, callback) {
                          if (percent < 100) {
                            return Promise.reject("密码强度不够");
                          }
                          return Promise.resolve();
                        },
                      },
                    ]}
                    hasFeedback
                    required
                    label="新密码"
                    name={"newPassword"}
                  >
                    <FormControlRender>
                      {(props) => {
                        return (
                          <div>
                            <Input.Password
                              {...props}
                              //@ts-ignore
                              status={props.status}
                            ></Input.Password>
                            <div className="text-xs text-zinc-400">
                              {!!percent && (
                                <Progress
                                  strokeLinecap="round"
                                  percent={percent}
                                  strokeColor={[
                                    commonColors.zinc[200],
                                    commonColors.zinc[300],
                                    commonColors.yellow[200],
                                    commonColors.yellow[300],
                                    commonColors.green[400],
                                  ]}
                                  steps={5}
                                  className={styles.progress}
                                  showInfo={false}
                                  trailColor={commonColors.zinc[50]}
                                  size={{
                                    width: 35,
                                    height: 5,
                                  }}
                                />
                              )}
                              密码要求8-16位，至少包含数字、大小写字母、字符
                            </div>
                          </div>
                        );
                      }}
                    </FormControlRender>
                  </Form.Item>
                  <Form.Item
                    rules={[
                      {
                        validator: (_, value) => {
                          if (value === form.getFieldValue("newPassword")) {
                            return Promise.resolve();
                          }
                          return Promise.reject(
                            new Error("两次输入的密码不一致"),
                          );
                        },
                      },
                    ]}
                    hasFeedback
                    required
                    label="确认新的密码"
                    name={"confirmPassword"}
                  >
                    <Input.Password></Input.Password>
                  </Form.Item>
                  <Form.Item wrapperCol={{ offset: 10 }}>
                    <Button color="primary" type="submit">
                      更新密码
                    </Button>
                  </Form.Item>
                </Form>
              </CardBody>
            </>
          )}
        </Card>
      </div>
      <>
        <Modal isOpen={isOpen} onOpenChange={onOpenChange} size="3xl">
          <ModalContent>
            {(onClose) => {
              return (
                <>
                  <ModalHeader className="flex flex-col gap-1">
                    更改头像
                  </ModalHeader>
                  <ModalBody>
                    <Form
                      className=""
                      labelAlign="right"
                      labelCol={{ span: 3 }}
                      wrapperCol={{ span: 12 }}
                    >
                      <Form.Item label="当前头像">
                        <Avatar
                          alt={"封面"}
                          className="w-44 h-44"
                          src={
                            userInfo?.avatar
                              ? `${REQUEST_BASE_URL}/cover/${userInfo?.avatar}`
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
                              rootClassName={cn(styles.upload, "")}
                              action={REQUEST_BASE_URL + "/upload/cover/avatar"}
                              showUploadList={false}
                              listType="picture-circle"
                              beforeUpload={beforeUpload}
                              maxCount={1}
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
                                <Avatar
                                  alt={"封面"}
                                  className="w-44 h-44"
                                  src={value}
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
                          await changeUserAvatar();
                          message.success("修改成功");
                          onClose();
                          const res = await getUserInfo();
                          setUserInfoContext({
                            ...res.data,
                            hasLogin: true,
                          });
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
export default Info;
