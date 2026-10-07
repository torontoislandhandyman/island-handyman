ALTER TABLE `availability_slots` MODIFY COLUMN `status` enum('available','tentative','booked','closed','off_island') NOT NULL DEFAULT 'available';--> statement-breakpoint
ALTER TABLE `availability_slots` ADD `publicNote` varchar(240);--> statement-breakpoint
ALTER TABLE `business_settings` ADD `publicMessage` varchar(240) DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE `business_settings` ADD `contactEmail` varchar(320);--> statement-breakpoint
ALTER TABLE `business_settings` ADD `contactPhone` varchar(60);