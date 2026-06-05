# MediLoop: Medicine Inventory & Return Management System

## Overview

MediLoop is a full-stack medicine inventory and return management system developed to help pharmacies efficiently manage medicine stock, supplier information, patient sales records, batch tracking, expiry monitoring, and medicine returns. The system aims to reduce inventory losses, improve traceability, and automate return processing through an integrated web application.

---

## Problem Statement

Small pharmacies often face challenges in managing medicine inventory efficiently. Existing solutions may handle billing or stock management but rarely provide complete batch traceability, expiry monitoring, supplier tracking, and return management in a single platform.

Common issues include:

- Difficulty tracking which patient received a specific medicine batch.
- Financial losses due to expired medicines.
- Manual and error-prone return processing.
- Lack of supplier and batch-level visibility.
- Inefficient inventory monitoring.

MediLoop addresses these challenges by integrating inventory management, patient records, batch tracking, expiry alerts, and automated return handling into a unified system.

---

## Key Features

### Medicine Inventory Management
- Add, update, and manage medicine records.
- Monitor stock availability and inventory levels.
- Maintain medicine details and pricing information.

### Supplier & Batch Tracking
- Record supplier information.
- Track medicine batches received from suppliers.
- Store purchase quantity, purchase price, and expiry dates.
- Maintain batch-wise inventory records.

### Patient-Level Batch Traceability
- Link sold medicines to individual patients.
- Track the exact batch provided during each sale.
- Maintain complete sales history.

### Expiry Monitoring
- Track expiry dates for all medicine batches.
- Generate alerts for medicines nearing expiry.
- Help reduce wastage and financial losses.

### Medicine Return Management
- Process medicine returns based on predefined policies.
- Validate return eligibility.
- Update inventory automatically after approved returns.

### Automated Refund Calculation
- Calculate refund or discount amounts based on:
  - Medicine type
  - Quantity returned
  - Return conditions
- Minimize manual calculations and errors.

### Reporting Support
- Track sales history.
- Monitor return records.
- Identify near-expiry stock.
- Analyze supplier performance.

---

## System Architecture

Frontend (React)
        |
        v
Backend (Flask REST API)
        |
        v
MySQL Database

---

## Technologies Used

### Frontend
- React
- HTML
- CSS
- JavaScript

### Backend
- Python
- Flask

### Database
- MySQL

### Development Tools
- Git
- GitHub
- VS Code

---

## Database Design

The application uses a normalized relational database consisting of multiple interconnected tables to ensure data integrity and efficient querying.

Major entities include:

- Medicines
- Suppliers
- Batches
- Patients
- Sales
- Returns
- Inventory
- Transactions

The schema uses primary keys and foreign keys to maintain relationships between entities and support accurate tracking of inventory movement.

---

## Key Design Decisions

### Batch-Level Tracking

Each medicine batch is tracked separately to maintain complete traceability and support expiry monitoring.

### Normalized Database Design

The database is normalized to:
- Reduce redundancy
- Improve consistency
- Maintain referential integrity
- Support future scalability

### Automated Inventory Updates

Stock quantities are automatically updated whenever:
- New inventory is added
- Medicines are sold
- Medicines are returned

---

## Challenges Faced

### Maintaining Batch Traceability

A medicine may exist in multiple batches with different expiry dates. The system was designed to ensure that every sale is linked to the exact batch dispensed.

### Return Processing Logic

Implementing return validation and refund calculations required defining business rules based on medicine type, quantity purchased, and return eligibility.

### Inventory Consistency

The application ensures inventory remains accurate after sales and return transactions by automatically updating stock levels.

---

## Future Enhancements

- Multi-pharmacy support
- Cloud deployment
- Barcode scanning integration
- Email and SMS expiry notifications
- Analytics dashboard
- Role-based authentication
- Batch recall management system

---

## Impact

MediLoop helps pharmacies improve inventory visibility, reduce losses due to expired medicines, automate return processing, and maintain patient-level medicine traceability. By integrating inventory management, supplier tracking, expiry monitoring, and return handling into a single platform, the system improves operational efficiency and supports better decision-making.
