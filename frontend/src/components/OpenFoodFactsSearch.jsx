import { useState, useEffect, useRef } from "react";
import {
  Modal,
  Form,
  InputGroup,
  Button,
  Spinner,
  Alert,
  Card,
  Row,
  Col,
  Badge,
} from "react-bootstrap";
import { openFoodFactsService } from "../services/api";

export default function OpenFoodFactsSearch({ show, onHide, onImport }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [importingId, setImportingId] = useState(null);

  const inputRef = useRef(null);

  useEffect(() => {
    if (show) {
      setTimeout(() => inputRef.current?.focus(), 100);
      setQuery("");
      setResults([]);
      setError("");
    }
  }, [show]);

  useEffect(() => {
    if (query.length < 2) {
      setResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      setError("");
      try {
        const data = await openFoodFactsService.search(query);
        setResults(data.results);
        if (data.results.length === 0) {
          setError(
            `No se encontraron resultados para "${query}" en Open Food Facts.`,
          );
        }
      } catch (err) {
        setError("Error al buscar. Verificá tu conexión a internet.");
      } finally {
        setLoading(false);
      }
    }, 600);

    return () => clearTimeout(timer);
  }, [query]);

  const handleImport = async (product) => {
    setImportingId(product.name);
    try {
      await onImport({
        name: product.name,
        carbs_per_100g: product.carbs_per_100g,
        image_url: product.image_url,
      });
      onHide();
    } catch (err) {
      setError("No se pudo importar el alimento. Intentá de nuevo.");
    } finally {
      setImportingId(null);
    }
  };

  return (
    <Modal show={show} onHide={onHide} size="lg" centered>
      <Modal.Header closeButton>
        <Modal.Title>
          🔍 Buscar en Open Food Facts
          <small
            className="d-block text-muted fw-normal"
            style={{ fontSize: "0.75rem" }}
          >
            Base de datos mundial con más de 3 millones de productos
          </small>
        </Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <InputGroup className="mb-3">
          <InputGroup.Text>🔍</InputGroup.Text>
          <Form.Control
            ref={inputRef}
            placeholder='Ej: "avena", "arroz integral", "coca cola"...'
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          {query && (
            <Button variant="outline-secondary" onClick={() => setQuery("")}>
              ✕
            </Button>
          )}
        </InputGroup>

        {loading && (
          <div className="text-center py-4">
            <Spinner
              animation="border"
              variant="success"
              size="sm"
              className="me-2"
            />
            <span className="text-muted">Buscando en Open Food Facts...</span>
          </div>
        )}

        {error && !loading && (
          <Alert
            variant={error.includes("No se encontraron") ? "info" : "danger"}
          >
            {error}
          </Alert>
        )}

        {!query && !loading && (
          <div className="text-center py-4 text-muted">
            <div style={{ fontSize: "3rem" }}>🌍</div>
            <p>
              Escribí el nombre de un alimento para buscarlo en la base de datos
              mundial.
            </p>
            <small>Los resultados incluyen carbohidratos por cada 100g.</small>
          </div>
        )}

        {!loading && results.length > 0 && (
          <>
            <small className="text-muted d-block mb-3">
              {results.length} resultado{results.length !== 1 ? "s" : ""} para "
              {query}" — hacé clic en "Importar" para agregar a tus alimentos
            </small>

            <Row xs={1} sm={2} className="g-3">
              {results.map((product, idx) => (
                <Col key={`${product.name}-${idx}`}>
                  <Card className="h-100 border shadow-sm">
                    <div className="d-flex h-100">
                      <div
                        className="bg-light d-flex align-items-center justify-content-center flex-shrink-0"
                        style={{ width: "80px", fontSize: "2rem" }}
                      >
                        {product.image_url ? (
                          <img
                            src={product.image_url}
                            alt={product.name}
                            style={{
                              width: "80px",
                              height: "80px",
                              objectFit: "cover",
                            }}
                            onError={(e) => {
                              e.target.style.display = "none";
                              e.target.nextSibling.style.display = "block";
                            }}
                          />
                        ) : null}
                        <span
                          style={{
                            display: product.image_url ? "none" : "block",
                          }}
                        >
                          🍽️
                        </span>
                      </div>

                      <Card.Body className="py-2 px-3 d-flex flex-column justify-content-between">
                        <div>
                          <div
                            className="fw-bold"
                            style={{ fontSize: "0.9rem", lineHeight: 1.2 }}
                          >
                            {product.name}
                          </div>
                          {product.brand && (
                            <small className="text-muted">
                              {product.brand}
                            </small>
                          )}
                          {product.quantity && (
                            <small className="text-muted d-block">
                              {product.quantity}
                            </small>
                          )}
                        </div>

                        <div className="d-flex justify-content-between align-items-center mt-2">
                          <Badge bg="success">
                            {product.carbs_per_100g}g carbs/100g
                          </Badge>
                          <Button
                            variant="outline-success"
                            size="sm"
                            onClick={() => handleImport(product)}
                            disabled={importingId === product.name}
                          >
                            {importingId === product.name ? (
                              <Spinner size="sm" />
                            ) : (
                              "+ Importar"
                            )}
                          </Button>
                        </div>
                      </Card.Body>
                    </div>
                  </Card>
                </Col>
              ))}
            </Row>
          </>
        )}
      </Modal.Body>

      <Modal.Footer className="justify-content-between">
        <small className="text-muted">
          Datos provistos por{" "}
          <a
            href="https://world.openfoodfacts.org"
            target="_blank"
            rel="noopener noreferrer"
          >
            Open Food Facts
          </a>{" "}
          — base de datos libre y colaborativa 🌍
        </small>
        <Button variant="secondary" onClick={onHide}>
          Cerrar
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
