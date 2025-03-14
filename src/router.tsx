import { Navigate, RouteObject } from "react-router-dom";
import NotFound from "@/pages/NotFound";
import Login from "./pages/Login";
import Home from "./pages/Home";
import Info from "./pages/Info";
import Register from "./pages/Register";
import { lazy } from "react";

export const NotAuthRouterList = ["register", "login"];

export const router: RouteObject[] = [
  {
    path: "lesson",
    Component: lazy(() => import("./pages/Lesson")),
    id: "lesson",
  },
  {
    path: "chat/:id",
    Component: lazy(() => import("./pages/ChatAI")),
    id: "chatai",
  },
  {
    path: "manage/:id",
    Component: lazy(() => import("./pages/Manage")),
    id: "manage",
  },
];

export const authRouter = (uGroup: string[]): RouteObject[] => {
  const _uGroup = uGroup.map((i) => i.toLocaleUpperCase());
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
      //@ts-ignore
      children: router
        .filter((i) => {
          return _uGroup.includes(i.id!.toLocaleUpperCase());
        })
        .map((i) => {
          return {
            ...i,
            children: i?.children?.filter((i) => {
              return _uGroup.includes(i.id!.toLocaleUpperCase());
            }),
          };
        })
        .concat([
          //@ts-ignore
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
