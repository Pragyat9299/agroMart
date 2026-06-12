package com.agronomy.agro.repository;

import com.agronomy.agro.entity.UserUpdateHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface UserUpdateHistoryRepository extends JpaRepository<UserUpdateHistory, Long> {
    List<UserUpdateHistory> findByUserIdOrderByCreatedAtDesc(Long userId);
}
