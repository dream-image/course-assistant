import { Button, Card, CardBody, CardFooter, CardHeader, Divider, Image, Tab, Tabs } from '@nextui-org/react'
import { useContext, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom'
import image from '@/assets/头像.png'
import { ProDescriptions, ProDescriptionsActionType } from '@ant-design/pro-components';
import { UserInfoContext } from '@/context/UserInfoContext';
import { post } from '@/common/request';
import { message } from 'antd';
import { isMatch } from 'lodash-es';
const Info = () => {
  const navigate = useNavigate()
  const { userInfo, setUserInfoContext } = useContext(UserInfoContext)
  const [tabKey, setTabKey] = useState<string>('info')
  const actionRef = useRef<ProDescriptionsActionType>();
  return (
    <div className=' w-[1680px] h-full flex ml-4 relative'>
      <div className='h-full mr-8 hover:bg-indigo-50 hover:shadow-sky-100 hover:shadow-md transition-all w-max rounded-xl'>
        <Tabs aria-label="Options" variant="light" isVertical={true} onSelectionChange={(e) => {
          setTabKey(e.toString())
        }}>
          <Tab key="info" title="基本资料">

          </Tab>
          <Tab key="avatar" title="我的头像">

          </Tab>
          <Tab key="paasword" title="密码管理">

          </Tab>

        </Tabs>
      </div>
      <div className='w-full flex justify-center'>
        {
          tabKey === 'info' &&
          <Card className={`w-11/12 animate__animated  animate__fadeIn h-max`}>
            <CardHeader className="flex gap-3 ">
              <Image
                alt="头像"
                height={100}
                radius="full"
                src={image}
                width={100}
              />

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
                <ProDescriptions.Item label="文本" valueType="option">
                  <Button
                    color='primary'
                    onClick={() => {
                      actionRef.current?.reload();
                    }}
                    key="reload"
                  >
                    刷新
                  </Button>
                  <Button key="rest">重置</Button>
                </ProDescriptions.Item>
              </ProDescriptions>
            </CardBody>
            <Divider />
            <CardFooter>

            </CardFooter>
          </Card>
        }
      </div>

    </div>
  )
};
export default Info