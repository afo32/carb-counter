import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "../context/AuthContext";
import { usersService } from "../services/api";
import styles from "./EditProfile.module.css";

export default function EditProfile() {
  const { user, setUser, logout } = useAuth();
  const { t } = useTranslation();

  const [formData, setFormData] = useState({
    username: "",
    first_name: "",
    last_name: "",
    country: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    const link = document.createElement("link");
    link.href =
      "https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&display=swap";
    link.rel = "stylesheet";
    document.head.appendChild(link);
    return () => document.head.removeChild(link);
  }, []);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await usersService.getProfile();
        setFormData({
          username: res.data.username || "",
          first_name: res.data.first_name || "",
          last_name: res.data.last_name || "",
          country: res.data.country || "",
        });
      } catch {
        setError(t("profile.errorLoad"));
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setSaving(true);
    try {
      const res = await usersService.updateProfile(formData);
      const updatedUser = { ...user, ...res.data };
      setUser(updatedUser);
      localStorage.setItem("user", JSON.stringify(updatedUser));
      setSuccess(t("profile.successMsg"));
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err.response?.data?.detail || t("profile.errorSave"));
    } finally {
      setSaving(false);
    }
  };

  const initial = user?.username?.[0]?.toUpperCase() || "?";

  if (loading)
    return (
      <div className={styles.center}>
        <span style={{ fontSize: "1.5rem" }}>🌿</span>
        {t("profile.loading")}
      </div>
    );

  return (
    <div className={styles.page}>
      <div className={styles.banner}>
        <h1 className={styles.bannerTitle}>{t("profile.bannerTitle")}</h1>
        <div className={styles.breadcrumb}>
          <Link to="/">{t("common.home")}</Link>
          <span>/</span>
          <span>{t("profile.breadcrumb")}</span>
        </div>
      </div>
      <div className={styles.content}>
        <nav className={styles.sidebar}>
          <Link
            to="/profile"
            className={`${styles.sidebarItem} ${styles.sidebarItemActive}`}
          >
            {t("sidebar.myProfile")}
          </Link>
          {user?.role !== "admin" && (
            <Link to="/dashboard" className={styles.sidebarItem}>
              {t("sidebar.myDashboard")}
            </Link>
          )}
          <Link to="/favorites" className={styles.sidebarItem}>
            {t("sidebar.favorites")}
          </Link>
          <Link to="/diary" className={styles.sidebarItem}>
            {t("sidebar.diary")}
          </Link>
          <Link to="/" className={styles.sidebarItem}>
            🥗 {t("navbar.foods")}
          </Link>
          <div className={styles.sidebarDivider} />
          <button
            className={`${styles.sidebarItem} ${styles.sidebarItemDanger}`}
            onClick={logout}
          >
            {t("sidebar.logout")}
          </button>
        </nav>
        <div className={styles.formSection}>
          <div className={styles.avatarWrap}>
            <div className={styles.avatar}>{initial}</div>
            <div>
              <div className={styles.avatarName}>{user?.username}</div>
              <span
                className={`${styles.avatarBadge} ${user?.role === "admin" ? styles.avatarBadgeAdmin : ""}`}
              >
                {user?.role === "admin"
                  ? t("profile.badgeAdmin")
                  : t("profile.badgeUser")}
              </span>
            </div>
          </div>
          <h2 className={styles.sectionTitle}>{t("profile.title")}</h2>
          <p className={styles.sectionSubtitle}>{t("profile.subtitle")}</p>
          {error && <div className={styles.errorAlert}>⚠️ {error}</div>}
          {success && <div className={styles.successAlert}>✅ {success}</div>}
          <form onSubmit={handleSubmit}>
            <div className={styles.fieldRow}>
              <div className={styles.fieldGroup}>
                <label className={styles.label}>{t("profile.firstName")}</label>
                <input
                  type="text"
                  name="first_name"
                  className={styles.input}
                  value={formData.first_name}
                  onChange={handleChange}
                  placeholder={t("profile.firstNamePlaceholder")}
                />
              </div>
              <div className={styles.fieldGroup}>
                <label className={styles.label}>{t("profile.lastName")}</label>
                <input
                  type="text"
                  name="last_name"
                  className={styles.input}
                  value={formData.last_name}
                  onChange={handleChange}
                  placeholder={t("profile.lastNamePlaceholder")}
                />
              </div>
            </div>
            <div className={styles.fieldGroup}>
              <label className={styles.label}>{t("profile.username")}</label>
              <input
                type="text"
                name="username"
                className={styles.input}
                value={formData.username}
                onChange={handleChange}
                required
              />
            </div>
            <div className={styles.fieldGroup}>
              <label className={styles.label}>{t("profile.country")}</label>
              <input
                type="text"
                name="country"
                className={styles.input}
                value={formData.country}
                onChange={handleChange}
                placeholder={t("profile.countryPlaceholder")}
              />
            </div>
            <div className={styles.fieldGroup}>
              <label className={styles.label}>{t("profile.email")}</label>
              <input
                className={`${styles.input} ${styles.inputDisabled}`}
                value={user?.email || ""}
                disabled
              />
              <span className={styles.inputHint}>{t("profile.emailHint")}</span>
            </div>
            <div className={styles.formActions}>
              <button
                type="submit"
                className={styles.btnSubmit}
                disabled={saving}
              >
                {saving ? t("profile.submitting") : t("profile.submit")}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
