import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Box,
  CircularProgress,
  Alert,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import { supabase } from './supabaseClient';

const maskStudentId = (id) => {
  if (typeof id !== 'string' || id.length !== 10) {
    return id;
  }
  return `${id.substring(0, 6)}##${id.substring(8)}`;
};

const maskName = (name) => {
  if (typeof name !== 'string' || name.length <= 1) {
    return name;
  }
  if (name.length === 2) {
    return `${name.substring(0, 1)}*`;
  }
  return `${name.substring(0, 1)}${'*'.repeat(name.length - 2)}${name.substring(name.length - 1)}`;
};

const Leaderboard = () => {
  const [scores, setScores] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchLeaderboard = async () => {
      setLoading(true);
      const { data, error } = await supabase.rpc('get_leaderboard');

      if (error) {
        console.error('Error fetching leaderboard:', error);
        setError('리더보드를 불러오는 중 오류가 발생했습니다.');
        setScores([]);
      } else {
        setScores(data);
      }
      setLoading(false);
    };

    fetchLeaderboard();
  }, []);

  const getMedalColor = (rank) => {
    switch (rank) {
      case 0:
        return { color: '#FFD700' }; // Gold
      case 1:
        return { color: '#C0C0C0' }; // Silver
      case 2:
        return { color: '#CD7F32' }; // Bronze
      default:
        return { color: 'inherit' };
    }
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Paper
        elevation={3}
        sx={{
          p: { xs: 2, sm: 4 },
          borderRadius: '16px',
          background: 'linear-gradient(145deg, #ffffff, #e6e6e6)',
        }}
      >
        <Box sx={{ textAlign: 'center', mb: 3 }}>
          <img src={process.env.PUBLIC_URL + '/logo192.png'} alt="Apple Game Logo" style={{ width: 80, height: 80, marginBottom: 16 }} />
          <Typography variant="h4" component="h1" gutterBottom>
            사과게임 랭킹
          </Typography>
        </Box>
        {error && <Alert severity="error">{error}</Alert>}
        <TableContainer component={Paper} sx={{ borderRadius: '12px' }}>
          <Table aria-label="leaderboard table">
            <TableHead>
              <TableRow sx={{ backgroundColor: (theme) => theme.palette.primary.main }}>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>순위</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>이름</TableCell>
                <TableCell align="right" sx={{ color: 'white', fontWeight: 'bold' }}>학번</TableCell>
                <TableCell align="right" sx={{ color: 'white', fontWeight: 'bold' }}>최고 점수</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={4} align="center" sx={{ p: 4 }}>
                    <CircularProgress />
                    <Typography sx={{ mt: 2 }}>리더보드를 불러오는 중...</Typography>
                  </TableCell>
                </TableRow>
              ) : scores.length > 0 ? (
                scores.map((player, index) => (
                  <TableRow
                    key={player.student_id}
                    sx={{ '&:nth-of-type(odd)': { backgroundColor: (theme) => theme.palette.action.hover } }}
                  >
                    <TableCell component="th" scope="row" sx={{ fontWeight: 'bold', width: '60px' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        {index < 3 ? (
                          <EmojiEventsIcon style={getMedalColor(index)} />
                        ) : (
                          <Typography sx={{ width: '24px', textAlign: 'center' }}>{index + 1}</Typography>
                        )}
                      </Box>
                    </TableCell>
                    <TableCell>{maskName(player.name)}</TableCell>
                    <TableCell align="right">{maskStudentId(player.student_id)}</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                      {player.max_score}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4} align="center" sx={{ p: 4 }}>
                    <Typography>데이터가 없습니다.</Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
      
    </Container>
  );
};

export default Leaderboard;