import { Button, Spinner } from '@nextui-org/react'
import { Suspense, useContext, useEffect, useState } from 'react'
import { createBrowserRouter, RouterProvider, useNavigate, useParams } from 'react-router-dom'
import { authRouter, router } from './router'
import { UserInfoContext } from './context/UserInfoContext'
import { UserInfo } from './types'
import { get } from './common/request'
import { getUserInfo, refreshToken } from './api'
import { autoRefreshToken } from './utils/autoRefreshToken'
import { message } from 'antd'


function App() {
  const [userInfo, setUserInfo] = useState<UserInfo>({} as UserInfo)
  const [isLoading, setIsLoading] = useState(true)
  const init = async () => {
    try {
      setIsLoading(true)
      const res = await getUserInfo()
      setUserInfo({ ...res.data, hasLogin: true })
      console.log('res', res);
      console.log('已登录');
      autoRefreshToken()
    } catch (error: any) {
      const msg = error?.error_msg || error?.message
      console.log(msg);
      message.error({ content: msg })
      setTimeout(() => {
        location.replace('/login')
      }, 1000);
    }
    setIsLoading(false)
  }
  useEffect(() => {
    if (userInfo.hasLogin || /\/login$/.test(window.location.pathname)) {
      setIsLoading(false)
      return
    }
    init()
  }, [])

  return (
    <>{
      isLoading ? <Spinner></Spinner> : (
        <UserInfoContext.Provider value={{
          userInfo, setUserInfoContext: (props) => {
            setUserInfo(props)
          }
        }}>
          <RouterProvider
            router={createBrowserRouter(authRouter(userInfo.uGroup ?? []))}>
          </RouterProvider>

        </UserInfoContext.Provider >
      )
    }
    </>
  )
}

export default App
