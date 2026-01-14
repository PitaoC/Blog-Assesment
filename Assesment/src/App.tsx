import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from './store';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import Register from './pages/Register';
import Login from './pages/Login';
import Logout from './pages/Logout';
import BlogList from './pages/BlogList';
import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { setUser } from './store/slices/authSlice';
import { supabase } from './utils/supabase';

const AppContent: React.FC = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      dispatch(setUser(session?.user ?? null));
    });

    return () => subscription.unsubscribe();
  }, [dispatch]);

  return (
    <Router >
      <Layout>
        <Routes>
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route path="/logout" element={<Logout />} />
          <Route path="/blogs" element={<ProtectedRoute><BlogList /></ProtectedRoute>} />
          <Route path="/" element={<ProtectedRoute><BlogList /></ProtectedRoute>} />
        </Routes>
      </Layout>
    </Router>
  );
};

function App() {
  return (
    <Provider store={store}>
      <AppContent />
    </Provider>
  );
}

export default App;