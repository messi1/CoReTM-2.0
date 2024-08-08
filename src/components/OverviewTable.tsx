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
        const importTableData = localStorage.getItem("OverviewTable");
        if (importTableData && crossingElements.length === JSON.parse(importTableData).length) {
            setOverviewTable(JSON.parse(importTableData));
        } else {
            const tableData = crossingElements.map((element) => ({
                type: "OverviewRow",
                dataflowEnumeration: element.dataflow.enumeration,
                interaction: `${element.elements.sourceElement.name} ➝ ${element.elements.targetElement.name}`,
                description: "",
                threat: {
                    S: false,
                    T: false,
                    R: false,
                    I: false,
                    D: false,
                    E: false
                },
                crossingElement: element
            }));
            setOverviewTable(tableData);
        }
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
                            {overviewTable.map((row, index) => (
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
