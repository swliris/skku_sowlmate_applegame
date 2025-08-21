import React from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import Leaderboard from './Leaderboard';
import Admin from './Admin';
import { CssBaseline, ThemeProvider, Box } from '@mui/material';
import theme from './theme';

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ 
        display: 'flex', 
        flexDirection: 'column', 
        minHeight: '100vh',
        backgroundColor: '#ffffff',
      }}>
        <Box component="main" sx={{ flexGrow: 1 }}>
          <Router>
            <Routes>
              <Route path="/" element={<Leaderboard />} />
              <Route path="/admin" element={<Admin />} />
            </Routes>
          </Router>
        </Box>
        <Box
          component="footer"
          sx={{
            py: 3,
            px: 2,
            mt: 'auto',
            textAlign: 'center',
            borderTop: '1px solid #e0e0e0',
            backgroundColor: '#f8f9fa',
          }}
        >
          <img
            src={process.env.PUBLIC_URL + '/student_council_logo.png'}
            alt="학생회 로고"
            style={{
              height: '50px',
              maxWidth: '90%',
              objectFit: 'contain',
            }}
          />
        </Box>
      </Box>
    </ThemeProvider>
  );
}

export default App;