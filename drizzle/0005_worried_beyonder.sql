CREATE TABLE `customers` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(160) NOT NULL,
	`email` varchar(320),
	`phone` varchar(60),
	`notes` text,
	`accountEmail` varchar(320),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `customers_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `project_events` (
	`id` int AUTO_INCREMENT NOT NULL,
	`customerId` int NOT NULL,
	`projectId` int NOT NULL,
	`eventType` varchar(80) NOT NULL,
	`note` text NOT NULL,
	`createdByUserId` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `project_events_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `project_files` (
	`id` int AUTO_INCREMENT NOT NULL,
	`customerId` int NOT NULL,
	`projectId` int NOT NULL,
	`uploadedByType` enum('customer','owner') NOT NULL,
	`uploadedByUserId` int,
	`storageKey` varchar(1000) NOT NULL,
	`originalName` varchar(255) NOT NULL,
	`mimeType` varchar(120) NOT NULL,
	`fileSize` int NOT NULL,
	`category` enum('before','during','after','document','other') NOT NULL DEFAULT 'other',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `project_files_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `projects` (
	`id` int AUTO_INCREMENT NOT NULL,
	`customerId` int NOT NULL,
	`title` varchar(200) NOT NULL,
	`location` varchar(220),
	`description` text,
	`status` enum('new','reviewing','need_more_information','quoted','scheduled','in_progress','completed','declined','cancelled','paused','archived') NOT NULL DEFAULT 'new',
	`startedAt` timestamp,
	`completedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `projects_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `job_requests` ADD `customerId` int;--> statement-breakpoint
ALTER TABLE `job_requests` ADD `projectId` int;--> statement-breakpoint
ALTER TABLE `messages` ADD `projectId` int;