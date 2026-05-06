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
-- Table structure for table `bilety`
--

DROP TABLE IF EXISTS `bilety`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `bilety` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `wydarzenie_id` bigint unsigned DEFAULT NULL,
  `klasa` varchar(50) DEFAULT NULL,
  `cena` decimal(38,2) DEFAULT NULL,
  `waluta` varchar(10) DEFAULT NULL,
  `ilosc` int DEFAULT NULL,
  `start_sprzedazy` timestamp NULL DEFAULT NULL,
  `koniec_sprzedazy` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `id` (`id`),
  KEY `wydarzenie_id` (`wydarzenie_id`),
  CONSTRAINT `bilety_ibfk_1` FOREIGN KEY (`wydarzenie_id`) REFERENCES `wydarzenia` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `bilety`
--

LOCK TABLES `bilety` WRITE;
/*!40000 ALTER TABLE `bilety` DISABLE KEYS */;
INSERT INTO `bilety` VALUES (1,4,'VIP',12.00,'PLN',12,'2026-05-01 05:09:00','2026-05-29 08:12:00');
/*!40000 ALTER TABLE `bilety` ENABLE KEYS */;
UNLOCK TABLES;

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
  `created_by_user_id` bigint DEFAULT NULL,
  `systemowa` bit(1) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `id` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `kategorie`
--

LOCK TABLES `kategorie` WRITE;
/*!40000 ALTER TABLE `kategorie` DISABLE KEYS */;
INSERT INTO `kategorie` VALUES (1,'Sport','X',NULL,_binary '');
/*!40000 ALTER TABLE `kategorie` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `login_logs`
--

DROP TABLE IF EXISTS `login_logs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `login_logs` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `device_info` varchar(255) DEFAULT NULL,
  `location` varchar(100) DEFAULT NULL,
  `login_time` datetime(6) NOT NULL,
  `status` varchar(50) NOT NULL,
  `user_id` bigint NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=23 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `login_logs`
--

LOCK TABLES `login_logs` WRITE;
/*!40000 ALTER TABLE `login_logs` DISABLE KEYS */;
INSERT INTO `login_logs` VALUES (1,'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36 OPR/130.0.0.0','Nieznana lokalizacja','2026-05-06 16:25:45.102956','NIEUDANE_HASLO_LUB_LOGIN',20),(2,'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36 OPR/130.0.0.0','Nieznana lokalizacja','2026-05-06 16:25:47.910600','SUKCES',20),(3,'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36 OPR/130.0.0.0','Nieznana lokalizacja','2026-05-06 16:26:48.769969','SUKCES',19),(4,'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36 OPR/130.0.0.0','Nieznana lokalizacja','2026-05-06 16:28:51.188612','SUKCES',19),(5,'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36 OPR/130.0.0.0','Nieznana lokalizacja','2026-05-06 16:33:24.592882','SUKCES',1),(6,'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36 OPR/130.0.0.0','Nieznana lokalizacja','2026-05-06 16:34:39.678890','SUKCES',1),(7,'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36 OPR/130.0.0.0','Nieznana lokalizacja','2026-05-06 16:34:44.734562','SUKCES',1),(8,'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36 OPR/130.0.0.0','Nieznana lokalizacja','2026-05-06 16:38:21.354307','SUKCES',1),(9,'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36 OPR/130.0.0.0','Nieznana lokalizacja','2026-05-06 16:38:27.220411','SUKCES',1),(10,'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36 OPR/130.0.0.0','Nieznana lokalizacja','2026-05-06 16:41:02.172520','SUKCES',1),(11,'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36 OPR/130.0.0.0','Nieznana lokalizacja','2026-05-06 16:48:42.400132','NIEUDANE_HASLO_LUB_LOGIN',1),(12,'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36 OPR/130.0.0.0','Nieznana lokalizacja','2026-05-06 16:48:46.864405','SUKCES',1),(13,'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36 OPR/130.0.0.0','Nieznana lokalizacja','2026-05-06 16:54:28.960156','SUKCES',1),(14,'Opera / Windows','Nieznana lokalizacja','2026-05-06 16:54:58.759609','SUKCES',1),(15,'Opera / Windows','Lokalnie','2026-05-06 17:00:26.211435','SUKCES',1),(16,'Opera / Windows','Lokalnie','2026-05-06 17:00:41.491720','SUKCES',20),(17,'Opera / Windows','Lokalnie','2026-05-06 17:00:50.671464','SUKCES',19),(18,'Opera / Windows','Lokalnie','2026-05-06 17:01:00.416582','SUKCES',19),(19,'Opera / Windows','Lokalnie','2026-05-06 17:01:02.574440','SUKCES',19),(20,'Opera / Windows','Lokalnie','2026-05-06 17:01:05.146586','SUKCES',19),(21,'Opera / Windows','Lokalnie','2026-05-06 17:01:11.279900','SUKCES',20),(22,'Opera / Windows','Lokalnie','2026-05-06 17:07:35.658078','SUKCES',20);
/*!40000 ALTER TABLE `login_logs` ENABLE KEYS */;
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
  `opis` text,
  `user_id` bigint NOT NULL,
  `ilosc_sal` int DEFAULT NULL,
  `pojemnosc` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `id` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `miejsca`
--

LOCK TABLES `miejsca` WRITE;
/*!40000 ALTER TABLE `miejsca` DISABLE KEYS */;
INSERT INTO `miejsca` VALUES (1,'TEST','Polska','Gdańsk','Jana 13','33 364','TEST',6,NULL,NULL),(2,'T2','Polska','Tarnów','Pawła13','33 840','test',8,NULL,NULL),(3,'3','Polska','A','A','A','A',8,NULL,NULL),(4,'A','Polska','S','D','2323','2e',10,NULL,NULL),(5,'Vegas','Polska','Stary Sącz','Stara 15','33-340','Budynek',13,NULL,NULL),(6,'Wydarzenie','Polska','Łódź','Mała 63','44 356','Testowe wydarzenie',15,3,NULL);
/*!40000 ALTER TABLE `miejsca` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `opinie`
--

DROP TABLE IF EXISTS `opinie`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `opinie` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `data` datetime(6) DEFAULT NULL,
  `ocena` int DEFAULT NULL,
  `opis` text,
  `user_id` bigint NOT NULL,
  `wyd_id` bigint NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `opinie`
--

LOCK TABLES `opinie` WRITE;
/*!40000 ALTER TABLE `opinie` DISABLE KEYS */;
INSERT INTO `opinie` VALUES (1,'2026-04-29 15:15:04.939556',5,'test',15,1);
/*!40000 ALTER TABLE `opinie` ENABLE KEYS */;
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
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `organizator`
--

LOCK TABLES `organizator` WRITE;
/*!40000 ALTER TABLE `organizator` DISABLE KEYS */;
INSERT INTO `organizator` VALUES (1,'2026-04-08 11:34:07.635557','asd','null','a.com',6,_binary ''),(2,'2026-04-08 13:50:54.916522','MARBUD','Jakieś tam','www.google.com',8,_binary ''),(3,'2026-04-09 16:29:58.015035','A','A','A',10,_binary ''),(4,'2026-04-09 17:20:58.824777','Fakro','Niskie','8.8.8.8',13,_binary ''),(5,'2026-04-26 11:50:16.242915','ASD','ASD','ASD',15,_binary ''),(6,'2026-05-01 10:49:56.850262','ASDAS','ASDA','ASDASD',16,_binary '\0'),(8,'2026-05-06 10:29:35.862570','ss','ss','ss',20,_binary '');
/*!40000 ALTER TABLE `organizator` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `personel`
--

DROP TABLE IF EXISTS `personel`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `personel` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `wyd_id` bigint unsigned DEFAULT NULL,
  `user_id` bigint unsigned DEFAULT NULL,
  `rola` varchar(50) DEFAULT NULL,
  `data_zajet` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `id` (`id`),
  KEY `wyd_id` (`wyd_id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `personel_ibfk_1` FOREIGN KEY (`wyd_id`) REFERENCES `wydarzenia` (`id`),
  CONSTRAINT `personel_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `personel`
--

LOCK TABLES `personel` WRITE;
/*!40000 ALTER TABLE `personel` DISABLE KEYS */;
INSERT INTO `personel` VALUES (1,4,16,'ochrona','2026-05-01 08:04:23');
/*!40000 ALTER TABLE `personel` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `platnosci`
--

DROP TABLE IF EXISTS `platnosci`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `platnosci` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `metoda` varchar(50) DEFAULT NULL,
  `data` timestamp NULL DEFAULT NULL,
  `zgodnosc` tinyint(1) DEFAULT NULL,
  `stan` varchar(50) DEFAULT NULL,
  `tranz_id` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `id` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `platnosci`
--

LOCK TABLES `platnosci` WRITE;
/*!40000 ALTER TABLE `platnosci` DISABLE KEYS */;
INSERT INTO `platnosci` VALUES (2,'CHECKBOX','2026-05-01 07:26:58',1,'zakonczona','414603112');
/*!40000 ALTER TABLE `platnosci` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `poz_zam`
--

DROP TABLE IF EXISTS `poz_zam`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `poz_zam` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `bilet_id` bigint NOT NULL,
  `cena` decimal(38,2) DEFAULT NULL,
  `ilosc` int DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `poz_zam`
--

LOCK TABLES `poz_zam` WRITE;
/*!40000 ALTER TABLE `poz_zam` DISABLE KEYS */;
INSERT INTO `poz_zam` VALUES (1,1,12.00,11);
/*!40000 ALTER TABLE `poz_zam` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `pozzam`
--

DROP TABLE IF EXISTS `pozzam`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `pozzam` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `bilet_id` bigint unsigned DEFAULT NULL,
  `ilosc` int DEFAULT NULL,
  `cena` decimal(10,2) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `id` (`id`),
  KEY `bilet_id` (`bilet_id`),
  CONSTRAINT `pozzam_ibfk_1` FOREIGN KEY (`bilet_id`) REFERENCES `bilety` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `pozzam`
--

LOCK TABLES `pozzam` WRITE;
/*!40000 ALTER TABLE `pozzam` DISABLE KEYS */;
/*!40000 ALTER TABLE `pozzam` ENABLE KEYS */;
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
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `sale`
--

LOCK TABLES `sale` WRITE;
/*!40000 ALTER TABLE `sale` DISABLE KEYS */;
INSERT INTO `sale` VALUES (1,1,'T1',100,1,0),(2,2,'P1',122,1,0),(3,4,'S1',21,1,0),(4,5,'Ślubna',30,-1,0),(5,6,'Pietro1',NULL,1,0);
/*!40000 ALTER TABLE `sale` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `uczestnicy_wydarzen`
--

DROP TABLE IF EXISTS `uczestnicy_wydarzen`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `uczestnicy_wydarzen` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `uzytkownik_id` bigint unsigned NOT NULL,
  `wydarzenie_id` bigint unsigned NOT NULL,
  `data_zapisu` datetime DEFAULT CURRENT_TIMESTAMP,
  `status` enum('POTWIERDZONY','LISTA_REZERWOWA') DEFAULT 'POTWIERDZONY',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uzytkownik_id` (`uzytkownik_id`,`wydarzenie_id`),
  KEY `fk_uczestnik_wydarzenie` (`wydarzenie_id`),
  CONSTRAINT `fk_uczestnik_user` FOREIGN KEY (`uzytkownik_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_uczestnik_wydarzenie` FOREIGN KEY (`wydarzenie_id`) REFERENCES `wydarzenia` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `uczestnicy_wydarzen`
--

LOCK TABLES `uczestnicy_wydarzen` WRITE;
/*!40000 ALTER TABLE `uczestnicy_wydarzen` DISABLE KEYS */;
/*!40000 ALTER TABLE `uczestnicy_wydarzen` ENABLE KEYS */;
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
  `email_verified` bit(1) DEFAULT NULL,
  `verification_code` varchar(6) DEFAULT NULL,
  `verification_code_expires_at` datetime(6) DEFAULT NULL,
  `telefon` varchar(255) DEFAULT NULL,
  `two_factor_enabled` bit(1) DEFAULT NULL,
  `two_factor_secret` varchar(128) DEFAULT NULL,
  `two_factor_temp_secret` varchar(128) DEFAULT NULL,
  `session_timeout_enabled` bit(1) NOT NULL,
  `session_timeout_minutes` int NOT NULL,
  `session_expiry_action` varchar(24) NOT NULL,
  `session_warning_minutes` int NOT NULL,
  `session_count_mode` varchar(24) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `id` (`id`),
  UNIQUE KEY `email` (`email`),
  UNIQUE KEY `UK_r43af9ap4edm43mmtq01oddj6` (`login`)
) ENGINE=InnoDB AUTO_INCREMENT=21 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,'Mateusz','Chochorowski','mchochorowski1@gmail.com','admin','$2a$10$UOBujPQuCzaeCC5ok1lCIuLQ4lAn0PvYgv91bCNcKE6eNPsQkseFS','4046f48c-a02e-4680-9b3c-0c536cea0adc',NULL,'ADMIN','2026-03-25 15:08:36',1,_binary '',NULL,NULL,NULL,NULL,NULL,NULL,_binary '\0',0,'',0,''),(5,'Adam','Kowalski','an@gmail.com','AKowal','$2a$10$N5B5xCSXbYM1.L14/Dy8TOq6XmC5uJIY.u2i3DjliCyDSfFRR/Tiq','216c5ddf-666e-47f5-90c3-eec37c437897',NULL,'ADMIN','2026-04-08 08:53:14',1,NULL,NULL,NULL,NULL,NULL,NULL,NULL,_binary '\0',0,'',0,''),(7,'Q','Q','Q@q.q','Q','$2a$10$wUJr39H3JdXbcV7aBJ.0TeTJ73HizpQEmlfJA9XMlXw1kBTwvRjqG','780c43fd-1f59-41ac-aed9-59abfb68d627',NULL,'USER','2026-04-08 09:40:47',0,NULL,NULL,NULL,NULL,NULL,NULL,NULL,_binary '\0',0,'',0,''),(11,'Adam','Kowalski','admin@gmail.com','adm','$2a$10$sS4Te9WEyKCL2BY0ESBT0edfHIUNbuXlyNC1L7qfWJV.eWYndgoAK','06571e84-7541-45e4-9e8b-cf05f8ac9604',NULL,'ADMIN','2026-04-09 15:15:19',1,_binary '',NULL,NULL,NULL,NULL,NULL,NULL,_binary '\0',0,'',0,''),(12,'Jan','Kowalski','user@gmail.com','usr','$2a$10$Mby6U0S6M08sZdcCrf9aPufSdqK6ktKidwgdWwFQ8SCSMOHxbjOaO','f9acbba7-671b-46d8-8f38-55fb1897bbc2',NULL,'USER','2026-04-09 15:16:00',1,_binary '',NULL,NULL,NULL,NULL,NULL,NULL,_binary '\0',0,'',0,''),(13,'Adrian','Kowalski','organizator@gmail.com','org','$2a$10$J8T6uDr.arVEmqQTiItMrunLAxG.VPWnUQdHBTDdfcvkIGpwRet0u','7a4301f8-21b7-42b5-ab36-b4d6d0c5dac8',NULL,'ORG','2026-04-09 15:16:24',1,_binary '',NULL,NULL,NULL,NULL,NULL,NULL,_binary '\0',0,'',0,''),(15,'t','t','a@fes.s','usr1','$2a$10$eAV4oMI/U52wlE/ckDCuaO/EK32lg85PhDn8ydZMbAJ15S0RDlXIu','YGTS4BJFXP4PCJR8XCY7JEP35HKUPKCY',NULL,'ORG','2026-04-26 09:45:30',1,_binary '','U79DQY','2026-04-26 12:00:30.410438',NULL,NULL,NULL,NULL,_binary '\0',0,'',0,''),(16,'t','t','ae@fes.s','usr2','$2a$10$yXGYO/Nhzf0g.DbLR95owOSGJl7bAMQQF4tI.daf1jZREOICWXj9y','HGF872XKFS63HAT9YUNXUEHZFFFR2NXV',NULL,'USER','2026-04-26 09:45:54',1,_binary '','L8BQT8','2026-04-26 12:00:53.923952',NULL,NULL,NULL,NULL,_binary '\0',0,'',0,''),(19,'Mateusz','Chochorowski','mchochorowski2@gmail.com','user2','$2a$10$SynVZRqEhxGv19mzuv7KSOQvNGEBABN9nNRz6B7Evw/pDoBSunzN6','6WBT7UNGUTTCX8SFPMUWAUA5VBWWPDAG',NULL,'USER','2026-05-06 08:28:25',1,_binary '',NULL,NULL,NULL,NULL,NULL,NULL,_binary '',5,'LOCK_SCREEN',0,'ABSOLUTE'),(20,'Marcinnn','Wojnarowski','mchochorowski7@gmail.com','org2','$2a$10$EDM.lduDTUp0ysRX./OteOfIYYBHtTnGfG9FSmgPfORqTXQvqau7e','VLHW224PRXZZACLHEVHTTZJ45MSTB4VW',NULL,'ORG','2026-05-06 08:29:08',1,_binary '',NULL,NULL,'660388373',NULL,NULL,NULL,_binary '',25,'LOCK_SCREEN',0,'ABSOLUTE');
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
  `tytul` varchar(255) DEFAULT NULL,
  `opis` text,
  `kategoria_id` bigint unsigned DEFAULT NULL,
  `rola` varchar(50) DEFAULT NULL,
  `data_utw` timestamp NULL DEFAULT NULL,
  `status` varchar(50) DEFAULT NULL,
  `data_rozp` timestamp NULL DEFAULT NULL,
  `data_zamk` timestamp NULL DEFAULT NULL,
  `sala_id` bigint unsigned NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `id` (`id`),
  KEY `org_id` (`org_id`),
  KEY `kategoria_id` (`kategoria_id`),
  KEY `fk_wydarzenia_sala` (`sala_id`),
  CONSTRAINT `fk_wydarzenia_sala` FOREIGN KEY (`sala_id`) REFERENCES `sale` (`id`),
  CONSTRAINT `wydarzenia_ibfk_1` FOREIGN KEY (`org_id`) REFERENCES `organizator` (`id`),
  CONSTRAINT `wydarzenia_ibfk_3` FOREIGN KEY (`kategoria_id`) REFERENCES `kategorie` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `wydarzenia`
--

LOCK TABLES `wydarzenia` WRITE;
/*!40000 ALTER TABLE `wydarzenia` DISABLE KEYS */;
INSERT INTO `wydarzenia` VALUES (1,1,'WYD','Wydarzenie',1,'TEST','2026-04-08 11:35:51','AKTYWNY','2026-04-24 08:00:00','2026-04-30 08:00:00',1),(2,3,'AS','asdsa',1,'@@','2026-04-09 14:32:15','AKTYWNY','2026-04-16 08:34:00','2026-04-23 09:41:00',3),(3,4,'Event','-',1,'-','2026-04-09 15:31:45','AKTYWNY','2026-04-17 08:44:00','2026-07-31 04:00:00',4),(4,5,'ZZ','ASD',1,'ASASAS','2026-05-01 06:50:52','AKTYWNY','2026-04-30 08:12:00','2026-05-28 08:12:00',5);
/*!40000 ALTER TABLE `wydarzenia` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `wyst_bilety`
--

DROP TABLE IF EXISTS `wyst_bilety`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `wyst_bilety` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `bilet_id` bigint NOT NULL,
  `kod` varchar(255) DEFAULT NULL,
  `stan` varchar(255) DEFAULT NULL,
  `uzyty_data` datetime(6) DEFAULT NULL,
  `wydany_data` datetime(6) DEFAULT NULL,
  `zam_id` bigint NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `wyst_bilety`
--

LOCK TABLES `wyst_bilety` WRITE;
/*!40000 ALTER TABLE `wyst_bilety` DISABLE KEYS */;
INSERT INTO `wyst_bilety` VALUES (1,1,'EV-1-0-4253','aktywny',NULL,'2026-05-01 09:26:57.638321',1);
/*!40000 ALTER TABLE `wyst_bilety` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `wystbilety`
--

DROP TABLE IF EXISTS `wystbilety`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `wystbilety` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `zam_id` bigint unsigned DEFAULT NULL,
  `bilet_id` bigint unsigned DEFAULT NULL,
  `stan` varchar(50) DEFAULT NULL,
  `wydany_data` timestamp NULL DEFAULT NULL,
  `uzyty_data` timestamp NULL DEFAULT NULL,
  `kod` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `id` (`id`),
  KEY `zam_id` (`zam_id`),
  KEY `bilet_id` (`bilet_id`),
  CONSTRAINT `wystbilety_ibfk_1` FOREIGN KEY (`zam_id`) REFERENCES `zamowienia` (`id`),
  CONSTRAINT `wystbilety_ibfk_2` FOREIGN KEY (`bilet_id`) REFERENCES `bilety` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `wystbilety`
--

LOCK TABLES `wystbilety` WRITE;
/*!40000 ALTER TABLE `wystbilety` DISABLE KEYS */;
/*!40000 ALTER TABLE `wystbilety` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `zamowienia`
--

DROP TABLE IF EXISTS `zamowienia`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `zamowienia` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `user_id` bigint unsigned DEFAULT NULL,
  `platn_id` bigint unsigned DEFAULT NULL,
  `poz_zam_id` bigint unsigned DEFAULT NULL,
  `data` timestamp NULL DEFAULT NULL,
  `ilosc` int DEFAULT NULL,
  `waluta` varchar(10) DEFAULT NULL,
  `stan` varchar(50) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `id` (`id`),
  KEY `user_id` (`user_id`),
  KEY `platn_id` (`platn_id`),
  KEY `poz_zam_id` (`poz_zam_id`),
  CONSTRAINT `zamowienia_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`),
  CONSTRAINT `zamowienia_ibfk_2` FOREIGN KEY (`platn_id`) REFERENCES `platnosci` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `zamowienia`
--

LOCK TABLES `zamowienia` WRITE;
/*!40000 ALTER TABLE `zamowienia` DISABLE KEYS */;
INSERT INTO `zamowienia` VALUES (1,16,2,1,'2026-05-01 07:26:58',1,'PLN','zakonczone');
/*!40000 ALTER TABLE `zamowienia` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `zgloszenia`
--

DROP TABLE IF EXISTS `zgloszenia`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `zgloszenia` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `opis` text,
  `stan` varchar(255) DEFAULT NULL,
  `tytul` varchar(255) DEFAULT NULL,
  `user_id` bigint NOT NULL,
  `utworzony` datetime(6) DEFAULT NULL,
  `wyd_id` bigint NOT NULL,
  `zamkniety` datetime(6) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `zgloszenia`
--

LOCK TABLES `zgloszenia` WRITE;
/*!40000 ALTER TABLE `zgloszenia` DISABLE KEYS */;
/*!40000 ALTER TABLE `zgloszenia` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `zwroty`
--

DROP TABLE IF EXISTS `zwroty`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `zwroty` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `platn_id` bigint unsigned DEFAULT NULL,
  `kwota` decimal(38,2) DEFAULT NULL,
  `waluta` varchar(10) DEFAULT NULL,
  `powod` text,
  `stan` varchar(50) DEFAULT NULL,
  `otrzymany` tinyint(1) DEFAULT NULL,
  `przyznany` tinyint(1) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `id` (`id`),
  KEY `platn_id` (`platn_id`),
  CONSTRAINT `zwroty_ibfk_1` FOREIGN KEY (`platn_id`) REFERENCES `platnosci` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `zwroty`
--

LOCK TABLES `zwroty` WRITE;
/*!40000 ALTER TABLE `zwroty` DISABLE KEYS */;
/*!40000 ALTER TABLE `zwroty` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-05-06 19:15:22
