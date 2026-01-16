import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import styled from 'styled-components';

const AppWrapper = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
`;

const Nav = styled.nav`
  background: linear-gradient(135deg, #1a202c 0%, #2d3748 100%);
  padding: 16px 0;
  box-shadow: 0 10px 30px rgba(0,0,0,0.2);
  position: sticky;
  top: 0;
  z-index: 100;
`;

const NavContent = styled.div`
  max-width: 1000px;
  margin: 0 auto;
  padding: 0 16px;
  display: flex;
  gap: 20px;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;

  @media (max-width: 768px) {
    gap: 12px;
    padding: 0 12px;
  }

  @media (max-width: 480px) {
    padding: 0 10px;
  }
`;

const NavLinks = styled.div`
  display: flex;
  gap: 25px;
  align-items: center;

  a {
    color: #e2e8f0;
    font-size: 16px;
    font-weight: 500;
    transition: color 0.3s ease;

    &:hover {
      color: #5a67d8;
      text-decoration: none;
    }
  }

  @media (max-width: 768px) {
    gap: 15px;

    a {
      font-size: 14px;
    }
  }

  @media (max-width: 480px) {
    gap: 10px;

    a {
      font-size: 13px;
    }
  }
`;

const AuthLinks = styled.div`
  display: flex;
  gap: 15px;
  align-items: center;

  a {
    color: #e2e8f0;
    font-size: 16px;
    font-weight: 500;
    transition: color 0.3s ease;

    &:hover {
      color: #5a67d8;
      text-decoration: none;
    }
  }

  @media (max-width: 768px) {
    gap: 10px;

    a {
      font-size: 14px;
    }
  }

  @media (max-width: 480px) {
    gap: 6px;

    a {
      font-size: 12px;
    }
  }
`;

const LogoutBtn = styled.button`
  background: linear-gradient(135deg, #ed8936 0%, #d69e2e 100%);
  padding: 10px 16px;
  font-size: 14px;
  box-shadow: 0 4px 6px rgba(237, 137, 54, 0.25);

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 12px rgba(237, 137, 54, 0.35);
  }

  @media (max-width: 768px) {
    padding: 8px 12px;
    font-size: 13px;
  }

  @media (max-width: 480px) {
    padding: 6px 10px;
    font-size: 12px;
  }
`;

const Logo = styled(Link)`
  color: white;
  font-size: 24px;
  font-weight: 700;
  letter-spacing: -0.5px;
  text-decoration: none;
  transition: color 0.3s ease;
  white-space: nowrap;

  &:hover {
    color: #5a67d8;
    text-decoration: none;
  }

  @media (max-width: 768px) {
    font-size: 20px;
  }

  @media (max-width: 480px) {
    font-size: 18px;
  }
`;

const Container = styled.div`
  max-width: 1000px;
  margin: 0 auto;
  padding: 40px 20px;

  @media (max-width: 768px) {
    padding: 30px 16px;
  }

  @media (max-width: 480px) {
    padding: 20px 12px;
  }
`;

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const user = useSelector((state: RootState) => state.auth.user);
  const navigate = useNavigate();

  return (
    <AppWrapper>
      <Nav>
        <NavContent>
          <Logo to="/">📝 BlogHub</Logo>
          <NavLinks>
            <Link to="/blogs">Discover</Link>
            {user && <Link to="/blogs/create">Create</Link>}
          </NavLinks>
          <AuthLinks>
            {user ? (
              <LogoutBtn onClick={() => navigate('/logout')}>Logout</LogoutBtn>
            ) : (
              <>
                <Link to="/login">Login</Link>
                <Link to="/register">Sign Up</Link>
              </>
            )}
          </AuthLinks>
        </NavContent>
      </Nav>
      <Container>{children}</Container>
    </AppWrapper>
  );
};

export default Layout;