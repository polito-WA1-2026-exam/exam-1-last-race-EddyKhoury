import { Card, Container } from "react-bootstrap";
import { useParams } from "react-router";

function PlanningPage() {
  const { gameId } = useParams();

  return (
    <Container className="py-4">
      <Card className="shadow-sm">
        <Card.Body className="p-4">
          <h1 className="h3">Planning Phase</h1>

          <p className="text-muted">
            This protected page will later show the station-only planning map,
            segment selection, selected route, and 90-second timer.
          </p>

          <p className="mb-0">
            Current game id from the URL: <strong>{gameId}</strong>
          </p>
        </Card.Body>
      </Card>
    </Container>
  );
}

export default PlanningPage;