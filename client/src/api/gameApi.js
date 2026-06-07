const API_URL = "http://localhost:3001/api";

async function handleResponse(response) {
  if (!response.ok) {
    let errorMessage = "Request failed";

    try {
      const errorBody = await response.json();
      errorMessage = errorBody.error || errorBody.message || errorMessage;
    } catch {
      // If the server does not return JSON, keep the default message.
    }

    throw new Error(errorMessage);
  }

  return await response.json();
}

export async function getFullNetwork() {
  const response = await fetch(`${API_URL}/network/full`, {
    credentials: "include",
  });

  return await handleResponse(response);
}

export async function createGame() {
  const response = await fetch(`${API_URL}/games`, {
    method: "POST",
    credentials: "include",
  });

  return await handleResponse(response);
}