import React, {useEffect, useState} from "react";

import Paper from "@mui/material/Paper";
import Table from "@mui/material/Table";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import TableCell from "@mui/material/TableCell";
import TableBody from "@mui/material/TableBody";
import {Checkbox, TextField} from "@mui/material";
import TableContainer from "@mui/material/TableContainer";

import { ICrossingElements } from "../interfaces/DrawioInterfaces";
import { IOverviewTable } from "../interfaces/TableInterfaces";

export default function OverviewTable({ crossingElements }: { crossingElements: ICrossingElements[] }) {
    const [overviewTable, setOverviewTable] = useState<IOverviewTable[]>([]);

    useEffect(() => {
        const tableData = crossingElements.map((element) => ({
            dataflowId: element.dataflow.id,
            dataflowName: element.dataflow.name,
            interaction: `${element.elements.sourceElement.name} ➝ ${element.elements.targetElement.name}`,
            description: "",
            S: false,
            T: false,
            R: false,
            I: false,
            D: false,
            E: false
        }));
        setOverviewTable(tableData);
        console.log("overview table:", tableData);
    }, [crossingElements]);

    const handleDescriptionChange = (index: number, value: string) => {
        const updatedData = [...overviewTable];
        updatedData[index].description = value;
        setOverviewTable(updatedData);
        console.log("description update:", overviewTable);
    };

    const handleCheckboxChange = (index: number, field: 'S' | 'T' | 'R' | 'I' | 'D' | 'E', value: boolean) => {
        const updatedData = [...overviewTable];
        updatedData[index][field] = value as boolean;
        setOverviewTable(updatedData);
        console.log("checkbox update:", overviewTable);
    };

    return (
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
                                    onChange={() => handleCheckboxChange(index, 'S', !overviewTable[index].S)}/>
                            </TableCell>
                            <TableCell align="center">
                                <Checkbox
                                    defaultChecked={false}
                                    onChange={() => handleCheckboxChange(index, 'T', !overviewTable[index].T)}/>
                            </TableCell>
                            <TableCell align="center">
                                <Checkbox
                                    defaultChecked={false}
                                    onChange={() => handleCheckboxChange(index, 'R', !overviewTable[index].R)}/>
                            </TableCell>
                            <TableCell align="center">
                                <Checkbox
                                    defaultChecked={false}
                                    onChange={() => handleCheckboxChange(index, 'I', !overviewTable[index].I)}/>
                            </TableCell>
                            <TableCell align="center">
                                <Checkbox
                                    defaultChecked={false}
                                    onChange={() => handleCheckboxChange(index, 'D', !overviewTable[index].D)}/>
                            </TableCell>
                            <TableCell align="center">
                                <Checkbox
                                    defaultChecked={false}
                                    onChange={() => handleCheckboxChange(index, 'E', !overviewTable[index].E)}/>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </TableContainer>
    );
}
