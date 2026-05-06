import { http } from "./http.js";

export async function listAllProducts(params) {
  const { data } = await http.get("/api/products/", { params });
  return data;
}

export async function exchangeProduct(productId, quantity = 1) {
  const { data } = await http.post("/api/points/exchange/", {
    product_id: productId,
    quantity: quantity,
  });
  return data;
}

export async function listMyExchanges(params) {
  const { data } = await http.get("/api/points/exchanges/", { params });
  return data;
}

export async function listMyTransactions(params) {
  const { data } = await http.get("/api/points/transactions/", { params });
  return data;
}

export async function depositPoints(amount) {
  const { data } = await http.post("/api/points/deposit/", {
    amount: amount,
  });
  return data;
}
