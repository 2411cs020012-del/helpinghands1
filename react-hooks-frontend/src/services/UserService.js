import axios from "axios";
const USER_BASE_REST_API_URL = "http://localhost:8080/api/v1/users";
const API_ROOT = "http://localhost:8080/api/v1";

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
  login(email) {
    return axios.post(API_ROOT + "/login", { email });
  }
}
export default new UserService();