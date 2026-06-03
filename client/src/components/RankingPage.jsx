import { Card, Container, Table } from "react-bootstrap";

function RankingPage() {
  return (
    <Container className="py-4">
      <Card className="shadow-sm">
        <Card.Body className="p-4">
          <h1 className="h3">Ranking</h1>

          <p className="text-muted">
            This protected page will later show the best completed score per
            user.
          </p>

          <Table bordered hover responsive className="mb-0">
            <thead>
              <tr>
                <th>Position</th>
                <th>User</th>
                <th>Best Score</th>
              </tr>
            </thead>

            <tbody>
              <tr>
                <td colSpan="3" className="text-muted">
                  Ranking data will be loaded in Section 10.
                </td>
              </tr>
            </tbody>
          </Table>
        </Card.Body>
      </Card>
    </Container>
  );
}

export default RankingPage;