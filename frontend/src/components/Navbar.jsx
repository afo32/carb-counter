import { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import styles from "./Navbar.module.css";

export default function AppNavbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);

  const handleLogout = async () => {
    setOpen(false);
    await logout();
  };

  const initial = user?.username?.[0]?.toUpperCase() || "?";

  const isActive = (path) => location.pathname === path;

  return (
    <nav className={styles.navbar}>
      <div className={styles.inner}>
        <Link to="/" className={styles.logo}>
          🌿 Carb<span>Counter</span>
        </Link>

        <ul className={styles.navLinks}>
          {user?.role === "admin" && (
            <>
              <li>
                <Link
                  to="/admin/dashboard"
                  className={`${styles.navLink} ${isActive("/admin/dashboard") ? styles.navLinkActive : ""}`}
                >
                  Panel Admin
                </Link>
              </li>
              <li>
                <Link
                  to="/admin/users"
                  className={`${styles.navLink} ${isActive("/admin/users") ? styles.navLinkActive : ""}`}
                >
                  Usuarios
                </Link>
              </li>
            </>
          )}
        </ul>

        <div className={styles.navRight}>
          {user ? (
            <div className={styles.dropdownWrap} ref={dropdownRef}>
              <button
                className={styles.dropdownTrigger}
                onClick={() => setOpen(!open)}
              >
                <div className={styles.avatar}>{initial}</div>
                {user.username}
                {user.role === "admin" && (
                  <span className={styles.adminBadge}>Admin</span>
                )}
                <span
                  className={`${styles.chevron} ${open ? styles.chevronOpen : ""}`}
                >
                  ▼
                </span>
              </button>

              {open && (
                <div className={styles.dropdownMenu}>
                  <Link to="/profile" className={styles.dropdownItem}>
                    👤 Mi Perfil
                  </Link>

                  {user.role !== "admin" && (
                    <Link to="/dashboard" className={styles.dropdownItem}>
                      🏠 Mi Panel
                    </Link>
                  )}

                  <Link to="/" className={styles.dropdownItem}>
                    🥗 Alimentos
                  </Link>

                  <div className={styles.dropdownDivider} />

                  <button
                    className={`${styles.dropdownItem} ${styles.dropdownItemDanger}`}
                    onClick={handleLogout}
                  >
                    🚪 Cerrar sesión
                  </button>
                </div>
              )}
            </div>
          ) : (
            <>
              <button
                className={styles.btnLogin}
                onClick={() => navigate("/login")}
              >
                Iniciar sesión
              </button>
              <button
                className={styles.btnRegister}
                onClick={() => navigate("/register")}
              >
                Registrarse
              </button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
