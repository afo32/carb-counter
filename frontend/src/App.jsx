import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import AppNavbar from "./components/Navbar";
import PrivateRoute from "./components/PrivateRoute";
import AdminRoute from "./components/AdminRoute";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Foods from "./pages/Foods";
import EditFood from "./pages/EditFood";
import FoodDetail from "./pages/FoodDetail";
import AdminUsers from "./pages/AdminUsers";
import AdminDashboard from "./pages/AdminDashboard";
import AdminCreateUser from "./pages/AdminCreateUser";
import UserDashboard from "./pages/UserDashboard";
import Favorites from "./pages/Favorites";
import MyFoods from "./pages/MyFoods";
import DiaryCalendar from "./pages/DiaryCalendar";
import DiaryDay from "./pages/DiaryDay";
import EditProfile from "./pages/EditProfile";

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppNavbar />
        <Routes>
          {/* ── Rutas públicas ── */}
          <Route path="/" element={<Foods />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/foods/detail/:id" element={<FoodDetail />} />

          {/* ── Rutas privadas (requieren login) ── */}
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
            path="/profile"
            element={
              <PrivateRoute>
                <EditProfile />
              </PrivateRoute>
            }
          />

          {/* ── Rutas de admin ── */}
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
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
