import { Navigate, RouteObject } from "react-router-dom";
import NotFound from "@/pages/NotFound";
import Login from "./pages/Login";
import ChatAI from "./pages/ChatAI";
import Lesson from "./pages/Lesson";
import Manage from "./pages/Manage";
import Home from "./pages/Home";
import Info from "./pages/Info";
import Register from "./pages/Register";

export const NotAuthRouterList = ["register", "login"];

export const router: RouteObject[] = [
  {
    path: "chatai/:id",
    element: <ChatAI />,
    id: "chatai",
  },
  {
    path: "lesson",
    element: <Lesson />,
    id: "lesson",
  },
  {
    path: "manage",
    element: <Manage />,
    id: "manage",
  },
];

export const authRouter = (uGroup: string[]): RouteObject[] => {
  const baseRouter: RouteObject[] = [
    {
      path: "/",
      element: <Navigate to={"/ai"} replace />,
    },
    {
      path: "/login",
      element: <Login />,
    },
    {
      path: "/register",
      element: <Register />,
    },
    {
      path: "/ai",
      element: <Home />,
      children: router
        .filter((i) => {
          return uGroup
            .map((i) => i.toLocaleUpperCase())
            .includes(i.id!.toLocaleUpperCase());
        })
        .concat([
          {
            path: "info",
            element: <Info />,
          },
        ]),
    },
    {
      path: "/*",
      element: <NotFound />,
    },
  ];

  return baseRouter;
};
