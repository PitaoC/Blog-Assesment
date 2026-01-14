import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from './store';
import Layout from './components/Layout';
import Register from './pages/Register';
import Login from './pages/Login';
import Logout from './pages/Logout';
import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { setUser } from './store/slices/authSlice';
import { supabase } from './utils/supabase';

function App() {
  const dispatch = useDispatch();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      dispatch(setUser(session?.user ?? null));
    });

    return () => subscription.unsubscribe();
  }, [dispatch]);

  return (
    <Provider store={store}>
      <Router >
        <Layout>
          <Routes>
            <Route path="/" element={<div>Welcome to the Blog App</div>} />
            <Route path="/register" element={<Register />} />
            <Route path="/login" element={<Login />} />
            <Route path="/logout" element={<Logout />} />
          </Routes>
        </Layout>
      </Router>
    </Provider>
  );
}

export default App;