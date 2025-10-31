package services

import (
	"bytes"
	"fmt"
	"html/template"
	"net/smtp"

	"electronics-store/internal/config"
)

type EmailService struct {
	config *config.EmailConfig
}

type EmailData struct {
	ToEmail   string
	ToName    string
	Subject   string
	Body      string
	HTMLBody  string
	OTPCode   string
	UserName  string
	ExpiresIn int // in minutes
}

type EmailTemplate struct {
	Title       string
	Greeting    string
	Message     string
	OTPCode     string
	ExpiresIn   int
	Footer      string
	CompanyName string
	SupportURL  string
}

func NewEmailService(cfg *config.EmailConfig) *EmailService {
	return &EmailService{
		config: cfg,
	}
}

// SendOTPEmail sends OTP verification email
func (s *EmailService) SendOTPEmail(email, name, otpCode, otpType string) error {
	subject := s.getOTPSubject(otpType)
	htmlBody, err := s.generateOTPEmailHTML(name, otpCode, otpType)
	if err != nil {
		return fmt.Errorf("failed to generate email template: %w", err)
	}

	emailData := EmailData{
		ToEmail:  email,
		ToName:   name,
		Subject:  subject,
		HTMLBody: htmlBody,
		OTPCode:  otpCode,
		UserName: name,
		ExpiresIn: 15, // 15 minutes
	}

	return s.sendEmail(emailData)
}

// SendWelcomeEmail sends welcome email after successful registration
func (s *EmailService) SendWelcomeEmail(email, name string) error {
	subject := "Welcome to Electronics Store! 🎉"
	htmlBody, err := s.generateWelcomeEmailHTML(name)
	if err != nil {
		return fmt.Errorf("failed to generate welcome email: %w", err)
	}

	emailData := EmailData{
		ToEmail:  email,
		ToName:   name,
		Subject:  subject,
		HTMLBody: htmlBody,
		UserName: name,
	}

	return s.sendEmail(emailData)
}

// SendPasswordResetEmail sends password reset email
func (s *EmailService) SendPasswordResetEmail(email, name, otpCode string) error {
	subject := "Password Reset Request - Electronics Store"
	htmlBody, err := s.generatePasswordResetEmailHTML(name, otpCode)
	if err != nil {
		return fmt.Errorf("failed to generate password reset email: %w", err)
	}

	emailData := EmailData{
		ToEmail:  email,
		ToName:   name,
		Subject:  subject,
		HTMLBody: htmlBody,
		OTPCode:  otpCode,
		UserName: name,
		ExpiresIn: 15,
	}

	return s.sendEmail(emailData)
}

// sendEmail sends email using SMTP
func (s *EmailService) sendEmail(data EmailData) error {
	// Create message
	message := s.createMessage(data)

	// Setup authentication
	auth := smtp.PlainAuth("", s.config.SMTPUsername, s.config.SMTPPassword, s.config.SMTPHost)

	// Send email
	addr := fmt.Sprintf("%s:%d", s.config.SMTPHost, s.config.SMTPPort)
	
	if s.config.UseSSL {
		return s.sendEmailSSL(addr, auth, data, message)
	}
	
	return smtp.SendMail(addr, auth, s.config.FromEmail, []string{data.ToEmail}, message)
}

// sendEmailSSL sends email using SSL (for ports like 465)
func (s *EmailService) sendEmailSSL(addr string, auth smtp.Auth, data EmailData, message []byte) error {
	// This would require a more complex implementation with TLS
	// For now, we'll use the standard SMTP with TLS
	return smtp.SendMail(addr, auth, s.config.FromEmail, []string{data.ToEmail}, message)
}

// createMessage creates the email message
func (s *EmailService) createMessage(data EmailData) []byte {
	headers := make(map[string]string)
	headers["From"] = fmt.Sprintf("%s <%s>", s.config.FromName, s.config.FromEmail)
	headers["To"] = fmt.Sprintf("%s <%s>", data.ToName, data.ToEmail)
	headers["Subject"] = data.Subject
	headers["MIME-Version"] = "1.0"
	headers["Content-Type"] = "text/html; charset=UTF-8"

	message := ""
	for k, v := range headers {
		message += fmt.Sprintf("%s: %s\r\n", k, v)
	}
	message += "\r\n" + data.HTMLBody

	return []byte(message)
}

// getOTPSubject returns appropriate subject based on OTP type
func (s *EmailService) getOTPSubject(otpType string) string {
	switch otpType {
	case "email_verification":
		return "Verify Your Email - Electronics Store"
	case "password_reset":
		return "Password Reset Code - Electronics Store"
	case "login":
		return "Your Login Code - Electronics Store"
	default:
		return "Verification Code - Electronics Store"
	}
}

// generateOTPEmailHTML generates HTML email template for OTP
func (s *EmailService) generateOTPEmailHTML(name, otpCode, otpType string) (string, error) {
	templateData := EmailTemplate{
		Title:       s.getOTPSubject(otpType),
		Greeting:    fmt.Sprintf("Hello %s,", name),
		Message:     s.getOTPMessage(otpType),
		OTPCode:     otpCode,
		ExpiresIn:   15,
		Footer:      "If you didn't request this code, please ignore this email.",
		CompanyName: "Electronics Store",
		SupportURL:  "https://electronicsstore.com/support",
	}

	tmpl := `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{.Title}}</title>
    <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 0; background-color: #f4f4f4; }
        .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; }
        .content { padding: 40px 30px; }
        .otp-code { background-color: #f8f9fa; border: 2px dashed #dee2e6; border-radius: 8px; padding: 20px; text-align: center; margin: 30px 0; }
        .otp-number { font-size: 32px; font-weight: bold; color: #495057; letter-spacing: 8px; font-family: 'Courier New', monospace; }
        .message { color: #6c757d; line-height: 1.6; margin: 20px 0; }
        .footer { background-color: #f8f9fa; padding: 20px; text-align: center; color: #6c757d; font-size: 14px; }
        .button { display: inline-block; background-color: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
        .warning { background-color: #fff3cd; border: 1px solid #ffeaa7; color: #856404; padding: 15px; border-radius: 5px; margin: 20px 0; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>{{.CompanyName}}</h1>
            <h2>{{.Title}}</h2>
        </div>
        <div class="content">
            <p>{{.Greeting}}</p>
            <div class="message">{{.Message}}</div>
            
            <div class="otp-code">
                <p style="margin: 0 0 10px 0; color: #6c757d;">Your verification code is:</p>
                <div class="otp-number">{{.OTPCode}}</div>
                <p style="margin: 10px 0 0 0; color: #6c757d; font-size: 14px;">This code expires in {{.ExpiresIn}} minutes</p>
            </div>
            
            <div class="warning">
                <strong>Security Notice:</strong> {{.Footer}}
            </div>
            
            <p>If you have any questions, please contact our support team at <a href="{{.SupportURL}}">{{.SupportURL}}</a></p>
        </div>
        <div class="footer">
            <p>&copy; 2024 {{.CompanyName}}. All rights reserved.</p>
            <p>This is an automated message, please do not reply to this email.</p>
        </div>
    </div>
</body>
</html>`

	tmplParsed, err := template.New("otp_email").Parse(tmpl)
	if err != nil {
		return "", err
	}

	var buf bytes.Buffer
	if err := tmplParsed.Execute(&buf, templateData); err != nil {
		return "", err
	}

	return buf.String(), nil
}

// generateWelcomeEmailHTML generates welcome email template
func (s *EmailService) generateWelcomeEmailHTML(name string) (string, error) {
	templateData := EmailTemplate{
		Title:       "Welcome to Electronics Store! 🎉",
		Greeting:    fmt.Sprintf("Welcome %s!", name),
		Message:     "Thank you for joining Electronics Store! We're excited to have you on board. You can now explore our amazing collection of electronics and enjoy a seamless shopping experience.",
		CompanyName: "Electronics Store",
		SupportURL:  "https://electronicsstore.com/support",
	}

	tmpl := `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{.Title}}</title>
    <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 0; background-color: #f4f4f4; }
        .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; }
        .content { padding: 40px 30px; }
        .message { color: #6c757d; line-height: 1.6; margin: 20px 0; }
        .footer { background-color: #f8f9fa; padding: 20px; text-align: center; color: #6c757d; font-size: 14px; }
        .button { display: inline-block; background-color: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>{{.CompanyName}}</h1>
            <h2>{{.Title}}</h2>
        </div>
        <div class="content">
            <p>{{.Greeting}}</p>
            <div class="message">{{.Message}}</div>
            
            <div style="text-align: center; margin: 30px 0;">
                <a href="https://electronicsstore.com/products" class="button">Start Shopping</a>
            </div>
            
            <p>If you have any questions, please contact our support team at <a href="{{.SupportURL}}">{{.SupportURL}}</a></p>
        </div>
        <div class="footer">
            <p>&copy; 2024 {{.CompanyName}}. All rights reserved.</p>
            <p>This is an automated message, please do not reply to this email.</p>
        </div>
    </div>
</body>
</html>`

	tmplParsed, err := template.New("welcome_email").Parse(tmpl)
	if err != nil {
		return "", err
	}

	var buf bytes.Buffer
	if err := tmplParsed.Execute(&buf, templateData); err != nil {
		return "", err
	}

	return buf.String(), nil
}

// generatePasswordResetEmailHTML generates password reset email template
func (s *EmailService) generatePasswordResetEmailHTML(name, otpCode string) (string, error) {
	// Reuse the OTP template for password reset
	return s.generateOTPEmailHTML(name, otpCode, "password_reset")
}

// getOTPMessage returns appropriate message based on OTP type
func (s *EmailService) getOTPMessage(otpType string) string {
	switch otpType {
	case "email_verification":
		return "Thank you for registering with Electronics Store! Please verify your email address using the code below to complete your registration."
	case "password_reset":
		return "We received a request to reset your password. Use the code below to reset your password:"
	case "login":
		return "Use the code below to complete your login to Electronics Store:"
	default:
		return "Please use the code below to complete your verification:"
	}
}
