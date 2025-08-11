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
      <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
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
            py: 2,
            px: 2,
            mt: 'auto',
            textAlign: 'center',
            borderTop: '1px solid',
            borderColor: 'divider',
          }}
        >
          {/* public 폴더에 student_council_logo.png 파일을 추가하세요. */}
          <img
            src={process.env.PUBLIC_URL + '/student_council_logo.png'}
            alt="학생회 로고"
            style={{
              height: '50px', // 로고 높이 (가로 길이는 비율에 맞춰 자동 조절)
              maxWidth: '90%', // 화면이 작아도 로고가 넘치지 않도록 설정
              objectFit: 'contain',
            }}
          />
        </Box>
      </Box>
    </ThemeProvider>
  );
}

export default App;