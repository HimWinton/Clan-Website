<?php
if ($_SERVER["REQUEST_METHOD"] == "POST") {
    // Collect form data
    $discord_username = htmlspecialchars($_POST['discord_username']);
    $submission_type = htmlspecialchars($_POST['submission_type']);
    $message = htmlspecialchars($_POST['message']);

    // Email content
    $to = "petsimcentral@gmail.com";
    $subject = "New Feedback Submission";
    $email_content = "Discord Username: $discord_username\n";
    $email_content .= "Submission Type: $submission_type\n\n";
    $email_content .= "Message:\n$message\n";

    // Email headers
    $headers = "From: noreply@yourdomain.com\r\n";
    $headers .= "Reply-To: noreply@yourdomain.com\r\n";

    // Send email
    if (mail($to, $subject, $email_content, $headers)) {
        // Redirect to a thank you page or display a success message
        echo "Thank you for your feedback!";
    } else {
        // Handle the error
        echo "There was a problem sending your feedback. Please try again.";
    }
}
?>
