import Logo from '@/assets/404.svg'
import { SearchOutlined } from '@ant-design/icons';
import { Button, Card, CardBody, CardHeader, Image, Input, Tab, Tabs } from '@nextui-org/react'
import { useState } from 'react';
import { useNavigate } from 'react-router-dom'
const Lesson = () => {
  const navigate = useNavigate()
  const [tabKey, setTabKey] = useState<string>('center')
  return (
    <div className=' w-[1680px] h-full flex ml-4 relative'>
      <div className='h-full mr-8 hover:bg-indigo-50 hover:shadow-sky-100 hover:shadow-md transition-all w-max rounded-xl'>
        <Tabs aria-label="Options" variant="light" isVertical={true} onSelectionChange={(e) => {
          setTabKey(e.toString())
        }}>
          <Tab key="center" title="我学的课">

          </Tab>
          <Tab key="myLesson" title="我教的课">

          </Tab>

        </Tabs>
      </div>
      <div className='w-full flex justify-start'>
        <Card className={`w-11/12 animate__animated  animate__fadeIn h-max`}>
          {
            tabKey === 'center' && <>
              <CardHeader>
                <div className='flex flex-row justify-between w-full items-center'>
                  <span className='text-xl flex-1'>我学的课</span>
                  <Input
                    autoComplete="on"
                    isClearable
                    radius="lg"
                    className="w-[200px] mr-6 opacity-80"
                    placeholder="课程搜索"
                    startContent={
                      <SearchOutlined className='opacity-50' />
                    }
                  />
                  <Button className='bg-gradient-to-tr  from-blue-400 to-sky-500 text-white shadow-lg' onClick={() => {
                  }}>+ 添加课程</Button>
                </div>
              </CardHeader>
              <CardBody>

              </CardBody>
            </>
          }
        </Card>

      </div>
    </div>
  )
};
export default Lesson