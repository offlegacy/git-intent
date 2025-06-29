CREATE TABLE `intents` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`message` text NOT NULL,
	`status` text NOT NULL,
	`created_at` integer DEFAULT '"2025-06-29T07:16:37.015Z"' NOT NULL
);
