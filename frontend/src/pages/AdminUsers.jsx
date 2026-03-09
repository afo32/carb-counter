import { useState, useEffect } from "react";
import {
  Container,
  Table,
  Button,
  Badge,
  Modal,
  Form,
  Alert,
  Spinner,
} from "react-bootstrap";
import { adminService } from "../services/api";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState({ username: "", role: "user" });
  const [saving, setSaving] = useState(false);
  const [modalError, setModalError] = useState("");
  const navigate = useNavigate();

  const { user: currentUser } = useAuth();

  const loadUsers = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await adminService.getAllUsers();
      setUsers(response.data);
    } catch (err) {
      setError(
        "Error al cargar los usuarios. Verificá que tenés permisos de administrador.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleEditClick = (user) => {
    setEditingUser(user);
    setFormData({ username: user.username, role: user.role });
    setModalError("");
  };

  const handleModalClose = () => {
    setEditingUser(null);
    setModalError("");
  };

  const handleSave = async () => {
    setSaving(true);
    setModalError("");
    try {
      await adminService.updateUser(editingUser.id, formData);
      setUsers((prev) =>
        prev.map((u) => (u.id === editingUser.id ? { ...u, ...formData } : u)),
      );
      handleModalClose();
    } catch (err) {
      setModalError(
        err.response?.data?.detail || "Error al guardar los cambios",
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (userId, username) => {
    if (
      !confirm(
        `¿Estás seguro de que querés eliminar al usuario "${username}"? Esta acción no se puede deshacer.`,
      )
    )
      return;

    try {
      await adminService.deleteUser(userId);
      setUsers((prev) => prev.filter((u) => u.id !== userId));
    } catch (err) {
      setError(err.response?.data?.detail || "Error al eliminar el usuario");
    }
  };

  const RoleBadge = ({ role }) => (
    <Badge bg={role === "admin" ? "danger" : "secondary"}>
      {role === "admin" ? "👑 Admin" : "👤 Usuario"}
    </Badge>
  );

  return (
    <Container>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1>👥 Gestión de Usuarios</h1>
          <p className="text-muted mb-0">
            {users.length} usuario{users.length !== 1 ? "s" : ""} registrado
            {users.length !== 1 ? "s" : ""}
          </p>
        </div>
        <Button
          variant="success"
          onClick={() => navigate("/admin/users/create")}
        >
          ➕ Crear usuario
        </Button>
      </div>

      {error && (
        <Alert variant="danger" dismissible onClose={() => setError("")}>
          {error}
        </Alert>
      )}

      {loading ? (
        <div className="text-center py-5">
          <Spinner animation="border" variant="success" />
          <p className="mt-2 text-muted">Cargando usuarios...</p>
        </div>
      ) : (
        <Table striped bordered hover responsive>
          <thead className="table-dark">
            <tr>
              <th>Usuario</th>
              <th>Rol</th>
              <th>Fecha de registro</th>
              <th className="text-center">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id}>
                <td>
                  <strong>{user.username}</strong>
                  {user.id === currentUser?.id && (
                    <Badge bg="success" className="ms-2">
                      Vos
                    </Badge>
                  )}
                </td>
                <td>
                  <RoleBadge role={user.role} />
                </td>
                <td>
                  {new Date(user.created_at).toLocaleDateString("es-ES", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </td>
                <td className="text-center">
                  <Button
                    variant="outline-primary"
                    size="sm"
                    className="me-2"
                    onClick={() => handleEditClick(user)}
                  >
                    ✏️ Editar
                  </Button>
                  {user.id !== currentUser?.id && (
                    <Button
                      variant="outline-danger"
                      size="sm"
                      onClick={() => handleDelete(user.id, user.username)}
                    >
                      🗑️ Eliminar
                    </Button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}

      <Modal show={!!editingUser} onHide={handleModalClose} centered>
        <Modal.Header closeButton>
          <Modal.Title>✏️ Editar usuario: {editingUser?.username}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {modalError && <Alert variant="danger">{modalError}</Alert>}

          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Nombre de usuario</Form.Label>
              <Form.Control
                value={formData.username}
                onChange={(e) =>
                  setFormData({ ...formData, username: e.target.value })
                }
                placeholder="Nombre de usuario"
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Rol</Form.Label>
              <Form.Select
                value={formData.role}
                onChange={(e) =>
                  setFormData({ ...formData, role: e.target.value })
                }
              >
                <option value="user">👤 Usuario</option>
                <option value="admin">👑 Admin</option>
              </Form.Select>
              <Form.Text className="text-muted">
                Los administradores pueden gestionar todos los alimentos y
                usuarios.
              </Form.Text>
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={handleModalClose}
            disabled={saving}
          >
            Cancelar
          </Button>
          <Button variant="primary" onClick={handleSave} disabled={saving}>
            {saving ? <Spinner size="sm" /> : "Guardar cambios"}
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
}
