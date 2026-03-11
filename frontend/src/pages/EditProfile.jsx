import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Container,
  Card,
  Form,
  Button,
  Alert,
  Spinner,
  Row,
  Col,
  Badge,
} from "react-bootstrap";
import { usersService } from "../services/api";
import { useAuth } from "../context/AuthContext";

export default function EditProfile() {
  const navigate = useNavigate();
  const { user, setUser } = useAuth();

  const [formData, setFormData] = useState({
    username: "",
    first_name: "",
    last_name: "",
    country: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        const res = await usersService.getProfile();
        setFormData({
          username: res.data.username || "",
          first_name: res.data.first_name || "",
          last_name: res.data.last_name || "",
          country: res.data.country || "",
        });
      } catch {
        setError("No se pudo cargar el perfil.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setSaving(true);

    try {
      const res = await usersService.updateProfile(formData);

      const updatedUser = {
        ...user,
        username: res.data.username,
        first_name: res.data.first_name,
        last_name: res.data.last_name,
        country: res.data.country,
      };
      setUser(updatedUser);
      localStorage.setItem("user", JSON.stringify(updatedUser));

      setSuccess("¡Perfil actualizado correctamente!");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err.response?.data?.detail || "Error al guardar los cambios");
    } finally {
      setSaving(false);
    }
  };

  if (loading)
    return (
      <Container className="text-center py-5">
        <Spinner animation="border" variant="success" />
      </Container>
    );

  return (
    <Container className="d-flex justify-content-center py-4">
      <Card style={{ width: "100%", maxWidth: "500px" }}>
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
            <div>
              <h2 className="mb-0">👤 Mi Perfil</h2>
              <Badge
                bg={user?.role === "admin" ? "danger" : "success"}
                className="mt-1"
              >
                {user?.role === "admin" ? "👑 Admin" : "👤 Usuario"}
              </Badge>
            </div>
          </div>

          {error && <Alert variant="danger">{error}</Alert>}
          {success && <Alert variant="success">✅ {success}</Alert>}

          <Form onSubmit={handleSubmit}>
            <Row>
              <Col xs={12} sm={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Nombre</Form.Label>
                  <Form.Control
                    name="first_name"
                    value={formData.first_name}
                    onChange={handleChange}
                    placeholder="Juan"
                  />
                </Form.Group>
              </Col>
              <Col xs={12} sm={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Apellido</Form.Label>
                  <Form.Control
                    name="last_name"
                    value={formData.last_name}
                    onChange={handleChange}
                    placeholder="García"
                  />
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-3">
              <Form.Label>Nombre de usuario</Form.Label>
              <Form.Control
                name="username"
                value={formData.username}
                onChange={handleChange}
                placeholder="juangarcia"
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>País</Form.Label>
              <Form.Control
                name="country"
                value={formData.country}
                onChange={handleChange}
                placeholder="Colombia"
              />
            </Form.Group>

            <Form.Group className="mb-4">
              <Form.Label>Email</Form.Label>
              <Form.Control
                value={user?.email || ""}
                disabled
                className="bg-light"
              />
              <Form.Text className="text-muted">
                El email no se puede modificar desde aquí.
              </Form.Text>
            </Form.Group>

            <Button
              type="submit"
              variant="success"
              className="w-100"
              disabled={saving}
            >
              {saving ? <Spinner size="sm" /> : "Guardar cambios"}
            </Button>
          </Form>
        </Card.Body>
      </Card>
    </Container>
  );
}
