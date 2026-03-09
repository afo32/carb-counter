import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Container,
  Card,
  Form,
  Button,
  Alert,
  Row,
  Col,
} from "react-bootstrap";
import { adminService } from "../services/api";

export default function AdminCreateUser() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    username: "",
    first_name: "",
    last_name: "",
    country: "",
    role: "user",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await adminService.createUser(formData);
      navigate("/admin/users");
    } catch (err) {
      setError(err.response?.data?.detail || "Error al crear el usuario");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container className="d-flex justify-content-center py-4">
      <Card style={{ width: "100%", maxWidth: "500px" }}>
        <Card.Body className="p-4">
          <div className="d-flex align-items-center mb-4">
            <Button
              variant="outline-secondary"
              size="sm"
              className="me-3"
              onClick={() => navigate("/admin/users")}
            >
              ← Volver
            </Button>
            <h2 className="mb-0">➕ Crear Usuario</h2>
          </div>

          {error && <Alert variant="danger">{error}</Alert>}

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
                    required
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
                    required
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
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Email</Form.Label>
              <Form.Control
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="usuario@email.com"
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Contraseña</Form.Label>
              <Form.Control
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                minLength={6}
                required
              />
              <Form.Text className="text-muted">Mínimo 6 caracteres.</Form.Text>
            </Form.Group>

            <Form.Group className="mb-4">
              <Form.Label>Rol</Form.Label>
              <Form.Select
                name="role"
                value={formData.role}
                onChange={handleChange}
              >
                <option value="user">👤 Usuario</option>
                <option value="admin">👑 Administrador</option>
              </Form.Select>
              <Form.Text className="text-muted">
                Los administradores tienen acceso total al sistema.
              </Form.Text>
            </Form.Group>

            <div className="d-flex gap-2">
              <Button
                variant="secondary"
                onClick={() => navigate("/admin/users")}
                disabled={loading}
                className="flex-grow-1"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                variant="success"
                disabled={loading}
                className="flex-grow-1"
              >
                {loading ? "Creando usuario..." : "Crear usuario"}
              </Button>
            </div>
          </Form>
        </Card.Body>
      </Card>
    </Container>
  );
}
