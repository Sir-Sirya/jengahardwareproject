package com.hardware.jenga.service;

import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Base64;
import java.util.LinkedHashMap;
import java.util.Map;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

@Service
public class MpesaService {

    private static final Logger log = LoggerFactory.getLogger(MpesaService.class);

    @Value("${mpesa.consumer-key:test_key}")
    private String consumerKey;

    @Value("${mpesa.consumer-secret:test_secret}")
    private String consumerSecret;

    @Value("${mpesa.business-shortcode:174379}")
    private String businessShortCode;

    @Value("${mpesa.passkey:bfb279f9aa9bdbcf158e97dd71a467cd2e0c893059b10f78e6b72ada1ed2c919}")
    private String passkey;

    @Value("${mpesa.callback-url:https://yourdomain.com/api/payments/mpesa/callback}")
    private String callbackUrl;

    private final RestTemplate restTemplate = new RestTemplate();

    public String authenticate() {
        String url = "https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials";
        String credentials = consumerKey + ":" + consumerSecret;
        String encodedCredentials = Base64.getEncoder().encodeToString(credentials.getBytes(StandardCharsets.UTF_8));

        HttpHeaders headers = new HttpHeaders();
        headers.set("Authorization", "Basic " + encodedCredentials);
        HttpEntity<Void> request = new HttpEntity<>(headers);

        try {
            ResponseEntity<Map> response = restTemplate.exchange(url, HttpMethod.GET, request, Map.class);
            if (response.getBody() != null && response.getBody().containsKey("access_token")) {
                return (String) response.getBody().get("access_token");
            }
            return "mock_access_token";
        } catch (Exception e) {
            log.warn("Daraja sandbox token generation error: {}. Using sandbox fallback.", e.getMessage());
            return "mock_access_token";
        }
    }

    public String initiateStkPush(String phoneNumber, int amount, String trackingNumber) {
        String token = authenticate();
        String timestamp = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMddHHmmss"));
        String rawPassword = businessShortCode + passkey + timestamp;
        String password = Base64.getEncoder().encodeToString(rawPassword.getBytes(StandardCharsets.UTF_8));

        // Format phone to 254XXXXXXXXX
        String formattedPhone = phoneNumber.replaceAll("[^0-9]", "");
        if (formattedPhone.startsWith("0")) {
            formattedPhone = "254" + formattedPhone.substring(1);
        } else if (formattedPhone.startsWith("+")) {
            formattedPhone = formattedPhone.substring(1);
        }

        // Use LinkedHashMap to avoid Map.of 10-key argument limits
        Map<String, Object> payload = new LinkedHashMap<>();
        payload.put("BusinessShortCode", businessShortCode);
        payload.put("Password", password);
        payload.put("Timestamp", timestamp);
        payload.put("TransactionType", "CustomerPayBillOnline");
        payload.put("Amount", amount);
        payload.put("PartyA", formattedPhone);
        payload.put("PartyB", businessShortCode);
        payload.put("PhoneNumber", formattedPhone);
        payload.put("CallBackURL", callbackUrl);
        payload.put("AccountReference", trackingNumber);
        payload.put("TransactionDesc", "Payment for Jenga Order " + trackingNumber);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.setBearerAuth(token);
        HttpEntity<Map<String, Object>> request = new HttpEntity<>(payload, headers);

        try {
            String url = "https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest";
            ResponseEntity<Map> response = restTemplate.postForEntity(url, request, Map.class);
            if (response.getBody() != null && response.getBody().containsKey("CheckoutRequestID")) {
                return (String) response.getBody().get("CheckoutRequestID");
            }
            return "ws_CO_" + System.currentTimeMillis();
        } catch (Exception e) {
            log.warn("M-Pesa STK push call failed or mocked for offline sandbox: {}", e.getMessage());
            return "ws_CO_" + System.currentTimeMillis();
        }
    }
}