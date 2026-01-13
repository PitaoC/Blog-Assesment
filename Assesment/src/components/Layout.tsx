import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import styled from 'styled-components';

const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  background-color: #f5f5f5;
  min-height: 100vh;
`;

const Nav = styled.nav`
  margin-bottom: 20px;
  display: flex;
  gap: 15px;
  align-items: center;
  background: white;
  padding: 10px 20px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
`;

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const user = useSelector((state: RootState) => state.auth.user);
  const navigate = useNavigate();

  return (
    <Container>
      <Nav>
        <Link to="/blogs">Blogs</Link>
        {user ? (
          <>
            <Link to="/blogs/create">Create Blog</Link>
            <button onClick={() => navigate('/logout')}>Logout</button>
          </>
        ) : (
          <>
            <Link to="/login">Login</Link>
            <Link to="/register">Register</Link>
          </>
        )}
      </Nav>
      {children}
    </Container>
  );
};

export default Layout;