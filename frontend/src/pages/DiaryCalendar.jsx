import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "../context/AuthContext";
import { diaryService } from "../services/api";
import styles from "./UserPages.module.css";
import cal from "./DiaryCalendar.module.css";

export default function DiaryCalendar() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const today = new Date();

  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [datesWithEntries, setDatesWithEntries] = useState(new Set());
  const [loading, setLoading] = useState(true);

  const MONTHS = t("diary.months", { returnObjects: true });
  const DAYS = t("diary.days", { returnObjects: true });

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
        const res = await diaryService.getDates();
        setDatesWithEntries(new Set(res.data));
      } catch {
        /* silencioso */
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const prevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear((y) => y - 1);
    } else setViewMonth((m) => m - 1);
  };
  const nextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear((y) => y + 1);
    } else setViewMonth((m) => m + 1);
  };

  const isAtMaxMonth =
    viewMonth === today.getMonth() && viewYear === today.getFullYear();
  const firstDay = new Date(viewYear, viewMonth, 1).getDay();
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const cells = [
    ...Array(firstDay).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  const formatDate = (day) => {
    const m = String(viewMonth + 1).padStart(2, "0");
    const d = String(day).padStart(2, "0");
    return `${viewYear}-${m}-${d}`;
  };

  const isToday = (day) =>
    day === today.getDate() &&
    viewMonth === today.getMonth() &&
    viewYear === today.getFullYear();

  if (loading)
    return (
      <div className={styles.center}>
        <span style={{ fontSize: "1.5rem" }}>📅</span>
        {t("diary.loading")}
      </div>
    );

  return (
    <div className={styles.page}>
      <div className={styles.banner}>
        <h1 className={styles.bannerTitle}>{t("diary.bannerTitle")}</h1>
        <div className={styles.breadcrumb}>
          <Link to="/">{t("common.home")}</Link>
          <span>/</span>
          <span>{t("diary.breadcrumb")}</span>
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
            <h2 className={styles.mainTitle}>{t("diary.title")}</h2>
            <span className={styles.countBadge}>
              {t("diary.daysCount", { count: datesWithEntries.size })}
            </span>
          </div>

          <div className={cal.calNav}>
            <button className={cal.calNavBtn} onClick={prevMonth}>
              ‹
            </button>
            <span className={cal.calMonthLabel}>
              {MONTHS[viewMonth]} {viewYear}
            </span>
            <button
              className={cal.calNavBtn}
              onClick={nextMonth}
              disabled={isAtMaxMonth}
            >
              ›
            </button>
          </div>

          <div className={cal.calGrid}>
            {DAYS.map((d) => (
              <div key={d} className={cal.calDayHeader}>
                {d}
              </div>
            ))}
            {cells.map((day, idx) => {
              if (!day)
                return <div key={`e-${idx}`} className={cal.calCellEmpty} />;
              const dateStr = formatDate(day);
              const hasEntries = datesWithEntries.has(dateStr);
              const todayCell = isToday(day);
              return (
                <div
                  key={dateStr}
                  className={`${cal.calCell} ${todayCell ? cal.calCellToday : ""} ${hasEntries ? cal.calCellHasEntries : ""}`}
                  onClick={() => hasEntries && navigate(`/diary/${dateStr}`)}
                >
                  <span>{day}</span>
                  {hasEntries && <span className={cal.calCellIcon}>🍴</span>}
                  {todayCell && !hasEntries && (
                    <span className={cal.calCellTodayLabel}>
                      {t("diary.today")}
                    </span>
                  )}
                </div>
              );
            })}
          </div>

          <div className={cal.legend}>
            <div className={cal.legendItem}>
              <div className={`${cal.legendDot} ${cal.legendDotGreen}`}>🍴</div>
              {t("diary.legendEntries")}
            </div>
            <div className={cal.legendItem}>
              <div className={`${cal.legendDot} ${cal.legendDotBlue}`} />
              {t("diary.legendToday")}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
