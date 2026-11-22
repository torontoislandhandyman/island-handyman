CREATE TABLE `availability_slots` (
	`id` int AUTO_INCREMENT NOT NULL,
	`slotDate` varchar(10) NOT NULL,
	`startTime` varchar(20) NOT NULL,
	`endTime` varchar(20) NOT NULL,
	`status` enum('available','tentative','booked','closed') NOT NULL DEFAULT 'available',
	`isPublic` int NOT NULL DEFAULT 1,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `availability_slots_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `business_settings` (
	`id` int NOT NULL,
	`onlineStatus` enum('online','offline','busy') NOT NULL DEFAULT 'online',
	`jobAvailability` enum('accepting','limited','fully_booked','not_working') NOT NULL DEFAULT 'accepting',
	`onlineLabel` varchar(120) NOT NULL DEFAULT 'Checking messages',
	`nextAvailableLabel` varchar(120) NOT NULL DEFAULT '3:00 PM',
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `business_settings_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `job_requests` (
	`id` int AUTO_INCREMENT NOT NULL,
	`customerName` varchar(160) NOT NULL,
	`email` varchar(320) NOT NULL,
	`phone` varchar(60),
	`location` varchar(200) NOT NULL,
	`service` varchar(160) NOT NULL,
	`description` text NOT NULL,
	`preferredDate` varchar(20),
	`preferredTime` varchar(80),
	`urgency` enum('routine','soon','urgent') NOT NULL DEFAULT 'routine',
	`status` enum('new','reviewing','need_more_information','quoted','scheduled','in_progress','completed','declined','cancelled') NOT NULL DEFAULT 'new',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `job_requests_id` PRIMARY KEY(`id`)
);
