import React, {useEffect, useRef, useState} from 'react';

import CORSCommunicator from '../DrawIO/CORSCommunicator';
import LocalStorageModel from '../DrawIO/LocalStorageModel';
import DrawioController from "../DrawIO/DrawioController";

import { ICrossingElements } from "../interfaces/DrawioInterfaces";

import {Box, Button} from "@mui/material";
import OverviewTable from './OverviewTable';
import TablesController from "../DrawIO/TablesController";
import {IOverviewTableRow, IThreatTableRow} from "../interfaces/TableInterfaces";
import ThreatTables from "./ThreatTables";


function DrawIO({ sendDiagram }: { sendDiagram: (diagram: string | null) => void }) {
    let iframeRef = useRef<HTMLIFrameElement>(null);
    let [initialized, setInitialized] = useState(false);

    let [drawioController, setDrawioController] = useState<DrawioController | null>(null);
    let [tablesController, setTablesController] = useState<TablesController | null>(null);
    let [crossingElements, setCrossingElements] = useState<ICrossingElements[] >([]);

    let [showDrawio, setShowDrawio] = useState(true);
    let [showOverviewTable, setShowOverviewTable] = useState(false);
    let [showThreatTable, setShowThreatTable] = useState(false);

    useEffect(() => {
        if (!initialized) {
            const localStorageModel = new LocalStorageModel();
            setInitialized(true);

            const drawioView = new CORSCommunicator(iframeRef.current);
            const stateController = new DrawioController(drawioView, localStorageModel);
            const tablesController = new TablesController(localStorageModel);
            setTablesController(tablesController);
            setDrawioController(stateController)

            localStorageModel.observe(function(diagram: string) {
                sendDiagram(diagram)
            })
            sendDiagram(localStorageModel.read())
        }
    }, [sendDiagram]);

    function handleClickAnalyseEvent() {
        setCrossingElements(drawioController!.parseXml());
        setShowOverviewTable(true);
    }

    function handleClickNextEvent() {
        setShowDrawio(false);
        setShowThreatTable(true);
    }
    function handleSaveOverviewTable(data: IOverviewTableRow[]){
        const threatTables: IThreatTableRow[][] = tablesController!.parseOverviewTable(data);
        setShowThreatTable(true);
    }

    function handleSaveThreatTable(data: IThreatTableRow[][]){
        tablesController!.setThreatTables(data);
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
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', marginTop: '8px', marginBottom: '8px' }}>
                    <Button variant="contained" color="primary" onClick={handleClickAnalyseEvent}>Analyse</Button>
                </Box>
            }
            {showOverviewTable &&
                    <Box>
                        <OverviewTable
                            crossingElements={crossingElements}
                            onSave={handleSaveOverviewTable}
                        />
                    </Box>
            }
            {showThreatTable &&
                <Box>
                   <ThreatTables threatTables={tablesController!.getThreatTables()} onSave={handleSaveThreatTable}/>
                </Box>
            }
        </Box>
    );
}

export default DrawIO;
