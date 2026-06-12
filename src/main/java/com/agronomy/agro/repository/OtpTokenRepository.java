package com.agronomy.agro.repository;

import com.agronomy.agro.entity.OtpToken;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface OtpTokenRepository extends JpaRepository<OtpToken, Long> {
    Optional<OtpToken> findTopByPhoneAndUsedFalseOrderByCreatedAtDesc(String phone);
    void deleteByPhone(String phone);
}
