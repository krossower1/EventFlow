-- MySQL dump 10.13  Distrib 9.6.0, for Win64 (x86_64)
--
-- Host: localhost    Database: event_flow
-- ------------------------------------------------------
-- Server version	9.6.0

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
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `miejsca`
--

LOCK TABLES `miejsca` WRITE;
/*!40000 ALTER TABLE `miejsca` DISABLE KEYS */;
INSERT INTO `miejsca` VALUES (1,'TEST','Polska','Gdańsk','Jana 13','33 364',200,'TEST',6),(2,'T2','Polska','Tarnów','Pawła13','33 840',200,'test',8),(3,'3','Polska','A','A','A',1,'A',8),(4,'A','Polska','S','D','2323',1,'2e',10),(5,'Vegas','Polska','Stary Sącz','Stara 15','33-340',300,'Budynek',13);
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
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `organizator`
--

LOCK TABLES `organizator` WRITE;
/*!40000 ALTER TABLE `organizator` DISABLE KEYS */;
INSERT INTO `organizator` VALUES (1,'2026-04-08 11:34:07.635557','asd','null','a.com',6,_binary ''),(2,'2026-04-08 13:50:54.916522','MARBUD','Jakieś tam','www.google.com',8,_binary ''),(3,'2026-04-09 16:29:58.015035','A','A','A',10,_binary ''),(4,'2026-04-09 17:20:58.824777','Fakro','Niskie','8.8.8.8',13,_binary '');
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
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `sale`
--

LOCK TABLES `sale` WRITE;
/*!40000 ALTER TABLE `sale` DISABLE KEYS */;
INSERT INTO `sale` VALUES (1,1,'T1',100,1,0),(2,2,'P1',122,1,0),(3,4,'S1',21,1,0),(4,5,'Ślubna',30,-1,0);
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
) ENGINE=InnoDB AUTO_INCREMENT=14 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,'Mateusz','Chochorowski','admin@example.com','admin','$2a$10$UOBujPQuCzaeCC5ok1lCIuLQ4lAn0PvYgv91bCNcKE6eNPsQkseFS','4046f48c-a02e-4680-9b3c-0c536cea0adc',NULL,'ADMIN','2026-03-25 15:08:36',1),(5,'Adam','Kowalski','an@gmail.com','AKowal','$2a$10$N5B5xCSXbYM1.L14/Dy8TOq6XmC5uJIY.u2i3DjliCyDSfFRR/Tiq','216c5ddf-666e-47f5-90c3-eec37c437897',NULL,'ADMIN','2026-04-08 08:53:14',1),(7,'Q','Q','Q@q.q','Q','$2a$10$wUJr39H3JdXbcV7aBJ.0TeTJ73HizpQEmlfJA9XMlXw1kBTwvRjqG','780c43fd-1f59-41ac-aed9-59abfb68d627',NULL,'USER','2026-04-08 09:40:47',0),(11,'Adam','Kowalski','admin@gmail.com','adm','$2a$10$sS4Te9WEyKCL2BY0ESBT0edfHIUNbuXlyNC1L7qfWJV.eWYndgoAK','06571e84-7541-45e4-9e8b-cf05f8ac9604',NULL,'ADMIN','2026-04-09 15:15:19',1),(12,'Jan','Kowalski','user@gmail.com','usr','$2a$10$Mby6U0S6M08sZdcCrf9aPufSdqK6ktKidwgdWwFQ8SCSMOHxbjOaO','f9acbba7-671b-46d8-8f38-55fb1897bbc2',NULL,'USER','2026-04-09 15:16:00',1),(13,'Adrian','Kowalski','organizator@gmail.com','org','$2a$10$J8T6uDr.arVEmqQTiItMrunLAxG.VPWnUQdHBTDdfcvkIGpwRet0u','7a4301f8-21b7-42b5-ab36-b4d6d0c5dac8',NULL,'ORG','2026-04-09 15:16:24',1);
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
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `wydarzenia`
--

LOCK TABLES `wydarzenia` WRITE;
/*!40000 ALTER TABLE `wydarzenia` DISABLE KEYS */;
INSERT INTO `wydarzenia` VALUES (1,1,1,'WYD','Wydarzenie',1,'TEST','2026-04-08 11:35:51','AKTYWNA','2026-04-24 08:00:00','2026-04-30 08:00:00'),(2,3,4,'AS','asdsa',1,'@@','2026-04-09 14:32:15','A','2026-04-16 08:34:00','2026-04-23 09:41:00'),(3,4,5,'Event','-',1,'-','2026-04-09 15:31:45','AKTYWNY','2026-04-17 08:44:00','2026-07-31 04:00:00');
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

-- Dump completed on 2026-04-09 19:35:06
