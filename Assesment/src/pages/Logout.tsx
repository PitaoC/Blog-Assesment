import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { setUser } from '../store/slices/authSlice';
import styled from 'styled-components';

const LogoutContainer = styled.div`
  min-height: calc(100vh - 80px);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  gap: 20px;
  color: #718096;

  h2 {
    color: #1a202c;
    font-size: 1.5rem;
  }
`;

const Logout: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  useEffect(() => {
    const logout = async () => {
      dispatch(setUser(null));
      setTimeout(() => navigate('/login'), 1500);
    };
    logout();
  }, [dispatch, navigate]);

  return (
    <LogoutContainer>
      <h2>See you soon!</h2>
      <p>You have been logged out successfully.</p>
      <p>Redirecting...</p>
    </LogoutContainer>
  );
};

export default Logout;