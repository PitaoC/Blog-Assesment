import { BrowserRouter as Router, Routes } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from './store';
import Layout from './components/Layout';


function App() {
  return (
    <Provider store={store}>
      <Router >
        <Layout>
          <Routes>
          </Routes>
        </Layout>
      </Router>
    </Provider>
  );
}

export default App;