package net.javaguides.springboot.controller;

import net.javaguides.springboot.model.Item;
import net.javaguides.springboot.repository.ItemRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@CrossOrigin(origins = "*", allowedHeaders = "*", methods = {RequestMethod.GET, RequestMethod.POST, RequestMethod.PUT, RequestMethod.DELETE, RequestMethod.OPTIONS})
@RestController
@RequestMapping("/api/v1/")
public class ItemController {

    @Autowired
    private ItemRepository itemRepository;

    @GetMapping("/items")
    public List<Item> getAllItems() {
        return itemRepository.findAll();
    }

    @PostMapping("/items")
    public Item createItem(@RequestBody Item item) {
        return itemRepository.save(item);
    }

    @GetMapping("/items/{id}")
    public Item getItemById(@PathVariable long id) {
        return itemRepository.findById(id).orElseThrow();
    }

    @PutMapping("/items/{id}")
    public Item updateItem(@PathVariable long id, @RequestBody Item itemDetails) {
        Item item = itemRepository.findById(id).orElseThrow();
        item.setTitle(itemDetails.getTitle());
        item.setDescription(itemDetails.getDescription());
        item.setCategory(itemDetails.getCategory());
        item.setStatus(itemDetails.getStatus());
        return itemRepository.save(item);
    }

    @DeleteMapping("/items/{id}")
    public String deleteItem(@PathVariable long id) {
        itemRepository.deleteById(id);
        return "Item deleted successfully.";
    }
}