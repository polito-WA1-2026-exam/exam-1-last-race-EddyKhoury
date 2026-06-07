import { Spinner } from "react-bootstrap";

function Loading({ message = "Loading..." }) {
  return (
    <div className="text-center my-5">
      <Spinner animation="border" role="status" className="mb-3">
        <span className="visually-hidden">{message}</span>
      </Spinner>
      <div className="text-muted">{message}</div>
    </div>
  );
}

export default Loading;