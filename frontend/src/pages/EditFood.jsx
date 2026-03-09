import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Container, Card, Form, Button, Alert, Spinner } from "react-bootstrap";
import { foodsService } from "../services/api";

export default function EditFood() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    carbs_per_100g: "",
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(true); // Cargando datos iniciales
  const [saving, setSaving] = useState(false); // Guardando cambios
  const [error, setError] = useState("");

  useEffect(() => {
    const loadFood = async () => {
      try {
        const response = await foodsService.getById(id);
        const food = response.data;

        setFormData({
          name: food.name,
          carbs_per_100g: food.carbs_per_100g,
        });

        if (food.image_url) {
          setImagePreview(food.image_url);
        }
      } catch (err) {
        setError(
          "No se pudo cargar el alimento. Es posible que no exista o no tengas permiso para editarlo.",
        );
      } finally {
        setLoading(false);
      }
    };

    loadFood();
  }, [id]);

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
    setSaving(true);

    try {
      let image_url = imagePreview;

      if (imageFile) {
        const uploadResponse = await foodsService.uploadImage(imageFile);
        image_url = uploadResponse.data.image_url;
      }

      await foodsService.update(id, {
        name: formData.name,
        carbs_per_100g: parseFloat(formData.carbs_per_100g),
        image_url,
      });

      navigate(-1);
    } catch (err) {
      setError(err.response?.data?.detail || "Error al guardar los cambios");
    } finally {
      setSaving(false);
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
          <p className="mt-2 text-muted">Cargando alimento...</p>
        </div>
      </Container>
    );
  }

  return (
    <Container className="d-flex justify-content-center">
      <Card style={{ width: "100%", maxWidth: "550px" }}>
        <Card.Body className="p-4">
          <div className="d-flex align-items-center mb-4">
            <Button
              variant="outline-secondary"
              size="sm"
              className="me-3"
              onClick={() => navigate(-1)}
            >
              ← Volver
            </Button>
            <h2 className="mb-0">✏️ Editar alimento</h2>
          </div>

          {error && <Alert variant="danger">{error}</Alert>}

          <Form onSubmit={handleSubmit}>
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
                required
              />
              <Form.Text className="text-muted">
                Gramos de carbohidratos cada 100g de alimento
              </Form.Text>
            </Form.Group>

            <Form.Group className="mb-4">
              <Form.Label>Imagen</Form.Label>
              <Form.Control
                type="file"
                accept="image/*"
                onChange={handleImageChange}
              />
              <Form.Text className="text-muted">
                Dejá este campo vacío para mantener la imagen actual.
              </Form.Text>

              {imagePreview && (
                <div className="mt-2 position-relative">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="rounded w-100"
                    style={{ maxHeight: "220px", objectFit: "cover" }}
                  />
                  <Button
                    variant="danger"
                    size="sm"
                    className="position-absolute top-0 end-0 m-1"
                    onClick={() => {
                      setImagePreview(null);
                      setImageFile(null);
                    }}
                  >
                    ✕
                  </Button>
                </div>
              )}
            </Form.Group>

            <div className="d-flex gap-2">
              <Button
                variant="secondary"
                onClick={() => navigate(-1)}
                disabled={saving}
                className="flex-grow-1"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                variant="success"
                disabled={saving}
                className="flex-grow-1"
              >
                {saving ? <Spinner size="sm" /> : "Guardar cambios"}
              </Button>
            </div>
          </Form>
        </Card.Body>
      </Card>
    </Container>
  );
}
