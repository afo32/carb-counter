import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "../context/AuthContext";
import { usersService, foodsService } from "../services/api";
import FoodCard from "../components/FoodCard";
import FoodModal from "../components/FoodModal";
import styles from "./UserPages.module.css";

export default function MyFoods() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const [foods, setFoods] = useState([]);
  const [favoriteIds, setFavoriteIds] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingFood, setEditingFood] = useState(null);

  useEffect(() => {
    const link = document.createElement("link");
    link.href =
      "https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&display=swap";
    link.rel = "stylesheet";
    document.head.appendChild(link);
    return () => document.head.removeChild(link);
  }, []);

  const load = async () => {
    try {
      const [myFoodsRes, favoritesRes] = await Promise.all([
        usersService.getMyFoods(),
        usersService.getFavorites(),
      ]);
      setFoods(myFoodsRes.data);
      setFavoriteIds(new Set(favoritesRes.data.map((f) => f.id)));
    } catch {
      /* silencioso */
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleToggleFavorite = async (foodId, isFav) => {
    try {
      if (isFav) {
        await usersService.removeFavorite(foodId);
        setFavoriteIds((prev) => {
          const n = new Set(prev);
          n.delete(foodId);
          return n;
        });
      } else {
        await usersService.addFavorite(foodId);
        setFavoriteIds((prev) => new Set([...prev, foodId]));
      }
    } catch {
      /* silencioso */
    }
  };

  const handleEdit = (food) => {
    setEditingFood(food);
    setShowModal(true);
  };
  const handleDelete = async (food) => {
    if (!window.confirm(t("myFoods.deleteConfirm", { name: food.name })))
      return;
    try {
      await foodsService.delete(food.id);
      load();
    } catch {
      alert(t("myFoods.deleteError"));
    }
  };

  if (loading)
    return (
      <div className={styles.center}>
        <span style={{ fontSize: "1.5rem" }}>🥗</span>
        {t("myFoods.loading")}
      </div>
    );

  return (
    <div className={styles.page}>
      <div className={styles.banner}>
        <h1 className={styles.bannerTitle}>{t("myFoods.bannerTitle")}</h1>
        <div className={styles.breadcrumb}>
          <Link to="/">{t("common.home")}</Link>
          <span>/</span>
          <span>{t("myFoods.breadcrumb")}</span>
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
          <Link to="/favorites" className={styles.sidebarItem}>
            {t("sidebar.favorites")}
          </Link>
          <Link
            to="/my-foods"
            className={`${styles.sidebarItem} ${styles.sidebarItemActive}`}
          >
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
            <h2 className={styles.mainTitle}>{t("myFoods.title")}</h2>
            <div
              style={{
                display: "flex",
                gap: "0.75rem",
                alignItems: "center",
                flexWrap: "wrap",
              }}
            >
              {foods.length > 0 && (
                <span className={styles.countBadge}>
                  {t("myFoods.count", { count: foods.length })}
                </span>
              )}
              <button
                className={styles.btnGreen}
                onClick={() => {
                  setEditingFood(null);
                  setShowModal(true);
                }}
              >
                {t("myFoods.addBtn")}
              </button>
            </div>
          </div>
          {foods.length === 0 ? (
            <div className={styles.empty}>
              <div className={styles.emptyIcon}>🥗</div>
              <p className={styles.emptyTitle}>{t("myFoods.emptyTitle")}</p>
              <p className={styles.emptyText}>{t("myFoods.emptyText")}</p>
              <button
                className={styles.btnGreen}
                onClick={() => setShowModal(true)}
              >
                {t("myFoods.emptyBtn")}
              </button>
            </div>
          ) : (
            <div className={styles.grid}>
              {foods.map((food) => (
                <FoodCard
                  key={food.id}
                  food={food}
                  isFavorite={favoriteIds.has(food.id)}
                  onToggleFavorite={handleToggleFavorite}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  userRole={user?.role}
                  userId={user?.id}
                  onClick={() => navigate(`/foods/detail/${food.id}`)}
                />
              ))}
            </div>
          )}
        </div>
      </div>
      {showModal && (
        <FoodModal
          show={showModal}
          onHide={() => {
            setShowModal(false);
            setEditingFood(null);
          }}
          onSuccess={() => {
            setShowModal(false);
            setEditingFood(null);
            load();
          }}
          editFood={editingFood}
        />
      )}
    </div>
  );
}
