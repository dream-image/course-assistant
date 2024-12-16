import Logo from '@/assets/404.svg'
import { DashOutlined, EllipsisOutlined, SearchOutlined } from '@ant-design/icons';
import { Button, Card, CardBody, CardFooter, CardHeader, Dropdown, DropdownItem, DropdownMenu, DropdownTrigger, Image, Input, Tab, Tabs } from '@nextui-org/react'
import { useState } from 'react';
import { useNavigate } from 'react-router-dom'

const LessonCard = () => {
  return (
    <Card isFooterBlurred className="border-none relative w-[200px] h-[200px] hover:scale-105" radius="lg">
      <Image
        alt="计算机科学与技术"
        className=" bg-contain"
        height={200}
        src="/public/defaultBg_LE_upscale_balanced_x4_light_ai_30.jpg"
        width={200}
      />

      <div className=' z-10 absolute top-0 right-2 hover:cursor-pointer'>
        <Dropdown>
          <DropdownTrigger>
            <EllipsisOutlined className="capitalize" style={{ fontSize: 20, color: "#bfbfbf" }} />
          </DropdownTrigger>
          <DropdownMenu aria-label="Dropdown Variants" variant={'faded'}>
            <DropdownItem key="new">收藏</DropdownItem>
            <DropdownItem key="delete" className="text-danger" color="danger">
              移除
            </DropdownItem>
          </DropdownMenu>
        </Dropdown>
      </div>
      <CardFooter className="justify-between before:bg-white/10 border-white/20 border-1 overflow-hidden py-1 absolute before:rounded-xl rounded-large bottom-1 w-[calc(100%_-_8px)] shadow-small ml-1 z-10">
        <p className="text-tiny text-white/80">计算机科学与技术</p>
        <Button
          className="text-tiny text-white bg-black/20"
          color="default"
          radius="lg"
          size="sm"
          variant="flat"
        >
          提问
        </Button>
      </CardFooter>
    </Card>
  )
}

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
                <LessonCard></LessonCard>
              </CardBody>
            </>
          }
        </Card>

      </div>
    </div>
  )
};
export default Lesson