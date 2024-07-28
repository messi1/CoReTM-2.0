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

import { ICrossingElements } from "../interfaces/DrawioInterfaces";
import { IOverviewTableRow } from "../interfaces/TableRowInterfaces";



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
                            {crossingElements.map((element, index) => (
                                <TableRow key={index}>
                                    <TableCell align="center">{element.dataflow.name}</TableCell>
                                    <TableCell
                                        align="center">{`${element.elements.sourceElement.name} ➝ ${element.elements.targetElement.name}`}</TableCell>
                                    <TableCell align="center">
                                        <TextField
                                            size='small'
                                            variant="outlined"
                                            placeholder="write here ..."
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
                    <Box sx={{display: 'flex', justifyContent: 'flex-end', marginTop: '16px'}}>
                    <Button variant="contained" color="secondary" onClick={handleSave}>Save</Button>
                </Box>
                }
            </Box>
        </ThemeProvider>
    );
}
