import React from "react";
import {createBrowserRouter, RouterProvider} from "react-router-dom";
import Home from "./views/Home";
import Model from "./views/Model";
import NotFound from "./views/NotFound";
import Import from "./views/Import";



const router = createBrowserRouter([
    {
        path: "/",
        element: <Home />,
        errorElement: <NotFound />
    },
    {
        path: "/import",
        element: <Import />
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
