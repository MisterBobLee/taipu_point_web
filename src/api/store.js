import { http } from "./http.js";

export async function listStoreProducts(params) {
  const { data } = await http.get("/api/products/", { params });
  return data;
}

export async function createProduct(payload) {
  const { data } = await http.post("/api/products/", payload);
  return data;
}

export async function patchStoreProduct(id, payload) {
  const { data } = await http.patch(`/api/products/${id}/`, payload);
  return data;
}

export async function deleteStoreProduct(id) {
  const { data } = await http.delete(`/api/products/${id}/`);
  return data;
}

export async function listStoreExchanges(params) {
  const { data } = await http.get("/api/points/exchanges/", { params });
  return data;
}

export async function verifyStoreExchange(id) {
  const { data } = await http.patch(`/api/points/exchanges/${id}/`, {
    status: "VERIFIED",
  });
  return data;
}
