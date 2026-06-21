import { useState } from "react";
import { Badge, Button, Card, Col, Form, Row } from "react-bootstrap";

function SegmentList({
  segments,
  stations,
  selectedSegmentIds,
  onSelectSegment,
  disabled = false,
}) {
  const [searchText, setSearchText] = useState("");

  const stationsById = new Map();

  stations.forEach((station) => {
    stationsById.set(station.id, station);
  });

  if (!Array.isArray(segments) || segments.length === 0) {
    return (
      <Card>
        <Card.Body>
          <p className="text-muted mb-0">No selectable segments available.</p>
        </Card.Body>
      </Card>
    );
  }

  const normalizedSearchText = searchText.trim().toLowerCase();

  const filteredSegments = segments.filter((segment) => {
    const station1 = stationsById.get(segment.station1Id);
    const station2 = stationsById.get(segment.station2Id);

    const segmentIdText = String(segment.id);
    const station1Name = (
      station1?.name || `Station ${segment.station1Id}`
    ).toLowerCase();
    const station2Name = (
      station2?.name || `Station ${segment.station2Id}`
    ).toLowerCase();

    if (normalizedSearchText === "") {
      return true;
    }

    return (
      segmentIdText.includes(normalizedSearchText) ||
      station1Name.includes(normalizedSearchText) ||
      station2Name.includes(normalizedSearchText)
    );
  });

  return (
    <Card>
      <Card.Header>
        <strong>Selectable Segments</strong>
      </Card.Header>

      <Card.Body>
        <Form.Group className="mb-3" controlId="segment-search">
          <Form.Label>Search segments</Form.Label>
          <Form.Control
            type="text"
            placeholder="Example: Hogwarts Castle or 4"
            value={searchText}
            disabled={disabled}
            onChange={(event) => setSearchText(event.target.value)}
          />
          <Form.Text className="text-muted">
            Search by station name or segment ID.
          </Form.Text>
        </Form.Group>

        {filteredSegments.length === 0 ? (
          <p className="text-muted mb-0">No segments match your search.</p>
        ) : (
          <Row className="g-2">
            {filteredSegments.map((segment) => {
              const station1 = stationsById.get(segment.station1Id);
              const station2 = stationsById.get(segment.station2Id);
              const alreadySelected = selectedSegmentIds.includes(segment.id);

              return (
                <Col md={6} key={segment.id}>
                  <div className="border rounded p-2 h-100">
                    <div className="mb-2">
                      <Badge bg="secondary" className="me-2">
                        #{segment.id}
                      </Badge>
                      <span>
                        {station1?.name || `Station ${segment.station1Id}`} ↔{" "}
                        {station2?.name || `Station ${segment.station2Id}`}
                      </span>
                    </div>

                    <Button
                      variant={
                        alreadySelected ? "outline-secondary" : "primary"
                      }
                      size="sm"
                      disabled={disabled || alreadySelected}
                      onClick={() => onSelectSegment(segment.id)}
                    >
                      {alreadySelected
                        ? "Already selected"
                        : "Select segment"}
                    </Button>
                  </div>
                </Col>
              );
            })}
          </Row>
        )}
      </Card.Body>
    </Card>
  );
}

export default SegmentList;