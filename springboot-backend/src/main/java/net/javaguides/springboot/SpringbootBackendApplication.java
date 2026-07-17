package net.javaguides.springboot;

import net.javaguides.springboot.model.User;
import net.javaguides.springboot.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;

@SpringBootApplication
public class SpringbootBackendApplication {

    public static void main(String[] args) {
        SpringApplication.run(SpringbootBackendApplication.class, args);
    }

    @Bean
    public CommandLineRunner seedAdmin(UserRepository userRepository) {
        return args -> {
            if (userRepository.countByRole("ADMIN") == 0) {
                User admin = new User();
                admin.setName("Admin");
                admin.setEmail("manoj@gmail.com");
                admin.setPassword("jam@8910");
                admin.setRole("ADMIN");
                userRepository.save(admin);
            }
        };
    }
}
