# Dokumentacja Implementacji Frontendu React

## Wstęp

Projekt EventFlow wykorzystuje frontend zbudowany na frameworku React w wersji 18.3.1, z użyciem języka JavaScript oraz systemu budowania Create React App. Frontend odpowiada za interfejs użytkownika systemu rezerwacji i sprzedaży biletów na wydarzenia, w tym autoryzację użytkowników, przeglądanie wydarzeń, zakup biletów, zarządzanie kontem oraz panel administratora. Architektura aplikacji opiera się na komponentach React z wyraźnym podziałem na strony (pages), komponenty (components), konteksty (context), serwisy (services) oraz narzędzia (utils).

## Konfiguracja Projektu i Zależności

Projekt wykorzystuje npm do zarządzania zależnościami i konfiguracją budowania. Główna konfiguracja projektu jest zdefiniowana w pliku package.json, który określa nazwę projektu jako "fronteventflow", wersję jako "0.1.0", oraz flagę "private" jako true. Projekt jest skonfigurowany do działania zarówno jako aplikacja webowa, jak i aplikacja Electron, co pozwala na uruchomienie aplikacji jako desktopowej.

W sekcji zależności projektu znajdują się kluczowe biblioteki: React w wersji 18.3.1 jako główny framework UI, react-dom w wersji 18.3.1 do renderowania komponentów w przeglądarce, react-router-dom w wersji 7.14.2 do zarządzania routingiem w aplikacji, axios w wersji 1.13.6 do wykonywania zapytań HTTP do backendu, oraz i18next w wersji 26.3.0 i react-i18next w wersji 17.0.8 do internacjonalizacji aplikacji (obsługa wielu języków). Projekt wykorzystuje również Bootstrap w wersji 5.3.8 do stylowania interfejsu, qrcode w wersji 1.5.4 do generowania kodów QR, recharts w wersji 2.15.4 do tworzenia wykresów i wizualizacji danych, oraz sharp w wersji 0.34.5 do przetwarzania obrazów.

W sekcji zależności deweloperskich znajdują się biblioteki niezbędne do rozwoju i budowania aplikacji: react-scripts w wersji 5.0.1 jako narzędzie budowania Create React App, electron w wersji 41.2.0 do tworzenia aplikacji desktopowej, electron-builder w wersji 26.8.1 do pakowania aplikacji Electron, concurrently w wersji 9.2.1 do równoczesnego uruchamiania wielu procesów, oraz cross-env w wersji 10.1.0 do ustawiania zmiennych środowiskowych niezależnie od systemu operacyjnego.

## Skrypty Budowania i Uruchamiania

Projekt definiuje kilka skryptów w sekcji scripts package.json do zarządzania cyklem życia aplikacji. Skrypt "start" uruchamia serwer deweloperski React z flagą BROWSER=none, co zapobiega automatycznemu otwieraniu przeglądarki (ważne dla integracji z Electron). Skrypt "build" buduje zoptymalizowaną wersję produkcyjną aplikacji. Skrypt "serve" jest aliasem dla "start" i uruchamia serwer deweloperski. Skrypt "electron" czeka na uruchomienie serwera deweloperskiego na porcie 3000, a następnie uruchamia aplikację Electron. Skrypt "dev" równolegle uruchamia serwer deweloperski React i aplikację Electron, co jest przydatne podczas rozwoju. Skrypt "electron:dev" jest podobny do "dev", ale z dodatkowym oczekiwaniem na uruchomienie serwera.

## Główny Plik Aplikacji

Główny plik aplikacji App.js jest punktem wejścia do aplikacji React. Plik importuje niezbędne biblioteki i komponenty, w tym React, useContext z React, BrowserRouter, Routes, Route, Navigate z react-router-dom, useTranslation z react-i18next, oraz konteksty AuthProvider i AuthContext z pliku ./context/AuthContext i ThemeProvider z ./context/ThemeContext. Plik importuje również główny arkusz stylów App.css oraz komponenty szkieletu i poszczególnych stron.

Komponent AppRoutes jest odpowiedzialny za zarządzanie routingiem aplikacji. Komponent wykorzystuje hook useTranslation do pobierania funkcji tłumaczeń oraz useContext do pobierania stanu logowania i ładowania sesji z AuthContext. Jeśli sesja jest w trakcie ładowania (sessionLoading jest true), komponent wyświetla ekran ładowania z logo EventFlow i komunikatem o ładowaniu sesji. Jeśli użytkownik nie jest zalogowany (isLoggedIn jest false), komponent wyświetla stronę autoryzacji (AuthPage). Jeśli użytkownik jest zalogowany, komponent renderuje routing z MainLayout jako głównym układem.

Routing aplikacji definiuje następujące ścieżki: ścieżka główna "/" przekierowuje do "/dashboard", ścieżka "/dashboard" wyświetla komponent Dashboard, ścieżka "/bilety" wyświetla komponent BiletyPage, ścieżka "/wydarzenia" wyświetla komponent WydarzeniaPage, ścieżka "/wydarzenia/:id" wyświetla komponent EventDetailPage z parametrem id wydarzenia, ścieżka "/miejsca" wyświetla komponent MiejscaPage, ścieżka "/analityka" wyświetla komponent AnalitykaPage, ścieżka "/uczestnicy" wyświetla komponent UsersPage, ścieżka "/ustawienia" wyświetla komponent UstawieniaPage, ścieżka "/admin" wyświetla komponent AdminPanelPage, oraz ścieżka "/admin/security-inbox" przekierowuje do "/admin". Ścieżka "*" (catch-all) wyświetla komunikat o nieznalezionej stronie.

Główny komponent App wstrzykuje providerów kontekstów (ThemeProvider i AuthProvider) oraz BrowserRouter, co zapewnia dostęp do kontekstów i routingu w całej aplikacji.

## Architektura Komponentów

Frontend projektu EventFlow jest zorganizowany w hierarchię komponentów React z wyraźnym podziałem na strony, komponenty interfejsu, konteksty stanu globalnego, serwisy API oraz narzędzia pomocnicze. Architektura opiera się na zasadzie kompozycji komponentów, gdzie bardziej złożone komponenty są budowane z prostszych komponentów.

## Strony (Pages)

Warstwa stron w projekcie EventFlow jest zorganizowana w pakiecie ./pages i zawiera komponenty reprezentujące główne widoki aplikacji. Każda strona jest odpowiedzialna za określoną funkcjonalność i może zawierać wiele komponentów podrzędnych.

Dashboard jest główną stroną aplikacji, która wyświetla podsumowanie aktywności użytkownika. Strona zawiera informacje o nadchodzących wydarzeniach, ostatnich zakupach, powiadomieniach oraz skrótach do najważniejszych funkcji. Strona wykorzystuje AuthContext do pobierania danych użytkownika oraz serwisy do pobierania danych z backendu.

BiletyPage jest stroną wyświetlającą bilety zakupione przez użytkownika. Strona zawiera listę biletów z informacjami o wydarzeniach, datach zakupu, statusach oraz kodach QR. Strona wykorzystuje PurchaseModal do wyświetlania szczegółów biletu oraz kodu QR.

WydarzeniaPage jest jedną z największych i najważniejszych stron w systemie. Strona odpowiada za zarządzanie wydarzeniami, w tym przeglądanie listy wydarzeń, tworzenie nowych wydarzeń, edytowanie istniejących wydarzeń, dodawanie pul biletów do istniejących wydarzeń, zarządzanie personelem wydarzenia oraz wyświetlanie szczegółów wydarzenia. Strona implementuje logikę filtrowania wydarzeń według statusu (AKTYWNE, MOJE, WSZYSTKIE), co pozwala użytkownikom na łatwe przeglądanie wydarzeń. Strona zawiera również modalne okna do dodawania biletów do istniejących wydarzeń, zarządzania personelem oraz wyświetlania szczegółów wydarzenia.

MiejscaPage jest stroną zarządzania miejscami (salami) w systemie. Strona pozwala na tworzenie nowych sal, edytowanie istniejących sal, zarządzanie miejscami w salach oraz przypisywanie planów miejsc do wydarzeń. Strona wykorzystuje SeatPlanMap do wizualizacji planu miejsc.

EventDetailPage jest stroną wyświetlającą szczegółowe informacje o konkretnym wydarzeniu. Strona zawiera opis wydarzenia, listę dostępnych biletów, opinie użytkowników, oraz informacje o organizatorze. Strona pozwala na zakup biletów bezpośrednio ze strony szczegółów wydarzenia.

UsersPage jest stroną zarządzania użytkownikami systemu (dla administratorów). Strona pozwala na przeglądanie listy użytkowników, filtrowanie użytkowników według kryteriów, edytowanie profili użytkowników, oraz usuwanie kont użytkowników. Strona implementuje logikę walidacji uprawnień - tylko administratorzy mogą przeglądać i zarządzać użytkownikami.

UstawieniaPage jest jedną z największych stron w systemie, odpowiedzialną za zarządzanie ustawieniami konta użytkownika. Strona zawiera sekcje takie jak profil użytkownika (zmiana danych osobowych), bezpieczeństwo (zmiana hasła, konfiguracja 2FA/TOTP), powiadomienia (konfiguracja typów powiadomień), portfel (zarządzanie środkami i metodami płatności), historia logowań, oraz ustawienia języka i motywu. Strona implementuje logikę walidacji danych wejściowych oraz obsługi błędów.

AdminPanelPage jest stroną panelu administratora, która udostępnia funkcje administracyjne takie jak zarządzanie zgłoszeniami bezpieczeństwa, przeglądanie logów systemowych, zarządzanie kategoriami wydarzeń, oraz zarządzanie notatkami o aktualizacjach (Patch Notes). Strona implementuje logikę filtrowania i sortowania zgłoszeń bezpieczeństwa według statusu, priorytetu oraz kategorii.

AnalitykaPage jest stroną wyświetlającą statystyki i analizy systemu. Strona wykorzystuje bibliotekę recharts do tworzenia wykresów takich jak liczba sprzedanych biletów w czasie, przychód z wydarzeń, aktywność użytkowników, oraz popularność wydarzeń. Strona implementuje logikę pobierania danych z backendu i agregacji wyników do wizualizacji.

SecurityInboxPage jest stroną zarządzania zgłoszeniami bezpieczeństwa. Strona pozwala na przeglądanie zgłoszeń, przypisywanie zgłoszeń do administratorów, aktualizację statusu zgłoszeń, oraz generowanie raportów z aktywności bezpieczeństwa. Strona implementuje logikę filtrowania zgłoszeń według statusu (OPEN, IN_PROGRESS, RESOLVED), priorytetu oraz kategorii.

AuthPage jest stroną autoryzacji, która zawiera formularze logowania, rejestracji oraz odzyskiwania hasła. Strona implementuje logikę walidacji danych wejściowych, obsługi błędów, oraz integrację z AuthService do komunikacji z backendem. Strona obsługuje również proces weryfikacji dwuskładnikowej (2FA/TOTP).

## Komponenty (Components)

Warstwa komponentów w projekcie EventFlow jest zorganizowana w pakiecie ./components i zawiera komponenty wielokrotnego użytku, które są wykorzystywane na różnych stronach aplikacji. Komponenty są podzielone na kategorie takie jak layout, panel_admin, chat oraz komponenty ogólne.

WydarzenieCard jest komponentem wyświetlającym kartę wydarzenia na liście wydarzeń. Komponent zawiera tytuł wydarzenia, opis, datę, lokalizację, cenę biletów, oraz przyciski akcji (szczegóły, zakup biletów, dodanie biletów do istniejącego wydarzenia dla organizatorów). Komponent implementuje logikę filtrowania wydarzeń według statusu oraz wyświetlania różnych przycisków w zależności od roli użytkownika.

PurchaseModal jest komponentem modalnym wyświetlającym szczegóły zakupu biletu. Komponent zawiera informacje o wydarzeniu, bilecie, dacie zakupu, oraz kod QR biletu. Komponent wykorzystuje bibliotekę qrcode do generowania kodu QR na podstawie danych biletu.

SeatPlanMap jest komponentem wizualizującym plan miejsc w sali. Komponent wyświetla siatkę miejsc z oznaczeniami dostępności (dostępne, niedostępne, wybrane). Komponent implementuje logikę interakcji z użytkownikiem - użytkownik może wybierać miejsca, które są następnie zapisywane w stanie komponentu.

TicketProgress jest komponentem wyświetlającym pasek postępu sprzedaży biletów. Komponent pokazuje liczbę sprzedanych biletów w stosunku do całkowitej liczby biletów w puli.

BiletyTab jest komponentem wyświetlającym zakładkę bilety na stronie wydarzenia. Komponent zawiera listę dostępnych pul biletów z informacjami o cenie, dostępności oraz dacie sprzedaży.

SoldTicketsPanel jest komponentem wyświetlającym panel sprzedanych biletów dla organizatora. Komponent pozwala na przeglądanie listy sprzedanych biletów, filtrowanie według kryteriów, oraz eksportowanie danych.

PatchNotesPanel jest komponentem wyświetlającym panel notatek o aktualizacjach. Komponent zawiera listę notatek z datami, opisami zmian oraz kategoriami (np. nowe funkcje, poprawki błędów, ulepszenia).

## Konteksty (Context)

Warstwa kontekstów w projekcie EventFlow jest zorganizowana w pakiecie ./context i zawiera konteksty React do zarządzania stanem globalnym aplikacji. Konteksty pozwalają na udostępnianie danych i funkcji do wielu komponentów bez konieczności przekazywania props przez wiele poziomów hierarchii komponentów.

AuthContext jest głównym kontekstem zarządzającym stanem autoryzacji użytkownika. Kontekst udostępnia dane takie jak currentUser (aktualnie zalogowany użytkownik), isLoggedIn (czy użytkownik jest zalogowany), sessionLoading (czy sesja jest w trakcie ładowania), oraz funkcje takie jak login, logout, register, updateProfile, changePassword, enable2FA, verify2FA. Kontekst wykorzystuje AuthService do komunikacji z backendem oraz localStorage do przechowywania tokenów sesji. Kontekst implementuje logikę automatycznego odświeżania sesji oraz obsługi błędów autoryzacji.

ThemeContext jest kontekstem zarządzającym motywem aplikacji. Kontekst udostępnia dane takie jak theme (aktualny motyw: light/dark) oraz funkcje takie jak toggleTheme do przełączania motywu. Kontekst wykorzystuje localStorage do przechowywania preferencji użytkownika.

## Serwisy (Services)

Warstwa serwisów w projekcie EventFlow jest zorganizowana w pakiecie ./services i zawiera klasy implementujące logikę komunikacji z backendem API. Serwisy wykorzystują bibliotekę axios do wykonywania zapytań HTTP oraz apiClient do konfiguracji bazowego URL i nagłówków autoryzacji.

authService jest serwisem odpowiedzialnym za komunikację z backendem w zakresie autoryzacji. Serwis udostępnia metody takie jak login (logowanie użytkownika), register (rejestracja użytkownika), logout (wylogowanie użytkownika), verifyEmail (weryfikacja adresu e-mail), changePassword (zmiana hasła), enable2FA (włączenie uwierzytelniania dwuskładnikowego), verify2FA (weryfikacja kodu TOTP), oraz getProfile (pobranie profilu użytkownika). Serwis implementuje logikę obsługi błędów oraz automatycznego odświeżania tokenów sesji.

obserwowaneService jest serwisem odpowiedzialnym za zarządzanie obserwowanymi wydarzeniami. Serwis udostępnia metody takie jak getObservedEvents (pobranie listy obserwowanych wydarzeń), addObservedEvent (dodanie wydarzenia do obserwowanych), removeObservedEvent (usunięcie wydarzenia z obserwowanych), oraz checkIfObserved (sprawdzenie czy wydarzenie jest obserwowane). Serwis implementuje logikę filtrowania wydarzeń oraz obsługi błędów.

powiadomieniaService jest serwisem odpowiedzialnym za zarządzanie powiadomieniami. Serwis udostępnia metody takie jak getNotifications (pobranie listy powiadomień), markAsRead (oznaczenie powiadomienia jako przeczytane), markAllAsRead (oznaczenie wszystkich powiadomień jako przeczytane), oraz deleteNotification (usunięcie powiadomienia). Serwis implementuje logikę filtrowania powiadomień według typu oraz obsługi błędów.

## API Client

Pakiet ./api zawiera apiClient.js, który konfiguruje instancję axios do komunikacji z backendem. apiClient ustawia bazowy URL dla wszystkich zapytań (http://localhost:8080/api w środowisku deweloperskim), konfiguruje nagłówki autoryzacji (token JWT z localStorage), oraz implementuje interceptory do obsługi błędów i automatycznego odświeżania tokenów.

## Internacjonalizacja (i18n)

Projekt wykorzystuje bibliotekę i18next i react-i18next do obsługi wielu języków. Konfiguracja i18n jest zdefiniowana w pliku i18n.js, który zawiera tłumaczenia dla języka polskiego i angielskiego. Plik zawiera tysiące kluczy tłumaczeń podzielonych na kategorie takie jak app (ogólne komunikaty aplikacji), auth (autoryzacja), events (wydarzenia), tickets (bilety), users (użytkownicy), admin (panel administratora), oraz inne. Komponenty wykorzystują hook useTranslation do pobierania funkcji tłumaczeń i wyświetlania przetłumaczonych tekstów.

## Stylowanie (CSS)

Projekt wykorzystuje Bootstrap 5.3.8 do stylowania interfejsu oraz niestandardowy arkusz stylów App.css. App.css zawiera tysiące linii kodu CSS definiujących style dla komponentów, layoutów, modalnych okien, formularzy, oraz innych elementów interfejsu. Arkusz stylów wykorzystuje zmienne CSS do konfiguracji kolorów, czcionek oraz innych właściwości, co pozwala na łatwe dostosowanie wyglądu aplikacji.

## Routing

Projekt wykorzystuje react-router-dom w wersji 7.14.2 do zarządzania routingiem w aplikacji. Routing jest zdefiniowany w pliku App.js i wykorzystuje komponenty BrowserRouter, Routes, Route oraz Navigate. Routing implementuje logikę ochrony tras - tylko zalogowani użytkownicy mają dostęp do głównych tras aplikacji, a niezalogowani użytkownicy są przekierowywani na stronę autoryzacji.

## Zarządzanie Stanem

Projekt wykorzystuje konteksty React (AuthContext, ThemeContext) do zarządzania stanem globalnym oraz hooki useState, useEffect, useContext do zarządzania stanem lokalnym komponentów. Komponenty wykorzystują useState do przechowywania danych lokalnych, useEffect do wykonywania efektów ubocznych (np. pobieranie danych z backendu przy montowaniu komponentu), oraz useContext do dostępu do danych kontekstów.

## Obsługa Błędów

Projekt implementuje mechanizm obsługi błędów poprzez try-catch w serwisach oraz komponentach. Błędy są wyświetlane użytkownikom poprzez komponenty modalne lub komunikaty toast. Projekt wykorzystuje również interceptory axios do obsługi błędów HTTP (np. 401 Unauthorized, 403 Forbidden, 404 Not Found, 500 Internal Server Error).

## Integracja z Backendem

Frontend komunikuje się z backendem poprzez API RESTful. Komunikacja jest realizowana przy użyciu biblioteki axios i apiClient. Frontend wysyła żądania HTTP (GET, POST, PUT, DELETE) do endpointów backendu i odbiera odpowiedzi w formacie JSON. Autoryzacja jest realizowana poprzez token JWT wysyłany w nagłówku Authorization.

## Integracja z Electron

Projekt jest skonfigurowany do działania jako aplikacja Electron. Plik main.js zawiera konfigurację Electron, która tworzy okno aplikacji i ładuje aplikację React. Skrypty npm "electron" i "dev" pozwalają na uruchomienie aplikacji jako desktopowej. Integracja z Electron pozwala na uruchomienie aplikacji poza przeglądarką, co może być przydatne dla użytkowników preferujących aplikacje desktopowe.

## Podsumowanie

Frontend projektu EventFlow jest kompleksową aplikacją React, która implementuje pełną funkcjonalność interfejsu użytkownika systemu rezerwacji i sprzedaży biletów na wydarzenia. Architektura aplikacji opiera się na komponentach React z wyraźnym podziałem na strony, komponenty, konteksty, serwisy oraz narzędzia. System wykorzystuje najnowsze technologie React 18.3.1, react-router-dom 7.14.2, oraz i18next 26.3.0, co zapewnia wysoką wydajność i elastyczność. Frontend jest dobrze zintegrowany z backendem Spring Boot, systemem autoryzacji JWT, oraz zewnętrznymi bibliotekami takimi jak Bootstrap, qrcode i recharts. Implementacja jest skalowalna i gotowa do dalszego rozwoju.




# Dokumentacja Implementacji Backendu Spring Boot Java Gradle

## Wstęp

Projekt EventFlow wykorzystuje backend zbudowany na frameworku Spring Boot w wersji 3.2.4, z użyciem języka Java 21 oraz systemu budowania Gradle. Backend odpowiada za zarządzanie całym systemem rezerwacji i sprzedaży biletów na wydarzenia, w tym autoryzację użytkowników, zarządzanie wydarzeniami, bilety, płatności oraz system powiadomień. Architektura aplikacji opiera się na wzorcu MVC (Model-View-Controller) z wyraźnym podziałem warstw: kontrolery, serwisy, repozytoria oraz modele danych.

## Konfiguracja Projektu i Zależności

Projekt wykorzystuje Gradle Kotlin DSL (build.gradle.kts) do zarządzania zależnościami i konfiguracją budowania. Główna konfiguracja projektu definiuje grupę jako "com.eventflow" oraz wersję jako "0.0.1-SNAPSHOT". Projekt jest skonfigurowany do używania Java 21 zarówno jako wersji źródłowej, jak i docelowej, co pozwala na wykorzystanie najnowszych funkcji języka, takich jak rekordy, pattern matching czy ulepszone switch expressions.

W sekcji zależności projektu znajdują się kluczowe biblioteki Spring Boot Starter: spring-boot-starter-web dla tworzenia aplikacji webowych z wbudowanym serwerem Tomcat, spring-boot-starter-data-jpa dla integracji z JPA (Java Persistence API) i Hibernate, spring-boot-starter-security dla bezpieczeństwa aplikacji oraz autoryzacji, spring-boot-starter-validation dla walidacji danych, oraz spring-boot-starter-mail dla wysyłania wiadomości e-mail. Dodatkowo projekt wykorzystuje bibliotekę ZXing (Zebra Crossing) w wersji 3.5.2 do generowania kodów QR, co jest kluczowe dla funkcjonalności biletów elektronicznych. Jako bazy danych używany jest MySQL z konektorem mysql-connector-j. Projekt korzysta również z Lomboka do redukcji kodu boilerplate poprzez automatyczne generowanie getterów, setterów, konstruktorów i innych metod, co znacznie upraszcza kod klas modeli.

## Główna Klasa Aplikacji

Główna klasa aplikacji ComApplication.java jest punktem wejścia do aplikacji Spring Boot. Została oznaczona adnotacją @SpringBootApplication, która jest kompozycją trzech innych adnotacji: @Configuration (oznacza klasę jako źródło definicji beanów), @EnableAutoConfiguration (włącza automatyczną konfigurację Spring Boot) oraz @ComponentScan (skanuje komponenty w pakiecie i jego podpakietach). Dodatkowo klasa posiada adnotację @EnableScheduling, która włącza obsługę zadań zaplanowanych, co jest wykorzystywane do wysyłania przypomnień o obserwowanych wydarzeniach. Metoda main uruchamia kontekst Spring Boot poprzez SpringApplication.run(), co inicjalizuje cały kontener IoC (Inversion of Control) i uruchamia wbudowany serwer Tomcat.

## Architektura Warstwowa

Backend projektu EventFlow jest zorganizowany w czystą architekturę warstwową, co zapewnia separację odpowiedzialności i ułatwia utrzymanie kodu. Warstwa kontrolerów (controller) odpowiada za obsługę żądań HTTP, walidację danych wejściowych oraz zwracanie odpowiedzi. Warstwa serwisów (service) zawiera logikę biznesową aplikacji i koordynuje operacje między różnymi komponentami. Warstwa repozytoriów (repository) odpowiada za dostęp do danych i operacje CRUD (Create, Read, Update, Delete) na encjach bazodanowych. Warstwa modeli (model) definiuje encje JPA, które mapują się na tabele w bazie danych.

## System Autoryzacji i Bezpieczeństwa

System autoryzacji w projekcie EventFlow jest zaimplementowany w pakiecie com.eventflow.com.auth i wykorzystuje Spring Security do zarządzania bezpieczeństwem aplikacji. Głównym komponentem jest AuthService, który udostępnia metody do rejestracji użytkowników, logowania, weryfikacji adresów e-mail, zmiany haseł oraz zarządzania uwierzytelnianiem dwuskładnikowym (2FA/TOTP). Serwis ten integruje się z TotpService do generowania i weryfikacji kodów TOTP (Time-based One-Time Password) zgodnie ze standardem RFC 6238, co zapewnia dodatkową warstwę bezpieczeństwa dla kont użytkowników.

Autoryzacja opiera się na mechanizmie JWT (JSON Web Tokens) lub sesji, w zależności od konfiguracji. AuthService udostępnia metodę getAuthenticatedUser, która pobiera aktualnie zalogowanego użytkownika na podstawie obiektu Authentication dostarczanego przez Spring Security. Metoda ta jest wykorzystywana w kontrolerach do weryfikacji uprawnień użytkownika przed wykonaniem operacji chronionych.

System obsługuje również weryfikację adresów e-mail poprzez wysyłanie kodów weryfikacyjnych. EmailService definiuje interfejs dla wysyłania wiadomości e-mail, a SmtpEmailService implementuje ten interfejs przy użyciu protokołu SMTP. Serwis ten konfigurowany jest w pliku application.properties z parametrami serwera SMTP, co pozwala na wysyłanie wiadomości e-mail w różnych środowiskach (dev, prod).

LoginLocationService jest odpowiedzialny za określanie lokalizacji użytkownika na podstawie adresu IP, co jest wykorzystywane do logowania historii logowań oraz wykrywania podejrzanych aktywności. Serwis ten może integrować się z zewnętrznymi API geolokalizacji lub używać lokalnej bazy danych adresów IP.

## Kontrolery i REST API

Warstwa kontrolerów w projekcie EventFlow jest zorganizowana w pakiecie com.eventflow.com.controller i zawiera 12 głównych kontrolerów REST API, każdy odpowiedzialny za określoną domenę biznesową. Kontrolery są oznaczone adnotacją @RestController, która automatycznie konwertuje odpowiedzi na format JSON, oraz @RequestMapping, która definiuje bazowy ścieżkę URL dla wszystkich endpointów w kontrolerze.

WydarzenieController jest jednym z największych i najważniejszych kontrolerów w systemie. Odpowiada za zarządzanie wydarzeniami, w tym tworzenie nowych wydarzeń, pobieranie listy wydarzeń, aktualizację szczegółów wydarzeń, zakończenie wydarzeń oraz zarządzanie biletemi przypisanymi do wydarzeń. Kontroler ten udostępnia endpointy takie jak GET /api/wydarzenia do pobierania listy wydarzeń, POST /api/wydarzenia do tworzenia nowego wydarzenia, GET /api/wydarzenia/{id} do pobierania szczegółów konkretnego wydarzenia, oraz POST /api/wydarzenia/{id}/bilety do dodawania nowych pul biletów do istniejącego wydarzenia. Kontroler implementuje również logikę walidacji uprawnień - tylko organizatorzy (użytkownicy z rolą ORG) mogą tworzyć i modyfikować wydarzenia, a administratorzy mogą zamykać aktywne wydarzenia.

BiletController zarządza operacjami na biletach, w tym zakupem biletów, pobieraniem informacji o dostępnych biletach, oraz zarządzaniem zwrotami. Kontroler udostępnia endpoint GET /api/bilety/dostepne/{wydarzenieId} do pobierania listy dostępnych biletów dla konkretnego wydarzenia, oraz POST /api/bilety/zakup do zakupu biletów. Kontroler implementuje również logikę filtrowania biletów - w endpoint GET /api/bilety/moje, który zwraca bilety zakupione przez aktualnie zalogowanego użytkownika, system filtruje bilety, które zostały zwrócone (status zwrotu "przyznany" lub "zwrocony"), aby nie pojawiały się w liście "Moje bilety".

ZakupController odpowiada za zarządzanie zamówieniami i płatnościami. Kontroler udostępnia endpoint POST /api/zakupy do tworzenia nowych zamówień, oraz GET /api/zakupy/{id} do pobierania szczegółów zamówienia. Kontroler integruje się z systemem płatności i portfela użytkownika do obsługi transakcji.

ZwrotController zarządza procesem zwrotów biletów. Kontroler udostępnia endpoint POST /api/zwroty do zgłaszania żądań zwrotu, oraz PUT /api/zwroty/{id}/zatwierdz do zatwierdzania zwrotów przez administratorów lub organizatorów. Kontroler implementuje logikę walidacji - zwrot może być zatwierdzony tylko w określonym czasie od zakupu biletu i tylko dla biletów, które nie zostały jeszcze wykorzystane.

UserController jest odpowiedzialny za zarządzanie kontami użytkowników. Kontroler udostępnia endpointy takie jak GET /api/users do pobierania listy wszystkich użytkowników (dla administratorów), GET /api/users/me do pobierania profilu aktualnie zalogowanego użytkownika, PUT /api/users/me do aktualizacji profilu, DELETE /api/users/me do usunięcia konta, oraz DELETE /api/users/{id} do usunięcia konta przez administratora. Kontroler implementuje również endpointy do zarządzania portfelem użytkownika (GET /api/users/me/wallet, PUT /api/users/me/wallet/payment-method, POST /api/users/me/wallet/add-funds), co pozwala użytkownikom na dodawanie środków do portfela i zarządzanie metodami płatności.

AdminSecurityTicketController zarządza systemem zgłoszeń bezpieczeństwa. Kontroler udostępnia endpointy do tworzenia, przeglądania i rozwiązywania zgłoszeń bezpieczeństwa zgłaszanych przez użytkowników lub system automatycznie. System ten jest kluczowy dla monitorowania podejrzanych aktywności, takich jak nietypowe logowania z nowych lokalizacji lub urządzeń.

ChatController implementuje funkcjonalność czatu między użytkownikami. Kontroler udostępnia endpointy do wysyłania wiadomości, pobierania historii konwersacji oraz zarządzania statusem przeczytania wiadomości. Czat jest wykorzystywany do komunikacji między organizatorami wydarzeń a uczestnikami.

## Modele Danych i Encje JPA

Warstwa modeli w projekcie EventFlow jest zorganizowana w pakiecie com.eventflow.com.model i zawiera encje JPA, które mapują się na tabele w bazie danych MySQL. Encje są oznaczone adnotacją @Entity, co oznacza, że są zarządzane przez JPA, oraz @Table, która definiuje nazwę tabeli w bazie danych. Większość encji korzysta z Lomboka, który automatycznie generuje gettery, settery, konstruktory i inne metody poprzez adnotacje takie jak @Data, @Getter, @Setter, @NoArgsConstructor, @AllArgsConstructor.

User jest główną encją reprezentującą użytkownika systemu. Encja zawiera pola takie jak id (klucz główny), login (unikalny identyfikator użytkownika), hasło (haszowane), email, imie, nazwisko, telefon, rola (ADMIN, USER, ORG), aktywnosc (status konta), dataUtw (data utworzenia konta), walletBalance (saldo portfela), bankAccountNumber (numer konta bankowego), platnosc (metoda płatności), oraz pola związane z ustawieniami sesji i powiadomień. Encja User jest centralnym punktem systemu - wszystkie inne encje (takie jak Wydarzenie, Bilet, Zamowienie) są powiązane z użytkownikiem poprzez relacje JPA.

Wydarzenie reprezentuje wydarzenie w systemie. Encja zawiera pola takie jak tytuł, opis, dataRozp (data rozpoczęcia), dataZamk (data zakończenia), status (AKTYWNY, DRAFT, NIEAKTYWNY), kategoriaId (powiązanie z encją Kategoria), salaId (powiązanie z encją Sala), orgId (powiązanie z encją Organizator), oraz pola związane z zarządzaniem biletemi. Encja Wydarzenie jest sercem systemu - wszystkie bilety, zamówienia i opinie są powiązane z konkretnym wydarzeniem.

Bilet reprezentuje pulę biletów dostępnych dla wydarzenia. Encja zawiera pola takie klasa (np. Standard, VIP), cena, ilosc (liczba dostępnych biletów), waluta, start_sprzedazy (data rozpoczęcia sprzedaży), koniec_sprzedazy (data zakończenia sprzedaży), kategoriaBiletu (miejscówka lub wejściówka), oraz wydarzenieId (powiązanie z encją Wydarzenie). Encja Bilet jest kluczowa dla systemu sprzedaży - każda pula biletów ma określoną cenę, dostępność i okres sprzedaży.

Zamowienie reprezentuje zamówienie złożone przez użytkownika. Encja zawiera pola takie jak userId (powiązanie z encją User), dataZam (data złożenia zamówienia), status (PENDING, PAID, CANCELLED), kwota, oraz metoda płatności. Encja Zamowienie jest powiązana z encją PozZam (Pozycja Zamówienia), która reprezentuje poszczególne bilety w zamówieniu.

Opinia reprezentuje opinię użytkownika o wydarzeniu. Encja zawiera pola takie jak userId (powiązanie z encją User), wydId (powiązanie z encją Wydarzenie), ocena (ocena numeryczna od 1 do 5), opis (tekst opinii), oraz data (data dodania opinii). System opiniowania jest kluczowy dla budowania zaufania użytkowników do wydarzeń.

SecurityTicket reprezentuje zgłoszenie bezpieczeństwa w systemie. Encja zawiera pola takie jak userId (powiązanie z encją User), kategoria (np. SUSPICIOUS_LOGIN, ACCOUNT_COMPROMISE), opis, status (OPEN, IN_PROGRESS, RESOLVED), priorytet, oraz data utworzenia. System zgłoszeń bezpieczeństwa jest kluczowy dla monitorowania i reagowania na zagrożenia.

## Repozytoria i Dostęp do Danych

Warstwa repozytoriów w projekcie EventFlow jest zorganizowana w pakiecie com.eventflow.com.repository i zawiera interfejsy rozszerzające JpaRepository z Spring Data JPA. Repozytoria udostępniają metody do operacji CRUD na encjach oraz niestandardowe metody zapytań definiowane poprzez konwencję nazewnictwa lub adnotację @Query.

UserRepository udostępnia metody do wyszukiwania użytkowników po loginie, emailu, telefonie oraz innych kryteriach. Repozytorium zawiera metody takie jak findByLogin, findByEmail, findByTelefon, oraz metody zapytań niestandardowych do pobierania użytkowników z określonymi rolami lub statusem aktywności.

WydarzenieRepository udostępnia metody do wyszukiwania wydarzeń po różnych kryteriach, takich jak status, kategoria, data, organizator. Repozytorium zawiera metody takie jak findByStatus, findByKategoriaId, findByOrgId, oraz metody zapytań niestandardowych do pobierania wydarzeń aktywnych w określonym przedziale czasowym.

BiletRepository udostępnia metody do wyszukiwania biletów po wydarzeniu, cenie, dostępności oraz innych kryteriach. Repozytorium zawiera metody takie jak findByWydarzenieId, findByCena, findByIloscGreaterThan, oraz metody zapytań niestandardowych do pobierania dostępnych biletów dla konkretnego wydarzenia.

ZwrotRepository udostępnia metody do wyszukiwania zwrotów po zamówieniu, statusie oraz innych kryteriach. Repozytorium zawiera metody takie jak findByZamowienieId, findByStatus, oraz metody zapytań niestandardowych do pobierania zwrotów oczekujących na zatwierdzenie.

## Serwisy i Logika Biznesowa

Warstwa serwisów w projekcie EventFlow jest zorganizowana w pakiecie com.eventflow.com.service i zawiera klasy implementujące logikę biznesową aplikacji. Serwisy są oznaczone adnotacją @Service, co sprawia, że są zarządzane przez kontener Spring i mogą być wstrzykiwane do innych komponentów poprzez adnotację @Autowired lub konstruktor.

NotificationService jest odpowiedzialny za zarządzanie powiadomieniami w systemie. Serwis udostępnia metody do tworzenia powiadomień, pobierania powiadomień dla użytkownika, oznaczania powiadomień jako przeczytane, oraz usuwania powiadomień. Serwis implementuje logikę filtrowania powiadomień na podstawie ustawień użytkownika - każdy użytkownik może skonfigurować, jakie typy powiadomień chce otrzymywać (np. powiadomienia o nowych wydarzeniach, logowaniach administratorów, zakończeniu obserwowanych wydarzeń). Serwis wykorzystuje UserNotificationRepository do przechowywania powiadomień w bazie danych.

SecurityTicketService zarządza systemem zgłoszeń bezpieczeństwa. Serwis udostępnia metody do tworzenia zgłoszeń, przypisywania zgłoszeń do administratorów, aktualizacji statusu zgłoszeń, oraz generowania raportów z aktywności bezpieczeństwa. Serwis implementuje logikę automatycznego wykrywania podejrzanych aktywności - na podstawie analizy logów logowań (LoginLog) system może automatycznie tworzyć zgłoszenia bezpieczeństwa dla nietypowych aktywności, takich jak logowania z nowych lokalizacji lub urządzeń.

UserCascadeDeleteService implementuje logikę kaskadowego usuwania kont użytkowników. Serwis udostępnia metodę deleteUserWithDependencies, która usuwa użytkownika wraz z wszystkimi powiązanymi danymi, takimi jak zamówienia, bilety, opinie, ulubione wydarzenia, obserwowane wydarzenia, powiadomienia, oraz logi logowań. Serwis jest kluczowy dla zachowania spójności danych podczas usuwania kont użytkowników.

AnalyticsService udostępnia metody do analizy danych w systemie. Serwis implementuje logikę obliczania statystyk, takich jak liczba sprzedanych biletów, przychód z wydarzeń, aktywność użytkowników, oraz popularność wydarzeń. Serwis wykorzystuje repozytoria do pobierania danych z bazy danych i agregacji wyników.

QrCodeService jest odpowiedzialny za generowanie kodów QR dla biletów. Serwis udostępnia metodę generateQrCode, która generuje kod QR na podstawie danych biletu (np. identyfikator biletu, identyfikator zamówienia, data zakupu). Serwis wykorzystuje bibliotekę ZXing do generowania kodów QR w formacie PNG, które są następnie zwracane jako tablice bajtów i mogą być wyświetlane w aplikacji frontendowej.

## DTO (Data Transfer Objects)

Pakiet com.eventflow.com.controller.dto zawiera klasy DTO (Data Transfer Objects), które są wykorzystywane do transferu danych między warstwą kontrolerów a warstwą serwisów. DTO są wykorzystywane do izolacji modeli danych od API, co pozwala na kontrolowanie, które dane są udostępniane w odpowiedziach API oraz jakie dane są akceptowane w żądaniach API.

DTO są zazwyczaj prostymi klasami z polami i getterami/setterami, lub rekordami (record) w Java 16+, które automatycznie generują gettery, konstruktory i metody equals/hashCode. Przykładowe DTO w projekcie to UserResponse (zawiera dane użytkownika udostępniane w API), WydarzenieListItemDto (zawiera skrócone dane o wydarzeniu dla listy wydarzeń), WydarzenieDetailDto (zawiera szczegółowe dane o wydarzeniu), BiletCreateRequestDto (zawiera dane do utworzenia nowej puli biletów), oraz ChangeOwnPasswordRequest (zawiera dane do zmiany hasła użytkownika).

## Konfiguracja Bezpieczeństwa

Konfiguracja bezpieczeństwa Spring Boot jest zdefiniowana w pakiecie com.eventflow.com.config. Pakiet ten zawiera klasy konfiguracyjne, które definiują zasady bezpieczeństwa dla aplikacji, takie jak wymagane uprawnienia dla poszczególnych endpointów, konfiguracja mechanizmu uwierzytelniania, oraz konfiguracja CORS (Cross-Origin Resource Sharing).

Konfiguracja bezpieczeństwa definiuje, że endpointy publiczne (np. rejestracja, logowanie) są dostępne bez uwierzytelnienia, podczas gdy endpointy chronione (np. zarządzanie wydarzeniami, bilety) wymagają uwierzytelnienia. Konfiguracja definiuje również role uprawnień - użytkownicy z rolą ADMIN mają dostęp do wszystkich endpointów, użytkownicy z rolą ORG mogą tworzyć i zarządzać wydarzeniami, a użytkownicy z rolą USER mogą przeglądać wydarzenia i kupować bilety.

## Planowanie Zadań

Projekt wykorzystuje mechanizm planowania zadań Spring Scheduling do automatycznego wysyłania przypomnień o obserwowanych wydarzeniach. Klasa ObservedEventReminderScheduler jest oznaczona adnotacją @Scheduled, która definiuje częstotliwość wykonywania zadania (np. codziennie o określonej godzinie). Zadanie to pobiera listę obserwowanych wydarzeń, które się zbliżają, i wysyła powiadomienia do użytkowników, którzy je obserwują.

## Integracja z Bazą Danych

Projekt wykorzystuje bazę danych MySQL jako główny magazyn danych. Konfiguracja połączenia z bazą danych jest zdefiniowana w pliku application.properties, który zawiera parametry takie jak URL bazy danych, nazwa użytkownika, hasło, oraz konfiguracja Hibernate (dialekt SQL, strategię generowania kluczy głównych, wyświetlanie zapytań SQL w logach).

Projekt wykorzystuje Hibernate jako implementację JPA do mapowania obiektowo-relacyjnego. Hibernate automatycznie generuje zapytania SQL na podstawie operacji na encjach JPA, co znacznie upraszcza dostęp do danych. Projekt wykorzystuje strategię generowania kluczy głównych IDENTITY, co oznacza, że klucze główne są generowane przez bazę danych.

## Walidacja Danych

Projekt wykorzystuje Spring Validation do walidacji danych wejściowych. DTO są oznaczone adnotacjami walidacyjnymi, takimi jak @NotNull, @NotBlank, @Email, @Size, @Min, @Max, które definiują zasady walidacji dla poszczególnych pól. Spring automatycznie waliduje dane wejściowe przed ich przetworzeniem przez kontrolery, co zapobiega wprowadzaniu nieprawidłowych danych do systemu.

## Obsługa Błędów

Projekt implementuje mechanizm obsługi błędów poprzez @ControllerAdvice i @ExceptionHandler. Klasa GlobalExceptionHandler definiuje metody do obsługi różnych typów wyjątków, takich jak ResourceNotFoundException (gdy zasób nie zostanie znaleziony), ValidationException (gdy walidacja danych nie powiedzie się), oraz AuthenticationException (gdy uwierzytelnienie nie powiedzie się). Metody te zwracają odpowiednie komunikaty błędów w formacie JSON, co pozwala aplikacji frontendowej na wyświetlanie odpowiednich komunikatów użytkownikom.

## Podsumowanie

Backend projektu EventFlow jest kompleksową aplikacją Spring Boot, która implementuje pełną funkcjonalność systemu rezerwacji i sprzedaży biletów na wydarzenia. Architektura aplikacji opiera się na czystym podziale warstw, co zapewnia separację odpowiedzialności i ułatwia utrzymanie kodu. System wykorzystuje najnowsze technologie Java 21 i Spring Boot 3.2.4, co zapewnia wysoką wydajność i bezpieczeństwo. Backend jest dobrze zintegrowany z bazą danych MySQL, systemem autoryzacji Spring Security, oraz zewnętrznymi usługami takimi jak SMTP dla wysyłania e-maili. Implementacja jest skalowalna i gotowa do dalszego rozwoju.




# Dokumentacja Bazy Danych EventFlow

## Przegląd Architektury Bazy Danych

System EventFlow wykorzystuje relacyjną bazę danych MySQL jako główne repozytorium danych. Baza danych jest zarządzana przez framework Spring Data JPA z Hibernate jako dostawcą ORM (Object-Relational Mapping). Konfiguracja bazy danych znajduje się w pliku `application.properties`, gdzie określone są parametry połączenia, sterownik JDBC oraz ustawienia Hibernate.

## Konfiguracja i Zarządzanie Schematem

Baza danych używa strategii automatycznego aktualizowania schematu poprzez parametr `spring.jpa.hibernate.ddl-auto=update`. Oznacza to, że Hibernate automatycznie dostosowuje strukturę tabel do definicji encji JPA przy starcie aplikacji. Jest to podejście wygodne w środowisku deweloperskim, ale w środowisku produkcyjnym zaleca się stosowanie migracji bazy danych (np. Flyway lub Liquibase) dla lepszego zarządzania zmianami schematu.

## ORM (Object-Relational Mapping)

System wykorzystuje Spring Data JPA jako główną warstwę abstrakcji do komunikacji z bazą danych. Encje JPA są zdefiniowane w pakiecie `com.eventflow.com.model` i mapują tabele bazy danych na obiekty Java. Każda encja jest oznaczona adnotacją `@Entity` i `@Table`, co pozwala Hibernate na automatyczne generowanie zapytań SQL dla podstawowych operacji CRUD.

Repozytoria Spring Data JPA znajdują się w pakiecie `com.eventflow.com.repository` i rozszerzają interfejs `JpaRepository<T, ID>`. Dzięki temu system automatycznie generuje implementacje dla standardowych operacji takich jak `save()`, `findById()`, `findAll()`, `deleteById()` i wiele innych. Repozytoria wykorzystują również konwencje nazewnictwa metod do generowania zapytań, na przykład `findByLogin(String login)` automatycznie generuje zapytanie SQL z klauzulą WHERE.

## Zapytania Natywne vs ORM

W systemie EventFlow stosowane jest hybrydowe podejście do zapytań bazodanowych. Dla większości operacji wykorzystywane są metody repozytoriów JPA, które generują zapytania SQL automatycznie. Jednak dla bardziej złożonych zapytań, szczególnie tych wymagających agregacji, złączeń z wieloma tabelami lub specyficznych funkcji bazodanowych, stosowane są zapytania natywne.

Zapytania natywne są definiowane przy użyciu adnotacji `@Query` z parametrem `nativeQuery = true`. Przykładem może być metoda `countRegistrationsGroupedByDay` w `UserRepository`, która wykorzystuje funkcję MySQL `DATE()` do grupowania rejestracji użytkowników według dni kalendarzowych. Podobnie, w `WydarzenieRepository` znajdują się zapytania natywne do agregacji danych dla wykresów analitycznych, które zliczają wydarzenia według kategorii i statusów.

Podejście hybrydowe pozwala na wykorzystanie zalet obu światów: prostoty i wydajności ORM dla standardowych operacji oraz mocy zapytań natywnych dla skomplikowanych operacji analitycznych i raportowych.

## Klucze Obce i Akcje Referencyjne

System implementuje zaawansowane zarządzanie kluczami obcymi i akcjami referencyjnymi. Domyślnie Hibernate generuje klucze obce z akcją `ON DELETE RESTRICT` lub `ON DELETE SET NULL`, w zależności od konfiguracji relacji w encjach. Jednak system EventFlow wymaga bardziej agresywnej polityki kaskadowania dla utrzymania spójności danych.

W tym celu stworzono klasę `ForeignKeyCascadeSchemaRepair`, która jest uruchamiana przy starcie aplikacji (adnotacja `@PostConstruct`). Klasa ta wykorzystuje `JdbcTemplate` do wykonania zapytań DDL (Data Definition Language) bezpośrednio na bazie danych. Automatycznie ustawia klucze obce z akcją `ON DELETE CASCADE` dla kluczowych relacji rodzic-dziecko, takich jak:

- Relacje między użytkownikami a ich danymi (ulubione, powiadomienia, logi logowania)
- Relacje między wydarzeniami a biletemi, personelem, opiniami
- Relacje między zamówieniami a pozycjami zamówienia
- Relacje między biletami a pozycjami zamówienia

Klasa ta najpierw sprawdza, czy dany klucz obcy już istnieje, a następnie modyfikuje go lub tworzy nowy z odpowiednią akcją kaskadową. Dzięki temu usunięcie rekordu nadrzędnego automatycznie usuwa wszystkie powiązane rekordy podrzędne, co zapobiega pozostawaniu sierot w bazie danych.

## Reparacja Schematu Bazy Danych

Oprócz zarządzania kluczami obcymi, system posiada mechanizm reparacji schematu bazy danych. Klasa `SalaLayoutSchemaRepair` jest odpowiedzialna za dodawanie nowych kolumn do istniejących tabel bez utraty danych. Jest to szczególnie przydatne podczas ewolucji schematu bazy danych, gdy nowe funkcje wymagają dodatkowych pól.

Klasa ta sprawdza, czy dana kolumna istnieje w tabeli, a jeśli nie, dodaje ją z odpowiednią definicją typu. Następnie aktualizuje istniejące rekordy wartościami domyślnymi, aby zapewnić spójność danych. Przykładowo, dodano kolumny `layout_width` i `layout_height` do tabeli `sale` oraz kolumny związane z układem miejsc do tabeli `sala_miejsca`.

## Brak Procedur Składowanych i Wyzwalaczy

W systemie EventFlow nie stosuje się procedur składowanych ani wyzwalaczy (triggers) bazodanowych. Zamiast tego cała logika biznesowa jest implementowana w warstwie aplikacji Java. Jest to świadomy wybór architektoniczny, który pozwala na:

- Lepszą testowalność logiki biznesowej
- Łatwiejsze utrzymanie i debugowanie kodu
- Niezależność od konkretnego silnika bazy danych
- Centralizację logiki w warstwie serwisowej

Logika, która w tradycyjnych systemach bazodanowych byłaby implementowana jako wyzwalacze (np. automatyczne aktualizacje liczników, walidacja danych, logowanie zmian), jest w systemie EventFlow realizowana przez metody serwisowe wywoływane przy operacjach CRUD.

## Transakcje i Zarządzanie Stanem

Spring Data JPA automatycznie zarządza transakcjami dla metod repozytoriów. Domyślnie każda operacja na repozytorium jest wykonywana w transakcji. Dla bardziej złożonych operacji obejmujących wiele repozytoriów stosuje się adnotację `@Transactional` na metodach serwisowych, co zapewnia atomowość operacji.

System wykorzystuje `EntityManager` do zarządzania kontekstem trwałości (persistence context). Obiekty są ładowane do kontekstu, modyfikowane, a następnie automatycznie synchronizowane z bazą danych przy zakończeniu transakcji. Dla operacji modyfikujących, które nie powinny być śledzone przez kontekst trwałości, stosuje się adnotację `@Modifying` w zapytaniach natywnych.

## Optymalizacja Wydajności

System stosuje kilka technik optymalizacji wydajności bazodanowej:

- **Lazy Loading**: Domyślnie relacje między encjami są ładowane leniwie, co oznacza, że dane są pobierane z bazy tylko wtedy, gdy są faktycznie potrzebne.
- **Fetch Joins**: Dla zapytań, które wymagają jednoczesnego pobrania encji i jej relacji, stosuje się `JOIN FETCH` w JPQL lub zapytaniach natywnych, aby uniknąć problemu N+1.
- **Indeksowanie**: Klucze główne i obce są automatycznie indeksowane przez Hibernate. Dla często wyszukiwanych pól można dodać dodatkowe indeksy.
- **Batch Processing**: Dla operacji masowych stosuje się przetwarzanie wsadowe, aby zredukować liczbę round-tripów do bazy danych.

## Bezpieczeństwo Bazy Danych

System stosuje kilka mechanizmów zabezpieczających bazę danych:

- **Parametryzowane zapytania**: Wszystkie zapytania, zarówno generowane przez ORM jak i natywne, wykorzystują parametryzowane zapytania, co zapobiega atakom SQL Injection.
- **Uprawnienia bazy danych**: Aplikacja łączy się z bazą danych przy użyciu dedykowanego użytkownika z ograniczonymi uprawnieniami, odpowiednimi do potrzeb aplikacji.
- **Szyfrowanie**: Wrażliwe dane, takie jak hasła użytkowników, są przechowywane w postaci zaszyfrowanej przy użyciu soli (salt) i algorytmu haszującego, co zapobiega odczytaniu haseł nawet w przypadku naruszenia bezpieczeństwa bazy danych.

## Podsumowanie

Baza danych EventFlow jest zaprojektowana jako nowoczesny, relacyjny system zarządzania danymi, który łączy wygodę ORM z elastycznością zapytań natywnych. Architektura oparta na Spring Data JPA zapewnia wysoką produktywność deweloperską, podczas gdy ręczne zarządzanie kluczami obcymi i schematem gwarantuje spójność danych. Brak procedur składowanych i wyzwalaczy jest świadomym wyborem, który centralizuje logikę biznesową w warstwie aplikacji, co ułatwia utrzymanie i rozwój systemu.
