import { Link, useNavigate } from "react-router-dom";
import { Navbar, Container, Nav, Button } from "react-bootstrap";
import { useAuth } from "../context/AuthContext";

export default function AppNavbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <Navbar bg="success" variant="dark" expand="lg" className="mb-4">
      <Container>
        <Navbar.Brand as={Link} to="/">
          🥗 CarbCounter
        </Navbar.Brand>
        <Navbar.Toggle />
        <Navbar.Collapse>
          <Nav className="me-auto">
            {user && user.role !== "admin" && (
              <Nav.Link as={Link} to="/dashboard">
                🏠 Mi Panel
              </Nav.Link>
            )}
            {user && (
              <Nav.Link as={Link} to="/foods">
                🥗 Alimentos
              </Nav.Link>
            )}
            {user?.role === "admin" && (
              <Nav.Link as={Link} to="/admin/dashboard">
                🛡️ Panel Admin
              </Nav.Link>
            )}
            {user?.role === "admin" && (
              <Nav.Link as={Link} to="/admin/users">
                👥 Usuarios
              </Nav.Link>
            )}
          </Nav>
          <Nav>
            {user ? (
              <>
                <Navbar.Text className="me-3">
                  Hola, <strong>{user.username}</strong>
                </Navbar.Text>
                <Button
                  variant="outline-light"
                  size="sm"
                  onClick={handleLogout}
                >
                  Cerrar sesión
                </Button>
              </>
            ) : (
              <>
                <Nav.Link as={Link} to="/login">
                  Iniciar sesión
                </Nav.Link>
                <Nav.Link as={Link} to="/register">
                  Registrarse
                </Nav.Link>
              </>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}
