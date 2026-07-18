package net.javaguides.springboot.controller;
import net.javaguides.springboot.model.Item;
import net.javaguides.springboot.repository.ItemRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.UUID;

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
    public Item createItem(
            @RequestParam("title") String title,
            @RequestParam(value = "description", required = false) String description,
            @RequestParam(value = "category", required = false) String category,
            @RequestParam(value = "status", required = false) String status,
            @RequestParam(value = "contactNumber", required = false) String contactNumber,
            @RequestParam(value = "location", required = false) String location,
            @RequestParam(value = "photo", required = false) MultipartFile photo
    ) throws IOException {
        Item item = new Item();
        item.setTitle(title);
        item.setDescription(description);
        item.setCategory(category);
        item.setStatus(status != null ? status : "AVAILABLE");
        item.setContactNumber(contactNumber);
        item.setLocation(location);

        if (photo != null && !photo.isEmpty()) {
            String uploadDir = "uploads";
            File dir = new File(uploadDir);
            if (!dir.exists()) dir.mkdirs();

            String ext = "";
            String originalName = photo.getOriginalFilename();
            if (originalName != null && originalName.contains(".")) {
                ext = originalName.substring(originalName.lastIndexOf("."));
            }
            String filename = UUID.randomUUID().toString() + ext;
            Path filePath = Paths.get(uploadDir, filename);
            Files.write(filePath, photo.getBytes());

            item.setPhotoUrl("/uploads/" + filename);
        }

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