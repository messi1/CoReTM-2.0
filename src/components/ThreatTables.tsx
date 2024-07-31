import { IThreatTableRow } from "../interfaces/TableRowInterfaces";
import React, { useEffect, useRef, useState } from "react";

import Table from "@mui/material/Table";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import TableCell from "@mui/material/TableCell";
import TableBody from "@mui/material/TableBody";
import { Box, Button, TextField, Typography, IconButton } from "@mui/material";
import TableContainer from "@mui/material/TableContainer";
import { ThemeProvider } from "@mui/material/styles";
import theme from "../utils/theme";
import AddCircleIcon from "@mui/icons-material/AddCircleOutline";
import RemoveCircleIcon from "@mui/icons-material/RemoveCircleOutline";

export default function ThreatTables({ threatTables, onSave }: { threatTables: IThreatTableRow[][], onSave: (data: IThreatTableRow[][]) => void }) {
    const [threatTable, setThreatTable] = useState<IThreatTableRow[][]>(threatTables);
    const [saveClicked, setSaveClicked] = useState(false);
    const lookupMapRef = useRef<Record<string, IThreatTableRow>>({});

    useEffect(() => {
        const generateLookupMap = (table: IThreatTableRow[][]) => {
            const map: Record<string, IThreatTableRow> = {};
            table.forEach((rows) => {
                rows.forEach(row => {
                    map[`${row.threatId}`] = row;
                });
            });
            return map;
        };
        lookupMapRef.current = generateLookupMap(threatTable);
    });

    const handleThreatChange = (index: number, threatId: string, value: string): void => {
        setThreatTable((prev) => {
            const newTable = [...prev];
            const key = threatId;
            if (lookupMapRef.current[key]) {
                lookupMapRef.current[key].threat = value;
            }
            return newTable;
        });
    };

    const handleMitigationChange = (index: number, threatId: string, value: string): void => {
        setThreatTable((prev) => {
            const newTable = [...prev];
            const key = threatId;
            if (lookupMapRef.current[key]) {
                lookupMapRef.current[key].mitigation = value;
            }
            return newTable;
        });
    };

    const handleValidationChange = (index: number, threatId: string, value: string): void => {
        setThreatTable((prev) => {
            const newTable = [...prev];
            const key = threatId;
            if (lookupMapRef.current[key]) {
                lookupMapRef.current[key].validation = value;
            }
            return newTable;
        });
    };

    const handleAddRow = (index: number, rowIndex: number) => {
        const currentRow = threatTable[index][rowIndex];
        const newRow: IThreatTableRow = {
            type: "ThreatRow",
            threatId: crypto.randomUUID(),
            dataflowEnumeration: currentRow.dataflowEnumeration,
            strideType: currentRow.strideType,
            threat: "",
            mitigation: "",
            validation: "",
            added: true
        };

        setThreatTable((prev) => {
            const newTable = [...prev];
            newTable[index] = [
                ...newTable[index].slice(0, rowIndex + 1),
                newRow,
                ...newTable[index].slice(rowIndex + 1),
            ];
            return newTable;
        });
        lookupMapRef.current[`${newRow.threatId}`] = newRow;
    };


    const handleDeleteRow = (index: number, rowIndex: number) => {
        setThreatTable((prev) => {
            const newTable = [...prev];
            newTable[index] = newTable[index].filter((_, i) => i !== rowIndex);
            delete lookupMapRef.current[`${threatTable[index][rowIndex].threatId}`];
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
        <ThemeProvider theme={theme}>
            <Box sx={{ marginTop: '8px' }}>
                <Typography variant={"h4"}>Threat Tables</Typography>
                {threatTable.map((table, index) => (
                    <TableContainer key={index}>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell align="center" sx={{ fontWeight: 'bold' }}>Threat ID</TableCell>
                                    <TableCell align="center" sx={{ fontWeight: 'bold' }}>Dataflow</TableCell>
                                    <TableCell align="center" sx={{ fontWeight: 'bold' }}>STRIDE Type</TableCell>
                                    <TableCell align="center" sx={{ fontWeight: 'bold' }}>Threat</TableCell>
                                    <TableCell align="center" sx={{ fontWeight: 'bold' }}>Mitigation</TableCell>
                                    <TableCell align="center" sx={{ fontWeight: 'bold' }}>Validation</TableCell>
                                    <TableCell></TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {table.map((row, rowIndex) => (
                                    <TableRow key={row.threatId}>
                                        <TableCell align="center">{row.threatId}</TableCell>
                                        <TableCell align="center">{row.dataflowEnumeration}</TableCell>
                                        <TableCell align="center">{row.strideType}</TableCell>
                                        <TableCell align="center">
                                            <TextField
                                                size="small"
                                                variant="outlined"
                                                placeholder="Describe threat"
                                                value={row.threat}
                                                onChange={(event) => handleThreatChange(index, row.threatId, event.target.value)} />
                                        </TableCell>
                                        <TableCell align="center">
                                            <TextField
                                                size="small"
                                                variant="outlined"
                                                placeholder="Provide mitigation"
                                                value={row.mitigation}
                                                onChange={(event) => handleMitigationChange(index, row.threatId, event.target.value)} />
                                        </TableCell>
                                        <TableCell align="center">
                                            <TextField
                                                size="small"
                                                variant="outlined"
                                                placeholder="Provide validation"
                                                value={row.validation}
                                                onChange={(event) => handleValidationChange(index, row.threatId, event.target.value)} />
                                        </TableCell>
                                        <TableCell align="center">
                                            {!row.added ? (
                                                <IconButton onClick={() => handleAddRow(index, rowIndex)}>
                                                    <AddCircleIcon />
                                                </IconButton>
                                            ) : (
                                                <IconButton onClick={() => handleDeleteRow(index, rowIndex)}>
                                                    <RemoveCircleIcon />
                                                </IconButton>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                ))}
                {!saveClicked &&
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', marginTop: '16px' }}>
                        <Button variant="contained" color="secondary" onClick={handleSave}>Save</Button>
                    </Box>
                }
            </Box>
        </ThemeProvider>
    );
}
