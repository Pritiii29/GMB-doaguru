-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Apr 23, 2026 at 11:57 AM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.0.30

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `qr_review`
--

-- --------------------------------------------------------

--
-- Table structure for table `admins`
--

CREATE TABLE `admins` (
  `id` int(11) NOT NULL,
  `email` varchar(100) NOT NULL,
  `password` varchar(255) NOT NULL,
  `createdAt` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `admins`
--

INSERT INTO `admins` (`id`, `email`, `password`, `createdAt`) VALUES
(1, 'pritibandewar52@gmail.com', '$2b$10$h9l7zCuuZUBfch2zpT/P0ehv8hFKyNGbLbU3uynzrSB7IkUVwp.3y', '2026-04-14 06:48:03');

-- --------------------------------------------------------

--
-- Table structure for table `clients`
--

CREATE TABLE `clients` (
  `id` int(11) NOT NULL,
  `clientId` varchar(50) NOT NULL,
  `name` varchar(100) NOT NULL,
  `businessName` varchar(150) DEFAULT NULL,
  `email` varchar(100) NOT NULL,
  `mobile` varchar(15) DEFAULT NULL,
  `password` varchar(255) NOT NULL,
  `placeId` varchar(255) DEFAULT NULL,
  `logo` varchar(255) DEFAULT NULL,
  `isActive` tinyint(1) DEFAULT 1,
  `createdAt` timestamp NOT NULL DEFAULT current_timestamp(),
  `updatedAt` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `clients`
--

INSERT INTO `clients` (`id`, `clientId`, `name`, `businessName`, `email`, `mobile`, `password`, `placeId`, `logo`, `isActive`, `createdAt`, `updatedAt`) VALUES
(3, 'client_59nwzqs', 'priyanshu Garg', 'banking', 'impriyanshu.garg@gmail.com', '9977343574', '$2b$10$41qtToT59vd.ISQ8Kbh5oO91MvfUHfUvcE3CXxFTIz.NXjvfANN3.', 'ChINN4xEHwyugTkRP_VLclm8MZ8', '/uploads/1776665737139-728529618.png', 1, '2026-04-19 11:13:59', '2026-04-23 08:11:17'),
(4, 'client_744dx7c', 'dev dubey', 'Camp', 'pritibandewar2929@gmail.com', '9244950772', '$2b$10$p7ukZEx.v6nYsgLdEcb3IequjVRkxXo1UljOoldZBKlVBB3cQQu2a', 'ChINN4xEHwyugTkRP_VLclm8MZ8', '/uploads/1776617137752-595759299.jpg', 1, '2026-04-19 16:45:38', '2026-04-20 06:14:41'),
(6, 'client_6cqtdpq', 'DOAGuru', 'IT', 'doaguruinfosystems@gmail.com', '9244950772', '$2b$10$NRl3rfVdNrM3FS19gGVIAOvwVSNeVjrGlQHjW3.o3YnfrZQp0lKJe', 'ChIJT-5eGRaxgTkRxyMc7_psGWI', '/uploads/1776761332222-270648210.png', 1, '2026-04-21 08:48:52', '2026-04-21 08:48:52');

-- --------------------------------------------------------

--
-- Table structure for table `notifications`
--

CREATE TABLE `notifications` (
  `id` int(11) NOT NULL,
  `clientId` varchar(50) DEFAULT NULL,
  `type` varchar(50) NOT NULL,
  `message` text NOT NULL,
  `is_read` tinyint(1) DEFAULT 0,
  `createdAt` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `notifications`
--

INSERT INTO `notifications` (`id`, `clientId`, `type`, `message`, `is_read`, `createdAt`) VALUES
(2, 'client_59nwzqs', 'renewal_reminder', 'TEST NOTIFICATION: Client DOAGuru subscription is expiring in 2 days. Please follow up.', 1, '2026-04-23 08:52:50');

-- --------------------------------------------------------

--
-- Table structure for table `reviews`
--

CREATE TABLE `reviews` (
  `id` int(11) NOT NULL,
  `clientId` varchar(50) NOT NULL,
  `fullName` varchar(255) DEFAULT NULL,
  `mobile` varchar(20) DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `rating` int(11) NOT NULL,
  `review` text DEFAULT NULL,
  `isPositive` tinyint(1) DEFAULT NULL,
  `createdAt` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `reviews`
--

INSERT INTO `reviews` (`id`, `clientId`, `fullName`, `mobile`, `email`, `rating`, `review`, `isPositive`, `createdAt`) VALUES
(20, 'client_59nwzqs', 'Priti Bandewar', '9244950772', 'pritibandewar68@gmail.com', 2, 'this was little good', 0, '2026-04-19 17:34:26'),
(21, 'admin', 'Ajeet Chaturvedi', '9926938817', 'ajeetchaturvedi@gmail.com', 3, 'fjkdga;jfgha;lvn', 0, '2026-04-19 17:49:48'),
(22, 'admin', 'Priti Bandewar', '9329978427', NULL, 5, NULL, 1, '2026-04-20 05:39:47'),
(23, 'admin', 'Priti Bandewar', '9329978427', NULL, 4, NULL, 1, '2026-04-20 05:45:48'),
(24, 'admin', 'Priti Bandewar', '9244950772', NULL, 4, 'great experience', 1, '2026-04-21 08:42:39'),
(25, 'client_59nwzqs', 'Priti Bandewar', '9244950772', NULL, 4, 'great experience', 1, '2026-04-21 08:44:02'),
(26, 'client_6cqtdpq', 'Priti Bandewar', '9244950772', NULL, 4, 'Great service ', 1, '2026-04-21 08:55:50'),
(27, 'admin', 'Priti Bandewar', '9244950772', NULL, 5, 'Ultimate services prompt response result oriented approach', 1, '2026-04-21 08:59:33'),
(28, 'admin', 'Priti Bandewar', '9244950772', NULL, 3, 'Bad service ', 0, '2026-04-21 09:04:56'),
(29, 'client_59nwzqs', 'Priti Bandewar', '9244950772', NULL, 3, 'good', 0, '2026-04-23 09:29:30'),
(30, 'client_59nwzqs', 'priyanshu garg', '9977343574', NULL, 3, 'dsgasdg', 0, '2026-04-23 09:35:04'),
(31, 'client_59nwzqs', 'dev dubey', '9329978427', NULL, 3, 'sdgasdgasdv', 0, '2026-04-23 09:35:28');

-- --------------------------------------------------------

--
-- Table structure for table `subscriptions`
--

CREATE TABLE `subscriptions` (
  `id` int(11) NOT NULL,
  `clientId` varchar(50) NOT NULL,
  `planId` int(11) NOT NULL,
  `status` enum('active','inactive','expired','cancelled') DEFAULT 'active',
  `start_date` datetime NOT NULL DEFAULT current_timestamp(),
  `end_date` datetime NOT NULL,
  `renewal_date` datetime DEFAULT NULL,
  `auto_renew` tinyint(1) DEFAULT 1,
  `amount_paid` decimal(10,2) DEFAULT NULL,
  `payment_method` varchar(50) DEFAULT NULL,
  `transaction_id` varchar(100) DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `createdAt` timestamp NOT NULL DEFAULT current_timestamp(),
  `updatedAt` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `subscriptions`
--

INSERT INTO `subscriptions` (`id`, `clientId`, `planId`, `status`, `start_date`, `end_date`, `renewal_date`, `auto_renew`, `amount_paid`, `payment_method`, `transaction_id`, `notes`, `createdAt`, `updatedAt`) VALUES
(1, 'client_59nwzqs', 1, 'cancelled', '2026-04-23 11:51:13', '2026-05-23 11:51:20', '2026-04-23 11:51:20', 1, 500.00, 'manual', '', 'I purchesed a plan', '2026-04-23 06:21:13', '2026-04-23 07:11:45'),
(2, 'client_6cqtdpq', 2, 'cancelled', '2026-04-23 11:52:27', '2026-05-23 11:52:27', NULL, 1, 2000.00, 'manual', '', '', '2026-04-23 06:22:27', '2026-04-23 06:23:48'),
(3, 'client_59nwzqs', 3, 'active', '2026-04-23 14:55:49', '2026-05-23 14:55:49', NULL, 1, 5000.00, 'manual', '', '', '2026-04-23 09:25:49', '2026-04-23 09:25:49');

-- --------------------------------------------------------

--
-- Table structure for table `subscription_history`
--

CREATE TABLE `subscription_history` (
  `id` int(11) NOT NULL,
  `clientId` varchar(50) NOT NULL,
  `subscriptionId` int(11) DEFAULT NULL,
  `action` enum('created','renewed','upgraded','downgraded','cancelled','expired') NOT NULL,
  `old_planId` int(11) DEFAULT NULL,
  `new_planId` int(11) DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `createdAt` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `subscription_history`
--

INSERT INTO `subscription_history` (`id`, `clientId`, `subscriptionId`, `action`, `old_planId`, `new_planId`, `notes`, `createdAt`) VALUES
(1, 'client_59nwzqs', 1, 'created', NULL, 1, NULL, '2026-04-23 06:21:13'),
(2, 'client_59nwzqs', 1, 'renewed', NULL, NULL, NULL, '2026-04-23 06:21:20'),
(3, 'client_6cqtdpq', 2, 'created', NULL, 2, NULL, '2026-04-23 06:22:27'),
(4, 'client_6cqtdpq', 2, 'cancelled', NULL, NULL, NULL, '2026-04-23 06:23:48'),
(5, 'client_59nwzqs', 1, 'cancelled', NULL, NULL, NULL, '2026-04-23 07:11:45'),
(6, 'client_59nwzqs', 3, 'created', NULL, 3, NULL, '2026-04-23 09:25:49');

-- --------------------------------------------------------

--
-- Table structure for table `subscription_plans`
--

CREATE TABLE `subscription_plans` (
  `id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `description` text DEFAULT NULL,
  `price` decimal(10,2) NOT NULL,
  `currency` varchar(5) DEFAULT 'INR',
  `duration_days` int(11) DEFAULT 30,
  `max_reviews_per_month` int(11) DEFAULT NULL,
  `features` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`features`)),
  `is_active` tinyint(1) DEFAULT 1,
  `createdAt` timestamp NOT NULL DEFAULT current_timestamp(),
  `updatedAt` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `subscription_plans`
--

INSERT INTO `subscription_plans` (`id`, `name`, `description`, `price`, `currency`, `duration_days`, `max_reviews_per_month`, `features`, `is_active`, `createdAt`, `updatedAt`) VALUES
(1, 'Starter', 'Perfect for new businesses', 0.00, 'INR', 30, 100, '[\"Unlimited QR Codes\",\"Basic Analytics\",\"Email Support\"]', 1, '2026-04-23 06:03:20', '2026-04-23 06:03:20'),
(2, 'Professional', 'For growing businesses', 4999.00, 'INR', 30, 1000, '[\"Unlimited QR Codes\",\"Advanced Analytics\",\"Priority Support\",\"Custom Branding\"]', 1, '2026-04-23 06:03:20', '2026-04-23 06:03:20'),
(3, 'Enterprise', 'For large organizations', 9999.00, 'INR', 30, NULL, '[\"Unlimited QR Codes\",\"Advanced Analytics\",\"24/7 Support\",\"Custom Branding\",\"API Access\",\"Dedicated Account Manager\"]', 1, '2026-04-23 06:03:20', '2026-04-23 06:03:20');

-- --------------------------------------------------------

--
-- Table structure for table `subscription_plans_legacy`
--

CREATE TABLE `subscription_plans_legacy` (
  `id` int(11) NOT NULL,
  `clientId` int(11) NOT NULL,
  `started_date` date NOT NULL,
  `end_date` date NOT NULL,
  `createdAt` timestamp NOT NULL DEFAULT current_timestamp(),
  `is_active` tinyint(1) DEFAULT 1,
  `name` varchar(100) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `price` decimal(10,2) NOT NULL DEFAULT 0.00,
  `currency` varchar(5) DEFAULT 'INR',
  `duration_days` int(11) DEFAULT 30,
  `max_reviews_per_month` int(11) DEFAULT NULL,
  `features` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`features`)),
  `updatedAt` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Indexes for dumped tables
--

--
-- Indexes for table `admins`
--
ALTER TABLE `admins`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`);

--
-- Indexes for table `clients`
--
ALTER TABLE `clients`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `clientId` (`clientId`),
  ADD UNIQUE KEY `email` (`email`),
  ADD UNIQUE KEY `email_2` (`email`),
  ADD UNIQUE KEY `clientId_2` (`clientId`);

--
-- Indexes for table `notifications`
--
ALTER TABLE `notifications`
  ADD PRIMARY KEY (`id`),
  ADD KEY `notifications_client_fk` (`clientId`);

--
-- Indexes for table `reviews`
--
ALTER TABLE `reviews`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `subscriptions`
--
ALTER TABLE `subscriptions`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_subscriptions_client_status` (`clientId`,`status`),
  ADD KEY `idx_subscriptions_plan` (`planId`);

--
-- Indexes for table `subscription_history`
--
ALTER TABLE `subscription_history`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_subscription_history_client` (`clientId`),
  ADD KEY `idx_subscription_history_subscription` (`subscriptionId`);

--
-- Indexes for table `subscription_plans`
--
ALTER TABLE `subscription_plans`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_plan_name` (`name`);

--
-- Indexes for table `subscription_plans_legacy`
--
ALTER TABLE `subscription_plans_legacy`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_subscription_plans_client` (`clientId`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `admins`
--
ALTER TABLE `admins`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `clients`
--
ALTER TABLE `clients`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT for table `notifications`
--
ALTER TABLE `notifications`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `reviews`
--
ALTER TABLE `reviews`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=32;

--
-- AUTO_INCREMENT for table `subscriptions`
--
ALTER TABLE `subscriptions`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `subscription_history`
--
ALTER TABLE `subscription_history`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `subscription_plans`
--
ALTER TABLE `subscription_plans`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `subscription_plans_legacy`
--
ALTER TABLE `subscription_plans_legacy`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `notifications`
--
ALTER TABLE `notifications`
  ADD CONSTRAINT `notifications_client_fk` FOREIGN KEY (`clientId`) REFERENCES `clients` (`clientId`);

--
-- Constraints for table `subscriptions`
--
ALTER TABLE `subscriptions`
  ADD CONSTRAINT `subscriptions_client_fk` FOREIGN KEY (`clientId`) REFERENCES `clients` (`clientId`);

--
-- Constraints for table `subscription_history`
--
ALTER TABLE `subscription_history`
  ADD CONSTRAINT `subscription_history_client_fk` FOREIGN KEY (`clientId`) REFERENCES `clients` (`clientId`),
  ADD CONSTRAINT `subscription_history_subscription_fk` FOREIGN KEY (`subscriptionId`) REFERENCES `subscriptions` (`id`);

--
-- Constraints for table `subscription_plans_legacy`
--
ALTER TABLE `subscription_plans_legacy`
  ADD CONSTRAINT `fk_subscription_plans_client` FOREIGN KEY (`clientId`) REFERENCES `clients` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
