import { Button, Card, CardBody, CardHeader, commonColors, Divider, Image, Input, Tab, Tabs } from '@nextui-org/react'
import { useContext, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom'
import image from '@/assets/头像.png'
import { FormControlRender, ProDescriptions, ProDescriptionsActionType } from '@ant-design/pro-components';
import { UserInfoContext } from '@/context/UserInfoContext';
import { post } from '@/common/request';
import { ConfigProvider, Form, message, Progress } from 'antd';
import { isEmpty, isMatch, isUndefined } from 'lodash-es';
import { CameraOutlined } from '@ant-design/icons';
import styles from './style.module.css'
const Info = () => {
  const navigate = useNavigate()
  const { userInfo, setUserInfoContext } = useContext(UserInfoContext)
  const [tabKey, setTabKey] = useState<string>('info')
  const actionRef = useRef<ProDescriptionsActionType>();
  const [percent, setPercent] = useState<number>(0)
  const [form] = Form.useForm();
  return (
    <div className=' w-[1680px] h-full flex ml-4 relative'>
      <div className='h-full mr-8 hover:bg-indigo-50 hover:shadow-sky-100 hover:shadow-md transition-all w-max rounded-xl'>
        <Tabs aria-label="Options" variant="light" isVertical={true} onSelectionChange={(e) => {
          setTabKey(e.toString())
        }}>
          <Tab key="info" title="基本资料">

          </Tab>
          <Tab key="password" title="密码管理">

          </Tab>

        </Tabs>
      </div>
      <div className='w-full flex justify-start'>
        <Card className={`w-11/12 animate__animated  animate__fadeIn h-max`}>
          {
            tabKey === 'info' && <>
              <CardHeader className="flex gap-3 ">
                <div className='relative'>
                  <Image
                    alt="头像"
                    height={100}
                    radius="full"
                    src={image}
                    width={100}
                  />
                  <CameraOutlined className='absolute bottom-1 right-2 text-sm z-10 text-stone-600 cursor-pointer' />
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
                        info: userInfo
                      },
                    });
                  }}
                  editable={{
                    onSave: async (keypath, newInfo, oriInfo) => {
                      if (isMatch(newInfo, oriInfo)) {
                        return true
                      }
                      try {
                        if (newInfo.info.nickname.length < 3 || newInfo.info.nickname.length > 20) {
                          message.error('昵称长度不得小于1大于20')
                          return false
                        }
                        console.log(keypath, newInfo, oriInfo);
                        await post('/updateUserInfo', {
                          ...newInfo.info
                        })
                        setUserInfoContext({ ...userInfo, ...newInfo.info })
                        return true;
                      } catch (error) {
                        return false
                      }

                    },
                  }}
                >
                  <ProDescriptions.Item
                    dataIndex={['info', 'nickname']}
                    label="名称"
                    valueType="text"
                    formItemProps={{
                      rules: [
                        {
                          validator: (_, value) => {
                            console.log('value', value);

                            if (value.length < 3) {
                              return Promise.reject('昵称长度不得小于3')
                            }
                            if (value.length > 20) {
                              return Promise.reject('昵称长度不得大于20')
                            }
                            return Promise.resolve()

                          }
                        }
                      ],
                    }}
                  />
                  <ProDescriptions.Item
                    label="id"
                    dataIndex={['info', 'userid']}
                    valueType="text"
                    editable={false}
                    copyable
                  />
                  <ProDescriptions.Item
                    label="性别"
                    dataIndex={['info', 'sex']}
                    valueType="radio"
                    renderText={(value) => {
                      return value === 1 ? '男' : '女'
                    }}
                    formItemProps={{
                      initialValue: '男',
                      rules: [
                        {
                          validator(rule, value, callback) {
                            console.log('value', value);

                            if (value === undefined) {
                              callback('该项必填')
                            } else {
                              callback()
                            }
                          },
                        }
                      ]
                    }}
                    valueEnum={{
                      1: '男',
                      0: '女',
                    }}
                  />
                  <ProDescriptions.Item
                    label="身份"
                    dataIndex={['info', 'role']}
                    valueType="text"
                    renderText={(value) => {
                      return value === 'student' ? '学生' : value === 'teacher' ? '老师' : '神秘人士'
                    }}
                    editable={false}
                  />
                  <ProDescriptions.Item
                    label="学校"
                    dataIndex={['info', 'school']}
                    valueType="text"
                    editable={false}
                  />
                </ProDescriptions>
              </CardBody>
              <Divider />
            </>
          }
          {
            tabKey === 'password' && <>
              <CardHeader>
                <span>更改密码</span>
              </CardHeader>
              <Divider />
              <CardBody>
                <Form className='w-72' labelCol={{ span: 10 }} form={form} onValuesChange={(changedValues, allValues) => {
                  if (!isUndefined(changedValues.newPassword)) {
                    let score = 0;
                    const { newPassword } = changedValues
                    if (newPassword.length >= 8 && newPassword.length <= 16) {
                      score += 20
                    }
                    if (/\d+/.test(newPassword)) {
                      score += 20
                    }
                    if (/[a-z]+/.test(newPassword)) {
                      score += 20
                    }
                    if (/[A-Z]+/.test(newPassword)) {
                      score += 20
                    }
                    if (/[\W]+/.test(newPassword) || /[_].+/.test(newPassword)) {
                      score += 20
                    }
                    setPercent(score)
                  }
                }}>
                  <Form.Item rules={[
                    {
                      required: true,
                      message: '该项必填'
                    }
                  ]} label="旧密码" name={'oldPassword'}>
                    <Input type='password'></Input>
                  </Form.Item>
                  <Form.Item rules={[
                    {
                      required: true,
                      message: '该项必填'
                    }
                  ]} label="新密码" name={'newPassword'}>
                    <FormControlRender>
                      {
                        (props) => {
                          return <>
                            <Input type="password" description={
                              <>
                                {
                                  !!percent && <Progress
                                    strokeLinecap='round'
                                    percent={percent}
                                    strokeColor={[commonColors.zinc[200], commonColors.zinc[300], commonColors.yellow[200], commonColors.yellow[300], commonColors.green[400]]}
                                    steps={5}
                                    className={styles.progress}

                                    showInfo={false}
                                    trailColor={commonColors.zinc[50]}
                                    size={{
                                      width: 35,
                                      height: 5
                                    }} />
                                }
                                密码要求8-16位，至少包含数字、大小写字母、字符
                              </>
                            } {...props}></Input>

                          </>
                        }
                      }
                    </FormControlRender>
                  </Form.Item>
                  <Form.Item rules={[
                    {
                      validator: (_, value) => {
                        if (value === form.getFieldValue('newPassword')) {
                          return Promise.resolve()
                        }
                        return Promise.reject(new Error('两次输入的密码不一致'))
                      }

                    }
                  ]} required label="确认新的密码" name={'confirmPassword'}>
                    <Input type='password'></Input>
                  </Form.Item>
                  <Form.Item wrapperCol={{ offset: 10 }}>
                    <Button color='primary' type="submit">
                      更新密码
                    </Button>
                  </Form.Item>
                </Form>
              </CardBody>
            </>
          }
        </Card>
      </div>

    </div>
  )
};
export default Info