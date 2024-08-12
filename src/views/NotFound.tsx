import React from 'react';
import { Link } from "react-router-dom";
import theme from "../utils/theme";
import {ThemeProvider} from "@mui/material/styles";
import {Box, Button, Grid, Typography} from "@mui/material";
import Container from "@mui/material/Container";

function NotFound() {
    return (
        <ThemeProvider theme={theme}>
            <Grid container justifyContent="center" alignItems="center">
                <Container>
                    <Box textAlign="center" sx={{ mb: 4 }}>
                        <Typography variant="h4">
                            This page does not exist
                        </Typography>
                        <Link to={"/"} style={{ textDecoration: 'none' }}>
                            <Button variant="contained" color="secondary" sx={{marginTop: '16px'}}>
                                Home
                            </Button>
                        </Link>
                    </Box>
                </Container>
            </Grid>
        </ThemeProvider>
    );
}

export default NotFound;
