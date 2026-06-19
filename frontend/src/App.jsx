import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import Departments from './pages/Departments';
import History from './pages/History';
import Templates from './pages/Templates';
import GenerateDocument from './pages/GenerateDocument';
import Settings from './pages/Settings';

function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/departments" element={<Departments />} />
          <Route path="/history" element={<History />} />
          <Route path="/templates" element={<Templates />} />
          <Route path="/generate-document" element={<GenerateDocument />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}

export default App;