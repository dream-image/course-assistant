import { Button } from '@nextui-org/react'
import { useContext, useEffect, useState } from 'react'
import { createBrowserRouter, RouterProvider, useNavigate, useParams } from 'react-router-dom'
import { router } from './router'
import { UserInfoContext } from './context/UserInfoContext'
import { UserInfo } from './types'
import { get } from './common/request'
import { getUserInfo } from './api'


function App() {
  const [userInfo, setUserInfo] = useState<UserInfo>({} as UserInfo)
  const init = async () => {
    try {
      const res = await getUserInfo()
      setUserInfo({ ...res.data, hasLogin: true })
      console.log('res', res);
      console.log('已登录');

    } catch (error: any) {
      const msg = error?.error_msg || error?.message
      console.log(msg);
      location.replace('/login')
    }

  }
  useEffect(() => {
    if (userInfo.hasLogin || /\/login$/.test(window.location.pathname)) return
    init()
  }, [])

  return (
    <>
      <UserInfoContext.Provider value={{ ...userInfo, setUserInfoContext: setUserInfo }}>

        <RouterProvider router={createBrowserRouter(router)}>

        </RouterProvider>

      </UserInfoContext.Provider >
    </>
  )
}

export default App
