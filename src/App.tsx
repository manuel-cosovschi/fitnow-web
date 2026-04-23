import { Routes, Route } from 'react-router-dom';
import Splash from './pages/Splash';
import Login from './pages/Login';
import MainLayout from './layouts/MainLayout';
import Home from './pages/Home';
import Explore from './pages/Explore';
import Profile from './pages/Profile';
import ActivityDetail from './pages/ActivityDetail';
import ProviderDashboard from './pages/ProviderDashboard';
import RunHub from './pages/RunHub';
import GymHub from './pages/GymHub';
import Enrollments from './pages/Enrollments';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Splash />} />
      <Route path="/login" element={<Login />} />
      <Route element={<MainLayout />}>
        <Route path="/home" element={<Home />} />
        <Route path="/explore" element={<Explore />} />
        <Route path="/explore/:id" element={<ActivityDetail />} />
        <Route path="/run" element={<RunHub />} />
        <Route path="/gym" element={<GymHub />} />
        <Route path="/enrollments" element={<Enrollments />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/provider" element={<ProviderDashboard />} />
      </Route>
    </Routes>
  );
}

export default App;
