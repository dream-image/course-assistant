import Logo from '@/assets/404.svg'
import { Button, Image, Tab, Tabs } from '@nextui-org/react'
import { useNavigate } from 'react-router-dom'
const Lesson = () => {
  const navigate = useNavigate()
  return (
    <div className='absolute flex justify-center top-[76px]' style={{
      height:`calc(100vh - 76px)`,
      width: '100vw',
    }}>
      <div className=' w-[1680px] h-full flex ml-4'>
        <div className='h-full hover:bg-indigo-50 w-max rounded-xl'>
          <Tabs aria-label="Options" variant="light" isVertical={true}>
            <Tab key="center" title="课程中心">

            </Tab>
            <Tab key="myLesson" title="我的课程">

            </Tab>

          </Tabs>
        </div>
      </div>

    </div>
  )
};
export default Lesson