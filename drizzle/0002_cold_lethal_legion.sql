CREATE TABLE `messages` (
	`id` int AUTO_INCREMENT NOT NULL,
	`jobRequestId` int NOT NULL,
	`senderType` enum('customer','owner') NOT NULL,
	`senderUserId` int,
	`body` text NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`readAt` timestamp,
	CONSTRAINT `messages_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `job_requests` MODIFY COLUMN `email` varchar(320);--> statement-breakpoint
ALTER TABLE `job_requests` ADD `customerAccess` enum('pending','approved','declined') DEFAULT 'pending' NOT NULL;