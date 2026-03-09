import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import AppNavbar from "./components/Navbar";
import PrivateRoute from "./components/PrivateRoute";
import AdminRoute from "./components/AdminRoute";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Foods from "./pages/Foods";
import AdminUsers from "./pages/AdminUsers";
import AdminDashboard from "./pages/AdminDashboard";
import EditFood from "./pages/EditFood";
import AdminCreateUser from "./pages/AdminCreateUser";
import UserDashboard from "./pages/UserDashboard";
import Favorites from "./pages/Favorites";
import MyFoods from "./pages/MyFoods";
import FoodDetail from "./pages/FoodDetail";
import DiaryCalendar from "./pages/DiaryCalendar";
import DiaryDay from "./pages/DiaryDay";

function RootRedirect() {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;
  if (user.role === "admin") return <Navigate to="/admin/dashboard" replace />;
  return <Navigate to="/dashboard" replace />; // ← usuarios van al panel
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppNavbar />
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          <Route
            path="/foods"
            element={
              <PrivateRoute>
                <Foods />
              </PrivateRoute>
            }
          />

          <Route
            path="/foods/edit/:id"
            element={
              <PrivateRoute>
                <EditFood />
              </PrivateRoute>
            }
          />

          <Route
            path="/dashboard"
            element={
              <PrivateRoute>
                <UserDashboard />
              </PrivateRoute>
            }
          />
          <Route
            path="/favorites"
            element={
              <PrivateRoute>
                <Favorites />
              </PrivateRoute>
            }
          />
          <Route
            path="/my-foods"
            element={
              <PrivateRoute>
                <MyFoods />
              </PrivateRoute>
            }
          />

          <Route
            path="/foods/detail/:id"
            element={
              <PrivateRoute>
                <FoodDetail />
              </PrivateRoute>
            }
          />
          <Route
            path="/diary"
            element={
              <PrivateRoute>
                <DiaryCalendar />
              </PrivateRoute>
            }
          />
          <Route
            path="/diary/:dateStr"
            element={
              <PrivateRoute>
                <DiaryDay />
              </PrivateRoute>
            }
          />

          <Route
            path="/admin/dashboard"
            element={
              <AdminRoute>
                <AdminDashboard />
              </AdminRoute>
            }
          />

          <Route
            path="/admin/users"
            element={
              <AdminRoute>
                <AdminUsers />
              </AdminRoute>
            }
          />

          <Route
            path="/admin/users/create"
            element={
              <AdminRoute>
                <AdminCreateUser />
              </AdminRoute>
            }
          />

          <Route path="/" element={<RootRedirect />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
