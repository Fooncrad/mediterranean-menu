ALTER TABLE `orders` MODIFY COLUMN `orderType` enum('table','reservation','takeaway','delivery','room_service') NOT NULL;--> statement-breakpoint
ALTER TABLE `menu_items` ADD `discountPrice` int;--> statement-breakpoint
ALTER TABLE `menu_items` ADD `addOnsJson` text NULL;--> statement-breakpoint
UPDATE `menu_items` SET `addOnsJson` = '[]' WHERE `addOnsJson` IS NULL;--> statement-breakpoint
ALTER TABLE `menu_items` MODIFY COLUMN `addOnsJson` text NOT NULL;--> statement-breakpoint
ALTER TABLE `orders` ADD `tableNumber` varchar(40);--> statement-breakpoint
ALTER TABLE `orders` ADD `taxAmount` int DEFAULT 0 NOT NULL;
