import { useState, useEffect } from "react";
import { Modal, Form, Button, Alert, Spinner } from "react-bootstrap";
import { foodsService } from "../services/api";

export default function FoodModal({ show, onHide, food, onSave }) {
  const [formData, setFormData] = useState({ name: "", carbs_per_100g: "" });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (food) {
      setFormData({ name: food.name, carbs_per_100g: food.carbs_per_100g });
      setImagePreview(food.image_url);
    } else {
      setFormData({ name: "", carbs_per_100g: "" });
      setImagePreview(null);
    }
    setError("");
    setImageFile(null);
  }, [food, show]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setImageFile(file);
    const reader = new FileReader();
    reader.onload = (e) => setImagePreview(e.target.result);
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      let image_url = food?.image_url || null;

      if (imageFile) {
        const uploadResponse = await foodsService.uploadImage(imageFile);
        image_url = uploadResponse.data.image_url;
      }

      const payload = {
        name: formData.name,
        carbs_per_100g: parseFloat(formData.carbs_per_100g),
        image_url,
      };

      if (food) {
        await foodsService.update(food.id, payload);
      } else {
        await foodsService.create(payload);
      }

      onSave();
      onHide();
    } catch (err) {
      setError(err.response?.data?.detail || "Error al guardar el alimento");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton>
        <Modal.Title>
          {food ? "✏️ Editar alimento" : "➕ Nuevo alimento"}
        </Modal.Title>
      </Modal.Header>

      <Form onSubmit={handleSubmit}>
        <Modal.Body>
          {error && <Alert variant="danger">{error}</Alert>}

          <Form.Group className="mb-3">
            <Form.Label>Nombre del alimento</Form.Label>
            <Form.Control
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              placeholder="Ej: Arroz blanco cocido"
              required
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Carbohidratos por 100g</Form.Label>
            <Form.Control
              type="number"
              step="0.1"
              min="0"
              max="100"
              value={formData.carbs_per_100g}
              onChange={(e) =>
                setFormData({ ...formData, carbs_per_100g: e.target.value })
              }
              placeholder="Ej: 28.5"
              required
            />
            <Form.Text className="text-muted">
              Gramos de carbohidratos cada 100g de alimento
            </Form.Text>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Imagen (opcional)</Form.Label>
            <Form.Control
              type="file"
              accept="image/*"
              onChange={handleImageChange}
            />
            {imagePreview && (
              <img
                src={imagePreview}
                alt="Preview"
                className="mt-2 rounded"
                style={{
                  width: "100%",
                  maxHeight: "200px",
                  objectFit: "cover",
                }}
              />
            )}
          </Form.Group>
        </Modal.Body>

        <Modal.Footer>
          <Button variant="secondary" onClick={onHide} disabled={loading}>
            Cancelar
          </Button>
          <Button type="submit" variant="success" disabled={loading}>
            {loading ? (
              <Spinner size="sm" />
            ) : food ? (
              "Guardar cambios"
            ) : (
              "Crear alimento"
            )}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
}
