CREATE TABLE `testimonials` (
	`id` int AUTO_INCREMENT NOT NULL,
	`jobRequestId` int NOT NULL,
	`customerName` varchar(160) NOT NULL,
	`body` text NOT NULL,
	`beforeImageUrl` varchar(1000),
	`afterImageUrl` varchar(1000),
	`customerWantsPublic` int NOT NULL DEFAULT 0,
	`ownerApproved` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `testimonials_id` PRIMARY KEY(`id`)
);
