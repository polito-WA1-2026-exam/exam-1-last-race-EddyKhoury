const API_URL = "http://localhost:3001/api";

async function handleResponse(response) {
  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.error || "API request failed");
  }

  return data;
}

export async function getFullNetwork() {
  const response = await fetch(`${API_URL}/network/full`, {
    credentials: "include",
  });

  return handleResponse(response);
}

export async function createGame() {
  const response = await fetch(`${API_URL}/games`, {
    method: "POST",
    credentials: "include",
  });

  return handleResponse(response);
}

export async function getPlanningGame(gameId) {
  const response = await fetch(`${API_URL}/games/${gameId}/planning`, {
    credentials: "include",
  });

  return handleResponse(response);
}

export async function submitRoute(gameId, segmentIds) {
  const response = await fetch(`${API_URL}/games/${gameId}/route`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify({
      segments: segmentIds,
    }),
  });

  return handleResponse(response);
}

export async function getGame(gameId) {
  const response = await fetch(`${API_URL}/games/${gameId}`, {
    credentials: "include",
  });

  return handleResponse(response);
}

export async function getGameSteps(gameId) {
  const response = await fetch(`${API_URL}/games/${gameId}/steps`, {
    credentials: "include",
  });

  return handleResponse(response);
}

export async function getRanking() {
  const response = await fetch(`${API_URL}/ranking`, {
    credentials: "include",
  });

  return handleResponse(response);
}