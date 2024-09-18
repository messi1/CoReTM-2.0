import React, { useEffect, useRef, useState } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, Box, Button } from "@mui/material";
import { useNavigate } from "react-router-dom"; // Importiere useNavigate
import CORSCommunicator from '../DrawIO/CORSCommunicator';
import LocalStorageModel from '../DrawIO/LocalStorageModel';
import DrawioController from "../DrawIO/DrawioController";
import OverviewTable from './OverviewTable';
import TablesController from "../DrawIO/TablesController";
import { IOverviewTableRow, IThreatTableRow } from "../interfaces/TableRowInterfaces";
import ThreatTables from "./ThreatTables";
import theme from "../utils/theme";
import { ThemeProvider } from "@mui/material/styles";

interface DrawIOProps {
    sendDiagram: (diagram: string | null) => void;
    projectName: string;
}

export default function DrawIO({ sendDiagram, projectName }: DrawIOProps) {
    const iframeRef = useRef<HTMLIFrameElement>(null);
    const [initialized, setInitialized] = useState(false);
    const [drawioController, setDrawioController] = useState<DrawioController | null>(null);
    const [tablesController, setTablesController] = useState<TablesController | null>(null);
    const [drawioImage, setDrawioImage] = useState<HTMLImageElement | null>(null);
    const [overviewTable, setOverviewTable] = useState<IOverviewTableRow[]>([]);
    const [overviewTableImported, setOverviewTableImported] = useState(false);
    const [threatTables, setThreatTables] = useState<IThreatTableRow[][]>([]);
    const [showDrawio, setShowDrawio] = useState(true);
    const [showOverviewTable, setShowOverviewTable] = useState(false);
    const [showThreatTable, setShowThreatTable] = useState(false);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const navigate = useNavigate(); // Verwende useNavigate

    useEffect(() => {
        if (!initialized) {
            const localStorageModel = new LocalStorageModel();
            setInitialized(true);

            const drawioView = new CORSCommunicator(iframeRef.current);
            const stateController = new DrawioController(drawioView, localStorageModel, projectName);
            const tablesController = new TablesController();
            setTablesController(tablesController);
            setDrawioController(stateController);

            localStorageModel.observe((diagram: string) => {
                sendDiagram(diagram);
            });
            sendDiagram(localStorageModel.read());

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
            const { crossingElements, invalidDataflows } = drawioController!.parseXml();
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

    function handleSaveOverviewTable(overviewTable: IOverviewTableRow[], importedOverviewTableChanged: boolean) {
        tablesController!.setOverviewTable(overviewTable);
        const importedThreatTables = localStorage.getItem('ThreatTables');
        if (importedOverviewTableChanged && importedThreatTables) {
            tablesController!.updateThreatTable(JSON.parse(importedThreatTables));
            console.log("Imported overview table was changed");
            setThreatTables(tablesController!.getThreatTables());
            setShowThreatTable(true);
        } else if (importedOverviewTableChanged) {
            console.log("Imported overview table was changed");
            tablesController!.generateThreatTables()
            setThreatTables(tablesController!.getThreatTables());
            setShowThreatTable(true);
        } else if (importedThreatTables && overviewTableImported) {
            console.log("Threat tables were imported");
            setThreatTables(JSON.parse(importedThreatTables));
            setShowThreatTable(true);
        } else {
            console.log("Threat tables generated from overview table");
            tablesController!.generateThreatTables()
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
    }

    function clearLocalStorage() {
        localStorage.clear();
        setIsDialogOpen(false);
        navigate("/"); // Navigiere nach dem Löschen
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
                    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                        <img
                            src={drawioImage!.src}
                            alt="Dataflow Diagram"
                            style={{ maxWidth: '100%', maxHeight: '100%', height: 'auto', width: 'auto' }}
                        />
                    </Box>
                )}
                {showOverviewTable && (
                    <OverviewTable
                        overviewTable={overviewTable}
                        onSave={handleSaveOverviewTable}
                        overviewTableImported={overviewTableImported}
                    />
                )}
                {showThreatTable && <ThreatTables threatTables={threatTables} />}
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', marginTop: '16px', marginBottom: '8px', gap: '8px' }}>
                    {!showOverviewTable && (
                        <Button variant="contained" color="secondary" onClick={handleClickNextButton}>
                            Next
                        </Button>
                    )}
                    <Button variant="contained" color="secondary" onClick={downloadLocalStorageAsJSON}>
                        Download
                    </Button>
                    <Button variant="contained" color="secondary" onClick={() => setIsDialogOpen(true)}>
                        Home
                    </Button>
                </Box>
                <Dialog
                    open={isDialogOpen}
                    onClose={() => setIsDialogOpen(false)}
                    aria-labelledby="alert-dialog-title"
                    aria-describedby="alert-dialog-description"
                >
                    <DialogTitle id="alert-dialog-title">{"Are you sure you want to leave?"}</DialogTitle>
                    <DialogContent>
                        <DialogContentText id="alert-dialog-description">
                            Please note you will lose all your current progress.
                        </DialogContentText>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setIsDialogOpen(false)} color="primary">
                            Cancel
                        </Button>
                        <Button onClick={clearLocalStorage} color="primary" autoFocus>
                            Yes, I'm sure
                        </Button>
                    </DialogActions>
                </Dialog>
            </Box>
        </ThemeProvider>
    );
}
