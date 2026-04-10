import React from "react";
import ReactDOM from "react-dom/client";
import { RouterProvider, useNavigate } from "react-router";
import { router } from "./router";
import { setNavigate } from "./router/navigator";

const AppWrapper = () => {
  const navigate = useNavigate();
  setNavigate(navigate);
  return <RouterProvider router={router} />;
};

ReactDOM.createRoot(document.getElementById("root")).render(<AppWrapper />);