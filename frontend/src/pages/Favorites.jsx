import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "../context/AuthContext";
import { usersService } from "../services/api";
import FoodCard from "../components/FoodCard";
import styles from "./UserPages.module.css";

export default function Favorites() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const [favorites, setFavorites] = useState([]);
  const [favoriteIds, setFavoriteIds] = useState(new Set());
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
        const res = await usersService.getFavorites();
        setFavorites(res.data);
        setFavoriteIds(new Set(res.data.map((f) => f.id)));
      } catch {
        /* silencioso */
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleToggleFavorite = async (foodId, isFav) => {
    if (isFav) {
      await usersService.removeFavorite(foodId);
      setFavorites((prev) => prev.filter((f) => f.id !== foodId));
      setFavoriteIds((prev) => {
        const n = new Set(prev);
        n.delete(foodId);
        return n;
      });
    }
  };

  if (loading)
    return (
      <div className={styles.center}>
        <span style={{ fontSize: "1.5rem" }}>⭐</span>
        {t("favorites.loading")}
      </div>
    );

  return (
    <div className={styles.page}>
      <div className={styles.banner}>
        <h1 className={styles.bannerTitle}>{t("favorites.bannerTitle")}</h1>
        <div className={styles.breadcrumb}>
          <Link to="/">{t("common.home")}</Link>
          <span>/</span>
          <span>{t("favorites.breadcrumb")}</span>
        </div>
      </div>
      <div className={styles.content}>
        <nav className={styles.sidebar}>
          <Link to="/profile" className={styles.sidebarItem}>
            {t("sidebar.myProfile")}
          </Link>
          <Link to="/dashboard" className={styles.sidebarItem}>
            {t("sidebar.myDashboard")}
          </Link>
          <Link
            to="/favorites"
            className={`${styles.sidebarItem} ${styles.sidebarItemActive}`}
          >
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
          <div className={styles.mainHeader}>
            <h2 className={styles.mainTitle}>{t("favorites.title")}</h2>
            {favorites.length > 0 && (
              <span className={styles.countBadge}>
                {t("favorites.count", { count: favorites.length })}
              </span>
            )}
          </div>
          {favorites.length === 0 ? (
            <div className={styles.empty}>
              <div className={styles.emptyIcon}>⭐</div>
              <p className={styles.emptyTitle}>{t("favorites.emptyTitle")}</p>
              <p className={styles.emptyText}>{t("favorites.emptyText")}</p>
              <Link to="/" className={styles.btnGreen}>
                {t("favorites.exploreBtn")}
              </Link>
            </div>
          ) : (
            <div className={styles.grid}>
              {favorites.map((food) => (
                <FoodCard
                  key={food.id}
                  food={food}
                  isFavorite={favoriteIds.has(food.id)}
                  onToggleFavorite={handleToggleFavorite}
                  onClick={() => navigate(`/foods/detail/${food.id}`)}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
