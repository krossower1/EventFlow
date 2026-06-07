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
  `kategoria_biletu` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `id` (`id`),
  KEY `wydarzenie_id` (`wydarzenie_id`),
  CONSTRAINT `bilety_ibfk_1` FOREIGN KEY (`wydarzenie_id`) REFERENCES `wydarzenia` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `bilety`
--

LOCK TABLES `bilety` WRITE;
/*!40000 ALTER TABLE `bilety` DISABLE KEYS */;
INSERT INTO `bilety` VALUES (1,4,'VIP',12.00,'PLN',12,'2026-05-01 05:09:00','2026-05-29 08:12:00',NULL,NULL),(2,5,'VIP',35.00,'PLN',2,'2026-05-08 08:22:00','2026-05-29 08:22:00','seat-1778334731594,seat-1778334724477',NULL),(3,5,'Standard',15.00,'PLN',2,'2026-05-08 08:00:00','2026-05-29 08:22:00','seat-1778334750246,seat-1778334756379',NULL),(4,6,'VIP',10.00,'PLN',13,'2004-10-08 04:10:00','2004-10-08 04:15:00',NULL,NULL),(5,7,'VIP',14.00,'PLN',13,'2004-10-08 04:10:00','2004-10-08 04:10:00',NULL,NULL),(6,8,'VIP',13.00,'PLN',13,'2004-10-08 04:10:00','2004-10-08 04:15:00',NULL,NULL),(7,9,'VIP',13.00,'PLN',13,'2026-05-20 17:00:00','2026-05-23 18:00:00',NULL,NULL),(8,10,'VIP',13.00,'PLN',13,'2004-10-08 04:10:00','2004-10-08 04:15:00',NULL,NULL),(9,3,'Standard',13.00,'PLN',13,NULL,NULL,NULL,'miejscówka');
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
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `chat_messages`
--

LOCK TABLES `chat_messages` WRITE;
/*!40000 ALTER TABLE `chat_messages` DISABLE KEYS */;
INSERT INTO `chat_messages` VALUES (1,'TEST_W',15,16,'2026-05-17 18:23:16.647955'),(2,'TESTW',16,15,'2026-05-17 18:24:02.115776'),(3,'AAA',11,16,'2026-05-17 18:36:40.082569'),(4,'siemandero',5,1,'2026-05-18 12:23:58.392951'),(5,'ej',16,17,'2026-06-06 16:36:43.514587'),(6,'widzisz mnie',16,17,'2026-06-06 16:37:11.611868');
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
) ENGINE=InnoDB AUTO_INCREMENT=14 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `kategorie`
--

LOCK TABLES `kategorie` WRITE;
/*!40000 ALTER TABLE `kategorie` DISABLE KEYS */;
INSERT INTO `kategorie` VALUES (1,'Sport','X',NULL,_binary ''),(2,'Kat_test','Kat_opis_test',15,_binary '\0'),(3,'nowa_Kategoria','opis_nowej_kategorii',1,_binary ''),(4,'Muzyka i Koncerty','Koncerty na żywo, festiwale muzyczne, występy klubowe i recitale.',NULL,_binary ''),(5,'Biznes i Technologia','Konferencje, szkolenia, warsztaty IT, targi pracy i panele dyskusyjne.',NULL,_binary ''),(6,'Kultura i Sztuka','Spektakle teatralne, wystawy w galeriach, seanse filmowe i wernisaże.',NULL,_binary ''),(7,'Rozrywka i Stand-up','Występy komediowe, wieczory gier, imprezy tematyczne i biesiady.',NULL,_binary ''),(8,'Edukacja i Nauka','Wykłady otwarte, kursy językowe, webinary oraz warsztaty naukowe.',NULL,_binary ''),(9,'Gastronomia i Kulinaria','Warsztaty gotowania, degustacje win, festiwale food trucków i jarmarki.',NULL,_binary ''),(10,'Zdrowie i Uroda','Targi kosmetyczne, warsztaty jogi, konsultacje medyczne i eventy fitness.',NULL,_binary ''),(11,'Dla Dzieci i Rodzin','Animacje, teatrzyki dla najmłodszych, pikniki rodzinne i warsztaty kreatywne.',NULL,_binary ''),(12,'Podróże i Turystyka','Prelekcje podróżnicze, wycieczki z przewodnikiem, zloty i targi turystyczne.',NULL,_binary ''),(13,'Gry i E-sport','Turnieje gamingowe, premiery gier, konwenty fantastyki i wieczory z planszówkami.',NULL,_binary '');
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
) ENGINE=InnoDB AUTO_INCREMENT=279 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `login_logs`
--

LOCK TABLES `login_logs` WRITE;
/*!40000 ALTER TABLE `login_logs` DISABLE KEYS */;
INSERT INTO `login_logs` VALUES (1,'Firefox / Windows','Lokalnie','2026-05-09 10:13:25.511760','SUKCES',15),(2,'Firefox / Windows','Lokalnie','2026-05-09 10:20:26.209830','SUKCES',16),(3,'Firefox / Windows','Lokalnie','2026-05-09 10:25:29.849772','SUKCES',15),(4,'Firefox / Windows','Lokalnie','2026-05-09 11:08:02.587190','SUKCES',16),(5,'Firefox / Windows','Lokalnie','2026-05-09 12:00:56.610950','SUKCES',15),(6,'Firefox / Windows','Lokalnie','2026-05-09 13:51:44.074799','SUKCES',15),(7,'Firefox / Windows','Lokalnie','2026-05-09 14:09:41.648283','SUKCES',16),(8,'Firefox / Windows','Lokalnie','2026-05-09 14:36:14.543301','SUKCES',15),(9,'Firefox / Windows','Lokalnie','2026-05-09 15:01:56.048897','SUKCES',16),(10,'Firefox / Windows','Lokalnie','2026-05-15 12:02:46.867917','SUKCES',16),(11,'Firefox / Windows','Lokalnie','2026-05-15 12:35:56.200079','SUKCES',16),(12,'Firefox / Windows','Lokalnie','2026-05-15 14:49:37.055617','SUKCES',11),(13,'Firefox / Windows','Lokalnie','2026-05-15 14:51:15.622605','SUKCES',16),(14,'Firefox / Windows','Lokalnie','2026-05-15 17:09:51.755633','SUKCES',16),(15,'Firefox / Windows','Lokalnie','2026-05-15 17:36:14.957954','SUKCES',15),(16,'Firefox / Windows','Lokalnie','2026-05-15 18:15:47.887511','SUKCES',16),(17,'Firefox / Windows','Lokalnie','2026-05-17 17:04:04.519957','SUKCES',16),(18,'Firefox / Windows','Lokalnie','2026-05-17 17:24:03.577709','SUKCES',15),(19,'Firefox / Windows','Lokalnie','2026-05-17 17:31:19.715890','SUKCES',16),(20,'Firefox / Windows','Lokalnie','2026-05-17 17:39:38.274076','SUKCES',15),(21,'Firefox / Windows','Lokalnie','2026-05-17 18:00:38.342230','SUKCES',16),(22,'Firefox / Windows','Lokalnie','2026-05-17 18:23:30.261842','SUKCES',16),(23,'Firefox / Windows','Lokalnie','2026-05-17 18:23:47.886895','SUKCES',15),(24,'Firefox / Windows','Lokalnie','2026-05-17 18:24:17.703899','SUKCES',16),(25,'Firefox / Windows','Lokalnie','2026-05-17 18:36:18.696859','SUKCES',11),(26,'Firefox / Windows','Lokalnie','2026-05-17 18:36:35.703109','SUKCES',16),(27,'Firefox / Windows','Lokalnie','2026-05-17 18:36:48.880067','SUKCES',11),(28,'Firefox / Windows','Lokalnie','2026-05-17 18:37:08.702502','SUKCES',15),(29,'Opera / Windows','Lokalnie','2026-05-18 12:23:36.889062','SUKCES',1),(30,'Chrome / Windows','Lokalnie','2026-05-18 13:51:12.300540','SUKCES',1),(31,'Chrome / Windows','Lokalnie','2026-05-18 13:54:29.290618','SUKCES',1),(32,'Chrome / Windows','Lokalnie','2026-05-18 14:08:27.200387','SUKCES',1),(33,'Opera / Windows','Lokalnie','2026-05-18 14:19:19.262303','SUKCES',1),(34,'Opera / Windows','Lokalnie','2026-05-18 14:21:30.030274','SUKCES',17),(35,'Opera / Windows','Lokalnie','2026-05-18 14:35:27.872165','SUKCES',17),(36,'Opera / Windows','Lokalnie','2026-05-18 14:46:13.446277','SUKCES',1),(37,'Opera / Windows','Lokalnie','2026-05-18 14:46:24.039733','SUKCES',17),(38,'Opera / Windows','Lokalnie','2026-05-18 14:46:46.330285','SUKCES',18),(39,'Chrome / Windows','Lokalnie','2026-05-18 14:47:33.216598','SUKCES',1),(40,'Opera / Windows','Lokalnie','2026-05-18 14:47:57.646570','SUKCES',1),(41,'Opera / Windows','Lokalnie','2026-05-18 14:54:18.680966','SUKCES',17),(42,'Opera / Windows','Lokalnie','2026-05-18 15:01:17.061906','SUKCES',1),(43,'Opera / Windows','Lokalnie','2026-05-18 15:01:23.514652','SUKCES',18),(44,'Opera / Windows','Lokalnie','2026-05-18 15:07:37.508922','SUKCES',1),(45,'Opera / Windows','Lokalnie','2026-05-18 15:07:43.388824','SUKCES',18),(46,'Chrome / Windows','Lokalnie','2026-05-18 15:14:30.910685','SUKCES',18),(47,'Opera / Windows','Lokalnie','2026-05-18 15:16:58.157217','SUKCES',1),(48,'Opera / Windows','Lokalnie','2026-05-18 15:17:57.196490','SUKCES',1),(49,'Chrome / Windows','Lokalnie','2026-05-18 15:27:38.671416','SUKCES',18),(50,'Opera / Windows','Lokalnie','2026-05-18 15:33:10.060897','SUKCES',18),(51,'Chrome / Windows','Lokalnie','2026-05-18 15:33:50.047184','SUKCES',1),(52,'Opera / Windows','Lokalnie','2026-05-18 16:38:00.045683','SUKCES',1),(53,'Opera / Windows','Lokalnie','2026-05-18 17:19:10.542396','SUKCES',17),(54,'Opera / Windows','Lokalnie','2026-05-18 17:21:58.822769','SUKCES',1),(55,'Opera / Windows','Lokalnie','2026-05-18 17:25:52.321150','SUKCES',18),(56,'Opera / Windows','Lokalnie','2026-05-18 17:26:15.023574','SUKCES',1),(57,'Opera / Windows','Lokalnie','2026-05-18 17:26:25.704466','SUKCES',17),(58,'Opera / Windows','Lokalnie','2026-05-18 17:26:56.543688','SUKCES',1),(59,'Opera / Windows','Lokalnie','2026-05-18 17:27:50.711870','SUKCES',17),(60,'Opera / Windows','Lokalnie','2026-05-18 17:28:00.147274','SUKCES',1),(61,'Opera / Windows','Lokalnie','2026-05-18 17:28:11.100184','SUKCES',17),(62,'Opera / Windows','Lokalnie','2026-05-18 17:28:21.497447','SUKCES',1),(63,'Chrome / Windows','Lokalnie','2026-05-18 17:31:26.484283','SUKCES',1),(64,'Opera / Windows','Lokalnie','2026-05-18 17:43:01.483151','SUKCES',1),(65,'Opera / Windows','Lokalnie','2026-05-18 18:13:43.370381','SUKCES',1),(66,'Opera / Windows','Lokalnie','2026-05-18 18:21:17.016044','SUKCES',1),(67,'Opera / Windows','Lokalnie','2026-05-18 18:22:06.849463','SUKCES',1),(68,'Opera / Windows','Lokalnie','2026-05-18 18:46:56.512451','SUKCES',1),(69,'Opera / Windows','Lokalnie','2026-05-18 18:50:48.684015','SUKCES',17),(70,'Chrome / Windows','Lokalnie','2026-05-18 18:52:54.527225','SUKCES',17),(71,'Opera / Windows','Lokalnie','2026-05-18 19:03:46.403480','SUKCES',18),(72,'Chrome / Windows','Lokalnie','2026-05-18 19:33:29.948589','SUKCES',17),(73,'Chrome / Windows','Lokalnie','2026-05-18 19:34:22.547160','SUKCES',18),(74,'Opera / Windows','Lokalnie','2026-05-18 20:51:55.943035','SUKCES',18),(75,'Opera / Windows','Lokalnie','2026-05-18 21:03:08.984173','NIEUDANE_HASLO_LUB_LOGIN',13),(76,'Opera / Windows','Lokalnie','2026-05-18 21:03:10.358631','SUKCES',13),(77,'Opera / Windows','Lokalnie','2026-05-18 21:19:13.579455','SUKCES',17),(78,'Chrome / Windows','Lokalnie','2026-05-18 21:19:32.131509','SUKCES',17),(79,'Opera / Windows','Lokalnie','2026-05-18 21:26:16.547892','SUKCES',13),(80,'Opera / Windows','Lokalnie','2026-05-18 21:27:13.588118','SUKCES',17),(81,'Opera / Windows','Lokalnie','2026-05-20 10:23:37.416881','SUKCES',17),(82,'Opera / Windows','Lokalnie','2026-05-20 11:59:53.284597','SUKCES',13),(83,'Opera / Windows','Lokalnie','2026-05-20 13:04:23.824783','SUKCES',13),(84,'Opera / Windows','Lokalnie','2026-05-20 13:05:18.847754','SUKCES',17),(85,'Opera / Windows','Lokalnie','2026-05-20 13:12:08.515501','SUKCES',17),(86,'Opera / Windows','Lokalnie','2026-05-20 13:30:18.880194','SUKCES',17),(87,'Opera / Windows','Lokalnie','2026-05-20 13:36:37.090614','SUKCES',17),(88,'Opera / Windows','Lokalnie','2026-05-20 13:38:15.045907','SUKCES',17),(89,'Opera / Windows','Lokalnie','2026-05-20 13:55:19.957274','SUKCES',17),(90,'Opera / Windows','Lokalnie','2026-05-20 15:14:32.126250','SUKCES',1),(91,'Opera / Windows','Lokalnie','2026-05-20 15:38:03.773067','SUKCES',17),(92,'Opera / Windows','Lokalnie','2026-05-20 15:46:36.626015','SUKCES',17),(93,'Opera / Windows','Lokalnie','2026-05-20 15:47:04.104854','SUKCES',17),(94,'Opera / Windows','Lokalnie','2026-05-20 15:47:24.761735','SUKCES',1),(95,'Opera / Windows','Lokalnie','2026-05-20 15:48:46.874461','SUKCES',1),(96,'Opera / Windows','Lokalnie','2026-05-20 15:48:58.030322','SUKCES',17),(97,'Opera / Windows','Lokalnie','2026-05-20 15:49:13.572258','SUKCES',1),(98,'Opera / Windows','Lokalnie','2026-05-20 15:54:13.375122','SUKCES',17),(99,'Chrome / Windows','Lokalnie','2026-05-20 15:55:04.865016','SUKCES',1),(100,'Opera / Windows','Lokalnie','2026-05-20 15:56:06.529480','SUKCES',1),(101,'Opera / Windows','Lokalnie','2026-05-20 16:03:40.796634','SUKCES',17),(102,'Opera / Windows','Lokalnie','2026-05-20 16:03:50.697421','SUKCES',1),(103,'Opera / Windows','Lokalnie','2026-05-20 16:03:58.278172','SUKCES',17),(104,'Opera / Windows','Lokalnie','2026-05-20 16:04:16.023181','SUKCES',1),(105,'Chrome / Windows','Lokalnie','2026-05-20 16:04:26.424295','SUKCES',17),(106,'Opera / Windows','Lokalnie','2026-05-20 16:19:13.708646','SUKCES',17),(107,'Opera / Windows','Lokalnie','2026-05-20 16:19:59.079190','SUKCES',1),(108,'Opera / Windows','Lokalnie','2026-05-20 16:23:28.617268','SUKCES',1),(109,'Opera / Windows','Lokalnie','2026-05-20 16:23:49.997893','SUKCES',1),(110,'Opera / Windows','Lokalnie','2026-05-20 16:24:53.647217','SUKCES',1),(111,'Opera / Windows','Lokalnie','2026-05-20 16:31:32.942457','SUKCES',17),(112,'Opera / Windows','Lokalnie','2026-05-20 16:31:45.898300','SUKCES',1),(113,'Opera / Windows','Lokalnie','2026-05-20 16:41:39.870166','SUKCES',1),(114,'Opera / Windows','Lokalnie','2026-05-20 16:55:22.244455','SUKCES',13),(115,'Opera / Windows','Lokalnie','2026-05-20 16:55:32.322345','SUKCES',13),(116,'Opera / Windows','Lokalnie','2026-05-20 17:02:32.673364','SUKCES',13),(117,'Opera / Windows','Lokalnie','2026-05-20 17:05:16.564918','SUKCES',17),(118,'Opera / Windows','Lokalnie','2026-05-20 17:06:08.061536','SUKCES',13),(119,'Opera / Windows','Lokalnie','2026-05-20 17:06:18.948792','SUKCES',13),(120,'Opera / Windows','Lokalnie','2026-05-20 17:06:24.098788','SUKCES',1),(121,'Opera / Windows','Lokalnie','2026-05-20 17:13:21.438041','SUKCES',17),(122,'Opera / Windows','Lokalnie','2026-05-20 17:13:35.039690','SUKCES',1),(123,'Opera / Windows','Lokalnie','2026-05-20 17:15:05.819200','NIEUDANE_HASLO_LUB_LOGIN',16),(124,'Opera / Windows','Lokalnie','2026-05-20 17:15:10.454442','SUKCES',16),(125,'Opera / Windows','Lokalnie','2026-05-20 17:15:33.123752','SUKCES',16),(126,'Opera / Windows','Lokalnie','2026-05-20 17:16:03.534390','SUKCES',16),(127,'Chrome / Windows','Lokalnie','2026-05-20 17:17:29.502630','SUKCES',1),(128,'Opera / Windows','Lokalnie','2026-05-20 17:23:31.598886','SUKCES',16),(129,'Opera / Windows','Lokalnie','2026-05-20 17:23:57.033541','SUKCES',16),(130,'Opera / Windows','Lokalnie','2026-05-20 17:34:42.330936','SUKCES',1),(131,'Opera / Windows','Lokalnie','2026-05-20 17:36:09.630767','SUKCES',17),(132,'Opera / Windows','Lokalnie','2026-05-20 17:36:30.083566','SUKCES',1),(133,'Opera / Windows','Lokalnie','2026-05-20 17:38:36.636248','SUKCES',16),(134,'Opera / Windows','Lokalnie','2026-05-20 17:39:15.142643','SUKCES',13),(135,'Opera / Windows','Lokalnie','2026-05-20 17:40:22.605856','SUKCES',16),(136,'Opera / Windows','Lokalnie','2026-05-20 17:41:24.345825','SUKCES',13),(137,'Opera / Windows','Lokalnie','2026-05-20 17:41:38.099673','SUKCES',16),(138,'Opera / Windows','Lokalnie','2026-05-20 17:44:36.866976','SUKCES',17),(139,'Opera / Windows','Lokalnie','2026-05-20 17:45:07.651554','SUKCES',1),(140,'Opera / Windows','Lokalnie','2026-05-20 17:51:24.430871','SUKCES',13),(141,'Opera / Windows','Lokalnie','2026-05-20 17:56:17.547714','SUKCES',17),(142,'Opera / Windows','Lokalnie','2026-05-21 09:45:30.098885','SUKCES',17),(143,'Opera / Windows','Lokalnie','2026-05-21 09:45:34.607280','SUKCES',1),(144,'Opera / Windows','Lokalnie','2026-05-21 09:46:09.022885','SUKCES',1),(145,'Opera / Windows','Lokalnie','2026-05-21 09:47:37.927884','SUKCES',17),(146,'Opera / Windows','Lokalnie','2026-05-21 09:47:49.060624','SUKCES',1),(147,'Opera / Windows','Lokalnie','2026-05-21 09:49:42.856311','SUKCES',17),(148,'Opera / Windows','Lokalnie','2026-05-21 09:49:53.555688','SUKCES',1),(149,'Opera / Windows','Lokalnie','2026-05-21 09:50:00.870848','SUKCES',17),(150,'Opera / Windows','Lokalnie','2026-05-21 09:51:06.334963','SUKCES',13),(151,'Opera / Windows','Lokalnie','2026-05-21 09:51:54.473978','SUKCES',17),(152,'Opera / Windows','Lokalnie','2026-05-21 09:55:38.841050','SUKCES',16),(153,'Opera / Windows','Lokalnie','2026-05-21 09:57:20.194706','SUKCES',16),(154,'Opera / Windows','Lokalnie','2026-05-21 09:57:49.792889','SUKCES',13),(155,'Opera / Windows','Lokalnie','2026-05-21 10:05:52.486487','SUKCES',16),(156,'Opera / Windows','Lokalnie','2026-05-21 10:06:38.906767','SUKCES',1),(157,'Opera / Windows','Lokalnie','2026-05-21 10:07:02.172555','SUKCES',17),(158,'Opera / Windows','Lokalnie','2026-05-21 10:07:12.453517','SUKCES',16),(159,'Opera / Windows','Lokalnie','2026-05-27 09:40:33.614842','SUKCES',16),(160,'Opera / Windows','Lokalnie','2026-05-27 10:03:43.702338','SUKCES',1),(161,'Opera / Windows','Lokalnie','2026-05-27 10:16:59.052177','SUKCES',1),(162,'Opera / Windows','Lokalnie','2026-05-27 10:20:13.572466','SUKCES',1),(163,'Opera / Windows','Lokalnie','2026-05-27 10:27:59.551872','SUKCES',13),(164,'Opera / Windows','Lokalnie','2026-05-27 10:44:12.997943','SUKCES',1),(165,'Chrome / Windows','Lokalnie','2026-05-27 10:51:25.476317','SUKCES',1),(166,'Opera / Windows','Lokalnie','2026-05-27 10:58:05.017832','SUKCES',17),(167,'Opera / Windows','Lokalnie','2026-05-27 10:59:33.388643','ZABLOKOWANO_BRAK_WERYFIKACJI_EMAIL',19),(168,'Opera / Windows','Lokalnie','2026-05-27 10:59:35.426009','NIEUDANE_HASLO_LUB_LOGIN',19),(169,'Opera / Windows','Lokalnie','2026-05-27 10:59:38.217491','ZABLOKOWANO_BRAK_WERYFIKACJI_EMAIL',19),(170,'Opera / Windows','Lokalnie','2026-05-27 11:00:47.469215','SUKCES',17),(171,'Opera / Windows','Lokalnie','2026-05-27 11:00:51.953785','SUKCES',20),(172,'Opera / Windows','Lokalnie','2026-05-27 11:01:03.124452','SUKCES',1),(173,'Opera / Windows','Lokalnie','2026-05-27 11:05:01.535747','SUKCES',13),(174,'Opera / Windows','Lokalnie','2026-05-27 11:05:56.602837','SUKCES',1),(175,'Opera / Windows','Lokalnie','2026-05-27 11:30:56.447792','SUKCES',17),(176,'Opera / Windows','Lokalnie','2026-05-27 11:31:07.551351','SUKCES',13),(177,'Opera / Windows','Lokalnie','2026-05-27 11:36:32.997697','SUKCES',17),(178,'Opera / Windows','Lokalnie','2026-05-27 11:36:38.036015','SUKCES',18),(179,'Opera / Windows','Lokalnie','2026-05-27 11:36:46.301867','SUKCES',1),(180,'Opera / Windows','Lokalnie','2026-05-27 11:37:00.065371','SUKCES',17),(181,'Opera / Windows','Lokalnie','2026-05-27 11:37:06.975720','SUKCES',1),(182,'Opera / Windows','Lokalnie','2026-05-27 11:46:10.964629','SUKCES',17),(183,'Opera / Windows','Lokalnie','2026-05-27 13:23:30.486242','SUKCES',20),(184,'Opera / Windows','Lokalnie','2026-05-27 13:36:51.205130','SUKCES',17),(185,'Opera / Windows','Lokalnie','2026-05-27 13:40:02.606771','SUKCES',17),(186,'Opera / Windows','Lokalnie','2026-05-27 17:00:40.417412','SUKCES',13),(187,'Opera / Windows','Lokalnie','2026-05-27 17:23:14.684588','SUKCES',13),(188,'Opera / Windows','Lokalnie','2026-05-27 18:04:44.786326','SUKCES',1),(189,'Opera / Windows','Lokalnie','2026-05-27 18:16:44.056919','SUKCES',20),(190,'Opera / Windows','Lokalnie','2026-05-27 18:22:17.611999','SUKCES',1),(191,'Opera / Windows','Lokalnie','2026-05-27 18:48:35.266198','SUKCES',1),(192,'Opera / Windows','Lokalnie','2026-05-27 18:54:59.064569','SUKCES',1),(193,'Opera / Windows','Lokalnie','2026-05-28 10:25:07.092924','SUKCES',1),(194,'Opera / Windows','Lokalnie','2026-05-28 10:28:09.451866','SUKCES',13),(195,'Opera / Windows','Lokalnie','2026-05-28 10:29:43.131220','SUKCES',1),(196,'Opera / Windows','Lokalnie','2026-06-06 12:24:46.053970','SUKCES',1),(197,'Opera / Windows','Lokalnie','2026-06-06 12:29:32.962328','SUKCES',17),(198,'Opera / Windows','Lokalnie','2026-06-06 12:31:53.989857','SUKCES',18),(199,'Opera / Windows','Lokalnie','2026-06-06 12:35:29.239628','SUKCES',17),(200,'Opera / Windows','Lokalnie','2026-06-06 12:49:48.051728','SUKCES',17),(201,'Opera / Windows','Lokalnie','2026-06-06 12:49:54.307762','SUKCES',18),(202,'Opera / Windows','Lokalnie','2026-06-06 12:50:16.134936','SUKCES',13),(203,'Opera / Windows','Lokalnie','2026-06-06 12:50:58.869943','SUKCES',16),(204,'Opera / Windows','Lokalnie','2026-06-06 12:51:39.045853','SUKCES',15),(205,'Opera / Windows','Lokalnie','2026-06-06 12:52:09.710598','SUKCES',17),(206,'Opera / Windows','Lokalnie','2026-06-06 12:52:22.964308','SUKCES',13),(207,'Opera / Windows','Lokalnie','2026-06-06 12:52:55.409881','SUKCES',17),(208,'Opera / Windows','Lokalnie','2026-06-06 12:53:26.496235','SUKCES',13),(209,'Opera / Windows','Lokalnie','2026-06-06 12:53:46.365393','SUKCES',1),(210,'Opera / Windows','Lokalnie','2026-06-06 12:53:55.643973','SUKCES',13),(211,'Opera / Windows','Lokalnie','2026-06-06 12:55:11.356787','SUKCES',1),(212,'Opera / Windows','Lokalnie','2026-06-06 12:56:22.560306','SUKCES',13),(213,'Opera / Windows','Lokalnie','2026-06-06 12:56:51.774549','SUKCES',13),(214,'Opera / Windows','Lokalnie','2026-06-06 12:57:10.169241','SUKCES',1),(215,'Opera / Windows','Lokalnie','2026-06-06 12:57:43.780419','SUKCES',17),(216,'Opera / Windows','Lokalnie','2026-06-06 12:58:31.115301','SUKCES',13),(217,'Opera / Windows','Lokalnie','2026-06-06 14:28:37.478849','SUKCES',13),(218,'Opera / Windows','Lokalnie','2026-06-06 15:11:05.751698','SUKCES',13),(219,'Opera / Windows','Lokalnie','2026-06-06 15:12:16.841057','SUKCES',1),(220,'Opera / Windows','Lokalnie','2026-06-06 15:21:37.616674','SUKCES',17),(221,'Opera / Windows','Lokalnie','2026-06-06 15:39:38.882244','SUKCES',17),(222,'Opera / Windows','Lokalnie','2026-06-06 15:40:57.017361','SUKCES',17),(223,'Opera / Windows','Lokalnie','2026-06-06 15:43:23.583932','SUKCES',17),(224,'Opera / Windows','Lokalnie','2026-06-06 15:51:37.659316','SUKCES',17),(225,'Chrome / Windows','Lokalnie','2026-06-06 16:00:56.714021','SUKCES',17),(226,'Opera / Windows','Lokalnie','2026-06-06 16:05:02.227746','SUKCES',13),(227,'Opera / Windows','Lokalnie','2026-06-06 16:25:18.438733','SUKCES',17),(228,'Opera / Windows','Lokalnie','2026-06-06 16:28:06.877779','SUKCES',13),(229,'Opera / Windows','Lokalnie','2026-06-06 16:28:35.027047','SUKCES',17),(230,'Opera / Windows','Lokalnie','2026-06-06 16:36:02.155481','SUKCES',16),(231,'Opera / Windows','Lokalnie','2026-06-06 16:36:27.389452','SUKCES',16),(232,'Opera / Windows','Lokalnie','2026-06-06 16:41:10.200908','SUKCES',13),(233,'Opera / Windows','Lokalnie','2026-06-06 16:41:21.642037','SUKCES',1),(234,'Opera / Windows','Lokalnie','2026-06-06 16:42:06.339769','SUKCES',17),(235,'Opera / Windows','Lokalnie','2026-06-06 16:45:57.071809','SUKCES',13),(236,'Opera / Windows','Lokalnie','2026-06-06 16:46:02.385420','SUKCES',1),(237,'Chrome / Windows','Lokalnie','2026-06-06 17:04:56.746153','SUKCES',17),(238,'Chrome / Windows','Lokalnie','2026-06-06 17:10:00.645232','SUKCES',17),(239,'Chrome / Windows','Lokalnie','2026-06-06 17:10:29.515566','SUKCES',17),(240,'Chrome / Windows','Lokalnie','2026-06-06 17:11:18.022393','SUKCES',17),(241,'Opera / Windows','Lokalnie','2026-06-06 17:17:11.394081','SUKCES',1),(242,'Opera / Windows','Lokalnie','2026-06-06 17:26:08.148577','SUKCES',1),(243,'Opera / Windows','Lokalnie','2026-06-06 17:26:23.306285','SUKCES',13),(244,'Opera / Windows','Lokalnie','2026-06-06 17:54:22.999193','SUKCES',13),(245,'Opera / Windows','Lokalnie','2026-06-06 18:14:57.635319','SUKCES',13),(246,'Opera / Windows','Lokalnie','2026-06-06 18:15:10.689285','SUKCES',13),(247,'Opera / Windows','Lokalnie','2026-06-06 18:16:48.509678','SUKCES',1),(248,'Opera / Windows','Lokalnie','2026-06-06 18:23:40.263085','SUKCES',13),(249,'Opera / Windows','Lokalnie','2026-06-06 18:30:03.569867','SUKCES',17),(250,'Opera / Windows','Lokalnie','2026-06-06 18:30:08.120713','SUKCES',17),(251,'Opera / Windows','Lokalnie','2026-06-06 18:31:20.159302','SUKCES',1),(252,'Opera / Windows','Lokalnie','2026-06-06 18:31:43.528930','SUKCES',1),(253,'Opera / Windows','Lokalnie','2026-06-06 18:37:08.842532','SUKCES',13),(254,'Opera / Windows','Lokalnie','2026-06-06 19:41:37.486370','SUKCES',17),(255,'Opera / Windows','Lokalnie','2026-06-06 19:45:24.917498','SUKCES',17),(256,'Opera / Windows','Lokalnie','2026-06-06 19:58:53.575952','SUKCES',17),(257,'Opera / Windows','Lokalnie','2026-06-06 19:59:00.457420','SUKCES',13),(258,'Opera / Windows','Lokalnie','2026-06-06 20:01:41.928510','SUKCES',1),(259,'Opera / Windows','Lokalnie','2026-06-06 20:02:09.389399','SUKCES',13),(260,'Opera / Windows','Lokalnie','2026-06-06 20:04:55.299846','SUKCES',1),(261,'Opera / Windows','Lokalnie','2026-06-06 20:05:05.279611','SUKCES',13),(262,'Opera / Windows','Lokalnie','2026-06-06 20:06:25.474082','SUKCES',17),(263,'Opera / Windows','Lokalnie','2026-06-06 20:07:05.902473','SUKCES',13),(264,'Opera / Windows','Lokalnie','2026-06-06 20:07:38.297477','SUKCES',1),(265,'Opera / Windows','Lokalnie','2026-06-06 20:09:17.200405','SUKCES',17),(266,'Opera / Windows','Lokalnie','2026-06-06 20:11:48.345503','SUKCES',13),(267,'Opera / Windows','Lokalnie','2026-06-06 20:13:35.187288','SUKCES',13),(268,'Opera / Windows','Lokalnie','2026-06-06 20:14:32.701213','SUKCES',17),(269,'Opera / Windows','Lokalnie','2026-06-06 20:14:45.202253','SUKCES',13),(270,'Opera / Windows','Lokalnie','2026-06-06 22:02:04.011368','SUKCES',13),(271,'Opera / Windows','Lokalnie','2026-06-07 11:18:29.844202','SUKCES',13),(272,'Opera / Windows','Lokalnie','2026-06-07 11:33:19.144065','SUKCES',17),(273,'Opera / Windows','Lokalnie','2026-06-07 11:36:15.225004','SUKCES',13),(274,'Opera / Windows','Lokalnie','2026-06-07 12:52:42.923043','SUKCES',1),(275,'Opera / Windows','Lokalnie','2026-06-07 12:54:15.636447','SUKCES',17),(276,'Opera / Windows','Lokalnie','2026-06-07 12:59:54.122048','SUKCES',13),(277,'Opera / Windows','Lokalnie','2026-06-07 13:02:56.395516','SUKCES',17),(278,'Opera / Windows','Lokalnie','2026-06-07 13:03:09.908466','SUKCES',1);
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
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `miejsca`
--

LOCK TABLES `miejsca` WRITE;
/*!40000 ALTER TABLE `miejsca` DISABLE KEYS */;
INSERT INTO `miejsca` VALUES (1,'TEST','Polska','Gdańsk','Jana 13','33 364','TEST',6,NULL,NULL),(2,'T2','Polska','Tarnów','Pawła13','33 840','test',8,NULL,NULL),(3,'3','Polska','A','A','A','A',8,NULL,NULL),(4,'A','Polska','S','D','2323','2e',10,NULL,NULL),(5,'Vegas','Polska','Stary Sącz','Stara 15','33-340','Budynek',13,NULL,NULL),(6,'Wydarzenie','Polska','Łódź','Mała 63','44 356','Testowe wydarzenie',15,3,NULL),(7,'Pulse Arena','Polska','Warszawa','ulica','33890','opis dla Pulse Arena',18,13,NULL),(8,'ss','Polska','miasto','ulic','33386','opis',17,13,NULL);
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
INSERT INTO `opinie` VALUES (1,'2026-04-29 15:15:04.939556',5,'test',15,1),(2,'2026-05-20 10:42:12.838958',5,'ale gowno',17,4),(3,'2026-06-06 19:52:59.075844',5,'moja opinia od uzytkownika',17,3);
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
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `organizator`
--

LOCK TABLES `organizator` WRITE;
/*!40000 ALTER TABLE `organizator` DISABLE KEYS */;
INSERT INTO `organizator` VALUES (1,'2026-04-08 11:34:07.635557','asd','null','a.com',6,_binary ''),(2,'2026-04-08 13:50:54.916522','MARBUD','Jakieś tam','www.google.com',8,_binary ''),(3,'2026-04-09 16:29:58.015035','A','A','A',10,_binary ''),(4,'2026-04-09 17:20:58.824777','Fakro','Niskie','8.8.8.8',13,_binary ''),(5,'2026-04-26 11:50:16.242915','ASD','ASD','ASD',15,_binary ''),(6,'2026-05-01 10:49:56.850262','ASDAS','ASDA','ASDASD',16,_binary ''),(7,'2026-05-18 17:27:55.230400','ss','ss','ss',17,_binary ''),(9,'2026-05-27 13:24:16.415953','ss','ss','ss',20,_binary '\0');
/*!40000 ALTER TABLE `organizator` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `patch_notes`
--

DROP TABLE IF EXISTS `patch_notes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `patch_notes` (
  `id` bigint NOT NULL,
  `date_label` varchar(255) DEFAULT NULL,
  `items_text` text,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `patch_notes`
--

LOCK TABLES `patch_notes` WRITE;
/*!40000 ALTER TABLE `patch_notes` DISABLE KEYS */;
INSERT INTO `patch_notes` VALUES (1,'Zmiany dnia 29.05.2026','Nieaktywne i zakończone wydarzenia są ukryte na liście wydarzeń.\nObserwowane wydarzenia pojawiają się wyżej i można je odobserwować.\nPo zaakceptowaniu zwrotu bilet znika z listy biletów użytkownika.\nPanel główny dostał krótki przewodnik po najważniejszych zakładkach.\nNowa wiaodmość.');
/*!40000 ALTER TABLE `patch_notes` ENABLE KEYS */;
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
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `platnosci`
--

LOCK TABLES `platnosci` WRITE;
/*!40000 ALTER TABLE `platnosci` DISABLE KEYS */;
INSERT INTO `platnosci` VALUES (2,'CHECKBOX','2026-05-01 07:26:58',1,'zakonczona','414603112'),(3,'CHECKBOX','2026-05-15 12:18:04',1,'zakonczona','471598496'),(4,'CHECKBOX','2026-05-15 15:10:06',1,'zakonczona','546069066'),(5,'CHECKBOX','2026-05-18 15:21:16',1,'zakonczona','921573914'),(6,'CHECKBOX','2026-05-20 15:05:54',1,'zakonczona','465714414'),(7,'PORTFEL','2026-06-06 10:53:20',1,'zakonczona','596668750'),(8,'PORTFEL','2026-06-06 17:41:49',1,'zakonczona','914249413'),(9,'PORTFEL','2026-06-06 18:02:23',1,'zakonczona','355704505'),(10,'PORTFEL','2026-06-06 18:05:13',1,'zakonczona','372194673');
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
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `poz_zam`
--

LOCK TABLES `poz_zam` WRITE;
/*!40000 ALTER TABLE `poz_zam` DISABLE KEYS */;
INSERT INTO `poz_zam` VALUES (1,1,12.00,11),(2,2,35.00,0),(3,3,15.00,0),(4,4,10.00,13),(5,5,14.00,13),(6,6,13.00,13),(7,7,13.00,13),(8,8,13.00,13),(9,9,13.00,9);
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
) ENGINE=InnoDB AUTO_INCREMENT=82 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `sala_miejsca`
--

LOCK TABLES `sala_miejsca` WRITE;
/*!40000 ALTER TABLE `sala_miejsca` DISABLE KEYS */;
INSERT INTO `sala_miejsca` VALUES (52,0,'seat-1778334713278',640,26,6,NULL,NULL,'',NULL,NULL),(53,0,'seat-1778334715559',596,27,6,NULL,NULL,'',NULL,NULL),(54,0,'seat-1778334718965',551,26,6,NULL,NULL,'',NULL,NULL),(55,0,'seat-1778334724477',504,28,6,NULL,NULL,'',NULL,NULL),(56,0,'seat-1778334731594',457,28,6,NULL,NULL,'',NULL,NULL),(57,0,'seat-1778334734045',642,69,6,NULL,NULL,'',NULL,NULL),(58,0,'seat-1778334738826',596,70,6,NULL,NULL,'',NULL,NULL),(59,0,'seat-1778334744476',550,72,6,NULL,NULL,'',NULL,NULL),(60,0,'seat-1778334750246',505,72,6,NULL,NULL,'',NULL,NULL),(61,0,'seat-1778334756379',458,72,6,NULL,NULL,'',NULL,NULL),(72,0,'seat-1778324618366',287,101,5,NULL,NULL,'',NULL,NULL),(73,0,'seat-1778324629663',677,5,5,NULL,NULL,'',NULL,NULL),(74,0,'seat-1778324633711',675,374,5,NULL,NULL,'',NULL,NULL),(75,0,'seat-1778324635919',443,115,5,NULL,NULL,'',NULL,NULL),(76,180,'seat-1778324645298',338,158,5,NULL,NULL,'',NULL,NULL),(77,0,'seat-1778324647392',7,6,5,NULL,NULL,'',NULL,NULL),(78,0,'seat-1778324649011',6,370,5,NULL,NULL,'',NULL,NULL),(79,135,'seat-1778324651116',366,87,5,NULL,NULL,'',NULL,NULL),(80,90,'seat-1778324655252',481,113,5,NULL,NULL,'',NULL,NULL),(81,135,'seat-1778324659210',450,180,5,NULL,NULL,'',NULL,NULL);
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
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `sale`
--

LOCK TABLES `sale` WRITE;
/*!40000 ALTER TABLE `sale` DISABLE KEYS */;
INSERT INTO `sale` VALUES (1,1,'T1',100,1,1,NULL,420,720),(2,2,'P1',122,1,1,NULL,420,720),(3,4,'S1',21,1,1,NULL,420,720),(4,5,'Ślubna',30,-1,1,NULL,420,720),(5,6,'Pietro1',10,1,1,'{\"seats\":[{\"id\":\"seat-1778324618366\",\"x\":287,\"y\":101,\"rotation\":0},{\"id\":\"seat-1778324629663\",\"x\":675,\"y\":5,\"rotation\":0},{\"id\":\"seat-1778324633711\",\"x\":675,\"y\":374,\"rotation\":0},{\"id\":\"seat-1778324635919\",\"x\":443,\"y\":115,\"rotation\":0},{\"id\":\"seat-1778324645298\",\"x\":338,\"y\":158,\"rotation\":180},{\"id\":\"seat-1778324647392\",\"x\":7,\"y\":6,\"rotation\":0},{\"id\":\"seat-1778324649011\",\"x\":6,\"y\":370,\"rotation\":0},{\"id\":\"seat-1778324651116\",\"x\":366,\"y\":87,\"rotation\":135},{\"id\":\"seat-1778324655252\",\"x\":481,\"y\":113,\"rotation\":90},{\"id\":\"seat-1778324659210\",\"x\":450,\"y\":180,\"rotation\":135}]}',420,720),(6,6,'Pietro2',10,2,1,'{\"seats\":[{\"id\":\"seat-1778334713278\",\"x\":640,\"y\":26,\"rotation\":0},{\"id\":\"seat-1778334715559\",\"x\":596,\"y\":27,\"rotation\":0},{\"id\":\"seat-1778334718965\",\"x\":551,\"y\":26,\"rotation\":0},{\"id\":\"seat-1778334724477\",\"x\":504,\"y\":28,\"rotation\":0},{\"id\":\"seat-1778334731594\",\"x\":457,\"y\":28,\"rotation\":0},{\"id\":\"seat-1778334734045\",\"x\":642,\"y\":69,\"rotation\":0},{\"id\":\"seat-1778334738826\",\"x\":596,\"y\":70,\"rotation\":0},{\"id\":\"seat-1778334744476\",\"x\":550,\"y\":72,\"rotation\":0},{\"id\":\"seat-1778334750246\",\"x\":505,\"y\":72,\"rotation\":0},{\"id\":\"seat-1778334756379\",\"x\":458,\"y\":74,\"rotation\":0}]}',420,720),(7,7,'sala pulse arena',13,1,0,NULL,420,720),(8,7,'sala pulse arena v2',14,1,1,NULL,420,720),(9,8,'sala',13,1,1,NULL,420,720);
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
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `security_ticket_audits`
--

LOCK TABLES `security_ticket_audits` WRITE;
/*!40000 ALTER TABLE `security_ticket_audits` DISABLE KEYS */;
INSERT INTO `security_ticket_audits` VALUES (1,'2026-05-18 17:28:18.440327','Użytkownik mat cho (USER) utworzył(a) zgłoszenie #1 (zgłoszenie z historii logowań).',17,1),(2,'2026-05-18 17:28:28.444310','Użytkownik Mateusz Chochorowski (ADMIN) zmienił(a) status zgłoszenia #1 z NEW na IN_PROGRESS dnia 2026-05-18 19:28:28.',1,1),(3,'2026-05-27 10:57:12.718782','Użytkownik Mateusz Chochorowski (ADMIN) wykonał(a) szybką akcję: zawieszenie konta użytkownika user2 (zgłoszenie #1).',1,1),(4,'2026-05-27 10:57:16.819799','Użytkownik Mateusz Chochorowski (ADMIN) wykonał(a) szybką akcję: ponowna aktywacja konta użytkownika user2 (zgłoszenie #1).',1,1),(5,'2026-05-27 10:57:21.668472','Użytkownik Mateusz Chochorowski (ADMIN) wykonał(a) szybką akcję: zawieszenie konta użytkownika user2 (zgłoszenie #1).',1,1),(6,'2026-05-27 10:57:22.503409','Użytkownik Mateusz Chochorowski (ADMIN) wykonał(a) szybką akcję: ponowna aktywacja konta użytkownika user2 (zgłoszenie #1).',1,1),(7,'2026-05-27 13:25:57.724618','Użytkownik mat cho (USER) utworzył(a) zgłoszenie #2 (zgłoszenie z historii logowań).',20,2),(8,'2026-06-07 12:58:34.841602','Użytkownik mat cho (USER) utworzył(a) zgłoszenie #3 (zgłoszenie z historii logowań).',17,3),(9,'2026-06-07 13:32:10.090370','Użytkownik Mateusz Chochorowski (ADMIN) wykonał(a) szybką akcję: zawieszenie konta użytkownika user2 (zgłoszenie #3).',1,3),(10,'2026-06-07 13:32:12.245229','Użytkownik Mateusz Chochorowski (ADMIN) wykonał(a) szybką akcję: ponowna aktywacja konta użytkownika user2 (zgłoszenie #3).',1,3);
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
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `security_tickets`
--

LOCK TABLES `security_tickets` WRITE;
/*!40000 ALTER TABLE `security_tickets` DISABLE KEYS */;
INSERT INTO `security_tickets` VALUES (1,'USER_FLAGGED_LOG','2026-05-18 17:28:18.426252',_binary '','Użytkownik zgłosił wpis z historii logowań.\nData wpisu: 2026-05-18T19:28:11.100184\nUrządzenie: Opera / Windows\nLokalizacja: Lokalnie\nStatus techniczny: SUKCES\nUwagi zgłaszającego: sss',61,'USER_REPORT','IN_PROGRESS','2026-05-27 10:57:22.504411',17,1,17),(2,'USER_FLAGGED_LOG','2026-05-27 13:25:57.718619',_binary '','Użytkownik zgłosił wpis z historii logowań.\nData wpisu: 2026-05-27T15:23:30.486242\nUrządzenie: Opera / Windows\nLokalizacja: Lokalnie\nStatus techniczny: SUKCES\nUwagi zgłaszającego: sss',183,'USER_REPORT','NEW','2026-05-27 13:25:57.718619',20,NULL,20),(3,'USER_FLAGGED_LOG','2026-06-07 12:58:34.819879',_binary '','Użytkownik zgłosił wpis z historii logowań.\nData wpisu: 2026-06-07T14:54:15.636447\nUrządzenie: Opera / Windows\nLokalizacja: Lokalnie\nStatus techniczny: SUKCES\n',275,'USER_REPORT','IN_PROGRESS','2026-06-07 13:32:12.247257',17,1,17);
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
) ENGINE=InnoDB AUTO_INCREMENT=19 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user_favorites`
--

LOCK TABLES `user_favorites` WRITE;
/*!40000 ALTER TABLE `user_favorites` DISABLE KEYS */;
INSERT INTO `user_favorites` VALUES (1,'2026-05-17 18:22:54.370391',15,16),(2,'2026-05-17 18:23:51.970059',16,15),(4,'2026-05-17 18:36:40.085857',16,11),(6,'2026-05-18 12:23:58.396948',1,5),(8,'2026-05-20 17:14:42.054242',16,17),(9,'2026-05-27 09:55:06.154396',11,16),(17,'2026-05-27 11:09:11.660549',5,1),(18,'2026-06-06 16:36:43.519592',17,16);
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
) ENGINE=InnoDB AUTO_INCREMENT=143 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user_notifications`
--

LOCK TABLES `user_notifications` WRITE;
/*!40000 ALTER TABLE `user_notifications` DISABLE KEYS */;
INSERT INTO `user_notifications` VALUES (44,'2026-05-27 10:44:13.010900','Administrator admin (Mateusz Chochorowski) zalogował się do systemu.',_binary '\0','ADMIN_LOGIN',16),(46,'2026-05-27 10:51:25.486218','Administrator admin (Mateusz Chochorowski) zalogował się do systemu.',_binary '\0','ADMIN_LOGIN',16),(48,'2026-05-27 11:01:03.129446','Administrator admin (Mateusz Chochorowski) zalogował się do systemu.',_binary '\0','ADMIN_LOGIN',16),(51,'2026-05-27 11:05:56.609955','Administrator admin (Mateusz Chochorowski) zalogował się do systemu.',_binary '\0','ADMIN_LOGIN',16),(54,'2026-05-27 11:36:46.309911','Administrator admin (Mateusz Chochorowski) zalogował się do systemu.',_binary '\0','ADMIN_LOGIN',16),(57,'2026-05-27 11:37:06.985725','Administrator admin (Mateusz Chochorowski) zalogował się do systemu.',_binary '\0','ADMIN_LOGIN',16),(61,'2026-05-27 13:25:57.729445','Nowe zgłoszenie bezpieczeństwa #2 (USER_FLAGGED_LOG).',_binary '','NEW_SECURITY_REPORT',1),(62,'2026-05-27 18:04:44.800959','Administrator admin (Mateusz Chochorowski) zalogował się do systemu.',_binary '\0','ADMIN_LOGIN',16),(64,'2026-05-27 18:04:44.800959','Administrator admin (Mateusz Chochorowski) zalogował się do systemu.',_binary '\0','ADMIN_LOGIN',20),(65,'2026-05-27 18:22:17.620201','Administrator admin (Mateusz Chochorowski) zalogował się do systemu.',_binary '\0','ADMIN_LOGIN',16),(67,'2026-05-27 18:22:17.620201','Administrator admin (Mateusz Chochorowski) zalogował się do systemu.',_binary '\0','ADMIN_LOGIN',20),(68,'2026-05-27 18:48:35.275601','Administrator admin (Mateusz Chochorowski) zalogował się do systemu.',_binary '\0','ADMIN_LOGIN',16),(70,'2026-05-27 18:48:35.275601','Administrator admin (Mateusz Chochorowski) zalogował się do systemu.',_binary '\0','ADMIN_LOGIN',20),(71,'2026-05-27 18:54:59.071578','Administrator admin (Mateusz Chochorowski) zalogował się do systemu.',_binary '\0','ADMIN_LOGIN',16),(73,'2026-05-27 18:54:59.071578','Administrator admin (Mateusz Chochorowski) zalogował się do systemu.',_binary '\0','ADMIN_LOGIN',20),(74,'2026-05-28 10:25:07.273192','Administrator admin (Mateusz Chochorowski) zalogował się do systemu.',_binary '\0','ADMIN_LOGIN',16),(76,'2026-05-28 10:25:07.273192','Administrator admin (Mateusz Chochorowski) zalogował się do systemu.',_binary '\0','ADMIN_LOGIN',20),(77,'2026-05-28 10:29:43.147758','Administrator admin (Mateusz Chochorowski) zalogował się do systemu.',_binary '\0','ADMIN_LOGIN',16),(79,'2026-05-28 10:29:43.147758','Administrator admin (Mateusz Chochorowski) zalogował się do systemu.',_binary '\0','ADMIN_LOGIN',20),(80,'2026-06-06 12:24:46.122593','Administrator admin (Mateusz Chochorowski) zalogował się do systemu.',_binary '\0','ADMIN_LOGIN',16),(82,'2026-06-06 12:24:46.122593','Administrator admin (Mateusz Chochorowski) zalogował się do systemu.',_binary '\0','ADMIN_LOGIN',20),(84,'2026-06-06 12:53:46.376304','Administrator admin (Mateusz Chochorowski) zalogował się do systemu.',_binary '\0','ADMIN_LOGIN',16),(86,'2026-06-06 12:53:46.376304','Administrator admin (Mateusz Chochorowski) zalogował się do systemu.',_binary '\0','ADMIN_LOGIN',20),(87,'2026-06-06 12:55:11.408305','Administrator admin (Mateusz Chochorowski) zalogował się do systemu.',_binary '\0','ADMIN_LOGIN',16),(89,'2026-06-06 12:55:11.408305','Administrator admin (Mateusz Chochorowski) zalogował się do systemu.',_binary '\0','ADMIN_LOGIN',20),(90,'2026-06-06 12:57:10.194188','Administrator admin (Mateusz Chochorowski) zalogował się do systemu.',_binary '\0','ADMIN_LOGIN',16),(92,'2026-06-06 12:57:10.194188','Administrator admin (Mateusz Chochorowski) zalogował się do systemu.',_binary '\0','ADMIN_LOGIN',20),(93,'2026-06-06 15:12:16.851053','Administrator admin (Mateusz Chochorowski) zalogował się do systemu.',_binary '\0','ADMIN_LOGIN',16),(95,'2026-06-06 15:12:16.851053','Administrator admin (Mateusz Chochorowski) zalogował się do systemu.',_binary '\0','ADMIN_LOGIN',20),(98,'2026-06-06 16:41:21.649684','Administrator admin (Mateusz Chochorowski) zalogował się do systemu.',_binary '\0','ADMIN_LOGIN',16),(100,'2026-06-06 16:41:21.649684','Administrator admin (Mateusz Chochorowski) zalogował się do systemu.',_binary '\0','ADMIN_LOGIN',20),(101,'2026-06-06 16:46:02.395005','Administrator admin (Mateusz Chochorowski) zalogował się do systemu.',_binary '\0','ADMIN_LOGIN',16),(103,'2026-06-06 16:46:02.395005','Administrator admin (Mateusz Chochorowski) zalogował się do systemu.',_binary '\0','ADMIN_LOGIN',20),(104,'2026-06-06 17:17:11.406682','Administrator admin (Mateusz Chochorowski) zalogował się do systemu.',_binary '\0','ADMIN_LOGIN',16),(106,'2026-06-06 17:17:11.406682','Administrator admin (Mateusz Chochorowski) zalogował się do systemu.',_binary '\0','ADMIN_LOGIN',20),(107,'2026-06-06 17:26:08.159612','Administrator admin (Mateusz Chochorowski) zalogował się do systemu.',_binary '\0','ADMIN_LOGIN',16),(109,'2026-06-06 17:26:08.159612','Administrator admin (Mateusz Chochorowski) zalogował się do systemu.',_binary '\0','ADMIN_LOGIN',20),(110,'2026-06-06 18:16:48.518718','Administrator admin (Mateusz Chochorowski) zalogował się do systemu.',_binary '\0','ADMIN_LOGIN',16),(112,'2026-06-06 18:16:48.518718','Administrator admin (Mateusz Chochorowski) zalogował się do systemu.',_binary '\0','ADMIN_LOGIN',20),(113,'2026-06-06 18:31:20.171899','Administrator admin (Mateusz Chochorowski) zalogował się do systemu.',_binary '\0','ADMIN_LOGIN',16),(115,'2026-06-06 18:31:20.171899','Administrator admin (Mateusz Chochorowski) zalogował się do systemu.',_binary '\0','ADMIN_LOGIN',20),(116,'2026-06-06 18:31:43.537516','Administrator admin (Mateusz Chochorowski) zalogował się do systemu.',_binary '\0','ADMIN_LOGIN',16),(118,'2026-06-06 18:31:43.537516','Administrator admin (Mateusz Chochorowski) zalogował się do systemu.',_binary '\0','ADMIN_LOGIN',20),(119,'2026-06-06 19:41:49.150368','user2 (mat cho) dołączył do wydarzenia Event (bilety: 1).',_binary '','ORG_EVENT_JOIN',13),(120,'2026-06-06 19:52:59.088428','user2 (mat cho) dodał opinię (5/5) do wydarzenia Event.',_binary '','ORG_EVENT_REVIEW',13),(121,'2026-06-06 19:55:20.169392','Nowy wniosek o zwrot #5: 13.00 PLN. Powód: powod zwrotu.',_binary '\0','NEW_REFUND_REQUEST',1),(122,'2026-06-06 19:55:30.253329','Nowy wniosek o zwrot #6: 13.00 PLN. Powód: powod zwrotu.',_binary '\0','NEW_REFUND_REQUEST',1),(123,'2026-06-06 20:01:41.939127','Administrator admin (Mateusz Chochorowski) zalogował się do systemu.',_binary '\0','ADMIN_LOGIN',16),(125,'2026-06-06 20:01:41.939127','Administrator admin (Mateusz Chochorowski) zalogował się do systemu.',_binary '\0','ADMIN_LOGIN',20),(126,'2026-06-06 20:02:23.363960','user2 (mat cho) dołączył do wydarzenia Event (bilety: 1).',_binary '\0','ORG_EVENT_JOIN',13),(127,'2026-06-06 20:04:55.309628','Administrator admin (Mateusz Chochorowski) zalogował się do systemu.',_binary '\0','ADMIN_LOGIN',16),(129,'2026-06-06 20:04:55.309628','Administrator admin (Mateusz Chochorowski) zalogował się do systemu.',_binary '\0','ADMIN_LOGIN',20),(130,'2026-06-06 20:05:12.749506','user2 (mat cho) dołączył do wydarzenia Event (bilety: 1).',_binary '\0','ORG_EVENT_JOIN',13),(131,'2026-06-06 20:07:27.580985','Nowy wniosek o zwrot #7: 13.00 PLN. Powód: xxx.',_binary '\0','NEW_REFUND_REQUEST',1),(132,'2026-06-06 20:07:38.306529','Administrator admin (Mateusz Chochorowski) zalogował się do systemu.',_binary '\0','ADMIN_LOGIN',16),(134,'2026-06-06 20:07:38.306529','Administrator admin (Mateusz Chochorowski) zalogował się do systemu.',_binary '\0','ADMIN_LOGIN',20),(135,'2026-06-06 20:07:50.250429','user2 (mat cho) zwrócił Standard na wydarzenie Event.',_binary '\0','ORG_EVENT_REFUND',13),(136,'2026-06-07 12:52:42.977122','Administrator admin (Mateusz Chochorowski) zalogował się do systemu.',_binary '\0','ADMIN_LOGIN',16),(138,'2026-06-07 12:52:42.977122','Administrator admin (Mateusz Chochorowski) zalogował się do systemu.',_binary '\0','ADMIN_LOGIN',20),(139,'2026-06-07 12:58:34.856360','Nowe zgłoszenie bezpieczeństwa #3 (USER_FLAGGED_LOG).',_binary '\0','NEW_SECURITY_REPORT',1),(140,'2026-06-07 13:03:09.914354','Administrator admin (Mateusz Chochorowski) zalogował się do systemu.',_binary '\0','ADMIN_LOGIN',16),(141,'2026-06-07 13:03:09.914354','Administrator admin (Mateusz Chochorowski) zalogował się do systemu.',_binary '\0','ADMIN_LOGIN',17),(142,'2026-06-07 13:03:09.914354','Administrator admin (Mateusz Chochorowski) zalogował się do systemu.',_binary '\0','ADMIN_LOGIN',20);
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
  `user_id` bigint NOT NULL,
  `wydarzenie_id` bigint NOT NULL,
  `start_reminder_sent_at` datetime(6) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UKeq9vvtwpoqg6bg7s4q5wemhlc` (`user_id`,`wydarzenie_id`)
) ENGINE=InnoDB AUTO_INCREMENT=14 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user_observed_events`
--

LOCK TABLES `user_observed_events` WRITE;
/*!40000 ALTER TABLE `user_observed_events` DISABLE KEYS */;
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
  `notify_new_event` bit(1) NOT NULL,
  `notify_favorite_login` bit(1) NOT NULL,
  `notify_observed_event_end` bit(1) NOT NULL,
  `notify_observed_event_start` bit(1) NOT NULL,
  `notify_observed_seat_freed` bit(1) NOT NULL,
  `notify_new_organizer_request` bit(1) NOT NULL,
  `notify_new_refund_request` bit(1) NOT NULL,
  `notify_new_security_report` bit(1) NOT NULL,
  `bank_account_number` varchar(32) DEFAULT NULL,
  `wallet_balance` decimal(38,2) DEFAULT NULL,
  `notify_org_event_join` bit(1) NOT NULL,
  `notify_org_event_refund` bit(1) NOT NULL,
  `notify_org_event_review` bit(1) NOT NULL,
  `notify_org_event_sold_out` bit(1) NOT NULL,
  `notify_org_event_start` bit(1) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `id` (`id`),
  UNIQUE KEY `email` (`email`),
  UNIQUE KEY `UK_r43af9ap4edm43mmtq01oddj6` (`login`),
  UNIQUE KEY `UK_9edtej9p4mjytxr91dkw14v7n` (`telefon`)
) ENGINE=InnoDB AUTO_INCREMENT=21 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,'Mateusz','Chochorowski','admin@example.com','admin','$2a$10$UOBujPQuCzaeCC5ok1lCIuLQ4lAn0PvYgv91bCNcKE6eNPsQkseFS','4046f48c-a02e-4680-9b3c-0c536cea0adc',NULL,'ADMIN','2026-03-25 15:08:36',1,_binary '',NULL,NULL,'','',_binary '\0',0,0,NULL,NULL,NULL,NULL,_binary '\0',_binary '\0',_binary '\0',_binary '\0',_binary '\0',_binary '\0',_binary '',_binary '',_binary '',NULL,26.00,_binary '\0',_binary '\0',_binary '\0',_binary '\0',_binary '\0'),(5,'Adam','Kowalski','an@gmail.com','AKowal','$2a$10$N5B5xCSXbYM1.L14/Dy8TOq6XmC5uJIY.u2i3DjliCyDSfFRR/Tiq','216c5ddf-666e-47f5-90c3-eec37c437897',NULL,'ADMIN','2026-04-08 08:53:14',1,NULL,NULL,NULL,'','',_binary '\0',0,0,NULL,NULL,NULL,NULL,_binary '\0',_binary '\0',_binary '\0',_binary '\0',_binary '\0',_binary '\0',_binary '\0',_binary '\0',_binary '\0',NULL,NULL,_binary '\0',_binary '\0',_binary '\0',_binary '\0',_binary '\0'),(7,'Q','Q','Q@q.q','Q','$2a$10$wUJr39H3JdXbcV7aBJ.0TeTJ73HizpQEmlfJA9XMlXw1kBTwvRjqG','780c43fd-1f59-41ac-aed9-59abfb68d627',NULL,'USER','2026-04-08 09:40:47',0,NULL,NULL,NULL,'','',_binary '\0',0,0,NULL,NULL,NULL,NULL,_binary '\0',_binary '\0',_binary '\0',_binary '\0',_binary '\0',_binary '\0',_binary '\0',_binary '\0',_binary '\0',NULL,NULL,_binary '\0',_binary '\0',_binary '\0',_binary '\0',_binary '\0'),(11,'Adam','Kowalski','admin@gmail.com','adm','$2a$10$sS4Te9WEyKCL2BY0ESBT0edfHIUNbuXlyNC1L7qfWJV.eWYndgoAK','06571e84-7541-45e4-9e8b-cf05f8ac9604',NULL,'ADMIN','2026-04-09 15:15:19',1,_binary '',NULL,NULL,'','',_binary '\0',0,0,NULL,NULL,NULL,NULL,_binary '\0',_binary '\0',_binary '\0',_binary '\0',_binary '\0',_binary '\0',_binary '\0',_binary '\0',_binary '\0',NULL,NULL,_binary '\0',_binary '\0',_binary '\0',_binary '\0',_binary '\0'),(12,'Jan','Kowalski','user@gmail.com','usr','$2a$10$Mby6U0S6M08sZdcCrf9aPufSdqK6ktKidwgdWwFQ8SCSMOHxbjOaO','f9acbba7-671b-46d8-8f38-55fb1897bbc2',NULL,'USER','2026-04-09 15:16:00',1,_binary '',NULL,NULL,'','',_binary '\0',0,0,NULL,NULL,NULL,NULL,_binary '\0',_binary '\0',_binary '\0',_binary '\0',_binary '\0',_binary '\0',_binary '\0',_binary '\0',_binary '\0',NULL,NULL,_binary '\0',_binary '\0',_binary '\0',_binary '\0',_binary '\0'),(13,'Adrian','Kowalski','organizator@gmail.com','org','$2a$10$J8T6uDr.arVEmqQTiItMrunLAxG.VPWnUQdHBTDdfcvkIGpwRet0u','7a4301f8-21b7-42b5-ab36-b4d6d0c5dac8',NULL,'ORG','2026-04-09 15:16:24',1,_binary '',NULL,NULL,'','',_binary '\0',0,0,NULL,NULL,NULL,'B7VEE6WTNY6OWJOQCQ54MXTC6ORKA4U4',_binary '\0',_binary '\0',_binary '\0',_binary '\0',_binary '\0',_binary '\0',_binary '\0',_binary '\0',_binary '\0',NULL,NULL,_binary '',_binary '',_binary '',_binary '',_binary '\0'),(15,'t','t','a@fes.s','usr1','$2a$10$eAV4oMI/U52wlE/ckDCuaO/EK32lg85PhDn8ydZMbAJ15S0RDlXIu','YGTS4BJFXP4PCJR8XCY7JEP35HKUPKCY',NULL,'ORG','2026-04-26 09:45:30',1,_binary '','U79DQY','2026-04-26 12:00:30.410438','','',_binary '\0',0,0,NULL,NULL,NULL,NULL,_binary '\0',_binary '\0',_binary '\0',_binary '\0',_binary '\0',_binary '\0',_binary '\0',_binary '\0',_binary '\0',NULL,NULL,_binary '\0',_binary '\0',_binary '\0',_binary '\0',_binary '\0'),(16,'t','t','ae@fes.s','usr2','$2a$10$yXGYO/Nhzf0g.DbLR95owOSGJl7bAMQQF4tI.daf1jZREOICWXj9y','HGF872XKFS63HAT9YUNXUEHZFFFR2NXV',NULL,'USER','2026-04-26 09:45:54',1,_binary '','L8BQT8','2026-04-26 12:00:53.923952','','',_binary '\0',0,0,NULL,NULL,NULL,NULL,_binary '',_binary '\0',_binary '\0',_binary '\0',_binary '\0',_binary '\0',_binary '\0',_binary '\0',_binary '\0',NULL,NULL,_binary '\0',_binary '\0',_binary '\0',_binary '\0',_binary '\0'),(17,'mat','cho','mchochorowski2@gmail.com','user2','$2a$10$ZpNVT/D7UVUUYRB.XNXHzexn.QXDI5nG.JKX6W1BLvLG5H83w1Ace','W6T738G9XWS39DSCDYGJB5EWRZ92CGFB','','USER','2026-05-18 12:20:21',1,_binary '','2VZCCD','2026-05-18 14:35:21.299687','RELATIVE','LOGOUT',_binary '',30,1,NULL,_binary '\0','IX3TV5KH2MA5NRNDXC2R7U3EAEOOC3GJ','R4LBQNLXM5WNY2DALRS7YCIYPJ2363K4',_binary '',_binary '',_binary '',_binary '',_binary '',_binary '',_binary '\0',_binary '\0',_binary '\0','',61.00,_binary '\0',_binary '\0',_binary '\0',_binary '\0',_binary '\0'),(18,'mat','cho','mchochorowski3@gmail.com','org2','$2a$10$EL.7YhEm7irKhsaIYVryou4.2ziWhlWm54JPma/oZxtMBWunmB5iW','U3BQ5BXR2D4EFW2XATZWKCMZDSSTCUQN',NULL,'ORG','2026-05-18 12:20:33',1,_binary '','S32HRX','2026-05-18 14:35:32.901118','RELATIVE','LOGOUT',_binary '',30,1,NULL,_binary '\0',NULL,NULL,_binary '\0',_binary '\0',_binary '\0',_binary '\0',_binary '\0',_binary '\0',_binary '\0',_binary '\0',_binary '\0',NULL,NULL,_binary '\0',_binary '\0',_binary '\0',_binary '\0',_binary '\0'),(19,'mat','cho','mchochorowski7@gmail.com','jkjk','$2a$10$sPxV2..QPhwWivlm7jxXCewkrFHLCy0CS1znBj/1YTwX3gL4PE/pi','4VQRG3PKBPWV3TR4HNNJVKC2ZC3LXERW',NULL,'USER','2026-05-18 15:58:48',1,_binary '\0','QATZQF','2026-05-18 18:13:48.443567','RELATIVE','LOGOUT',_binary '',30,1,NULL,_binary '\0',NULL,NULL,_binary '\0',_binary '\0',_binary '\0',_binary '\0',_binary '\0',_binary '\0',_binary '\0',_binary '\0',_binary '\0',NULL,NULL,_binary '\0',_binary '\0',_binary '\0',_binary '\0',_binary '\0'),(20,'mat','cho','mchochorowski01@gmail.com','user4','$2a$10$xA4eXvwrC1MPqQz3mzdYfOEnSmGYVYYfRJZhr4IFJQP/3j4gLckGW','T8W6K6VK4QVAQBURLAUPV96YXTHP76T2',NULL,'USER','2026-05-27 08:59:57',1,_binary '','W5UQQ2','2026-05-27 11:14:57.412587','RELATIVE','LOGOUT',_binary '',30,1,NULL,_binary '\0',NULL,NULL,_binary '',_binary '',_binary '\0',_binary '',_binary '',_binary '',_binary '\0',_binary '\0',_binary '\0',NULL,NULL,_binary '\0',_binary '\0',_binary '\0',_binary '\0',_binary '\0');
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
  `org_sold_out_notified_at` datetime(6) DEFAULT NULL,
  `org_start_reminder_sent_at` datetime(6) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `id` (`id`),
  KEY `org_id` (`org_id`),
  KEY `kategoria_id` (`kategoria_id`),
  KEY `fk_wydarzenia_sala` (`sala_id`),
  CONSTRAINT `fk_wydarzenia_sala` FOREIGN KEY (`sala_id`) REFERENCES `sale` (`id`),
  CONSTRAINT `wydarzenia_ibfk_1` FOREIGN KEY (`org_id`) REFERENCES `organizator` (`id`),
  CONSTRAINT `wydarzenia_ibfk_3` FOREIGN KEY (`kategoria_id`) REFERENCES `kategorie` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `wydarzenia`
--

LOCK TABLES `wydarzenia` WRITE;
/*!40000 ALTER TABLE `wydarzenia` DISABLE KEYS */;
INSERT INTO `wydarzenia` VALUES (1,1,'WYD','Wydarzenie',1,'TEST','2026-04-08 11:35:51','AKTYWNY','2026-04-24 08:00:00','2026-04-30 08:00:00',1,NULL,NULL),(2,3,'AS','asdsa',1,'@@','2026-04-09 14:32:15','AKTYWNY','2026-04-16 08:34:00','2026-04-23 09:41:00',3,NULL,NULL),(3,4,'Event','-',1,'-','2026-04-09 15:31:45','AKTYWNY','2026-04-17 08:44:00','2026-07-31 04:00:00',4,NULL,NULL),(4,5,'ZZ','ASD',1,'ASASAS','2026-05-01 06:50:52','AKTYWNY','2026-04-30 08:12:00','2026-05-28 08:12:00',5,NULL,NULL),(5,5,'Wyd_test0905','Opis_test',2,'Rola_test','2026-05-09 12:07:09','AKTYWNY','2026-05-30 08:22:00','2026-05-31 08:22:00',6,NULL,NULL),(6,4,'ss','ss',1,'ss','2026-05-18 19:04:03','AKTYWNY','2004-10-08 04:10:00','2005-10-08 04:10:00',4,NULL,NULL),(7,4,'ss','ss',1,'ss','2026-05-18 19:05:07','NIEAKTYWNY','2004-10-08 04:10:00','2005-10-08 04:10:00',4,NULL,NULL),(8,4,'widzisz mnie','opis',3,'ro.a','2026-05-20 14:56:47','AKTYWNY','2004-10-08 04:10:00','2004-10-08 04:15:00',4,NULL,NULL),(9,4,'nie wiem','opis',1,'rola','2026-05-20 15:56:06','AKTYWNY','2026-05-20 17:00:00','2026-05-23 18:00:00',4,NULL,NULL),(10,7,'ss','ss',1,'rola','2026-05-21 07:55:06','AKTYWNY','2004-10-08 04:10:00','2004-10-08 04:15:00',9,NULL,NULL);
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
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `wyst_bilety`
--

LOCK TABLES `wyst_bilety` WRITE;
/*!40000 ALTER TABLE `wyst_bilety` DISABLE KEYS */;
INSERT INTO `wyst_bilety` VALUES (1,1,'EV-1-0-4253','aktywny',NULL,'2026-05-01 09:26:57.638321',1,NULL,NULL),(2,3,'EV-2-0-1983','aktywny',NULL,'2026-05-15 14:18:04.294370',2,'seat-1778334750246',NULL),(3,2,'EV-3-0-9307','zwrocony',NULL,'2026-05-15 17:10:06.429831',3,NULL,'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAASwAAAEsAQAAAABRBrPYAAABTElEQVR4Xu3ZMXKDMBQE0J9xQekj+CgcTRyNo3AElxQZE+3qCwFJZlx6vnYbW9JTtwOSbds7edp15s+IXfLhbLWWfXDbljZ7E4vKRu/BQvaVJ8lqPSaxuOxVS5EnZ3xPdY/ZXawb1hoi1hNby5NiEuuEYSWnsFdeKQOPWFzWUhkbskcsKDvF96TzrFg6zwZhXMnPg29jQ04ZIQ5FEgvFPJPZYyuLvseG/VYgFpLxVWDowYI9c2OG3wIOJwexcMz82rfhvVCPBBvrgpXkDRGLxnLYEKQyNgQDCLHArGUtPJF5puORoEQsBPMVBrNel3w+GMogsSFiEdmI1ZyFe/gq8IbM2CAWmLEUfhqsDanh+UCsE3bHRzkN8lbwT0PEQjEOuHKoy++GiEVhmCgrPph4BxzwR+/hVwKxcKwFbG8IToN4LphYUPZOxC7piP0AvcfCd0bPHB8AAAAASUVORK5CYII='),(4,2,'EV-4-0-2469','zwrocony',NULL,'2026-05-18 17:21:16.376766',4,NULL,'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAASwAAAEsAQAAAABRBrPYAAABPElEQVR4Xu2XOxLCMAxExVBQcgSOkqM5R8tRfARKFwxGP9txhoKSUXaraPXU7Sgy1V/0pKPzVcAO+nOs0FAvrjUP9wosKrZ4DrJiFzYVa/FYgcXF3i0UbG7yndoM0R3YabCREGBnwoptihXYSTDpsAx7c8cKF7C42FDDNCFdwIJik3wmzS6wNLtBMO3wPniRJmTSIsQuSMCCYVqkatp85rGPC7CQGGt/DVKPi+hS20kALB5WrNBQcKOdBFUTIg/C5EECFhWrNUtcNp9h3eQLWFxsks5wx5fDIl7fIcCCYcUclbj6kyDZFMcgAQuHLVKycp/RhFQ9DaejEVg0bFyD3jHd7FXQlgOw4NiQsXf5BBYfK72T9Rr0DrComNjasRl/A8pykFfBCiwsNiRFfxBKQmQvELCg2C8CdtCJsA8ZBTIxt1NYOQAAAABJRU5ErkJggg=='),(5,3,'EV-5-0-9279','aktywny',NULL,'2026-05-20 17:05:54.410468',5,'seat-1778334756379','data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAASwAAAEsAQAAAABRBrPYAAABPklEQVR4Xu3YsXHDMAwFUPhcpMwIGUWjSaN5FI2QUoXPCPEJGqTiwqUP/L9xRD52/yAqou/kV84rL0N2yoezQyLPh6vusXoly8oW78EOdimLYK0eG1le9milKIs3+3ttZ0S+yaZh0RCymdhRJ8VGNgmznZLKHmWnPnjI8rJIY2jIM2RJ2RA/s46rZOu4moRhp8yDu6AhQxYTXZHIUrG4+6vKlyreC3f56etClpJ5Q9qrYDGOulguOlwJyPIxb4jGlQB1wQfhGg0hS8Xwxa+1FPbrwwFZTJDlZV3QkFIXnDn64UCWj/lwQEzi30BSrwT1DBpClpEttluy4wE7PiludoAsMUMp7DbYdrrgfkA2A4s0pq8aQpaNHf2kUH9J/G8IWRYWO/6wxTdg3AbJ8rHIcKYwtbkgZEnZOyE7ZSL2B1OWQrItm6RNAAAAAElFTkSuQmCC'),(6,9,'EV-6-0-5829','aktywny',NULL,'2026-06-06 12:53:20.104417',6,NULL,'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAASwAAAEsAQAAAABRBrPYAAABT0lEQVR4Xu2YsXHDMAxF4XORMiN4FI1Gj6ZRNIJLFrkg/CAoSEwKlzno/4oAHrt/AEjRd/SSOfOniE3651iVEIJbSz/vukX2TiwrtsAETRvssu6YZxEQy4p9dx9sHnw6VpG2gNglMEyBosSuh1lFiV0EQ7pXQhEQm4JEWAh39rmwi1hSbNLqzeEkYpNyYO6Qos0UwyH6JQ/tlZgLxLJhTdYP5FhBgONNbTUklhKr/bOnmcK04GxzQa1TSIwPYukw6wetoiofgNTtov0bSN0hxPJhghZwUkENB2DPMBKxVNhJ1R+EvhL0YIyPELEUWD04Q0c/8CHRNYy0i1gWbEGhybYAhR8Od2IbJJYQi/9exatgPAgd2x1CLDNW+xZgcwFJqPx2CLGMmAXFVwLBX4ASy4vh1DQcYv1gk/EgJJYXC/U7hplWJAuxpNg7IjbpQtgPG4YnbO/xEOIAAAAASUVORK5CYII='),(7,9,'EV-7-0-5118','aktywny',NULL,'2026-06-06 19:41:48.939982',7,NULL,'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAASwAAAEsAQAAAABRBrPYAAABSklEQVR4Xu2ZMbLCMAxEzaSg5AgchaPFR+MoOQJlCgbhlTcxMfCH8iN2K0t6SrUjZJPsE11Sn3kpYZ3+OTanJqRu6WB5sKllB2FRsROqRdNqF8ceAmFRsVv1wcTgwJ4ZabeLsPgYldkj7Jew864kayAsPgZTFFUMtZGBS1hcrAk9b7fBJmExsI2I9RLWKQbmDimmoB2qQ3BCnT3ComI7HK/paKhiJRgZeI+wqJiLCyAqCEYrQfmABw+/C8JCYQzcFGsl0SH1I8LCYj4CrigmDgeDXfa4EAqLi2209Di26K+LgLAvxuYWewBT5KH2JOyJRiMJi4edcCryLWCpTBgORrsIi4q1914Oh9wCrwiLj/Gpv66GBof446+w+Ni83gqSb4OYFPnZIcKiYFbl2KIjk5vrv7BgWFPtoUPMJ8W7P/iEfT/2iYR1+iHsDqa3AvbNtTUtAAAAAElFTkSuQmCC'),(8,9,'EV-8-0-1793','aktywny',NULL,'2026-06-06 20:02:23.331117',8,NULL,'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAASwAAAEsAQAAAABRBrPYAAABRUlEQVR4Xu2YMXLDMAwEmXGRMk/IU/g0+ml6ip6QkoUnDO8ICjKTwmUGui08BrBUdSPQTu0VvtLa+RNpC/9cq8lB8dbb91vbvXuTFlXLCEFnR1y2Q7MuCmlRte+Rg92KD9Mq2iykXULDFihN2vU0Tpq0i2hoj4njhbSlCKQ5OHPshQNpQbWFzV4OT0hbiKFZQkrroZgJaY/02cbE94K0eFpGBDp9Mn8D8uQ7Cl4NpQXVEorkq8D2As6wnkGSFk7LvYGJc2dc+AAiLaRmOSgPfBrF9I1vCiZEWkTtRD1fCfgAXg2lhdQqMzHAhO+Dc1zSXB8H0qJoGYPOuAXwfuBnni6N0qJp/n+vT05nZkKkRdYqvtlewG9AlOV3QqRF1DKahRrxK4G0gBq+dWZC7ExPyERaUM0ZZ7gKyIZmkRZUewVpCxfSfgBJfyUjTx/qLQAAAABJRU5ErkJggg=='),(9,9,'EV-9-0-8617','zwrocony',NULL,'2026-06-06 20:05:12.728331',9,NULL,'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAASwAAAEsAQAAAABRBrPYAAABQUlEQVR4Xu2YsZECMQxFzRBceCVQCqV5S9tStgRCB8wJ61u2Fg8B4Y38XwKSnon+rLUk+YZHmjsfoTbxz7WSHC0utb1d5fDulVpU7a4hqBwal31o1tWCWlTtr+XgsOLXtKJtFNSW0PQWyEJtPQ0TobaIpu02cbygNhWBNEfPjHthQC2oNrHbw+ENahMxNEtIlhqKnhB5ppu0id8L1KJpCAWoE2PTUicXwWpILagmYxtUzq//7Qf6vUAtppbteYCHw6ZxST/tbyA5J4RaIK1Up10FeB6gmfFZRlyohdTe8DM31NgPepAcaiE0TAzBFiAWFyTkYfcCtYjaXQeVA3HBfuBn+jZILaSGyXkBzDgzJ4RaZK3Hxe6FfobaChpCkaEVbftKQC2gpt8qruFMfQfsUAuqOScN7NrM1IJq30BtYiHtBe0dpCROw0DFAAAAAElFTkSuQmCC');
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
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `zamowienia`
--

LOCK TABLES `zamowienia` WRITE;
/*!40000 ALTER TABLE `zamowienia` DISABLE KEYS */;
INSERT INTO `zamowienia` VALUES (1,16,2,1,'2026-05-01 07:26:58',1,'PLN','zakonczone'),(2,16,3,3,'2026-05-15 12:18:04',1,'PLN','zakonczone'),(3,16,4,2,'2026-05-15 15:10:06',1,'PLN','zakonczone'),(4,17,5,2,'2026-05-18 15:21:16',1,'PLN','zakonczone'),(5,17,6,3,'2026-05-20 15:05:54',1,'PLN','zakonczone'),(6,17,7,9,'2026-06-06 10:53:20',1,'PLN','zakonczone'),(7,17,8,9,'2026-06-06 17:41:49',1,'PLN','zakonczone'),(8,17,9,9,'2026-06-06 18:02:23',1,'PLN','zakonczone'),(9,17,10,9,'2026-06-06 18:05:13',1,'PLN','zakonczone');
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
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `zwroty`
--

LOCK TABLES `zwroty` WRITE;
/*!40000 ALTER TABLE `zwroty` DISABLE KEYS */;
INSERT INTO `zwroty` VALUES (1,2,12.00,'PLN','TEST ZWR','oczekuje',1,0),(2,3,15.00,'PLN','TEST','oczekuje',1,0),(3,5,35.00,'PLN','bo tak','zaakceptowana',1,1),(4,4,35.00,'PLN','tak','zaakceptowana',1,1),(5,8,13.00,'PLN','powod zwrotu','oczekuje',1,0),(6,7,13.00,'PLN','powod zwrotu','oczekuje',1,0),(7,10,13.00,'PLN','xxx','zaakceptowana',1,1);
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

-- Dump completed on 2026-06-07 15:37:36
