import React from 'react';
import { Container, CssBaseline } from '@material-ui/core';
import { ThemeProvider, createMuiTheme } from '@material-ui/core/styles';

import PlanetaryProductionPage from './components/planetaryProduction/PlanetaryProductionPage';

const theme = createMuiTheme({
  palette: {
    type: 'dark',
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Container maxWidth="xl" style={{ marginTop: 16 }}>
        <PlanetaryProductionPage />
      </Container>
    </ThemeProvider>
  );
}

export default App;

