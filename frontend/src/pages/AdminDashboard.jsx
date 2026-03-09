import { useState, useEffect } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Spinner,
  Alert,
  Button,
} from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { adminService } from "../services/api";
import { useAuth } from "../context/AuthContext";

export default function AdminDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [usersStats, setUsersStats] = useState(null);
  const [foodsStats, setFoodsStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadStats = async () => {
      try {
        const [usersRes, foodsRes] = await Promise.all([
          adminService.getRecentUsers(),
          adminService.getRecentFoods(),
        ]);

        setUsersStats(usersRes.data);
        setFoodsStats(foodsRes.data);
      } catch (err) {
        setError("Error al cargar las estadísticas.");
      } finally {
        setLoading(false);
      }
    };

    loadStats();
  }, []);

  const StatCard = ({ icon, title, count, color, onClick }) => (
    <Card
      className={`border-${color} h-100 shadow-sm`}
      style={{ cursor: onClick ? "pointer" : "default" }}
      onClick={onClick}
    >
      <Card.Body className="d-flex flex-column align-items-center justify-content-center py-4">
        <div style={{ fontSize: "2.5rem" }}>{icon}</div>

        <div className={`display-4 fw-bold text-${color} my-2`}>
          {count !== null ? count : <Spinner size="sm" />}
        </div>

        <Card.Text className="text-muted text-center mb-0">{title}</Card.Text>

        {onClick && (
          <small className={`text-${color} mt-2`}>Click para ver →</small>
        )}
      </Card.Body>
    </Card>
  );

  return (
    <Container>
      <div className="mb-4">
        <h1>🛡️ Panel de Administración</h1>
        <p className="text-muted">
          Bienvenido, <strong>{user?.username}</strong>. Aquí tenés un resumen
          de la actividad reciente de los últimos 3 días.
        </p>
      </div>

      {error && <Alert variant="danger">{error}</Alert>}

      {loading ? (
        <div className="text-center py-5">
          <Spinner animation="border" variant="success" />
          <p className="mt-2 text-muted">Cargando estadísticas...</p>
        </div>
      ) : (
        <>
          <h5 className="text-muted mb-3">Actividad de los últimos 3 días</h5>
          <Row className="g-4 mb-5">
            <Col xs={12} md={6}>
              <StatCard
                icon="👥"
                title="Nuevos usuarios registrados"
                count={usersStats?.count}
                color="primary"
                onClick={() => navigate("/admin/users")}
              />
            </Col>
            <Col xs={12} md={6}>
              <StatCard
                icon="🥗"
                title="Nuevos alimentos creados"
                count={foodsStats?.count}
                color="success"
                onClick={() => navigate("/foods")}
              />
            </Col>
          </Row>

          <h5 className="text-muted mb-3">Accesos rápidos</h5>
          <Row className="g-3">
            <Col xs={12} sm={6} md={4}>
              <Button
                variant="outline-primary"
                className="w-100 py-3"
                onClick={() => navigate("/admin/users")}
              >
                👥 Gestionar usuarios
              </Button>
            </Col>
            <Col xs={12} sm={6} md={4}>
              <Button
                variant="outline-success"
                className="w-100 py-3"
                onClick={() => navigate("/foods")}
              >
                🥗 Ver alimentos
              </Button>
            </Col>
          </Row>
        </>
      )}
    </Container>
  );
}
