import { useState, useEffect } from "react";
import {
  Container,
  Row,
  Col,
  Button,
  Form,
  InputGroup,
  Spinner,
  Alert,
} from "react-bootstrap";
import FoodCard from "../components/FoodCard";
import FoodModal from "../components/FoodModal";
import { foodsService, usersService } from "../services/api";
import { useAuth } from "../context/AuthContext";
import OpenFoodFactsSearch from "../components/OpenFoodFactsSearch";

export default function Foods() {
  const [foods, setFoods] = useState([]);
  const [favoriteIds, setFavoriteIds] = useState(new Set());
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingFood, setEditingFood] = useState(null);
  const [showOffSearch, setShowOffSearch] = useState(false);

  const { user } = useAuth();

  const handleImportFood = async (foodData) => {
    await foodsService.create(foodData);
    loadFoods(search); // Recargamos la lista para que aparezca el nuevo alimento
  };

  const loadFoods = async (searchTerm = "") => {
    try {
      setLoading(true);
      const [foodsRes, favoritesRes] = await Promise.all([
        foodsService.getAll(searchTerm),
        usersService.getFavorites(),
      ]);
      setFoods(foodsRes.data);
      setFavoriteIds(new Set(favoritesRes.data.map((f) => f.id)));
    } catch (err) {
      setError("Error al cargar los alimentos");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFoods();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => loadFoods(search), 500);
    return () => clearTimeout(timer);
  }, [search]);

  const handleToggleFavorite = async (foodId, shouldAdd) => {
    if (shouldAdd) {
      await usersService.addFavorite(foodId);
      setFavoriteIds((prev) => new Set([...prev, foodId]));
    } else {
      await usersService.removeFavorite(foodId);
      setFavoriteIds((prev) => {
        const next = new Set(prev);
        next.delete(foodId);
        return next;
      });
    }
  };

  const handleDelete = async (foodId) => {
    if (!confirm("¿Estás seguro de que querés eliminar este alimento?")) return;
    try {
      await foodsService.delete(foodId);
      loadFoods(search);
    } catch {
      alert("Error al eliminar el alimento");
    }
  };

  return (
    <Container>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1>🥗 Alimentos</h1>
        <div className="d-flex gap-2">
          <Button
            variant="outline-success"
            onClick={() => setShowOffSearch(true)}
          >
            🌍 Buscar en Open Food Facts
          </Button>
          <Button
            variant="success"
            onClick={() => {
              setEditingFood(null);
              setShowModal(true);
            }}
          >
            + Agregar alimento
          </Button>
        </div>
      </div>

      <InputGroup className="mb-4">
        <InputGroup.Text>🔍</InputGroup.Text>
        <Form.Control
          placeholder="Buscar alimento..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        {search && (
          <Button variant="outline-secondary" onClick={() => setSearch("")}>
            ✕
          </Button>
        )}
      </InputGroup>

      {error && <Alert variant="danger">{error}</Alert>}

      {loading ? (
        <div className="text-center py-5">
          <Spinner animation="border" variant="success" />
          <p className="mt-2">Cargando alimentos...</p>
        </div>
      ) : foods.length === 0 ? (
        <div className="text-center py-5">
          <p className="text-muted fs-5">
            {search
              ? `No se encontraron alimentos con "${search}"`
              : "No hay alimentos aún"}
          </p>
          <Button variant="success" onClick={() => setShowModal(true)}>
            Agregar el primero
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

      <FoodModal
        show={showModal}
        onHide={() => {
          setShowModal(false);
          setEditingFood(null);
        }}
        food={editingFood}
        onSave={() => {
          loadFoods(search);
          setEditingFood(null);
        }}
      />
      <OpenFoodFactsSearch
        show={showOffSearch}
        onHide={() => setShowOffSearch(false)}
        onImport={handleImportFood}
      />
    </Container>
  );
}
