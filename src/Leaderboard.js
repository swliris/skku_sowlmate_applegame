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
  TextField,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import MenuIcon from '@mui/icons-material/Menu';
import SettingsIcon from '@mui/icons-material/Settings';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import LoginIcon from '@mui/icons-material/Login';
import LogoutIcon from '@mui/icons-material/Logout';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import StarIcon from '@mui/icons-material/Star';
import { supabase } from './supabaseClient';
import { motion } from 'framer-motion';

const maskStudentId = (id) => {
  if (typeof id !== 'string' || id.length !== 10) {
    return id;
  }
  return `${id.substring(0, 6)}##${id.substring(8)}`;
};


const removeDuplicateStudentIds = (data) => {
  if (!data || !Array.isArray(data)) {
    return [];
  }
  
  const uniqueStudents = new Map();
  
  data.forEach(player => {
    const existingPlayer = uniqueStudents.get(player.student_id);
    
    if (!existingPlayer || player.max_score > existingPlayer.max_score) {
      uniqueStudents.set(player.student_id, player);
    }
  });
  
  return Array.from(uniqueStudents.values()).sort((a, b) => b.max_score - a.max_score);
};

const calculateRank = (scores, currentIndex) => {
  if (currentIndex === 0) return 1;
  
  const currentScore = scores[currentIndex].max_score;
  const previousScore = scores[currentIndex - 1].max_score;
  
  if (currentScore === previousScore) {
    return calculateRank(scores, currentIndex - 1);
  }
  
  return currentIndex + 1;
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
        const uniqueScores = removeDuplicateStudentIds(data);
        setScores(uniqueScores);
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
      setLoginError('');
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
    <Container maxWidth="lg" sx={{ mt: { xs: 2, sm: 3, md: 4 }, mb: { xs: 2, sm: 3, md: 4 }, px: { xs: 1, sm: 2, md: 3 } }}>
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        <Paper
          elevation={3}
          sx={{
            p: { xs: 2, sm: 3, md: 5 },
            borderRadius: { xs: '16px', sm: '20px', md: '24px' },
            position: 'relative',
            backgroundColor: '#ffffff',
            overflow: 'hidden',
          }}
        >
          <Box sx={{ position: 'absolute', top: 20, right: 20 }}>
            <motion.div
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <IconButton onClick={handleDrawerToggle} color="primary" size="large">
                <MenuIcon />
              </IconButton>
            </motion.div>
          </Box>
          
          <Box sx={{ textAlign: 'center', mb: 4, pt: 2 }}>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
            >
              <Box sx={{ position: 'relative', display: 'inline-block', mb: 3 }}>
                <img 
                  src={process.env.PUBLIC_URL + '/logo192.png'} 
                  alt="Apple Game Logo" 
                  style={{ 
                    width: window.innerWidth < 600 ? 80 : 120, 
                    height: window.innerWidth < 600 ? 80 : 120, 
                    borderRadius: '50%',
                    filter: 'drop-shadow(0 0 20px rgba(76, 175, 80, 0.3))',
                  }} 
                />
                <motion.div
                  style={{
                    position: 'absolute',
                    top: -10,
                    right: -10,
                  }}
                  animate={{
                    rotate: [0, 360],
                  }}
                  transition={{
                    duration: 10,
                    repeat: Infinity,
                    ease: "linear",
                  }}
                >
                  <StarIcon sx={{ color: 'secondary.main', fontSize: 30 }} />
                </motion.div>
              </Box>
            </motion.div>
            
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              <Typography 
                variant="h3" 
                component="h1" 
                gutterBottom
                sx={{ 
                  fontWeight: 800,
                  fontSize: { xs: '1.8rem', sm: '2.5rem', md: '3rem' },
                  whiteSpace: 'nowrap',
                  background: 'linear-gradient(45deg, #4CAF50, #66BB6A, #81C784)',
                  backgroundSize: '200% 200%',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  animation: 'gradientShift 3s ease infinite',
                  '@keyframes gradientShift': {
                    '0%': { backgroundPosition: '0% 50%' },
                    '50%': { backgroundPosition: '100% 50%' },
                    '100%': { backgroundPosition: '0% 50%' },
                  },
                }}
              >
                🍎 사과게임 랭킹
              </Typography>
            </motion.div>
            
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.7 }}
            >
              <Button
                variant="contained"
                onClick={handleOpenHowToPlay}
                sx={{ 
                  mt: 2, 
                  mb: 3,
                  px: { xs: 3, sm: 4 },
                  py: { xs: 1, sm: 1.5 },
                  fontSize: { xs: '0.9rem', sm: '1rem', md: '1.1rem' },
                  borderRadius: '16px',
                  background: 'linear-gradient(45deg, #4CAF50, #66BB6A)',
                  boxShadow: '0 8px 25px rgba(76, 175, 80, 0.3)',
                }}
                startIcon={<EmojiEventsIcon />}
              >
                게임 참여 방법
              </Button>
            </motion.div>
          </Box>
        {error && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <Alert 
              severity="error" 
              sx={{ 
                mb: 3,
                borderRadius: '12px',
                background: 'rgba(244, 67, 54, 0.05)',
              }}
            >
              {error}
            </Alert>
          </motion.div>
        )}
        
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
        >
          <TableContainer 
            component={Paper} 
            sx={{ 
              borderRadius: '20px',
              overflow: 'hidden',
            }}
          >
            <Table aria-label="leaderboard table">
              <TableHead>
                <TableRow>
                  <TableCell sx={{ 
                    color: 'white', 
                    fontWeight: 'bold', 
                    fontSize: { xs: '0.8rem', sm: '0.9rem', md: '1rem' },
                    px: { xs: 1, sm: 2 },
                  }}>
                    순위
                  </TableCell>
                  <TableCell sx={{ 
                    color: 'white', 
                    fontWeight: 'bold',
                    fontSize: { xs: '0.8rem', sm: '0.9rem', md: '1rem' },
                    px: { xs: 1, sm: 2 },
                  }}>
                    이름(닉네임)
                  </TableCell>
                  <TableCell align="right" sx={{ 
                    color: 'white', 
                    fontWeight: 'bold',
                    fontSize: { xs: '0.8rem', sm: '0.9rem', md: '1rem' },
                    px: { xs: 1, sm: 2 },
                  }}>
                    학번
                  </TableCell>
                  <TableCell align="right" sx={{ 
                    color: 'white', 
                    fontWeight: 'bold',
                    fontSize: { xs: '0.8rem', sm: '0.9rem', md: '1rem' },
                    pl: { xs: 1, sm: 2 },
                    pr: { xs: 2, sm: 3, md: 3 },
                  }}>
                    점수
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody component={motion.tbody} variants={containerVariants} initial="hidden" animate="visible">
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={4} align="center" sx={{ p: 6 }}>
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                      >
                        <CircularProgress 
                          size={60}
                          sx={{
                            color: 'primary.main',
                          }}
                        />
                      </motion.div>
                      <Typography sx={{ mt: 3, fontSize: '1.1rem', fontWeight: 500 }}>
                        리더보드를 불러오는 중...
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : scores.length > 0 ? (
                  scores.map((player, index) => {
                    const currentRank = calculateRank(scores, index);
                    return (
                      <motion.tr
                        key={player.student_id}
                        variants={itemVariants}
                        whileHover={{ 
                          y: -2, 
                          scale: 1.02,
                          backgroundColor: 'rgba(0, 0, 0, 0.04)',
                        }}
                        transition={{ type: "spring", stiffness: 300, damping: 20 }}
                        style={{ 
                          display: 'table-row',
                          cursor: 'pointer',
                        }}
                      >
                        <TableCell component="th" scope="row" sx={{ 
                          fontWeight: 'bold', 
                          width: { xs: '50px', sm: '60px', md: '80px' },
                          px: { xs: 0.5, sm: 1, md: 2 },
                        }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            {currentRank <= 3 ? (
                              <motion.div
                                animate={{ 
                                  rotate: [0, 10, -10, 0],
                                  scale: [1, 1.1, 1],
                                }}
                                transition={{ 
                                  duration: 2, 
                                  repeat: Infinity,
                                  delay: (currentRank - 1) * 0.2,
                                }}
                              >
                                <EmojiEventsIcon 
                                  style={{
                                    ...getMedalColor(currentRank - 1),
                                    fontSize: window.innerWidth < 600 ? '1.5rem' : '2rem',
                                    filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))',
                                  }} 
                                />
                              </motion.div>
                            ) : (
                              <Typography 
                                sx={{ 
                                  fontSize: { xs: '0.9rem', sm: '1rem', md: '1.2rem' }, 
                                  fontWeight: 'bold',
                                  color: 'text.primary',
                                }}
                              >
                                {currentRank}
                              </Typography>
                            )}
                          </Box>
                        </TableCell>
                      <TableCell sx={{
                        fontSize: { xs: '0.8rem', sm: '0.9rem', md: '1rem' },
                        fontWeight: 500,
                        px: { xs: 0.5, sm: 1, md: 2 },
                      }}>
                        {player.name}
                      </TableCell>
                      <TableCell align="right" sx={{
                        fontSize: { xs: '0.7rem', sm: '0.8rem', md: '0.9rem' },
                        fontWeight: 500,
                        px: { xs: 0.5, sm: 1, md: 2 },
                      }}>
                        {maskStudentId(player.student_id)}
                      </TableCell>
                        <TableCell align="right" sx={{ 
                          fontWeight: 'bold', 
                          fontSize: { xs: '0.8rem', sm: '0.9rem', md: '1.1rem' },
                          color: currentRank <= 3 ? 'secondary.main' : 'primary.main',
                          pl: { xs: 0.5, sm: 1, md: 2 },
                          pr: { xs: 2, sm: 3, md: 3 },
                        }}>
                          <motion.span
                            animate={currentRank <= 3 ? { 
                              textShadow: [
                                '0 0 5px rgba(255, 193, 7, 0.5)',
                                '0 0 10px rgba(255, 193, 7, 0.8)',
                                '0 0 5px rgba(255, 193, 7, 0.5)',
                              ]
                            } : {}}
                            transition={{ duration: 2, repeat: Infinity }}
                          >
                            {player.max_score.toLocaleString()}
                          </motion.span>
                        </TableCell>
                      </motion.tr>
                    );
                  })
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} align="center" sx={{ p: 6 }}>
                      <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.5 }}
                      >
                        <Box sx={{ my: 4, color: 'text.secondary' }}>
                          <Typography variant="h5" gutterBottom sx={{ fontWeight: 600 }}>
                            🎮 아직 등록된 점수가 없습니다
                          </Typography>
                          <Typography variant="body1" sx={{ fontSize: '1.1rem' }}>
                            대회에 참가하여 리더보드를 채워보세요!
                          </Typography>
                        </Box>
                      </motion.div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </motion.div>
      </Paper>
      </motion.div>
      
      <Dialog 
        open={openHowToPlay} 
        onClose={handleCloseHowToPlay}
        PaperProps={{
          sx: {
            borderRadius: '20px',
            backgroundColor: '#ffffff',
            minWidth: { xs: '300px', sm: '400px' },
          }
        }}
      >
        <DialogTitle sx={{ 
          textAlign: 'center',
          fontSize: '1.3rem',
          fontWeight: 700,
          color: 'primary.main',
          pb: 2,
        }}>
          🏆 E-Sports 사과게임 참여 방법
        </DialogTitle>
        <DialogContent dividers sx={{
          px: 3,
          py: 2,
        }}>
          <Box component="ul" sx={{ 
            listStyle: 'disc',
            listStylePosition: 'inside',
            pl: 0,
            m: 0,
            '& li': {
              mb: 2,
              fontSize: '1rem',
              lineHeight: 1.6,
            },
            '& li:last-child': {
              mb: 0,
            }
          }}>
            <li>
              <strong>기간:</strong> 2025. 9. 8.(월) - 9. 10.(수), 13:00~17:00
            </li>
            <li>
              <strong>장소:</strong> 제2공학관 지하1층 26B13C호 학생회실
            </li>
            <li>
              개인 태블릿이나 휴대폰 등을 지참하여 학생회실 방문 후 학생회에게 문의하여 게임을 진행합니다. 
              <strong style={{ color: '#FFA000' }}>
                &nbsp;최고 점수를 갱신하여 상금에 도전하세요! 💰
              </strong>
            </li>
            <li>
              사전 신청하지 않았어도 현장에서 참여 가능합니다. 많은 참여 부탁드려요!
            </li>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3, justifyContent: 'center' }}>
          <Button 
            onClick={handleCloseHowToPlay}
            variant="contained"
            sx={{
              px: 4,
              py: 1.5,
              borderRadius: '12px',
              fontSize: '1rem',
              fontWeight: 600,
            }}
          >
            확인했습니다
          </Button>
        </DialogActions>
      </Dialog>
      
      <Drawer
        anchor="right"
        open={drawerOpen}
        onClose={handleDrawerToggle}
        PaperProps={{
          sx: {
            width: 320,
            backgroundColor: '#ffffff',
          }
        }}
      >
        <Box sx={{ p: 3 }}>
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Box sx={{ 
              textAlign: 'center', 
              mb: 3,
              p: 2,
              borderRadius: '16px',
              background: 'linear-gradient(45deg, rgba(76, 175, 80, 0.1), rgba(102, 187, 106, 0.1))',
              border: '1px solid rgba(76, 175, 80, 0.2)',
            }}>
              <SettingsIcon sx={{ fontSize: '2rem', color: 'primary.main', mb: 1 }} />
              <Typography variant="h6" sx={{ fontWeight: 700, color: 'primary.main' }}>
                관리자 메뉴
              </Typography>
            </Box>
          </motion.div>
          
          {!isLoggedIn ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Box component="form" onSubmit={handleLogin} sx={{ mt: 2 }}>
                <TextField
                  fullWidth
                  label="아이디"
                  value={loginForm.username}
                  onChange={(e) => setLoginForm({...loginForm, username: e.target.value})}
                  margin="normal"
                  variant="outlined"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: '12px',
                      background: 'rgba(0, 0, 0, 0.02)',
                    },
                  }}
                />
                <TextField
                  fullWidth
                  label="비밀번호"
                  type="password"
                  value={loginForm.password}
                  onChange={(e) => setLoginForm({...loginForm, password: e.target.value})}
                  margin="normal"
                  variant="outlined"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: '12px',
                      background: 'rgba(0, 0, 0, 0.02)',
                    },
                  }}
                />
                {loginError && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                  >
                    <Alert 
                      severity="error" 
                      sx={{ 
                        mt: 2,
                        borderRadius: '12px',
                        background: 'rgba(244, 67, 54, 0.05)',
                      }}
                    >
                      {loginError}
                    </Alert>
                  </motion.div>
                )}
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Button
                    type="submit"
                    variant="contained"
                    fullWidth
                    startIcon={<LoginIcon />}
                    sx={{ 
                      mt: 3,
                      py: 1.5,
                      borderRadius: '12px',
                      fontSize: '1rem',
                      fontWeight: 600,
                    }}
                  >
                    로그인
                  </Button>
                </motion.div>
              </Box>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <List sx={{ mt: 2 }}>
                <ListItem sx={{
                  borderRadius: '12px',
                  mb: 2,
                  background: 'linear-gradient(45deg, rgba(76, 175, 80, 0.05), rgba(102, 187, 106, 0.05))',
                  border: '1px solid rgba(76, 175, 80, 0.2)',
                }}>
                  <ListItemText 
                    primary="✅ 관리자로 로그인됨"
                    primaryTypographyProps={{
                      fontWeight: 600,
                      color: 'primary.main',
                    }}
                  />
                </ListItem>
                
                <motion.div
                  whileHover={{ scale: 1.02, x: 5 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <ListItem 
                    button 
                    onClick={handleAdminClick}
                    sx={{
                      borderRadius: '12px',
                      mb: 1,
                      background: 'rgba(0, 0, 0, 0.02)',
                      '&:hover': {
                        background: 'rgba(0, 0, 0, 0.05)',
                      },
                    }}
                  >
                    <ListItemIcon>
                      <AdminPanelSettingsIcon sx={{ color: 'primary.main' }} />
                    </ListItemIcon>
                    <ListItemText 
                      primary="관리자 페이지" 
                      primaryTypographyProps={{ fontWeight: 500 }}
                    />
                  </ListItem>
                </motion.div>
                
                <motion.div
                  whileHover={{ scale: 1.02, x: 5 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <ListItem 
                    button 
                    onClick={handleLogout}
                    sx={{
                      borderRadius: '12px',
                      background: 'rgba(0, 0, 0, 0.02)',
                      '&:hover': {
                        background: 'rgba(244, 67, 54, 0.05)',
                      },
                    }}
                  >
                    <ListItemIcon>
                      <LogoutIcon sx={{ color: 'error.main' }} />
                    </ListItemIcon>
                    <ListItemText 
                      primary="로그아웃" 
                      primaryTypographyProps={{ fontWeight: 500, color: 'error.main' }}
                    />
                  </ListItem>
                </motion.div>
              </List>
            </motion.div>
          )}
        </Box>
      </Drawer>
    </Container>
  );
};

export default Leaderboard;