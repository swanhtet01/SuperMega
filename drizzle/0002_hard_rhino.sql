CREATE TABLE `alert_rules` (
	`id` varchar(64) NOT NULL,
	`ruleName` varchar(200) NOT NULL,
	`metric` varchar(100) NOT NULL,
	`threshold` int NOT NULL,
	`severity` enum('low','medium','high','critical') NOT NULL,
	`notificationChannels` text,
	`escalationTime` int,
	`enabled` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp DEFAULT (now()),
	CONSTRAINT `alert_rules_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `batch_traceability` (
	`id` varchar(64) NOT NULL,
	`batchId` varchar(64) NOT NULL,
	`materialLotIds` text,
	`equipmentId` varchar(64),
	`operatorId` varchar(64),
	`mixingTemp` int,
	`mixingTime` int,
	`curingTemp` int,
	`curingPressure` int,
	`curingTime` int,
	`createdAt` timestamp DEFAULT (now()),
	CONSTRAINT `batch_traceability_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `cost_of_quality` (
	`id` varchar(64) NOT NULL,
	`date` date NOT NULL,
	`scrapCost` int NOT NULL DEFAULT 0,
	`reworkCost` int NOT NULL DEFAULT 0,
	`warrantyCost` int NOT NULL DEFAULT 0,
	`inspectionCost` int NOT NULL DEFAULT 0,
	`totalCOQ` int NOT NULL DEFAULT 0,
	`defectCount` int NOT NULL DEFAULT 0,
	`productionVolume` int NOT NULL DEFAULT 0,
	`notes` text,
	`createdAt` timestamp DEFAULT (now()),
	CONSTRAINT `cost_of_quality_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `defects` (
	`id` varchar(64) NOT NULL,
	`inspectionId` varchar(64) NOT NULL,
	`type` enum('visual','dimensional','structural','material') NOT NULL,
	`category` varchar(100) NOT NULL,
	`severity` enum('minor','major','critical') NOT NULL,
	`description` text NOT NULL,
	`photoUrl` text,
	`rootCause` text,
	`correctiveAction` text,
	`createdAt` timestamp DEFAULT (now()),
	CONSTRAINT `defects_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `equipment` (
	`id` varchar(64) NOT NULL,
	`equipmentCode` varchar(50) NOT NULL,
	`name` varchar(200) NOT NULL,
	`type` enum('mixer','building_machine','curing_press','testing_equipment') NOT NULL,
	`productionLine` varchar(50),
	`lastMaintenanceDate` timestamp,
	`nextMaintenanceDate` timestamp,
	`calibrationDate` timestamp,
	`status` enum('operational','maintenance','down') NOT NULL DEFAULT 'operational',
	`createdAt` timestamp DEFAULT (now()),
	CONSTRAINT `equipment_id` PRIMARY KEY(`id`),
	CONSTRAINT `equipment_equipmentCode_unique` UNIQUE(`equipmentCode`)
);
--> statement-breakpoint
CREATE TABLE `material_lots` (
	`id` varchar(64) NOT NULL,
	`lotNumber` varchar(100) NOT NULL,
	`materialType` varchar(100) NOT NULL,
	`supplier` varchar(200) NOT NULL,
	`receiptDate` timestamp NOT NULL,
	`expiryDate` timestamp,
	`qualityCert` text,
	`quantity` int NOT NULL,
	`unit` varchar(20) NOT NULL,
	`status` enum('available','in_use','depleted','quarantine') NOT NULL DEFAULT 'available',
	`createdAt` timestamp DEFAULT (now()),
	CONSTRAINT `material_lots_id` PRIMARY KEY(`id`),
	CONSTRAINT `material_lots_lotNumber_unique` UNIQUE(`lotNumber`)
);
--> statement-breakpoint
CREATE TABLE `operators` (
	`id` varchar(64) NOT NULL,
	`employeeId` varchar(50) NOT NULL,
	`name` varchar(200) NOT NULL,
	`shift` enum('day','night','rotating') NOT NULL,
	`trainingRecords` text,
	`certifications` text,
	`performanceScore` int,
	`status` enum('active','inactive','on_leave') NOT NULL DEFAULT 'active',
	`createdAt` timestamp DEFAULT (now()),
	CONSTRAINT `operators_id` PRIMARY KEY(`id`),
	CONSTRAINT `operators_employeeId_unique` UNIQUE(`employeeId`)
);
--> statement-breakpoint
CREATE TABLE `production_batches` (
	`id` varchar(64) NOT NULL,
	`batchNumber` varchar(100) NOT NULL,
	`productType` varchar(100) NOT NULL,
	`tireSize` varchar(50) NOT NULL,
	`quantity` int NOT NULL,
	`startTime` timestamp NOT NULL,
	`endTime` timestamp,
	`productionLine` varchar(50) NOT NULL,
	`shift` enum('day','night') NOT NULL,
	`status` enum('in_progress','completed','failed','rework') NOT NULL DEFAULT 'in_progress',
	`createdAt` timestamp DEFAULT (now()),
	CONSTRAINT `production_batches_id` PRIMARY KEY(`id`),
	CONSTRAINT `production_batches_batchNumber_unique` UNIQUE(`batchNumber`)
);
--> statement-breakpoint
CREATE TABLE `quality_alerts` (
	`id` varchar(64) NOT NULL,
	`alertType` varchar(100) NOT NULL,
	`severity` enum('low','medium','high','critical') NOT NULL,
	`message` text NOT NULL,
	`threshold` int,
	`currentValue` int,
	`triggeredAt` timestamp NOT NULL DEFAULT (now()),
	`acknowledgedBy` varchar(64),
	`acknowledgedAt` timestamp,
	`resolvedAt` timestamp,
	`status` enum('active','acknowledged','resolved') NOT NULL DEFAULT 'active',
	CONSTRAINT `quality_alerts_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `quality_inspections` (
	`id` varchar(64) NOT NULL,
	`batchId` varchar(64) NOT NULL,
	`stage` enum('mixing','building','curing','final') NOT NULL,
	`inspectorId` varchar(64) NOT NULL,
	`timestamp` timestamp NOT NULL DEFAULT (now()),
	`result` enum('pass','fail','rework') NOT NULL,
	`notes` text,
	`supervisorId` varchar(64),
	`approvedAt` timestamp,
	`status` enum('pending','approved','rejected') NOT NULL DEFAULT 'pending',
	CONSTRAINT `quality_inspections_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE INDEX `alert_rule_metric_idx` ON `alert_rules` (`metric`);--> statement-breakpoint
CREATE INDEX `alert_rule_enabled_idx` ON `alert_rules` (`enabled`);--> statement-breakpoint
CREATE INDEX `traceability_batch_idx` ON `batch_traceability` (`batchId`);--> statement-breakpoint
CREATE INDEX `coq_date_idx` ON `cost_of_quality` (`date`);--> statement-breakpoint
CREATE INDEX `defect_inspection_idx` ON `defects` (`inspectionId`);--> statement-breakpoint
CREATE INDEX `defect_type_idx` ON `defects` (`type`);--> statement-breakpoint
CREATE INDEX `equipment_code_idx` ON `equipment` (`equipmentCode`);--> statement-breakpoint
CREATE INDEX `equipment_status_idx` ON `equipment` (`status`);--> statement-breakpoint
CREATE INDEX `lot_number_idx` ON `material_lots` (`lotNumber`);--> statement-breakpoint
CREATE INDEX `lot_status_idx` ON `material_lots` (`status`);--> statement-breakpoint
CREATE INDEX `operator_employee_idx` ON `operators` (`employeeId`);--> statement-breakpoint
CREATE INDEX `operator_status_idx` ON `operators` (`status`);--> statement-breakpoint
CREATE INDEX `batch_number_idx` ON `production_batches` (`batchNumber`);--> statement-breakpoint
CREATE INDEX `batch_status_idx` ON `production_batches` (`status`);--> statement-breakpoint
CREATE INDEX `quality_alert_status_idx` ON `quality_alerts` (`status`);--> statement-breakpoint
CREATE INDEX `quality_alert_severity_idx` ON `quality_alerts` (`severity`);--> statement-breakpoint
CREATE INDEX `inspection_batch_idx` ON `quality_inspections` (`batchId`);--> statement-breakpoint
CREATE INDEX `inspection_stage_idx` ON `quality_inspections` (`stage`);--> statement-breakpoint
CREATE INDEX `inspection_status_idx` ON `quality_inspections` (`status`);