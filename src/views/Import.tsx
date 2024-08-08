import React, { useState } from "react";
import Container from "@mui/material/Container";
import Paper from "@mui/material/Paper";
import { Box, Button, Grid, Stack, Typography, TextField } from "@mui/material";
import theme from "../utils/theme";
import { ThemeProvider } from "@mui/material/styles";
import {Link, useNavigate} from "react-router-dom";
import ImportController from "../DrawIO/ImportController";

export default function Import() {
    const [file, setFile] = useState<File | null>(null);
    const [fileContent, setFileContent] = useState<string>("");
    const navigate = useNavigate();
    const importController = new ImportController();

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const uploadedFile = event.target.files?.[0] || null;
        setFile(uploadedFile);

        if (uploadedFile) {
            const reader = new FileReader();
            reader.onload = (event) => {
                const result = importController.parseFile(event.target?.result as string);
                if (result.success) {
                    navigate("/model");
                } else {
                    alert("Failed to parse the file. Please upload a valid model.");
                    navigate("/");
                }
            };
            reader.readAsText(uploadedFile);
        }
    };

    return (
        <ThemeProvider theme={theme}>
            <Grid container justifyContent="center" alignItems="center">
                <Container maxWidth="md">
                    <Box textAlign="center" sx={{ mb: 4 }}>
                        <Typography variant="h4" gutterBottom>
                            Import
                        </Typography>
                        <Typography variant="h5" gutterBottom>
                            Upload an existing model
                        </Typography>
                        <input
                            type="file"
                            accept=".json"
                            onChange={handleFileChange}
                            style={{ margin: "20px 0" }}
                        />
                    </Box>
                </Container>
            </Grid>
        </ThemeProvider>
    );
}
