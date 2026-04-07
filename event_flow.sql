-- MySQL dump 10.13  Distrib 8.0.45, for Win64 (x86_64)
--
-- Host: localhost    Database: event_flow
-- ------------------------------------------------------
-- Server version	8.0.45

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `imie` varchar(100) DEFAULT NULL,
  `nazwisko` varchar(100) DEFAULT NULL,
  `email` varchar(255) NOT NULL,
  `login` varchar(100) NOT NULL,
  `haslo` varchar(255) NOT NULL,
  `salt` text NOT NULL,
  `platnosc` text,
  `rola` varchar(50) DEFAULT NULL,
  `data_utw` timestamp NULL DEFAULT NULL,
  `aktywnosc` tinyint(1) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `id` (`id`),
  UNIQUE KEY `email` (`email`),
  UNIQUE KEY `UK_r43af9ap4edm43mmtq01oddj6` (`login`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,'Mateusz','Chochorowski','admin@example.com','admin','$2a$10$UOBujPQuCzaeCC5ok1lCIuLQ4lAn0PvYgv91bCNcKE6eNPsQkseFS','4046f48c-a02e-4680-9b3c-0c536cea0adc',NULL,'ADMIN','2026-03-25 16:08:36',1),(2,'Jakub','Marczyk','jakub.marczyk@example.com','jmarczyk','haslo123','random_salt_789','Karta','USER','2026-03-25 18:30:30',1),(3,'Mateusz','Chochorowski','mchochorowski1@gmail.com','mateusz08102004','$2a$10$Hnh7GOA7PAATQkKaCnmiNOx6sR4.VA2FjLpMJW0VvKCml1ld6V36m','99f868ba-75fb-4c66-a0fc-8bb9b482f61b',NULL,'USER','2026-04-07 10:42:11',1),(4,'Mateusz','Chochorowski','mchochorowski2@gmail.com','mateusz08102005','$2a$10$mt9.HaAzGk8LQXrQ8gFIkOelcl3sI9/IMz61hL4lb0JRpt13zkex.','ac8c3dd3-9be0-4f5d-9932-eabdf56223e7',NULL,'USER','2026-04-07 14:42:47',1);
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-04-07 21:09:23
