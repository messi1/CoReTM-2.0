import { IThreatTableRow } from "../interfaces/TableInterfaces";

import Paper from "@mui/material/Paper";
import Table from "@mui/material/Table";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import TableCell from "@mui/material/TableCell";
import TableBody from "@mui/material/TableBody";
import {Box, Button, TextField} from "@mui/material";
import TableContainer from "@mui/material/TableContainer";
import React, {useEffect, useRef, useState} from "react";


export default function ThreatTables({ threatTables, onSave } : { threatTables: IThreatTableRow[][], onSave: (data: IThreatTableRow[][]) => void }) {
    const [threatTable, setThreatTable] = useState<IThreatTableRow[][]>(threatTables);
    const [saveClicked, setSaveClicked] = useState(false);
    const lookupMapRef = useRef<Record<string, IThreatTableRow>>({});

    useEffect(() => {
        const generateLookupMap = (table: IThreatTableRow[][]) => {
            const map: Record<string, IThreatTableRow> = {};
            table.forEach((rows, index) => {
                rows.forEach(row => {
                    map[`${index}-${row.threatId}`] = row;
                });
            });
            return map;
        };
        lookupMapRef.current = generateLookupMap(threatTable);
    }, []);

    const handleThreatChange = (index: number, threatId: string, value: string): void => {
        setThreatTable((prev) => {
            const newTable = [...prev];
            const key = `${index}-${threatId}`;
            if (lookupMapRef.current[key]) {
                lookupMapRef.current[key].threat = value;
            }
            return newTable;
        });
    };

    const handleMitigationChange = (index: number, threatId: string, value: string): void => {
        setThreatTable((prev) => {
            const newTable = [...prev];
            const key = `${index}-${threatId}`;
            if (lookupMapRef.current[key]) {
                lookupMapRef.current[key].mitigation = value;
            }
            return newTable;
        });
    };

    const handleValidationChange = (index: number, threatId: string, value: string): void => {
        setThreatTable((prev) => {
            const newTable = [...prev];
            const key = `${index}-${threatId}`;
            if (lookupMapRef.current[key]) {
                lookupMapRef.current[key].validation = value;
            }
            return newTable;
        });
    };

    const handleSave = () => {
        const hasEmptyFields = threatTable.some(rows => rows.some(row => row.threat.trim() === '' || row.mitigation.trim() === '' || row.validation.trim() === ''));
        if (hasEmptyFields) {
            alert("Please fill in all fields before saving.");
            return;
        }
        onSave(threatTable);
        setSaveClicked(true);
    };

    return (
        <Box sx={{marginTop: '8px'}}>
            {threatTables.map((table, index) => (
                <TableContainer  key={index} component={Paper} sx={{marginTop: '8px'}}>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell align="center">Threat ID</TableCell>
                                <TableCell align="center">Dataflow ID</TableCell>
                                <TableCell align="center">STRIDE Type</TableCell>
                                <TableCell align="center">Threat</TableCell>
                                <TableCell align="center">Mitigation</TableCell>
                                <TableCell align="center">Validation</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {table.map((row) => (
                                <TableRow key={row.threatId}>
                                    <TableCell align="center">{row.threatId}</TableCell>
                                    <TableCell align="center">{row.dataflowId}</TableCell>
                                    <TableCell align="center">{row.strideType}</TableCell>
                                    <TableCell align="center">
                                        <TextField
                                            size="small"
                                            variant="outlined"
                                            placeholder="Describe threat"
                                            value={row.threat}
                                            onChange={(event) => handleThreatChange(index, row.threatId, event.target.value)}/>
                                    </TableCell>
                                    <TableCell align="center">
                                        <TextField
                                            size="small"
                                            variant="outlined"
                                            placeholder="Provide mitigation"
                                            value={row.mitigation}
                                            onChange={(event) => handleMitigationChange(index ,row.threatId, event.target.value)}/>
                                    </TableCell>
                                    <TableCell align="center">
                                        <TextField
                                            size="small"
                                            variant="outlined"
                                            placeholder="Provide validation"
                                            value={row.validation}
                                            onChange={(event) => handleValidationChange(index, row.threatId, event.target.value)}/>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            ))}
            {!saveClicked &&
                <Box sx={{display: 'flex', justifyContent: 'flex-end', marginTop: '8px'}}>
                    <Button variant="contained" color="primary" onClick={handleSave}>Save</Button>
                </Box>
            }
        </Box>
    );
}
