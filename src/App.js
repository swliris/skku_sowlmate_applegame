import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Leaderboard from './Leaderboard';
import Admin from './Admin';
import { CssBaseline, ThemeProvider } from '@mui/material';
import theme from './theme';

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Routes>
          <Route path="/" element={<Navigate to="/skku_sowlmate_applegame" replace />} />
          <Route path="/skku_sowlmate_applegame" element={<Leaderboard />} />
          <Route path="/skku_sowlmate_applegame/admin" element={<Admin />} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;