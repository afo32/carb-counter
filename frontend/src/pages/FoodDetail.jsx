import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Container,
  Card,
  Button,
  Badge,
  Spinner,
  Alert,
  Form,
  InputGroup,
  Modal,
} from "react-bootstrap";
import { foodsService, diaryService, usersService } from "../services/api";

export default function FoodDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [food, setFood] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showConsumeModal, setShowConsumeModal] = useState(false);
  const [grams, setGrams] = useState(100);
  const [consuming, setConsuming] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const [foodRes, favoritesRes] = await Promise.all([
          foodsService.getById(id),
          usersService.getFavorites(),
        ]);
        setFood(foodRes.data);
        setIsFavorite(favoritesRes.data.some((f) => f.id === id));
      } catch {
        setError("No se pudo cargar el alimento.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  const handleConsume = async () => {
    setConsuming(true);
    try {
      const res = await diaryService.addEntry({
        food_id: id,
        consumed_grams: grams,
      });
      setShowConsumeModal(false);
      setSuccessMessage(res.data.message);
      setTimeout(() => setSuccessMessage(""), 4000);
    } catch (err) {
      setError(err.response?.data?.detail || "Error al registrar");
    } finally {
      setConsuming(false);
    }
  };

  const handleToggleFavorite = async () => {
    if (isFavorite) {
      await usersService.removeFavorite(id);
    } else {
      await usersService.addFavorite(id);
    }
    setIsFavorite(!isFavorite);
  };

  const calculatedCarbs = food
    ? Math.round(((food.carbs_per_100g * grams) / 100) * 10) / 10
    : 0;

  if (loading)
    return (
      <Container className="text-center py-5">
        <Spinner animation="border" variant="success" />
      </Container>
    );

  if (error)
    return (
      <Container className="py-5">
        <Alert variant="danger">{error}</Alert>
        <Button variant="secondary" onClick={() => navigate(-1)}>
          ← Volver
        </Button>
      </Container>
    );

  return (
    <Container className="py-4" style={{ maxWidth: "600px" }}>
      <Button
        variant="outline-secondary"
        size="sm"
        className="mb-3"
        onClick={() => navigate(-1)}
      >
        ← Volver
      </Button>

      {successMessage && (
        <Alert variant="success" className="mb-3">
          ✅ {successMessage}
        </Alert>
      )}

      <Card className="shadow">
        {food.image_url ? (
          <Card.Img
            variant="top"
            src={food.image_url}
            alt={food.name}
            style={{ maxHeight: "300px", objectFit: "cover" }}
          />
        ) : (
          <div
            className="bg-light d-flex align-items-center justify-content-center"
            style={{ height: "200px", fontSize: "5rem" }}
          >
            🍽️
          </div>
        )}

        <Card.Body>
          <div className="d-flex justify-content-between align-items-start mb-3">
            <h2 className="mb-0">{food.name}</h2>
            <Button
              variant={isFavorite ? "warning" : "outline-warning"}
              onClick={handleToggleFavorite}
              title={isFavorite ? "Quitar de favoritos" : "Agregar a favoritos"}
            >
              {isFavorite ? "⭐ Favorito" : "☆ Favorito"}
            </Button>
          </div>

          <div className="mb-4">
            <h5 className="text-muted">Información nutricional</h5>
            <div className="d-flex gap-2 flex-wrap">
              <Badge bg="success" className="fs-6 py-2 px-3">
                {food.carbs_per_100g}g carbohidratos / 100g
              </Badge>
            </div>
          </div>

          <Button
            variant="success"
            size="lg"
            className="w-100"
            onClick={() => setShowConsumeModal(true)}
          >
            🍴 Lo consumí hoy
          </Button>
        </Card.Body>
      </Card>

      <Modal
        show={showConsumeModal}
        onHide={() => setShowConsumeModal(false)}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>🍴 Registrar consumo</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p className="text-muted">
            ¿Cuántos gramos de <strong>{food.name}</strong> consumiste?
          </p>

          <Form.Group className="mb-3">
            <Form.Label>Cantidad</Form.Label>
            <InputGroup>
              <Form.Control
                type="number"
                value={grams}
                onChange={(e) => setGrams(Math.max(1, Number(e.target.value)))}
                min="1"
                max="10000"
                onFocus={(e) => e.target.select()}
              />
              <InputGroup.Text>gramos</InputGroup.Text>
            </InputGroup>
          </Form.Group>

          <div className="bg-light rounded p-3 text-center">
            <small className="text-muted d-block">
              Carbohidratos a registrar
            </small>
            <span
              className={`fs-3 fw-bold ${calculatedCarbs > 50 ? "text-danger" : "text-success"}`}
            >
              {calculatedCarbs}g
            </span>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => setShowConsumeModal(false)}
            disabled={consuming}
          >
            Cancelar
          </Button>
          <Button
            variant="success"
            onClick={handleConsume}
            disabled={consuming}
          >
            {consuming ? <Spinner size="sm" /> : "Confirmar"}
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
}
