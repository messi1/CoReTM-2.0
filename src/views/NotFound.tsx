import React from 'react';
import { Link } from "react-router-dom";

function NotFound() {
    return (
        <div>
            <div>404 Not Found</div>
            <button>
                <Link to={"/"}>Home </Link>
            </button>
        </div>
    );
}

export default NotFound;
