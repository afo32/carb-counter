import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "../context/AuthContext";
import { foodsService, usersService } from "../services/api";
import FoodCard from "../components/FoodCard";
import FoodModal from "../components/FoodModal";
import OpenFoodFactsSearch from "../components/OpenFoodFactsSearch";
import styles from "./Foods.module.css";

export default function Foods() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const [foods, setFoods] = useState([]);
  const [favoriteIds, setFavoriteIds] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingFood, setEditingFood] = useState(null);
  const [showOffSearch, setShowOffSearch] = useState(false);

  useEffect(() => {
    const link = document.createElement("link");
    link.href =
      "https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&display=swap";
    link.rel = "stylesheet";
    document.head.appendChild(link);
    return () => document.head.removeChild(link);
  }, []);

  const loadFoods = async (searchTerm = "") => {
    try {
      setLoading(true);
      if (user) {
        const [foodsRes, favoritesRes] = await Promise.all([
          foodsService.getAll(searchTerm),
          usersService.getFavorites(),
        ]);
        setFoods(Array.isArray(foodsRes.data) ? foodsRes.data : []);
        setFavoriteIds(new Set(favoritesRes.data.map((f) => f.id)));
      } else {
        const foodsRes = await foodsService.getAll(searchTerm);
        setFoods(Array.isArray(foodsRes.data) ? foodsRes.data : []);
      }
    } catch {
      setError(t("foods.errorLoad"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFoods(search);
  }, [search, user]);

  const handleSearch = (e) => {
    e.preventDefault();
    setSearch(searchInput);
  };

  const handleToggleFavorite = async (foodId, isFav) => {
    if (!user) return navigate("/login");
    try {
      if (isFav) {
        await usersService.removeFavorite(foodId);
        setFavoriteIds((prev) => {
          const s = new Set(prev);
          s.delete(foodId);
          return s;
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
    if (!window.confirm(t("foods.deleteConfirm", { name: food.name }))) return;
    try {
      await foodsService.delete(food.id);
      setFoods((prev) => prev.filter((f) => f.id !== food.id));
    } catch {
      alert(t("foods.deleteError"));
    }
  };
  const handleModalSuccess = () => {
    setShowModal(false);
    setEditingFood(null);
    loadFoods(search);
  };

  return (
    <div className={styles.page}>
      <section className={styles.hero}>
        <div className={styles.heroInner}>
          <p className={styles.heroEyebrow}>{t("foods.eyebrow")}</p>
          <h1 className={styles.heroTitle}>
            {t("foods.heroTitle")
              .split("\n")
              .map((line, i) => (
                <span key={i}>
                  {line}
                  {i === 0 && <br />}
                </span>
              ))}
          </h1>
          <p className={styles.heroSubtitle}>{t("foods.heroSubtitle")}</p>
          <form onSubmit={handleSearch}>
            <div className={styles.searchWrap}>
              <span className="me-2">🔍</span>
              <input
                className={styles.searchInput}
                placeholder={t("foods.searchPlaceholder")}
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
              />
              <button type="submit" className={styles.searchBtn}>
                {t("foods.searchBtn")}
              </button>
            </div>
          </form>
        </div>
      </section>

      <div className={styles.statsBar}>
        <div className="d-flex align-items-center flex-wrap gap-2">
          <span className={styles.statsBadge}>
            {loading ? "..." : t("foods.count", { count: foods.length })}
          </span>
          {search && (
            <span className={styles.searchBadge}>
              🔍 "{search}"
              <button
                className={styles.clearSearch}
                onClick={() => {
                  setSearch("");
                  setSearchInput("");
                }}
              >
                ×
              </button>
            </span>
          )}
        </div>
        <div className="d-flex flex-wrap gap-2">
          {user ? (
            <>
              <button
                className={`${styles.btnPill} ${styles.btnOutline}`}
                onClick={() => setShowOffSearch(true)}
              >
                {t("foods.addOff")}
              </button>
              <button
                className={`${styles.btnPill} ${styles.btnGreen}`}
                onClick={() => {
                  setEditingFood(null);
                  setShowModal(true);
                }}
              >
                {t("foods.addFood")}
              </button>
            </>
          ) : (
            <button
              className={`${styles.btnPill} ${styles.btnOutline}`}
              onClick={() => navigate("/login")}
            >
              {t("foods.loginToAdd")}
            </button>
          )}
        </div>
      </div>

      {error && (
        <div className="mx-auto my-3 px-3" style={{ maxWidth: "1200px" }}>
          <div className="alert alert-danger rounded-3">⚠️ {error}</div>
        </div>
      )}

      {loading ? (
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}>🌿</div>
          <p className="fw-bold" style={{ color: "#198754" }}>
            {t("foods.loadingFoods")}
          </p>
        </div>
      ) : foods.length === 0 ? (
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}>🍽️</div>
          <p className={styles.emptyTitle}>
            {search
              ? t("foods.emptySearch", { term: search })
              : t("foods.emptyTitle")}
          </p>
          <p className="text-muted">
            {search
              ? t("foods.emptySearchSuggestion")
              : t("foods.emptySuggestion")}
          </p>
          {user && (
            <button
              className={`${styles.btnPill} ${styles.btnGreen} mt-3`}
              onClick={() => setShowModal(true)}
            >
              {t("foods.addFood")}
            </button>
          )}
        </div>
      ) : (
        <div className={styles.grid}>
          {foods.map((food) => (
            <FoodCard
              key={food.id}
              food={food}
              isFavorite={favoriteIds.has(food.id)}
              onToggleFavorite={user ? handleToggleFavorite : null}
              onEdit={handleEdit}
              onDelete={handleDelete}
              userRole={user?.role}
              userId={user?.id}
              onClick={() => navigate(`/foods/detail/${food.id}`)}
            />
          ))}
        </div>
      )}

      {showModal && (
        <FoodModal
          show={showModal}
          onHide={() => {
            setShowModal(false);
            setEditingFood(null);
          }}
          onSuccess={handleModalSuccess}
          editFood={editingFood}
        />
      )}
      {showOffSearch && (
        <OpenFoodFactsSearch
          show={showOffSearch}
          onHide={() => setShowOffSearch(false)}
          onImport={() => {
            setShowOffSearch(false);
            loadFoods(search);
          }}
        />
      )}
    </div>
  );
}
