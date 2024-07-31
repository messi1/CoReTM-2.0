import React, {useEffect, useRef, useState} from 'react';

import CORSCommunicator from '../DrawIO/CORSCommunicator';
import LocalStorageModel from '../DrawIO/LocalStorageModel';
import DrawioController from "../DrawIO/DrawioController";

import { ICrossingElements } from "../interfaces/DrawioInterfaces";

import {Box, Button} from "@mui/material";
import OverviewTable from './OverviewTable';
import TablesController from "../DrawIO/TablesController";
import {IOverviewTableRow, IThreatTableRow} from "../interfaces/TableRowInterfaces";
import ThreatTables from "./ThreatTables";
import theme from "../utils/theme";
import {ThemeProvider} from "@mui/material/styles";

interface DrawIOProps {
    sendDiagram: (diagram: string | null) => void;
    projectName: string;
}

function DrawIO({ sendDiagram, projectName }: DrawIOProps) {
    let iframeRef = useRef<HTMLIFrameElement>(null);
    let [initialized, setInitialized] = useState(false);

    let [drawioController, setDrawioController] = useState<DrawioController | null>(null);
    let [tablesController, setTablesController] = useState<TablesController | null>(null);
    let [crossingElements, setCrossingElements] = useState<ICrossingElements[] >([]);

    let [showDrawio, setShowDrawio] = useState(true);
    let [showOverviewTable, setShowOverviewTable] = useState(false);
    let [showThreatTable, setShowThreatTable] = useState(false);
    let [showDownloadButton, setShowDownloadButton] = useState(false);

    useEffect(() => {
        if (!initialized) {
            const localStorageModel = new LocalStorageModel();
            setInitialized(true);

            const drawioView = new CORSCommunicator(iframeRef.current);
            const stateController = new DrawioController(drawioView, localStorageModel, projectName);
            const tablesController = new TablesController(localStorageModel);
            setTablesController(tablesController);
            setDrawioController(stateController)

            localStorageModel.observe(function(diagram: string) {
                sendDiagram(diagram)
            })
            sendDiagram(localStorageModel.read())
        }
    }, [initialized, projectName, sendDiagram]);

    function handleClickAnalyseEvent() {
        const {crossingElements, invalidDataflows} = drawioController!.parseXml();
        setCrossingElements(crossingElements);
        if (crossingElements.length > 0) {
            if (!invalidDataflows) {
                setShowOverviewTable(true);
            }
        } else {
            alert("There are no dataflows crossing a trust boundary. Therefore STRIDE-per-Interaction cannot be applied.");
        }
    }

    function handleSaveOverviewTable(data: IOverviewTableRow[]){
        tablesController!.parseOverviewTable(data);
        setShowThreatTable(true);
    }

    function handleSaveThreatTable(data: IThreatTableRow[][]){
        tablesController!.setThreatTables(data);
        setShowDownloadButton(true);
    }

    function downloadLocalStorageAsJSON() {

        const localStorageData : any = {
            'ProjectName': projectName,
            'Diagram': JSON.parse(localStorage.getItem('DrawioMsg')!).xml,
            'OverviewTable': localStorage.getItem('OverviewTable') || '[]',
            'ThreatTables': localStorage.getItem('ThreatTables') || '[]'
        }

        const jsonString = JSON.stringify(localStorageData, null, 1);
        const blob = new Blob([jsonString], { type: 'application/json' });
        const link = document.createElement('a');

        link.href = URL.createObjectURL(blob);
        link.download = `${projectName}.json`;
        link.click();

        URL.revokeObjectURL(link.href);
    }

    return (
        <ThemeProvider theme={theme}>
            <Box sx={{ width: '100%', height: '100%' }}>
                {showDrawio && <iframe
                    ref={iframeRef}
                    width="100%"
                    height="700"
                    src="https://embed.diagrams.net/?embed=1&ui=dark&spin=1&proto=json&configure=1&noExitBtn=1&saveAndExit=0&noSaveBtn=1&noExitBtn=1"
                    style={{ border: 'none' }}
                    title="draw.io"
                />
                }
                {!showOverviewTable &&
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', marginTop: '8px', marginBottom: '8px' }}>
                        <Button variant="contained" color="secondary" onClick={handleClickAnalyseEvent}>Analyse</Button>
                    </Box>
                }
                {showOverviewTable &&
                    <OverviewTable
                        crossingElements={crossingElements}
                        onSave={handleSaveOverviewTable}
                    />
                }
                {showThreatTable &&
                    <ThreatTables threatTables={tablesController!.getThreatTables()} onSave={handleSaveThreatTable}/>
                }
                {showDownloadButton &&
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', marginTop: '16px', marginBottom: '8px' }}>
                        <Button variant="contained" color="secondary" onClick={downloadLocalStorageAsJSON}>Download</Button>
                    </Box>
                }
            </Box>
        </ThemeProvider>
    );
}

export default DrawIO;
