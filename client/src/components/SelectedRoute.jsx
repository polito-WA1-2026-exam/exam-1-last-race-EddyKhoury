import { Badge, Button, Card, ListGroup } from "react-bootstrap";

function SelectedRoute({
  selectedSegmentIds,
  segments,
  stations,
  onRemoveLast,
  onClearRoute,
  disabled = false,
}) {
  const segmentsById = new Map();
  const stationsById = new Map();

  segments.forEach((segment) => {
    segmentsById.set(segment.id, segment);
  });

  stations.forEach((station) => {
    stationsById.set(station.id, station);
  });

  const selectedSegments = selectedSegmentIds
    .map((segmentId) => segmentsById.get(segmentId))
    .filter((segment) => segment !== undefined);

  return (
    <Card>
      <Card.Header className="d-flex justify-content-between align-items-center">
        <strong>Selected Route</strong>

        <div>
          <Button
            variant="outline-secondary"
            size="sm"
            className="me-2"
            disabled={disabled || selectedSegmentIds.length === 0}
            onClick={onRemoveLast}
          >
            Remove last
          </Button>

          <Button
            variant="outline-danger"
            size="sm"
            disabled={disabled || selectedSegmentIds.length === 0}
            onClick={onClearRoute}
          >
            Clear
          </Button>
        </div>
      </Card.Header>

      <Card.Body>
        {selectedSegments.length === 0 ? (
          <p className="text-muted mb-0">
            No segments selected yet. Choose segments from the list to build
            your route.
          </p>
        ) : (
          <ListGroup variant="flush">
            {selectedSegments.map((segment, index) => {
              const station1 = stationsById.get(segment.station1Id);
              const station2 = stationsById.get(segment.station2Id);

              return (
                <ListGroup.Item key={`${segment.id}-${index}`}>
                  <Badge bg="primary" className="me-2">
                    {index + 1}
                  </Badge>

                  <Badge bg="secondary" className="me-2">
                    #{segment.id}
                  </Badge>

                  <span>
                    {station1?.name || `Station ${segment.station1Id}`} ↔{" "}
                    {station2?.name || `Station ${segment.station2Id}`}
                  </span>
                </ListGroup.Item>
              );
            })}
          </ListGroup>
        )}
      </Card.Body>
    </Card>
  );
}

export default SelectedRoute;