package com.agronomy.agro.service;

import com.agronomy.agro.dto.BulkUploadResponse;
import com.agronomy.agro.entity.*;
import com.agronomy.agro.repository.PriceEntryRepository;
import com.agronomy.agro.repository.ProductRepository;
import com.agronomy.agro.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class BulkUploadService {

    private final UserRepository userRepository;
    private final ProductRepository productRepository;
    private final PriceEntryRepository priceEntryRepository;
    private final PasswordEncoder passwordEncoder;

    /**
     * Bulk upload farmers from Excel.
     * Expected columns: fullName, email, phone, address, city, district, state, pincode
     */
    @Transactional
    public BulkUploadResponse bulkUploadFarmers(MultipartFile file) {
        List<String> errors = new ArrayList<>();
        int success = 0;
        int totalRows = 0;

        try (Workbook workbook = new XSSFWorkbook(file.getInputStream())) {
            Sheet sheet = workbook.getSheetAt(0);

            for (int i = 1; i <= sheet.getLastRowNum(); i++) { // skip header row
                Row row = sheet.getRow(i);
                if (row == null) continue;
                totalRows++;

                try {
                    String fullName = getCellString(row, 0);
                    String email = getCellString(row, 1);
                    String phone = getCellString(row, 2);
                    String address = getCellString(row, 3);
                    String city = getCellString(row, 4);
                    String district = getCellString(row, 5);
                    String state = getCellString(row, 6);
                    String pincode = getCellString(row, 7);

                    // Validate required fields
                    if (fullName.isBlank() || email.isBlank() || phone.isBlank()) {
                        errors.add("Row " + (i + 1) + ": fullName, email, phone are required");
                        continue;
                    }

                    // Check duplicates
                    if (userRepository.existsByEmail(email.toLowerCase().trim())) {
                        errors.add("Row " + (i + 1) + ": Email already exists - " + email);
                        continue;
                    }
                    if (userRepository.existsByPhone(phone.trim())) {
                        errors.add("Row " + (i + 1) + ": Phone already exists - " + phone);
                        continue;
                    }
                    // Validate phone format
                    if (!phone.trim().matches("^[6-9]\\d{9}$")) {
                        errors.add("Row " + (i + 1) + ": Invalid phone number format - " + phone);
                        continue;
                    }

                    User farmer = User.builder()
                            .fullName(fullName.trim())
                            .email(email.toLowerCase().trim())
                            .password(passwordEncoder.encode("Farmer@123")) // default password
                            .phone(phone.trim())
                            .role(Role.FARMER)
                            .address(address.trim())
                            .city(city.trim())
                            .district(district.trim())
                            .state(state.trim())
                            .pincode(pincode.trim())
                            .build();

                    userRepository.save(farmer);
                    success++;
                } catch (Exception e) {
                    errors.add("Row " + (i + 1) + ": " + e.getMessage());
                }
            }
        } catch (Exception e) {
            errors.add("File parsing error: " + e.getMessage());
        }

        log.info("Bulk farmer upload: total={}, success={}, failed={}", totalRows, success, errors.size());
        return BulkUploadResponse.builder()
                .totalRows(totalRows)
                .successCount(success)
                .failedCount(errors.size())
                .errors(errors)
                .build();
    }

    /**
     * Bulk upload price listings from Excel.
     * Expected columns: farmerId, productId, pricePerUnit, quantityAvailable, location, district
     */
    @Transactional
    public BulkUploadResponse bulkUploadPrices(MultipartFile file) {
        List<String> errors = new ArrayList<>();
        int success = 0;
        int totalRows = 0;

        try (Workbook workbook = new XSSFWorkbook(file.getInputStream())) {
            Sheet sheet = workbook.getSheetAt(0);

            for (int i = 1; i <= sheet.getLastRowNum(); i++) { // skip header row
                Row row = sheet.getRow(i);
                if (row == null) continue;
                totalRows++;

                try {
                    long farmerId = (long) getCellNumeric(row, 0);
                    long productId = (long) getCellNumeric(row, 1);
                    BigDecimal price = BigDecimal.valueOf(getCellNumeric(row, 2));
                    BigDecimal quantity = BigDecimal.valueOf(getCellNumeric(row, 3));
                    String location = getCellString(row, 4);
                    String district = getCellString(row, 5);

                    // Validate farmer
                    User farmer = userRepository.findById(farmerId).orElse(null);
                    if (farmer == null || farmer.getRole() != Role.FARMER) {
                        errors.add("Row " + (i + 1) + ": Farmer not found with id " + farmerId);
                        continue;
                    }

                    // Validate product
                    Product product = productRepository.findById(productId).orElse(null);
                    if (product == null || !product.getActive()) {
                        errors.add("Row " + (i + 1) + ": Product not found with id " + productId);
                        continue;
                    }

                    if (price.compareTo(BigDecimal.ZERO) <= 0) {
                        errors.add("Row " + (i + 1) + ": Price must be greater than 0");
                        continue;
                    }
                    if (quantity.compareTo(BigDecimal.ZERO) <= 0) {
                        errors.add("Row " + (i + 1) + ": Quantity must be greater than 0");
                        continue;
                    }

                    // Check if farmer already has a listing for this product
                    if (priceEntryRepository.findFirstByFarmerIdAndProductId(farmerId, productId).isPresent()) {
                        errors.add("Row " + (i + 1) + ": Farmer " + farmer.getFullName() + " already has a listing for " + product.getName());
                        continue;
                    }

                    PriceEntry entry = PriceEntry.builder()
                            .farmer(farmer)
                            .product(product)
                            .pricePerUnit(price)
                            .quantityAvailable(quantity)
                            .location(location.isBlank() ? farmer.getCity() : location.trim())
                            .district(district.isBlank() ? farmer.getDistrict() : district.trim())
                            .build();

                    priceEntryRepository.save(entry);
                    success++;
                } catch (Exception e) {
                    errors.add("Row " + (i + 1) + ": " + e.getMessage());
                }
            }
        } catch (Exception e) {
            errors.add("File parsing error: " + e.getMessage());
        }

        log.info("Bulk price upload: total={}, success={}, failed={}", totalRows, success, errors.size());
        return BulkUploadResponse.builder()
                .totalRows(totalRows)
                .successCount(success)
                .failedCount(errors.size())
                .errors(errors)
                .build();
    }

    private String getCellString(Row row, int col) {
        Cell cell = row.getCell(col);
        if (cell == null) return "";
        if (cell.getCellType() == CellType.NUMERIC) {
            return String.valueOf((long) cell.getNumericCellValue());
        }
        return cell.getStringCellValue().trim();
    }

    private double getCellNumeric(Row row, int col) {
        Cell cell = row.getCell(col);
        if (cell == null) return 0;
        if (cell.getCellType() == CellType.STRING) {
            return Double.parseDouble(cell.getStringCellValue().trim());
        }
        return cell.getNumericCellValue();
    }
}
