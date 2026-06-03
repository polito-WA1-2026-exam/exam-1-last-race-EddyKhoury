import { Button, Card, Col, Container, Row } from "react-bootstrap";
import { Link } from "react-router";

function InstructionsPage() {
  return (
    <Container className="py-4">
      <Card className="shadow-sm mb-4">
        <Card.Body className="p-4">
          <p className="text-uppercase text-muted fw-semibold mb-2">
            Web Applications I Exam Project
          </p>

          <h1 className="display-5 fw-bold">Last Race</h1>

          <p className="lead">
            Plan an underground route from a starting station to a destination
            station. The server validates your route, applies random events, and
            calculates your final coin score.
          </p>

          <div className="d-flex gap-2 flex-wrap">
            <Button as={Link} to="/login" variant="primary">
              Login to play
            </Button>
          </div>
        </Card.Body>
      </Card>

      <Row className="g-3">
        <Col md={4}>
          <Card className="h-100 shadow-sm">
            <Card.Body>
              <h2 className="h5">1. Setup</h2>
              <p className="mb-0">
                After login, the player can see the full metro network before
                starting a game.
              </p>
            </Card.Body>
          </Card>
        </Col>

        <Col md={4}>
          <Card className="h-100 shadow-sm">
            <Card.Body>
              <h2 className="h5">2. Planning</h2>
              <p className="mb-0">
                The server assigns the start and destination. The player has 90
                seconds to select route segments.
              </p>
            </Card.Body>
          </Card>
        </Col>

        <Col md={4}>
          <Card className="h-100 shadow-sm">
            <Card.Body>
              <h2 className="h5">3. Execution</h2>
              <p className="mb-0">
                The server checks the route, applies random events, and returns
                the final score.
              </p>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}

export default InstructionsPage;