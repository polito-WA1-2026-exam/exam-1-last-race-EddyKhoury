import { Button, Card, Container } from "react-bootstrap";
import { Link } from "react-router";

function ErrorPage() {
  return (
    <Container className="py-4">
      <Card className="shadow-sm">
        <Card.Body className="p-4">
          <h1 className="h3">Page not found</h1>

          <p className="text-muted">
            The page you are looking for does not exist or is not available.
          </p>

          <Button as={Link} to="/" variant="primary">
            Go to instructions
          </Button>
        </Card.Body>
      </Card>
    </Container>
  );
}

export default ErrorPage;