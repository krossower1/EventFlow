package com.eventflow.com.auth;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.net.URI;
import java.net.URLEncoder;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.time.Duration;

@Service
// Wyznacza przybliżoną lokalizację (miasto/kraj) na potrzeby historii logowań.
public class LoginLocationService {
	private static final String UNKNOWN_LOCATION = "Nieznana lokalizacja";
	private static final String LOCAL_LOCATION = "Lokalnie";

	private final ObjectMapper objectMapper;
	private final HttpClient httpClient;

	public LoginLocationService(ObjectMapper objectMapper) {
		this.objectMapper = objectMapper;
		this.httpClient = HttpClient.newBuilder()
			.connectTimeout(Duration.ofSeconds(2))
			.build();
	}

	// Lokalizuje IP podczas logowania; wynik jest zapisywany jako opis tekstowy w logu.
	public String resolveLocation(String ipAddress) {
		String normalizedIp = normalizeIp(ipAddress);
		if (normalizedIp == null || normalizedIp.isBlank()) {
			return UNKNOWN_LOCATION;
		}
		if (isLocalOrPrivateAddress(normalizedIp)) {
			return LOCAL_LOCATION;
		}

		try {
			String encodedIp = URLEncoder.encode(normalizedIp, StandardCharsets.UTF_8);
			URI uri = URI.create("http://ip-api.com/json/" + encodedIp + "?fields=status,country,city");
			HttpRequest request = HttpRequest.newBuilder(uri)
				.timeout(Duration.ofSeconds(2))
				.GET()
				.build();
			HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
			if (response.statusCode() < 200 || response.statusCode() >= 300) {
				return UNKNOWN_LOCATION;
			}
			JsonNode node = objectMapper.readTree(response.body());
			if (!"success".equalsIgnoreCase(node.path("status").asText())) {
				return UNKNOWN_LOCATION;
			}
			String city = safeText(node.path("city").asText());
			String country = safeText(node.path("country").asText());
			if (!city.isEmpty() && !country.isEmpty()) return city + ", " + country;
			if (!country.isEmpty()) return country;
			return UNKNOWN_LOCATION;
		} catch (InterruptedException ex) {
			Thread.currentThread().interrupt();
			return UNKNOWN_LOCATION;
		} catch (IOException ex) {
			return UNKNOWN_LOCATION;
		} catch (Exception ex) {
			return UNKNOWN_LOCATION;
		}
	}

	// Normalizuje reprezentacje IP (IPv4/IPv6/proxy) do formatu akceptowanego przez resolver.
	private String normalizeIp(String raw) {
		if (raw == null) return "";
		String ip = raw.trim();
		if (ip.startsWith("::ffff:")) {
			ip = ip.substring("::ffff:".length());
		}
		if (ip.startsWith("[") && ip.contains("]")) {
			ip = ip.substring(1, ip.indexOf(']'));
		}
		int zoneIndex = ip.indexOf('%');
		if (zoneIndex > 0) {
			ip = ip.substring(0, zoneIndex);
		}
		return ip;
	}

	// Odróżnia adresy lokalne/prywatne, aby nie wykonywać zbędnych zapytań GeoIP.
	private boolean isLocalOrPrivateAddress(String ip) {
		if ("::1".equals(ip) || "0:0:0:0:0:0:0:1".equals(ip) || "localhost".equalsIgnoreCase(ip)) return true;
		if (ip.startsWith("10.") || ip.startsWith("192.168.") || ip.startsWith("127.")) return true;
		if (ip.startsWith("172.")) {
			String[] parts = ip.split("\\.");
			if (parts.length > 1) {
				try {
					int second = Integer.parseInt(parts[1]);
					if (second >= 16 && second <= 31) return true;
				} catch (NumberFormatException ignored) {
					return false;
				}
			}
		}
		return ip.startsWith("fc") || ip.startsWith("fd") || ip.startsWith("fe80:");
	}

	// Bezpieczne czyszczenie pól tekstowych odpowiedzi API geolokalizacji.
	private String safeText(String value) {
		return value == null ? "" : value.trim();
	}
}
