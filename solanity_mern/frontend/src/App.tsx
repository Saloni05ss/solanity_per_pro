import { Navigate, Route, Routes } from 'react-router-dom';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Feed from './pages/Feed';
import Profile from './pages/Profile';
import PostDetail from './pages/PostDetail';
import SavedAndHistoryList from './pages/SavedAndHistoryList';
import FollowList from './pages/FollowList';
import ForgotPassword from './pages/ForgotPassword';
import { useAppSelector } from './app/hooks';

export default function App() {
  const token = useAppSelector((s) => s.auth.token);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <Routes>
        <Route path="/login" element={token ? <Navigate to="/" replace /> : <Login />} />
        <Route path="/signup" element={token ? <Navigate to="/" replace /> : <Signup />} />
        <Route path="/forgot-password" element={token ? <Navigate to="/" replace /> : <ForgotPassword />} />

        <Route element={<ProtectedRoute />}>
          <Route path="/" element={<Feed />} />
          <Route path="/profile/:uid" element={<Profile />} />
          <Route path="/profile/:uid/followers" element={<FollowList />} />
          <Route path="/profile/:uid/following" element={<FollowList />} />
          <Route path="/post/:postId" element={<PostDetail />} />
          <Route path="/saved/:uid" element={<SavedAndHistoryList />} />
          <Route path="/history/:uid" element={<SavedAndHistoryList />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}
