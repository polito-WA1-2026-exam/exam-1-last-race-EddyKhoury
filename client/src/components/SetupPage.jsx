import { Button, Card, Container } from "react-bootstrap";

function SetupPage() {
  return (
    <Container className="py-4">
      <Card className="shadow-sm">
        <Card.Body className="p-4">
          <h1 className="h3">Setup Phase</h1>

          <p className="text-muted">
            This protected page will later show the full underground network map
            and the Start Game button.
          </p>

          <Button variant="primary" disabled>
            Start Game will be added in Section 8
          </Button>
        </Card.Body>
      </Card>
    </Container>
  );
}

export default SetupPage;