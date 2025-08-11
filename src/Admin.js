import React, { useState, useRef, useEffect } from 'react';
import {
  Container,
  TextField,
  Button,
  Box,
  Typography,
  Paper,
  Alert,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { supabase } from './supabaseClient';

const Admin = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const [name, setName] = useState('');
  const [studentId, setStudentId] = useState('');
  const [score, setScore] = useState('');
  const [submitMessage, setSubmitMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const nameInputRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Focus the name input field when the user logs in
    if (isLoggedIn) {
      // Use a short timeout to ensure the element is rendered before focusing
      setTimeout(() => {
        if (nameInputRef.current) {
          nameInputRef.current.focus();
        }
      }, 100);
    }
  }, [isLoggedIn]);

  const handleLogin = (e) => {
    e.preventDefault();
    if (
      username === process.env.REACT_APP_ADMIN_ID &&
      password === process.env.REACT_APP_ADMIN_PASSWORD
    ) {
      setIsLoggedIn(true);
      setError('');
    } else {
      setError('아이디 또는 비밀번호가 잘못되었습니다.');
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setUsername('');
    setPassword('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitMessage('');

    if (!name || !studentId || !score) {
      setSubmitMessage('모든 필드를 입력해주세요.');
      return;
    }
    if (studentId.length !== 10 || !/^\d+$/.test(studentId)) {
      setSubmitMessage('학번은 10자리 숫자여야 합니다.');
      return;
    }

    setIsSubmitting(true);

    try {
      // Check entry count for the student
      const { count, error: countError } = await supabase
        .from('applegame')
        .select('*_count_placeholder_*', { count: 'exact', head: true })
        .eq('student_id', studentId);

      if (countError) throw countError;

      if (count >= 3) {
        setSubmitMessage('이 학생은 이미 3회 점수를 등록했습니다. 더 이상 등록할 수 없습니다.');
        setIsSubmitting(false);
        return;
      }

      // Insert new score
      const { error: insertError } = await supabase
        .from('applegame')
        .insert([{ student_id: studentId, name, score: parseInt(score, 10) }]);

      if (insertError) throw insertError;

      setSubmitMessage(`${name}님의 점수가 성공적으로 등록되었습니다. (등록 횟수: ${count + 1}/3)`);
      // Clear form
      setName('');
      setStudentId('');
      setScore('');

    } catch (error) {
      setSubmitMessage('점수 등록 중 오류가 발생했습니다. 콘솔을 확인해주세요.');
      console.error("Error submitting score:", error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isLoggedIn) {
    return (
      <Container maxWidth="sm" sx={{ mt: 8 }}>
        <Paper elevation={3} sx={{ p: 4, borderRadius: '16px' }}>
          <Typography variant="h5" component="h1" align="center" gutterBottom>
            관리자 로그인
          </Typography>
          <Box component="form" onSubmit={handleLogin} noValidate sx={{ mt: 1 }}>
            <TextField
              margin="normal"
              required
              fullWidth
              id="username"
              label="아이디"
              name="username"
              autoComplete="username"
              autoFocus
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="비밀번호"
              type="password"
              id="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
            >
              로그인
            </Button>
          </Box>
        </Paper>
      </Container>
    );
  }

  return (
    <Container maxWidth="sm" sx={{ mt: 8 }}>
      <Paper elevation={3} sx={{ p: 4, borderRadius: '16px' }}>
        <Typography variant="h5" component="h1" align="center" gutterBottom>
          점수 등록
        </Typography>
        <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1 }}>
          <TextField
            margin="normal"
            required
            fullWidth
            id="name"
            label="이름"
            name="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            inputRef={nameInputRef}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            id="studentId"
            label="학번 (10자리)"
            name="studentId"
            value={studentId}
            onChange={(e) => setStudentId(e.target.value)}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            name="score"
            label="점수"
            type="number"
            id="score"
            value={score}
            onChange={(e) => setScore(e.target.value)}
          />
          {submitMessage && (
            <Alert 
              severity={submitMessage.includes('성공') ? 'success' : 'error'}
              sx={{ mt: 2 }}
            >
              {submitMessage}
            </Alert>
          )}
          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2 }}
            disabled={isSubmitting}
          >
            {isSubmitting ? '등록 중...' : '점수 등록하기'}
          </Button>
        </Box>
      </Paper>
      <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between' }}>
        <Button variant="outlined" onClick={() => navigate('/skku_sowlmate_applegame')}>
          리더보드로 돌아가기
        </Button>
        <Button variant="contained" color="secondary" onClick={handleLogout}>
          로그아웃
        </Button>
      </Box>
    </Container>
  );
};

export default Admin;