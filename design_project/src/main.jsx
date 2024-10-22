import React from "react";
import ReactDOM from "react-dom/client";
import Home from "./Components/Home.jsx";
import { createBrowserRouter, RouterProvider, Outlet } from "react-router-dom";
import "./index.css";
import LeetCodeLogin from "./Components/Login.jsx";
import LeetCodePage from "./Components/LeetCodePage.jsx";
import Dashboard from "./Components/Dashboard2.jsx";
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
        element: <LeetCodeLogin />,
      },
      {
        path: "/signup",
        element: <LeetCodePage />,
      },
      {
        path: "/landingpage",
        element: <Dashboard />,
      },
    ],
  },
]);
const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<RouterProvider router={appRouter} />);
