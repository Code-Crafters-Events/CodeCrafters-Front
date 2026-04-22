import { createBrowserRouter } from "react-router-dom";
import Layout from "../layout/Layout";
import Home from "../pages/Home/Home";
import Community from "../pages/Community/Community";
import Register from "../pages/Register/Register";
import Login from "../pages/Login/Login";
import Event from "../pages/Event/Event";
import Panel from "../pages/Panel/Panel";
import Loading from "../components/organisms/LoadingScreen/LoadingScreen";
import Tickets from "../pages/PanelTickets/PanelTickets";
import Checkout from "../pages/Checkout/Checkout";
import Profile from "../pages/Profile/Profile";
import ProtectedRoute from "./ProtectedRoute";
import Privacy from "../pages/Privacy/Privacy";
import Success from "../pages/Validations/Success";
import { Component } from "react";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Loading,
  },
  {
    path: "/home",
    Component: Layout,
    children: [
      { index: true, Component: Home },
      { path: "login", Component: Login },
      { path: "register", Component: Register },
      { path: "community", Component: Community },
      { path: "info/:id", Component: Event },
      { path: "privacy", Component: Privacy },
    ],
  },
  {
    path: "/home",
    element: (
      <ProtectedRoute>
        <Layout />
      </ProtectedRoute>
    ),
    children: [
      { path: "panel", Component: Panel },
      { path: "my-tickets", Component: Tickets },
      { path: "checkout/:id", Component: Checkout },
      { path: "profile", Component: Profile },
      { path: "success", Component: Success },
    ],
  },
]);
