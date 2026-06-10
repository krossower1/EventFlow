-- MySQL dump 10.13  Distrib 8.0.45, for Win64 (x86_64)
--
-- Host: localhost    Database: event_flow
-- ------------------------------------------------------
-- Server version	8.0.46

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
  `id` bigint NOT NULL AUTO_INCREMENT,
  `cena` decimal(38,2) DEFAULT NULL,
  `ilosc` int DEFAULT NULL,
  `kategoria_biletu` varchar(255) DEFAULT NULL,
  `klasa` varchar(255) DEFAULT NULL,
  `koniec_sprzedazy` datetime(6) DEFAULT NULL,
  `seat_ids` text,
  `start_sprzedazy` datetime(6) DEFAULT NULL,
  `waluta` varchar(255) DEFAULT NULL,
  `wydarzenie_id` bigint NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `bilety`
--

LOCK TABLES `bilety` WRITE;
/*!40000 ALTER TABLE `bilety` DISABLE KEYS */;
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `chat_messages`
--

LOCK TABLES `chat_messages` WRITE;
/*!40000 ALTER TABLE `chat_messages` DISABLE KEYS */;
/*!40000 ALTER TABLE `chat_messages` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `kategorie`
--

DROP TABLE IF EXISTS `kategorie`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `kategorie` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `created_by_user_id` bigint DEFAULT NULL,
  `nazwa` varchar(255) DEFAULT NULL,
  `opis` text,
  `systemowa` bit(1) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `kategorie`
--

LOCK TABLES `kategorie` WRITE;
/*!40000 ALTER TABLE `kategorie` DISABLE KEYS */;
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
  PRIMARY KEY (`id`),
  KEY `FK6bgjhgih3ewicdsp98bkq3wtl` (`user_id`),
  CONSTRAINT `FK6bgjhgih3ewicdsp98bkq3wtl` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=25 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `login_logs`
--

LOCK TABLES `login_logs` WRITE;
/*!40000 ALTER TABLE `login_logs` DISABLE KEYS */;
INSERT INTO `login_logs` VALUES (1,'Opera / Windows','Lokalnie','2026-06-10 19:32:50.794477','NIEUDANE_HASLO_LUB_LOGIN',1),(2,'Opera / Windows','Lokalnie','2026-06-10 20:49:03.717472','ZABLOKOWANO_BRAK_WERYFIKACJI_EMAIL',1),(3,'Opera / Windows','Lokalnie','2026-06-10 20:59:43.478437','ZABLOKOWANO_BRAK_WERYFIKACJI_EMAIL',1),(4,'Opera / Windows','Lokalnie','2026-06-10 20:59:57.131441','NIEUDANE_HASLO_LUB_LOGIN',1),(5,'Opera / Windows','Lokalnie','2026-06-10 20:59:59.058157','NIEUDANE_HASLO_LUB_LOGIN',1),(6,'Opera / Windows','Lokalnie','2026-06-10 21:10:24.011043','ZABLOKOWANO_BRAK_WERYFIKACJI_EMAIL',1),(7,'Opera / Windows','Lokalnie','2026-06-10 21:25:13.429953','ZABLOKOWANO_BRAK_WERYFIKACJI_EMAIL',1),(8,'Opera / Windows','Lokalnie','2026-06-10 21:27:41.990937','ZABLOKOWANO_BRAK_WERYFIKACJI_EMAIL',1),(9,'Opera / Windows','Lokalnie','2026-06-10 21:37:52.452693','SUKCES',18),(10,'Opera / Windows','Lokalnie','2026-06-10 21:56:41.799659','SUKCES',18),(11,'Opera / Windows','Lokalnie','2026-06-10 21:58:15.413149','SUKCES',19),(12,'Opera / Windows','Lokalnie','2026-06-10 22:07:39.517090','SUKCES',19),(13,'Opera / Windows','Lokalnie','2026-06-10 22:43:49.971607','ZABLOKOWANO_BRAK_WERYFIKACJI_EMAIL',1),(14,'Opera / Windows','Lokalnie','2026-06-10 22:43:56.840727','SUKCES',19),(15,'Opera / Windows','Lokalnie','2026-06-10 22:45:30.218097','ZABLOKOWANO_BRAK_WERYFIKACJI_EMAIL',1),(16,'Opera / Windows','Lokalnie','2026-06-10 22:47:14.562490','ZABLOKOWANO_BRAK_WERYFIKACJI_EMAIL',1),(17,'Opera / Windows','Lokalnie','2026-06-10 22:47:37.932043','SUKCES',1),(18,'Opera / Windows','Lokalnie','2026-06-10 22:49:26.313353','SUKCES',1),(19,'Opera / Windows','Lokalnie','2026-06-10 22:56:14.168665','SUKCES',1),(20,'Opera / Windows','Lokalnie','2026-06-10 23:05:54.515467','SUKCES',1),(21,'Opera / Windows','Lokalnie','2026-06-10 23:10:29.582902','SUKCES',1),(22,'Opera / Windows','Lokalnie','2026-06-10 23:14:43.624261','SUKCES',1),(23,'Opera / Windows','Lokalnie','2026-06-10 23:29:31.596595','SUKCES',1),(24,'Opera / Windows','Lokalnie','2026-06-10 23:44:53.256545','SUKCES',1);
/*!40000 ALTER TABLE `login_logs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `miejsca`
--

DROP TABLE IF EXISTS `miejsca`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `miejsca` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `ilosc_sal` int DEFAULT NULL,
  `kod_poczt` varchar(255) DEFAULT NULL,
  `miasto` varchar(255) DEFAULT NULL,
  `nazwa` varchar(255) DEFAULT NULL,
  `opis` text,
  `panstwo` varchar(255) DEFAULT NULL,
  `ulica` varchar(255) DEFAULT NULL,
  `user_id` bigint NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `miejsca`
--

LOCK TABLES `miejsca` WRITE;
/*!40000 ALTER TABLE `miejsca` DISABLE KEYS */;
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `opinie`
--

LOCK TABLES `opinie` WRITE;
/*!40000 ALTER TABLE `opinie` DISABLE KEYS */;
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `organizator`
--

LOCK TABLES `organizator` WRITE;
/*!40000 ALTER TABLE `organizator` DISABLE KEYS */;
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
INSERT INTO `patch_notes` VALUES (1,'Dzisiejsze zmiany 11.06.2026','Nieaktywne i zakończone wydarzenia są ukryte na liście wydarzeń.\nObserwowane wydarzenia pojawiają się wyżej i można je odobserwować.\nPo zaakceptowaniu zwrotu bilet znika z listy biletów użytkownika.\nPanel główny dostał krótki przewodnik po najważniejszych zakładkach.\nTest funkcji curdate.\nTest funkcji curdate z podglądem');
/*!40000 ALTER TABLE `patch_notes` ENABLE KEYS */;
UNLOCK TABLES;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = cp852 */ ;
/*!50003 SET character_set_results = cp852 */ ;
/*!50003 SET collation_connection  = cp852_general_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`root`@`%`*/ /*!50003 TRIGGER `tr_patch_notes_przed_insert` BEFORE INSERT ON `patch_notes` FOR EACH ROW BEGIN
  SET NEW.date_label = fn_patch_notes_etykieta_daty(NEW.date_label);
END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = cp852 */ ;
/*!50003 SET character_set_results = cp852 */ ;
/*!50003 SET collation_connection  = cp852_general_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`root`@`%`*/ /*!50003 TRIGGER `tr_patch_notes_po_insert` AFTER INSERT ON `patch_notes` FOR EACH ROW BEGIN
  INSERT INTO patch_notes_historia (
    patch_notes_id,
    akcja,
    stara_etykieta,
    nowa_etykieta,
    stary_tekst,
    nowy_tekst
  ) VALUES (
    NEW.id,
    'INSERT',
    NULL,
    NEW.date_label,
    NULL,
    NEW.items_text
  );
END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = cp852 */ ;
/*!50003 SET character_set_results = cp852 */ ;
/*!50003 SET collation_connection  = cp852_general_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`root`@`%`*/ /*!50003 TRIGGER `tr_patch_notes_przed_update` BEFORE UPDATE ON `patch_notes` FOR EACH ROW BEGIN
  SET NEW.date_label = fn_patch_notes_etykieta_daty(NEW.date_label);
END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = cp852 */ ;
/*!50003 SET character_set_results = cp852 */ ;
/*!50003 SET collation_connection  = cp852_general_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`root`@`%`*/ /*!50003 TRIGGER `tr_patch_notes_po_update` AFTER UPDATE ON `patch_notes` FOR EACH ROW BEGIN
  IF NOT (OLD.date_label <=> NEW.date_label)
     OR NOT (OLD.items_text <=> NEW.items_text) THEN
    INSERT INTO patch_notes_historia (
      patch_notes_id,
      akcja,
      stara_etykieta,
      nowa_etykieta,
      stary_tekst,
      nowy_tekst
    ) VALUES (
      NEW.id,
      'UPDATE',
      OLD.date_label,
      NEW.date_label,
      OLD.items_text,
      NEW.items_text
    );
  END IF;
END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;

--
-- Table structure for table `patch_notes_historia`
--

DROP TABLE IF EXISTS `patch_notes_historia`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `patch_notes_historia` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `patch_notes_id` bigint NOT NULL,
  `akcja` enum('INSERT','UPDATE') NOT NULL,
  `stara_etykieta` varchar(255) DEFAULT NULL,
  `nowa_etykieta` varchar(255) DEFAULT NULL,
  `stary_tekst` text,
  `nowy_tekst` text,
  `zapisano_o` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_patch_notes_id` (`patch_notes_id`),
  KEY `idx_zapisano_o` (`zapisano_o`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `patch_notes_historia`
--

LOCK TABLES `patch_notes_historia` WRITE;
/*!40000 ALTER TABLE `patch_notes_historia` DISABLE KEYS */;
INSERT INTO `patch_notes_historia` VALUES (1,1,'UPDATE','Zmiany dnia 29.05.2026','Zmiany dnia 10.06.2026','Nieaktywne i zakończone wydarzenia są ukryte na liście wydarzeń.\nObserwowane wydarzenia pojawiają się wyżej i można je odobserwować.\nPo zaakceptowaniu zwrotu bilet znika z listy biletów użytkownika.\nPanel główny dostał krótki przewodnik po najważniejszych zakładkach.','Nieaktywne i zakończone wydarzenia są ukryte na liście wydarzeń.\nObserwowane wydarzenia pojawiają się wyżej i można je odobserwować.\nPo zaakceptowaniu zwrotu bilet znika z listy biletów użytkownika.\nPanel główny dostał krótki przewodnik po najważniejszych zakładkach.','2026-06-10 22:49:42'),(2,1,'UPDATE','Zmiany dnia 10.06.2026','Zmiany dnia 10.06.2026','Nieaktywne i zakończone wydarzenia są ukryte na liście wydarzeń.\nObserwowane wydarzenia pojawiają się wyżej i można je odobserwować.\nPo zaakceptowaniu zwrotu bilet znika z listy biletów użytkownika.\nPanel główny dostał krótki przewodnik po najważniejszych zakładkach.','Nieaktywne i zakończone wydarzenia są ukryte na liście wydarzeń.\nObserwowane wydarzenia pojawiają się wyżej i można je odobserwować.\nPo zaakceptowaniu zwrotu bilet znika z listy biletów użytkownika.\nPanel główny dostał krótki przewodnik po najważniejszych zakładkach.\nTest funkcji curdate.','2026-06-10 22:51:13'),(3,1,'UPDATE','Zmiany dnia 10.06.2026','s','Nieaktywne i zakończone wydarzenia są ukryte na liście wydarzeń.\nObserwowane wydarzenia pojawiają się wyżej i można je odobserwować.\nPo zaakceptowaniu zwrotu bilet znika z listy biletów użytkownika.\nPanel główny dostał krótki przewodnik po najważniejszych zakładkach.\nTest funkcji curdate.','Nieaktywne i zakończone wydarzenia są ukryte na liście wydarzeń.\nObserwowane wydarzenia pojawiają się wyżej i można je odobserwować.\nPo zaakceptowaniu zwrotu bilet znika z listy biletów użytkownika.\nPanel główny dostał krótki przewodnik po najważniejszych zakładkach.\nTest funkcji curdate.','2026-06-10 23:02:38'),(4,1,'UPDATE','s','Zmiany dnia 10.06.2026','Nieaktywne i zakończone wydarzenia są ukryte na liście wydarzeń.\nObserwowane wydarzenia pojawiają się wyżej i można je odobserwować.\nPo zaakceptowaniu zwrotu bilet znika z listy biletów użytkownika.\nPanel główny dostał krótki przewodnik po najważniejszych zakładkach.\nTest funkcji curdate.','Nieaktywne i zakończone wydarzenia są ukryte na liście wydarzeń.\nObserwowane wydarzenia pojawiają się wyżej i można je odobserwować.\nPo zaakceptowaniu zwrotu bilet znika z listy biletów użytkownika.\nPanel główny dostał krótki przewodnik po najważniejszych zakładkach.\nTest funkcji curdate.','2026-06-10 23:11:59'),(5,1,'UPDATE','Zmiany dnia 10.06.2026','Dzisiejsze zmiany 11.06.2026','Nieaktywne i zakończone wydarzenia są ukryte na liście wydarzeń.\nObserwowane wydarzenia pojawiają się wyżej i można je odobserwować.\nPo zaakceptowaniu zwrotu bilet znika z listy biletów użytkownika.\nPanel główny dostał krótki przewodnik po najważniejszych zakładkach.\nTest funkcji curdate.','Nieaktywne i zakończone wydarzenia są ukryte na liście wydarzeń.\nObserwowane wydarzenia pojawiają się wyżej i można je odobserwować.\nPo zaakceptowaniu zwrotu bilet znika z listy biletów użytkownika.\nPanel główny dostał krótki przewodnik po najważniejszych zakładkach.\nTest funkcji curdate.','2026-06-10 23:16:36'),(6,1,'UPDATE','Dzisiejsze zmiany 11.06.2026','Dzisiejsze zmiany 11.06.2026','Nieaktywne i zakończone wydarzenia są ukryte na liście wydarzeń.\nObserwowane wydarzenia pojawiają się wyżej i można je odobserwować.\nPo zaakceptowaniu zwrotu bilet znika z listy biletów użytkownika.\nPanel główny dostał krótki przewodnik po najważniejszych zakładkach.\nTest funkcji curdate.','Nieaktywne i zakończone wydarzenia są ukryte na liście wydarzeń.\nObserwowane wydarzenia pojawiają się wyżej i można je odobserwować.\nPo zaakceptowaniu zwrotu bilet znika z listy biletów użytkownika.\nPanel główny dostał krótki przewodnik po najważniejszych zakładkach.\nTest funkcji curdate.\nTest funkcji curdate z podglądem','2026-06-10 23:17:04');
/*!40000 ALTER TABLE `patch_notes_historia` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `personel`
--

DROP TABLE IF EXISTS `personel`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `personel` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `data_zajet` datetime(6) DEFAULT NULL,
  `rola` varchar(255) DEFAULT NULL,
  `user_id` bigint NOT NULL,
  `wyd_id` bigint NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `personel`
--

LOCK TABLES `personel` WRITE;
/*!40000 ALTER TABLE `personel` DISABLE KEYS */;
/*!40000 ALTER TABLE `personel` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `platnosci`
--

DROP TABLE IF EXISTS `platnosci`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `platnosci` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `data` datetime(6) DEFAULT NULL,
  `metoda` varchar(255) DEFAULT NULL,
  `stan` varchar(255) DEFAULT NULL,
  `tranz_id` varchar(255) DEFAULT NULL,
  `zgodnosc` bit(1) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `platnosci`
--

LOCK TABLES `platnosci` WRITE;
/*!40000 ALTER TABLE `platnosci` DISABLE KEYS */;
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `poz_zam`
--

LOCK TABLES `poz_zam` WRITE;
/*!40000 ALTER TABLE `poz_zam` DISABLE KEYS */;
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
  `base_label` varchar(255) DEFAULT NULL,
  `item_height` int DEFAULT NULL,
  `item_type` varchar(255) NOT NULL,
  `rotation_deg` int NOT NULL,
  `row_label` varchar(255) DEFAULT NULL,
  `seat_key` varchar(255) NOT NULL,
  `item_width` int DEFAULT NULL,
  `pos_x` int NOT NULL,
  `pos_y` int NOT NULL,
  `sala_id` bigint NOT NULL,
  PRIMARY KEY (`id`),
  KEY `FK13uof5nahysh1uo3ajispmgif` (`sala_id`),
  CONSTRAINT `FK13uof5nahysh1uo3ajispmgif` FOREIGN KEY (`sala_id`) REFERENCES `sale` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `sala_miejsca`
--

LOCK TABLES `sala_miejsca` WRITE;
/*!40000 ALTER TABLE `sala_miejsca` DISABLE KEYS */;
/*!40000 ALTER TABLE `sala_miejsca` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `sale`
--

DROP TABLE IF EXISTS `sale`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `sale` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `layout_height` int DEFAULT NULL,
  `layout_width` int DEFAULT NULL,
  `ma_plan` bit(1) DEFAULT NULL,
  `miejsce_id` bigint NOT NULL,
  `nazwa` varchar(255) DEFAULT NULL,
  `pietro` int DEFAULT NULL,
  `pojemnosc` int DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `sale`
--

LOCK TABLES `sale` WRITE;
/*!40000 ALTER TABLE `sale` DISABLE KEYS */;
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
  KEY `FKfsioohkpqvoampsgrewia36d8` (`actor_user_id`),
  KEY `FK8l3hy6ef7p9vgws6jqre1wwnk` (`ticket_id`),
  CONSTRAINT `FK8l3hy6ef7p9vgws6jqre1wwnk` FOREIGN KEY (`ticket_id`) REFERENCES `security_tickets` (`id`),
  CONSTRAINT `FKfsioohkpqvoampsgrewia36d8` FOREIGN KEY (`actor_user_id`) REFERENCES `users` (`id`)
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
  PRIMARY KEY (`id`),
  KEY `FK9serm02iyyqbti5n4kfd3depl` (`affected_user_id`),
  KEY `FKb7pvxr0rngatixg372dpgilc2` (`assigned_admin_id`),
  KEY `FKk2iq1ul3dp3yy4i8ipdre3o8h` (`reporter_user_id`),
  CONSTRAINT `FK9serm02iyyqbti5n4kfd3depl` FOREIGN KEY (`affected_user_id`) REFERENCES `users` (`id`),
  CONSTRAINT `FKb7pvxr0rngatixg372dpgilc2` FOREIGN KEY (`assigned_admin_id`) REFERENCES `users` (`id`),
  CONSTRAINT `FKk2iq1ul3dp3yy4i8ipdre3o8h` FOREIGN KEY (`reporter_user_id`) REFERENCES `users` (`id`)
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user_favorites`
--

LOCK TABLES `user_favorites` WRITE;
/*!40000 ALTER TABLE `user_favorites` DISABLE KEYS */;
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
) ENGINE=InnoDB AUTO_INCREMENT=49 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user_notifications`
--

LOCK TABLES `user_notifications` WRITE;
/*!40000 ALTER TABLE `user_notifications` DISABLE KEYS */;
INSERT INTO `user_notifications` VALUES (1,'2026-06-10 22:47:37.948113','Administrator admin zalogował się do systemu.',_binary '\0','ADMIN_LOGIN',14),(2,'2026-06-10 22:47:37.948113','Administrator admin zalogował się do systemu.',_binary '\0','ADMIN_LOGIN',15),(3,'2026-06-10 22:47:37.948113','Administrator admin zalogował się do systemu.',_binary '\0','ADMIN_LOGIN',16),(4,'2026-06-10 22:47:37.948113','Administrator admin zalogował się do systemu.',_binary '\0','ADMIN_LOGIN',17),(5,'2026-06-10 22:47:37.948113','Administrator admin zalogował się do systemu.',_binary '\0','ADMIN_LOGIN',18),(6,'2026-06-10 22:47:37.948113','Administrator admin zalogował się do systemu.',_binary '\0','ADMIN_LOGIN',19),(7,'2026-06-10 22:49:26.326510','Administrator admin zalogował się do systemu.',_binary '\0','ADMIN_LOGIN',14),(8,'2026-06-10 22:49:26.326510','Administrator admin zalogował się do systemu.',_binary '\0','ADMIN_LOGIN',15),(9,'2026-06-10 22:49:26.326510','Administrator admin zalogował się do systemu.',_binary '\0','ADMIN_LOGIN',16),(10,'2026-06-10 22:49:26.326510','Administrator admin zalogował się do systemu.',_binary '\0','ADMIN_LOGIN',17),(11,'2026-06-10 22:49:26.326510','Administrator admin zalogował się do systemu.',_binary '\0','ADMIN_LOGIN',18),(12,'2026-06-10 22:49:26.326510','Administrator admin zalogował się do systemu.',_binary '\0','ADMIN_LOGIN',19),(13,'2026-06-10 22:56:14.206030','Administrator admin zalogował się do systemu.',_binary '\0','ADMIN_LOGIN',14),(14,'2026-06-10 22:56:14.206030','Administrator admin zalogował się do systemu.',_binary '\0','ADMIN_LOGIN',15),(15,'2026-06-10 22:56:14.206030','Administrator admin zalogował się do systemu.',_binary '\0','ADMIN_LOGIN',16),(16,'2026-06-10 22:56:14.206030','Administrator admin zalogował się do systemu.',_binary '\0','ADMIN_LOGIN',17),(17,'2026-06-10 22:56:14.206030','Administrator admin zalogował się do systemu.',_binary '\0','ADMIN_LOGIN',18),(18,'2026-06-10 22:56:14.206030','Administrator admin zalogował się do systemu.',_binary '\0','ADMIN_LOGIN',19),(19,'2026-06-10 23:05:54.554182','Administrator admin zalogował się do systemu.',_binary '\0','ADMIN_LOGIN',14),(20,'2026-06-10 23:05:54.554182','Administrator admin zalogował się do systemu.',_binary '\0','ADMIN_LOGIN',15),(21,'2026-06-10 23:05:54.554182','Administrator admin zalogował się do systemu.',_binary '\0','ADMIN_LOGIN',16),(22,'2026-06-10 23:05:54.554182','Administrator admin zalogował się do systemu.',_binary '\0','ADMIN_LOGIN',17),(23,'2026-06-10 23:05:54.554182','Administrator admin zalogował się do systemu.',_binary '\0','ADMIN_LOGIN',18),(24,'2026-06-10 23:05:54.554182','Administrator admin zalogował się do systemu.',_binary '\0','ADMIN_LOGIN',19),(25,'2026-06-10 23:10:29.596109','Administrator admin zalogował się do systemu.',_binary '\0','ADMIN_LOGIN',14),(26,'2026-06-10 23:10:29.596109','Administrator admin zalogował się do systemu.',_binary '\0','ADMIN_LOGIN',15),(27,'2026-06-10 23:10:29.596109','Administrator admin zalogował się do systemu.',_binary '\0','ADMIN_LOGIN',16),(28,'2026-06-10 23:10:29.596109','Administrator admin zalogował się do systemu.',_binary '\0','ADMIN_LOGIN',17),(29,'2026-06-10 23:10:29.596109','Administrator admin zalogował się do systemu.',_binary '\0','ADMIN_LOGIN',18),(30,'2026-06-10 23:10:29.596109','Administrator admin zalogował się do systemu.',_binary '\0','ADMIN_LOGIN',19),(31,'2026-06-10 23:14:43.634860','Administrator admin zalogował się do systemu.',_binary '\0','ADMIN_LOGIN',14),(32,'2026-06-10 23:14:43.634860','Administrator admin zalogował się do systemu.',_binary '\0','ADMIN_LOGIN',15),(33,'2026-06-10 23:14:43.634860','Administrator admin zalogował się do systemu.',_binary '\0','ADMIN_LOGIN',16),(34,'2026-06-10 23:14:43.634860','Administrator admin zalogował się do systemu.',_binary '\0','ADMIN_LOGIN',17),(35,'2026-06-10 23:14:43.634860','Administrator admin zalogował się do systemu.',_binary '\0','ADMIN_LOGIN',18),(36,'2026-06-10 23:14:43.634860','Administrator admin zalogował się do systemu.',_binary '\0','ADMIN_LOGIN',19),(37,'2026-06-10 23:29:31.649037','Administrator admin zalogował się do systemu.',_binary '\0','ADMIN_LOGIN',14),(38,'2026-06-10 23:29:31.649037','Administrator admin zalogował się do systemu.',_binary '\0','ADMIN_LOGIN',15),(39,'2026-06-10 23:29:31.649037','Administrator admin zalogował się do systemu.',_binary '\0','ADMIN_LOGIN',16),(40,'2026-06-10 23:29:31.649037','Administrator admin zalogował się do systemu.',_binary '\0','ADMIN_LOGIN',17),(41,'2026-06-10 23:29:31.649037','Administrator admin zalogował się do systemu.',_binary '\0','ADMIN_LOGIN',18),(42,'2026-06-10 23:29:31.649037','Administrator admin zalogował się do systemu.',_binary '\0','ADMIN_LOGIN',19),(43,'2026-06-10 23:44:53.330775','Administrator admin zalogował się do systemu.',_binary '\0','ADMIN_LOGIN',14),(44,'2026-06-10 23:44:53.330775','Administrator admin zalogował się do systemu.',_binary '\0','ADMIN_LOGIN',15),(45,'2026-06-10 23:44:53.330775','Administrator admin zalogował się do systemu.',_binary '\0','ADMIN_LOGIN',16),(46,'2026-06-10 23:44:53.330775','Administrator admin zalogował się do systemu.',_binary '\0','ADMIN_LOGIN',17),(47,'2026-06-10 23:44:53.330775','Administrator admin zalogował się do systemu.',_binary '\0','ADMIN_LOGIN',18),(48,'2026-06-10 23:44:53.330775','Administrator admin zalogował się do systemu.',_binary '\0','ADMIN_LOGIN',19);
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
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
  `id` bigint NOT NULL AUTO_INCREMENT,
  `aktywnosc` bit(1) DEFAULT NULL,
  `bank_account_number` varchar(32) DEFAULT NULL,
  `data_utw` datetime(6) DEFAULT NULL,
  `email` varchar(255) NOT NULL,
  `email_verified` bit(1) DEFAULT NULL,
  `haslo` text NOT NULL,
  `imie` varchar(255) DEFAULT NULL,
  `login` varchar(255) NOT NULL,
  `nazwisko` varchar(255) DEFAULT NULL,
  `notify_admin_login` bit(1) NOT NULL,
  `notify_favorite_login` bit(1) NOT NULL,
  `notify_new_event` bit(1) NOT NULL,
  `notify_new_organizer_request` bit(1) NOT NULL,
  `notify_new_refund_request` bit(1) NOT NULL,
  `notify_new_security_report` bit(1) NOT NULL,
  `notify_observed_event_end` bit(1) NOT NULL,
  `notify_observed_event_start` bit(1) NOT NULL,
  `notify_observed_seat_freed` bit(1) NOT NULL,
  `notify_org_event_join` bit(1) NOT NULL,
  `notify_org_event_refund` bit(1) NOT NULL,
  `notify_org_event_review` bit(1) NOT NULL,
  `notify_org_event_sold_out` bit(1) NOT NULL,
  `notify_org_event_start` bit(1) NOT NULL,
  `platnosc` text,
  `rola` varchar(255) DEFAULT NULL,
  `salt` text NOT NULL,
  `session_count_mode` varchar(24) NOT NULL,
  `session_expiry_action` varchar(24) NOT NULL,
  `session_timeout_enabled` bit(1) NOT NULL,
  `session_timeout_minutes` int NOT NULL,
  `session_warning_minutes` int NOT NULL,
  `telefon` varchar(255) DEFAULT NULL,
  `two_factor_enabled` bit(1) DEFAULT NULL,
  `two_factor_secret` varchar(128) DEFAULT NULL,
  `two_factor_temp_secret` varchar(128) DEFAULT NULL,
  `verification_code` varchar(6) DEFAULT NULL,
  `verification_code_expires_at` datetime(6) DEFAULT NULL,
  `wallet_balance` decimal(38,2) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UK_6dotkott2kjsp8vw4d0m25fb7` (`email`),
  UNIQUE KEY `UK_ow0gan20590jrb00upg3va2fn` (`login`),
  UNIQUE KEY `UK_9edtej9p4mjytxr91dkw14v7n` (`telefon`)
) ENGINE=InnoDB AUTO_INCREMENT=20 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,_binary '',NULL,'2026-06-10 19:31:59.924903','admin@example.com',_binary '','$2a$10$o51DVTOo.c8o7BnoLwonLuSU30ZzhFbR31FT2zUTSYhEUaszUAdn.',NULL,'admin',NULL,_binary '',_binary '\0',_binary '',_binary '',_binary '',_binary '',_binary '',_binary '',_binary '',_binary '',_binary '',_binary '',_binary '',_binary '',NULL,'ADMIN','cb735f89-dce6-4e96-9741-eb03ea57af09','RELATIVE','LOGOUT',_binary '',30,1,NULL,_binary '\0',NULL,NULL,NULL,NULL,0.00),(14,_binary '',NULL,'2026-06-10 21:24:09.567368','jan.kowalski@test.com',_binary '\0','$2a$10$0sq9lqhxCTQuWN7GG0KwoOItX7BKj3jNMJttHERsfOM00sJ5glvMK','Jan','jankow99','Kowalski',_binary '',_binary '\0',_binary '',_binary '',_binary '',_binary '',_binary '',_binary '',_binary '',_binary '',_binary '',_binary '',_binary '',_binary '',NULL,'USER','T75UTSSSHRVXHDWQBQ8N4DL3RLRR5Z4Y','RELATIVE','LOGOUT',_binary '',30,1,NULL,_binary '\0',NULL,NULL,'DKP7Q6','2026-06-10 21:39:09.567368',0.00),(15,_binary '',NULL,'2026-06-10 21:26:18.628706','mchochorowski1@gmail.com',_binary '\0','$2a$10$RhzFu3Tn6QIeh.IteyZGWOuWuxqtrOyhs1tCphRtr8gz4O.r3HtWi','mat','adminn','cho',_binary '',_binary '\0',_binary '',_binary '',_binary '',_binary '',_binary '',_binary '',_binary '',_binary '',_binary '',_binary '',_binary '',_binary '',NULL,'USER','MZN3A2K23A27994DTJJW7E5YZ3NYLN5B','RELATIVE','LOGOUT',_binary '',30,1,NULL,_binary '\0',NULL,NULL,'MS32ZY','2026-06-10 21:41:18.628706',0.00),(16,_binary '',NULL,'2026-06-10 21:30:29.444695','jan.kowalski2@test.com',_binary '\0','$2a$10$MixKRTiB7Cr6dMapUujEpuC4ajBX767je..6.uxlNHEZ52dRrQj7u','Jan','jankow77','Kowalski',_binary '',_binary '\0',_binary '',_binary '',_binary '',_binary '',_binary '',_binary '',_binary '',_binary '',_binary '',_binary '',_binary '',_binary '',NULL,'USER','5E4X2QN9LJ45WGMTMKWYFGDDVQD2RMB2','RELATIVE','LOGOUT',_binary '',30,1,NULL,_binary '\0',NULL,NULL,'3UFNF2','2026-06-10 21:45:29.444695',0.00),(17,_binary '',NULL,'2026-06-10 21:32:59.315133','anna55@test.com',_binary '\0','$2a$10$SFo5e8usRiPQPO5u7L4DcOdLqnDeOHwX/zhL3pqRTtRhsvidjoKj6','Anna','annanow55','Nowak',_binary '',_binary '\0',_binary '',_binary '',_binary '',_binary '',_binary '',_binary '',_binary '',_binary '',_binary '',_binary '',_binary '',_binary '',NULL,'USER','KQJJGQUQ2MVKXXDEMQTAFVLENN2J5A34','RELATIVE','LOGOUT',_binary '',30,1,NULL,_binary '\0',NULL,NULL,'KKP286','2026-06-10 21:47:59.315133',0.00),(18,_binary '',NULL,'2026-06-10 21:35:13.626231','mchochorowski10@gmail.com',_binary '','$2a$10$exJFLmAqdjeu8aOOSkqOLOLOhchMr5gz8ppJhwRiKQbKktn.v8cCK','mat','adminnn','cho',_binary '',_binary '\0',_binary '',_binary '',_binary '',_binary '',_binary '',_binary '',_binary '',_binary '',_binary '',_binary '',_binary '',_binary '',NULL,'USER','ALW3VBCMHAUE387K7JHZW7RU5HQYSHKD','RELATIVE','LOGOUT',_binary '',30,1,NULL,_binary '\0',NULL,NULL,NULL,NULL,0.00),(19,_binary '',NULL,'2026-06-10 21:58:00.048475','mchochorowski2@gmail.com',_binary '','$2a$10$jlIlezFsXZXFA91jC3IMGe1y9AUdv6dOq5klPZt0mD.d8eCystzEm','Mateusz','matcho','Chochorowski',_binary '',_binary '\0',_binary '',_binary '',_binary '',_binary '',_binary '',_binary '',_binary '',_binary '',_binary '',_binary '',_binary '',_binary '',NULL,'USER','8M5B5WMMFYDXPFQKQHLTTDAGETFDMHUL','RELATIVE','LOGOUT',_binary '',30,1,NULL,_binary '\0',NULL,NULL,NULL,NULL,0.00);
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `wydarzenia`
--

DROP TABLE IF EXISTS `wydarzenia`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `wydarzenia` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `data_rozp` datetime(6) DEFAULT NULL,
  `data_utw` datetime(6) DEFAULT NULL,
  `data_zamk` datetime(6) DEFAULT NULL,
  `kategoria_id` bigint NOT NULL,
  `opis` text,
  `org_id` bigint NOT NULL,
  `org_sold_out_notified_at` datetime(6) DEFAULT NULL,
  `org_start_reminder_sent_at` datetime(6) DEFAULT NULL,
  `sala_id` bigint NOT NULL,
  `status` varchar(255) DEFAULT NULL,
  `tytul` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `wydarzenia`
--

LOCK TABLES `wydarzenia` WRITE;
/*!40000 ALTER TABLE `wydarzenia` DISABLE KEYS */;
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
  `qr_code` text,
  `seat_id` varchar(255) DEFAULT NULL,
  `stan` varchar(255) DEFAULT NULL,
  `uzyty_data` datetime(6) DEFAULT NULL,
  `wydany_data` datetime(6) DEFAULT NULL,
  `zam_id` bigint NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `wyst_bilety`
--

LOCK TABLES `wyst_bilety` WRITE;
/*!40000 ALTER TABLE `wyst_bilety` DISABLE KEYS */;
/*!40000 ALTER TABLE `wyst_bilety` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `zamowienia`
--

DROP TABLE IF EXISTS `zamowienia`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `zamowienia` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `data` datetime(6) DEFAULT NULL,
  `ilosc` int DEFAULT NULL,
  `platn_id` bigint NOT NULL,
  `poz_zam_id` bigint NOT NULL,
  `stan` varchar(255) DEFAULT NULL,
  `user_id` bigint NOT NULL,
  `waluta` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `zamowienia`
--

LOCK TABLES `zamowienia` WRITE;
/*!40000 ALTER TABLE `zamowienia` DISABLE KEYS */;
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
  `id` bigint NOT NULL AUTO_INCREMENT,
  `kwota` decimal(38,2) DEFAULT NULL,
  `otrzymany` bit(1) DEFAULT NULL,
  `platn_id` bigint NOT NULL,
  `powod` text,
  `przyznany` bit(1) DEFAULT NULL,
  `stan` varchar(255) DEFAULT NULL,
  `waluta` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`)
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

-- Dump completed on 2026-06-11  1:45:42
