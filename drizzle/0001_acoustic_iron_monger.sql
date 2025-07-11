PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_branches` (
	`id` text PRIMARY KEY NOT NULL,
	`project_id` text NOT NULL,
	`name` text NOT NULL,
	`created_at` integer DEFAULT (strftime('%s','now') * 1000) NOT NULL,
	FOREIGN KEY (`project_id`) REFERENCES `projects`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_branches`("id", "project_id", "name", "created_at") SELECT "id", "project_id", "name", "created_at" FROM `branches`;--> statement-breakpoint
DROP TABLE `branches`;--> statement-breakpoint
ALTER TABLE `__new_branches` RENAME TO `branches`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE UNIQUE INDEX `unq_branch_project` ON `branches` (`name`,`project_id`);