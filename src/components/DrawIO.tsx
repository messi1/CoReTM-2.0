import React, { useEffect, useRef } from 'react';

import CORSCommunicator from '../DrawIO/CORSCommunicator';
import LocalStorageModel from '../DrawIO/LocalStorageModel';
import DrawioController from "../DrawIO/DrawioController";


// @ts-ignore
function DrawIO({ sendDiagram }) {
    const iframeRef = useRef(null);

    const initialized = useRef(false);
    useEffect(() => {
        if (!initialized.current) {
            var localStorageModel = new LocalStorageModel()
            try {
                var selectedModel = localStorage.getItem('selectedModel')
                // @ts-ignore
                var loaded = JSON.parse(localStorage.getItem('storedModels')) || []
            } catch (error) {
                loaded = []
            }
            var selectedStoreModel = loaded.find((m: { id: string | null; }) => m.id === selectedModel)
            if (selectedStoreModel.diagram) {
                localStorageModel.write(selectedStoreModel.diagram)
            } else {
                localStorage.removeItem('diagram')
            }

            initialized.current = true
            var drawioView = new CORSCommunicator(iframeRef.current)
            var stateController = new DrawioController(drawioView, localStorageModel)
            localStorageModel.observe(function(diagram: any) {
                sendDiagram(diagram)
                selectedStoreModel.diagram = diagram
                localStorage.setItem('storedModels', JSON.stringify(loaded))
            })
            sendDiagram(localStorageModel.read())
        }
    }, [sendDiagram]);

    return (
        <iframe
            ref={iframeRef}
            width="100%"
            height="100%"
            src="https://embed.diagrams.net/?embed=1&ui=dark&spin=1&proto=json&configure=1&noExitBtn=1&saveAndExit=0&noSaveBtn=1&noExitBtn=1"
            style={{ border: 'none' }}
            title={'draw.io'}
        />
    );
}

export default DrawIO;
