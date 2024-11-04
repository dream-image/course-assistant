import { Avatar, Button, Image } from '@nextui-org/react'
import { Outlet, useNavigate } from 'react-router-dom'
import background from '@/assets/background.png'
import Logo from '/public/logo.svg'
import image from '@/assets/头像.png'
import { useContext } from 'react'
import { UserInfoContext } from '@/context/UserInfoContext'
import { DownOutlined } from '@ant-design/icons'
const Home = () => {
  const navigate = useNavigate()
  const { userInfo } = useContext(UserInfoContext)
  return (
    <div className='bg-cover w-full h-full absolute' style={{ backgroundImage: `url(${background})` }}>

      <div className='absolute top-0 w-full h-[76px] border-b-1 border-blue-50 flex'>
        <div className='flex  items-center w-96 ml-4 h-full'>
          <Image src={Logo} alt="天书" width={50} height={50} />
          <span className='font-semibold font-kai text-2xl'>天书</span>
        </div>
        <div className='flex-1'></div>
        <div className='mr-6 h-full right-0 flex items-center gap-2 cursor-pointer'>
          <Avatar src={image} size='md' />
          <div className=' h-full flex items-center flex-1'>
            <div className='flex flex-col justify-center items-center'>
              <span className='text-[#1f1f1f] w-full text-sm'>{userInfo.nickname}</span>
              <span className='text-[#A5A5AB] w-full text-xs'>ID:{userInfo.userid}</span>
            </div>
            <DownOutlined style={{ fontSize: 10 }} />
          </div>
        </div>
      </div>

      <div></div>

      <Outlet ></Outlet>
    </div>
  )
};
export default Home