import React, {useState} from 'react';
import {Link} from "react-router-dom";
import '../styles/Home.css';

function Home() {

    return (
        <div className="Home">
            <header className="Home-header">
                <h1>CoReTM 2.0</h1>
                <p>Threat modeling with STRIDE-per-Interaction</p>
            </header>
            <div className={"Home-link"}>
                <Link to={"/login"}>
                    <button className={"Home-button"} id={"Home-button-1"} name={"login"}>
                        Login
                    </button>
                </Link>
                <Link to="/signup">
                    <button className={"Home-button"} id={"Home-button-2"} name={"signup"}>
                        Sign Up
                    </button>
                </Link>
                <Link to={"/model"}>
                    <button className={"Home-button"} id={"Home-button-3"} name={"login"}>
                        Continue without login
                    </button>
                </Link>
            </div>
        </div>
    );
}

export default Home;
