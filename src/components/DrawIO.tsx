import React, {useEffect, useRef, useState} from 'react';

import CORSCommunicator from '../DrawIO/CORSCommunicator';
import LocalStorageModel from '../DrawIO/LocalStorageModel';
import DrawioController from "../DrawIO/DrawioController";
import '../styles/Model.css';
import {IDFDElement} from "../interfaces/IDFDElement";


function DrawIO({ sendDiagram }: { sendDiagram: (diagram: string | null) => void }) {
    let iframeRef = useRef<HTMLIFrameElement>(null);
    let [initialized, setInitialized] = useState(false);
    let [drawioController, setDrawioController] = useState<DrawioController | null>(null);

    useEffect(() => {
        if (!initialized) {
            const localStorageModel = new LocalStorageModel();

            setInitialized(true);

            const drawioView = new CORSCommunicator(iframeRef.current);
            const stateController = new DrawioController(drawioView, localStorageModel);
            setDrawioController(stateController)

            localStorageModel.observe(function(diagram: string) {
                sendDiagram(diagram)
            })
            sendDiagram(localStorageModel.read())
        }
    }, [sendDiagram]);

    function handleClickEvent() {
        const xmlDoc : XMLDocument | null = drawioController!.returnXMLDocument()
        let DFDArray : Array<IDFDElement> = []
        if (xmlDoc) {
            DFDArray = drawioController!.returnArrayOfDfdElements(xmlDoc)
        } else {
            alert("No diagram found")
        }
        console.log(DFDArray)
    }

    return (
        <div className={"Model"}>
            <iframe
                ref={iframeRef}
                width="100%"
                height="100%"
                src="https://embed.diagrams.net/?embed=1&ui=dark&spin=1&proto=json&configure=1&noExitBtn=1&saveAndExit=0&noSaveBtn=1&noExitBtn=1"
                style={{border: 'none'}}
                title={'draw.io'}
            />
            <button className={"nextButton"} onClick={handleClickEvent}>Next</button>
        </div>
    );
}

export default DrawIO;
