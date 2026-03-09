import { useState } from "react";
import { Card, Badge, Button, Form, InputGroup } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function FoodCard({
  food,
  onDelete,
  isFavorite = false,
  onToggleFavorite,
}) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [calculatorOpen, setCalculatorOpen] = useState(false);
  const [grams, setGrams] = useState(100);

  const [favorite, setFavorite] = useState(isFavorite);
  const [togglingFavorite, setTogglingFavorite] = useState(false);

  const handleImageClick = () => navigate(`/foods/detail/${food.id}`);

  const canModify = user?.role === "admin" || food.created_by === user?.id;
  const calculatedCarbs =
    Math.round(((food.carbs_per_100g * grams) / 100) * 10) / 10;

  const handleGramsChange = (e) => {
    const value = Number(e.target.value);
    if (value >= 0 && value <= 10000) setGrams(value);
  };

  const handleToggleFavorite = async () => {
    if (togglingFavorite) return;
    setTogglingFavorite(true);

    setFavorite(!favorite);

    try {
      await onToggleFavorite(food.id, !favorite);
    } catch {
      setFavorite(favorite);
    } finally {
      setTogglingFavorite(false);
    }
  };

  return (
    <Card className="h-100 shadow-sm">
      <div
        className="position-relative"
        style={{ cursor: "pointer" }}
        onClick={handleImageClick}
        title={`Ver detalle de ${food.name}`}
      >
        {food.image_url ? (
          <Card.Img
            variant="top"
            src={food.image_url}
            alt={food.name}
            style={{ height: "180px", objectFit: "cover" }}
          />
        ) : (
          <div
            className="bg-light d-flex align-items-center justify-content-center"
            style={{ height: "180px", fontSize: "3rem" }}
          >
            🍽️
          </div>
        )}

        <div
          className="position-absolute bottom-0 start-0 end-0 text-center pb-1"
          style={{
            background: "rgba(0,0,0,0.35)",
            color: "white",
            fontSize: "0.75rem",
          }}
        >
          Ver detalle →
        </div>

        {onToggleFavorite && (
          <Button
            variant={favorite ? "warning" : "outline-warning"}
            size="sm"
            className="position-absolute top-0 end-0 m-2 rounded-circle"
            style={{ width: "36px", height: "36px", padding: 0, zIndex: 1 }}
            onClick={(e) => {
              e.stopPropagation();
              handleToggleFavorite();
            }}
            disabled={togglingFavorite}
          >
            {favorite ? "⭐" : "☆"}
          </Button>
        )}
      </div>

      <Card.Body className="d-flex flex-column">
        <Card.Title>{food.name}</Card.Title>

        <div className="mb-2">
          <Badge bg="success" className="fs-6">
            {food.carbs_per_100g}g carbs / 100g
          </Badge>
        </div>

        <div className="mt-2 mb-2">
          {!calculatorOpen ? (
            <Button
              variant="outline-success"
              size="sm"
              className="w-100"
              onClick={() => setCalculatorOpen(true)}
            >
              🧮 Calcular porción
            </Button>
          ) : (
            <div className="border rounded p-2 bg-light">
              <small className="text-muted d-block mb-1 fw-bold">
                Calculá tu porción:
              </small>
              <InputGroup size="sm" className="mb-2">
                <Form.Control
                  type="number"
                  value={grams}
                  onChange={handleGramsChange}
                  min="0"
                  max="10000"
                  onFocus={(e) => e.target.select()}
                />
                <InputGroup.Text>g</InputGroup.Text>
              </InputGroup>
              <div className="d-flex justify-content-between align-items-center">
                <small className="text-muted">Carbohidratos:</small>
                <Badge
                  bg={calculatedCarbs > 50 ? "danger" : "success"}
                  className="fs-6"
                >
                  {calculatedCarbs}g
                </Badge>
              </div>
              <Button
                variant="link"
                size="sm"
                className="p-0 mt-1 text-muted"
                onClick={() => {
                  setCalculatorOpen(false);
                  setGrams(100);
                }}
              >
                ✕ Cerrar
              </Button>
            </div>
          )}
        </div>

        {canModify && (
          <div className="mt-auto d-flex gap-2">
            <Button
              variant="outline-primary"
              size="sm"
              onClick={() => navigate(`/foods/edit/${food.id}`)}
              className="flex-grow-1"
            >
              ✏️ Editar
            </Button>
            <Button
              variant="outline-danger"
              size="sm"
              onClick={() => onDelete(food.id)}
              className="flex-grow-1"
            >
              🗑️ Eliminar
            </Button>
          </div>
        )}
      </Card.Body>
    </Card>
  );
}
