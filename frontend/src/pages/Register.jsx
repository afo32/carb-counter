import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  Container,
  Card,
  Form,
  Button,
  Alert,
  Row,
  Col,
} from "react-bootstrap";
import { useAuth } from "../context/AuthContext";

export default function Register() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    username: "",
    first_name: "",
    last_name: "",
    country: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const userData = await register(
        formData.email,
        formData.password,
        formData.username,
        formData.first_name,
        formData.last_name,
        formData.country,
      );
      if (userData.role === "admin") {
        navigate("/admin/dashboard");
      } else {
        navigate("/");
      }
    } catch (err) {
      setError(err.response?.data?.detail || "Error al registrarse");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container
      className="d-flex justify-content-center align-items-center py-4"
      style={{ minHeight: "80vh" }}
    >
      <Card style={{ width: "100%", maxWidth: "500px" }}>
        <Card.Body className="p-4">
          <h2 className="text-center mb-4">Crear Cuenta</h2>

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
                placeholder="BestCarbCounter"
                required
              />
              <Form.Text className="text-muted">
                Este es el nombre que verán otros usuarios.
              </Form.Text>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>País</Form.Label>
              <Form.Control
                name="country"
                value={formData.country}
                onChange={handleChange}
                placeholder="España"
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
                placeholder="bestcarbcounter@email.com"
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
                placeholder="******"
                required
              />
              <Form.Text className="text-muted">Mínimo 6 caracteres.</Form.Text>
            </Form.Group>

            <Button
              type="submit"
              variant="success"
              className="w-100 mt-2"
              disabled={loading}
            >
              {loading ? "Creando cuenta..." : "Registrarse"}
            </Button>
          </Form>

          <p className="text-center mt-3">
            ¿Ya tenés cuenta? <Link to="/login">Iniciar sesión</Link>
          </p>
        </Card.Body>
      </Card>
    </Container>
  );
}
