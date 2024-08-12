import React, {useEffect, useState} from 'react';
import DrawIO from "../components/DrawIO";

import Container from "@mui/material/Container";
import {Box, Button, Grid, TextField, Typography} from "@mui/material";
import {ThemeProvider} from "@mui/material/styles";
import theme from "../utils/theme";

function Model() {
    let [diagram, setDiagram] = useState({})
    let [projectName, setProjectName] = useState("")
    let [submitted, setSubmitted] = useState(false)

    useEffect(() => {
        const projectName = localStorage.getItem("ProjectName")
        if (projectName) {
            setProjectName(projectName)
            setSubmitted(true)
        }
    }, []);

    const receiveDiagram = (diagram: string | null) => {
        if (diagram) {
            setDiagram(diagram);
        }
    };

    const handleProjectNameChange = (value: string) => {
        setProjectName(value)
        localStorage.setItem("ProjectName", value)
    }

    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setSubmitted(true)
    }

    return (
        <ThemeProvider theme={theme}>
            <Grid container justifyContent="center" alignItems="center">
                <Container>
                    {!submitted ? (
                        <>
                        <Typography variant="h4" gutterBottom>
                                Provide a project name
                        </Typography>
                        <form onSubmit={handleSubmit}>
                            <Box mb={2}>
                                <TextField
                                    fullWidth
                                    size="small"
                                    variant="outlined"
                                    placeholder="Provide a project name"
                                    value={projectName}
                                    onChange={(event) => handleProjectNameChange(event.target.value)}
                                    label="Project Name"
                                />
                            </Box>
                            <Button variant="contained" color="secondary" type="submit">
                                Submit
                            </Button>
                        </form>
                        </>
                    ) : (
                        projectName.trim() !== "" && (
                            <DrawIO sendDiagram={receiveDiagram} projectName={projectName} />
                        )
                    )}
                </Container>
            </Grid>
        </ThemeProvider>
    );
}

export default Model;
