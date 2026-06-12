package com.agronomy.agro.controller;

import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.io.ByteArrayOutputStream;
import java.io.IOException;

@RestController
@RequestMapping("/api/admin/templates")
public class TemplateController {

    @GetMapping("/farmers")
    public ResponseEntity<byte[]> downloadFarmerTemplate() throws IOException {
        try (Workbook workbook = new XSSFWorkbook()) {
            Sheet sheet = workbook.createSheet("Farmers");

            // Header style
            CellStyle headerStyle = workbook.createCellStyle();
            Font font = workbook.createFont();
            font.setBold(true);
            headerStyle.setFont(font);
            headerStyle.setFillForegroundColor(IndexedColors.LIGHT_GREEN.getIndex());
            headerStyle.setFillPattern(FillPatternType.SOLID_FOREGROUND);

            // Headers
            String[] headers = {"fullName", "email", "phone", "address", "city", "district", "state", "pincode"};
            Row headerRow = sheet.createRow(0);
            for (int i = 0; i < headers.length; i++) {
                Cell cell = headerRow.createCell(i);
                cell.setCellValue(headers[i]);
                cell.setCellStyle(headerStyle);
                sheet.setColumnWidth(i, 5000);
            }

            // Sample row
            Row sampleRow = sheet.createRow(1);
            sampleRow.createCell(0).setCellValue("Ramesh Kumar");
            sampleRow.createCell(1).setCellValue("ramesh@example.com");
            sampleRow.createCell(2).setCellValue("9876543210");
            sampleRow.createCell(3).setCellValue("Village Madhubani");
            sampleRow.createCell(4).setCellValue("Darbhanga");
            sampleRow.createCell(5).setCellValue("Darbhanga");
            sampleRow.createCell(6).setCellValue("Bihar");
            sampleRow.createCell(7).setCellValue("846004");

            // Instructions sheet
            Sheet instructions = workbook.createSheet("Instructions");
            instructions.createRow(0).createCell(0).setCellValue("FARMER BULK UPLOAD TEMPLATE");
            instructions.createRow(2).createCell(0).setCellValue("Rules:");
            instructions.createRow(3).createCell(0).setCellValue("1. Do NOT modify the headers in the 'Farmers' sheet");
            instructions.createRow(4).createCell(0).setCellValue("2. fullName, email, phone are REQUIRED fields");
            instructions.createRow(5).createCell(0).setCellValue("3. Phone must be 10 digits starting with 6-9");
            instructions.createRow(6).createCell(0).setCellValue("4. Email must be unique — no duplicates allowed");
            instructions.createRow(7).createCell(0).setCellValue("5. Default password for all farmers: Farmer@123");
            instructions.createRow(8).createCell(0).setCellValue("6. Delete the sample row before uploading");
            instructions.setColumnWidth(0, 15000);

            ByteArrayOutputStream out = new ByteArrayOutputStream();
            workbook.write(out);

            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=farmer_upload_template.xlsx")
                    .contentType(MediaType.APPLICATION_OCTET_STREAM)
                    .body(out.toByteArray());
        }
    }

    @GetMapping("/prices")
    public ResponseEntity<byte[]> downloadPriceTemplate() throws IOException {
        try (Workbook workbook = new XSSFWorkbook()) {
            Sheet sheet = workbook.createSheet("Prices");

            // Header style
            CellStyle headerStyle = workbook.createCellStyle();
            Font font = workbook.createFont();
            font.setBold(true);
            headerStyle.setFont(font);
            headerStyle.setFillForegroundColor(IndexedColors.LIGHT_GREEN.getIndex());
            headerStyle.setFillPattern(FillPatternType.SOLID_FOREGROUND);

            // Headers
            String[] headers = {"farmerId", "productId", "pricePerUnit", "quantityAvailable", "location", "district"};
            Row headerRow = sheet.createRow(0);
            for (int i = 0; i < headers.length; i++) {
                Cell cell = headerRow.createCell(i);
                cell.setCellValue(headers[i]);
                cell.setCellStyle(headerStyle);
                sheet.setColumnWidth(i, 5000);
            }

            // Sample row
            Row sampleRow = sheet.createRow(1);
            sampleRow.createCell(0).setCellValue(1);
            sampleRow.createCell(1).setCellValue(1);
            sampleRow.createCell(2).setCellValue(850.00);
            sampleRow.createCell(3).setCellValue(100);
            sampleRow.createCell(4).setCellValue("Darbhanga");
            sampleRow.createCell(5).setCellValue("Darbhanga");

            // Instructions sheet
            Sheet instructions = workbook.createSheet("Instructions");
            instructions.createRow(0).createCell(0).setCellValue("PRICE LISTING BULK UPLOAD TEMPLATE");
            instructions.createRow(2).createCell(0).setCellValue("Rules:");
            instructions.createRow(3).createCell(0).setCellValue("1. Do NOT modify the headers in the 'Prices' sheet");
            instructions.createRow(4).createCell(0).setCellValue("2. farmerId — use the ID from Manage Users page");
            instructions.createRow(5).createCell(0).setCellValue("3. productId — use the ID from Manage Products page");
            instructions.createRow(6).createCell(0).setCellValue("4. pricePerUnit — price in ₹ (must be > 0)");
            instructions.createRow(7).createCell(0).setCellValue("5. quantityAvailable — in the product's unit (kg/quintal)");
            instructions.createRow(8).createCell(0).setCellValue("6. location & district — if left blank, farmer's saved location is used");
            instructions.createRow(9).createCell(0).setCellValue("7. Delete the sample row before uploading");
            instructions.setColumnWidth(0, 15000);

            ByteArrayOutputStream out = new ByteArrayOutputStream();
            workbook.write(out);

            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=price_upload_template.xlsx")
                    .contentType(MediaType.APPLICATION_OCTET_STREAM)
                    .body(out.toByteArray());
        }
    }
}
