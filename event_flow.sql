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
-- Table structure for table `kategorie`
--

DROP TABLE IF EXISTS `kategorie`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `kategorie` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `nazwa` varchar(255) DEFAULT NULL,
  `opis` text,
  PRIMARY KEY (`id`),
  UNIQUE KEY `id` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `kategorie`
--

LOCK TABLES `kategorie` WRITE;
/*!40000 ALTER TABLE `kategorie` DISABLE KEYS */;
INSERT INTO `kategorie` VALUES (1,'Sport','X');
/*!40000 ALTER TABLE `kategorie` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `miejsca`
--

DROP TABLE IF EXISTS `miejsca`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `miejsca` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `nazwa` varchar(255) DEFAULT NULL,
  `panstwo` varchar(100) DEFAULT NULL,
  `miasto` varchar(100) DEFAULT NULL,
  `ulica` varchar(255) DEFAULT NULL,
  `kod_poczt` varchar(20) DEFAULT NULL,
  `pojemnosc` int DEFAULT NULL,
  `opis` text,
  `user_id` bigint NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `id` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `miejsca`
--

LOCK TABLES `miejsca` WRITE;
/*!40000 ALTER TABLE `miejsca` DISABLE KEYS */;
INSERT INTO `miejsca` VALUES (1,'TEST','Polska','Gdańsk','Jana 13','33 364',200,'TEST',6),(2,'T2','Polska','Tarnów','Pawła13','33 840',200,'test',8),(3,'3','Polska','A','A','A',1,'A',8),(4,'ow','Polska','qwd','qwd','qwd',1,'ads',3);
/*!40000 ALTER TABLE `miejsca` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `organizator`
--

DROP TABLE IF EXISTS `organizator`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `organizator` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `data_utw` datetime(6) DEFAULT NULL,
  `firma` varchar(255) DEFAULT NULL,
  `kwalifikacje` text,
  `strona` varchar(255) DEFAULT NULL,
  `user_id` bigint NOT NULL,
  `zweryfikow` bit(1) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UK_4gcjcqm4bx4fw68tl0jym5oaf` (`user_id`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `organizator`
--

LOCK TABLES `organizator` WRITE;
/*!40000 ALTER TABLE `organizator` DISABLE KEYS */;
INSERT INTO `organizator` VALUES (1,'2026-04-08 11:34:07.635557','asd','null','a.com',6,_binary ''),(2,'2026-04-08 13:50:54.916522','MARBUD','Jakieś tam','www.google.com',8,_binary ''),(3,'2026-04-08 14:44:11.801085','firma','niewiem','strona',3,_binary ''),(4,'2026-04-08 20:08:21.873883','jakasfirma','nonon','qowndwoin',11,_binary ''),(5,'2026-04-08 22:07:51.618027','ss','ss','ss',12,_binary '');
/*!40000 ALTER TABLE `organizator` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `sale`
--

DROP TABLE IF EXISTS `sale`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `sale` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `miejsce_id` bigint unsigned DEFAULT NULL,
  `nazwa` varchar(255) DEFAULT NULL,
  `pojemnosc` int DEFAULT NULL,
  `pietro` int DEFAULT NULL,
  `ma_plan` tinyint(1) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `id` (`id`),
  KEY `miejsce_id` (`miejsce_id`),
  CONSTRAINT `sale_ibfk_1` FOREIGN KEY (`miejsce_id`) REFERENCES `miejsca` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `sale`
--

LOCK TABLES `sale` WRITE;
/*!40000 ALTER TABLE `sale` DISABLE KEYS */;
INSERT INTO `sale` VALUES (1,1,'T1',100,1,0),(2,2,'P1',122,1,0);
/*!40000 ALTER TABLE `sale` ENABLE KEYS */;
UNLOCK TABLES;

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
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,'Mateusz','Chochorowski','admin@example.com','admin','$2a$12$N7BHTRlGg32x3MWLRt0mVOcfHcM9yc8a11KXqkeoHcdF6aMf8KN6i','4046f48c-a02e-4680-9b3c-0c536cea0adc',NULL,'ADMIN','2026-03-25 15:08:36',1),(12,'Jan','Chochorowski','jchochorowski1@gmail.com','jchochorowski08102004','$2a$10$gnYlSdfb8IwvEBhMC9XK2uVI/M0dKF3KX9g.6Gk5VVKnl88hCkHLm','9b8fe5b4-97df-46c9-a512-eeebc9c51cbb',NULL,'ORG','2026-04-08 18:47:06',1);
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `wydarzenia`
--

DROP TABLE IF EXISTS `wydarzenia`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `wydarzenia` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `org_id` bigint DEFAULT NULL,
  `miejsce_id` bigint unsigned DEFAULT NULL,
  `tytul` varchar(255) DEFAULT NULL,
  `opis` text,
  `kategoria_id` bigint unsigned DEFAULT NULL,
  `rola` varchar(50) DEFAULT NULL,
  `data_utw` timestamp NULL DEFAULT NULL,
  `status` varchar(50) DEFAULT NULL,
  `data_rozp` timestamp NULL DEFAULT NULL,
  `data_zamk` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `id` (`id`),
  KEY `org_id` (`org_id`),
  KEY `miejsce_id` (`miejsce_id`),
  KEY `kategoria_id` (`kategoria_id`),
  CONSTRAINT `wydarzenia_ibfk_1` FOREIGN KEY (`org_id`) REFERENCES `organizator` (`id`),
  CONSTRAINT `wydarzenia_ibfk_2` FOREIGN KEY (`miejsce_id`) REFERENCES `miejsca` (`id`),
  CONSTRAINT `wydarzenia_ibfk_3` FOREIGN KEY (`kategoria_id`) REFERENCES `kategorie` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `wydarzenia`
--

LOCK TABLES `wydarzenia` WRITE;
/*!40000 ALTER TABLE `wydarzenia` DISABLE KEYS */;
INSERT INTO `wydarzenia` VALUES (1,1,1,'WYD','Wydarzenie',1,'TEST','2026-04-08 11:35:51','AKTYWNA','2026-04-24 08:00:00','2026-04-30 08:00:00');
/*!40000 ALTER TABLE `wydarzenia` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-04-09  0:21:16
