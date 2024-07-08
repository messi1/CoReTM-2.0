import React, {useState} from 'react';
import DrawIO from "../components/DrawIO";
import {ClimbingBoxLoader} from "react-spinners";
import Container from "@mui/material/Container";
import {Typography} from "@mui/material";

function Model() {
    let [diagram, setDiagram] = useState({})
    let [loading, setLoading] = useState(false)



    const receiveDiagram = (diagram: string | null) => {
        if (diagram) {
            setDiagram(diagram);
        }
    };

    return (
        <Container>
            <Typography variant="h3" component="h1" gutterBottom>
                Create your Dataflow Diagram
            </Typography>
            <DrawIO sendDiagram={receiveDiagram}/>

            <ClimbingBoxLoader color={"#21a1f1"} loading={loading}/>
        </Container>
    );
}

export default Model;
