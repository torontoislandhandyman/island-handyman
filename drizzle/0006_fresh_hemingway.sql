CREATE TABLE `notifications` (
	`id` int AUTO_INCREMENT NOT NULL,
	`recipientUserId` int,
	`recipientEmail` varchar(320),
	`recipientRole` enum('owner','customer') NOT NULL,
	`kind` varchar(80) NOT NULL,
	`title` varchar(180) NOT NULL,
	`body` text NOT NULL,
	`projectId` int,
	`requestId` int,
	`readAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `notifications_id` PRIMARY KEY(`id`)
);
