import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "../context/AuthContext";
import { foodsService, diaryService, usersService } from "../services/api";
import styles from "./FoodDetail.module.css";

export default function FoodDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { t } = useTranslation();

  const [food, setFood] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isFavorite, setIsFavorite] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [grams, setGrams] = useState(100);
  const [showModal, setShowModal] = useState(false);
  const [consuming, setConsuming] = useState(false);

  const calcCarbs = food
    ? Math.round(((food.carbs_per_100g * grams) / 100) * 10) / 10
    : 0;

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
        const foodRes = await foodsService.getById(id);
        setFood(foodRes.data);
        const token = localStorage.getItem("token");
        if (token) {
          const favRes = await usersService.getFavorites();
          setIsFavorite(favRes.data.some((f) => f.id === id));
        }
      } catch {
        setError(t("foodDetail.errorLoad"));
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  const handleToggleFavorite = async () => {
    try {
      if (isFavorite) {
        await usersService.removeFavorite(id);
      } else {
        await usersService.addFavorite(id);
      }
      setIsFavorite(!isFavorite);
    } catch {
      /* silencioso */
    }
  };

  const handleConsume = async () => {
    setConsuming(true);
    try {
      const res = await diaryService.addEntry({
        food_id: id,
        consumed_grams: grams,
      });
      setShowModal(false);
      setSuccessMessage(res.data.message);
      setTimeout(() => setSuccessMessage(""), 4000);
    } catch (err) {
      setError(err.response?.data?.detail || t("common.error"));
    } finally {
      setConsuming(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm(t("foodDetail.deleteConfirm", { name: food.name })))
      return;
    try {
      await foodsService.delete(id);
      navigate("/");
    } catch {
      alert(t("common.error"));
    }
  };

  const isOwner = user && food && food.created_by === user.id;
  const canEdit = user?.role === "admin" || isOwner;
  const hasToken = !!localStorage.getItem("token");

  if (loading)
    return (
      <div className={styles.center}>
        <span style={{ fontSize: "2.5rem" }}>🌿</span>
        <span>{t("foodDetail.loading")}</span>
      </div>
    );
  if (error && !food)
    return (
      <div className={styles.center}>
        <span style={{ fontSize: "2.5rem" }}>⚠️</span>
        <span>{error}</span>
        <button className={styles.backBtn} onClick={() => navigate(-1)}>
          {t("common.back")}
        </button>
      </div>
    );

  return (
    <div className={styles.page}>
      <div className={styles.inner}>
        <button className={styles.backBtn} onClick={() => navigate(-1)}>
          {t("common.back")}
        </button>

        {successMessage && (
          <div className={styles.successAlert}>✅ {successMessage}</div>
        )}
        {error && <div className={styles.errorAlert}>⚠️ {error}</div>}

        <div className={styles.layout}>
          <div className={styles.imageCol}>
            <div className={styles.imageWrap}>
              {food.image_url ? (
                <img
                  src={food.image_url}
                  alt={food.name}
                  className={styles.image}
                />
              ) : (
                <div className={styles.imagePlaceholder}>🍽️</div>
              )}
            </div>
          </div>

          <div className={styles.infoCol}>
            <h1 className={styles.foodName}>{food.name}</h1>
            {food.is_global && (
              <span className={styles.globalBadge}>
                {t("foodDetail.globalBadge")}
              </span>
            )}

            <div className={styles.carbsBlock}>
              <div className={styles.carbsNumber}>{food.carbs_per_100g}g</div>
              <div className={styles.carbsUnit}>
                {t("foodDetail.carbsUnit")}
              </div>
            </div>

            <div className={styles.calcBlock}>
              <div className={styles.calcLabel}>
                {t("foodDetail.calculator")}
              </div>
              <div className={styles.calcRow}>
                <div className={styles.calcInputWrap}>
                  <button
                    className={styles.calcStepper}
                    onClick={() => setGrams((g) => Math.max(1, g - 10))}
                  >
                    −
                  </button>
                  <input
                    type="number"
                    className={styles.calcInput}
                    value={grams}
                    min="1"
                    max="9999"
                    onChange={(e) =>
                      setGrams(Math.max(1, Number(e.target.value)))
                    }
                    onFocus={(e) => e.target.select()}
                  />
                  <button
                    className={styles.calcStepper}
                    onClick={() => setGrams((g) => g + 10)}
                  >
                    +
                  </button>
                </div>
                <span className={styles.calcUnit}>{t("common.grams")}</span>
              </div>
              <div className={styles.calcResultRow}>
                <span className={styles.calcResultLabel}>
                  {t("foodDetail.totalCarbs")}
                </span>
                <span
                  className={`${styles.calcResultValue} ${calcCarbs > 50 ? styles.calcResultRed : styles.calcResultGreen}`}
                >
                  {calcCarbs}g
                </span>
              </div>
            </div>

            <div className={styles.actionsBlock}>
              {hasToken ? (
                <>
                  <button
                    className={styles.btnPrimary}
                    onClick={() => setShowModal(true)}
                  >
                    {t("foodDetail.consumeBtn", { grams })}
                  </button>
                  <button
                    className={`${styles.btnSecondary} ${isFavorite ? styles.btnFavActive : ""}`}
                    onClick={handleToggleFavorite}
                  >
                    {isFavorite
                      ? t("foodDetail.favoriteRemove")
                      : t("foodDetail.favoriteAdd")}
                  </button>
                </>
              ) : (
                <button
                  className={styles.btnOutlineLogin}
                  onClick={() => navigate("/login")}
                >
                  {t("foodDetail.loginToConsume")}
                </button>
              )}
            </div>

            <div className={styles.metaBlock}>
              <div className={styles.metaRow}>
                <span className={styles.metaKey}>
                  {t("foodDetail.metaType")}
                </span>
                <span className={styles.metaVal}>
                  {food.is_global
                    ? t("foodDetail.typeGlobal")
                    : t("foodDetail.typePersonal")}
                </span>
              </div>
              <div className={styles.metaRow}>
                <span className={styles.metaKey}>
                  {t("foodDetail.metaAdded")}
                </span>
                <span className={styles.metaVal}>
                  {new Date(food.created_at).toLocaleDateString("es-ES", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </span>
              </div>
            </div>

            {canEdit && (
              <div className={styles.adminActions}>
                <button
                  className={styles.btnEdit}
                  onClick={() => navigate(`/foods/edit/${id}`)}
                >
                  ✏️ {t("common.edit")}
                </button>
                <button className={styles.btnDelete} onClick={handleDelete}>
                  🗑️ {t("common.delete")}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {showModal && (
        <div
          className={styles.modalOverlay}
          onClick={() => setShowModal(false)}
        >
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalTitle}>
              {t("foodDetail.modalTitle")}
            </div>
            <div className={styles.modalSubtitle}>
              {t("foodDetail.modalSubtitle", {
                grams,
                name: food.name,
                carbs: calcCarbs,
              })}
            </div>
            <div
              className={styles.calcInputWrap}
              style={{ width: "fit-content", marginBottom: "1rem" }}
            >
              <button
                className={styles.calcStepper}
                onClick={() => setGrams((g) => Math.max(1, g - 10))}
                disabled={consuming}
              >
                −
              </button>
              <input
                type="number"
                className={styles.calcInput}
                value={grams}
                min="1"
                max="9999"
                onChange={(e) => setGrams(Math.max(1, Number(e.target.value)))}
                onFocus={(e) => e.target.select()}
                disabled={consuming}
              />
              <button
                className={styles.calcStepper}
                onClick={() => setGrams((g) => g + 10)}
                disabled={consuming}
              >
                +
              </button>
            </div>
            <div className={styles.calcResultRow}>
              <span className={styles.calcResultLabel}>
                {t("foodDetail.totalCarbs")}
              </span>
              <span
                className={`${styles.calcResultValue} ${calcCarbs > 50 ? styles.calcResultRed : styles.calcResultGreen}`}
              >
                {calcCarbs}g
              </span>
            </div>
            <div className={styles.modalFooter}>
              <button
                className={styles.btnCancel}
                onClick={() => setShowModal(false)}
                disabled={consuming}
              >
                {t("common.cancel")}
              </button>
              <button
                className={styles.btnConfirm}
                onClick={handleConsume}
                disabled={consuming}
              >
                {consuming
                  ? t("foodDetail.confirmConsuming")
                  : t("common.confirm")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
