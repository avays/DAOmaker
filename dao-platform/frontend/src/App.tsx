import { Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Layout from './components/layout/Layout';
import Home from './pages/Home';
import Explore from './pages/Explore';
import CreateDAO from './pages/CreateDAO';
import DAODetail from './pages/DAODetail';
import Governance from './pages/Governance';
import Treasury from './pages/Treasury';
import Members from './pages/Members';
import Profile from './pages/Profile';

function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="explore" element={<Explore />} />
          <Route path="create" element={<CreateDAO />} />
          <Route path="dao/:address">
            <Route index element={<DAODetail />} />
            <Route path="governance" element={<Governance />} />
            <Route path="treasury" element={<Treasury />} />
            <Route path="members" element={<Members />} />
          </Route>
          <Route path="profile" element={<Profile />} />
        </Route>
      </Routes>
      <Toaster
        position="bottom-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#1f2937',
            color: '#f3f4f6',
          },
        }}
      />
    </>
  );
}

export default App;