import { createBrowserRouter, RouterProvider, Navigate } from "react-router";
import RootLayout from "@/layouts/RootLayout";
import Home from "@/pages/Home/Home";
import Jubo from "@/pages/Jubo/Jubo";
import Church from "@/pages/Church/Church";
import Events from "@/pages/Events/Events";
import EventDetail from "@/pages/Events/EventDetail";
import Gallery from "@/pages/Gallery/Gallery";
import Bible from "@/pages/Bible/Bible";
import BibleRead from "@/pages/BibleRead/BibleRead";
import BibleWrite from "@/pages/BibleWrite/BibleWrite";
import Login from "@/pages/Login/Login";
import Register from "@/pages/Register/Register";
import MyPage from "@/pages/MyPage/MyPage";
import PageNotFound from "@/pages/PageNotFound/PageNotFound";

const router = createBrowserRouter([
  {
    path: "/",
    element: <RootLayout />,
    children: [
      { index: true, element: <Home /> },
      { path: "주보", element: <Jubo /> },
      { path: "교회소개", element: <Church /> },
      { path: "교회행사", element: <Events /> },
      { path: "교회행사/:id", element: <EventDetail /> },
      { path: "갤러리", element: <Gallery /> },
      { path: "말씀", element: <Bible /> },
      { path: "말씀/읽기", element: <BibleRead /> },
      { path: "말씀/필사", element: <BibleWrite /> },
      { path: "login", element: <Login /> },
      { path: "register", element: <Register /> },
      { path: "mypage", element: <MyPage /> },
      { path: "*", element: <PageNotFound /> },
    ],
  },
]);

function App() {
  return <RouterProvider router={router} />;
}

export default App;
