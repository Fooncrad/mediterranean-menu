CREATE TABLE `menu_items` (
	`id` int AUTO_INCREMENT NOT NULL,
	`category` enum('breakfast','mezza','mains','desserts') NOT NULL,
	`imageUrl` varchar(512) NOT NULL,
	`price` int NOT NULL,
	`rating` varchar(8) NOT NULL DEFAULT '4.8',
	`isVegan` int NOT NULL DEFAULT 0,
	`isPopular` int NOT NULL DEFAULT 0,
	`isAvailable` int NOT NULL DEFAULT 1,
	`nameAr` varchar(180) NOT NULL,
	`descriptionAr` text NOT NULL,
	`nameEn` varchar(180) NOT NULL,
	`descriptionEn` text NOT NULL,
	`nameFr` varchar(180) NOT NULL,
	`descriptionFr` text NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `menu_items_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `reservations` (
	`id` int AUTO_INCREMENT NOT NULL,
	`guestName` varchar(180) NOT NULL,
	`guestCount` int NOT NULL,
	`reservationAt` timestamp NOT NULL,
	`status` enum('pending','confirmed','cancelled') NOT NULL DEFAULT 'pending',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `reservations_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` int AUTO_INCREMENT NOT NULL,
	`openId` varchar(64) NOT NULL,
	`name` text,
	`email` varchar(320),
	`loginMethod` varchar(64),
	`role` enum('user','admin') NOT NULL DEFAULT 'user',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`lastSignedIn` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `users_id` PRIMARY KEY(`id`),
	CONSTRAINT `users_openId_unique` UNIQUE(`openId`)
);
