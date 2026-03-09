import { useState, useEffect } from "react";
import { Container, Button, Spinner, Badge } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { diaryService } from "../services/api";

const MONTHS = [
  "Enero",
  "Febrero",
  "Marzo",
  "Abril",
  "Mayo",
  "Junio",
  "Julio",
  "Agosto",
  "Septiembre",
  "Octubre",
  "Noviembre",
  "Diciembre",
];
const DAYS = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];

export default function DiaryCalendar() {
  const navigate = useNavigate();
  const today = new Date();

  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [datesWithEntries, setDatesWithEntries] = useState(new Set());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await diaryService.getDates();
        setDatesWithEntries(new Set(res.data));
      } catch {
        // En caso de error, dejamos el set vacío (no se marcará ningún día)
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

  const firstDayOfMonth = new Date(viewYear, viewMonth, 1).getDay();
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();

  const cells = [
    ...Array(firstDayOfMonth).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  const formatDate = (day) => {
    const month = String(viewMonth + 1).padStart(2, "0");
    const dayStr = String(day).padStart(2, "0");
    return `${viewYear}-${month}-${dayStr}`;
  };

  const isToday = (day) => {
    return (
      day === today.getDate() &&
      viewMonth === today.getMonth() &&
      viewYear === today.getFullYear()
    );
  };

  if (loading)
    return (
      <Container className="text-center py-5">
        <Spinner animation="border" variant="success" />
      </Container>
    );

  return (
    <Container style={{ maxWidth: "600px" }}>
      <div className="d-flex align-items-center mb-4">
        <Button
          variant="outline-secondary"
          size="sm"
          className="me-3"
          onClick={() => navigate(-1)}
        >
          ← Volver
        </Button>
        <h1 className="mb-0">📅 Mi Diario</h1>
      </div>

      <div className="d-flex justify-content-between align-items-center mb-3">
        <Button variant="outline-secondary" onClick={prevMonth}>
          ‹
        </Button>
        <h4 className="mb-0 fw-bold">
          {MONTHS[viewMonth]} {viewYear}
        </h4>
        <Button
          variant="outline-secondary"
          onClick={nextMonth}
          disabled={
            viewMonth === today.getMonth() && viewYear === today.getFullYear()
          }
        >
          ›
        </Button>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(7, 1fr)",
          gap: "4px",
        }}
      >
        {DAYS.map((day) => (
          <div
            key={day}
            className="text-center text-muted fw-bold py-2"
            style={{ fontSize: "0.8rem" }}
          >
            {day}
          </div>
        ))}

        {cells.map((day, idx) => {
          if (!day) {
            return <div key={`empty-${idx}`} />;
          }

          const dateStr = formatDate(day);
          const hasEntries = datesWithEntries.has(dateStr);
          const todayClass = isToday(day);

          return (
            <div
              key={dateStr}
              onClick={() => hasEntries && navigate(`/diary/${dateStr}`)}
              className={`
                text-center rounded p-2 position-relative
                ${hasEntries ? "bg-success bg-opacity-10 border border-success" : ""}
                ${todayClass ? "fw-bold border border-primary" : ""}
                ${hasEntries ? "cursor-pointer" : ""}
              `}
              style={{
                cursor: hasEntries ? "pointer" : "default",
                minHeight: "52px",
                transition: "background 0.15s",
              }}
              onMouseEnter={(e) =>
                hasEntries &&
                (e.currentTarget.style.background = "rgba(25,135,84,0.2)")
              }
              onMouseLeave={(e) =>
                hasEntries &&
                (e.currentTarget.style.background = "rgba(25,135,84,0.1)")
              }
            >
              <span style={{ fontSize: "0.9rem" }}>{day}</span>
              {hasEntries && (
                <div style={{ fontSize: "1rem", lineHeight: 1 }}>🍴</div>
              )}
              {todayClass && !hasEntries && (
                <div style={{ fontSize: "0.5rem", color: "var(--bs-primary)" }}>
                  HOY
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="d-flex gap-3 mt-4 justify-content-center">
        <small className="text-muted d-flex align-items-center gap-1">
          <span className="bg-success bg-opacity-10 border border-success rounded px-2">
            🍴
          </span>
          Días con registro
        </small>
        <small className="text-muted d-flex align-items-center gap-1">
          <span className="border border-primary rounded px-2 fw-bold">
            hoy
          </span>
          Hoy
        </small>
      </div>
    </Container>
  );
}
