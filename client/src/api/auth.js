const API_URL = "http://localhost:3001/api";

async function getErrorMessage(response) {
  try {
    const errorBody = await response.json();
    return errorBody.error || "Request failed";
  } catch {
    return "Request failed";
  }
}

async function doLogin(email, password) {
  const response = await fetch(`${API_URL}/sessions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    credentials: "include",
    body: JSON.stringify({ email, password })
  });

  if (!response.ok) {
    throw new Error(await getErrorMessage(response));
  }

  return await response.json();
}

async function checkSession() {
  const response = await fetch(`${API_URL}/sessions/current`, {
    credentials: "include"
  });

  if (response.status === 401) {
    return null;
  }

  if (!response.ok) {
    throw new Error(await getErrorMessage(response));
  }

  return await response.json();
}

async function doLogout() {
  const response = await fetch(`${API_URL}/sessions/current`, {
    method: "DELETE",
    credentials: "include" // uses session cookies and not JWT
  });

  if (!response.ok) {
    throw new Error(await getErrorMessage(response));
  }
}

export { doLogin, checkSession, doLogout };