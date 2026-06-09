import { useEffect, useState } from "react";
import { Alert, Button, Card, Col, Container, Row } from "react-bootstrap";
import { useNavigate, useParams } from "react-router";
import { getGame } from "../api/gameApi";
import Loading from "./Loading";

function ResultPage() {
  const { gameId } = useParams();
  const navigate = useNavigate();

  const [game, setGame] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    async function loadGame() {
      try {
        setLoading(true);
        setErrorMessage("");

        const loadedGame = await getGame(gameId);
        setGame(loadedGame);
      } catch (err) {
        setErrorMessage(err.message);
      } finally {
        setLoading(false);
      }
    }

    loadGame();
  }, [gameId]);

  if (loading) {
    return <Loading message="Loading game result..." />;
  }

  const finalScore = game?.finalScore ?? 0;

  return (
    <Container>
      <Row className="justify-content-center">
        <Col lg={8}>
          <Card className="shadow-sm text-center">
            <Card.Body>
              <Card.Title as="h2" className="mb-3">
                Game Result
              </Card.Title>

              {errorMessage && (
                <Alert variant="danger">
                  {errorMessage}
                </Alert>
              )}

              {!errorMessage && game && (
                <>
                  <Card.Text className="text-muted mb-4">
                    Your game from{" "}
                    <strong>{game.startStationName}</strong> to{" "}
                    <strong>{game.destinationStationName}</strong> is completed.
                  </Card.Text>

                  <div className="display-4 fw-bold mb-3">
                    {finalScore} coins
                  </div>

                  {finalScore === 0 && (
                    <Alert variant="warning">
                      Score is 0. This can happen if the route was invalid,
                      incomplete, or if the final coin total was negative.
                    </Alert>
                  )}

                  <Card.Text>
                    Status: <strong>{game.status}</strong>
                  </Card.Text>

                  <div className="d-flex justify-content-center gap-2 mt-4">
                    <Button
                      variant="primary"
                      onClick={() => navigate("/setup")}
                    >
                      Start New Game
                    </Button>

                    <Button
                      variant="outline-secondary"
                      onClick={() => navigate("/ranking")}
                    >
                      Ranking
                    </Button>
                  </div>
                </>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}

export default ResultPage;