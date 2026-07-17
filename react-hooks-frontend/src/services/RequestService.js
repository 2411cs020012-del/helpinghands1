import axios from "axios";

const REQUEST_BASE_REST_API_URL = "http://localhost:8081/api/v1/requests";

function authHeaders() {
  const saved = localStorage.getItem("hh_user");
  const user = saved ? JSON.parse(saved) : null;
  return user ? { "X-User-Role": user.role, "X-User-Id": user.id } : {};
}

class RequestService {
  getAllRequests() {
    return axios.get(REQUEST_BASE_REST_API_URL, { headers: authHeaders() });
  }

  createRequest(request) {
    return axios.post(REQUEST_BASE_REST_API_URL, request, { headers: authHeaders() });
  }

  updateRequestStatus(id, status) {
    return axios.put(REQUEST_BASE_REST_API_URL + "/" + id, { status }, { headers: authHeaders() });
  }
}

export default new RequestService();
