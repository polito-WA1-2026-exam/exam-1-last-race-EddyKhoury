import { useContext, useState } from "react";
import { Alert, Button, Card, Container, Form } from "react-bootstrap";
import { Link, useNavigate } from "react-router";

import UserContext from "../contexts/UserContext";
import { doLogin } from "../api/auth";

function LoginForm() {
  const { setUser, setLoggedIn } = useContext(UserContext);

  const [email, setEmail] = useState("alice@example.com");
  const [password, setPassword] = useState("password");
  const [errorMessage, setErrorMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const navigate = useNavigate();

  async function handleSubmit(event) {
    event.preventDefault();

    if (!email || !password) {
      setErrorMessage("Email and password are required.");
      return;
    }

    try {
      setSubmitting(true);
      setErrorMessage("");

      const user = await doLogin(email, password);

      setUser(user);
      setLoggedIn(true);

      navigate("/setup");
    } catch (err) {
      setErrorMessage(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Container className="py-4">
      <Card className="shadow-sm mx-auto">
        <Card.Body className="p-4">
          <h1 className="h3 mb-3">Login</h1>

          <p className="text-muted">
            Use one of the seeded users to access the game pages.
          </p>

          {errorMessage && <Alert variant="danger">{errorMessage}</Alert>}

          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3" controlId="login-email">
              <Form.Label>Email</Form.Label>
              <Form.Control
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                disabled={submitting}
              />
            </Form.Group>

            <Form.Group className="mb-3" controlId="login-password">
              <Form.Label>Password</Form.Label>
              <Form.Control
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                disabled={submitting}
              />
            </Form.Group>

            <div className="d-flex gap-2">
              <Button type="submit" variant="primary" disabled={submitting}>
                {submitting ? "Logging in..." : "Login"}
              </Button>

              <Button as={Link} to="/" variant="outline-secondary">
                Back
              </Button>
            </div>
          </Form>
        </Card.Body>
      </Card>
    </Container>
  );
}

export default LoginForm;