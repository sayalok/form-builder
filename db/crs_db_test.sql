-- phpMyAdmin SQL Dump
-- version 4.9.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Jan 23, 2020 at 12:16 PM
-- Server version: 10.4.8-MariaDB
-- PHP Version: 7.1.33

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET AUTOCOMMIT = 0;
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `crs_db_test`
--

-- --------------------------------------------------------

--
-- Table structure for table `form`
--

CREATE TABLE `form` (
  `id` int(11) NOT NULL,
  `name` varchar(255) DEFAULT NULL,
  `form_type` varchar(255) DEFAULT NULL,
  `created_by` int(11) DEFAULT NULL,
  `pay_amount` int(11) DEFAULT NULL,
  `active_status` int(11) DEFAULT 0,
  `created_on` timestamp NULL DEFAULT current_timestamp(),
  `updated_on` timestamp NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Dumping data for table `form`
--

INSERT INTO `form` (`id`, `name`, `form_type`, `created_by`, `pay_amount`, `active_status`, `created_on`, `updated_on`) VALUES
(43, 'Another Test Form', 'service', 380, 500, 2, NULL, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `questions`
--

CREATE TABLE `questions` (
  `qid` int(11) NOT NULL,
  `form_id` int(11) DEFAULT NULL,
  `que_type` varchar(255) DEFAULT NULL,
  `question` text DEFAULT NULL,
  `created_by` int(11) DEFAULT NULL,
  `que_status` int(11) DEFAULT 1,
  `created_on` timestamp NULL DEFAULT NULL,
  `updated_on` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Dumping data for table `questions`
--

INSERT INTO `questions` (`qid`, `form_id`, `que_type`, `question`, `created_by`, `que_status`, `created_on`, `updated_on`) VALUES
(65, 43, 'btntextField', 'What is your name?', 380, 1, NULL, NULL),
(66, 43, 'btntextField', 'what is your father name?', 380, 1, NULL, NULL),
(67, 43, 'btnRadio', 'Gender', 380, 1, NULL, NULL),
(68, 43, 'btnchkBox', 'Profession', 380, 1, NULL, NULL),
(69, 43, 'btndropDown', 'Location', 380, 1, NULL, NULL),
(70, 43, 'btnFile', 'Upload Photo', 380, 1, NULL, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `questions_option`
--

CREATE TABLE `questions_option` (
  `optid` int(11) NOT NULL,
  `question_id` int(11) DEFAULT NULL,
  `que_option` text DEFAULT NULL,
  `opt_status` int(11) DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Dumping data for table `questions_option`
--

INSERT INTO `questions_option` (`optid`, `question_id`, `que_option`, `opt_status`) VALUES
(42, 67, 'Male', 1),
(43, 67, 'Female', 1),
(44, 68, 'Buisness', 1),
(45, 68, 'unemployed', 1),
(46, 68, 'service', 1),
(47, 69, 'Dhaka', 1),
(48, 69, 'Khulna', 1),
(49, 69, 'ctg', 1),
(50, 69, 'syhlet', 1);

-- --------------------------------------------------------

--
-- Table structure for table `questions_value`
--

CREATE TABLE `questions_value` (
  `id` int(11) NOT NULL,
  `question_id` int(11) DEFAULT NULL,
  `que_type` varchar(255) DEFAULT NULL,
  `que_value_text` varchar(255) DEFAULT NULL,
  `que_value_boolean` tinyint(4) DEFAULT NULL,
  `que_value_float` float DEFAULT NULL,
  `que_value_int` int(11) DEFAULT NULL,
  `que_value_select` varchar(255) DEFAULT NULL,
  `que_value_file` varchar(255) DEFAULT NULL,
  `trans_id` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Indexes for dumped tables
--

--
-- Indexes for table `form`
--
ALTER TABLE `form`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `questions`
--
ALTER TABLE `questions`
  ADD PRIMARY KEY (`qid`),
  ADD KEY `form_id` (`form_id`);

--
-- Indexes for table `questions_option`
--
ALTER TABLE `questions_option`
  ADD PRIMARY KEY (`optid`),
  ADD KEY `question_id` (`question_id`);

--
-- Indexes for table `questions_value`
--
ALTER TABLE `questions_value`
  ADD PRIMARY KEY (`id`),
  ADD KEY `question_id` (`question_id`),
  ADD KEY `trans_id` (`trans_id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `form`
--
ALTER TABLE `form`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=44;

--
-- AUTO_INCREMENT for table `questions`
--
ALTER TABLE `questions`
  MODIFY `qid` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=71;

--
-- AUTO_INCREMENT for table `questions_option`
--
ALTER TABLE `questions_option`
  MODIFY `optid` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=51;

--
-- AUTO_INCREMENT for table `questions_value`
--
ALTER TABLE `questions_value`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=25;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `questions`
--
ALTER TABLE `questions`
  ADD CONSTRAINT `questions_ibfk_1` FOREIGN KEY (`form_id`) REFERENCES `form` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `questions_option`
--
ALTER TABLE `questions_option`
  ADD CONSTRAINT `questions_option_ibfk_1` FOREIGN KEY (`question_id`) REFERENCES `questions` (`qid`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
