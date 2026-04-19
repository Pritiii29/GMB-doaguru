-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Apr 19, 2026 at 08:51 PM
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
(3, 'client_59nwzqs', 'priyanshu Garg', 'banking', 'impriyanshu.garg@gmail.com', '9977343574', '$2b$10$ifgYJ9xrhRPdvR3543CYU.oKRml7ZcSf1l/FFT54WeSnjuBQARnx2', 'ChINN4xEHwyugTkRP_VLclm8MZ8', NULL, 1, '2026-04-19 11:13:59', '2026-04-19 11:36:14'),
(4, 'client_744dx7c', 'dev dubey', 'Camp', 'pritibandewar2929@gmail.com', '9244950772', '$2b$10$p7ukZEx.v6nYsgLdEcb3IequjVRkxXo1UljOoldZBKlVBB3cQQu2a', 'ChINN4xEHwyugTkRP_VLclm8MZ8', '/uploads/1776617137752-595759299.jpg', 1, '2026-04-19 16:45:38', '2026-04-19 16:45:38');

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
(21, 'admin', 'Ajeet Chaturvedi', '9926938817', 'ajeetchaturvedi@gmail.com', 3, 'fjkdga;jfgha;lvn', 0, '2026-04-19 17:49:48');

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
-- Indexes for table `reviews`
--
ALTER TABLE `reviews`
  ADD PRIMARY KEY (`id`);

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
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `reviews`
--
ALTER TABLE `reviews`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=22;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
