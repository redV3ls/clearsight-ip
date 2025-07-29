CREATE TABLE `gdpr_deletion_requests` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`confirmation_token` text NOT NULL,
	`status` text DEFAULT 'pending' NOT NULL,
	`scheduled_for` text NOT NULL,
	`completed_at` text,
	`grace_period_hours` integer DEFAULT 72 NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `gdpr_deletion_requests_confirmation_token_unique` ON `gdpr_deletion_requests` (`confirmation_token`);