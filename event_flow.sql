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
  `seat_ids` text,
  PRIMARY KEY (`id`),
  UNIQUE KEY `id` (`id`),
  KEY `wydarzenie_id` (`wydarzenie_id`),
  CONSTRAINT `bilety_ibfk_1` FOREIGN KEY (`wydarzenie_id`) REFERENCES `wydarzenia` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `bilety`
--

LOCK TABLES `bilety` WRITE;
/*!40000 ALTER TABLE `bilety` DISABLE KEYS */;
INSERT INTO `bilety` VALUES (1,4,'VIP',12.00,'PLN',12,'2026-05-01 05:09:00','2026-05-29 08:12:00',NULL),(2,5,'VIP',35.00,'PLN',2,'2026-05-08 08:22:00','2026-05-29 08:22:00','seat-1778334731594,seat-1778334724477'),(3,5,'Standard',15.00,'PLN',2,'2026-05-08 08:00:00','2026-05-29 08:22:00','seat-1778334750246,seat-1778334756379');
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
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `kategorie`
--

LOCK TABLES `kategorie` WRITE;
/*!40000 ALTER TABLE `kategorie` DISABLE KEYS */;
INSERT INTO `kategorie` VALUES (1,'Sport','X',NULL,_binary ''),(2,'Koncert','Kat_opis_test',15,_binary '\0'),(3,'Koncert','Dobra muzyka, głośne nagłośnienie i fani śpiewający pod sceną. Od klubowych gigów po wielkie festiwale.',1,_binary '');
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
) ENGINE=InnoDB AUTO_INCREMENT=70 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `login_logs`
--

LOCK TABLES `login_logs` WRITE;
/*!40000 ALTER TABLE `login_logs` DISABLE KEYS */;
INSERT INTO `login_logs` VALUES (1,'Firefox / Windows','Lokalnie','2026-05-09 10:13:25.511760','SUKCES',15),(2,'Firefox / Windows','Lokalnie','2026-05-09 10:20:26.209830','SUKCES',16),(3,'Firefox / Windows','Lokalnie','2026-05-09 10:25:29.849772','SUKCES',15),(4,'Firefox / Windows','Lokalnie','2026-05-09 11:08:02.587190','SUKCES',16),(5,'Firefox / Windows','Lokalnie','2026-05-09 12:00:56.610950','SUKCES',15),(6,'Firefox / Windows','Lokalnie','2026-05-09 13:51:44.074799','SUKCES',15),(7,'Firefox / Windows','Lokalnie','2026-05-09 14:09:41.648283','SUKCES',16),(8,'Firefox / Windows','Lokalnie','2026-05-09 14:36:14.543301','SUKCES',15),(9,'Opera / Windows','Lokalnie','2026-05-13 11:47:16.572186','SUKCES',1),(10,'Opera / Windows','Lokalnie','2026-05-13 11:49:25.661128','SUKCES',17),(11,'Opera / Windows','Lokalnie','2026-05-13 11:50:17.947633','SUKCES',18),(12,'Opera / Windows','Lokalnie','2026-05-13 11:50:39.672368','SUKCES',1),(13,'Opera / Windows','Lokalnie','2026-05-13 11:50:55.953926','SUKCES',18),(14,'Opera / Windows','Lokalnie','2026-05-13 11:52:30.254514','SUKCES',1),(15,'Opera / Windows','Lokalnie','2026-05-13 11:52:47.071599','SUKCES',17),(16,'Opera / Windows','Lokalnie','2026-05-13 11:52:53.138256','SUKCES',18),(17,'Opera / Windows','Lokalnie','2026-05-13 11:55:23.184283','SUKCES',1),(18,'Opera / Windows','Lokalnie','2026-05-13 11:55:34.236274','SUKCES',17),(19,'Opera / Windows','Lokalnie','2026-05-13 12:26:59.985468','SUKCES',1),(20,'Opera / Windows','Lokalnie','2026-05-13 12:30:08.914037','SUKCES',17),(21,'Opera / Windows','Lokalnie','2026-05-13 12:30:37.973379','SUKCES',1),(22,'Opera / Windows','Lokalnie','2026-05-13 12:36:25.485021','NIEUDANE_HASLO_LUB_LOGIN',17),(23,'Opera / Windows','Lokalnie','2026-05-13 12:36:36.051851','NIEUDANE_HASLO_LUB_LOGIN',17),(24,'Opera / Windows','Lokalnie','2026-05-13 12:37:38.740716','NIEUDANE_HASLO_LUB_LOGIN',17),(25,'Opera / Windows','Lokalnie','2026-05-13 12:37:43.799669','NIEUDANE_HASLO_LUB_LOGIN',18),(26,'Opera / Windows','Lokalnie','2026-05-13 12:37:53.383409','SUKCES',1),(27,'Opera / Windows','Lokalnie','2026-05-13 12:40:16.159297','NIEUDANE_HASLO_LUB_LOGIN',17),(28,'Opera / Windows','Lokalnie','2026-05-13 12:40:36.692322','SUKCES',17),(29,'Opera / Windows','Lokalnie','2026-05-13 12:47:21.326386','SUKCES',17),(30,'Opera / Windows','Lokalnie','2026-05-13 12:47:38.855235','SUKCES',1),(31,'Opera / Windows','Lokalnie','2026-05-13 12:50:32.382972','SUKCES',18),(32,'Opera / Windows','Lokalnie','2026-05-13 12:52:16.629501','SUKCES',1),(33,'Opera / Windows','Lokalnie','2026-05-13 12:53:50.586938','NIEUDANE_HASLO_LUB_LOGIN',17),(34,'Opera / Windows','Lokalnie','2026-05-13 12:53:55.443394','SUKCES',17),(35,'Opera / Windows','Lokalnie','2026-05-13 12:54:02.503885','SUKCES',1),(36,'Opera / Windows','Lokalnie','2026-05-13 12:54:12.514526','SUKCES',17),(37,'Opera / Windows','Lokalnie','2026-05-13 12:54:42.114808','SUKCES',1),(38,'Opera / Windows','Lokalnie','2026-05-13 13:11:49.156271','SUKCES',18),(39,'Opera / Windows','Lokalnie','2026-05-13 13:12:14.473974','SUKCES',17),(40,'Opera / Windows','Lokalnie','2026-05-13 13:12:25.558907','SUKCES',1),(41,'Opera / Windows','Lokalnie','2026-05-13 13:13:35.694903','ZABLOKOWANO_BRAK_WERYFIKACJI_EMAIL',5),(42,'Opera / Windows','Lokalnie','2026-05-13 13:13:55.634160','SUKCES',5),(43,'Opera / Windows','Lokalnie','2026-05-13 13:23:02.523656','SUKCES',18),(44,'Opera / Windows','Lokalnie','2026-05-13 13:23:23.370438','SUKCES',17),(45,'Opera / Windows','Lokalnie','2026-05-13 13:23:40.034917','SUKCES',1),(46,'Opera / Windows','Lokalnie','2026-05-13 14:20:09.695030','NIEUDANE_HASLO_LUB_LOGIN',17),(47,'Opera / Windows','Lokalnie','2026-05-13 14:20:11.677335','NIEUDANE_HASLO_LUB_LOGIN',17),(48,'Opera / Windows','Lokalnie','2026-05-13 14:20:19.662152','SUKCES',17),(49,'Opera / Windows','Lokalnie','2026-05-13 14:22:09.691230','SUKCES',18),(50,'Opera / Windows','Lokalnie','2026-05-13 14:24:25.683738','SUKCES',1),(51,'Opera / Windows','Lokalnie','2026-05-13 14:30:13.345532','SUKCES',17),(52,'Opera / Windows','Lokalnie','2026-05-13 14:30:20.042159','SUKCES',1),(53,'Opera / Windows','Lokalnie','2026-05-13 14:31:56.906092','NIEUDANE_HASLO_LUB_LOGIN',17),(54,'Opera / Windows','Lokalnie','2026-05-13 14:31:58.647797','SUKCES',17),(55,'Opera / Windows','Lokalnie','2026-05-13 14:32:16.911883','SUKCES',17),(56,'Opera / Windows','Lokalnie','2026-05-13 14:32:20.666894','SUKCES',1),(57,'Opera / Windows','Lokalnie','2026-05-13 14:33:09.185954','SUKCES',1),(58,'Opera / Windows','Lokalnie','2026-05-13 14:35:30.602873','SUKCES',17),(59,'Opera / Windows','Lokalnie','2026-05-13 14:37:53.861085','SUKCES',17),(60,'Opera / Windows','Lokalnie','2026-05-13 14:38:01.567809','SUKCES',1),(61,'Opera / Windows','Lokalnie','2026-05-13 14:39:06.399798','SUKCES',17),(62,'Opera / Windows','Lokalnie','2026-05-13 14:39:15.433931','SUKCES',1),(63,'Opera / Windows','Lokalnie','2026-05-13 16:31:33.952496','SUKCES',1),(64,'Opera / Windows','Lokalnie','2026-05-13 16:58:40.196900','SUKCES',17),(65,'Opera / Windows','Lokalnie','2026-05-13 17:01:25.479101','SUKCES',17),(66,'Opera / Windows','Lokalnie','2026-05-13 17:51:49.453299','SUKCES',17),(67,'Opera / Windows','Lokalnie','2026-05-13 17:54:27.842525','SUKCES',1),(68,'Opera / Windows','Lokalnie','2026-05-13 21:07:52.460913','SUKCES',1),(69,'Opera / Windows','Lokalnie','2026-05-13 21:20:43.024612','SUKCES',1);
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
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `miejsca`
--

LOCK TABLES `miejsca` WRITE;
/*!40000 ALTER TABLE `miejsca` DISABLE KEYS */;
INSERT INTO `miejsca` VALUES (1,'TEST','Polska','Gdańsk','Jana 13','33 364','TEST',6,NULL,NULL),(2,'T2','Polska','Tarnów','Pawła13','33 840','test',8,NULL,NULL),(3,'3','Polska','A','A','A','A',8,NULL,NULL),(4,'A','Polska','S','D','2323','2e',10,NULL,NULL),(5,'Vegas','Polska','Stary Sącz','Stara 15','33-340','Budynek',13,NULL,NULL),(6,'Wydarzenie','Polska','Łódź','Mała 63','44 356','Testowe wydarzenie',15,3,NULL),(7,'nowe miejsce','Polska','nowy sacz','jakas','33-386','opis sali',18,13,NULL);
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
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `organizator`
--

LOCK TABLES `organizator` WRITE;
/*!40000 ALTER TABLE `organizator` DISABLE KEYS */;
INSERT INTO `organizator` VALUES (1,'2026-04-08 11:34:07.635557','asd','null','a.com',6,_binary ''),(2,'2026-04-08 13:50:54.916522','MARBUD','Jakieś tam','www.google.com',8,_binary ''),(3,'2026-04-09 16:29:58.015035','A','A','A',10,_binary ''),(4,'2026-04-09 17:20:58.824777','Fakro','Niskie','8.8.8.8',13,_binary ''),(5,'2026-04-26 11:50:16.242915','ASD','ASD','ASD',15,_binary ''),(6,'2026-05-01 10:49:56.850262','ASDAS','ASDA','ASDASD',16,_binary '\0'),(7,'2026-05-13 11:50:28.878738','ss','ss','ss',18,_binary '');
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
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `poz_zam`
--

LOCK TABLES `poz_zam` WRITE;
/*!40000 ALTER TABLE `poz_zam` DISABLE KEYS */;
INSERT INTO `poz_zam` VALUES (1,1,12.00,11),(2,2,35.00,2),(3,3,15.00,2);
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
  `plan_json` text,
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
INSERT INTO `sale` VALUES (1,1,'T1',100,1,1,NULL),(2,2,'P1',122,1,1,NULL),(3,4,'S1',21,1,1,NULL),(4,5,'Ślubna',30,-1,1,NULL),(5,6,'Pietro1',10,1,1,'{\"seats\":[{\"id\":\"seat-1778324618366\",\"x\":325,\"y\":82,\"rotation\":0},{\"id\":\"seat-1778324629663\",\"x\":426,\"y\":37,\"rotation\":0},{\"id\":\"seat-1778324633711\",\"x\":212,\"y\":114,\"rotation\":0},{\"id\":\"seat-1778324635919\",\"x\":431,\"y\":92,\"rotation\":0},{\"id\":\"seat-1778324645298\",\"x\":221,\"y\":275,\"rotation\":0},{\"id\":\"seat-1778324647392\",\"x\":177,\"y\":66,\"rotation\":0},{\"id\":\"seat-1778324649011\",\"x\":107,\"y\":107,\"rotation\":0},{\"id\":\"seat-1778324651116\",\"x\":402,\"y\":58,\"rotation\":90},{\"id\":\"seat-1778324655252\",\"x\":470,\"y\":56,\"rotation\":90},{\"id\":\"seat-1778324659210\",\"x\":481,\"y\":212,\"rotation\":90}]}'),(6,6,'Pietro2',10,2,1,'{\"seats\":[{\"id\":\"seat-1778334713278\",\"x\":644,\"y\":29,\"rotation\":0},{\"id\":\"seat-1778334715559\",\"x\":596,\"y\":27,\"rotation\":0},{\"id\":\"seat-1778334718965\",\"x\":551,\"y\":26,\"rotation\":0},{\"id\":\"seat-1778334724477\",\"x\":504,\"y\":28,\"rotation\":0},{\"id\":\"seat-1778334731594\",\"x\":457,\"y\":28,\"rotation\":0},{\"id\":\"seat-1778334734045\",\"x\":644,\"y\":64,\"rotation\":0},{\"id\":\"seat-1778334738826\",\"x\":594,\"y\":64,\"rotation\":0},{\"id\":\"seat-1778334744476\",\"x\":551,\"y\":62,\"rotation\":0},{\"id\":\"seat-1778334750246\",\"x\":504,\"y\":61,\"rotation\":0},{\"id\":\"seat-1778334756379\",\"x\":458,\"y\":62,\"rotation\":0}]}');
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
) ENGINE=InnoDB AUTO_INCREMENT=57 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
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
  `category` enum('BRUTE_FORCE_ATTACK','SUSPICIOUS_LOGIN','USER_FLAGGED_LOG','OTHER') NOT NULL,
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
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `security_tickets`
--

LOCK TABLES `security_tickets` WRITE;
/*!40000 ALTER TABLE `security_tickets` DISABLE KEYS */;
/*!40000 ALTER TABLE `security_tickets` ENABLE KEYS */;
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
  `session_count_mode` varchar(24) NOT NULL,
  `session_expiry_action` varchar(24) NOT NULL,
  `session_timeout_enabled` bit(1) NOT NULL,
  `session_timeout_minutes` int NOT NULL,
  `session_warning_minutes` int NOT NULL,
  `telefon` varchar(255) DEFAULT NULL,
  `two_factor_enabled` bit(1) DEFAULT NULL,
  `two_factor_secret` varchar(128) DEFAULT NULL,
  `two_factor_temp_secret` varchar(128) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `id` (`id`),
  UNIQUE KEY `email` (`email`),
  UNIQUE KEY `UK_r43af9ap4edm43mmtq01oddj6` (`login`),
  UNIQUE KEY `UK_9edtej9p4mjytxr91dkw14v7n` (`telefon`)
) ENGINE=InnoDB AUTO_INCREMENT=19 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,'Mateusz','Chochorowski','mchochorowski1@gmail.com','admin','$2a$10$UOBujPQuCzaeCC5ok1lCIuLQ4lAn0PvYgv91bCNcKE6eNPsQkseFS','4046f48c-a02e-4680-9b3c-0c536cea0adc',NULL,'ADMIN','2026-03-25 15:08:36',1,_binary '',NULL,NULL,'','',_binary '\0',0,0,NULL,NULL,NULL,NULL),(5,'Adam','Kowalski','an@gmail.com','AKowal','$2a$10$N5B5xCSXbYM1.L14/Dy8TOq6XmC5uJIY.u2i3DjliCyDSfFRR/Tiq','216c5ddf-666e-47f5-90c3-eec37c437897',NULL,'ADMIN','2026-04-08 08:53:14',1,_binary '',NULL,NULL,'','',_binary '\0',0,0,NULL,NULL,NULL,NULL),(7,'Q','Q','Q@q.q','Q','$2a$10$wUJr39H3JdXbcV7aBJ.0TeTJ73HizpQEmlfJA9XMlXw1kBTwvRjqG','780c43fd-1f59-41ac-aed9-59abfb68d627',NULL,'USER','2026-04-08 09:40:47',0,NULL,NULL,NULL,'','',_binary '\0',0,0,NULL,NULL,NULL,NULL),(11,'Adam','Kowalski','admin@gmail.com','adm','$2a$10$sS4Te9WEyKCL2BY0ESBT0edfHIUNbuXlyNC1L7qfWJV.eWYndgoAK','06571e84-7541-45e4-9e8b-cf05f8ac9604',NULL,'ADMIN','2026-04-09 15:15:19',1,_binary '',NULL,NULL,'','',_binary '\0',0,0,NULL,NULL,NULL,NULL),(12,'Jan','Kowalski','user@gmail.com','usr','$2a$10$Mby6U0S6M08sZdcCrf9aPufSdqK6ktKidwgdWwFQ8SCSMOHxbjOaO','f9acbba7-671b-46d8-8f38-55fb1897bbc2',NULL,'USER','2026-04-09 15:16:00',1,_binary '',NULL,NULL,'','',_binary '\0',0,0,NULL,NULL,NULL,NULL),(13,'Adrian','Kowalski','organizator@gmail.com','org','$2a$10$J8T6uDr.arVEmqQTiItMrunLAxG.VPWnUQdHBTDdfcvkIGpwRet0u','7a4301f8-21b7-42b5-ab36-b4d6d0c5dac8',NULL,'ORG','2026-04-09 15:16:24',1,_binary '',NULL,NULL,'','',_binary '\0',0,0,NULL,NULL,NULL,NULL),(15,'t','t','a@fes.s','usr1','$2a$10$eAV4oMI/U52wlE/ckDCuaO/EK32lg85PhDn8ydZMbAJ15S0RDlXIu','YGTS4BJFXP4PCJR8XCY7JEP35HKUPKCY',NULL,'ORG','2026-04-26 09:45:30',1,_binary '','U79DQY','2026-04-26 12:00:30.410438','','',_binary '\0',0,0,NULL,NULL,NULL,NULL),(16,'t','t','ae@fes.s','usr2','$2a$10$yXGYO/Nhzf0g.DbLR95owOSGJl7bAMQQF4tI.daf1jZREOICWXj9y','HGF872XKFS63HAT9YUNXUEHZFFFR2NXV',NULL,'USER','2026-04-26 09:45:54',1,_binary '','L8BQT8','2026-04-26 12:00:53.923952','','',_binary '\0',0,0,NULL,NULL,NULL,NULL),(17,'Mateusz','Chochorowski','mchochorowski2@gmail.com','user2','$2a$10$Me0GEoAu5qgNN3RALvteoeBIWUVs4SzgKSaMyqMqD4ZbIPm4gt89i','GK5SCMG8VTC3AYSRE2DFUDDXGFXL7XKE',NULL,'USER','2026-05-13 09:48:55',1,_binary '',NULL,NULL,'RELATIVE','LOGOUT',_binary '',30,1,NULL,_binary '\0',NULL,NULL),(18,'Marcin','Wojnarowski','mchochorowski7@gmail.com','org2','$2a$10$mKJX2ABEL6yaLSzgsrftqud6k/..fHuzRHh4as/guifEReDfthKLW','X4NPGQ7GY5ST46HGW8D59WGGTKTTEU8Q',NULL,'ORG','2026-05-13 09:49:45',1,_binary '',NULL,NULL,'RELATIVE','LOGOUT',_binary '',30,1,NULL,_binary '\0',NULL,NULL);
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
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `wydarzenia`
--

LOCK TABLES `wydarzenia` WRITE;
/*!40000 ALTER TABLE `wydarzenia` DISABLE KEYS */;
INSERT INTO `wydarzenia` VALUES (1,1,'WYD','Wydarzenie',1,'TEST','2026-04-08 11:35:51','AKTYWNY','2026-04-24 08:00:00','2026-04-30 08:00:00',1),(2,3,'AS','asdsa',1,'@@','2026-04-09 14:32:15','AKTYWNY','2026-04-16 08:34:00','2026-04-23 09:41:00',3),(3,4,'Event','-',1,'-','2026-04-09 15:31:45','AKTYWNY','2026-04-17 08:44:00','2026-07-31 04:00:00',4),(4,5,'ZZ','ASD',1,'ASASAS','2026-05-01 06:50:52','AKTYWNY','2026-04-30 08:12:00','2026-05-28 08:12:00',5),(5,5,'Wyd_test0905','Opis_test',2,'Rola_test','2026-05-09 12:07:09','AKTYWNY','2026-05-30 08:22:00','2026-05-31 08:22:00',6);
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
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `wyst_bilety`
--

LOCK TABLES `wyst_bilety` WRITE;
/*!40000 ALTER TABLE `wyst_bilety` DISABLE KEYS */;
INSERT INTO `wyst_bilety` VALUES (1,1,'EV-1-0-4253','aktywny',NULL,'2026-05-01 09:26:57.638321',1,NULL);
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

-- Dump completed on 2026-05-13 23:38:51
