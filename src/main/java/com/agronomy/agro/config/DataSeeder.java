package com.agronomy.agro.config;

import com.agronomy.agro.entity.Product;
import com.agronomy.agro.entity.Role;
import com.agronomy.agro.entity.User;
import com.agronomy.agro.repository.ProductRepository;
import com.agronomy.agro.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final ProductRepository productRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        seedUsers();
        seedProducts();
        log.info("=== Dev data seeded successfully ===");
    }

    private void seedUsers() {
        if (userRepository.count() > 0) return;

        userRepository.saveAll(List.of(
                User.builder()
                        .fullName("Admin User")
                        .email("admin@agrotrade.com")
                        .password(passwordEncoder.encode("Admin@123"))
                        .phone("9999999999")
                        .role(Role.ADMIN)
                        .city("Delhi")
                        .state("Delhi")
                        .build(),
                User.builder()
                        .fullName("Ramesh Kumar")
                        .email("farmer@agrotrade.com")
                        .password(passwordEncoder.encode("Farmer@123"))
                        .phone("9876543210")
                        .role(Role.FARMER)
                        .city("Darbhanga")
                        .district("Darbhanga")
                        .state("Bihar")
                        .address("Village Madhubani, Near Makhana Fields")
                        .pincode("846004")
                        .build(),
                User.builder()
                        .fullName("Suresh Trader")
                        .email("buyer@agrotrade.com")
                        .password(passwordEncoder.encode("Buyer@123"))
                        .phone("9123456789")
                        .role(Role.BUYER)
                        .city("Chennai")
                        .state("Tamil Nadu")
                        .address("123 Anna Nagar, Chennai")
                        .pincode("600040")
                        .build()
        ));
        log.info("Users seeded: admin, farmer, buyer");
    }

    private void seedProducts() {
        if (productRepository.count() > 0) return;

        productRepository.saveAll(List.of(
                Product.builder()
                        .name("Makhana (Fox Nut) - Grade A")
                        .category("Makhana")
                        .grade("A")
                        .description("Premium quality makhana, large size, white color, crispy texture. Best for roasting and snacks.")
                        .unit("kg")
                        .build(),
                Product.builder()
                        .name("Makhana (Fox Nut) - Grade B")
                        .category("Makhana")
                        .grade("B")
                        .description("Standard quality makhana, medium size. Good for cooking and making desserts.")
                        .unit("kg")
                        .build(),
                Product.builder()
                        .name("Makhana (Fox Nut) - Grade C")
                        .category("Makhana")
                        .grade("C")
                        .description("Economy grade makhana, mixed sizes. Suitable for bulk manufacturing and processing.")
                        .unit("kg")
                        .build(),
                Product.builder()
                        .name("Makhana Seeds (Raw)")
                        .category("Makhana")
                        .grade("Raw")
                        .description("Raw unprocessed makhana seeds for industrial processing.")
                        .unit("quintal")
                        .build(),
                Product.builder()
                        .name("Makhana - Organic Certified")
                        .category("Makhana")
                        .grade("Premium")
                        .description("FSSAI certified organic makhana. No pesticides, naturally grown in Bihar wetlands.")
                        .unit("kg")
                        .build()
        ));
        log.info("Products seeded: 5 makhana varieties");
    }
}
