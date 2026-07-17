import axios from "axios";
const API_ROOT = "http://localhost:8081/api/v1";
const USER_BASE_REST_API_URL = `${API_ROOT}/users`;

function authHeaders() {
  const saved = localStorage.getItem("hh_user");
  const user = saved ? JSON.parse(saved) : null;
  return user ? { "X-User-Role": user.role, "X-User-Id": user.id } : {};
}

class UserService {
  getAllUsers() {
    return axios.get(USER_BASE_REST_API_URL, { headers: authHeaders() });
  }
  createUser(user) {
    return axios.post(USER_BASE_REST_API_URL, user, { headers: authHeaders() });
  }
  login(credentials) {
    return axios.post(API_ROOT + "/login", credentials);
  }
}
export default new UserService();