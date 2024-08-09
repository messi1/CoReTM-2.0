import React, {useEffect, useState} from "react";

import Table from "@mui/material/Table";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import TableCell from "@mui/material/TableCell";
import TableBody from "@mui/material/TableBody";
import {Box, Button, Checkbox, TextField, Typography} from "@mui/material";
import TableContainer from "@mui/material/TableContainer";
import theme from "../utils/theme";
import {ThemeProvider} from "@mui/material/styles";

import { IOverviewTableRow } from "../interfaces/TableRowInterfaces";



export default function OverviewTable({ overviewTable, onSave, overviewTableImported } : {
    overviewTable : IOverviewTableRow[],
    onSave: (data: IOverviewTableRow[], importedOverviewTableChanged : boolean) => void,
    overviewTableImported: boolean }) {

    const [overviewTableState, setOverviewTableState] = useState<IOverviewTableRow[]>([]);
    const [saveClicked, setSaveClicked] = useState(false);
    const [importedTableChanged, setImportedTableChanged] = useState(false);


    useEffect(() => {
        setOverviewTableState(overviewTable);
        console.log("Was the overview table imported: ->", overviewTableImported);
    }, [overviewTable]);


    const handleDescriptionChange = (index: number, value: string) => {
        const updatedData = [...overviewTableState];
        updatedData[index].description = value;
        setOverviewTableState(updatedData);
        if (overviewTableImported) {
            setImportedTableChanged(true);
        }
        localStorage.setItem("OverviewTable", JSON.stringify(updatedData));
    };

    const handleCheckboxChange = (index: number, field: 'S' | 'T' | 'R' | 'I' | 'D' | 'E', value: boolean) => {
        const updatedData = [...overviewTableState];
        updatedData[index].threat[field] = value as boolean;
        setOverviewTableState(updatedData);
        if (overviewTableImported) {
            setImportedTableChanged(true);
        }
        localStorage.setItem("OverviewTable", JSON.stringify(updatedData));
    };

    const handleSave = () => {
        const hasEmptyFields = overviewTableState.some(row => row.description.trim() === '');
        if (hasEmptyFields) {
            alert("Please fill in all descriptions before continuing. If you wish to proceed later, you can save your progress by clicking on the download button.");
            return;
        }

        const hasAtleastOneThreat: boolean = overviewTableState.every(row => {
            return row.threat.S || row.threat.T || row.threat.R || row.threat.I || row.threat.D || row.threat.E;
        })

        if (!hasAtleastOneThreat) {
            alert("Please select at least one threat for each interaction before continuing. If you wish to proceed later, you can save your progress by clicking on the download button.");
            return;
        }
        onSave(overviewTableState, importedTableChanged);
        setSaveClicked(true);
    };

    return (
        <ThemeProvider theme={theme}>
            <Box sx={{marginTop: '8px'}}>
                <Typography variant={"h4"}>Overview Table</Typography>
                <TableContainer>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell align="center" sx={{fontWeight: 'bold'}}>Dataflow</TableCell>
                                <TableCell align="center" sx={{fontWeight: 'bold'}}>Interaction</TableCell>
                                <TableCell align="center" sx={{fontWeight: 'bold'}}>Description</TableCell>
                                <TableCell align="center" sx={{fontWeight: 'bold'}}>S</TableCell>
                                <TableCell align="center" sx={{fontWeight: 'bold'}}>T</TableCell>
                                <TableCell align="center" sx={{fontWeight: 'bold'}}>R</TableCell>
                                <TableCell align="center" sx={{fontWeight: 'bold'}}>I</TableCell>
                                <TableCell align="center" sx={{fontWeight: 'bold'}}>D</TableCell>
                                <TableCell align="center" sx={{fontWeight: 'bold'}}>E</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {overviewTableState.map((row, index) => (
                                <TableRow key={index}>
                                    <TableCell align="center">{row.dataflowEnumeration}</TableCell>
                                    <TableCell
                                        align="center">{row.interaction}</TableCell>
                                    <TableCell align="center">
                                        <TextField
                                            size='small'
                                            variant="outlined"
                                            placeholder="write here ..."
                                            value={row.description || ''}
                                            onChange={(event) => handleDescriptionChange(index, event.target.value)}/>
                                    </TableCell>
                                    <TableCell align="center">
                                        <Checkbox
                                            checked={row.threat.S}
                                            onChange={(event) => handleCheckboxChange(index, 'S', event.target.checked)}
                                        />
                                    </TableCell>
                                    <TableCell align="center">
                                        <Checkbox
                                            checked={row.threat.T}
                                            onChange={(event) => handleCheckboxChange(index, 'T', event.target.checked)}
                                        />
                                    </TableCell>
                                    <TableCell align="center">
                                        <Checkbox
                                            checked={row.threat.R}
                                            onChange={(event) => handleCheckboxChange(index, 'R', event.target.checked)}
                                        />
                                    </TableCell>
                                    <TableCell align="center">
                                        <Checkbox
                                            checked={row.threat.I}
                                            onChange={(event) => handleCheckboxChange(index, 'I', event.target.checked)}
                                        />
                                    </TableCell>
                                    <TableCell align="center">
                                        <Checkbox
                                            checked={row.threat.D}
                                            onChange={(event) => handleCheckboxChange(index, 'D', event.target.checked)}
                                        />
                                    </TableCell>
                                    <TableCell align="center">
                                        <Checkbox
                                            checked={row.threat.E}
                                            onChange={(event) => handleCheckboxChange(index, 'E', event.target.checked)}
                                        />
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
                {!saveClicked &&
                    <Box sx={{display: 'flex', justifyContent: 'flex-end', marginTop: '16px'}}>
                    <Button variant="contained" color="secondary" onClick={handleSave}>Save</Button>
                </Box>
                }
            </Box>
        </ThemeProvider>
    );
}
