<?php
/**
 * BeSURE Business Consulting - Contact Form Handler
 * Receives POST data, validates, and sends email
 */

// Set JSON response header
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');

// Only allow POST requests
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed']);
    exit;
}

// Rate limiting (simple file-based)
$rateLimitFile = sys_get_temp_dir() . '/besure_contact_' . md5($_SERVER['REMOTE_ADDR']) . '.txt';
if (file_exists($rateLimitFile)) {
    $lastSubmit = (int) file_get_contents($rateLimitFile);
    if (time() - $lastSubmit < 60) { // 1 minute cooldown
        echo json_encode(['success' => false, 'message' => 'Please wait a moment before submitting again.']);
        exit;
    }
}

// Honeypot check
if (!empty($_POST['website_url'])) {
    // Bot detected - silently accept
    echo json_encode(['success' => true, 'message' => 'Thank you for your message!']);
    exit;
}

// Sanitize and validate inputs
$name = isset($_POST['name']) ? trim(htmlspecialchars($_POST['name'], ENT_QUOTES, 'UTF-8')) : '';
$email = isset($_POST['email']) ? trim(filter_var($_POST['email'], FILTER_SANITIZE_EMAIL)) : '';
$phone = isset($_POST['phone']) ? trim(htmlspecialchars($_POST['phone'], ENT_QUOTES, 'UTF-8')) : '';
$subject = isset($_POST['subject']) ? trim(htmlspecialchars($_POST['subject'], ENT_QUOTES, 'UTF-8')) : 'Website Inquiry';
$service = isset($_POST['service']) ? trim(htmlspecialchars($_POST['service'], ENT_QUOTES, 'UTF-8')) : '';
$message = isset($_POST['message']) ? trim(htmlspecialchars($_POST['message'], ENT_QUOTES, 'UTF-8')) : '';

// Validation
$errors = [];

if (empty($name)) {
    $errors[] = 'Name is required';
} elseif (strlen($name) < 2 || strlen($name) > 100) {
    $errors[] = 'Name must be between 2 and 100 characters';
}

if (empty($email)) {
    $errors[] = 'Email is required';
} elseif (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    $errors[] = 'Please provide a valid email address';
}

if (!empty($phone)) {
    $phoneClean = preg_replace('/[\s\-\(\)\+]/', '', $phone);
    if (!preg_match('/^\d{7,15}$/', $phoneClean)) {
        $errors[] = 'Please provide a valid phone number';
    }
}

if (empty($message)) {
    $errors[] = 'Message is required';
} elseif (strlen($message) < 10) {
    $errors[] = 'Message must be at least 10 characters';
} elseif (strlen($message) > 5000) {
    $errors[] = 'Message must be less than 5000 characters';
}

// Check for spam patterns
$spamPatterns = ['/\[url=/i', '/http[s]?:\/\/.*http[s]?:\/\//i', '/viagra|cialis|casino|poker|lottery/i'];
foreach ($spamPatterns as $pattern) {
    if (preg_match($pattern, $message)) {
        // Silently reject spam
        echo json_encode(['success' => true, 'message' => 'Thank you for your message!']);
        exit;
    }
}

if (!empty($errors)) {
    echo json_encode(['success' => false, 'message' => implode('. ', $errors)]);
    exit;
}

// Build email
$to = 'info@besure.today';
$emailSubject = 'New Website Inquiry: ' . $subject;

$emailBody = "
<!DOCTYPE html>
<html>
<head><meta charset='UTF-8'></head>
<body style='font-family: Arial, sans-serif; color: #333; max-width: 600px; margin: 0 auto;'>
    <div style='background: #1B3A7D; color: #fff; padding: 20px 30px; border-radius: 8px 8px 0 0;'>
        <h2 style='margin: 0; color: #fff;'>New Website Inquiry</h2>
        <p style='margin: 5px 0 0; opacity: 0.8; font-size: 14px;'>Received on " . date('F j, Y \a\t g:i A') . "</p>
    </div>
    <div style='background: #f8f9fa; padding: 30px; border: 1px solid #e9ecef;'>
        <table style='width: 100%; border-collapse: collapse;'>
            <tr>
                <td style='padding: 10px 0; font-weight: bold; width: 120px; vertical-align: top; color: #495057;'>Name:</td>
                <td style='padding: 10px 0; color: #212529;'>{$name}</td>
            </tr>
            <tr>
                <td style='padding: 10px 0; font-weight: bold; vertical-align: top; color: #495057;'>Email:</td>
                <td style='padding: 10px 0;'><a href='mailto:{$email}' style='color: #1682F8;'>{$email}</a></td>
            </tr>";

if (!empty($phone)) {
    $emailBody .= "
            <tr>
                <td style='padding: 10px 0; font-weight: bold; vertical-align: top; color: #495057;'>Phone:</td>
                <td style='padding: 10px 0;'><a href='tel:{$phone}' style='color: #1682F8;'>{$phone}</a></td>
            </tr>";
}

if (!empty($service)) {
    $emailBody .= "
            <tr>
                <td style='padding: 10px 0; font-weight: bold; vertical-align: top; color: #495057;'>Service:</td>
                <td style='padding: 10px 0; color: #212529;'>{$service}</td>
            </tr>";
}

$emailBody .= "
            <tr>
                <td style='padding: 10px 0; font-weight: bold; vertical-align: top; color: #495057;'>Subject:</td>
                <td style='padding: 10px 0; color: #212529;'>{$subject}</td>
            </tr>
            <tr>
                <td style='padding: 10px 0; font-weight: bold; vertical-align: top; color: #495057;'>Message:</td>
                <td style='padding: 10px 0; color: #212529; line-height: 1.6;'>" . nl2br($message) . "</td>
            </tr>
        </table>
    </div>
    <div style='background: #fff; padding: 20px 30px; border: 1px solid #e9ecef; border-top: none; border-radius: 0 0 8px 8px; font-size: 12px; color: #6c757d;'>
        <p>This message was sent from the BeSURE website contact form.</p>
        <p>IP: {$_SERVER['REMOTE_ADDR']} | Time: " . date('Y-m-d H:i:s T') . "</p>
    </div>
</body>
</html>";

// Email headers
$headers = [
    'MIME-Version: 1.0',
    'Content-type: text/html; charset=UTF-8',
    'From: BeSURE Website <noreply@besure.today>',
    'Reply-To: ' . $name . ' <' . $email . '>',
    'X-Mailer: PHP/' . phpversion(),
    'X-Priority: 1'
];

// Send email
$sent = @mail($to, $emailSubject, $emailBody, implode("\r\n", $headers));

if ($sent) {
    // Update rate limit
    file_put_contents($rateLimitFile, time());

    // Send auto-reply to sender
    $autoReplySubject = 'Thank you for contacting BeSURE Business Consulting';
    $autoReplyBody = "
<!DOCTYPE html>
<html>
<head><meta charset='UTF-8'></head>
<body style='font-family: Arial, sans-serif; color: #333; max-width: 600px; margin: 0 auto;'>
    <div style='background: #1B3A7D; color: #fff; padding: 30px; text-align: center; border-radius: 8px 8px 0 0;'>
        <h1 style='margin: 0; font-size: 24px; color: #fff;'>BeSURE</h1>
        <p style='margin: 5px 0 0; opacity: 0.8;'>Business Consulting</p>
    </div>
    <div style='padding: 30px; background: #fff; border: 1px solid #e9ecef;'>
        <h2 style='color: #1B3A7D; margin-top: 0;'>Thank You, {$name}!</h2>
        <p>We have received your inquiry and appreciate you reaching out to BeSURE Business Consulting.</p>
        <p>Our team will review your message and get back to you within <strong>24 business hours</strong>.</p>
        <p>For urgent inquiries, you can reach us directly:</p>
        <ul style='line-height: 2;'>
            <li><strong>US:</strong> +1 (904) 960-3704</li>
            <li><strong>India:</strong> +91 9177958777</li>
            <li><strong>Email:</strong> info@besure.today</li>
        </ul>
        <p style='margin-top: 20px;'>Best regards,<br><strong>BeSURE Business Consulting Team</strong></p>
    </div>
    <div style='padding: 20px; text-align: center; font-size: 12px; color: #6c757d; border: 1px solid #e9ecef; border-top: none; border-radius: 0 0 8px 8px;'>
        <p>&copy; " . date('Y') . " BeSURE Business Consulting LLP. All rights reserved.</p>
        <p><a href='https://besure.today' style='color: #1682F8;'>besure.today</a></p>
    </div>
</body>
</html>";

    $autoReplyHeaders = [
        'MIME-Version: 1.0',
        'Content-type: text/html; charset=UTF-8',
        'From: BeSURE Business Consulting <info@besure.today>',
        'X-Mailer: PHP/' . phpversion()
    ];

    @mail($email, $autoReplySubject, $autoReplyBody, implode("\r\n", $autoReplyHeaders));

    echo json_encode(['success' => true, 'message' => 'Thank you! Your message has been sent successfully.']);
} else {
    echo json_encode(['success' => false, 'message' => 'Unable to send email. Please try again or contact us directly at info@besure.today']);
}
