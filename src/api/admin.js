import { http } from "./http.js";

export async function listPointTransactions(params) {
  const { data } = await http.get("/api/points/transactions/", { params });
  return data;
}

export async function listPointExchanges(params) {
  const { data } = await http.get("/api/points/exchanges/", { params });
  return data;
}

export async function lookupExchangeByCode(code) {
  const { data } = await http.get("/api/points/exchanges/lookup-by-code/", {
    params: { code },
  });
  return data;
}

export async function verifyExchange(id) {
  const { data } = await http.patch(`/api/points/exchanges/${id}/`, {
    status: "VERIFIED",
  });
  return data;
}

export async function listProducts(params) {
  const { data } = await http.get("/api/products/", { params });
  return data;
}

export async function patchProduct(id, payload) {
  const { data } = await http.patch(`/api/products/${id}/`, payload);
  return data;
}

export async function deleteProduct(id) {
  const { data } = await http.delete(`/api/products/${id}/`);
  return data;
}
