import { createBrowserRouter } from "react-router";
import Layout from "../layout/Layout";
import Home from "../pages/Home/Home";
import Community from "../pages/Community/Community";
import Register from "../pages/Register/Register";
import Login from "../pages/Login/Login";
import Event from "../pages/Event/Event";
import RegEvent from "../pages/RegEvent/RegEvent";
import Panel from "../pages/Panel/UserPanel";
import Loading from "../components/organisms/LoadingScreen/LoadingScreen";
import Tickets from "../pages/PanelTickets/PanelTickets";
import Qr from "../pages/Qr/Qr";
import Prueba from "../pages/muestra";
import { Component } from "react";

export const router = createBrowserRouter([
  {
    path: '/',
    Component: Loading,
  },
  {
    path: '/home',
    Component: Layout,
    children: [
      { index: true, Component: Home },
      { path: "community", Component: Community },
      { path: "register", Component: Register },
      { path: "login", Component: Login },
      { path: "info/:id", Component: Event },
      { path: "regEvent", Component: RegEvent },
      { path: "panel", Component: Panel },
      { path: "tickets", Component: Tickets},
      { path: "qr",Component:Qr},
      { path: "prueba", Component: Prueba },
    ],
  },
]);