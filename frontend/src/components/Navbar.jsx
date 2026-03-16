import { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "../context/AuthContext";
import styles from "./Navbar.module.css";

export default function AppNavbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { t, i18n } = useTranslation();
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);

  const currentLang = i18n.language?.startsWith("en") ? "EN" : "ES";

  const toggleLang = () => {
    i18n.changeLanguage(currentLang === "ES" ? "en" : "es");
  };

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
          <li>
            <Link
              to="/"
              className={`${styles.navLink} ${isActive("/") ? styles.navLinkActive : ""}`}
            >
              {t("navbar.foods")}
            </Link>
          </li>
          {user?.role === "admin" && (
            <>
              <li>
                <Link
                  to="/admin/dashboard"
                  className={`${styles.navLink} ${isActive("/admin/dashboard") ? styles.navLinkActive : ""}`}
                >
                  {t("navbar.adminPanel")}
                </Link>
              </li>
              <li>
                <Link
                  to="/admin/users"
                  className={`${styles.navLink} ${isActive("/admin/users") ? styles.navLinkActive : ""}`}
                >
                  {t("navbar.users")}
                </Link>
              </li>
            </>
          )}
        </ul>

        <div className={styles.navRight}>
          <button
            className={styles.langBtn}
            onClick={toggleLang}
            title={
              currentLang === "ES" ? "Switch to English" : "Cambiar a Español"
            }
          >
            {currentLang}
          </button>

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
                    {t("navbar.myProfile")}
                  </Link>
                  {user.role !== "admin" && (
                    <>
                      <Link to="/dashboard" className={styles.dropdownItem}>
                        {t("navbar.myDashboard")}
                      </Link>
                      <Link to="/favorites" className={styles.dropdownItem}>
                        {t("navbar.favorites")}
                      </Link>
                    </>
                  )}
                  <Link to="/" className={styles.dropdownItem}>
                    🥗 {t("navbar.foods")}
                  </Link>
                  <div className={styles.dropdownDivider} />
                  <button
                    className={`${styles.dropdownItem} ${styles.dropdownItemDanger}`}
                    onClick={handleLogout}
                  >
                    {t("navbar.logout")}
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
                {t("navbar.login")}
              </button>
              <button
                className={styles.btnRegister}
                onClick={() => navigate("/register")}
              >
                {t("navbar.register")}
              </button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
