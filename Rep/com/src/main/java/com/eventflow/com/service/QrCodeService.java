package com.eventflow.com.service;

import com.google.zxing.BarcodeFormat;
import com.google.zxing.EncodeHintType;
import com.google.zxing.WriterException;
import com.google.zxing.client.j2se.MatrixToImageWriter;
import com.google.zxing.common.BitMatrix;
import com.google.zxing.qrcode.QRCodeWriter;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.util.Base64;
import java.util.HashMap;
import java.util.Map;

@Service
public class QrCodeService {

	private static final int QR_CODE_WIDTH = 300;
	private static final int QR_CODE_HEIGHT = 300;

	/**
	 * Generuje kod QR dla podanego tekstu i zwraca go jako base64-encoded data URL.
	 */
	public String generateQrCodeDataUrl(String text) {
		try {
			QRCodeWriter qrCodeWriter = new QRCodeWriter();
			Map<EncodeHintType, Object> hints = new HashMap<>();
			hints.put(EncodeHintType.CHARACTER_SET, "UTF-8");
			hints.put(EncodeHintType.MARGIN, 1);

			BitMatrix bitMatrix = qrCodeWriter.encode(text, BarcodeFormat.QR_CODE, QR_CODE_WIDTH, QR_CODE_HEIGHT, hints);

			ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
			MatrixToImageWriter.writeToStream(bitMatrix, "PNG", outputStream);

			byte[] imageBytes = outputStream.toByteArray();
			String base64Image = Base64.getEncoder().encodeToString(imageBytes);

			return "data:image/png;base64," + base64Image;
		} catch (WriterException | IOException e) {
			throw new RuntimeException("Nie udało się wygenerować kodu QR", e);
		}
	}
}
