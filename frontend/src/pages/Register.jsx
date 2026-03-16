import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "../context/AuthContext";
import styles from "./Auth.module.css";

export default function Register() {
  const navigate = useNavigate();
  const { register } = useAuth();
  const { t } = useTranslation();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    username: "",
    first_name: "",
    last_name: "",
    country: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const link = document.createElement("link");
    link.href =
      "https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&display=swap";
    link.rel = "stylesheet";
    document.head.appendChild(link);
    return () => document.head.removeChild(link);
  }, []);

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (formData.password !== formData.confirmPassword)
      return setError(t("register.errorPasswordMatch"));
    if (formData.password.length < 6)
      return setError(t("register.errorPasswordLength"));
    setLoading(true);
    try {
      const userData = await register(
        formData.email,
        formData.password,
        formData.username,
        formData.first_name,
        formData.last_name,
        formData.country,
      );
      navigate(userData.role === "admin" ? "/admin/dashboard" : "/");
    } catch (err) {
      setError(err.response?.data?.detail || t("register.errorDefault"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.banner}>
        <h1 className={styles.bannerTitle}>{t("register.bannerTitle")}</h1>
        <div className={styles.breadcrumb}>
          <Link to="/">{t("common.home")}</Link>
          <span>/</span>
          <span>{t("register.breadcrumb")}</span>
        </div>
      </div>

      <div className={styles.content}>
        <h2 className={styles.sectionTitle}>{t("register.title")}</h2>

        {error && <div className={styles.errorAlert}>⚠️ {error}</div>}

        <form onSubmit={handleSubmit}>
          <div className={styles.fieldRow}>
            <div className={styles.fieldGroup}>
              <label className={styles.label}>{t("register.firstName")}</label>
              <input
                type="text"
                name="first_name"
                className={styles.input}
                value={formData.first_name}
                onChange={handleChange}
                placeholder={t("register.firstName")}
              />
            </div>
            <div className={styles.fieldGroup}>
              <label className={styles.label}>{t("register.lastName")}</label>
              <input
                type="text"
                name="last_name"
                className={styles.input}
                value={formData.last_name}
                onChange={handleChange}
                placeholder={t("register.lastName")}
              />
            </div>
          </div>

          <div className={styles.fieldGroup}>
            <label className={styles.label}>
              {t("register.username")}{" "}
              <span className={styles.required}>{t("common.required")}</span>
            </label>
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
            <label className={styles.label}>
              {t("register.email")}{" "}
              <span className={styles.required}>{t("common.required")}</span>
            </label>
            <input
              type="email"
              name="email"
              className={styles.input}
              value={formData.email}
              onChange={handleChange}
              required
              autoComplete="email"
            />
          </div>

          <div className={styles.fieldGroup}>
            <label className={styles.label}>{t("register.country")}</label>
            <input
              type="text"
              name="country"
              className={styles.input}
              value={formData.country}
              onChange={handleChange}
              placeholder={t("register.countryPlaceholder")}
            />
          </div>

          <div className={styles.fieldRow}>
            <div className={styles.fieldGroup}>
              <label className={styles.label}>
                {t("register.password")}{" "}
                <span className={styles.required}>{t("common.required")}</span>
              </label>
              <input
                type="password"
                name="password"
                className={styles.input}
                value={formData.password}
                onChange={handleChange}
                required
                autoComplete="new-password"
              />
            </div>
            <div className={styles.fieldGroup}>
              <label className={styles.label}>
                {t("register.confirmPassword")}{" "}
                <span className={styles.required}>{t("common.required")}</span>
              </label>
              <input
                type="password"
                name="confirmPassword"
                className={styles.input}
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                autoComplete="new-password"
              />
            </div>
          </div>

          <div className={styles.formRow}>
            <button
              type="submit"
              className={styles.btnSubmit}
              disabled={loading}
            >
              {loading ? t("register.submitting") : t("register.submit")}
            </button>
          </div>
        </form>

        <div className={styles.dividerText}>o</div>
        <span>{t("register.hasAccount")} </span>
        <Link to="/login" className={styles.linkSecondary}>
          {t("register.loginLink")}
        </Link>
      </div>
    </div>
  );
}
