CREATE TABLE `orders` (
	`id` int AUTO_INCREMENT NOT NULL,
	`orderType` enum('reservation','takeaway','delivery','room_service') NOT NULL,
	`status` enum('new','confirmed','preparing','ready','delivered','cancelled') NOT NULL DEFAULT 'new',
	`customerName` varchar(180) NOT NULL,
	`customerPhone` varchar(40),
	`roomNumber` varchar(40),
	`address` text,
	`reservationId` int,
	`itemsJson` text NOT NULL,
	`total` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `orders_id` PRIMARY KEY(`id`)
);
