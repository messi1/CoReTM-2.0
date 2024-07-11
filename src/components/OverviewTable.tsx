import React, {useContext, useEffect, useState} from "react";

import Paper from "@mui/material/Paper";
import Table from "@mui/material/Table";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import TableCell from "@mui/material/TableCell";
import TableBody from "@mui/material/TableBody";
import {Box, Button, Checkbox, TextField} from "@mui/material";
import TableContainer from "@mui/material/TableContainer";

import { ICrossingElements } from "../interfaces/DrawioInterfaces";
import { IOverviewTableRow } from "../interfaces/TableInterfaces";



export default function OverviewTable({ crossingElements, onSave }: { crossingElements: ICrossingElements[], onSave: (data: IOverviewTableRow[]) => void }) {
    const [overviewTable, setOverviewTable] = useState<IOverviewTableRow[]>([]);
    const [saveClicked, setSaveClicked] = useState(false);


    useEffect(() => {
        const tableData = crossingElements.map((element) => ({
            type: "OverviewRow",
            dataflowId: element.dataflow.id,
            dataflowName: element.dataflow.name,
            interaction: `${element.elements.sourceElement.name} ➝ ${element.elements.targetElement.name}`,
            description: "",
            threat: {
                S: false,
                T: false,
                R: false,
                I: false,
                D: false,
                E: false
            }
        }));
        setOverviewTable(tableData);
    }, [crossingElements]);


    const handleDescriptionChange = (index: number, value: string) => {
        const updatedData = [...overviewTable];
        updatedData[index].description = value;
        setOverviewTable(updatedData);
    };

    const handleCheckboxChange = (index: number, field: 'S' | 'T' | 'R' | 'I' | 'D' | 'E', value: boolean) => {
        const updatedData = [...overviewTable];
        updatedData[index].threat[field] = value as boolean;
        setOverviewTable(updatedData);
    };

    const handleSave = () => {
        const hasEmptyFields = overviewTable.some(row => row.description.trim() === '');
        if (hasEmptyFields) {
            alert("Please fill in all descriptions before saving.");
            return;
        }
        onSave(overviewTable);
        setSaveClicked(true);
    };

    return (
        <Box sx={{marginTop: '8px'}}>
            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell align="center">Dataflow</TableCell>
                            <TableCell align="center">Interaction</TableCell>
                            <TableCell align="center">Description</TableCell>
                            <TableCell align="center">S</TableCell>
                            <TableCell align="center">T</TableCell>
                            <TableCell align="center">R</TableCell>
                            <TableCell align="center">I</TableCell>
                            <TableCell align="center">D</TableCell>
                            <TableCell align="center">E</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {crossingElements.map((element, index) => (
                            <TableRow key={index}>
                                <TableCell align="center">{element.dataflow.name}</TableCell>
                                <TableCell
                                    align="center">{`${element.elements.sourceElement.name} ➝ ${element.elements.targetElement.name}`}</TableCell>
                                <TableCell align="center">
                                    <TextField
                                        size="small"
                                        variant="outlined"
                                        placeholder="Provide description"
                                        value={overviewTable[index]?.description || ''}
                                        onChange={(event) => handleDescriptionChange(index, event.target.value)}/>
                                </TableCell>
                                <TableCell align="center">
                                    <Checkbox
                                        defaultChecked={false}
                                        onChange={() => handleCheckboxChange(index, 'S', !overviewTable[index].threat.S)}/>
                                </TableCell>
                                <TableCell align="center">
                                    <Checkbox
                                        defaultChecked={false}
                                        onChange={() => handleCheckboxChange(index, 'T', !overviewTable[index].threat.T)}/>
                                </TableCell>
                                <TableCell align="center">
                                    <Checkbox
                                        defaultChecked={false}
                                        onChange={() => handleCheckboxChange(index, 'R', !overviewTable[index].threat.R)}/>
                                </TableCell>
                                <TableCell align="center">
                                    <Checkbox
                                        defaultChecked={false}
                                        onChange={() => handleCheckboxChange(index, 'I', !overviewTable[index].threat.I)}/>
                                </TableCell>
                                <TableCell align="center">
                                    <Checkbox
                                        defaultChecked={false}
                                        onChange={() => handleCheckboxChange(index, 'D', !overviewTable[index].threat.D)}/>
                                </TableCell>
                                <TableCell align="center">
                                    <Checkbox
                                        defaultChecked={false}
                                        onChange={() => handleCheckboxChange(index, 'E', !overviewTable[index].threat.E)}/>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
            {!saveClicked &&
                <Box sx={{display: 'flex', justifyContent: 'flex-end', marginTop: '8px'}}>
                <Button variant="contained" color="primary" onClick={handleSave}>Save</Button>
            </Box>
            }
        </Box>
    );
}
