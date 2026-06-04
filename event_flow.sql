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
SET @MYSQLDUMP_TEMP_LOG_BIN = @@SESSION.SQL_LOG_BIN;
SET @@SESSION.SQL_LOG_BIN= 0;

--
-- GTID state at the beginning of the backup 
--

SET @@GLOBAL.GTID_PURGED=/*!80000 '+'*/ '09d8d5f4-2076-11f1-87b7-b42e991066cf:1-865';

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
  `seat_ids` text,
  `kategoria_biletu` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `id` (`id`),
  KEY `wydarzenie_id` (`wydarzenie_id`),
  CONSTRAINT `bilety_ibfk_1` FOREIGN KEY (`wydarzenie_id`) REFERENCES `wydarzenia` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `bilety`
--

LOCK TABLES `bilety` WRITE;
/*!40000 ALTER TABLE `bilety` DISABLE KEYS */;
INSERT INTO `bilety` VALUES (1,4,'VIP',12.00,'PLN',12,'2026-05-01 05:09:00','2026-05-29 08:12:00',NULL,NULL),(2,5,'VIP',35.00,'PLN',2,'2026-05-08 08:22:00','2026-05-29 08:22:00','seat-1778334731594,seat-1778334724477',NULL),(3,5,'Standard',15.00,'PLN',2,'2026-05-08 08:00:00','2026-05-29 08:22:00','seat-1778334750246,seat-1778334756379',NULL),(4,6,'Standard',12.00,'PLN',5,'2026-05-23 08:12:00','2026-06-07 08:12:00','seat-1778324647392,seat-1778324618366,seat-1778324635919,seat-1778324655252,seat-1778324659210','miejscówka');
/*!40000 ALTER TABLE `bilety` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `chat_messages`
--

DROP TABLE IF EXISTS `chat_messages`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `chat_messages` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `content` text NOT NULL,
  `receiver_id` bigint NOT NULL,
  `sender_id` bigint NOT NULL,
  `sent_at` datetime(6) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `chat_messages`
--

LOCK TABLES `chat_messages` WRITE;
/*!40000 ALTER TABLE `chat_messages` DISABLE KEYS */;
INSERT INTO `chat_messages` VALUES (1,'TEST_W',15,16,'2026-05-17 18:23:16.647955'),(2,'TESTW',16,15,'2026-05-17 18:24:02.115776'),(3,'AAA',11,16,'2026-05-17 18:36:40.082569');
/*!40000 ALTER TABLE `chat_messages` ENABLE KEYS */;
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
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `kategorie`
--

LOCK TABLES `kategorie` WRITE;
/*!40000 ALTER TABLE `kategorie` DISABLE KEYS */;
INSERT INTO `kategorie` VALUES (1,'Sport','X',NULL,_binary ''),(2,'Kat_test','Kat_opis_test',15,_binary '\0');
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
) ENGINE=InnoDB AUTO_INCREMENT=52 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `login_logs`
--

LOCK TABLES `login_logs` WRITE;
/*!40000 ALTER TABLE `login_logs` DISABLE KEYS */;
INSERT INTO `login_logs` VALUES (1,'Firefox / Windows','Lokalnie','2026-05-09 10:13:25.511760','SUKCES',15),(2,'Firefox / Windows','Lokalnie','2026-05-09 10:20:26.209830','SUKCES',16),(3,'Firefox / Windows','Lokalnie','2026-05-09 10:25:29.849772','SUKCES',15),(4,'Firefox / Windows','Lokalnie','2026-05-09 11:08:02.587190','SUKCES',16),(5,'Firefox / Windows','Lokalnie','2026-05-09 12:00:56.610950','SUKCES',15),(6,'Firefox / Windows','Lokalnie','2026-05-09 13:51:44.074799','SUKCES',15),(7,'Firefox / Windows','Lokalnie','2026-05-09 14:09:41.648283','SUKCES',16),(8,'Firefox / Windows','Lokalnie','2026-05-09 14:36:14.543301','SUKCES',15),(9,'Firefox / Windows','Lokalnie','2026-05-09 15:01:56.048897','SUKCES',16),(10,'Firefox / Windows','Lokalnie','2026-05-15 12:02:46.867917','SUKCES',16),(11,'Firefox / Windows','Lokalnie','2026-05-15 12:35:56.200079','SUKCES',16),(12,'Firefox / Windows','Lokalnie','2026-05-15 14:49:37.055617','SUKCES',11),(13,'Firefox / Windows','Lokalnie','2026-05-15 14:51:15.622605','SUKCES',16),(14,'Firefox / Windows','Lokalnie','2026-05-15 17:09:51.755633','SUKCES',16),(15,'Firefox / Windows','Lokalnie','2026-05-15 17:36:14.957954','SUKCES',15),(16,'Firefox / Windows','Lokalnie','2026-05-15 18:15:47.887511','SUKCES',16),(17,'Firefox / Windows','Lokalnie','2026-05-17 17:04:04.519957','SUKCES',16),(18,'Firefox / Windows','Lokalnie','2026-05-17 17:24:03.577709','SUKCES',15),(19,'Firefox / Windows','Lokalnie','2026-05-17 17:31:19.715890','SUKCES',16),(20,'Firefox / Windows','Lokalnie','2026-05-17 17:39:38.274076','SUKCES',15),(21,'Firefox / Windows','Lokalnie','2026-05-17 18:00:38.342230','SUKCES',16),(22,'Firefox / Windows','Lokalnie','2026-05-17 18:23:30.261842','SUKCES',16),(23,'Firefox / Windows','Lokalnie','2026-05-17 18:23:47.886895','SUKCES',15),(24,'Firefox / Windows','Lokalnie','2026-05-17 18:24:17.703899','SUKCES',16),(25,'Firefox / Windows','Lokalnie','2026-05-17 18:36:18.696859','SUKCES',11),(26,'Firefox / Windows','Lokalnie','2026-05-17 18:36:35.703109','SUKCES',16),(27,'Firefox / Windows','Lokalnie','2026-05-17 18:36:48.880067','SUKCES',11),(28,'Firefox / Windows','Lokalnie','2026-05-17 18:37:08.702502','SUKCES',15),(29,'Firefox / Windows','Lokalnie','2026-05-23 15:39:38.785636','SUKCES',16),(30,'Firefox / Windows','Lokalnie','2026-05-23 15:45:48.959920','SUKCES',16),(31,'Firefox / Windows','Lokalnie','2026-05-23 15:46:02.167106','SUKCES',15),(32,'Firefox / Windows','Lokalnie','2026-05-23 15:49:52.342178','SUKCES',16),(33,'Firefox / Windows','Lokalnie','2026-05-23 16:53:38.947159','SUKCES',15),(34,'Firefox / Windows','Lokalnie','2026-05-30 10:10:28.066726','SUKCES',15),(35,'Firefox / Windows','Lokalnie','2026-05-30 10:11:16.880204','SUKCES',16),(36,'Firefox / Windows','Lokalnie','2026-05-30 10:12:04.739847','SUKCES',11),(37,'Firefox / Windows','Lokalnie','2026-05-30 10:14:21.000292','SUKCES',16),(38,'Firefox / Windows','Lokalnie','2026-05-30 11:56:47.309435','SUKCES',15),(39,'Firefox / Windows','Lokalnie','2026-05-30 12:40:42.694404','SUKCES',16),(40,'Firefox / Windows','Lokalnie','2026-06-04 09:34:15.516835','SUKCES',16),(41,'Firefox / Windows','Lokalnie','2026-06-04 09:36:03.692262','SUKCES',15),(42,'Firefox / Windows','Lokalnie','2026-06-04 10:34:01.031770','SUKCES',16),(43,'Firefox / Windows','Lokalnie','2026-06-04 11:14:03.115374','SUKCES',11),(44,'Firefox / Windows','Lokalnie','2026-06-04 11:20:25.546420','SUKCES',16),(45,'Firefox / Windows','Lokalnie','2026-06-04 11:34:02.774327','SUKCES',15),(46,'Firefox / Windows','Lokalnie','2026-06-04 11:34:15.894157','SUKCES',15),(47,'Firefox / Windows','Lokalnie','2026-06-04 11:58:36.244440','SUKCES',15),(48,'Firefox / Windows','Lokalnie','2026-06-04 11:59:21.565970','SUKCES',16),(49,'Firefox / Windows','Lokalnie','2026-06-04 12:09:20.526658','SUKCES',15),(50,'Firefox / Windows','Lokalnie','2026-06-04 12:22:36.056935','SUKCES',15),(51,'Firefox / Windows','Lokalnie','2026-06-04 12:30:43.797397','SUKCES',16);
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
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `opinie`
--

LOCK TABLES `opinie` WRITE;
/*!40000 ALTER TABLE `opinie` DISABLE KEYS */;
INSERT INTO `opinie` VALUES (1,'2026-04-29 15:15:04.939556',5,'test',15,1),(2,'2026-06-04 10:43:22.268836',5,'TEST',16,6),(3,'2026-06-04 10:43:27.695429',4,'T2',16,6);
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
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `organizator`
--

LOCK TABLES `organizator` WRITE;
/*!40000 ALTER TABLE `organizator` DISABLE KEYS */;
INSERT INTO `organizator` VALUES (1,'2026-04-08 11:34:07.635557','asd','null','a.com',6,_binary ''),(3,'2026-04-09 16:29:58.015035','A','A','A',10,_binary ''),(4,'2026-04-09 17:20:58.824777','Fakro','Niskie','8.8.8.8',13,_binary ''),(5,'2026-04-26 11:50:16.242915','ASD','ASD','ASD',15,_binary '');
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
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `platnosci`
--

LOCK TABLES `platnosci` WRITE;
/*!40000 ALTER TABLE `platnosci` DISABLE KEYS */;
INSERT INTO `platnosci` VALUES (2,'CHECKBOX','2026-05-01 07:26:58',1,'zakonczona','414603112'),(3,'CHECKBOX','2026-05-15 12:18:04',1,'zakonczona','471598496'),(4,'CHECKBOX','2026-05-15 15:10:06',1,'zakonczona','546069066'),(5,'CHECKBOX','2026-05-30 10:41:02',1,'zakonczona','759617788'),(6,'PORTFEL','2026-05-30 12:02:44',1,'zakonczona','545213524');
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
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `poz_zam`
--

LOCK TABLES `poz_zam` WRITE;
/*!40000 ALTER TABLE `poz_zam` DISABLE KEYS */;
INSERT INTO `poz_zam` VALUES (1,1,12.00,11),(2,2,35.00,1),(3,3,15.00,1),(4,4,12.00,3);
/*!40000 ALTER TABLE `poz_zam` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `sala_miejsca`
--

DROP TABLE IF EXISTS `sala_miejsca`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `sala_miejsca` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `rotation_deg` int NOT NULL,
  `seat_key` varchar(255) NOT NULL,
  `pos_x` int NOT NULL,
  `pos_y` int NOT NULL,
  `sala_id` bigint NOT NULL,
  `base_label` varchar(255) DEFAULT NULL,
  `item_height` int DEFAULT NULL,
  `item_type` varchar(255) NOT NULL,
  `row_label` varchar(255) DEFAULT NULL,
  `item_width` int DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=103 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `sala_miejsca`
--

LOCK TABLES `sala_miejsca` WRITE;
/*!40000 ALTER TABLE `sala_miejsca` DISABLE KEYS */;
INSERT INTO `sala_miejsca` VALUES (82,0,'seat-1778334713278',273,25,6,'seat-1778334713278',NULL,'SEAT',NULL,NULL),(83,0,'seat-1778334715559',231,25,6,'seat-1778334715559',NULL,'SEAT',NULL,NULL),(84,0,'seat-1778334718965',191,25,6,'seat-1778334718965',NULL,'SEAT',NULL,NULL),(85,0,'seat-1778334724477',151,26,6,'seat-1778334724477',NULL,'SEAT',NULL,NULL),(86,0,'seat-1778334731594',112,26,6,'seat-1778334731594',NULL,'SEAT',NULL,NULL),(87,0,'seat-1778334734045',642,69,6,'seat-1778334734045',NULL,'SEAT',NULL,NULL),(88,0,'seat-1778334738826',596,70,6,'seat-1778334738826',NULL,'SEAT',NULL,NULL),(89,0,'seat-1778334744476',550,72,6,'seat-1778334744476',NULL,'SEAT',NULL,NULL),(90,0,'seat-1778334750246',505,72,6,'seat-1778334750246',NULL,'SEAT',NULL,NULL),(91,0,'seat-1778334756379',458,72,6,'seat-1778334756379',NULL,'SEAT',NULL,NULL),(92,0,'row-1779551253920',108,23,6,'row-1779551253920',72,'ROW','A',220),(93,0,'seat-1778324618366',287,101,5,'seat-1778324618366',NULL,'SEAT',NULL,NULL),(94,0,'seat-1778324629663',677,5,5,'seat-1778324629663',NULL,'SEAT',NULL,NULL),(95,0,'seat-1778324633711',675,374,5,'seat-1778324633711',NULL,'SEAT',NULL,NULL),(96,0,'seat-1778324635919',443,115,5,'seat-1778324635919',NULL,'SEAT',NULL,NULL),(97,180,'seat-1778324645298',338,158,5,'seat-1778324645298',NULL,'SEAT',NULL,NULL),(98,0,'seat-1778324647392',7,6,5,'seat-1778324647392',NULL,'SEAT',NULL,NULL),(99,0,'seat-1778324649011',6,370,5,'seat-1778324649011',NULL,'SEAT',NULL,NULL),(100,135,'seat-1778324651116',366,87,5,'seat-1778324651116',NULL,'SEAT',NULL,NULL),(101,90,'seat-1778324655252',481,113,5,'seat-1778324655252',NULL,'SEAT',NULL,NULL),(102,225,'seat-1778324659210',450,180,5,'seat-1778324659210',NULL,'SEAT',NULL,NULL);
/*!40000 ALTER TABLE `sala_miejsca` ENABLE KEYS */;
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
  `plan_json` text,
  `layout_height` int DEFAULT NULL,
  `layout_width` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `id` (`id`),
  KEY `miejsce_id` (`miejsce_id`),
  CONSTRAINT `sale_ibfk_1` FOREIGN KEY (`miejsce_id`) REFERENCES `miejsca` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `sale`
--

LOCK TABLES `sale` WRITE;
/*!40000 ALTER TABLE `sale` DISABLE KEYS */;
INSERT INTO `sale` VALUES (1,1,'T1',100,1,1,NULL,420,720),(2,2,'P1',122,1,1,NULL,420,720),(3,4,'S1',21,1,1,NULL,420,720),(4,5,'Ślubna',30,-1,1,NULL,420,720),(5,6,'Pietro1',10,1,1,'{\"seats\":[{\"id\":\"seat-1778324618366\",\"x\":287,\"y\":101,\"rotation\":0},{\"id\":\"seat-1778324629663\",\"x\":675,\"y\":5,\"rotation\":0},{\"id\":\"seat-1778324633711\",\"x\":675,\"y\":374,\"rotation\":0},{\"id\":\"seat-1778324635919\",\"x\":443,\"y\":115,\"rotation\":0},{\"id\":\"seat-1778324645298\",\"x\":338,\"y\":158,\"rotation\":180},{\"id\":\"seat-1778324647392\",\"x\":7,\"y\":6,\"rotation\":0},{\"id\":\"seat-1778324649011\",\"x\":6,\"y\":370,\"rotation\":0},{\"id\":\"seat-1778324651116\",\"x\":366,\"y\":87,\"rotation\":135},{\"id\":\"seat-1778324655252\",\"x\":481,\"y\":113,\"rotation\":90},{\"id\":\"seat-1778324659210\",\"x\":450,\"y\":180,\"rotation\":135}]}',420,720),(6,6,'Pietro2',10,2,1,'{\"seats\":[{\"id\":\"seat-1778334713278\",\"x\":640,\"y\":26,\"rotation\":0},{\"id\":\"seat-1778334715559\",\"x\":596,\"y\":27,\"rotation\":0},{\"id\":\"seat-1778334718965\",\"x\":551,\"y\":26,\"rotation\":0},{\"id\":\"seat-1778334724477\",\"x\":504,\"y\":28,\"rotation\":0},{\"id\":\"seat-1778334731594\",\"x\":457,\"y\":28,\"rotation\":0},{\"id\":\"seat-1778334734045\",\"x\":642,\"y\":69,\"rotation\":0},{\"id\":\"seat-1778334738826\",\"x\":596,\"y\":70,\"rotation\":0},{\"id\":\"seat-1778334744476\",\"x\":550,\"y\":72,\"rotation\":0},{\"id\":\"seat-1778334750246\",\"x\":505,\"y\":72,\"rotation\":0},{\"id\":\"seat-1778334756379\",\"x\":458,\"y\":74,\"rotation\":0}]}',420,720);
/*!40000 ALTER TABLE `sale` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `security_ticket_audits`
--

DROP TABLE IF EXISTS `security_ticket_audits`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `security_ticket_audits` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `created_at` datetime(6) NOT NULL,
  `message` text NOT NULL,
  `actor_user_id` bigint DEFAULT NULL,
  `ticket_id` bigint NOT NULL,
  PRIMARY KEY (`id`),
  KEY `FK8l3hy6ef7p9vgws6jqre1wwnk` (`ticket_id`),
  CONSTRAINT `FK8l3hy6ef7p9vgws6jqre1wwnk` FOREIGN KEY (`ticket_id`) REFERENCES `security_tickets` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `security_ticket_audits`
--

LOCK TABLES `security_ticket_audits` WRITE;
/*!40000 ALTER TABLE `security_ticket_audits` DISABLE KEYS */;
/*!40000 ALTER TABLE `security_ticket_audits` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `security_tickets`
--

DROP TABLE IF EXISTS `security_tickets`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `security_tickets` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `category` enum('USER_FLAGGED_LOG','OTHER') NOT NULL,
  `created_at` datetime(6) NOT NULL,
  `critical_alert_email_sent` bit(1) NOT NULL,
  `description` text NOT NULL,
  `related_login_log_id` bigint DEFAULT NULL,
  `source` enum('SYSTEM_AUTOMATIC','USER_REPORT') NOT NULL,
  `status` enum('NEW','IN_PROGRESS','RESOLVED','DISMISSED') NOT NULL,
  `updated_at` datetime(6) NOT NULL,
  `affected_user_id` bigint NOT NULL,
  `assigned_admin_id` bigint DEFAULT NULL,
  `reporter_user_id` bigint DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `security_tickets`
--

LOCK TABLES `security_tickets` WRITE;
/*!40000 ALTER TABLE `security_tickets` DISABLE KEYS */;
/*!40000 ALTER TABLE `security_tickets` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user_favorites`
--

DROP TABLE IF EXISTS `user_favorites`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user_favorites` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `created_at` datetime(6) NOT NULL,
  `favorite_user_id` bigint NOT NULL,
  `user_id` bigint NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user_favorites`
--

LOCK TABLES `user_favorites` WRITE;
/*!40000 ALTER TABLE `user_favorites` DISABLE KEYS */;
INSERT INTO `user_favorites` VALUES (1,'2026-05-17 18:22:54.370391',15,16),(2,'2026-05-17 18:23:51.970059',16,15),(3,'2026-05-17 18:24:47.233153',11,16),(4,'2026-05-17 18:36:40.085857',16,11);
/*!40000 ALTER TABLE `user_favorites` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user_notifications`
--

DROP TABLE IF EXISTS `user_notifications`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user_notifications` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `created_at` datetime(6) NOT NULL,
  `message` text NOT NULL,
  `is_read` bit(1) NOT NULL,
  `type` varchar(64) NOT NULL,
  `user_id` bigint NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user_notifications`
--

LOCK TABLES `user_notifications` WRITE;
/*!40000 ALTER TABLE `user_notifications` DISABLE KEYS */;
/*!40000 ALTER TABLE `user_notifications` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user_observed_events`
--

DROP TABLE IF EXISTS `user_observed_events`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user_observed_events` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `created_at` datetime(6) NOT NULL,
  `start_reminder_sent_at` datetime(6) DEFAULT NULL,
  `user_id` bigint NOT NULL,
  `wydarzenie_id` bigint NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UKeq9vvtwpoqg6bg7s4q5wemhlc` (`user_id`,`wydarzenie_id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user_observed_events`
--

LOCK TABLES `user_observed_events` WRITE;
/*!40000 ALTER TABLE `user_observed_events` DISABLE KEYS */;
INSERT INTO `user_observed_events` VALUES (2,'2026-05-30 10:53:39.924119',NULL,16,5);
/*!40000 ALTER TABLE `user_observed_events` ENABLE KEYS */;
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
  `session_count_mode` varchar(24) NOT NULL,
  `session_expiry_action` varchar(24) NOT NULL,
  `session_timeout_enabled` bit(1) NOT NULL,
  `session_timeout_minutes` int NOT NULL,
  `session_warning_minutes` int NOT NULL,
  `telefon` varchar(255) DEFAULT NULL,
  `two_factor_enabled` bit(1) DEFAULT NULL,
  `two_factor_secret` varchar(128) DEFAULT NULL,
  `two_factor_temp_secret` varchar(128) DEFAULT NULL,
  `notify_admin_login` bit(1) NOT NULL,
  `notify_favorite_login` bit(1) NOT NULL,
  `notify_new_event` bit(1) NOT NULL,
  `notify_observed_event_end` bit(1) NOT NULL,
  `notify_observed_event_start` bit(1) NOT NULL,
  `notify_observed_seat_freed` bit(1) NOT NULL,
  `notify_new_organizer_request` bit(1) NOT NULL,
  `notify_new_refund_request` bit(1) NOT NULL,
  `notify_new_security_report` bit(1) NOT NULL,
  `bank_account_number` varchar(32) DEFAULT NULL,
  `wallet_balance` decimal(38,2) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `id` (`id`),
  UNIQUE KEY `email` (`email`),
  UNIQUE KEY `UK_r43af9ap4edm43mmtq01oddj6` (`login`),
  UNIQUE KEY `UK_9edtej9p4mjytxr91dkw14v7n` (`telefon`)
) ENGINE=InnoDB AUTO_INCREMENT=17 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,'Mateusz','Chochorowski','admin@example.com','admin','$2a$10$UOBujPQuCzaeCC5ok1lCIuLQ4lAn0PvYgv91bCNcKE6eNPsQkseFS','4046f48c-a02e-4680-9b3c-0c536cea0adc',NULL,'ADMIN','2026-03-25 15:08:36',1,NULL,NULL,NULL,'','',_binary '\0',0,0,NULL,NULL,NULL,NULL,_binary '\0',_binary '\0',_binary '\0',_binary '\0',_binary '\0',_binary '\0',_binary '\0',_binary '\0',_binary '\0',NULL,NULL),(5,'Adam','Kowalski','an@gmail.com','AKowal','$2a$10$N5B5xCSXbYM1.L14/Dy8TOq6XmC5uJIY.u2i3DjliCyDSfFRR/Tiq','216c5ddf-666e-47f5-90c3-eec37c437897',NULL,'ADMIN','2026-04-08 08:53:14',1,NULL,NULL,NULL,'','',_binary '\0',0,0,NULL,NULL,NULL,NULL,_binary '\0',_binary '\0',_binary '\0',_binary '\0',_binary '\0',_binary '\0',_binary '\0',_binary '\0',_binary '\0',NULL,NULL),(7,'Q','Q','Q@q.q','Q','$2a$10$wUJr39H3JdXbcV7aBJ.0TeTJ73HizpQEmlfJA9XMlXw1kBTwvRjqG','780c43fd-1f59-41ac-aed9-59abfb68d627',NULL,'USER','2026-04-08 09:40:47',0,NULL,NULL,NULL,'','',_binary '\0',0,0,NULL,NULL,NULL,NULL,_binary '\0',_binary '\0',_binary '\0',_binary '\0',_binary '\0',_binary '\0',_binary '\0',_binary '\0',_binary '\0',NULL,NULL),(11,'Adam','Kowalski','admin@gmail.com','adm','$2a$10$sS4Te9WEyKCL2BY0ESBT0edfHIUNbuXlyNC1L7qfWJV.eWYndgoAK','06571e84-7541-45e4-9e8b-cf05f8ac9604',NULL,'ADMIN','2026-04-09 15:15:19',1,_binary '',NULL,NULL,'','',_binary '\0',0,0,NULL,NULL,NULL,NULL,_binary '\0',_binary '\0',_binary '\0',_binary '\0',_binary '\0',_binary '\0',_binary '\0',_binary '\0',_binary '\0',NULL,NULL),(12,'Jan','Kowalski','user@gmail.com','usr','$2a$10$Mby6U0S6M08sZdcCrf9aPufSdqK6ktKidwgdWwFQ8SCSMOHxbjOaO','f9acbba7-671b-46d8-8f38-55fb1897bbc2',NULL,'USER','2026-04-09 15:16:00',1,_binary '',NULL,NULL,'','',_binary '\0',0,0,NULL,NULL,NULL,NULL,_binary '\0',_binary '\0',_binary '\0',_binary '\0',_binary '\0',_binary '\0',_binary '\0',_binary '\0',_binary '\0',NULL,NULL),(13,'Adrian','Kowalski','organizator@gmail.com','org','$2a$10$J8T6uDr.arVEmqQTiItMrunLAxG.VPWnUQdHBTDdfcvkIGpwRet0u','7a4301f8-21b7-42b5-ab36-b4d6d0c5dac8',NULL,'ORG','2026-04-09 15:16:24',1,_binary '',NULL,NULL,'','',_binary '\0',0,0,NULL,NULL,NULL,NULL,_binary '\0',_binary '\0',_binary '\0',_binary '\0',_binary '\0',_binary '\0',_binary '\0',_binary '\0',_binary '\0',NULL,NULL),(15,'t','t','a@fes.s','usr1','$2a$10$eAV4oMI/U52wlE/ckDCuaO/EK32lg85PhDn8ydZMbAJ15S0RDlXIu','YGTS4BJFXP4PCJR8XCY7JEP35HKUPKCY',NULL,'ORG','2026-04-26 09:45:30',1,_binary '','U79DQY','2026-04-26 12:00:30.410438','','',_binary '\0',0,0,NULL,NULL,NULL,NULL,_binary '\0',_binary '\0',_binary '\0',_binary '\0',_binary '\0',_binary '\0',_binary '\0',_binary '\0',_binary '\0',NULL,NULL),(16,'t','t','ae@fes.s','usr2','$2a$10$yXGYO/Nhzf0g.DbLR95owOSGJl7bAMQQF4tI.daf1jZREOICWXj9y','HGF872XKFS63HAT9YUNXUEHZFFFR2NXV','Przelew','USER','2026-04-26 09:45:54',1,_binary '','L8BQT8','2026-04-26 12:00:53.923952','','',_binary '\0',0,0,NULL,NULL,NULL,NULL,_binary '\0',_binary '\0',_binary '\0',_binary '\0',_binary '\0',_binary '\0',_binary '\0',_binary '\0',_binary '\0','1234 1234 1234 1234',38.00);
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
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `wydarzenia`
--

LOCK TABLES `wydarzenia` WRITE;
/*!40000 ALTER TABLE `wydarzenia` DISABLE KEYS */;
INSERT INTO `wydarzenia` VALUES (1,1,'WYD','Wydarzenie',1,'2026-04-08 11:35:51','NIEAKTYWNY','2026-04-24 08:00:00','2026-04-30 08:00:00',1),(2,3,'AS','asdsa',1,'2026-04-09 14:32:15','AKTYWNY','2026-04-16 08:34:00','2026-04-23 09:41:00',3),(3,4,'Event','-',1,'2026-04-09 15:31:45','AKTYWNY','2026-04-17 08:44:00','2026-07-31 04:00:00',4),(4,5,'ZZ','ASD',1,'2026-05-01 06:50:52','AKTYWNY','2026-04-30 08:12:00','2026-05-28 08:12:00',5),(5,5,'Wyd_test0905','Opis_test',2,'2026-05-09 12:07:09','AKTYWNY','2026-05-30 08:22:00','2026-05-31 08:22:00',6),(6,5,'ASASSAS','ASSAWSSAS',2,'2026-05-30 10:34:57','AKTYWNY','2026-05-17 08:12:00','2026-06-07 08:12:00',5);
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
  `seat_id` varchar(255) DEFAULT NULL,
  `qr_code` text,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `wyst_bilety`
--

LOCK TABLES `wyst_bilety` WRITE;
/*!40000 ALTER TABLE `wyst_bilety` DISABLE KEYS */;
INSERT INTO `wyst_bilety` VALUES (1,1,'EV-1-0-4253','aktywny',NULL,'2026-05-01 09:26:57.638321',1,NULL,NULL),(2,3,'EV-2-0-1983','aktywny',NULL,'2026-05-15 14:18:04.294370',2,'seat-1778334750246',NULL),(3,2,'EV-3-0-9307','aktywny',NULL,'2026-05-15 17:10:06.429831',3,'seat-1778334724477','data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAASwAAAEsAQAAAABRBrPYAAABTElEQVR4Xu3ZMXKDMBQE0J9xQekj+CgcTRyNo3AElxQZE+3qCwFJZlx6vnYbW9JTtwOSbds7edp15s+IXfLhbLWWfXDbljZ7E4vKRu/BQvaVJ8lqPSaxuOxVS5EnZ3xPdY/ZXawb1hoi1hNby5NiEuuEYSWnsFdeKQOPWFzWUhkbskcsKDvF96TzrFg6zwZhXMnPg29jQ04ZIQ5FEgvFPJPZYyuLvseG/VYgFpLxVWDowYI9c2OG3wIOJwexcMz82rfhvVCPBBvrgpXkDRGLxnLYEKQyNgQDCLHArGUtPJF5puORoEQsBPMVBrNel3w+GMogsSFiEdmI1ZyFe/gq8IbM2CAWmLEUfhqsDanh+UCsE3bHRzkN8lbwT0PEQjEOuHKoy++GiEVhmCgrPph4BxzwR+/hVwKxcKwFbG8IToN4LphYUPZOxC7piP0AvcfCd0bPHB8AAAAASUVORK5CYII='),(4,4,'EV-4-0-2168','aktywny',NULL,'2026-05-30 12:41:02.256910',4,'seat-1778324618366','data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAASwAAAEsAQAAAABRBrPYAAABQElEQVR4Xu2XsRHCMAxFzVGkZARGYTQzWkbxCJQpOIS/LEeJoaDklP8LnyU9df8sOckveqQx81XEBv05tiQXglNN389SPHsmFhW7wQRVBXaZV8yyCIhFxV7NB8WCi2EL0hoQOwSGKZCF2PEwrQixg2BIt4rLA2JDEAhzoWedC6uIBcUGzfY47ERsUAzMHJKlmqI7RJ7pKq3ic4FYSEwDkdaxCU6iqyGxkNj2x5+m/fd/1jabC8TiYaIfgVTfA5yKaWA90scHsZhY7nMByYxsx+5bhxCLhbkWeMRWAlx3DiEWDNOKSWxIVCx5RR1CLCJ2Q6GqmF0eVtbHwZdGYgExXQn6AmiVog5BsDqEWGRswa3Phal9BPKnQ4iFxNQhfSXQHmJxMdyqHNOe6pAuYkExF3rMLqoZ90wsKPaLiA06EPYGUe7rcb7UB+sAAAAASUVORK5CYII='),(5,4,'EV-5-0-5714','aktywny',NULL,'2026-05-30 14:02:43.976426',5,'seat-1778324659210','data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAASwAAAEsAQAAAABRBrPYAAABRElEQVR4Xu2XMZbDIAxEyUux5R4hR/HR4Gg+So6Q0sW+sJrBGHBSpMwTM4WNpE83T0ghf6JHOGfeSthJX45toekIrvnesldhXrFl98Gd2MWSxKo9kjC/2LOawpIrzrHeCeFX2DRYc4iwmbCtdIokbBIMFVPBnlYpwS5hfrGmitEhh4Q5xQbtd+KYFRbHrBOMFesHf4EOGbSA6IwkzBm27CNBzuEHiwDfhRrQLsK8YkgmZKALItilBqk6RJhPzCo3/FY4JMEuCLAQxt4hwnxhxw5o/SBzEeAjQQnziw2iXazy2hyE+cP6AbCwDxxv2T70TqRDhHnEllK15oCAFTrk3TQozBeGCt8FwAyaOB8ImwFbuQhAxSFcCIX5xxiw0tnl1SHCvGBIlMp2DIDFIf00KMwf1lQx3jEsoy8EYU6xTyTspImwf9qBH/ZD2y1IAAAAAElFTkSuQmCC');
/*!40000 ALTER TABLE `wyst_bilety` ENABLE KEYS */;
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
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `zamowienia`
--

LOCK TABLES `zamowienia` WRITE;
/*!40000 ALTER TABLE `zamowienia` DISABLE KEYS */;
INSERT INTO `zamowienia` VALUES (1,16,2,1,'2026-05-01 07:26:58',1,'PLN','zakonczone'),(2,16,3,3,'2026-05-15 12:18:04',1,'PLN','zakonczone'),(3,16,4,2,'2026-05-15 15:10:06',1,'PLN','zakonczone'),(4,16,5,4,'2026-05-30 10:41:02',1,'PLN','zakonczone'),(5,16,6,4,'2026-05-30 12:02:44',1,'PLN','zakonczone');
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
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `zwroty`
--

LOCK TABLES `zwroty` WRITE;
/*!40000 ALTER TABLE `zwroty` DISABLE KEYS */;
INSERT INTO `zwroty` VALUES (1,2,12.00,'PLN','TEST ZWR','zaakceptowana',1,1),(2,3,15.00,'PLN','TEST','oczekuje',1,0);
/*!40000 ALTER TABLE `zwroty` ENABLE KEYS */;
UNLOCK TABLES;
SET @@SESSION.SQL_LOG_BIN = @MYSQLDUMP_TEMP_LOG_BIN;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-06-04 14:42:36
