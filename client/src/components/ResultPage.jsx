import { Button, Card, Container } from "react-bootstrap";
import { Link, useParams } from "react-router";

function ResultPage() {
  const { gameId } = useParams();

  return (
    <Container className="py-4">
      <Card className="shadow-sm">
        <Card.Body className="p-4">
          <h1 className="h3">Result Phase</h1>

          <p className="text-muted">
            This protected page will later show the final score returned by the
            server.
          </p>

          <p>
            Current game id from the URL: <strong>{gameId}</strong>
          </p>

          <div className="d-flex gap-2">
            <Button as={Link} to="/setup" variant="primary">
              Back to Setup
            </Button>

            <Button as={Link} to="/ranking" variant="outline-secondary">
              Ranking
            </Button>
          </div>
        </Card.Body>
      </Card>
    </Container>
  );
}

export default ResultPage;