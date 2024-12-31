import welcome from '@/assets/欢迎.svg'
import { Button, Image, Input, Link } from '@nextui-org/react'
import { useNavigate } from 'react-router-dom'
import Background from '@/assets/背景图.jpg'
import { useContext, useEffect, useRef, useState } from 'react'
import { getUserInfo, login } from '@/api'
import { message } from 'antd'
import { LoginInfo } from '@/api/type'
import { setToken } from '@/utils'
import { UserInfo } from '@/types'
import { UserInfoContext } from '@/context/UserInfoContext'
import styles from './style.module.css'
import { autoRefreshToken } from '@/utils/autoRefreshToken'
const Login = () => {

  const { setUserInfoContext, } = useContext(UserInfoContext)
  const [loginInfo, setLoginInfo] = useState<LoginInfo>()
  const [userInfo, setUserInfo] = useState<UserInfo>()
  const passwordRef = useRef<HTMLInputElement>(null)
  const navigate = useNavigate()
  const loginFn = async () => {
    try {
      if (!loginInfo?.password && !loginInfo?.username) {
        message.error('请填写密码和用户名')
        return
      }
      const res = await login(loginInfo)

      setUserInfo({ ...res.data?.data, hasLogin: true })
      setUserInfoContext({ ...res.data?.data, hasLogin: true })
      setToken(res.headers['authorization'])
      autoRefreshToken()
      message.success('登录成功')
      console.log('res', res.data);

      navigate('/ai')
    } catch (error: any) {
      const msg = error.error_msg || error.message
      console.log(msg)
    }
  }


  return (
    <div className='grid grid-cols-2 h-screen min-w-[800px] animate-opacity'>
      <div className=' w-full   flex flex-col  items-center '>
        <div className='flex  items-center w-96'>
          <Image src="/public/logo.svg" alt="天书" width={50} height={50} />
          <span className='font-semibold font-kai text-2xl'>天书</span>
        </div>
        <div className=' h-[400px] flex-col mt-32 w-96 animate__animated  animate__bounceIn '>
          <div className='flex content-center w-full h-min mb-5'>
            <Image src={welcome} alt='欢迎' width={40} height={40}></Image>
            <span className='text-3xl align-bottom h-min my-auto font-bold'>Welcome!</span>
          </div>
          <div className='flex flex-col gap-3'>
            <Input type='text' autoComplete='on' className={styles['input-container']} variant='faded' labelPlacement='outside' placeholder='请输入用户名' label='用户名' value={loginInfo?.username} onChange={(e) => {
              setLoginInfo({
                ...loginInfo,
                username: e.target.value
              })
            }} autoFocus onKeyDown={(e) => {
              if (e.key === 'Enter') {
                passwordRef.current?.focus()
              }
            }}></Input>
            <Input variant='faded' type='password' labelPlacement='outside' placeholder='请输入密码' label='密码' onChange={(e) => {
              setLoginInfo({
                ...loginInfo,
                password: e.target.value
              })
            }} ref={passwordRef} onKeyDown={(e) => {
              if (e.key === 'Enter') {
                loginFn()
              }
            }}></Input>
          </div>
          <div className='w-full flex justify-between mt-2'>
            <Link className='text-sm text-sky-400 hover:text-sky-600 hover:cursor-pointer' onClick={()=>{
              navigate('/register')
            }}>注册</Link>
            <Link className='text-sm text-gray-500 hover:text-sky-600 hover:cursor-pointer' onClick={()=>{

            }}>忘记密码？</Link>
          </div>
          <div className='mt-2'>
            <Button color='primary' className="bg-gradient-to-tr from-blue-200 to-sky-500 text-white shadow-lg w-full" onClick={() => {
              loginFn()
            }}>登录</Button>
          </div>
        </div>
      </div>
      <div className='bg-gray-300 bg-cover blur-sm bg-no-repeat' style={{ backgroundImage: `url(${Background})` }}>
      </div>
    </div >
  )
};
export default Login;