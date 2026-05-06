import { http } from "./http.js";

export async function fetchMe() {
  const { data } = await http.get("/api/users/me/");
  return data;
}
