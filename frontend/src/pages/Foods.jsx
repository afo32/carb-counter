import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { foodsService, usersService } from "../services/api";
import FoodCard from "../components/FoodCard";
import FoodModal from "../components/FoodModal";
import OpenFoodFactsSearch from "../components/OpenFoodFactsSearch";
import styles from "./Foods.module.css";

export default function Foods() {
  const { user } = useAuth();
  const navigate = useNavigate();

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
      setError("Error al cargar los alimentos");
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
    if (!window.confirm(`¿Eliminar "${food.name}"?`)) return;
    try {
      await foodsService.delete(food.id);
      setFoods((prev) => prev.filter((f) => f.id !== food.id));
    } catch {
      alert("Error al eliminar");
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
          <p className={styles.heroEyebrow}>🌱 Alimentación consciente</p>
          <h1 className={styles.heroTitle}>
            Descubre los carbohidratos
            <br />
            de lo que comes
          </h1>
          <p className={styles.heroSubtitle}>
            Base de datos de alimentos con información nutricional al instante.
          </p>

          <form onSubmit={handleSearch}>
            <div className={styles.searchWrap}>
              <span className="me-2">🔍</span>
              <input
                className={styles.searchInput}
                placeholder="Buscar alimento... (ej: arroz, banana)"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
              />
              <button type="submit" className={styles.searchBtn}>
                Buscar
              </button>
            </div>
          </form>
        </div>
      </section>

      <div className={styles.statsBar}>
        <div className="d-flex align-items-center flex-wrap gap-2">
          <span className={styles.statsBadge}>
            {loading ? "..." : `${foods.length} alimentos`}
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
                🌍 Open Food Facts
              </button>
              <button
                className={`${styles.btnPill} ${styles.btnGreen}`}
                onClick={() => {
                  setEditingFood(null);
                  setShowModal(true);
                }}
              >
                + Agregar alimento
              </button>
            </>
          ) : (
            <button
              className={`${styles.btnPill} ${styles.btnOutline}`}
              onClick={() => navigate("/login")}
            >
              Iniciá sesión para agregar →
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
            Cargando alimentos...
          </p>
        </div>
      ) : foods.length === 0 ? (
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}>🍽️</div>
          <p className={styles.emptyTitle}>
            {search
              ? `Sin resultados para "${search}"`
              : "No hay alimentos todavía"}
          </p>
          <p className="text-muted">
            {search
              ? "Probá con otro término o buscá en Open Food Facts"
              : "Sé el primero en agregar un alimento"}
          </p>
          {user && (
            <button
              className={`${styles.btnPill} ${styles.btnGreen} mt-3`}
              onClick={() => setShowModal(true)}
            >
              + Agregar alimento
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
