CREATE TABLE `api_keys` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`name` text NOT NULL,
	`description` text,
	`permissions` text NOT NULL,
	`expires_at` text,
	`last_used` text,
	`is_active` integer DEFAULT 1 NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `emerging_skills` (
	`id` text PRIMARY KEY NOT NULL,
	`skill_name` text NOT NULL,
	`category` text NOT NULL,
	`emergence_score` real NOT NULL,
	`growth_velocity` real NOT NULL,
	`first_detected` text NOT NULL,
	`related_skills` text,
	`industries` text,
	`predicted_peak_demand` text,
	`confidence` real NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP
);
--> statement-breakpoint
CREATE TABLE `market_forecasts` (
	`id` text PRIMARY KEY NOT NULL,
	`skill_name` text NOT NULL,
	`industry` text,
	`region` text,
	`forecast_type` text NOT NULL,
	`current_value` real NOT NULL,
	`forecast_3_months` real,
	`forecast_6_months` real,
	`forecast_1_year` real,
	`forecast_2_years` real,
	`confidence` real NOT NULL,
	`methodology` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP
);
--> statement-breakpoint
CREATE TABLE `password_reset_tokens` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`token_hash` text NOT NULL,
	`expires_at` text NOT NULL,
	`used_at` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `password_reset_tokens_token_hash_unique` ON `password_reset_tokens` (`token_hash`);--> statement-breakpoint
CREATE TABLE `regional_skill_trends` (
	`id` text PRIMARY KEY NOT NULL,
	`region` text NOT NULL,
	`country` text,
	`city` text,
	`skill_name` text NOT NULL,
	`demand_score` real NOT NULL,
	`supply_score` real NOT NULL,
	`gap_score` real NOT NULL,
	`avg_salary` integer,
	`salary_growth` real,
	`job_growth` real,
	`analysis_date` text DEFAULT CURRENT_TIMESTAMP
);
--> statement-breakpoint
CREATE TABLE `resume_analyses` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`analysis_data` text NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `skill_demand_history` (
	`id` text PRIMARY KEY NOT NULL,
	`skill_name` text NOT NULL,
	`industry` text,
	`region` text,
	`demand_score` real NOT NULL,
	`job_count` integer NOT NULL,
	`avg_salary` integer,
	`data_source` text,
	`recorded_at` text DEFAULT CURRENT_TIMESTAMP
);
--> statement-breakpoint
CREATE TABLE `team_analyses` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`project_name` text NOT NULL,
	`team_size` integer NOT NULL,
	`overall_match` real NOT NULL,
	`critical_gaps_count` integer NOT NULL,
	`analysis_data` text NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_users` (
	`id` text PRIMARY KEY NOT NULL,
	`email` text NOT NULL,
	`password_hash` text NOT NULL,
	`name` text NOT NULL,
	`organization` text,
	`role` text DEFAULT 'user' NOT NULL,
	`last_login` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP
);
--> statement-breakpoint
INSERT INTO `__new_users`("id", "email", "password_hash", "name", "organization", "role", "last_login", "created_at", "updated_at") SELECT "id", "email", "password_hash", "name", "organization", "role", "last_login", "created_at", "updated_at" FROM `users`;--> statement-breakpoint
DROP TABLE `users`;--> statement-breakpoint
ALTER TABLE `__new_users` RENAME TO `users`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE UNIQUE INDEX `users_email_unique` ON `users` (`email`);