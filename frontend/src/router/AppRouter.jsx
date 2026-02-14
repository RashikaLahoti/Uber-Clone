import React from 'react'
import { createBrowserRouter, RouterProvider } from 'react-router';
import AuthLayout from '../layouts/AuthLayout';
import HomeLayout from '../layouts/HomeLayout';

const AppRouter = () => {

    const router = createBrowserRouter([
        {
            path: '/',
            element:<AuthLayout />
        },
        {
          path: '/home',
          element:<HomeLayout/>
        }
    ])
  return (
    <RouterProvider router={router} />
  )
}

export default AppRouter