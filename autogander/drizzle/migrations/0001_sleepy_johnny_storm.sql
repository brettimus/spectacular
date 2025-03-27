ALTER TABLE `fixes` RENAME TO `fix_events`;--> statement-breakpoint
ALTER TABLE `fix_rules` RENAME TO `rules`;--> statement-breakpoint
ALTER TABLE `fix_events` RENAME COLUMN "original_code" TO "source_code";--> statement-breakpoint
ALTER TABLE `fix_events` RENAME COLUMN "errors" TO "source_compiler_errors";--> statement-breakpoint
ALTER TABLE `rules` RENAME COLUMN "fix_id" TO "fix_event_id";--> statement-breakpoint
DROP INDEX `fixes_session_id_index`;--> statement-breakpoint
DROP INDEX `fixes_type_index`;--> statement-breakpoint
ALTER TABLE `fix_events` ADD `fixed_compiler_errors` text;--> statement-breakpoint
CREATE INDEX `fix_events_session_id_index` ON `fix_events` (`session_id`);--> statement-breakpoint
CREATE INDEX `fix_events_type_index` ON `fix_events` (`type`);--> statement-breakpoint
PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_rules` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`fix_event_id` integer NOT NULL,
	`rule` text NOT NULL,
	`reasoning` text,
	`additional_data` text,
	`created_at` text DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	FOREIGN KEY (`fix_event_id`) REFERENCES `fix_events`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
INSERT INTO `__new_rules`("id", "fix_event_id", "rule", "reasoning", "additional_data", "created_at") SELECT "id", "fix_event_id", "rule", "reasoning", "additional_data", "created_at" FROM `rules`;--> statement-breakpoint
DROP TABLE `rules`;--> statement-breakpoint
ALTER TABLE `__new_rules` RENAME TO `rules`;--> statement-breakpoint
PRAGMA foreign_keys=ON;