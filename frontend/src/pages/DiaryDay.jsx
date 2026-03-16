import { useState, useEffect } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "../context/AuthContext";
import { diaryService } from "../services/api";
import styles from "./UserPages.module.css";
import day from "./DiaryDay.module.css";

export default function DiaryDay() {
  const { dateStr } = useParams();
  const navigate = useNavigate();
  const { logout } = useAuth();
  const { t } = useTranslation();

  const [dayData, setDayData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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
      const res = await diaryService.getByDate(dateStr);
      setDayData(res.data);
    } catch {
      setError(t("diaryDay.errorLoad"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [dateStr]);

  const handleDelete = async (entryId) => {
    if (!window.confirm(t("diaryDay.deleteConfirm"))) return;
    await diaryService.deleteEntry(entryId);
    load();
  };

  const formatDate = (str) => {
    const [year, month, d] = str.split("-").map(Number);
    return new Date(year, month - 1, d).toLocaleDateString("es-ES", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const capitalize = (s) => s.charAt(0).toUpperCase() + s.slice(1);

  if (loading)
    return (
      <div className={styles.center}>
        <span style={{ fontSize: "1.5rem" }}>📋</span>
        {t("diaryDay.loading")}
      </div>
    );

  return (
    <div className={styles.page}>
      <div className={styles.banner}>
        <h1 className={styles.bannerTitle}>{t("diaryDay.bannerTitle")}</h1>
        <div className={styles.breadcrumb}>
          <Link to="/">{t("common.home")}</Link>
          <span>/</span>
          <Link to="/diary">{t("diaryDay.breadcrumbDiary")}</Link>
          <span>/</span>
          <span>{dateStr}</span>
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
          <Link to="/my-foods" className={styles.sidebarItem}>
            {t("sidebar.myFoods")}
          </Link>
          <Link
            to="/diary"
            className={`${styles.sidebarItem} ${styles.sidebarItemActive}`}
          >
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
            <h2 className={styles.mainTitle}>
              {capitalize(formatDate(dateStr))}
            </h2>
            <button
              className={styles.btnGreen}
              onClick={() => navigate("/diary")}
              style={{ fontSize: "0.82rem", padding: "0.55rem 1.2rem" }}
            >
              {t("diaryDay.backBtn")}
            </button>
          </div>

          {error && <div className={day.errorAlert}>⚠️ {error}</div>}

          {dayData && (
            <>
              <div className={day.statsRow}>
                <div className={`${day.statCard} ${day.statCardGreen}`}>
                  <div className={`${day.statNumber} ${day.statNumberGreen}`}>
                    {dayData.total_carbs}g
                  </div>
                  <div className={day.statLabel}>
                    {t("diaryDay.totalCarbs")}
                  </div>
                </div>
                <div className={`${day.statCard} ${day.statCardBlue}`}>
                  <div className={`${day.statNumber} ${day.statNumberBlue}`}>
                    {dayData.entry_count}
                  </div>
                  <div className={day.statLabel}>
                    {dayData.entry_count === 1
                      ? t("diaryDay.entry")
                      : t("diaryDay.entries")}
                  </div>
                </div>
              </div>

              {dayData.entries.length === 0 ? (
                <div className={day.empty}>
                  <div className={day.emptyIcon}>🍽️</div>
                  <p className={day.emptyText}>{t("diaryDay.emptyText")}</p>
                </div>
              ) : (
                <div className={day.tableWrap}>
                  <div className={day.tableHeader}>
                    {t("diaryDay.tableTitle")}
                  </div>
                  <table className={day.table}>
                    <thead>
                      <tr>
                        <th>{t("diaryDay.colFood")}</th>
                        <th className={day.center}>
                          {t("diaryDay.colAmount")}
                        </th>
                        <th className={day.center}>{t("diaryDay.colCarbs")}</th>
                        <th className={day.center}></th>
                      </tr>
                    </thead>
                    <tbody>
                      {dayData.entries.map((entry) => (
                        <tr key={entry.id}>
                          <td>
                            <div className={day.foodCell}>
                              {entry.foods?.image_url ? (
                                <img
                                  src={entry.foods.image_url}
                                  alt={entry.foods?.name}
                                  className={day.foodImg}
                                />
                              ) : (
                                <div className={day.foodImgPlaceholder}>🍽️</div>
                              )}
                              <span
                                className={day.foodName}
                                onClick={() =>
                                  navigate(`/foods/detail/${entry.food_id}`)
                                }
                              >
                                {entry.foods?.name || t("diaryDay.deletedFood")}
                              </span>
                            </div>
                          </td>
                          <td className={day.center}>
                            {entry.consumed_grams}g
                          </td>
                          <td className={day.center}>
                            <span
                              className={`${day.carbsBadge} ${entry.carbs_consumed > 50 ? day.carbsBadgeRed : day.carbsBadgeGreen}`}
                            >
                              {entry.carbs_consumed}g
                            </span>
                          </td>
                          <td className={day.center}>
                            <button
                              className={day.btnDelete}
                              onClick={() => handleDelete(entry.id)}
                            >
                              🗑️
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot className={day.tableFoot}>
                      <tr>
                        <td colSpan={2} className={day.totalLabel}>
                          {t("diaryDay.totalLabel")}
                        </td>
                        <td className={day.totalValue}>
                          <span className={day.totalBadge}>
                            {dayData.total_carbs}g
                          </span>
                        </td>
                        <td />
                      </tr>
                    </tfoot>
                  </table>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
