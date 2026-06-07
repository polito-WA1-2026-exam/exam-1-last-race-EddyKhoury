import { Badge, Button, Card, Col, Row } from "react-bootstrap";

function SegmentList({
  segments,
  stations,
  selectedSegmentIds,
  onSelectSegment,
  disabled = false,
}) {
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

  return (
    <Card>
      <Card.Header>
        <strong>Selectable Segments</strong>
      </Card.Header>

      <Card.Body>
        <Row className="g-2">
          {segments.map((segment) => {
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
                    variant={alreadySelected ? "outline-secondary" : "primary"}
                    size="sm"
                    disabled={disabled || alreadySelected}
                    onClick={() => onSelectSegment(segment.id)}
                  >
                    {alreadySelected ? "Already selected" : "Select segment"}
                  </Button>
                </div>
              </Col>
            );
          })}
        </Row>
      </Card.Body>
    </Card>
  );
}

export default SegmentList;