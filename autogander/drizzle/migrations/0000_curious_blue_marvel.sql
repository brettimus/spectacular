CREATE TABLE `fix_rules` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`fix_id` integer NOT NULL,
	`rule` text NOT NULL,
	`additional_data` text,
	`created_at` text DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	FOREIGN KEY (`fix_id`) REFERENCES `fixes`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `fixes` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`session_id` text NOT NULL,
	`type` text NOT NULL,
	`original_code` text NOT NULL,
	`errors` text NOT NULL,
	`analysis` text NOT NULL,
	`fix` text NOT NULL,
	`created_at` text DEFAULT (CURRENT_TIMESTAMP) NOT NULL
);
--> statement-breakpoint
CREATE INDEX `fixes_session_id_index` ON `fixes` (`session_id`);--> statement-breakpoint
CREATE INDEX `fixes_type_index` ON `fixes` (`type`);