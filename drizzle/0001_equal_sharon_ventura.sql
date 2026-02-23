CREATE TABLE `job_positions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`positionName` varchar(255) NOT NULL,
	`description` text NOT NULL,
	`requirements` text NOT NULL,
	`location` varchar(255) NOT NULL,
	`salary` varchar(255) NOT NULL,
	`isActive` int NOT NULL DEFAULT 1,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `job_positions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `news` (
	`id` int AUTO_INCREMENT NOT NULL,
	`title` varchar(255) NOT NULL,
	`content` text NOT NULL,
	`category` enum('お知らせ','重要なお知らせ','プレスリリース','メディア掲載') NOT NULL,
	`imageUrl` varchar(500),
	`publishedAt` timestamp NOT NULL DEFAULT (now()),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `news_id` PRIMARY KEY(`id`)
);
