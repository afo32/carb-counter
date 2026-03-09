import { useState, useEffect } from "react";
import { Container, Row, Col, Button, Spinner, Alert } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import FoodCard from "../components/FoodCard";
import { usersService } from "../services/api";

export default function Favorites() {
  const [favorites, setFavorites] = useState([]);
  const [favoriteIds, setFavoriteIds] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const load = async () => {
      const res = await usersService.getFavorites();
      setFavorites(res.data);
      setFavoriteIds(new Set(res.data.map((f) => f.id)));
      setLoading(false);
    };
    load();
  }, []);

  const handleToggleFavorite = async (foodId, shouldAdd) => {
    if (!shouldAdd) {
      await usersService.removeFavorite(foodId);
      setFavorites((prev) => prev.filter((f) => f.id !== foodId));
      setFavoriteIds((prev) => {
        const n = new Set(prev);
        n.delete(foodId);
        return n;
      });
    }
  };

  return (
    <Container>
      <div className="d-flex align-items-center mb-4">
        <Button
          variant="outline-secondary"
          size="sm"
          className="me-3"
          onClick={() => navigate(-1)}
        >
          ← Volver
        </Button>
        <h1 className="mb-0">⭐ Mis Favoritos</h1>
      </div>

      {loading ? (
        <div className="text-center py-5">
          <Spinner animation="border" variant="warning" />
        </div>
      ) : favorites.length === 0 ? (
        <div className="text-center py-5">
          <p className="text-muted fs-5">Todavía no tenés favoritos.</p>
          <Button variant="success" onClick={() => navigate("/foods")}>
            Explorar alimentos
          </Button>
        </div>
      ) : (
        <Row xs={1} sm={2} md={3} lg={4} className="g-4">
          {favorites.map((food) => (
            <Col key={food.id}>
              <FoodCard
                food={food}
                isFavorite={favoriteIds.has(food.id)}
                onToggleFavorite={handleToggleFavorite}
              />
            </Col>
          ))}
        </Row>
      )}
    </Container>
  );
}
