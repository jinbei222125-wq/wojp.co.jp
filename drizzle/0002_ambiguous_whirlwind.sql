ALTER TABLE `news` MODIFY COLUMN `publishedAt` timestamp;--> statement-breakpoint
ALTER TABLE `job_positions` ADD `slug` varchar(255) NOT NULL;--> statement-breakpoint
ALTER TABLE `job_positions` ADD `employmentType` varchar(100);--> statement-breakpoint
ALTER TABLE `job_positions` ADD `isPublished` int DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `news` ADD `slug` varchar(255) NOT NULL;--> statement-breakpoint
ALTER TABLE `news` ADD `isPublished` int DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `job_positions` ADD CONSTRAINT `job_positions_slug_unique` UNIQUE(`slug`);--> statement-breakpoint
ALTER TABLE `news` ADD CONSTRAINT `news_slug_unique` UNIQUE(`slug`);