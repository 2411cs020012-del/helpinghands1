import axios from "axios";

const ITEM_BASE_REST_API_URL = "http://localhost:8081/api/v1/items";

function authHeaders() {
  const saved = localStorage.getItem("hh_user");
  const user = saved ? JSON.parse(saved) : null;
  return user ? { "X-User-Role": user.role, "X-User-Id": user.id } : {};
}

class ItemService {
  getAllItems() {
    return axios.get(ITEM_BASE_REST_API_URL);
  }

  createItem(item) {
    return axios.post(ITEM_BASE_REST_API_URL, item, { headers: authHeaders() });
  }

  getItemById(itemId) {
    return axios.get(ITEM_BASE_REST_API_URL + "/" + itemId);
  }

  updateItem(item, itemId) {
    return axios.put(ITEM_BASE_REST_API_URL + "/" + itemId, item);
  }

  deleteItem(itemId) {
    return axios.delete(ITEM_BASE_REST_API_URL + "/" + itemId);
  }
}

export default new ItemService();