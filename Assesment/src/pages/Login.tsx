import React, { useState } from 'react';
import { supabase } from '../utils/supabase';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { setUser, setLoading, setError } from '../store/slices/authSlice';
import { RootState } from '../store';
import styled from 'styled-components';

const AuthContainer = styled.div`
  min-height: calc(100vh - 80px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
`;

const AuthCard = styled.div`
  background: white;
  border-radius: 12px;
  box-shadow: 0 10px 40px rgba(0,0,0,0.15);
  padding: 50px;
  width: 100%;
  max-width: 400px;
  border: 1px solid rgba(0,0,0,0.05);
`;

const AuthHeader = styled.div`
  text-align: center;
  margin-bottom: 40px;

  h1 {
    color: #1a202c;
    font-size: 2rem;
    margin: 0 0 10px 0;
  }

  p {
    color: #718096;
    margin: 0;
    font-size: 1rem;
  }
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;

  label {
    font-weight: 600;
    color: #2d3748;
    font-size: 14px;
  }
`;

const ErrorAlert = styled.div`
  background: #fed7d7;
  border: 1px solid #feb2b2;
  border-radius: 8px;
  padding: 12px 16px;
  color: #c53030;
  font-size: 14px;
  font-weight: 500;
  margin-bottom: 10px;
`;

const SubmitBtn = styled.button`
  background: linear-gradient(135deg, #5a67d8 0%, #4c51bf 100%);
  padding: 12px 24px;
  font-size: 16px;
  font-weight: 600;
  box-shadow: 0 4px 6px rgba(90, 103, 216, 0.25);
  margin-top: 10px;

  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 8px 12px rgba(90, 103, 216, 0.35);
  }
`;

const SignupLink = styled.p`
  text-align: center;
  color: #718096;
  margin-top: 20px;
  font-size: 14px;

  a {
    color: #5a67d8;
    font-weight: 600;
    text-decoration: none;

    &:hover {
      text-decoration: underline;
    }
  }
`;

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { loading, error } = useSelector((state: RootState) => state.auth);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    dispatch(setLoading(true));
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      dispatch(setError(error.message));
    } else {
      dispatch(setUser(data.user));
      navigate('/blogs');
    }
  };

  return (
    <AuthContainer>
      <AuthCard>
        <AuthHeader>
          <h1>Welcome Back</h1>
          <p>Sign in to your account</p>
        </AuthHeader>
        {error && <ErrorAlert>{error}</ErrorAlert>}
        <Form onSubmit={handleSubmit}>
          <FormGroup>
            <label htmlFor="email">Email Address</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
            />
          </FormGroup>
          <FormGroup>
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
            />
          </FormGroup>
          <SubmitBtn type="submit" disabled={loading}>
            {loading ? 'Signing in...' : 'Sign In'}
          </SubmitBtn>
        </Form>
        <SignupLink>
          Don't have an account? <RouterLink to="/register">Sign up</RouterLink>
        </SignupLink>
      </AuthCard>
    </AuthContainer>
  );
};

export default Login;