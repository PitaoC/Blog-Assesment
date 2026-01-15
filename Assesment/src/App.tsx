import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from './store';
import Layout from './components/Layout';
import Register from './pages/Register';
import Login from './pages/Login';
import Logout from './pages/Logout';
import BlogList from './pages/BlogList';
import CreateBlog from './pages/CreateBlog';
import EditBlog from './pages/EditBlog';

function App() {
  return (
    <Provider store={store}>
      <Router >
        <Layout>
          <Routes>
            <Route path="/register" element={<Register />} />
            <Route path="/login" element={<Login />} />
            <Route path="/logout" element={<Logout />} />
            <Route path="/blogs" element={<BlogList />} />
            <Route path="/blogs/create" element={<CreateBlog />} />
            <Route path="/blogs/:id/edit" element={<EditBlog />} />
            <Route path="/" element={<BlogList />} />
          </Routes>
        </Layout>
      </Router>
    </Provider>
  );
}

export default App;