import axios from "axios";

const USER_BASE_REST_API_URL = "http://localhost:8080/api/v1/users";

class UserService {
  getAllUsers() {
    return axios.get(USER_BASE_REST_API_URL);
  }

  createUser(user) {
    return axios.post(USER_BASE_REST_API_URL, user);
  }
}

export default new UserService();
