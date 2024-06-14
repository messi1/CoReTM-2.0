import React, {useState} from 'react';
import DrawIO from "../components/DrawIO";
import '../styles/Model.css'

function Model() {
    const [diagram, setDiagram] = useState({})


    const receiveDiagram = (diagram: any) => {
        setDiagram(diagram);
    };

    return (
        <div className={"Model"}>
            <h2>Create your DFD Model here</h2>
            <DrawIO sendDiagram={receiveDiagram}/>
        </div>
    );
}

export default Model;
