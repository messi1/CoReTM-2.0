import React, {useState} from "react";
import './styles/App.css';
import DrawIO from "./components/DrawIO";

function App() {
    const [isCreateClicked, setIsCreateClicked] = useState(false);
    const [isUploadClicked, setIsUploadClicked] = useState(false);
    const [diagram, setDiagram] = useState({})


    const receiveDiagram = (diagram: any) => {
        setDiagram(diagram);
    };

    const handleCreateClick = () => {
        setIsCreateClicked(true);
    };

    const handleUploadClick = () => {
        setIsUploadClicked(true);
    }


    return (
        <div className="App">
            <header className="App-header">
                {isCreateClicked ? (
                    <div>
                        <h1>Create New Threat Model</h1>
                        {/* Add more content or components as needed */}
                    </div>
                ) : isUploadClicked ? (
                    <div>
                        <h1>Upload Existing Threat Model</h1>
                        <p>Here you can upload an existing threat model...</p>
                        {/* Add file upload component or additional content here */}
                    </div>
                ) : (
                    <>
                        <h1>CoReTM 2.0</h1>
                        <p>Threat modeling with STRIDE-per-Interaction</p>
                        <button className="App-button" name="create" onClick={handleCreateClick}>Create</button>
                        {/* <button className="App-button" name="upload" onClick={handleUploadClick}>Upload</button> */}
                    </>
                )}
            </header>
            <DrawIO sendDiagram={receiveDiagram} />
        </div>
    );
}

export default App;
