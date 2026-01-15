package com.gestioneventos.cofira.services;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.MailException;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class EmailService {

    private static final Logger logger = LoggerFactory.getLogger(EmailService.class);

    private final JavaMailSender mailSender;

    @Value("${spring.mail.username}")
    private String fromEmail;

    @Value("${app.name:COFIRA}")
    private String appName;

    public void sendPasswordResetEmail(String toEmail, String code) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(toEmail);
            message.setSubject(appName + " - Codigo de recuperacion de contrasena");
            message.setText(buildPasswordResetEmailBody(code));

            mailSender.send(message);
            logger.info("Password reset email sent to: {}", toEmail);
        } catch (MailException e) {
            logger.error("Failed to send password reset email to {}: {}", toEmail, e.getMessage());
            throw new RuntimeException("Error al enviar el email de recuperacion", e);
        }
    }

    private String buildPasswordResetEmailBody(String code) {
        return String.format(
            "Hola,\n\n" +
            "Has solicitado restablecer tu contrasena en %s.\n\n" +
            "Tu codigo de verificacion es: %s\n\n" +
            "Este codigo expira en 15 minutos.\n\n" +
            "Si no solicitaste este cambio, puedes ignorar este mensaje.\n\n" +
            "Saludos,\n" +
            "El equipo de %s",
            appName, code, appName
        );
    }

    public void sendWelcomeEmail(String toEmail, String username) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(toEmail);
            message.setSubject("Bienvenido a " + appName);
            message.setText(String.format(
                "Hola %s,\n\n" +
                "Bienvenido a %s!\n\n" +
                "Tu cuenta ha sido creada exitosamente.\n\n" +
                "Saludos,\n" +
                "El equipo de %s",
                username, appName, appName
            ));

            mailSender.send(message);
            logger.info("Welcome email sent to: {}", toEmail);
        } catch (MailException e) {
            logger.warn("Failed to send welcome email to {}: {}", toEmail, e.getMessage());
            // No lanzar excepcion para emails de bienvenida
        }
    }
}
