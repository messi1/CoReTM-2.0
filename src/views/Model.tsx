import React, {useState} from 'react';
import DrawIO from "../components/DrawIO";
import '../styles/App.css';

function Model() {
    const [diagram, setDiagram] = useState({})


    const receiveDiagram = (diagram: any) => {
        setDiagram(diagram);
    };

    return (
        <div>
            <DrawIO sendDiagram={receiveDiagram}/>
        </div>
    );
}

export default Model;
