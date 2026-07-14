import axios from "axios";

const ITEM_BASE_REST_API_URL = "http://localhost:8080/api/v1/items";

class ItemService {
  getAllItems() {
    return axios.get(ITEM_BASE_REST_API_URL);
  }

  createItem(item) {
    return axios.post(ITEM_BASE_REST_API_URL, item);
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