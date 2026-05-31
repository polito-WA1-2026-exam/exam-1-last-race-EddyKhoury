import { Routes, Route, NavLink } from "react-router";
import { Container, Navbar, Nav, Card, Row, Col, Button } from "react-bootstrap";

function HomePage() {
  return (
    <Row className="justify-content-center">
      <Col lg={10}>
        <Card className="shadow-sm">
          <Card.Body className="p-4">
            <p className="text-uppercase text-muted fw-semibold mb-2">
              Web Applications I Exam Project
            </p>

            <h1 className="display-5 fw-bold mb-3">Last Race</h1>

            <p className="lead mb-4">
              A single-player route planning game inspired by Race the Rails.
              Plan your underground route, survive random events, and finish
              with the highest possible coin score.
            </p>

            <div className="d-flex gap-2 flex-wrap">
              <Button variant="primary" disabled>
                Login will be added later
              </Button>
              <Button variant="outline-secondary" disabled>
                Game setup will be added later
              </Button>
            </div>
          </Card.Body>
        </Card>

        <Row className="g-3 mt-4">
          <Col md={4}>
            <Card className="h-100 shadow-sm">
              <Card.Body>
                <h2 className="h5">1. Setup</h2>
                <p className="mb-0 text-muted">
                  A logged-in player will see the full metro network before
                  starting a game.
                </p>
              </Card.Body>
            </Card>
          </Col>

          <Col md={4}>
            <Card className="h-100 shadow-sm">
              <Card.Body>
                <h2 className="h5">2. Planning</h2>
                <p className="mb-0 text-muted">
                  The player will have 90 seconds to choose route segments from
                  start to destination.
                </p>
              </Card.Body>
            </Card>
          </Col>

          <Col md={4}>
            <Card className="h-100 shadow-sm">
              <Card.Body>
                <h2 className="h5">3. Execution</h2>
                <p className="mb-0 text-muted">
                  The server will validate the route, apply random events, and
                  calculate the final score.
                </p>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Col>
    </Row>
  );
}

function ProjectInfoPage() {
  return (
    <Row className="justify-content-center">
      <Col lg={9}>
        <Card className="shadow-sm">
          <Card.Body className="p-4">
            <h1 className="h3 mb-3">Project base layout</h1>

            <p>
              This page exists only to verify that React Router works correctly.
              The real game pages will be added in later sections.
            </p>

            <ul className="mb-0">
              <li>React runs on port 5173.</li>
              <li>Express runs on port 3001.</li>
              <li>The client and server are separate applications.</li>
              <li>Bootstrap is loaded globally.</li>
            </ul>
          </Card.Body>
        </Card>
      </Col>
    </Row>
  );
}

function NotFoundPage() {
  return (
    <Card className="shadow-sm">
      <Card.Body>
        <h1 className="h4">Page not found</h1>
        <p className="mb-0 text-muted">
          This route does not exist yet in the Last Race client.
        </p>
      </Card.Body>
    </Card>
  );
}

function App() {
  return (
    <div className="min-vh-100 d-flex flex-column bg-light">
      <Navbar bg="dark" variant="dark" expand="lg">
        <Container>
          <Navbar.Brand as={NavLink} to="/">
            Last Race
          </Navbar.Brand>

          <Navbar.Toggle aria-controls="main-navbar" />

          <Navbar.Collapse id="main-navbar">
            <Nav className="ms-auto">
              <Nav.Link as={NavLink} to="/">
                Instructions
              </Nav.Link>
              <Nav.Link as={NavLink} to="/project-info">
                Project info
              </Nav.Link>
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>

      <main className="flex-grow-1">
        <Container className="py-4">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/project-info" element={<ProjectInfoPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </Container>
      </main>

      <footer className="border-top py-3 bg-white">
        <Container className="small text-muted">
          Last Race — Web Applications I 2025/26
        </Container>
      </footer>
    </div>
  );
}

export default App;