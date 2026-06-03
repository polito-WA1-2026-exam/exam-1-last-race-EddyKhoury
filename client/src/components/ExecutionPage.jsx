import { Card, Container } from "react-bootstrap";
import { useParams } from "react-router";

function ExecutionPage() {
  const { gameId } = useParams();

  return (
    <Container className="py-4">
      <Card className="shadow-sm">
        <Card.Body className="p-4">
          <h1 className="h3">Execution Phase</h1>

          <p className="text-muted">
            This protected page will later display the server-generated game
            steps one by one.
          </p>

          <p className="mb-0">
            Current game id from the URL: <strong>{gameId}</strong>
          </p>
        </Card.Body>
      </Card>
    </Container>
  );
}

export default ExecutionPage;