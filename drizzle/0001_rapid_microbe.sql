CREATE TABLE `dealers` (
	`id` varchar(64) NOT NULL,
	`dealerCode` varchar(50) NOT NULL,
	`dealerName` varchar(200) NOT NULL,
	`contactPerson` varchar(100),
	`phone` varchar(50),
	`email` varchar(320),
	`address` text,
	`city` varchar(100),
	`region` varchar(100),
	`dealerType` varchar(50),
	`creditLimit` int,
	`outstandingBalance` int,
	`status` enum('active','inactive','suspended') NOT NULL DEFAULT 'active',
	`createdAt` timestamp DEFAULT (now()),
	`updatedAt` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `dealers_id` PRIMARY KEY(`id`),
	CONSTRAINT `dealers_dealerCode_unique` UNIQUE(`dealerCode`)
);
--> statement-breakpoint
CREATE TABLE `financial_transactions` (
	`id` varchar(64) NOT NULL,
	`transactionDate` date NOT NULL,
	`transactionType` enum('revenue','expense','asset','liability') NOT NULL,
	`category` varchar(100) NOT NULL,
	`description` text,
	`amount` int NOT NULL,
	`referenceNumber` varchar(100),
	`dealerId` varchar(64),
	`createdAt` timestamp DEFAULT (now()),
	CONSTRAINT `financial_transactions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `finished_goods` (
	`id` varchar(64) NOT NULL,
	`tireSize` varchar(50) NOT NULL,
	`tireType` varchar(50) NOT NULL,
	`currentStock` int NOT NULL,
	`minimumStock` int NOT NULL,
	`unitPrice` int NOT NULL,
	`createdAt` timestamp DEFAULT (now()),
	`updatedAt` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `finished_goods_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `production_records` (
	`id` varchar(64) NOT NULL,
	`productionDate` date NOT NULL,
	`tireSize` varchar(50) NOT NULL,
	`tireType` varchar(50) NOT NULL,
	`quantityProduced` int NOT NULL,
	`quantityApproved` int NOT NULL,
	`quantityRejected` int NOT NULL,
	`shift` varchar(20),
	`batchNumber` varchar(100),
	`notes` text,
	`createdAt` timestamp DEFAULT (now()),
	`updatedAt` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `production_records_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `production_targets` (
	`id` varchar(64) NOT NULL,
	`targetMonth` varchar(7) NOT NULL,
	`tireSize` varchar(50) NOT NULL,
	`targetQuantity` int NOT NULL,
	`createdAt` timestamp DEFAULT (now()),
	`updatedAt` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `production_targets_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `quality_control_records` (
	`id` varchar(64) NOT NULL,
	`productionRecordId` varchar(64),
	`inspectionDate` date NOT NULL,
	`inspectorName` varchar(100),
	`defectType` varchar(100),
	`defectCount` int NOT NULL,
	`passed` boolean NOT NULL,
	`notes` text,
	`createdAt` timestamp DEFAULT (now()),
	CONSTRAINT `quality_control_records_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `raw_materials` (
	`id` varchar(64) NOT NULL,
	`materialName` varchar(200) NOT NULL,
	`materialCategory` varchar(100) NOT NULL,
	`unit` varchar(20) NOT NULL,
	`currentStock` int NOT NULL,
	`minimumStock` int NOT NULL,
	`unitCost` int NOT NULL,
	`supplier` varchar(200),
	`lastRestockDate` date,
	`createdAt` timestamp DEFAULT (now()),
	`updatedAt` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `raw_materials_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `sales_order_items` (
	`id` varchar(64) NOT NULL,
	`orderId` varchar(64) NOT NULL,
	`tireSize` varchar(50) NOT NULL,
	`tireType` varchar(50) NOT NULL,
	`quantity` int NOT NULL,
	`unitPrice` int NOT NULL,
	`totalPrice` int NOT NULL,
	`createdAt` timestamp DEFAULT (now()),
	CONSTRAINT `sales_order_items_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `sales_orders` (
	`id` varchar(64) NOT NULL,
	`orderNumber` varchar(100) NOT NULL,
	`dealerId` varchar(64) NOT NULL,
	`orderDate` date NOT NULL,
	`deliveryDate` date,
	`totalAmount` int NOT NULL,
	`paidAmount` int NOT NULL,
	`status` enum('pending','confirmed','shipped','delivered','cancelled') NOT NULL DEFAULT 'pending',
	`paymentStatus` enum('unpaid','partial','paid') NOT NULL DEFAULT 'unpaid',
	`notes` text,
	`createdAt` timestamp DEFAULT (now()),
	`updatedAt` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `sales_orders_id` PRIMARY KEY(`id`),
	CONSTRAINT `sales_orders_orderNumber_unique` UNIQUE(`orderNumber`)
);
--> statement-breakpoint
CREATE TABLE `system_alerts` (
	`id` varchar(64) NOT NULL,
	`alertType` enum('low_stock','quality_issue','production_delay','payment_overdue') NOT NULL,
	`severity` enum('low','medium','high','critical') NOT NULL,
	`title` varchar(200) NOT NULL,
	`message` text NOT NULL,
	`resolved` boolean NOT NULL DEFAULT false,
	`resolvedAt` timestamp,
	`createdAt` timestamp DEFAULT (now()),
	CONSTRAINT `system_alerts_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `users` MODIFY COLUMN `role` enum('admin','manager','viewer') NOT NULL DEFAULT 'viewer';--> statement-breakpoint
CREATE INDEX `dealer_city_idx` ON `dealers` (`city`);--> statement-breakpoint
CREATE INDEX `dealer_status_idx` ON `dealers` (`status`);--> statement-breakpoint
CREATE INDEX `transaction_date_idx` ON `financial_transactions` (`transactionDate`);--> statement-breakpoint
CREATE INDEX `transaction_type_idx` ON `financial_transactions` (`transactionType`);--> statement-breakpoint
CREATE INDEX `transaction_category_idx` ON `financial_transactions` (`category`);--> statement-breakpoint
CREATE INDEX `finished_tire_size_idx` ON `finished_goods` (`tireSize`);--> statement-breakpoint
CREATE INDEX `production_date_idx` ON `production_records` (`productionDate`);--> statement-breakpoint
CREATE INDEX `tire_size_idx` ON `production_records` (`tireSize`);--> statement-breakpoint
CREATE INDEX `target_month_idx` ON `production_targets` (`targetMonth`);--> statement-breakpoint
CREATE INDEX `inspection_date_idx` ON `quality_control_records` (`inspectionDate`);--> statement-breakpoint
CREATE INDEX `material_category_idx` ON `raw_materials` (`materialCategory`);--> statement-breakpoint
CREATE INDEX `item_order_idx` ON `sales_order_items` (`orderId`);--> statement-breakpoint
CREATE INDEX `order_dealer_idx` ON `sales_orders` (`dealerId`);--> statement-breakpoint
CREATE INDEX `order_date_idx` ON `sales_orders` (`orderDate`);--> statement-breakpoint
CREATE INDEX `order_status_idx` ON `sales_orders` (`status`);--> statement-breakpoint
CREATE INDEX `alert_type_idx` ON `system_alerts` (`alertType`);--> statement-breakpoint
CREATE INDEX `alert_resolved_idx` ON `system_alerts` (`resolved`);