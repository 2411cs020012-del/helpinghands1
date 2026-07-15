import axios from "axios";

const REQUEST_BASE_REST_API_URL = "http://localhost:8080/api/v1/requests";

class RequestService {
  getAllRequests() {
    return axios.get(REQUEST_BASE_REST_API_URL);
  }

  createRequest(request) {
    return axios.post(REQUEST_BASE_REST_API_URL, request);
  }

  updateRequestStatus(id, status) {
    return axios.put(REQUEST_BASE_REST_API_URL + "/" + id, { status });
  }
}

export default new RequestService();
