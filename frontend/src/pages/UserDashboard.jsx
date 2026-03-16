import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "../context/AuthContext";
import { usersService } from "../services/api";
import styles from "./UserDashboard.module.css";

export default function UserDashboard() {
  const { user, logout } = useAuth();
  const { t } = useTranslation();

  const [stats, setStats] = useState({ foods: 0, favorites: 0, diary: 0 });
  const [loading, setLoading] = useState(true);

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
        const res = await usersService.getStats();
        setStats(res.data);
      } catch {
        /* silencioso */
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const firstName = user?.first_name || user?.username || "usuario";

  if (loading)
    return (
      <div className={styles.center}>
        <span style={{ fontSize: "1.5rem" }}>🌿</span>
        {t("dashboard.loading")}
      </div>
    );

  return (
    <div className={styles.page}>
      <div className={styles.banner}>
        <h1 className={styles.bannerTitle}>{t("dashboard.bannerTitle")}</h1>
        <div className={styles.breadcrumb}>
          <Link to="/">{t("common.home")}</Link>
          <span>/</span>
          <span>{t("dashboard.breadcrumb")}</span>
        </div>
      </div>
      <div className={styles.content}>
        <nav className={styles.sidebar}>
          <Link to="/profile" className={styles.sidebarItem}>
            {t("sidebar.myProfile")}
          </Link>
          <Link
            to="/dashboard"
            className={`${styles.sidebarItem} ${styles.sidebarItemActive}`}
          >
            {t("sidebar.myDashboard")}
          </Link>
          <Link to="/favorites" className={styles.sidebarItem}>
            {t("sidebar.favorites")}
          </Link>
          <Link to="/my-foods" className={styles.sidebarItem}>
            {t("sidebar.myFoods")}
          </Link>
          <Link to="/diary" className={styles.sidebarItem}>
            {t("sidebar.diary")}
          </Link>
          <div className={styles.sidebarDivider} />
          <button
            className={`${styles.sidebarItem} ${styles.sidebarItemDanger}`}
            onClick={logout}
          >
            {t("sidebar.logout")}
          </button>
        </nav>
        <div className={styles.main}>
          <div className={styles.greeting}>
            <h2 className={styles.greetingTitle}>
              {t("dashboard.greeting", { name: firstName })}
            </h2>
            <p className={styles.greetingText}>
              {t("dashboard.greetingText")}{" "}
              <Link to="/my-foods">{t("dashboard.greetingFoods")}</Link>,{" "}
              <Link to="/favorites">{t("dashboard.greetingFavorites")}</Link> y{" "}
              <Link to="/diary">{t("dashboard.greetingDiary")}</Link>.
            </p>
          </div>
          <div className={styles.statsRow}>
            <Link to="/my-foods" className={styles.statCard}>
              <div className={styles.statIcon}>🥗</div>
              <div className={styles.statNumber}>{stats.foods ?? 0}</div>
              <div className={styles.statLabel}>{t("dashboard.myFoods")}</div>
            </Link>
            <Link to="/favorites" className={styles.statCard}>
              <div className={styles.statIcon}>⭐</div>
              <div className={styles.statNumber}>{stats.favorites ?? 0}</div>
              <div className={styles.statLabel}>{t("dashboard.favorites")}</div>
            </Link>
            <Link to="/diary" className={styles.statCard}>
              <div className={styles.statIcon}>📅</div>
              <div className={styles.statNumber}>{stats.diary ?? 0}</div>
              <div className={styles.statLabel}>{t("dashboard.diary")}</div>
            </Link>
          </div>
          <div className={styles.sectionTitle}>
            {t("dashboard.quickLinksTitle")}
          </div>
          <div className={styles.quickLinks}>
            {[
              { to: "/my-foods", label: t("dashboard.linkMyFoods") },
              { to: "/favorites", label: t("dashboard.linkFavorites") },
              { to: "/diary", label: t("dashboard.linkDiary") },
              { to: "/", label: t("dashboard.linkExplore") },
              { to: "/profile", label: t("dashboard.linkProfile") },
            ].map(({ to, label }) => (
              <Link key={to} to={to} className={styles.quickLink}>
                <span className={styles.quickLinkLeft}>{label}</span>
                <span className={styles.quickLinkArrow}>›</span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
