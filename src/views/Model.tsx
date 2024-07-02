import React, {useEffect, useState} from 'react';
import DrawIO from "../components/DrawIO";
import '../styles/Model.css';
import {ClimbingBoxLoader} from "react-spinners";

function Model() {
    let [diagram, setDiagram] = useState({})
    let [loading, setLoading] = useState(false)



    const receiveDiagram = (diagram: string | null) => {
        if (diagram) {
            setDiagram(diagram);
        }
    };

    return (
        <div className={"Model"}>
            <h2>Create your model here</h2>
            <DrawIO sendDiagram={receiveDiagram}/>

            <ClimbingBoxLoader color={"#21a1f1"} loading={loading}/>
        </div>
    );
}

export default Model;
