package net.javaguides.springboot.controller;

import net.javaguides.springboot.model.Request;
import net.javaguides.springboot.model.Item;
import net.javaguides.springboot.repository.RequestRepository;
import net.javaguides.springboot.repository.ItemRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@CrossOrigin(origins = "*")
@RestController
@RequestMapping("/api/v1/")
public class RequestController {

    @Autowired
    private RequestRepository requestRepository;
    @Autowired
    private ItemRepository itemRepository;

    @GetMapping("/requests")
    public List<Request> getAllRequests() {
        return requestRepository.findAll();
    }

    @PostMapping("/requests")
    public ResponseEntity<?> createRequest(@RequestBody Request request,
            @RequestHeader(value = "X-User-Role", required = false) String role) {
        if (role == null || !role.equals("RECIPIENT")) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Only recipients can request items.");
        }
        return ResponseEntity.ok(requestRepository.save(request));
    }

    @PutMapping("/requests/{id}")
    public ResponseEntity<?> updateRequestStatus(@PathVariable long id, @RequestBody Request updated,
            @RequestHeader(value = "X-User-Role", required = false) String role) {
        if (role == null || !role.equals("ADMIN")) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Only admins can update request status.");
        }
        Request req = requestRepository.findById(id).orElseThrow();
        req.setStatus(updated.getStatus());
        Request saved = requestRepository.save(req);
        if ("ACCEPTED".equals(updated.getStatus())) {
            Item item = itemRepository.findById(req.getItemId()).orElse(null);
            if (item != null) { item.setStatus("RESERVED"); itemRepository.save(item); }
        } else if ("COMPLETED".equals(updated.getStatus())) {
            Item item = itemRepository.findById(req.getItemId()).orElse(null);
            if (item != null) { item.setStatus("DONATED"); itemRepository.save(item); }
        } else if ("REJECTED".equals(updated.getStatus())) {
            Item item = itemRepository.findById(req.getItemId()).orElse(null);
            if (item != null) { item.setStatus("AVAILABLE"); itemRepository.save(item); }
        }
        return ResponseEntity.ok(saved);
    }
}