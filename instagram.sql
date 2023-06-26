-- phpMyAdmin SQL Dump
-- version 5.2.0
-- https://www.phpmyadmin.net/
--
-- Host: localhost
-- Generation Time: Jun 26, 2023 at 10:18 PM
-- Server version: 10.4.27-MariaDB
-- PHP Version: 8.2.0

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `instagram`
--

-- --------------------------------------------------------

--
-- Table structure for table `logs`
--

CREATE TABLE `logs` (
  `id` bigint(11) NOT NULL,
  `path` text NOT NULL,
  `body` text NOT NULL,
  `Date` varchar(30) NOT NULL,
  `request_type` varchar(15) NOT NULL,
  `headers` varchar(800) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `logs`
--

INSERT INTO `logs` (`id`, `path`, `body`, `Date`, `request_type`, `headers`) VALUES
(99, '/v1/users/deneme', '{\"id\":2,\"description\":\"Kullanıcı şikayeti deneme\"}', '26.06.2023 23:17:16', 'POST', '{\"authorization\":\"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiaWF0IjoxNjg3ODAzMjkzfQ.7GQY6sQbj-ZIlRtrMip5qQydibJsKRSlf2SmXBDQYO4\",\"content-type\":\"application/json\",\"user-agent\":\"PostmanRuntime/7.31.1\",\"accept\":\"*/*\",\"postman-token\":\"04380262-7ed8-4413-a7bd-a251094a1237\",\"host\":\"127.0.0.1:3000\",\"accept-encoding\":\"gzip, deflate, br\",\"connection\":\"keep-alive\",\"content-length\":\"64\"}'),
(100, '/v1/users/deneme', 'null', '26.06.2023 23:17:23', 'GET', '{\"authorization\":\"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiaWF0IjoxNjg3ODAzMjkzfQ.7GQY6sQbj-ZIlRtrMip5qQydibJsKRSlf2SmXBDQYO4\",\"content-type\":\"application/json\",\"user-agent\":\"PostmanRuntime/7.31.1\",\"accept\":\"*/*\",\"postman-token\":\"344d84bf-dd6d-4916-8808-a513bfe93037\",\"host\":\"127.0.0.1:3000\",\"accept-encoding\":\"gzip, deflate, br\",\"connection\":\"keep-alive\",\"content-length\":\"64\"}'),
(101, '/', 'null', '26.06.2023 23:17:32', 'GET', '{\"authorization\":\"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiaWF0IjoxNjg3ODAzMjkzfQ.7GQY6sQbj-ZIlRtrMip5qQydibJsKRSlf2SmXBDQYO4\",\"content-type\":\"application/json\",\"user-agent\":\"PostmanRuntime/7.31.1\",\"accept\":\"*/*\",\"postman-token\":\"5e12e973-14e1-4dae-9412-1b2caeb19d44\",\"host\":\"127.0.0.1:3000\",\"accept-encoding\":\"gzip, deflate, br\",\"connection\":\"keep-alive\",\"content-length\":\"64\"}'),
(102, '/v1/users/deneme', 'null', '26.06.2023 23:17:57', 'HEAD', '{\"authorization\":\"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiaWF0IjoxNjg3ODAzMjkzfQ.7GQY6sQbj-ZIlRtrMip5qQydibJsKRSlf2SmXBDQYO4\",\"content-type\":\"application/json\",\"user-agent\":\"PostmanRuntime/7.31.1\",\"accept\":\"*/*\",\"postman-token\":\"24311b14-709a-4130-8515-7d3b5d98a83e\",\"host\":\"127.0.0.1:3000\",\"accept-encoding\":\"gzip, deflate, br\",\"connection\":\"keep-alive\",\"content-length\":\"64\"}');

-- --------------------------------------------------------

--
-- Table structure for table `password_reset`
--

CREATE TABLE `password_reset` (
  `id` int(11) NOT NULL,
  `userid` int(11) NOT NULL,
  `newpassword` varchar(64) NOT NULL,
  `token` varchar(32) NOT NULL,
  `isActive` tinyint(4) NOT NULL DEFAULT 1,
  `createDate` varchar(25) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `posts`
--

CREATE TABLE `posts` (
  `id` int(11) NOT NULL,
  `userId` int(11) NOT NULL,
  `comment` varchar(200) NOT NULL,
  `likes` int(11) NOT NULL,
  `imageUrl` varchar(150) NOT NULL,
  `timestamp` bigint(14) NOT NULL,
  `createDate` varchar(25) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `posts`
--

INSERT INTO `posts` (`id`, `userId`, `comment`, `likes`, `imageUrl`, `timestamp`, `createDate`) VALUES
(1, 1, 'denemepost', 1, '/uploads/images/posts/e3985fee907283473a8d0d1dbe060dbd.jpg', 1687803958597, '26.06.2023 21:25:58');

-- --------------------------------------------------------

--
-- Table structure for table `post_comments`
--

CREATE TABLE `post_comments` (
  `id` int(11) NOT NULL,
  `commenter_id` int(11) NOT NULL,
  `postid` int(11) NOT NULL,
  `comment` varchar(120) NOT NULL,
  `date` varchar(30) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `post_comments`
--

INSERT INTO `post_comments` (`id`, `commenter_id`, `postid`, `comment`, `date`) VALUES
(1, 1, 1, 'denemeyorum', '26.06.2023 21:27:24');

-- --------------------------------------------------------

--
-- Table structure for table `post_likes`
--

CREATE TABLE `post_likes` (
  `id` int(11) NOT NULL,
  `postid` int(11) NOT NULL,
  `liker_user_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `post_likes`
--

INSERT INTO `post_likes` (`id`, `postid`, `liker_user_id`) VALUES
(2, 1, 1);

-- --------------------------------------------------------

--
-- Table structure for table `private_message`
--

CREATE TABLE `private_message` (
  `id` int(11) NOT NULL,
  `message` varchar(200) NOT NULL,
  `senderid` int(11) NOT NULL,
  `receiverid` int(11) NOT NULL,
  `Date` varchar(25) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `private_message`
--

INSERT INTO `private_message` (`id`, `message`, `senderid`, `receiverid`, `Date`) VALUES
(1, 'Merhaba Mehmet', 1, 2, '26.06.2023 21:30:08'),
(2, 'Merhaba Ahmet', 2, 1, '26.06.2023 21:35:02'),
(3, 'Merhaba Ahmet nasılsın', 3, 1, '26.06.2023 21:35:02');

-- --------------------------------------------------------

--
-- Table structure for table `stories`
--

CREATE TABLE `stories` (
  `id` int(11) NOT NULL,
  `userid` int(11) NOT NULL,
  `comment` varchar(100) NOT NULL,
  `likes` int(11) NOT NULL DEFAULT 0,
  `photoUrl` varchar(120) NOT NULL,
  `timestamp` bigint(20) NOT NULL,
  `createDate` varchar(25) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `stories`
--

INSERT INTO `stories` (`id`, `userid`, `comment`, `likes`, `photoUrl`, `timestamp`, `createDate`) VALUES
(1, 1, 'denemestory', 1, '/uploads/images/stories/3d8819c2c1946038fd8c7d73f1e557ad.jpg', 1687803649248, '26.06.2023 21:20:49');

-- --------------------------------------------------------

--
-- Table structure for table `story_likes`
--

CREATE TABLE `story_likes` (
  `id` int(11) NOT NULL,
  `story_id` int(11) NOT NULL,
  `liker_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `story_likes`
--

INSERT INTO `story_likes` (`id`, `story_id`, `liker_id`) VALUES
(2, 1, 1);

-- --------------------------------------------------------

--
-- Table structure for table `story_seen`
--

CREATE TABLE `story_seen` (
  `id` int(11) NOT NULL,
  `storyid` int(11) NOT NULL,
  `userid` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `story_seen`
--

INSERT INTO `story_seen` (`id`, `storyid`, `userid`) VALUES
(4, 1, 1);

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `email` varchar(120) NOT NULL,
  `password` varchar(120) NOT NULL,
  `name` varchar(50) NOT NULL,
  `sex` tinyint(1) NOT NULL,
  `profile_description` varchar(250) NOT NULL,
  `IsActive` tinyint(1) NOT NULL,
  `avatarUrl` varchar(150) NOT NULL,
  `userType` varchar(30) NOT NULL,
  `RegisteredWith` varchar(40) NOT NULL,
  `CreateDate` varchar(30) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `email`, `password`, `name`, `sex`, `profile_description`, `IsActive`, `avatarUrl`, `userType`, `RegisteredWith`, `CreateDate`) VALUES
(1, 'test1@gmail.com', 'ef797c8118f02dfb649607dd5d3f8c7623048c9c063d532cc95c5ed7a898a64f', 'ahmet kalkan', 1, 'Merhaba', 1, '/uploads/images/user_avatars/2bde18703371f159d4df3485d84fa833.jpg', 'normal', 'Email', '26.06.2023 21:12:41'),
(2, 'test2@gmail.com', '15e2b0d3c33891ebb0f1ef609ec419420c20e320ce94c65fbc8c3312448eb225', 'mehmet arslan', 1, 'Merhaba', 1, '/uploads/images/user_avatars/male.jpg', 'normal', 'Email', '26.06.2023 21:13:31'),
(3, 'test3@gmail.com', 'c775e7b757ede630cd0aa1113bd102661ab38829ca52a6422ab782862f268646', 'canan erdoğan', 0, 'Merhaba', 1, '/uploads/images/user_avatars/female.jpg', 'normal', 'Email', '26.06.2023 21:14:18');

-- --------------------------------------------------------

--
-- Table structure for table `user_reports`
--

CREATE TABLE `user_reports` (
  `id` int(11) NOT NULL,
  `reporter_userid` int(11) NOT NULL,
  `reported_userid` int(11) NOT NULL,
  `description` varchar(250) NOT NULL,
  `timestamp` bigint(20) NOT NULL,
  `date` varchar(30) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `user_reports`
--

INSERT INTO `user_reports` (`id`, `reporter_userid`, `reported_userid`, `description`, `timestamp`, `date`) VALUES
(1, 1, 2, 'Kullanıcı şikayeti deneme', 1687805178084, '26.06.2023 21:46:18');

-- --------------------------------------------------------

--
-- Table structure for table `version_control`
--

CREATE TABLE `version_control` (
  `id` int(11) NOT NULL,
  `latest_version` float NOT NULL,
  `updateDate` varchar(25) NOT NULL,
  `device` varchar(15) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `version_control`
--

INSERT INTO `version_control` (`id`, `latest_version`, `updateDate`, `device`) VALUES
(1, 0.1, '22.06.2023 14:56:05', 'android'),
(2, 0.1, '22.06.2023 14:56:05', 'ios');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `logs`
--
ALTER TABLE `logs`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `password_reset`
--
ALTER TABLE `password_reset`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `posts`
--
ALTER TABLE `posts`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `post_comments`
--
ALTER TABLE `post_comments`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `post_likes`
--
ALTER TABLE `post_likes`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `private_message`
--
ALTER TABLE `private_message`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `stories`
--
ALTER TABLE `stories`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `story_likes`
--
ALTER TABLE `story_likes`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `story_seen`
--
ALTER TABLE `story_seen`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`);

--
-- Indexes for table `user_reports`
--
ALTER TABLE `user_reports`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `version_control`
--
ALTER TABLE `version_control`
  ADD PRIMARY KEY (`id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `logs`
--
ALTER TABLE `logs`
  MODIFY `id` bigint(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=103;

--
-- AUTO_INCREMENT for table `password_reset`
--
ALTER TABLE `password_reset`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `posts`
--
ALTER TABLE `posts`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `post_comments`
--
ALTER TABLE `post_comments`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `post_likes`
--
ALTER TABLE `post_likes`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `private_message`
--
ALTER TABLE `private_message`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `stories`
--
ALTER TABLE `stories`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `story_likes`
--
ALTER TABLE `story_likes`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `story_seen`
--
ALTER TABLE `story_seen`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `user_reports`
--
ALTER TABLE `user_reports`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `version_control`
--
ALTER TABLE `version_control`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
