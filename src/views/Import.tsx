import React from "react";
import Container from "@mui/material/Container";
import { Box, Grid, Typography } from "@mui/material";
import theme from "../utils/theme";
import { ThemeProvider } from "@mui/material/styles";
import { useNavigate } from "react-router-dom";
import ImportController from "../DrawIO/ImportController";

export default function Import() {
    const navigate = useNavigate();
    const importController = new ImportController();

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const uploadedFile : File | null = event.target.files?.[0] || null;

        if (uploadedFile) {
            const reader : FileReader = new FileReader();
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
                <Container>
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
