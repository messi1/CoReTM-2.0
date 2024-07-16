import React from 'react';
import { Link } from "react-router-dom";
import { Button, Stack, Typography, Container, Box, Grid } from "@mui/material";
import { ThemeProvider } from "@mui/material/styles";
import theme from "../utils/theme";


function Home() {
    return (
        <ThemeProvider theme={theme}>
            <Grid container justifyContent="center" alignItems="center">
                <Container maxWidth="md">
                    <Box textAlign="center" sx={{ mb: 4 }}>
                        <Typography variant="h1" component="h1">
                            CoReTM 2.0
                        </Typography>
                        <Typography variant="h5" gutterBottom>
                            Threat modeling with STRIDE-per-Interaction
                        </Typography>
                    </Box>
                    <Stack direction="column" spacing={2} alignItems="center">
                        <Link to={"/import"} style={{ textDecoration: 'none' }}>
                            <Button variant="outlined" color="secondary">
                                Import
                            </Button>
                        </Link>
                        <Link to={"/model"} style={{ textDecoration: 'none' }}>
                            <Button variant="contained" color="secondary">
                                Create
                            </Button>
                        </Link>
                    </Stack>
                </Container>
            </Grid>
        </ThemeProvider>
    );
}

export default Home;
