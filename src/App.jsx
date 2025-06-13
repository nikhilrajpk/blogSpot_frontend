import { useEffect, lazy, Suspense } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { BrowserRouter as Router, Routes, Route, Navigate, Link } from 'react-router-dom';
import { checkAuth, logout, selectIsAuthenticated, selectCurrentUser } from './store/slices/authSlice';
import { selectToast, showToast } from './store/slices/toastSlice';
import Toast from './utils/Toast';
import LoadingSpinners from './utils/Loader';

const Login = lazy(() => import('./Components/Login'));
const Register = lazy(() => import('./Components/Register'));
const Dashboard = lazy(() => import('./Components/Dashboard'));
const PostList = lazy(() => import('./Components/PostList'));
const PostDetail = lazy(() => import('./Components/PostDetail'));
const AdminUsers = lazy(() => import('./Components/AdminUsers'));
const AdminPosts = lazy(() => import('./Components/AdminPosts'));
const AdminComments = lazy(() => import('./Components/AdminComments'));

function App() {
  const dispatch = useDispatch();
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const user = useSelector(selectCurrentUser);
  const toast = useSelector(selectToast);

  useEffect(() => {
    dispatch(checkAuth());
  }, [dispatch]);

  return (
    <Router>
      <div className="min-h-screen bg-gray-100">
        <nav className="bg-emerald-600 text-white p-4 shadow-md">
          <div className="container mx-auto flex justify-between items-center">
            <Link to="/" className="text-2xl font-bold">BlogSpot</Link>
            <div className="space-x-4">
              {isAuthenticated ? (
                <>
                  <Link to="/dashboard" className="hover:underline">Dashboard</Link>
                  <Link to="/posts" className="hover:underline">Posts</Link>
                  {user?.is_staff && (
                    <>
                      <Link to="/admin/users" className="hover:underline">Manage Users</Link>
                      <Link to="/admin/posts" className="hover:underline">Manage Posts</Link>
                      <Link to="/admin/comments" className="hover:underline">Manage Comments</Link>
                    </>
                  )}
                  <Link
                    to="/"
                    className="hover:underline"
                    onClick={() => {
                      dispatch(logout());
                      dispatch(showToast({ message: 'Logged out successfully!', type: 'success' }));
                    }}
                  >
                    Logout
                  </Link>
                </>
              ) : (
                <>
                  <Link to="/login" className="hover:underline">Login</Link>
                  <Link to="/register" className="hover:underline">Register</Link>
                </>
              )}
            </div>
          </div>
        </nav>
        <Suspense fallback={<LoadingSpinners />}>
          <Routes>
            <Route path="/" element={<PostList />} />
            <Route path="/login" element={isAuthenticated ? <Navigate to="/posts" /> : <Login />} />
            <Route path="/register" element={isAuthenticated ? <Navigate to="/posts" /> : <Register />} />
            <Route path="/dashboard" element={isAuthenticated ? <Dashboard /> : <Navigate to="/login" />} />
            <Route path="/posts" element={isAuthenticated ? <PostList /> : <Navigate to="/login" />} />
            <Route path="/posts/:id" element={isAuthenticated ? <PostDetail /> : <Navigate to="/login" />} />
            <Route
              path="/admin/users"
              element={isAuthenticated && user?.is_staff ? <AdminUsers /> : <Navigate to="/login" />}
            />
            <Route
              path="/admin/posts"
              element={isAuthenticated && user?.is_staff ? <AdminPosts /> : <Navigate to="/login" />}
            />
            <Route
              path="/admin/comments"
              element={isAuthenticated && user?.is_staff ? <AdminComments /> : <Navigate to="/login" />}
            />
          </Routes>
        </Suspense>
        {toast.isVisible && <Toast message={toast.message} type={toast.type} duration={toast.duration} />}
      </div>
    </Router>
  );
}

export default App;