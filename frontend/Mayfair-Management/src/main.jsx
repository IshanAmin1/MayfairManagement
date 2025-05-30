import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.jsx';
import {createBrowserRouter, RouterProvider } from "react-router-dom"
import { UserProvider } from './components/UserContext.jsx';
import GuestRoute from './components/GuestRoute.jsx';
import AuthForm from './components/AuthForm.jsx';
import BookingComponent from './components/BookingComponent.jsx';
import AllFacilities from './components/AllFacilities.jsx';
import OccupiedDatesDisplay from './components/OccupiedDatesDisplay.jsx';

const router = createBrowserRouter([


    {
        path: "/",
        element: <App> </App>,
        children: [
          {
            path: "/auth",
            element: <GuestRoute><AuthForm></AuthForm></GuestRoute>
          },
          {
            path: "/all-facilities",
            element: <AllFacilities></AllFacilities>
          },
          {
            path: "/my-bookings",
            element: <OccupiedDatesDisplay></OccupiedDatesDisplay>
          },
          {
            path: "/book-facility",
            element: <BookingComponent></BookingComponent>
          },
        ]
    },
]);

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <UserProvider>
        <RouterProvider router={router} />
    </UserProvider>
  </StrictMode>,
);
