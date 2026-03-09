import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Container,
  Card,
  Button,
  Badge,
  Spinner,
  Alert,
  Table,
  Row,
  Col,
} from "react-bootstrap";
import { diaryService } from "../services/api";

export default function DiaryDay() {
  const { dateStr } = useParams();
  const navigate = useNavigate();
  const [dayData, setDayData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = async () => {
    try {
      const res = await diaryService.getByDate(dateStr);
      setDayData(res.data);
    } catch {
      setError("No se pudo cargar el diario de este día.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [dateStr]);

  const handleDelete = async (entryId) => {
    if (!confirm("¿Eliminar este registro?")) return;
    await diaryService.deleteEntry(entryId);
    load();
  };

  const formatDate = (str) => {
    const [year, month, day] = str.split("-").map(Number);
    return new Date(year, month - 1, day).toLocaleDateString("es-ES", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (loading)
    return (
      <Container className="text-center py-5">
        <Spinner animation="border" variant="success" />
      </Container>
    );

  return (
    <Container style={{ maxWidth: "700px" }}>
      <div className="d-flex align-items-center mb-4">
        <Button
          variant="outline-secondary"
          size="sm"
          className="me-3"
          onClick={() => navigate("/diary")}
        >
          ← Volver al calendario
        </Button>
        <div>
          <h1 className="mb-0">📋 {formatDate(dateStr)}</h1>
        </div>
      </div>

      {error && <Alert variant="danger">{error}</Alert>}

      {dayData && (
        <>
          <Row className="g-3 mb-4">
            <Col xs={6}>
              <Card className="text-center border-success">
                <Card.Body className="py-3">
                  <div className="display-5 fw-bold text-success">
                    {dayData.total_carbs}g
                  </div>
                  <small className="text-muted">Total carbohidratos</small>
                </Card.Body>
              </Card>
            </Col>
            <Col xs={6}>
              <Card className="text-center border-primary">
                <Card.Body className="py-3">
                  <div className="display-5 fw-bold text-primary">
                    {dayData.entry_count}
                  </div>
                  <small className="text-muted">
                    {dayData.entry_count === 1 ? "registro" : "registros"}
                  </small>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          {dayData.entries.length === 0 ? (
            <Alert variant="info">No hay registros para este día.</Alert>
          ) : (
            <Card className="shadow-sm">
              <Card.Header className="fw-bold">
                🍴 Alimentos consumidos
              </Card.Header>
              <Table responsive className="mb-0">
                <thead className="table-light">
                  <tr>
                    <th>Alimento</th>
                    <th className="text-center">Cantidad</th>
                    <th className="text-center">Carbos</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {dayData.entries.map((entry) => (
                    <tr key={entry.id}>
                      <td>
                        <div className="d-flex align-items-center gap-2">
                          {entry.foods?.image_url ? (
                            <img
                              src={entry.foods.image_url}
                              alt={entry.foods?.name}
                              style={{
                                width: "36px",
                                height: "36px",
                                objectFit: "cover",
                                borderRadius: "4px",
                              }}
                            />
                          ) : (
                            <span style={{ fontSize: "1.5rem" }}>🍽️</span>
                          )}
                          <span
                            className="text-success"
                            style={{ cursor: "pointer" }}
                            onClick={() =>
                              navigate(`/foods/detail/${entry.food_id}`)
                            }
                          >
                            {entry.foods?.name || "Alimento eliminado"}
                          </span>
                        </div>
                      </td>
                      <td className="text-center align-middle">
                        {entry.consumed_grams}g
                      </td>
                      <td className="text-center align-middle">
                        <Badge
                          bg={entry.carbs_consumed > 50 ? "danger" : "success"}
                        >
                          {entry.carbs_consumed}g
                        </Badge>
                      </td>
                      <td className="text-center align-middle">
                        <Button
                          variant="outline-danger"
                          size="sm"
                          onClick={() => handleDelete(entry.id)}
                          title="Eliminar este registro"
                        >
                          🗑️
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="table-success">
                  <tr>
                    <td colSpan={2} className="fw-bold text-end">
                      Total del día:
                    </td>
                    <td className="text-center fw-bold">
                      <Badge bg="success" className="fs-6">
                        {dayData.total_carbs}g
                      </Badge>
                    </td>
                    <td></td>
                  </tr>
                </tfoot>
              </Table>
            </Card>
          )}
        </>
      )}
    </Container>
  );
}
