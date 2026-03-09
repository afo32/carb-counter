import { useState, useEffect } from "react";
import { Container, Row, Col, Button, Spinner } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import FoodCard from "../components/FoodCard";
import { usersService, foodsService } from "../services/api";

export default function MyFoods() {
  const [foods, setFoods] = useState([]);
  const [favoriteIds, setFavoriteIds] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const load = async () => {
    const [myFoodsRes, favoritesRes] = await Promise.all([
      usersService.getMyFoods(),
      usersService.getFavorites(),
    ]);
    setFoods(myFoodsRes.data);
    setFavoriteIds(new Set(favoritesRes.data.map((f) => f.id)));
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const handleToggleFavorite = async (foodId, shouldAdd) => {
    if (shouldAdd) {
      await usersService.addFavorite(foodId);
      setFavoriteIds((prev) => new Set([...prev, foodId]));
    } else {
      await usersService.removeFavorite(foodId);
      setFavoriteIds((prev) => {
        const n = new Set(prev);
        n.delete(foodId);
        return n;
      });
    }
  };

  const handleDelete = async (foodId) => {
    if (!confirm("¿Eliminar este alimento?")) return;
    await foodsService.delete(foodId);
    load();
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
        <h1 className="mb-0">🥗 Mis Alimentos</h1>
      </div>

      {loading ? (
        <div className="text-center py-5">
          <Spinner animation="border" variant="success" />
        </div>
      ) : foods.length === 0 ? (
        <div className="text-center py-5">
          <p className="text-muted fs-5">Todavía no creaste ningún alimento.</p>
          <Button variant="success" onClick={() => navigate("/foods")}>
            Ir a agregar uno
          </Button>
        </div>
      ) : (
        <Row xs={1} sm={2} md={3} lg={4} className="g-4">
          {foods.map((food) => (
            <Col key={food.id}>
              <FoodCard
                food={food}
                onDelete={handleDelete}
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
