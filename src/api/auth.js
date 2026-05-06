import { http } from "./http.js";

export async function login({ username, password }) {
  const { data } = await http.post("/api/auth/token/", { username, password });
  localStorage.setItem("access_token", data.access);
  localStorage.setItem("refresh_token", data.refresh);
  return data;
}

export function logout() {
  localStorage.removeItem("access_token");
  localStorage.removeItem("refresh_token");
}
