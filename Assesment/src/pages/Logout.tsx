import React, { useEffect } from 'react';
import { supabase } from '../utils/supabase';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { setUser } from '../store/slices/authSlice';

const Logout: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  useEffect(() => {
    const logout = async () => {
      await supabase.auth.signOut();
      dispatch(setUser(null));
      navigate('/login');
    };
    logout();
  }, [dispatch, navigate]);

  return <div>Logging out...</div>;
};

export default Logout;