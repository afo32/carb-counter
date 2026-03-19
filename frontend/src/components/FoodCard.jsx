import { useState } from "react";
import { useTranslation } from "react-i18next";
import styles from "./FoodCard.module.css";

export default function FoodCard({
  food,
  isFavorite,
  onToggleFavorite,
  onEdit,
  onDelete,
  userRole,
  userId,
  onClick,
}) {
  const { t } = useTranslation();
  const [showCalc, setShowCalc] = useState(false);
  const [grams, setGrams] = useState(100);

  const calcCarbs = Math.round(((food.carbs_per_100g * grams) / 100) * 10) / 10;
  const isOwner = food.created_by === userId;
  const canEdit = userRole === "admin" || isOwner;

  return (
    <div className={styles.card} onClick={onClick}>
      {food.image_url ? (
        <img src={food.image_url} alt={food.name} className={styles.cardImg} />
      ) : (
        <div className={styles.cardImgPlaceholder}>🥗</div>
      )}

      {food.is_global && (
        <span className={styles.globalBadge}>{t("foods.globalBadge")}</span>
      )}

      <div className={styles.cardBody}>
        <div className={styles.cardName}>{food.name}</div>
        <span className={styles.carbsBadge}>
          🌾 {food.carbs_per_100g}
          {t("common.carbsPer100g")}
        </span>

        <div onClick={(e) => e.stopPropagation()}>
          <button
            className={styles.calcToggle}
            onClick={() => setShowCalc(!showCalc)}
          >
            {t("foods.calculator")} {showCalc ? "▲" : "▼"}
          </button>

          {showCalc && (
            <div className={styles.calcBox}>
              <div className="d-flex align-items-center gap-2">
                <input
                  type="number"
                  value={grams}
                  min="1"
                  max="9999"
                  className={styles.calcInput}
                  onChange={(e) =>
                    setGrams(Math.max(1, Number(e.target.value)))
                  }
                  onFocus={(e) => e.target.select()}
                />
                <span className={`${styles.calcResultLabel} fw-semibold`}>
                  {t("common.grams")}
                </span>
              </div>
              <div className={styles.calcResult}>
                <span className={styles.calcResultLabel}>
                  {t("foods.carbohydrates")}
                </span>
                <span
                  className={`${styles.calcResultValue} ${calcCarbs > 50 ? styles.calcResultRed : styles.calcResultGreen}`}
                >
                  {calcCarbs}g
                </span>
              </div>
            </div>
          )}
        </div>

        <div className={styles.cardFooter} onClick={(e) => e.stopPropagation()}>
          <div className="d-flex gap-2">
            {canEdit && (
              <>
                <button className={styles.btnEdit} onClick={() => onEdit(food)}>
                  ✏️
                </button>
                <button
                  className={styles.btnDelete}
                  onClick={() => onDelete(food)}
                >
                  🗑️
                </button>
              </>
            )}
          </div>
          {onToggleFavorite && (
            <button
              className={styles.favBtn}
              onClick={() => onToggleFavorite(food.id, isFavorite)}
              title={isFavorite ? "Quitar de favoritos" : "Agregar a favoritos"}
            >
              {isFavorite ? "⭐" : "☆"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
