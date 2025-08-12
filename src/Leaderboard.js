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
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  TextField,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import MenuIcon from '@mui/icons-material/Menu';
import SettingsIcon from '@mui/icons-material/Settings';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import LoginIcon from '@mui/icons-material/Login';
import LogoutIcon from '@mui/icons-material/Logout';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import { supabase } from './supabaseClient';
import { motion } from 'framer-motion';

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
  const [openHowToPlay, setOpenHowToPlay] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loginForm, setLoginForm] = useState({ username: '', password: '' });
  const [loginError, setLoginError] = useState('');
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

  useEffect(() => {
    // Check if user is logged in from localStorage
    const adminLoggedIn = localStorage.getItem('adminLoggedIn') === 'true';
    setIsLoggedIn(adminLoggedIn);
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

  const handleOpenHowToPlay = () => {
    setOpenHowToPlay(true);
  };

  const handleCloseHowToPlay = () => {
    setOpenHowToPlay(false);
  };

  const handleDrawerToggle = () => {
    setDrawerOpen(!drawerOpen);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginError('');

    const adminUsername = process.env.REACT_APP_ADMIN_USERNAME;
    const adminPassword = process.env.REACT_APP_ADMIN_PASSWORD;

    if (loginForm.username === adminUsername && loginForm.password === adminPassword) {
      setIsLoggedIn(true);
      localStorage.setItem('adminLoggedIn', 'true');
      setLoginForm({ username: '', password: '' });
      setDrawerOpen(false);
    } else {
      setLoginError('아이디 또는 비밀번호가 잘못되었습니다.');
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    localStorage.removeItem('adminLoggedIn');
    setDrawerOpen(false);
  };

  const handleAdminClick = () => {
    navigate('/admin');
    setDrawerOpen(false);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Paper
        elevation={3}
        sx={{
          p: { xs: 2, sm: 4 },
          borderRadius: '16px',
          background: 'linear-gradient(145deg, #ffffff, #e6e6e6)',
          position: 'relative',
        }}
      >
        <Box sx={{ position: 'absolute', top: 16, right: 16 }}>
          <IconButton onClick={handleDrawerToggle} color="primary">
            <MenuIcon />
          </IconButton>
        </Box>
        <Box sx={{ textAlign: 'center', mb: 3 }}>
          <img src={process.env.PUBLIC_URL + '/logo192.png'} alt="Apple Game Logo" style={{ width: 80, height: 80, marginBottom: 16 }} />
          <Typography variant="h4" component="h1" gutterBottom>
            사과게임 랭킹
          </Typography>
          <Button
            variant="outlined"
            color="primary"
            onClick={handleOpenHowToPlay}
            sx={{ mt: 2, mb: 2 }}
          >
            게임 참여 방법
          </Button>
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
            <TableBody component={motion.tbody} variants={containerVariants} initial="hidden" animate="visible">
              {loading ? (
                <TableRow>
                  <TableCell colSpan={4} align="center" sx={{ p: 4 }}>
                    <CircularProgress />
                    <Typography sx={{ mt: 2 }}>리더보드를 불러오는 중...</Typography>
                  </TableCell>
                </TableRow>
              ) : scores.length > 0 ? (
                scores.map((player, index) => (
                  <motion.tr
                    key={player.student_id}
                    variants={itemVariants}
                    whileHover={{ y: -3, backgroundColor: 'rgba(0, 0, 0, 0.03)' }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                    style={{ display: 'table-row' }} // Ensure motion.tr renders as table-row
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
                  </motion.tr>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4} align="center" sx={{ p: 4 }}>
                    <Box sx={{ my: 4, color: 'text.secondary' }}>
                      <Typography variant="h6" gutterBottom>아직 등록된 점수가 없습니다.</Typography>
                      <Typography variant="body2">대회에 참가하여 리더보드를 채워보세요!</Typography>
                    </Box>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
      <Dialog open={openHowToPlay} onClose={handleCloseHowToPlay}>
        <DialogTitle>E-Sports 사과게임 참여 방법</DialogTitle>
        <DialogContent dividers>
          <Typography gutterBottom>
            - 기간: 2025. 9. 8.(월) - 9. 10.(수)
          </Typography>
          <Typography gutterBottom>
            &nbsp;&nbsp;&nbsp;(매일 13시부터 17시까지)
          </Typography>
          <Typography gutterBottom>
            - 장소: 제2공학관 지하1층 26B13C호
          </Typography> 
          <Typography>
            - 개인 태블릿이나 휴대폰 등을 지참하여 학생회에게 문의 후 게임을 진행합니다. 최고 점수를 갱신하여 상금에 도전하세요!
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseHowToPlay}>닫기</Button>
        </DialogActions>
      </Dialog>
      
      <Drawer
        anchor="right"
        open={drawerOpen}
        onClose={handleDrawerToggle}
      >
        <Box sx={{ width: 250, p: 2 }}>
          <Typography variant="h6" gutterBottom>
            관리자 메뉴
          </Typography>
          <Divider sx={{ mb: 2 }} />
          
          {!isLoggedIn ? (
            <Box component="form" onSubmit={handleLogin}>
              <TextField
                fullWidth
                label="아이디"
                value={loginForm.username}
                onChange={(e) => setLoginForm({...loginForm, username: e.target.value})}
                margin="normal"
                size="small"
              />
              <TextField
                fullWidth
                label="비밀번호"
                type="password"
                value={loginForm.password}
                onChange={(e) => setLoginForm({...loginForm, password: e.target.value})}
                margin="normal"
                size="small"
              />
              {loginError && (
                <Alert severity="error" sx={{ mt: 1 }}>
                  {loginError}
                </Alert>
              )}
              <Button
                type="submit"
                variant="contained"
                fullWidth
                startIcon={<LoginIcon />}
                sx={{ mt: 2 }}
              >
                로그인
              </Button>
            </Box>
          ) : (
            <List>
              <ListItem>
                <ListItemText 
                  primary="관리자로 로그인됨" 
                />
              </ListItem>
              <Divider />
              <ListItem button onClick={handleAdminClick}>
                <ListItemIcon>
                  <AdminPanelSettingsIcon />
                </ListItemIcon>
                <ListItemText primary="관리자 페이지" />
              </ListItem>
              <ListItem button onClick={handleLogout}>
                <ListItemIcon>
                  <LogoutIcon />
                </ListItemIcon>
                <ListItemText primary="로그아웃" />
              </ListItem>
            </List>
          )}
        </Box>
      </Drawer>
    </Container>
  );
};

export default Leaderboard;