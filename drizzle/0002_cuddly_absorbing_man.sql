ALTER TABLE `orders` ADD `deliveryZone` varchar(100);--> statement-breakpoint
ALTER TABLE `orders` ADD `deliveryFee` int DEFAULT 0 NOT NULL;