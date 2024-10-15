import React from "react";
import ReactDOM from "react-dom/client";
import Home from "./Home.jsx";
import { createBrowserRouter, RouterProvider, Outlet } from "react-router-dom";
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
    ],
  },
]);
const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<RouterProvider router={appRouter} />);
