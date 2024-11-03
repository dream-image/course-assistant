import { RouteObject } from "react-router-dom"
import NotFound from "@/pages/NotFound";
import Login from "./pages/Login";
import ChartAI from "./pages/ChartAI";
import Lesson from "./pages/Lesson";
import Manage from "./pages/Manage";

export const router: RouteObject[] = [
  {
    path: "/",
    loader: () => {
      return { redirect: "/home" }
    }
  },
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: '/chartai',
    element: <ChartAI />
  },
  {
    path: '/lesson',
    element: <Lesson />
  },
  {
    path: '/manage',
    element: <Manage />
  },
  {
    path: "/*",
    element: <NotFound />,
  },
]
