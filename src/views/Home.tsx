import React from 'react';
import {Link} from "react-router-dom";

import {Button, Stack, Typography} from "@mui/material";
import Container from "@mui/material/Container";

function Home() {

    return (
        <Container>
            <Typography variant="h2" component="h1" gutterBottom>
                CoReTM 2.0
            </Typography>
            <Typography variant="subtitle1">
                Threat modeling with STRIDE-per-Interaction
            </Typography>
            <Stack direction="column" spacing={2} className={"Home-link"}>
                <Link to={"/login"} style={{ textDecoration: 'none' }}>
                    <Button variant="outlined">Login</Button>
                </Link>
                <Link to="/signup" style={{ textDecoration: 'none' }}>
                    <Button variant="outlined">Sign Up</Button>
                </Link>
                <Link to={"/model"} style={{ textDecoration: 'none' }}>
                    <Button variant="outlined">Continue without Login</Button>
                </Link>
            </Stack>
        </Container>
    );
}

export default Home;
