package net.javaguides.springboot.repository;

import net.javaguides.springboot.model.Request;
import org.springframework.data.jpa.repository.JpaRepository;

public interface RequestRepository extends JpaRepository<Request, Long> {
}
