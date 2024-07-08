import React, {useEffect, useRef, useState} from 'react';

import CORSCommunicator from '../DrawIO/CORSCommunicator';
import LocalStorageModel from '../DrawIO/LocalStorageModel';
import DrawioController from "../DrawIO/DrawioController";

import { ICrossingElements } from "../interfaces/DrawioInterfaces";

import {Box, Button, Checkbox} from "@mui/material";
import OverviewTable from './OverviewTable';



function DrawIO({ sendDiagram }: { sendDiagram: (diagram: string | null) => void }) {
    let iframeRef = useRef<HTMLIFrameElement>(null);
    let [initialized, setInitialized] = useState(false);
    let [drawioController, setDrawioController] = useState<DrawioController | null>(null);
    let [crossingElements, setCrossingElements] = useState<ICrossingElements[] >([]);
    let [showOverviewTable, setShowOverviewTable] = useState(false);

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
        setCrossingElements(drawioController!.parseXml());
        setShowOverviewTable(true);
    }

    return (
        <Box sx={{ width: '100%', height: '100%' }}>
            <iframe
                ref={iframeRef}
                width="100%"
                height="700"
                src="https://embed.diagrams.net/?embed=1&ui=dark&spin=1&proto=json&configure=1&noExitBtn=1&saveAndExit=0&noSaveBtn=1&noExitBtn=1"
                style={{ border: 'none' }}
                title="draw.io"
            />
            {!showOverviewTable &&
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', p: 2 }}>
                    <Button variant="contained" color="primary" onClick={handleClickEvent}>Analyse</Button>
                </Box>
            }
            {showOverviewTable &&
                <Box>
                    <OverviewTable crossingElements={crossingElements} />
                </Box>
            }
        </Box>
    );
}

export default DrawIO;
