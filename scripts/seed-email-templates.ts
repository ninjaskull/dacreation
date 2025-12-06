import { db } from "../server/db";
import { emailTemplates } from "../shared/schema";
import { eq } from "drizzle-orm";

const baseStyles = `
  <style>
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333333; margin: 0; padding: 0; background-color: #f5f5f5; }
    .email-container { max-width: 600px; margin: 0 auto; background-color: #ffffff; }
    .header { background: linear-gradient(135deg, #722F37 0%, #8B4513 100%); padding: 30px 40px; text-align: center; }
    .header img { max-height: 60px; }
    .header h1 { color: #ffffff; margin: 15px 0 0 0; font-size: 24px; font-weight: 600; }
    .content { padding: 40px; }
    .content h2 { color: #722F37; margin-top: 0; font-size: 22px; }
    .content p { margin: 15px 0; color: #555555; }
    .highlight-box { background-color: #FDF8F3; border-left: 4px solid #722F37; padding: 20px; margin: 25px 0; border-radius: 0 8px 8px 0; }
    .highlight-box h3 { color: #722F37; margin: 0 0 10px 0; font-size: 16px; }
    .details-table { width: 100%; border-collapse: collapse; margin: 20px 0; }
    .details-table td { padding: 12px 15px; border-bottom: 1px solid #eeeeee; }
    .details-table td:first-child { color: #888888; width: 40%; font-weight: 500; }
    .details-table td:last-child { color: #333333; }
    .cta-button { display: inline-block; background: linear-gradient(135deg, #722F37 0%, #8B4513 100%); color: #ffffff !important; text-decoration: none; padding: 14px 35px; border-radius: 6px; font-weight: 600; margin: 20px 0; }
    .cta-button:hover { opacity: 0.9; }
    .secondary-button { display: inline-block; background-color: #ffffff; color: #722F37 !important; text-decoration: none; padding: 12px 30px; border-radius: 6px; font-weight: 600; border: 2px solid #722F37; margin: 10px 5px; }
    .footer { background-color: #2D2D2D; padding: 30px 40px; text-align: center; color: #999999; font-size: 13px; }
    .footer a { color: #D4A574; text-decoration: none; }
    .social-links { margin: 15px 0; }
    .social-links a { display: inline-block; margin: 0 10px; color: #ffffff; }
    .divider { height: 1px; background-color: #eeeeee; margin: 30px 0; }
    .badge { display: inline-block; padding: 5px 12px; border-radius: 20px; font-size: 12px; font-weight: 600; }
    .badge-success { background-color: #D4EDDA; color: #155724; }
    .badge-warning { background-color: #FFF3CD; color: #856404; }
    .badge-info { background-color: #D1ECF1; color: #0C5460; }
    .badge-danger { background-color: #F8D7DA; color: #721C24; }
    .amount { font-size: 28px; font-weight: 700; color: #722F37; }
    .status-indicator { display: inline-block; width: 10px; height: 10px; border-radius: 50%; margin-right: 8px; }
    .status-success { background-color: #28a745; }
    .status-pending { background-color: #ffc107; }
    .status-urgent { background-color: #dc3545; }
  </style>
`;

const emailHeader = `
  <div class="header">
    <img src="{{company_logo}}" alt="{{company_name}}" style="max-height: 60px;">
    <h1>{{company_name}}</h1>
  </div>
`;

const emailFooter = `
  <div class="footer">
    <p style="margin: 0 0 10px 0;"><strong>{{company_name}}</strong></p>
    <p style="margin: 5px 0;">{{company_address}}</p>
    <p style="margin: 5px 0;">
      <a href="tel:{{company_phone}}">{{company_phone}}</a> | 
      <a href="mailto:{{company_email}}">{{company_email}}</a>
    </p>
    <p style="margin: 15px 0 0 0;">
      <a href="{{company_website}}">Visit our website</a>
    </p>
    <p style="margin-top: 20px; font-size: 11px; color: #777777;">
      © {{current_year}} {{company_name}}. All rights reserved.
    </p>
  </div>
`;

const templates = [
  // ==========================================
  // USER/CLIENT NOTIFICATIONS
  // ==========================================
  {
    name: "Welcome Email",
    templateKey: "welcome_email",
    type: "transactional",
    subject: "Welcome to {{company_name}} - Let's Create Something Extraordinary!",
    variables: ["client_name", "client_email"],
    htmlContent: `
<!DOCTYPE html>
<html>
<head>${baseStyles}</head>
<body>
  <div class="email-container">
    ${emailHeader}
    <div class="content">
      <h2>Welcome, {{client_name}}! 🎉</h2>
      <p>We're thrilled to have you join the {{company_name}} family. Your journey towards creating an unforgettable event begins here.</p>
      
      <div class="highlight-box">
        <h3>What happens next?</h3>
        <p style="margin: 0;">Our team will be reaching out to you shortly to discuss your vision and how we can bring it to life. In the meantime, feel free to explore our portfolio and get inspired!</p>
      </div>
      
      <p>At {{company_name}}, we believe every event is a unique story waiting to be told. Whether it's a grand wedding celebration, a corporate gala, or an intimate gathering, we're here to make it extraordinary.</p>
      
      <div style="text-align: center; margin: 30px 0;">
        <a href="{{company_website}}/portfolio" class="cta-button">View Our Portfolio</a>
      </div>
      
      <div class="divider"></div>
      
      <p style="color: #888888; font-size: 14px;">Have questions? Simply reply to this email or call us at {{company_phone}}. We're always happy to help!</p>
    </div>
    ${emailFooter}
  </div>
</body>
</html>`,
    textContent: `Welcome to {{company_name}}, {{client_name}}!

We're thrilled to have you join our family. Your journey towards creating an unforgettable event begins here.

Our team will be reaching out to you shortly to discuss your vision. In the meantime, feel free to explore our portfolio at {{company_website}}/portfolio.

Questions? Reply to this email or call us at {{company_phone}}.

Best regards,
{{company_name}}`
  },

  {
    name: "Inquiry Confirmation",
    templateKey: "inquiry_confirmation",
    type: "transactional",
    subject: "Thank You for Your Inquiry - {{company_name}}",
    variables: ["lead_name", "event_type", "event_date", "guest_count", "inquiry_id"],
    htmlContent: `
<!DOCTYPE html>
<html>
<head>${baseStyles}</head>
<body>
  <div class="email-container">
    ${emailHeader}
    <div class="content">
      <h2>Thank You for Reaching Out, {{lead_name}}!</h2>
      <p>We've received your inquiry and are excited about the possibility of being part of your special occasion.</p>
      
      <div class="highlight-box">
        <h3>Your Inquiry Details</h3>
        <table class="details-table" style="margin: 10px 0 0 0;">
          <tr><td>Reference ID</td><td><strong>#{{inquiry_id}}</strong></td></tr>
          <tr><td>Event Type</td><td>{{event_type}}</td></tr>
          <tr><td>Tentative Date</td><td>{{event_date}}</td></tr>
          <tr><td>Expected Guests</td><td>{{guest_count}}</td></tr>
        </table>
      </div>
      
      <p><strong>What's Next?</strong></p>
      <p>A dedicated event specialist from our team will contact you within <strong>24 hours</strong> to discuss your requirements in detail and answer any questions you may have.</p>
      
      <div style="text-align: center; margin: 30px 0;">
        <a href="tel:{{company_phone}}" class="cta-button">Call Us Now</a>
        <br><br>
        <a href="{{company_website}}/portfolio" class="secondary-button">Browse Our Work</a>
      </div>
      
      <p style="color: #888888; font-size: 14px;">Can't wait? Feel free to reach out to us directly at {{company_phone}} or {{company_email}}.</p>
    </div>
    ${emailFooter}
  </div>
</body>
</html>`,
    textContent: `Thank you for your inquiry, {{lead_name}}!

We've received your inquiry and are excited about the possibility of being part of your special occasion.

YOUR INQUIRY DETAILS:
- Reference ID: #{{inquiry_id}}
- Event Type: {{event_type}}
- Tentative Date: {{event_date}}
- Expected Guests: {{guest_count}}

WHAT'S NEXT?
A dedicated event specialist from our team will contact you within 24 hours.

Can't wait? Call us at {{company_phone}} or email {{company_email}}.

Best regards,
{{company_name}}`
  },

  {
    name: "Appointment Confirmation",
    templateKey: "appointment_confirmation",
    type: "transactional",
    subject: "Your Consultation is Confirmed - {{appointment_date}}",
    variables: ["client_name", "appointment_date", "appointment_time", "appointment_type", "appointment_location", "consultant_name"],
    htmlContent: `
<!DOCTYPE html>
<html>
<head>${baseStyles}</head>
<body>
  <div class="email-container">
    ${emailHeader}
    <div class="content">
      <h2>Your Consultation is Confirmed! ✓</h2>
      <p>Dear {{client_name}},</p>
      <p>We're looking forward to meeting with you and discussing your event vision.</p>
      
      <div class="highlight-box">
        <h3>Appointment Details</h3>
        <table class="details-table" style="margin: 10px 0 0 0;">
          <tr><td>📅 Date</td><td><strong>{{appointment_date}}</strong></td></tr>
          <tr><td>🕐 Time</td><td><strong>{{appointment_time}}</strong></td></tr>
          <tr><td>📍 Type</td><td>{{appointment_type}}</td></tr>
          <tr><td>📌 Location</td><td>{{appointment_location}}</td></tr>
          <tr><td>👤 Your Consultant</td><td>{{consultant_name}}</td></tr>
        </table>
      </div>
      
      <p><strong>To make the most of our meeting, please consider:</strong></p>
      <ul>
        <li>Any inspiration photos or themes you have in mind</li>
        <li>Your approximate budget range</li>
        <li>Special requirements or preferences</li>
        <li>Questions you'd like to discuss</li>
      </ul>
      
      <div style="text-align: center; margin: 30px 0;">
        <a href="#" class="cta-button">Add to Calendar</a>
      </div>
      
      <p style="color: #888888; font-size: 14px;">Need to reschedule? Please contact us at least 24 hours in advance at {{company_phone}}.</p>
    </div>
    ${emailFooter}
  </div>
</body>
</html>`,
    textContent: `Your Consultation is Confirmed!

Dear {{client_name}},

We're looking forward to meeting with you and discussing your event vision.

APPOINTMENT DETAILS:
- Date: {{appointment_date}}
- Time: {{appointment_time}}
- Type: {{appointment_type}}
- Location: {{appointment_location}}
- Your Consultant: {{consultant_name}}

Please bring any inspiration photos, your approximate budget range, and any questions you'd like to discuss.

Need to reschedule? Please contact us at least 24 hours in advance at {{company_phone}}.

Best regards,
{{company_name}}`
  },

  {
    name: "Appointment Reminder",
    templateKey: "appointment_reminder",
    type: "reminder",
    subject: "Reminder: Your Consultation Tomorrow at {{appointment_time}}",
    variables: ["client_name", "appointment_date", "appointment_time", "appointment_type", "appointment_location", "consultant_name"],
    htmlContent: `
<!DOCTYPE html>
<html>
<head>${baseStyles}</head>
<body>
  <div class="email-container">
    ${emailHeader}
    <div class="content">
      <h2>Friendly Reminder 🔔</h2>
      <p>Dear {{client_name}},</p>
      <p>This is a gentle reminder about your upcoming consultation with us.</p>
      
      <div class="highlight-box">
        <h3>Tomorrow's Appointment</h3>
        <table class="details-table" style="margin: 10px 0 0 0;">
          <tr><td>📅 Date</td><td><strong>{{appointment_date}}</strong></td></tr>
          <tr><td>🕐 Time</td><td><strong>{{appointment_time}}</strong></td></tr>
          <tr><td>📍 Type</td><td>{{appointment_type}}</td></tr>
          <tr><td>📌 Location</td><td>{{appointment_location}}</td></tr>
          <tr><td>👤 Consultant</td><td>{{consultant_name}}</td></tr>
        </table>
      </div>
      
      <p>We're excited to discuss your event and help bring your vision to life!</p>
      
      <div style="text-align: center; margin: 30px 0;">
        <a href="tel:{{company_phone}}" class="cta-button">Confirm Attendance</a>
        <br><br>
        <span style="color: #888888; font-size: 14px;">or call {{company_phone}} to reschedule</span>
      </div>
    </div>
    ${emailFooter}
  </div>
</body>
</html>`,
    textContent: `Friendly Reminder!

Dear {{client_name}},

This is a gentle reminder about your upcoming consultation with us.

TOMORROW'S APPOINTMENT:
- Date: {{appointment_date}}
- Time: {{appointment_time}}
- Type: {{appointment_type}}
- Location: {{appointment_location}}
- Consultant: {{consultant_name}}

We're excited to discuss your event and help bring your vision to life!

Call {{company_phone}} to confirm or reschedule.

Best regards,
{{company_name}}`
  },

  {
    name: "Event Booking Confirmation",
    templateKey: "event_booking_confirmation",
    type: "transactional",
    subject: "Your Event is Confirmed! - {{event_name}}",
    variables: ["client_name", "event_name", "event_type", "event_date", "event_venue", "guest_count", "contract_amount", "booking_id"],
    htmlContent: `
<!DOCTYPE html>
<html>
<head>${baseStyles}</head>
<body>
  <div class="email-container">
    ${emailHeader}
    <div class="content">
      <h2>Congratulations, {{client_name}}! 🎊</h2>
      <p>Your event has been officially booked! We're honored to be part of this special journey with you.</p>
      
      <div class="highlight-box" style="background-color: #D4EDDA; border-left-color: #28a745;">
        <h3 style="color: #28a745;">✓ Booking Confirmed</h3>
        <p style="margin: 5px 0; color: #155724;">Reference: <strong>#{{booking_id}}</strong></p>
      </div>
      
      <h3 style="color: #722F37;">Event Details</h3>
      <table class="details-table">
        <tr><td>Event Name</td><td><strong>{{event_name}}</strong></td></tr>
        <tr><td>Event Type</td><td>{{event_type}}</td></tr>
        <tr><td>Date</td><td>{{event_date}}</td></tr>
        <tr><td>Venue</td><td>{{event_venue}}</td></tr>
        <tr><td>Guest Count</td><td>{{guest_count}}</td></tr>
        <tr><td>Contract Value</td><td class="amount">₹{{contract_amount}}</td></tr>
      </table>
      
      <div class="divider"></div>
      
      <p><strong>What's Next?</strong></p>
      <ol>
        <li>Your dedicated event manager will be assigned shortly</li>
        <li>We'll schedule a detailed planning session</li>
        <li>You'll receive access to your event planning portal</li>
        <li>Regular updates will keep you informed at every step</li>
      </ol>
      
      <div style="text-align: center; margin: 30px 0;">
        <a href="{{company_website}}" class="cta-button">View Event Dashboard</a>
      </div>
      
      <p style="color: #888888; font-size: 14px;">Questions? Your event team is always here to help at {{company_email}} or {{company_phone}}.</p>
    </div>
    ${emailFooter}
  </div>
</body>
</html>`,
    textContent: `Congratulations, {{client_name}}!

Your event has been officially booked! We're honored to be part of this special journey with you.

BOOKING CONFIRMED
Reference: #{{booking_id}}

EVENT DETAILS:
- Event Name: {{event_name}}
- Event Type: {{event_type}}
- Date: {{event_date}}
- Venue: {{event_venue}}
- Guest Count: {{guest_count}}
- Contract Value: ₹{{contract_amount}}

WHAT'S NEXT:
1. Your dedicated event manager will be assigned shortly
2. We'll schedule a detailed planning session
3. You'll receive access to your event planning portal
4. Regular updates will keep you informed at every step

Questions? Contact us at {{company_email}} or {{company_phone}}.

Best regards,
{{company_name}}`
  },

  {
    name: "Event Reminder - 7 Days",
    templateKey: "event_reminder_7days",
    type: "reminder",
    subject: "7 Days to Go! - {{event_name}}",
    variables: ["client_name", "event_name", "event_date", "event_venue", "event_manager_name", "event_manager_phone"],
    htmlContent: `
<!DOCTYPE html>
<html>
<head>${baseStyles}</head>
<body>
  <div class="email-container">
    ${emailHeader}
    <div class="content">
      <h2>Just 7 Days to Go! ⏰</h2>
      <p>Dear {{client_name}},</p>
      <p>The excitement is building! Your special day is just around the corner.</p>
      
      <div class="highlight-box">
        <h3>{{event_name}}</h3>
        <p style="margin: 5px 0;">📅 {{event_date}}</p>
        <p style="margin: 5px 0;">📍 {{event_venue}}</p>
      </div>
      
      <h3 style="color: #722F37;">Final Week Checklist</h3>
      <ul>
        <li>✅ Confirm final guest count with us</li>
        <li>✅ Review the event timeline</li>
        <li>✅ Finalize any special requests</li>
        <li>✅ Prepare any personal items to bring</li>
        <li>✅ Confirm vendor arrival times</li>
      </ul>
      
      <div style="background-color: #FDF8F3; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <p style="margin: 0 0 10px 0;"><strong>Your Event Manager</strong></p>
        <p style="margin: 5px 0;">{{event_manager_name}}</p>
        <p style="margin: 5px 0;">📞 {{event_manager_phone}}</p>
      </div>
      
      <p>We're working behind the scenes to ensure everything is perfect. If you have any last-minute questions or changes, don't hesitate to reach out!</p>
      
      <div style="text-align: center; margin: 30px 0;">
        <a href="tel:{{event_manager_phone}}" class="cta-button">Contact Event Manager</a>
      </div>
    </div>
    ${emailFooter}
  </div>
</body>
</html>`,
    textContent: `Just 7 Days to Go!

Dear {{client_name}},

The excitement is building! Your special day is just around the corner.

{{event_name}}
Date: {{event_date}}
Venue: {{event_venue}}

FINAL WEEK CHECKLIST:
- Confirm final guest count with us
- Review the event timeline
- Finalize any special requests
- Prepare any personal items to bring
- Confirm vendor arrival times

Your Event Manager: {{event_manager_name}}
Phone: {{event_manager_phone}}

Best regards,
{{company_name}}`
  },

  {
    name: "Invoice Sent",
    templateKey: "invoice_sent",
    type: "transactional",
    subject: "Invoice #{{invoice_number}} from {{company_name}}",
    variables: ["client_name", "invoice_number", "invoice_date", "due_date", "total_amount", "event_name", "payment_link"],
    htmlContent: `
<!DOCTYPE html>
<html>
<head>${baseStyles}</head>
<body>
  <div class="email-container">
    ${emailHeader}
    <div class="content">
      <h2>Invoice #{{invoice_number}}</h2>
      <p>Dear {{client_name}},</p>
      <p>Please find your invoice details below for {{event_name}}.</p>
      
      <div style="background-color: #FDF8F3; padding: 30px; border-radius: 8px; text-align: center; margin: 25px 0;">
        <p style="margin: 0; color: #888888; font-size: 14px;">Amount Due</p>
        <p class="amount" style="margin: 10px 0;">₹{{total_amount}}</p>
        <p style="margin: 0; color: #888888; font-size: 14px;">Due by {{due_date}}</p>
      </div>
      
      <table class="details-table">
        <tr><td>Invoice Number</td><td><strong>#{{invoice_number}}</strong></td></tr>
        <tr><td>Invoice Date</td><td>{{invoice_date}}</td></tr>
        <tr><td>Due Date</td><td>{{due_date}}</td></tr>
        <tr><td>Event</td><td>{{event_name}}</td></tr>
      </table>
      
      <div style="text-align: center; margin: 30px 0;">
        <a href="{{payment_link}}" class="cta-button">Pay Now</a>
        <br><br>
        <a href="#" class="secondary-button">Download Invoice</a>
      </div>
      
      <div class="divider"></div>
      
      <p style="color: #888888; font-size: 14px;"><strong>Payment Methods Available:</strong> Bank Transfer, UPI, Credit/Debit Card, Cheque</p>
      <p style="color: #888888; font-size: 14px;">For payment assistance, contact us at {{company_email}} or {{company_phone}}.</p>
    </div>
    ${emailFooter}
  </div>
</body>
</html>`,
    textContent: `Invoice #{{invoice_number}}

Dear {{client_name}},

Please find your invoice details below for {{event_name}}.

AMOUNT DUE: ₹{{total_amount}}
DUE DATE: {{due_date}}

INVOICE DETAILS:
- Invoice Number: #{{invoice_number}}
- Invoice Date: {{invoice_date}}
- Due Date: {{due_date}}
- Event: {{event_name}}

Pay online: {{payment_link}}

Payment Methods: Bank Transfer, UPI, Credit/Debit Card, Cheque

For assistance, contact {{company_email}} or {{company_phone}}.

Best regards,
{{company_name}}`
  },

  {
    name: "Payment Received - Client",
    templateKey: "payment_received_client",
    type: "transactional",
    subject: "Payment Received - Thank You! - Receipt #{{receipt_number}}",
    variables: ["client_name", "receipt_number", "payment_date", "payment_amount", "payment_method", "invoice_number", "remaining_balance", "event_name"],
    htmlContent: `
<!DOCTYPE html>
<html>
<head>${baseStyles}</head>
<body>
  <div class="email-container">
    ${emailHeader}
    <div class="content">
      <h2>Payment Received! ✓</h2>
      <p>Dear {{client_name}},</p>
      <p>Thank you for your payment. We've successfully received your payment for {{event_name}}.</p>
      
      <div class="highlight-box" style="background-color: #D4EDDA; border-left-color: #28a745;">
        <h3 style="color: #28a745; margin: 0;">✓ Payment Confirmed</h3>
      </div>
      
      <table class="details-table">
        <tr><td>Receipt Number</td><td><strong>#{{receipt_number}}</strong></td></tr>
        <tr><td>Payment Date</td><td>{{payment_date}}</td></tr>
        <tr><td>Amount Paid</td><td class="amount" style="font-size: 20px;">₹{{payment_amount}}</td></tr>
        <tr><td>Payment Method</td><td>{{payment_method}}</td></tr>
        <tr><td>Invoice Reference</td><td>#{{invoice_number}}</td></tr>
        <tr><td>Remaining Balance</td><td>₹{{remaining_balance}}</td></tr>
      </table>
      
      <div style="text-align: center; margin: 30px 0;">
        <a href="#" class="cta-button">Download Receipt</a>
      </div>
      
      <p style="color: #888888; font-size: 14px;">This is an automated receipt. Please retain for your records. For any queries, contact {{company_email}}.</p>
    </div>
    ${emailFooter}
  </div>
</body>
</html>`,
    textContent: `Payment Received!

Dear {{client_name}},

Thank you for your payment. We've successfully received your payment for {{event_name}}.

PAYMENT DETAILS:
- Receipt Number: #{{receipt_number}}
- Payment Date: {{payment_date}}
- Amount Paid: ₹{{payment_amount}}
- Payment Method: {{payment_method}}
- Invoice Reference: #{{invoice_number}}
- Remaining Balance: ₹{{remaining_balance}}

This is an automated receipt. Please retain for your records.

Best regards,
{{company_name}}`
  },

  {
    name: "Payment Reminder",
    templateKey: "payment_reminder",
    type: "reminder",
    subject: "Payment Reminder - Invoice #{{invoice_number}} Due {{due_date}}",
    variables: ["client_name", "invoice_number", "due_date", "total_amount", "event_name", "days_overdue", "payment_link"],
    htmlContent: `
<!DOCTYPE html>
<html>
<head>${baseStyles}</head>
<body>
  <div class="email-container">
    ${emailHeader}
    <div class="content">
      <h2>Payment Reminder</h2>
      <p>Dear {{client_name}},</p>
      <p>This is a friendly reminder about the outstanding payment for your event.</p>
      
      <div class="highlight-box" style="background-color: #FFF3CD; border-left-color: #ffc107;">
        <h3 style="color: #856404; margin: 0;">⚠ Payment Due</h3>
        <p style="margin: 10px 0 0 0; color: #856404;">Invoice #{{invoice_number}} - Due: {{due_date}}</p>
      </div>
      
      <div style="background-color: #FDF8F3; padding: 30px; border-radius: 8px; text-align: center; margin: 25px 0;">
        <p style="margin: 0; color: #888888; font-size: 14px;">Outstanding Amount</p>
        <p class="amount" style="margin: 10px 0;">₹{{total_amount}}</p>
        <p style="margin: 0; color: #888888; font-size: 14px;">for {{event_name}}</p>
      </div>
      
      <p>To ensure uninterrupted planning for your event, please complete the payment at your earliest convenience.</p>
      
      <div style="text-align: center; margin: 30px 0;">
        <a href="{{payment_link}}" class="cta-button">Pay Now</a>
      </div>
      
      <p style="color: #888888; font-size: 14px;">If you've already made this payment, please disregard this reminder. For payment assistance or to discuss payment plans, contact us at {{company_phone}}.</p>
    </div>
    ${emailFooter}
  </div>
</body>
</html>`,
    textContent: `Payment Reminder

Dear {{client_name}},

This is a friendly reminder about the outstanding payment for your event.

Invoice #{{invoice_number}}
Due Date: {{due_date}}
Amount: ₹{{total_amount}}
Event: {{event_name}}

Pay online: {{payment_link}}

If you've already made this payment, please disregard this reminder.

For assistance, contact {{company_phone}}.

Best regards,
{{company_name}}`
  },

  {
    name: "Thank You - Post Event",
    templateKey: "thank_you_post_event",
    type: "marketing",
    subject: "Thank You for Celebrating with {{company_name}}! 💐",
    variables: ["client_name", "event_name", "event_date", "feedback_link", "gallery_link"],
    htmlContent: `
<!DOCTYPE html>
<html>
<head>${baseStyles}</head>
<body>
  <div class="email-container">
    ${emailHeader}
    <div class="content">
      <h2>Thank You, {{client_name}}! 💐</h2>
      <p>It was an absolute pleasure being part of your {{event_name}} on {{event_date}}.</p>
      
      <p>We hope your event was everything you dreamed of and more. Seeing the joy on your faces and those of your guests is what makes our work truly rewarding.</p>
      
      <div class="highlight-box">
        <h3>We'd Love Your Feedback!</h3>
        <p style="margin: 0;">Your experience matters to us. Please take a moment to share your thoughts - it helps us continue delivering exceptional events.</p>
      </div>
      
      <div style="text-align: center; margin: 30px 0;">
        <a href="{{feedback_link}}" class="cta-button">Share Your Experience</a>
        <br><br>
        <a href="{{gallery_link}}" class="secondary-button">View Event Photos</a>
      </div>
      
      <div class="divider"></div>
      
      <h3 style="color: #722F37;">Stay Connected</h3>
      <p>Follow us on social media to see highlights from events, get inspiration, and stay updated with our latest work.</p>
      
      <p>And remember, whether it's your next milestone celebration or a friend's special day, we're always here to create magic together!</p>
      
      <p style="margin-top: 30px;">With warm regards and gratitude,<br><strong>The {{company_name}} Team</strong></p>
    </div>
    ${emailFooter}
  </div>
</body>
</html>`,
    textContent: `Thank You, {{client_name}}!

It was an absolute pleasure being part of your {{event_name}} on {{event_date}}.

We hope your event was everything you dreamed of and more.

WE'D LOVE YOUR FEEDBACK!
Share your experience: {{feedback_link}}

View event photos: {{gallery_link}}

Whether it's your next celebration or a friend's special day, we're always here to create magic together!

With warm regards,
The {{company_name}} Team`
  },

  {
    name: "Callback Request Confirmation",
    templateKey: "callback_request_confirmation",
    type: "transactional",
    subject: "We'll Call You Back Shortly - {{company_name}}",
    variables: ["customer_name", "phone_number", "preferred_time", "request_id"],
    htmlContent: `
<!DOCTYPE html>
<html>
<head>${baseStyles}</head>
<body>
  <div class="email-container">
    ${emailHeader}
    <div class="content">
      <h2>Callback Request Received ✓</h2>
      <p>Dear {{customer_name}},</p>
      <p>Thank you for your interest in {{company_name}}. We've received your callback request and will be in touch shortly.</p>
      
      <div class="highlight-box">
        <h3>Your Request Details</h3>
        <table class="details-table" style="margin: 10px 0 0 0;">
          <tr><td>Reference ID</td><td><strong>#{{request_id}}</strong></td></tr>
          <tr><td>Phone Number</td><td>{{phone_number}}</td></tr>
          <tr><td>Preferred Time</td><td>{{preferred_time}}</td></tr>
        </table>
      </div>
      
      <p>Our team typically responds within <strong>2-4 business hours</strong>. If you need immediate assistance, feel free to call us directly at {{company_phone}}.</p>
      
      <div style="text-align: center; margin: 30px 0;">
        <a href="tel:{{company_phone}}" class="cta-button">Call Us Directly</a>
      </div>
    </div>
    ${emailFooter}
  </div>
</body>
</html>`,
    textContent: `Callback Request Received!

Dear {{customer_name}},

We've received your callback request and will be in touch shortly.

REQUEST DETAILS:
- Reference ID: #{{request_id}}
- Phone Number: {{phone_number}}
- Preferred Time: {{preferred_time}}

Our team typically responds within 2-4 business hours.

Need immediate help? Call us at {{company_phone}}.

Best regards,
{{company_name}}`
  },

  // ==========================================
  // ADMIN/STAFF INTERNAL NOTIFICATIONS
  // ==========================================
  {
    name: "New Lead Alert - Admin",
    templateKey: "new_lead_alert",
    type: "internal",
    subject: "🔔 New Lead: {{lead_name}} - {{event_type}}",
    variables: ["lead_name", "lead_email", "lead_phone", "event_type", "event_date", "guest_count", "budget_range", "lead_source", "lead_message", "lead_id", "admin_url"],
    htmlContent: `
<!DOCTYPE html>
<html>
<head>${baseStyles}</head>
<body>
  <div class="email-container">
    <div class="header" style="background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);">
      <h1 style="color: #ffffff; margin: 0;">🔔 New Lead Alert</h1>
    </div>
    <div class="content">
      <div class="highlight-box" style="background-color: #D1ECF1; border-left-color: #17a2b8;">
        <h3 style="color: #0C5460; margin: 0;">New Inquiry Received</h3>
        <p style="margin: 10px 0 0 0; color: #0C5460;">A new lead has submitted an inquiry through the website.</p>
      </div>
      
      <h3 style="color: #333;">Lead Information</h3>
      <table class="details-table">
        <tr><td>Name</td><td><strong>{{lead_name}}</strong></td></tr>
        <tr><td>Email</td><td><a href="mailto:{{lead_email}}">{{lead_email}}</a></td></tr>
        <tr><td>Phone</td><td><a href="tel:{{lead_phone}}">{{lead_phone}}</a></td></tr>
        <tr><td>Event Type</td><td><span class="badge badge-info">{{event_type}}</span></td></tr>
        <tr><td>Event Date</td><td>{{event_date}}</td></tr>
        <tr><td>Guest Count</td><td>{{guest_count}}</td></tr>
        <tr><td>Budget Range</td><td>{{budget_range}}</td></tr>
        <tr><td>Lead Source</td><td>{{lead_source}}</td></tr>
      </table>
      
      <div class="highlight-box">
        <h3>Message from Lead</h3>
        <p style="margin: 0; font-style: italic;">"{{lead_message}}"</p>
      </div>
      
      <div style="text-align: center; margin: 30px 0;">
        <a href="{{admin_url}}/admin/leads/{{lead_id}}" class="cta-button">View Lead Details</a>
        <br><br>
        <a href="tel:{{lead_phone}}" class="secondary-button">📞 Call Now</a>
        <a href="mailto:{{lead_email}}" class="secondary-button">✉️ Email</a>
      </div>
      
      <p style="color: #888888; font-size: 14px; text-align: center;">⏰ Quick response time increases conversion rates. Aim to respond within 1-2 hours.</p>
    </div>
    <div class="footer">
      <p>This is an automated notification from your CRM system.</p>
    </div>
  </div>
</body>
</html>`,
    textContent: `NEW LEAD ALERT

A new lead has submitted an inquiry.

LEAD INFORMATION:
- Name: {{lead_name}}
- Email: {{lead_email}}
- Phone: {{lead_phone}}
- Event Type: {{event_type}}
- Event Date: {{event_date}}
- Guest Count: {{guest_count}}
- Budget Range: {{budget_range}}
- Lead Source: {{lead_source}}

MESSAGE: "{{lead_message}}"

View lead: {{admin_url}}/admin/leads/{{lead_id}}

Quick response time increases conversion rates. Aim to respond within 1-2 hours.`
  },

  {
    name: "New Callback Request - Admin",
    templateKey: "new_callback_request_admin",
    type: "internal",
    subject: "📞 New Callback Request: {{customer_name}}",
    variables: ["customer_name", "customer_phone", "customer_email", "preferred_time", "notes", "request_id", "admin_url"],
    htmlContent: `
<!DOCTYPE html>
<html>
<head>${baseStyles}</head>
<body>
  <div class="email-container">
    <div class="header" style="background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);">
      <h1 style="color: #ffffff; margin: 0;">📞 Callback Request</h1>
    </div>
    <div class="content">
      <div class="highlight-box" style="background-color: #FFF3CD; border-left-color: #ffc107;">
        <h3 style="color: #856404; margin: 0;">⚡ Action Required</h3>
        <p style="margin: 10px 0 0 0; color: #856404;">A customer has requested a callback.</p>
      </div>
      
      <h3 style="color: #333;">Customer Details</h3>
      <table class="details-table">
        <tr><td>Name</td><td><strong>{{customer_name}}</strong></td></tr>
        <tr><td>Phone</td><td><a href="tel:{{customer_phone}}">{{customer_phone}}</a></td></tr>
        <tr><td>Email</td><td><a href="mailto:{{customer_email}}">{{customer_email}}</a></td></tr>
        <tr><td>Preferred Time</td><td><span class="badge badge-warning">{{preferred_time}}</span></td></tr>
        <tr><td>Request ID</td><td>#{{request_id}}</td></tr>
      </table>
      
      <div class="highlight-box">
        <h3>Notes</h3>
        <p style="margin: 0;">{{notes}}</p>
      </div>
      
      <div style="text-align: center; margin: 30px 0;">
        <a href="tel:{{customer_phone}}" class="cta-button">📞 Call Customer</a>
        <br><br>
        <a href="{{admin_url}}/admin/callbacks" class="secondary-button">View All Callbacks</a>
      </div>
    </div>
    <div class="footer">
      <p>This is an automated notification from your CRM system.</p>
    </div>
  </div>
</body>
</html>`,
    textContent: `CALLBACK REQUEST

A customer has requested a callback.

CUSTOMER DETAILS:
- Name: {{customer_name}}
- Phone: {{customer_phone}}
- Email: {{customer_email}}
- Preferred Time: {{preferred_time}}
- Request ID: #{{request_id}}

Notes: {{notes}}

View callbacks: {{admin_url}}/admin/callbacks`
  },

  {
    name: "Lead Assigned - Staff",
    templateKey: "lead_assigned_staff",
    type: "internal",
    subject: "📋 Lead Assigned to You: {{lead_name}}",
    variables: ["staff_name", "lead_name", "lead_email", "lead_phone", "event_type", "event_date", "budget_range", "assigned_by", "lead_id", "admin_url", "notes"],
    htmlContent: `
<!DOCTYPE html>
<html>
<head>${baseStyles}</head>
<body>
  <div class="email-container">
    <div class="header" style="background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);">
      <h1 style="color: #ffffff; margin: 0;">📋 Lead Assignment</h1>
    </div>
    <div class="content">
      <h2>Hello {{staff_name}},</h2>
      <p>A new lead has been assigned to you by {{assigned_by}}.</p>
      
      <div class="highlight-box">
        <h3>Lead Details</h3>
        <table class="details-table" style="margin: 10px 0 0 0;">
          <tr><td>Name</td><td><strong>{{lead_name}}</strong></td></tr>
          <tr><td>Email</td><td><a href="mailto:{{lead_email}}">{{lead_email}}</a></td></tr>
          <tr><td>Phone</td><td><a href="tel:{{lead_phone}}">{{lead_phone}}</a></td></tr>
          <tr><td>Event Type</td><td>{{event_type}}</td></tr>
          <tr><td>Event Date</td><td>{{event_date}}</td></tr>
          <tr><td>Budget Range</td><td>{{budget_range}}</td></tr>
        </table>
      </div>
      
      <div style="background-color: #f8f9fa; padding: 15px; border-radius: 8px; margin: 20px 0;">
        <p style="margin: 0;"><strong>Notes from {{assigned_by}}:</strong></p>
        <p style="margin: 10px 0 0 0;">{{notes}}</p>
      </div>
      
      <h3>Recommended Actions</h3>
      <ol>
        <li>Review the lead's requirements and history</li>
        <li>Contact the lead within 2-4 hours</li>
        <li>Schedule a consultation call or meeting</li>
        <li>Update the lead status in the CRM</li>
      </ol>
      
      <div style="text-align: center; margin: 30px 0;">
        <a href="{{admin_url}}/admin/leads/{{lead_id}}" class="cta-button">View Lead</a>
        <br><br>
        <a href="tel:{{lead_phone}}" class="secondary-button">📞 Call Lead</a>
      </div>
    </div>
    <div class="footer">
      <p>This is an automated notification from your CRM system.</p>
    </div>
  </div>
</body>
</html>`,
    textContent: `LEAD ASSIGNED TO YOU

Hello {{staff_name}},

A new lead has been assigned to you by {{assigned_by}}.

LEAD DETAILS:
- Name: {{lead_name}}
- Email: {{lead_email}}
- Phone: {{lead_phone}}
- Event Type: {{event_type}}
- Event Date: {{event_date}}
- Budget Range: {{budget_range}}

Notes: {{notes}}

RECOMMENDED ACTIONS:
1. Review the lead's requirements and history
2. Contact the lead within 2-4 hours
3. Schedule a consultation call or meeting
4. Update the lead status in the CRM

View lead: {{admin_url}}/admin/leads/{{lead_id}}`
  },

  {
    name: "Appointment Assigned - Staff",
    templateKey: "appointment_assigned_staff",
    type: "internal",
    subject: "📅 Appointment Assigned: {{appointment_title}} on {{appointment_date}}",
    variables: ["staff_name", "appointment_title", "appointment_date", "appointment_time", "appointment_type", "client_name", "client_phone", "client_email", "assigned_by", "notes", "admin_url"],
    htmlContent: `
<!DOCTYPE html>
<html>
<head>${baseStyles}</head>
<body>
  <div class="email-container">
    <div class="header" style="background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);">
      <h1 style="color: #ffffff; margin: 0;">📅 Appointment Assigned</h1>
    </div>
    <div class="content">
      <h2>Hello {{staff_name}},</h2>
      <p>An appointment has been assigned to you.</p>
      
      <div class="highlight-box">
        <h3>{{appointment_title}}</h3>
        <table class="details-table" style="margin: 10px 0 0 0;">
          <tr><td>📅 Date</td><td><strong>{{appointment_date}}</strong></td></tr>
          <tr><td>🕐 Time</td><td><strong>{{appointment_time}}</strong></td></tr>
          <tr><td>📍 Type</td><td>{{appointment_type}}</td></tr>
          <tr><td>Assigned By</td><td>{{assigned_by}}</td></tr>
        </table>
      </div>
      
      <h3 style="color: #333;">Client Information</h3>
      <table class="details-table">
        <tr><td>Name</td><td><strong>{{client_name}}</strong></td></tr>
        <tr><td>Phone</td><td><a href="tel:{{client_phone}}">{{client_phone}}</a></td></tr>
        <tr><td>Email</td><td><a href="mailto:{{client_email}}">{{client_email}}</a></td></tr>
      </table>
      
      <div style="background-color: #f8f9fa; padding: 15px; border-radius: 8px; margin: 20px 0;">
        <p style="margin: 0;"><strong>Notes:</strong></p>
        <p style="margin: 10px 0 0 0;">{{notes}}</p>
      </div>
      
      <div style="text-align: center; margin: 30px 0;">
        <a href="{{admin_url}}/admin/calendar" class="cta-button">View Calendar</a>
        <br><br>
        <a href="#" class="secondary-button">Add to Calendar</a>
      </div>
    </div>
    <div class="footer">
      <p>This is an automated notification from your CRM system.</p>
    </div>
  </div>
</body>
</html>`,
    textContent: `APPOINTMENT ASSIGNED

Hello {{staff_name}},

An appointment has been assigned to you.

APPOINTMENT DETAILS:
- Title: {{appointment_title}}
- Date: {{appointment_date}}
- Time: {{appointment_time}}
- Type: {{appointment_type}}
- Assigned By: {{assigned_by}}

CLIENT INFORMATION:
- Name: {{client_name}}
- Phone: {{client_phone}}
- Email: {{client_email}}

Notes: {{notes}}

View calendar: {{admin_url}}/admin/calendar`
  },

  {
    name: "Event Assigned - Staff",
    templateKey: "event_assigned_staff",
    type: "internal",
    subject: "🎉 Event Assigned: {{event_name}} - {{event_date}}",
    variables: ["staff_name", "event_name", "event_type", "event_date", "event_venue", "client_name", "client_phone", "guest_count", "contract_amount", "assigned_by", "admin_url", "event_id"],
    htmlContent: `
<!DOCTYPE html>
<html>
<head>${baseStyles}</head>
<body>
  <div class="email-container">
    <div class="header" style="background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);">
      <h1 style="color: #ffffff; margin: 0;">🎉 Event Assignment</h1>
    </div>
    <div class="content">
      <h2>Hello {{staff_name}},</h2>
      <p>You've been assigned as the manager for an upcoming event.</p>
      
      <div class="highlight-box" style="background-color: #D4EDDA; border-left-color: #28a745;">
        <h3 style="color: #28a745;">{{event_name}}</h3>
        <p style="margin: 5px 0; color: #155724;">You're now responsible for this event's success!</p>
      </div>
      
      <h3 style="color: #333;">Event Details</h3>
      <table class="details-table">
        <tr><td>Event Type</td><td><span class="badge badge-info">{{event_type}}</span></td></tr>
        <tr><td>Date</td><td><strong>{{event_date}}</strong></td></tr>
        <tr><td>Venue</td><td>{{event_venue}}</td></tr>
        <tr><td>Guest Count</td><td>{{guest_count}}</td></tr>
        <tr><td>Contract Value</td><td class="amount" style="font-size: 18px;">₹{{contract_amount}}</td></tr>
      </table>
      
      <h3 style="color: #333;">Client Details</h3>
      <table class="details-table">
        <tr><td>Name</td><td><strong>{{client_name}}</strong></td></tr>
        <tr><td>Phone</td><td><a href="tel:{{client_phone}}">{{client_phone}}</a></td></tr>
      </table>
      
      <p style="color: #888888;">Assigned by: {{assigned_by}}</p>
      
      <h3>Your Responsibilities</h3>
      <ul>
        <li>Coordinate with all vendors and suppliers</li>
        <li>Maintain regular communication with the client</li>
        <li>Create and manage the event timeline</li>
        <li>Ensure budget adherence</li>
        <li>Oversee event execution on the day</li>
      </ul>
      
      <div style="text-align: center; margin: 30px 0;">
        <a href="{{admin_url}}/admin/events/{{event_id}}" class="cta-button">View Event Details</a>
      </div>
    </div>
    <div class="footer">
      <p>This is an automated notification from your CRM system.</p>
    </div>
  </div>
</body>
</html>`,
    textContent: `EVENT ASSIGNED TO YOU

Hello {{staff_name}},

You've been assigned as the manager for an upcoming event.

EVENT: {{event_name}}

EVENT DETAILS:
- Event Type: {{event_type}}
- Date: {{event_date}}
- Venue: {{event_venue}}
- Guest Count: {{guest_count}}
- Contract Value: ₹{{contract_amount}}

CLIENT:
- Name: {{client_name}}
- Phone: {{client_phone}}

Assigned by: {{assigned_by}}

View event: {{admin_url}}/admin/events/{{event_id}}`
  },

  {
    name: "Payment Received - Admin",
    templateKey: "payment_received_admin",
    type: "internal",
    subject: "💰 Payment Received: ₹{{payment_amount}} from {{client_name}}",
    variables: ["client_name", "payment_amount", "payment_method", "invoice_number", "event_name", "remaining_balance", "payment_date", "admin_url"],
    htmlContent: `
<!DOCTYPE html>
<html>
<head>${baseStyles}</head>
<body>
  <div class="email-container">
    <div class="header" style="background: linear-gradient(135deg, #28a745 0%, #20c997 100%);">
      <h1 style="color: #ffffff; margin: 0;">💰 Payment Received</h1>
    </div>
    <div class="content">
      <div style="background-color: #D4EDDA; padding: 30px; border-radius: 8px; text-align: center; margin: 0 0 25px 0;">
        <p style="margin: 0; color: #155724; font-size: 14px;">Payment Confirmed</p>
        <p class="amount" style="margin: 10px 0; color: #28a745;">₹{{payment_amount}}</p>
        <p style="margin: 0; color: #155724;">from {{client_name}}</p>
      </div>
      
      <h3 style="color: #333;">Payment Details</h3>
      <table class="details-table">
        <tr><td>Client</td><td><strong>{{client_name}}</strong></td></tr>
        <tr><td>Amount</td><td>₹{{payment_amount}}</td></tr>
        <tr><td>Method</td><td>{{payment_method}}</td></tr>
        <tr><td>Date</td><td>{{payment_date}}</td></tr>
        <tr><td>Invoice</td><td>#{{invoice_number}}</td></tr>
        <tr><td>Event</td><td>{{event_name}}</td></tr>
        <tr><td>Remaining Balance</td><td>₹{{remaining_balance}}</td></tr>
      </table>
      
      <div style="text-align: center; margin: 30px 0;">
        <a href="{{admin_url}}/admin/invoices" class="cta-button">View Invoices</a>
      </div>
    </div>
    <div class="footer">
      <p>This is an automated notification from your CRM system.</p>
    </div>
  </div>
</body>
</html>`,
    textContent: `PAYMENT RECEIVED

₹{{payment_amount}} from {{client_name}}

PAYMENT DETAILS:
- Client: {{client_name}}
- Amount: ₹{{payment_amount}}
- Method: {{payment_method}}
- Date: {{payment_date}}
- Invoice: #{{invoice_number}}
- Event: {{event_name}}
- Remaining Balance: ₹{{remaining_balance}}

View invoices: {{admin_url}}/admin/invoices`
  },

  {
    name: "Daily Digest - Admin",
    templateKey: "daily_digest_admin",
    type: "internal",
    subject: "📊 Daily Summary - {{current_date}}",
    variables: ["admin_name", "new_leads_count", "appointments_today", "events_this_week", "pending_callbacks", "pending_invoices_amount", "leads_list", "appointments_list", "admin_url"],
    htmlContent: `
<!DOCTYPE html>
<html>
<head>${baseStyles}</head>
<body>
  <div class="email-container">
    <div class="header" style="background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);">
      <h1 style="color: #ffffff; margin: 0;">📊 Daily Summary</h1>
      <p style="color: #cccccc; margin: 10px 0 0 0;">{{current_date}}</p>
    </div>
    <div class="content">
      <h2>Good morning, {{admin_name}}!</h2>
      <p>Here's your business overview for today:</p>
      
      <div style="display: flex; flex-wrap: wrap; gap: 15px; margin: 25px 0;">
        <div style="flex: 1; min-width: 120px; background-color: #D1ECF1; padding: 20px; border-radius: 8px; text-align: center;">
          <p style="margin: 0; font-size: 28px; font-weight: 700; color: #0C5460;">{{new_leads_count}}</p>
          <p style="margin: 5px 0 0 0; color: #0C5460; font-size: 12px;">New Leads</p>
        </div>
        <div style="flex: 1; min-width: 120px; background-color: #D4EDDA; padding: 20px; border-radius: 8px; text-align: center;">
          <p style="margin: 0; font-size: 28px; font-weight: 700; color: #155724;">{{appointments_today}}</p>
          <p style="margin: 5px 0 0 0; color: #155724; font-size: 12px;">Appointments Today</p>
        </div>
        <div style="flex: 1; min-width: 120px; background-color: #FFF3CD; padding: 20px; border-radius: 8px; text-align: center;">
          <p style="margin: 0; font-size: 28px; font-weight: 700; color: #856404;">{{events_this_week}}</p>
          <p style="margin: 5px 0 0 0; color: #856404; font-size: 12px;">Events This Week</p>
        </div>
        <div style="flex: 1; min-width: 120px; background-color: #F8D7DA; padding: 20px; border-radius: 8px; text-align: center;">
          <p style="margin: 0; font-size: 28px; font-weight: 700; color: #721C24;">{{pending_callbacks}}</p>
          <p style="margin: 5px 0 0 0; color: #721C24; font-size: 12px;">Pending Callbacks</p>
        </div>
      </div>
      
      <div class="highlight-box">
        <h3>💰 Pending Invoices</h3>
        <p class="amount" style="margin: 0;">₹{{pending_invoices_amount}}</p>
      </div>
      
      <div class="divider"></div>
      
      <h3 style="color: #333;">Today's Appointments</h3>
      {{appointments_list}}
      
      <div class="divider"></div>
      
      <h3 style="color: #333;">New Leads (Last 24h)</h3>
      {{leads_list}}
      
      <div style="text-align: center; margin: 30px 0;">
        <a href="{{admin_url}}/admin/dashboard" class="cta-button">Open Dashboard</a>
      </div>
    </div>
    <div class="footer">
      <p>This is your daily automated summary from the CRM system.</p>
    </div>
  </div>
</body>
</html>`,
    textContent: `DAILY SUMMARY - {{current_date}}

Good morning, {{admin_name}}!

TODAY'S OVERVIEW:
- New Leads: {{new_leads_count}}
- Appointments Today: {{appointments_today}}
- Events This Week: {{events_this_week}}
- Pending Callbacks: {{pending_callbacks}}
- Pending Invoices: ₹{{pending_invoices_amount}}

Open dashboard: {{admin_url}}/admin/dashboard`
  },

  {
    name: "Weekly Report - Admin",
    templateKey: "weekly_report_admin",
    type: "internal",
    subject: "📈 Weekly Business Report - Week of {{week_start_date}}",
    variables: ["admin_name", "week_start_date", "week_end_date", "total_leads", "converted_leads", "conversion_rate", "total_revenue", "events_completed", "new_clients", "top_lead_sources", "upcoming_events", "admin_url"],
    htmlContent: `
<!DOCTYPE html>
<html>
<head>${baseStyles}</head>
<body>
  <div class="email-container">
    <div class="header" style="background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);">
      <h1 style="color: #ffffff; margin: 0;">📈 Weekly Business Report</h1>
      <p style="color: #cccccc; margin: 10px 0 0 0;">{{week_start_date}} - {{week_end_date}}</p>
    </div>
    <div class="content">
      <h2>Hello {{admin_name}},</h2>
      <p>Here's your weekly business performance summary:</p>
      
      <h3 style="color: #722F37;">Lead Performance</h3>
      <div style="display: flex; flex-wrap: wrap; gap: 15px; margin: 20px 0;">
        <div style="flex: 1; min-width: 150px; background-color: #FDF8F3; padding: 20px; border-radius: 8px; text-align: center;">
          <p style="margin: 0; font-size: 32px; font-weight: 700; color: #722F37;">{{total_leads}}</p>
          <p style="margin: 5px 0 0 0; color: #666666;">Total Leads</p>
        </div>
        <div style="flex: 1; min-width: 150px; background-color: #D4EDDA; padding: 20px; border-radius: 8px; text-align: center;">
          <p style="margin: 0; font-size: 32px; font-weight: 700; color: #28a745;">{{converted_leads}}</p>
          <p style="margin: 5px 0 0 0; color: #666666;">Converted</p>
        </div>
        <div style="flex: 1; min-width: 150px; background-color: #D1ECF1; padding: 20px; border-radius: 8px; text-align: center;">
          <p style="margin: 0; font-size: 32px; font-weight: 700; color: #0C5460;">{{conversion_rate}}%</p>
          <p style="margin: 5px 0 0 0; color: #666666;">Conversion Rate</p>
        </div>
      </div>
      
      <div class="highlight-box">
        <h3>💰 Weekly Revenue</h3>
        <p class="amount" style="margin: 0;">₹{{total_revenue}}</p>
      </div>
      
      <div class="divider"></div>
      
      <h3 style="color: #333;">Key Metrics</h3>
      <table class="details-table">
        <tr><td>Events Completed</td><td><strong>{{events_completed}}</strong></td></tr>
        <tr><td>New Clients</td><td><strong>{{new_clients}}</strong></td></tr>
      </table>
      
      <h3 style="color: #333;">Top Lead Sources</h3>
      {{top_lead_sources}}
      
      <div class="divider"></div>
      
      <h3 style="color: #333;">Upcoming Events</h3>
      {{upcoming_events}}
      
      <div style="text-align: center; margin: 30px 0;">
        <a href="{{admin_url}}/admin/reports" class="cta-button">View Detailed Reports</a>
      </div>
    </div>
    <div class="footer">
      <p>This is your automated weekly summary from the CRM system.</p>
    </div>
  </div>
</body>
</html>`,
    textContent: `WEEKLY BUSINESS REPORT
{{week_start_date}} - {{week_end_date}}

Hello {{admin_name}},

LEAD PERFORMANCE:
- Total Leads: {{total_leads}}
- Converted: {{converted_leads}}
- Conversion Rate: {{conversion_rate}}%

WEEKLY REVENUE: ₹{{total_revenue}}

KEY METRICS:
- Events Completed: {{events_completed}}
- New Clients: {{new_clients}}

View reports: {{admin_url}}/admin/reports`
  },

  {
    name: "Lead Status Changed",
    templateKey: "lead_status_changed",
    type: "internal",
    subject: "Lead Status Update: {{lead_name}} → {{new_status}}",
    variables: ["staff_name", "lead_name", "old_status", "new_status", "changed_by", "change_notes", "lead_id", "admin_url"],
    htmlContent: `
<!DOCTYPE html>
<html>
<head>${baseStyles}</head>
<body>
  <div class="email-container">
    <div class="header" style="background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);">
      <h1 style="color: #ffffff; margin: 0;">Lead Status Update</h1>
    </div>
    <div class="content">
      <p>Hello {{staff_name}},</p>
      <p>A lead assigned to you has been updated.</p>
      
      <div class="highlight-box">
        <h3>{{lead_name}}</h3>
        <div style="margin: 15px 0;">
          <span class="badge badge-warning">{{old_status}}</span>
          <span style="margin: 0 10px;">→</span>
          <span class="badge badge-success">{{new_status}}</span>
        </div>
        <p style="margin: 0; color: #666666; font-size: 13px;">Changed by: {{changed_by}}</p>
      </div>
      
      <div style="background-color: #f8f9fa; padding: 15px; border-radius: 8px; margin: 20px 0;">
        <p style="margin: 0;"><strong>Notes:</strong></p>
        <p style="margin: 10px 0 0 0;">{{change_notes}}</p>
      </div>
      
      <div style="text-align: center; margin: 30px 0;">
        <a href="{{admin_url}}/admin/leads/{{lead_id}}" class="cta-button">View Lead</a>
      </div>
    </div>
    <div class="footer">
      <p>This is an automated notification from your CRM system.</p>
    </div>
  </div>
</body>
</html>`,
    textContent: `LEAD STATUS UPDATE

Hello {{staff_name}},

A lead assigned to you has been updated.

Lead: {{lead_name}}
Status: {{old_status}} → {{new_status}}
Changed by: {{changed_by}}

Notes: {{change_notes}}

View lead: {{admin_url}}/admin/leads/{{lead_id}}`
  },

  {
    name: "Appointment Reminder - Staff",
    templateKey: "appointment_reminder_staff",
    type: "reminder",
    subject: "⏰ Reminder: Appointment with {{client_name}} in 1 hour",
    variables: ["staff_name", "client_name", "client_phone", "appointment_title", "appointment_time", "appointment_type", "appointment_location"],
    htmlContent: `
<!DOCTYPE html>
<html>
<head>${baseStyles}</head>
<body>
  <div class="email-container">
    <div class="header" style="background: linear-gradient(135deg, #ffc107 0%, #fd7e14 100%);">
      <h1 style="color: #333333; margin: 0;">⏰ Appointment Reminder</h1>
    </div>
    <div class="content">
      <h2>{{staff_name}}, you have an appointment coming up!</h2>
      
      <div class="highlight-box" style="background-color: #FFF3CD; border-left-color: #ffc107;">
        <h3 style="margin: 0;">{{appointment_title}}</h3>
        <p style="margin: 10px 0 0 0;"><strong>Starting in approximately 1 hour</strong></p>
      </div>
      
      <table class="details-table">
        <tr><td>🕐 Time</td><td><strong>{{appointment_time}}</strong></td></tr>
        <tr><td>📍 Type</td><td>{{appointment_type}}</td></tr>
        <tr><td>📌 Location</td><td>{{appointment_location}}</td></tr>
        <tr><td>👤 Client</td><td>{{client_name}}</td></tr>
        <tr><td>📞 Phone</td><td><a href="tel:{{client_phone}}">{{client_phone}}</a></td></tr>
      </table>
      
      <div style="text-align: center; margin: 30px 0;">
        <a href="tel:{{client_phone}}" class="cta-button">📞 Call Client</a>
      </div>
    </div>
    <div class="footer">
      <p>This is an automated reminder from your CRM system.</p>
    </div>
  </div>
</body>
</html>`,
    textContent: `APPOINTMENT REMINDER

{{staff_name}}, you have an appointment coming up!

{{appointment_title}}
Starting in approximately 1 hour

DETAILS:
- Time: {{appointment_time}}
- Type: {{appointment_type}}
- Location: {{appointment_location}}
- Client: {{client_name}}
- Phone: {{client_phone}}`
  },

  {
    name: "Event Tomorrow Reminder - Staff",
    templateKey: "event_tomorrow_reminder_staff",
    type: "reminder",
    subject: "🎉 Tomorrow: {{event_name}} - Final Checklist",
    variables: ["staff_name", "event_name", "event_date", "event_time", "event_venue", "client_name", "client_phone", "vendor_count", "checklist_items"],
    htmlContent: `
<!DOCTYPE html>
<html>
<head>${baseStyles}</head>
<body>
  <div class="email-container">
    <div class="header" style="background: linear-gradient(135deg, #722F37 0%, #8B4513 100%);">
      <h1 style="color: #ffffff; margin: 0;">🎉 Event Tomorrow!</h1>
    </div>
    <div class="content">
      <h2>Hi {{staff_name}},</h2>
      <p>This is your reminder that <strong>{{event_name}}</strong> is scheduled for tomorrow!</p>
      
      <div class="highlight-box">
        <h3>Event Details</h3>
        <table class="details-table" style="margin: 10px 0 0 0;">
          <tr><td>📅 Date</td><td><strong>{{event_date}}</strong></td></tr>
          <tr><td>🕐 Time</td><td><strong>{{event_time}}</strong></td></tr>
          <tr><td>📍 Venue</td><td>{{event_venue}}</td></tr>
          <tr><td>👤 Client</td><td>{{client_name}}</td></tr>
          <tr><td>📞 Phone</td><td><a href="tel:{{client_phone}}">{{client_phone}}</a></td></tr>
          <tr><td>🏢 Vendors</td><td>{{vendor_count}} vendors confirmed</td></tr>
        </table>
      </div>
      
      <h3 style="color: #722F37;">Final Checklist</h3>
      {{checklist_items}}
      
      <div style="background-color: #FFF3CD; padding: 20px; border-radius: 8px; margin: 25px 0;">
        <p style="margin: 0;"><strong>⚠️ Remember:</strong></p>
        <ul style="margin: 10px 0 0 0; padding-left: 20px;">
          <li>Confirm all vendor arrival times</li>
          <li>Double-check venue access arrangements</li>
          <li>Have backup contacts ready</li>
          <li>Arrive at least 2 hours early</li>
        </ul>
      </div>
      
      <div style="text-align: center; margin: 30px 0;">
        <a href="tel:{{client_phone}}" class="cta-button">Contact Client</a>
      </div>
      
      <p style="text-align: center; color: #888888;">Good luck! You've got this! 💪</p>
    </div>
    <div class="footer">
      <p>This is an automated reminder from your CRM system.</p>
    </div>
  </div>
</body>
</html>`,
    textContent: `EVENT TOMORROW!

Hi {{staff_name}},

{{event_name}} is scheduled for tomorrow!

EVENT DETAILS:
- Date: {{event_date}}
- Time: {{event_time}}
- Venue: {{event_venue}}
- Client: {{client_name}}
- Phone: {{client_phone}}
- Vendors: {{vendor_count}} confirmed

REMEMBER:
- Confirm all vendor arrival times
- Double-check venue access arrangements
- Have backup contacts ready
- Arrive at least 2 hours early

Good luck! You've got this!`
  },

  {
    name: "Password Reset",
    templateKey: "password_reset",
    type: "transactional",
    subject: "Reset Your Password - {{company_name}}",
    variables: ["user_name", "reset_link", "expiry_time"],
    htmlContent: `
<!DOCTYPE html>
<html>
<head>${baseStyles}</head>
<body>
  <div class="email-container">
    ${emailHeader}
    <div class="content">
      <h2>Password Reset Request</h2>
      <p>Hello {{user_name}},</p>
      <p>We received a request to reset your password. Click the button below to create a new password:</p>
      
      <div style="text-align: center; margin: 30px 0;">
        <a href="{{reset_link}}" class="cta-button">Reset Password</a>
      </div>
      
      <div class="highlight-box" style="background-color: #FFF3CD; border-left-color: #ffc107;">
        <p style="margin: 0; color: #856404;">⚠️ This link will expire in {{expiry_time}}.</p>
      </div>
      
      <p>If you didn't request a password reset, please ignore this email. Your password will remain unchanged.</p>
      
      <div class="divider"></div>
      
      <p style="color: #888888; font-size: 14px;">For security reasons, this link can only be used once. If you need to reset your password again, please visit the login page and request a new reset link.</p>
    </div>
    ${emailFooter}
  </div>
</body>
</html>`,
    textContent: `Password Reset Request

Hello {{user_name}},

We received a request to reset your password.

Reset your password: {{reset_link}}

This link will expire in {{expiry_time}}.

If you didn't request a password reset, please ignore this email.

Best regards,
{{company_name}}`
  },

  {
    name: "New Team Member Welcome",
    templateKey: "new_team_member_welcome",
    type: "internal",
    subject: "Welcome to the Team! - {{company_name}}",
    variables: ["employee_name", "role", "manager_name", "start_date", "login_link", "temp_password"],
    htmlContent: `
<!DOCTYPE html>
<html>
<head>${baseStyles}</head>
<body>
  <div class="email-container">
    ${emailHeader}
    <div class="content">
      <h2>Welcome to the Team, {{employee_name}}! 🎉</h2>
      <p>We're thrilled to have you join {{company_name}}. Your expertise and enthusiasm will be a valuable addition to our team.</p>
      
      <div class="highlight-box">
        <h3>Your Details</h3>
        <table class="details-table" style="margin: 10px 0 0 0;">
          <tr><td>Role</td><td><strong>{{role}}</strong></td></tr>
          <tr><td>Reports To</td><td>{{manager_name}}</td></tr>
          <tr><td>Start Date</td><td>{{start_date}}</td></tr>
        </table>
      </div>
      
      <h3 style="color: #722F37;">Getting Started</h3>
      <ol>
        <li>Access your account using the link below</li>
        <li>Change your temporary password immediately</li>
        <li>Complete your profile setup</li>
        <li>Review the team handbook and guidelines</li>
        <li>Connect with your team members</li>
      </ol>
      
      <div style="background-color: #FDF8F3; padding: 20px; border-radius: 8px; margin: 25px 0;">
        <p style="margin: 0;"><strong>Your Login Credentials:</strong></p>
        <p style="margin: 10px 0 5px 0;">Temporary Password: <code style="background-color: #f0f0f0; padding: 3px 8px; border-radius: 4px;">{{temp_password}}</code></p>
        <p style="margin: 0; color: #dc3545; font-size: 13px;">⚠️ Please change this password immediately upon first login.</p>
      </div>
      
      <div style="text-align: center; margin: 30px 0;">
        <a href="{{login_link}}" class="cta-button">Access Your Account</a>
      </div>
      
      <p>If you have any questions, don't hesitate to reach out to {{manager_name}} or the HR team.</p>
      
      <p style="margin-top: 30px;">Looking forward to working with you!</p>
    </div>
    ${emailFooter}
  </div>
</body>
</html>`,
    textContent: `Welcome to the Team, {{employee_name}}!

We're thrilled to have you join {{company_name}}.

YOUR DETAILS:
- Role: {{role}}
- Reports To: {{manager_name}}
- Start Date: {{start_date}}

GETTING STARTED:
1. Access your account using the link below
2. Change your temporary password immediately
3. Complete your profile setup
4. Review the team handbook and guidelines

Temporary Password: {{temp_password}}
(Please change this immediately)

Login: {{login_link}}

Welcome aboard!
{{company_name}}`
  },

  {
    name: "Quote Request Received",
    templateKey: "quote_request_received",
    type: "transactional",
    subject: "Your Quote Request Has Been Received - {{company_name}}",
    variables: ["client_name", "event_type", "event_date", "guest_count", "budget_range", "request_id"],
    htmlContent: `
<!DOCTYPE html>
<html>
<head>${baseStyles}</head>
<body>
  <div class="email-container">
    ${emailHeader}
    <div class="content">
      <h2>Quote Request Received ✓</h2>
      <p>Dear {{client_name}},</p>
      <p>Thank you for your interest in {{company_name}}! We've received your quote request and our team is already working on a customized proposal for you.</p>
      
      <div class="highlight-box">
        <h3>Your Request Details</h3>
        <table class="details-table" style="margin: 10px 0 0 0;">
          <tr><td>Reference ID</td><td><strong>#{{request_id}}</strong></td></tr>
          <tr><td>Event Type</td><td>{{event_type}}</td></tr>
          <tr><td>Event Date</td><td>{{event_date}}</td></tr>
          <tr><td>Guest Count</td><td>{{guest_count}}</td></tr>
          <tr><td>Budget Range</td><td>{{budget_range}}</td></tr>
        </table>
      </div>
      
      <p><strong>What happens next?</strong></p>
      <ul>
        <li>Our team will review your requirements within 24-48 hours</li>
        <li>We'll prepare a detailed, customized quote</li>
        <li>A dedicated consultant will reach out to discuss the proposal</li>
      </ul>
      
      <div style="text-align: center; margin: 30px 0;">
        <a href="{{company_website}}/portfolio" class="cta-button">Explore Our Work</a>
      </div>
      
      <p style="color: #888888; font-size: 14px;">Have questions? Call us at {{company_phone}} or reply to this email.</p>
    </div>
    ${emailFooter}
  </div>
</body>
</html>`,
    textContent: `Quote Request Received

Dear {{client_name}},

Thank you for your interest in {{company_name}}! We've received your quote request.

REQUEST DETAILS:
- Reference ID: #{{request_id}}
- Event Type: {{event_type}}
- Event Date: {{event_date}}
- Guest Count: {{guest_count}}
- Budget Range: {{budget_range}}

WHAT HAPPENS NEXT:
- Our team will review your requirements within 24-48 hours
- We'll prepare a detailed, customized quote
- A dedicated consultant will reach out to discuss the proposal

Questions? Call {{company_phone}}.

Best regards,
{{company_name}}`
  },

  {
    name: "Vendor Assignment",
    templateKey: "vendor_assignment",
    type: "internal",
    subject: "Vendor Assignment: {{vendor_name}} for {{event_name}}",
    variables: ["staff_name", "vendor_name", "vendor_category", "vendor_phone", "vendor_email", "event_name", "event_date", "event_venue", "admin_url"],
    htmlContent: `
<!DOCTYPE html>
<html>
<head>${baseStyles}</head>
<body>
  <div class="email-container">
    <div class="header" style="background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);">
      <h1 style="color: #ffffff; margin: 0;">Vendor Assignment</h1>
    </div>
    <div class="content">
      <p>Hello {{staff_name}},</p>
      <p>A vendor has been assigned to an event you're managing.</p>
      
      <div class="highlight-box">
        <h3>Vendor Details</h3>
        <table class="details-table" style="margin: 10px 0 0 0;">
          <tr><td>Name</td><td><strong>{{vendor_name}}</strong></td></tr>
          <tr><td>Category</td><td><span class="badge badge-info">{{vendor_category}}</span></td></tr>
          <tr><td>Phone</td><td><a href="tel:{{vendor_phone}}">{{vendor_phone}}</a></td></tr>
          <tr><td>Email</td><td><a href="mailto:{{vendor_email}}">{{vendor_email}}</a></td></tr>
        </table>
      </div>
      
      <h3 style="color: #333;">Event Information</h3>
      <table class="details-table">
        <tr><td>Event</td><td><strong>{{event_name}}</strong></td></tr>
        <tr><td>Date</td><td>{{event_date}}</td></tr>
        <tr><td>Venue</td><td>{{event_venue}}</td></tr>
      </table>
      
      <p><strong>Next Steps:</strong></p>
      <ul>
        <li>Contact the vendor to confirm availability</li>
        <li>Share event requirements and timeline</li>
        <li>Coordinate logistics and delivery schedules</li>
        <li>Update the event details in CRM</li>
      </ul>
      
      <div style="text-align: center; margin: 30px 0;">
        <a href="tel:{{vendor_phone}}" class="cta-button">Contact Vendor</a>
        <br><br>
        <a href="{{admin_url}}/admin/vendors" class="secondary-button">View All Vendors</a>
      </div>
    </div>
    <div class="footer">
      <p>This is an automated notification from your CRM system.</p>
    </div>
  </div>
</body>
</html>`,
    textContent: `VENDOR ASSIGNMENT

Hello {{staff_name}},

A vendor has been assigned to an event you're managing.

VENDOR DETAILS:
- Name: {{vendor_name}}
- Category: {{vendor_category}}
- Phone: {{vendor_phone}}
- Email: {{vendor_email}}

EVENT INFORMATION:
- Event: {{event_name}}
- Date: {{event_date}}
- Venue: {{event_venue}}

NEXT STEPS:
- Contact the vendor to confirm availability
- Share event requirements and timeline
- Coordinate logistics and delivery schedules
- Update the event details in CRM`
  },

  {
    name: "Client Converted",
    templateKey: "client_converted",
    type: "internal",
    subject: "🎉 Lead Converted: {{client_name}} is now a client!",
    variables: ["staff_name", "client_name", "event_type", "contract_value", "converted_by", "admin_url"],
    htmlContent: `
<!DOCTYPE html>
<html>
<head>${baseStyles}</head>
<body>
  <div class="email-container">
    <div class="header" style="background: linear-gradient(135deg, #28a745 0%, #20c997 100%);">
      <h1 style="color: #ffffff; margin: 0;">🎉 New Client!</h1>
    </div>
    <div class="content">
      <h2>Congratulations, {{staff_name}}!</h2>
      <p>Great news! A lead has been successfully converted to a client.</p>
      
      <div class="highlight-box" style="background-color: #D4EDDA; border-left-color: #28a745;">
        <h3 style="color: #28a745; margin: 0;">{{client_name}} is now a client!</h3>
      </div>
      
      <table class="details-table">
        <tr><td>Client Name</td><td><strong>{{client_name}}</strong></td></tr>
        <tr><td>Event Type</td><td>{{event_type}}</td></tr>
        <tr><td>Contract Value</td><td class="amount" style="font-size: 20px;">₹{{contract_value}}</td></tr>
        <tr><td>Converted By</td><td>{{converted_by}}</td></tr>
      </table>
      
      <div style="text-align: center; margin: 30px 0;">
        <a href="{{admin_url}}/admin/clients" class="cta-button">View Client Profile</a>
      </div>
      
      <p style="text-align: center; font-size: 14px; color: #666666;">Keep up the excellent work! Every conversion counts. 🌟</p>
    </div>
    <div class="footer">
      <p>This is an automated notification from your CRM system.</p>
    </div>
  </div>
</body>
</html>`,
    textContent: `NEW CLIENT!

Congratulations, {{staff_name}}!

{{client_name}} is now a client!

DETAILS:
- Client Name: {{client_name}}
- Event Type: {{event_type}}
- Contract Value: ₹{{contract_value}}
- Converted By: {{converted_by}}

Keep up the excellent work!`
  },

  {
    name: "Invoice Overdue Alert",
    templateKey: "invoice_overdue_alert",
    type: "internal",
    subject: "⚠️ Invoice Overdue: #{{invoice_number}} - {{client_name}}",
    variables: ["admin_name", "invoice_number", "client_name", "client_email", "client_phone", "amount_due", "due_date", "days_overdue", "event_name", "admin_url"],
    htmlContent: `
<!DOCTYPE html>
<html>
<head>${baseStyles}</head>
<body>
  <div class="email-container">
    <div class="header" style="background: linear-gradient(135deg, #dc3545 0%, #c82333 100%);">
      <h1 style="color: #ffffff; margin: 0;">⚠️ Invoice Overdue</h1>
    </div>
    <div class="content">
      <p>Hello {{admin_name}},</p>
      <p>An invoice has become overdue and requires attention.</p>
      
      <div class="highlight-box" style="background-color: #F8D7DA; border-left-color: #dc3545;">
        <h3 style="color: #721C24; margin: 0;">Invoice #{{invoice_number}}</h3>
        <p style="margin: 10px 0 0 0; color: #721C24;"><strong>{{days_overdue}} days overdue</strong></p>
      </div>
      
      <div style="background-color: #FDF8F3; padding: 30px; border-radius: 8px; text-align: center; margin: 25px 0;">
        <p style="margin: 0; color: #888888; font-size: 14px;">Outstanding Amount</p>
        <p class="amount" style="margin: 10px 0; color: #dc3545;">₹{{amount_due}}</p>
        <p style="margin: 0; color: #888888; font-size: 14px;">Due: {{due_date}}</p>
      </div>
      
      <h3 style="color: #333;">Client Information</h3>
      <table class="details-table">
        <tr><td>Client</td><td><strong>{{client_name}}</strong></td></tr>
        <tr><td>Email</td><td><a href="mailto:{{client_email}}">{{client_email}}</a></td></tr>
        <tr><td>Phone</td><td><a href="tel:{{client_phone}}">{{client_phone}}</a></td></tr>
        <tr><td>Event</td><td>{{event_name}}</td></tr>
      </table>
      
      <p><strong>Recommended Actions:</strong></p>
      <ul>
        <li>Send a payment reminder email</li>
        <li>Call the client to follow up</li>
        <li>Review payment terms if necessary</li>
        <li>Update invoice status after contact</li>
      </ul>
      
      <div style="text-align: center; margin: 30px 0;">
        <a href="tel:{{client_phone}}" class="cta-button">Call Client</a>
        <br><br>
        <a href="{{admin_url}}/admin/invoices" class="secondary-button">View All Invoices</a>
      </div>
    </div>
    <div class="footer">
      <p>This is an automated notification from your CRM system.</p>
    </div>
  </div>
</body>
</html>`,
    textContent: `INVOICE OVERDUE ALERT

Invoice #{{invoice_number}} is {{days_overdue}} days overdue.

AMOUNT DUE: ₹{{amount_due}}
DUE DATE: {{due_date}}

CLIENT INFORMATION:
- Name: {{client_name}}
- Email: {{client_email}}
- Phone: {{client_phone}}
- Event: {{event_name}}

RECOMMENDED ACTIONS:
- Send a payment reminder email
- Call the client to follow up
- Review payment terms if necessary
- Update invoice status after contact`
  }
];

async function seedEmailTemplates() {
  console.log("🚀 Seeding email templates...\n");
  
  try {
    for (const template of templates) {
      const existingTemplate = await db
        .select()
        .from(emailTemplates)
        .where(eq(emailTemplates.templateKey, template.templateKey))
        .limit(1);
      
      if (existingTemplate.length > 0) {
        console.log(`⏭️  Template "${template.name}" already exists, updating...`);
        await db
          .update(emailTemplates)
          .set({
            name: template.name,
            type: template.type,
            subject: template.subject,
            htmlContent: template.htmlContent,
            textContent: template.textContent,
            variables: template.variables,
            updatedAt: new Date(),
          })
          .where(eq(emailTemplates.templateKey, template.templateKey));
        console.log(`   ✅ Updated "${template.name}"`);
      } else {
        await db.insert(emailTemplates).values({
          name: template.name,
          templateKey: template.templateKey,
          type: template.type,
          subject: template.subject,
          htmlContent: template.htmlContent,
          textContent: template.textContent || null,
          variables: template.variables,
          isActive: true,
        });
        console.log(`✅ Created "${template.name}"`);
      }
    }
    
    console.log(`\n🎉 Successfully seeded ${templates.length} email templates!`);
    console.log("\nTemplates created:");
    console.log("─".repeat(50));
    
    const categories = {
      "User/Client Templates": templates.filter(t => 
        ["welcome_email", "inquiry_confirmation", "appointment_confirmation", "appointment_reminder", 
         "event_booking_confirmation", "event_reminder_7days", "invoice_sent", "payment_received_client",
         "payment_reminder", "thank_you_post_event", "callback_request_confirmation", "quote_request_received",
         "password_reset"].includes(t.templateKey)
      ),
      "Admin/Staff Templates": templates.filter(t => 
        ["new_lead_alert", "new_callback_request_admin", "lead_assigned_staff", "appointment_assigned_staff",
         "event_assigned_staff", "payment_received_admin", "daily_digest_admin", "weekly_report_admin",
         "lead_status_changed", "appointment_reminder_staff", "event_tomorrow_reminder_staff",
         "new_team_member_welcome", "vendor_assignment", "client_converted", "invoice_overdue_alert"].includes(t.templateKey)
      )
    };
    
    for (const [category, categoryTemplates] of Object.entries(categories)) {
      console.log(`\n📧 ${category}:`);
      categoryTemplates.forEach(t => console.log(`   • ${t.name} (${t.templateKey})`));
    }
    
  } catch (error) {
    console.error("❌ Error seeding templates:", error);
    throw error;
  }
}

seedEmailTemplates()
  .then(() => {
    console.log("\n✨ Done!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Failed to seed email templates:", error);
    process.exit(1);
  });
