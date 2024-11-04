import { Navigate, RouteObject } from "react-router-dom"
import NotFound from "@/pages/NotFound";
import Login from "./pages/Login";
import ChatAI from "./pages/ChatAI";
import Lesson from "./pages/Lesson";
import Manage from "./pages/Manage";
import Home from "./pages/Home";

export const router: RouteObject[] = [
  {
    path: 'chatai',
    element: <ChatAI />
  },
  {
    path: 'lesson',
    element: <Lesson />
  },
  {
    path: 'manage',
    element: <Manage />
  },

]

export const authRouter = (uGroup: string[]): RouteObject[] => {


  const baseRouter: RouteObject[] = [
    {
      path: "/login",
      element: <Login />,
    },
    {
      path: '/ai',
      element: <Home />,
      children: router.filter(i => {
        return uGroup.map(i => i.toLocaleUpperCase()).includes(i.path!.toLocaleUpperCase())
      })
    },
    {
      path: "/",
      element: <Navigate to={'/ai'} replace />
    },
    {
      path: "/*",
      element: <NotFound />,
    },
  ]

  return baseRouter


}
