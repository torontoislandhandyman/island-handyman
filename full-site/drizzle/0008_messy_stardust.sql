CREATE TABLE `auth_sessions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`tokenHash` varchar(64) NOT NULL,
	`expiresAt` timestamp NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `auth_sessions_id` PRIMARY KEY(`id`),
	CONSTRAINT `auth_sessions_tokenHash_unique` UNIQUE(`tokenHash`)
);
--> statement-breakpoint
CREATE TABLE `auth_setup_tokens` (
	`id` int AUTO_INCREMENT NOT NULL,
	`email` varchar(320) NOT NULL,
	`tokenHash` varchar(64) NOT NULL,
	`expiresAt` timestamp NOT NULL,
	`consumedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `auth_setup_tokens_id` PRIMARY KEY(`id`),
	CONSTRAINT `auth_setup_tokens_tokenHash_unique` UNIQUE(`tokenHash`)
);
--> statement-breakpoint
ALTER TABLE `users` ADD `passwordHash` varchar(255);--> statement-breakpoint
ALTER TABLE `users` ADD CONSTRAINT `users_email_unique` UNIQUE(`email`);--> statement-breakpoint
CREATE INDEX `auth_sessions_user_id_idx` ON `auth_sessions` (`userId`);--> statement-breakpoint
CREATE INDEX `auth_sessions_expires_at_idx` ON `auth_sessions` (`expiresAt`);--> statement-breakpoint
CREATE INDEX `auth_setup_tokens_email_idx` ON `auth_setup_tokens` (`email`);--> statement-breakpoint
CREATE INDEX `auth_setup_tokens_expires_at_idx` ON `auth_setup_tokens` (`expiresAt`);