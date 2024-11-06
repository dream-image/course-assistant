import Logo from '@/assets/404.svg'
import { Button, Card, CardBody, CardFooter, CardHeader, Divider, Image, Tab, Tabs } from '@nextui-org/react'
import { useState } from 'react';
import { useNavigate } from 'react-router-dom'
import image from '@/assets/头像.png'
const Info = () => {
  const navigate = useNavigate()
  const [tabKey, setTabKey] = useState<string>('info')
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
              <div>
                <div>
                  <span>名称：</span>
                  <span></span>
                </div>
                <div>
                  <span>id：</span>
                  <span></span>
                </div>
                <div>
                  <span>性别：</span>
                  <span></span>
                </div>
                <div>
                  <span>手机号：</span>
                  <span></span>
                </div>
              </div>
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