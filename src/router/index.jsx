import { createBrowserRouter } from 'react-router-dom';
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
import Profile from "../pages/Profile/Profile";
import ProtectedRoute from './ProtectedRoute';
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
      { index: true,      Component: Home      },
      { path: 'login',    Component: Login     },
      { path: 'register', Component: Register  },
      { path: 'community',Component: Community },
      { path: 'info/:id', Component: Event     },
    ],
  },
  {
    path: '/home',
    element: (
      <ProtectedRoute>
        <Layout />
      </ProtectedRoute>
    ),
    children: [
      { path: 'regEvent', Component: RegEvent },
      { path: 'panel',    Component: Panel    },
      { path: 'tickets',  Component: Tickets  },
      { path: 'qr',       Component: Qr       },
      { path: 'profile',  Component: Profile  },
      { path: 'prueba',   Component: Prueba   },
    ],
  },
]);