import React, {useState} from "react";
import './styles/App.css';
import {createBrowserRouter, RouterProvider} from "react-router-dom";
import Home from "./views/Home";
import Login from "./views/Login";
import Signup from "./views/Signup";
import Model from "./views/Model";
import NotFound from "./views/NotFound";


const router = createBrowserRouter([
    {
        path: "/",
        element: <Home />,
        errorElement: <NotFound />
    },
    {
        path: "/login",
        element: <Login />
    },
    {
        path: "/signup",
        element: <Signup />
    },
    {
        path: "/model",
        element: <Model />
    }
]);

function App() {

    return (
        <RouterProvider router={router} />
    );
}

export default App;
