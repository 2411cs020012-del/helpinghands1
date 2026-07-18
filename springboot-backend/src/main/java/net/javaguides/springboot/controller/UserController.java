package net.javaguides.springboot.controller;

import net.javaguides.springboot.model.User;
import net.javaguides.springboot.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@CrossOrigin(origins = "*", allowedHeaders = "*", methods = {RequestMethod.GET, RequestMethod.POST, RequestMethod.PUT, RequestMethod.DELETE, RequestMethod.OPTIONS})
@RestController
@RequestMapping("/api/v1/")
public class UserController {

    @Autowired
    private UserRepository userRepository;

    @GetMapping("/users")
    public List<User> getAllUsers(@RequestHeader(value = "X-User-Role", required = false) String role) {
        List<User> users = userRepository.findAll();
        List<User> result = new java.util.ArrayList<>();
        for (User u : users) {
            User dto = new User();
            dto.setId(u.getId());
            dto.setName(u.getName());
            dto.setRole(u.getRole());
            if ("ADMIN".equals(role)) {
                dto.setEmail(u.getEmail());
            } else {
                dto.setEmail("hidden");
            }
            dto.setPassword(null);
            result.add(dto);
        }
        return result;
    }

    @PostMapping("/users")
    public ResponseEntity<?> createUser(@RequestBody User user,
            @RequestHeader(value = "X-User-Role", required = false) String requesterRole) {
        if ("ADMIN".equals(user.getRole()) && !"ADMIN".equals(requesterRole)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Admin account creation is not allowed through public registration.");
        }
        return ResponseEntity.ok(userRepository.save(user));
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> loginRequest) {
        String email = loginRequest.get("email");
        String password = loginRequest.get("password");

        if (email == null || email.isBlank()) {
            return ResponseEntity.badRequest().body("Email is required.");
        }
        if (password == null) {
            return ResponseEntity.badRequest().body("Password is required.");
        }

        List<User> found = userRepository.findByEmail(email);
        if (found.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("No user found with that email. Register first.");
        }

        User user = found.get(0);
        if (!password.equals(user.getPassword())) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid credentials.");
        }

        return ResponseEntity.ok(user);
    }
}
