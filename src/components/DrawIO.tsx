import React, {useEffect, useRef, useState} from 'react';

import CORSCommunicator from '../DrawIO/CORSCommunicator';
import LocalStorageModel from '../DrawIO/LocalStorageModel';
import DrawioController from "../DrawIO/DrawioController";

import {Box, Button} from "@mui/material";
import OverviewTable from './OverviewTable';
import TablesController from "../DrawIO/TablesController";
import {IOverviewTableRow, IThreatTableRow} from "../interfaces/TableRowInterfaces";
import ThreatTables from "./ThreatTables";
import theme from "../utils/theme";
import {ThemeProvider} from "@mui/material/styles";
import {Link} from "react-router-dom";

interface DrawIOProps {
    sendDiagram: (diagram: string | null) => void;
    projectName: string;
}

/*
* TODO
*  - make interaction between overview table and threat tables dynamic
*/

export default function DrawIO({ sendDiagram, projectName }: DrawIOProps) {
    let iframeRef = useRef<HTMLIFrameElement>(null);
    let [initialized, setInitialized] = useState(false);

    let [drawioController, setDrawioController] = useState<DrawioController | null>(null);
    let [tablesController, setTablesController] = useState<TablesController | null>(null);
    let [drawioImage, setDrawioImage] = useState<HTMLImageElement | null>(null);

    let [overviewTable, setOverviewTable] = useState<IOverviewTableRow[]>([]);
    let [overviewTableImported, setOverviewTableImported] = useState(false);
    let [threatTables, setThreatTables] = useState<IThreatTableRow[][]>([]);


    let [showDrawio, setShowDrawio] = useState(true);
    let [showOverviewTable, setShowOverviewTable] = useState(false);
    let [showThreatTable, setShowThreatTable] = useState(false);
    let [downloadClicked, setDownloadClicked] = useState(false);

    useEffect(() => {
        if (!initialized) {
            const localStorageModel = new LocalStorageModel();
            setInitialized(true);

            const drawioView = new CORSCommunicator(iframeRef.current);
            const stateController = new DrawioController(drawioView, localStorageModel, projectName);
            const tablesController = new TablesController();
            setTablesController(tablesController);
            setDrawioController(stateController)

            localStorageModel.observe(function(diagram: string) {
                sendDiagram(diagram)
            })
            sendDiagram(localStorageModel.read())

            stateController.setImageReadyCallback((image) => {
                setDrawioImage(image);
                setShowDrawio(false);
            });
        }
    }, [initialized, projectName, sendDiagram]);

    function handleClickNextButton() {
        const importedOverviewTable = localStorage.getItem('OverviewTable');

        if (!drawioController!.getChangedAfterImported() && importedOverviewTable) {
            tablesController!.createOverviewTableFromImport(JSON.parse(importedOverviewTable));
            setOverviewTableImported(true);
            setOverviewTable(tablesController!.getOverviewTable());
            console.log("Diagram did not change after import and OverviewTable is present");
            drawioController!.exportDiagram();
            setShowOverviewTable(true);
        } else {
            console.log("Diagram did change after import or OverviewTable is not present");
            const {crossingElements, invalidDataflows} = drawioController!.parseXml();
            if (crossingElements.length > 0) {
                console.log("Invalid dataflows: ", invalidDataflows);
                if (!invalidDataflows) {
                    tablesController!.createOverviewTableFromDrawio(crossingElements);
                    setOverviewTable(tablesController!.getOverviewTable());
                    console.log("Diagram did change after import or overview table is not present");
                    drawioController!.exportDiagram();
                    setShowOverviewTable(true);
                }
            } else {
                console.log("There are no dataflows crossing a trust boundary");
                alert("There are no dataflows crossing a trust boundary. Therefore STRIDE-per-Interaction cannot be applied.");
            }
        }
    }

    function handleSaveOverviewTable(overviewTable: IOverviewTableRow[], importedOverviewTableChanged: boolean){
        tablesController!.setOverviewTable(overviewTable);
        const importedThreatTables = localStorage.getItem('ThreatTables');
        if (importedOverviewTableChanged) {
            console.log("Imported overview table was changed");
            setThreatTables(tablesController!.getThreatTables());
            setShowThreatTable(true);
        } else if (importedThreatTables && overviewTableImported) {
            console.log("Threat tables were imported");
            setThreatTables(JSON.parse(importedThreatTables));
            setShowThreatTable(true);
        } else {
            console.log("Threat tables generated from overview table");
            setThreatTables(tablesController!.getThreatTables());
            setShowThreatTable(true);
        }

    }

    function downloadLocalStorageAsJSON() {

        const drawioMsg = localStorage.getItem('DrawioMsg');

        let diagram = "";

        if (drawioMsg) {
            try {
                const parsedMsg = JSON.parse(drawioMsg);
                diagram = parsedMsg.xml || "";
            } catch (e) {
                console.error("Failed to parse DrawioMsg from localStorage:", e);
                diagram = "";
            }
        }

        const localStorageData: any = {
            'ProjectName': projectName,
            'Diagram': diagram,
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
        setDownloadClicked(true);
    }

    function clearLocalStorage() {
        localStorage.clear()
    }

    return (
        <ThemeProvider theme={theme}>
            <Box sx={{ width: '100%', height: '100%' }}>
                {showDrawio ? (
                    <iframe
                    ref={iframeRef}
                    width="100%"
                    height="700"
                    src="https://embed.diagrams.net/?embed=1&ui=dark&spin=1&proto=json&configure=1&noExitBtn=1&saveAndExit=0&noSaveBtn=1&noExitBtn=1"
                    style={{ border: 'none' }}
                    title="draw.io"
                    />
                ) : (
                    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
                        <img src={drawioImage!.src} alt="Dataflow Diagram" style={{
                            maxWidth: '100%',
                            maxHeight: '100%',
                            height: 'auto',
                            width: 'auto',
                        }} />
                    </Box>
                    )
                }
                {!showOverviewTable &&
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', marginTop: '8px', marginBottom: '8px' }}>
                        <Button variant="contained" color="secondary" onClick={handleClickNextButton}>Next</Button>
                    </Box>
                }
                {showOverviewTable &&
                    <OverviewTable
                        overviewTable={overviewTable}
                        onSave={handleSaveOverviewTable}
                        overviewTableImported={overviewTableImported}
                    />
                }
                {showThreatTable &&
                    <ThreatTables threatTables={threatTables} />
                }
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', marginTop: '16px', marginBottom: '8px', gap: '8px' }}>
                    <Button variant="contained" color="secondary" onClick={downloadLocalStorageAsJSON}>
                            Download
                    </Button>
                    {downloadClicked && (
                        <Link to={"/"} style={{ textDecoration: 'none' }}>
                            <Button variant="contained" color="secondary" onClick={clearLocalStorage}>
                                Home
                            </Button>
                        </Link>
                    )}
                </Box>
            </Box>
        </ThemeProvider>
    );
}
