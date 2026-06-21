const API_URL = "http://localhost:3001/api"; //stores the backend api base URL 

//this helper reads the error response from the server and returns a clean error message
async function getErrorMessage(response) {
  try {
    const errorBody = await response.json();
    return errorBody.error || "Request failed";
  } catch {
    return "Request failed";
  }
}

//sends the email and password to the backend login endpoint
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

//checks whether the browser already has a valid login session cookie 
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

//log out the user by deleting the server session 
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