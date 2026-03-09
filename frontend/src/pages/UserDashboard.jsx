import { useState, useEffect } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Spinner,
  Alert,
  Badge,
} from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { usersService } from "../services/api";
import { useAuth } from "../context/AuthContext";
import FoodCard from "../components/FoodCard";

export default function UserDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [stats, setStats] = useState(null);
  const [favorites, setFavorites] = useState([]);
  const [favoriteIds, setFavoriteIds] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadData = async () => {
    try {
      setLoading(true);
      const [statsRes, favoritesRes] = await Promise.all([
        usersService.getStats(),
        usersService.getFavorites(),
      ]);
      setStats(statsRes.data);
      setFavorites(favoritesRes.data);
      setFavoriteIds(new Set(favoritesRes.data.map((f) => f.id)));
    } catch {
      setError("Error al cargar tu panel");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleToggleFavorite = async (foodId, shouldAdd) => {
    if (shouldAdd) {
      await usersService.addFavorite(foodId);
      setFavoriteIds((prev) => new Set([...prev, foodId]));
    } else {
      await usersService.removeFavorite(foodId);
      setFavorites((prev) => prev.filter((f) => f.id !== foodId));
      setFavoriteIds((prev) => {
        const next = new Set(prev);
        next.delete(foodId);
        return next;
      });
    }
  };

  if (loading) {
    return (
      <Container
        className="d-flex justify-content-center align-items-center"
        style={{ minHeight: "60vh" }}
      >
        <div className="text-center">
          <Spinner animation="border" variant="success" />
          <p className="mt-2 text-muted">Cargando tu panel...</p>
        </div>
      </Container>
    );
  }

  return (
    <Container>
      <div className="mb-4">
        <h1>👋 Hola, {user?.username}</h1>
        <p className="text-muted">Este es tu panel personal de CarbCounter.</p>
      </div>

      {error && <Alert variant="danger">{error}</Alert>}

      <h5 className="text-muted mb-3">Resumen</h5>
      <Row className="g-4 mb-5">
        <Col xs={12} md={6}>
          <Card className="border-success h-100 shadow-sm">
            <Card.Body className="d-flex flex-column align-items-center justify-content-center py-4">
              <div style={{ fontSize: "2.5rem" }}>🥗</div>
              <div className="display-4 fw-bold text-success my-2">
                {stats?.foods_created ?? 0}
              </div>
              <Card.Text className="text-muted text-center mb-3">
                Alimentos que has creado
              </Card.Text>
              <Button
                variant="success"
                onClick={() => navigate("/my-foods")}
                disabled={stats?.foods_created === 0}
              >
                Ver mis alimentos →
              </Button>
            </Card.Body>
          </Card>
        </Col>

        <Col xs={12} md={6}>
          <Card className="border-warning h-100 shadow-sm">
            <Card.Body className="d-flex flex-column align-items-center justify-content-center py-4">
              <div style={{ fontSize: "2.5rem" }}>⭐</div>
              <div className="display-4 fw-bold text-warning my-2">
                {favorites.length}
              </div>
              <Card.Text className="text-muted text-center mb-3">
                Alimentos en tus favoritos
              </Card.Text>
              <Button
                variant="outline-warning"
                onClick={() => navigate("/favorites")}
                disabled={favorites.length === 0}
              >
                Ver favoritos →
              </Button>
            </Card.Body>
          </Card>
        </Col>

        <Col xs={12} md={4}>
          {" "}
          <Card className="border-primary h-100 shadow-sm">
            <Card.Body className="d-flex flex-column align-items-center justify-content-center py-4">
              <div style={{ fontSize: "2.5rem" }}>📅</div>
              <div className="display-4 fw-bold text-primary my-2">📓</div>
              <Card.Text className="text-muted text-center mb-3">
                Registrá y revisá lo que comiste cada día
              </Card.Text>
              <Button variant="primary" onClick={() => navigate("/diary")}>
                Ver mi diario →
              </Button>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {favorites.length > 0 && (
        <>
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h5 className="text-muted mb-0">⭐ Tus últimos favoritos</h5>
            {favorites.length > 4 && (
              <Button variant="link" onClick={() => navigate("/favorites")}>
                Ver todos →
              </Button>
            )}
          </div>
          <Row xs={1} sm={2} md={3} lg={4} className="g-4">
            {favorites.slice(0, 4).map((food) => (
              <Col key={food.id}>
                <FoodCard
                  food={food}
                  isFavorite={favoriteIds.has(food.id)}
                  onToggleFavorite={handleToggleFavorite}
                />
              </Col>
            ))}
          </Row>
        </>
      )}
    </Container>
  );
}
