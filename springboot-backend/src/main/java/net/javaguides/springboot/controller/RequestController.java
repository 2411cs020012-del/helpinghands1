package net.javaguides.springboot.controller;

import net.javaguides.springboot.model.Request;
import net.javaguides.springboot.repository.RequestRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@CrossOrigin(origins = "*")
@RestController
@RequestMapping("/api/v1/")
public class RequestController {

    @Autowired
    private RequestRepository requestRepository;

    @GetMapping("/requests")
    public List<Request> getAllRequests() {
        return requestRepository.findAll();
    }

    @PostMapping("/requests")
    public Request createRequest(@RequestBody Request request) {
        return requestRepository.save(request);
    }
}
