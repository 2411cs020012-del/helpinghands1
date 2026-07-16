package net.javaguides.springboot.controller;

import net.javaguides.springboot.model.User;
import net.javaguides.springboot.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@CrossOrigin(origins = "*")
@RestController
@RequestMapping("/api/v1/")
public class UserController {

    @Autowired
    private UserRepository userRepository;

    @GetMapping("/users")
    public List<User> getAllUsers(@RequestHeader(value = "X-User-Role", required = false) String role) {
        List<User> users = userRepository.findAll();
        if (!"ADMIN".equals(role)) {
            users.forEach(u -> u.setEmail("hidden"));
        }
        return users;
    }

    @PostMapping("/users")
    public ResponseEntity<?> createUser(@RequestBody User user,
            @RequestHeader(value = "X-User-Role", required = false) String requesterRole) {
        if ("ADMIN".equals(user.getRole()) && !"ADMIN".equals(requesterRole)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Only an existing admin can create another admin.");
        }
        return ResponseEntity.ok(userRepository.save(user));
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody User loginRequest) {
        Optional<User> found = userRepository.findByEmail(loginRequest.getEmail());
        if (found.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("No user found with that email. Register first.");
        }
        return ResponseEntity.ok(found.get());
    }
}