import React, {useState} from 'react';
import {Link} from "react-router-dom";

function Home() {

    const [isCreateClicked, setIsCreateClicked] = useState(false);
    const [isUploadClicked, setIsUploadClicked] = useState(false);

    const handleCreateClick = () => {
        setIsCreateClicked(true);
    };

    const handleUploadClick = () => {
        setIsUploadClicked(true);
    }

    return (
        <div className="App">
            <header className="App-header">
                <h1>CoReTM 2.0</h1>
                <p>Threat modeling with STRIDE-per-Interaction</p>
                <div className={"App-link"}>
                    <Link to={"/login"}>
                        <button className={"App-button"} name={"login"}>
                            Login
                        </button>
                    </Link>

                    <Link to="/signup">
                        <button className={"App-button"} name={"signup"}>
                            Sign Up
                        </button>
                    </Link>
                    <Link to={"/model"}>
                        <button className={"App-button"} name={"login"}>
                            Continue without login
                        </button>
                    </Link>
                </div>
            </header>
        </div>
    );
}

export default Home;
