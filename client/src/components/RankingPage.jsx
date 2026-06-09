import { useEffect, useState } from "react";
import { Alert, Card, Col, Container, Row, Table } from "react-bootstrap";
import { getRanking } from "../api/gameApi";
import Loading from "./Loading";

function RankingPage() {
  const [ranking, setRanking] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    async function loadRanking() {
      try {
        setLoading(true);
        setErrorMessage("");

        const loadedRanking = await getRanking();
        setRanking(loadedRanking);
      } catch (err) {
        setErrorMessage(err.message);
      } finally {
        setLoading(false);
      }
    }

    loadRanking();
  }, []);

  if (loading) {
    return <Loading message="Loading ranking..." />;
  }

  return (
    <Container>
      <Row className="justify-content-center">
        <Col lg={9}>
          <Card className="shadow-sm">
            <Card.Body>
              <Card.Title as="h2" className="mb-3">
                Ranking
              </Card.Title>

              <Card.Text className="text-muted">
                Ranking shows the best completed score for each user.
              </Card.Text>

              {errorMessage && (
                <Alert variant="danger">
                  {errorMessage}
                </Alert>
              )}

              {!errorMessage && ranking.length === 0 && (
                <Alert variant="info">
                  No completed games are available yet.
                </Alert>
              )}

              {!errorMessage && ranking.length > 0 && (
                <Table striped bordered hover responsive>
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Player</th>
                      <th>Email</th>
                      <th>Best Score</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ranking.map((row, index) => (
                      <tr key={row.userId}>
                        <td>{index + 1}</td>
                        <td>{row.name}</td>
                        <td>{row.email}</td>
                        <td>{row.bestScore}</td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}

export default RankingPage;