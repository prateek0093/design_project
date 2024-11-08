import React from "react";
import ReactDOM from "react-dom/client";
import Home from "./Components/Home.jsx";
import { createBrowserRouter, RouterProvider, Outlet } from "react-router-dom";
import "./index.css";
import StudentLogin from "./Components/studentLogin.jsx";
import LeetCodePage from "./Components/SignUp.jsx";
import Dashboard from "./Components/studentDashboard.jsx";
import AuthorLogin from "./Components/authorLogin.jsx";
import AllCourses from "./Components/profDashboard.jsx";
import AddCourse from "./Components/AddCourses.jsx";
const App = () => {
  return (
    <div className="app">
      <Outlet />
    </div>
  );
};
const appRouter = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      {
        path: "",
        element: <Home />,
      },
      {
        path: "/login",
        element: <StudentLogin />,
      },
      {
        path: "/authorLogin",
        element: <AuthorLogin />,
      },
      {
        path: "/signup",
        element: <LeetCodePage />,
      },
      {
        path: "/studentDashboard",
        element: <Dashboard />,
      },
      {
        path: "/profDashboard",
        element: <AllCourses />,
      },
      {
        path: "/profDashboard/addCourses",
        element: <AddCourse />,
      },
    ],
  },
]);
const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<RouterProvider router={appRouter} />);
