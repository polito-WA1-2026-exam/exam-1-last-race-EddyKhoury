import { useEffect, useState } from "react";
import { Alert, Button, Card, Col, Container, Row } from "react-bootstrap";
import { useNavigate } from "react-router";

import { createGame, getFullNetwork } from "../api/gameApi";
import Loading from "./Loading";
import NetworkMap from "./NetworkMap";

function SetupPage() {
  const [network, setNetwork] = useState(null);
  const [loading, setLoading] = useState(true);
  const [startingGame, setStartingGame] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    async function loadNetwork() {
      try {
        setLoading(true);
        setErrorMessage("");

        const fullNetwork = await getFullNetwork();
        setNetwork(fullNetwork);
      } catch (err) {
        setErrorMessage(err.message);
      } finally {
        setLoading(false);
      }
    }

    loadNetwork();
  }, []);

  const handleStartGame = async () => {
    try {
      setStartingGame(true);
      setErrorMessage("");

      const game = await createGame();
      navigate(`/game/${game.id}/planning`);
    } catch (err) {
      setErrorMessage(err.message);
      setStartingGame(false);
    }
  };

  if (loading) {
    return <Loading message="Loading full underground network..." />;
  }

  return (
    <Container>
      <Row className="justify-content-center">
        <Col lg={11}>
          <Card className="shadow-sm">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-start gap-3 mb-3">
                <div>
                  <h1 className="mb-2">Setup Phase</h1>
                  <p className="text-muted mb-0">
                    Study the full underground network before starting. In this phase,
                    line colors and connections are visible.
                  </p>
                </div>

                <Button
                  variant="primary"
                  onClick={handleStartGame}
                  disabled={startingGame}
                >
                  {startingGame ? "Starting..." : "Start Game"}
                </Button>
              </div>

              {errorMessage && (
                <Alert variant="danger" className="mb-3">
                  {errorMessage}
                </Alert>
              )}

              <NetworkMap network={network} mode="full" />

              <div className="mt-3 text-muted">
                <strong>Setup rule:</strong> this page shows the complete network.
                After pressing Start Game, the planning page will hide line colors and
                line information.
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}

export default SetupPage;