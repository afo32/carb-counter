import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Spinner,
  Alert,
  Modal,
  Badge,
} from "react-bootstrap";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { adminService } from "../services/api";

const PIE_COLORS = [
  "#198754",
  "#0d6efd",
  "#ffc107",
  "#dc3545",
  "#0dcaf0",
  "#6f42c1",
  "#fd7e14",
  "#20c997",
  "#d63384",
  "#6c757d",
  "#4CAF50",
  "#FF5722",
  "#9C27B0",
  "#00BCD4",
  "#FF9800",
];

const renderCustomLabel = ({
  cx,
  cy,
  midAngle,
  innerRadius,
  outerRadius,
  percent,
}) => {
  if (percent < 0.05) return null;
  const RADIAN = Math.PI / 180;
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);
  return (
    <text
      x={x}
      y={y}
      fill="white"
      textAnchor="middle"
      dominantBaseline="central"
      fontSize={13}
      fontWeight="bold"
    >
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
};

export default function AdminDashboard() {
  const navigate = useNavigate();

  const [stats, setStats] = useState({
    recentUsers: [],
    recentFoods: [],
    usersByCountry: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showCountryModal, setShowCountryModal] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const [usersRes, foodsRes, countriesRes] = await Promise.all([
          adminService.getRecentUsers(),
          adminService.getRecentFoods(),
          adminService.getUsersByCountry(),
        ]);
        setStats({
          recentUsers: Array.isArray(usersRes.data) ? usersRes.data : [],
          recentFoods: Array.isArray(foodsRes.data) ? foodsRes.data : [],
          usersByCountry: Array.isArray(countriesRes.data)
            ? countriesRes.data
            : [],
        });
      } catch {
        setError("Error al cargar estadísticas");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const totalUsers = stats.usersByCountry.reduce((acc, c) => acc + c.count, 0);

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
      </Container>
    );

  return (
    <Container className="py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1>🛡️ Panel de Administración</h1>
      </div>

      <Row className="mb-4 g-3">
        <Col xs={12} sm={6}>
          <Card
            className="text-center h-100 shadow-sm border-0"
            style={{
              cursor: "pointer",
              background: "linear-gradient(135deg, #198754, #20c997)",
            }}
            onClick={() => navigate("/admin/users")}
          >
            <Card.Body className="text-white py-4">
              <div style={{ fontSize: "2.5rem" }}>👥</div>
              <h5 className="mt-2 mb-0">Gestionar Usuarios</h5>
            </Card.Body>
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card
            className="text-center h-100 shadow-sm border-0"
            style={{
              cursor: "pointer",
              background: "linear-gradient(135deg, #0d6efd, #0dcaf0)",
            }}
            onClick={() => navigate("/")}
          >
            <Card.Body className="text-white py-4">
              <div style={{ fontSize: "2.5rem" }}>🥗</div>
              <h5 className="mt-2 mb-0">Ver Alimentos</h5>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row className="mb-4 g-3">
        <Col xs={12} md={6}>
          <Card className="shadow-sm h-100">
            <Card.Header className="bg-success text-white">
              👥 Usuarios recientes (últimos 3 días)
            </Card.Header>
            <Card.Body>
              {stats.recentUsers.length === 0 ? (
                <p className="text-muted text-center mb-0">
                  Sin registros recientes
                </p>
              ) : (
                stats.recentUsers.map((u, i) => (
                  <div
                    key={i}
                    className="d-flex justify-content-between align-items-center py-2 border-bottom"
                  >
                    <div>
                      <strong>{u.username}</strong>
                      {u.country && (
                        <span
                          className="text-muted ms-2"
                          style={{ fontSize: "0.85rem" }}
                        >
                          📍 {u.country}
                        </span>
                      )}
                    </div>
                    <Badge bg={u.role === "admin" ? "danger" : "success"}>
                      {u.role}
                    </Badge>
                  </div>
                ))
              )}
            </Card.Body>
          </Card>
        </Col>

        <Col xs={12} md={6}>
          <Card className="shadow-sm h-100">
            <Card.Header className="bg-primary text-white">
              🥗 Alimentos recientes (últimos 3 días)
            </Card.Header>
            <Card.Body>
              {stats.recentFoods.length === 0 ? (
                <p className="text-muted text-center mb-0">
                  Sin alimentos recientes
                </p>
              ) : (
                stats.recentFoods.map((f, i) => (
                  <div
                    key={i}
                    className="d-flex justify-content-between align-items-center py-2 border-bottom"
                  >
                    <strong>{f.name}</strong>
                    <Badge bg="success">{f.carbs_per_100g}g carbs</Badge>
                  </div>
                ))
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row>
        <Col xs={12}>
          <Card
            className="shadow-sm border-0"
            style={{ cursor: "pointer" }}
            onClick={() => setShowCountryModal(true)}
          >
            <Card.Body
              className="p-0"
              style={{
                background: "linear-gradient(135deg, #6f42c1, #d63384)",
                borderRadius: "0.375rem",
              }}
            >
              <div className="text-white p-4">
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <div style={{ fontSize: "2rem" }}>🌍</div>
                    <h5 className="mt-2 mb-1">Países con usuarios</h5>
                    <p className="mb-0" style={{ opacity: 0.85 }}>
                      {totalUsers} usuarios en {stats.usersByCountry.length}{" "}
                      países
                    </p>
                  </div>
                  <div className="text-end">
                    {stats.usersByCountry.slice(0, 3).map((c, i) => (
                      <div key={i} className="mb-1">
                        <span style={{ opacity: 0.9, fontSize: "0.9rem" }}>
                          {c.country}
                        </span>
                        <Badge bg="light" text="dark" className="ms-2">
                          {c.count}
                        </Badge>
                      </div>
                    ))}
                    {stats.usersByCountry.length > 3 && (
                      <small style={{ opacity: 0.7 }}>
                        +{stats.usersByCountry.length - 3} más...
                      </small>
                    )}
                  </div>
                </div>
                <div
                  className="mt-3 text-center"
                  style={{ opacity: 0.8, fontSize: "0.85rem" }}
                >
                  Haz clic para ver el gráfico completo →
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Modal
        show={showCountryModal}
        onHide={() => setShowCountryModal(false)}
        size="lg"
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>🌍 Usuarios por país</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {stats.usersByCountry.length === 0 ? (
            <p className="text-center text-muted py-4">
              No hay datos disponibles
            </p>
          ) : (
            <>
              <ResponsiveContainer width="100%" height={350}>
                <PieChart>
                  <Pie
                    data={stats.usersByCountry}
                    dataKey="count"
                    nameKey="country"
                    cx="50%"
                    cy="50%"
                    outerRadius={130}
                    labelLine={false}
                    label={renderCustomLabel}
                  >
                    {stats.usersByCountry.map((_, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={PIE_COLORS[index % PIE_COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value, name) => [`${value} usuarios`, name]}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>

              <div className="mt-3">
                <table className="table table-sm table-hover">
                  <thead className="table-success">
                    <tr>
                      <th>#</th>
                      <th>País</th>
                      <th className="text-center">Usuarios</th>
                      <th className="text-end">% del total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.usersByCountry.map((c, i) => (
                      <tr key={i}>
                        <td>
                          <span
                            className="badge rounded-circle"
                            style={{
                              background: PIE_COLORS[i % PIE_COLORS.length],
                              width: "20px",
                              height: "20px",
                              display: "inline-block",
                            }}
                          />
                        </td>
                        <td>{c.country}</td>
                        <td className="text-center">
                          <Badge bg="success">{c.count}</Badge>
                        </td>
                        <td className="text-end text-muted">
                          {((c.count / totalUsers) * 100).toFixed(1)}%
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="fw-bold">
                      <td colSpan={2}>Total</td>
                      <td className="text-center">{totalUsers}</td>
                      <td className="text-end">100%</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => setShowCountryModal(false)}
          >
            Cerrar
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
}
