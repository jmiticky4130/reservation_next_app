// src/app/lib/emails.js
"use server";

import nodemailer from "nodemailer";

// Email transporter configuration
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: process.env.SMTP_SECURE === "true",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

// Helper function to generate cancellation token
function generateCancellationToken() {
  return Math.random().toString(36).substr(2, 9) + 
         Date.now().toString(36) + 
         Math.random().toString(36).substr(2, 9);
}

// Send verification code email
export async function sendVerificationCode(email) {
  const code = Math.floor(100000 + Math.random() * 900000).toString();

  try {
    console.log("Sending verification code:", code, "to email:", email);
    await transporter.sendMail({
      from: process.env.SMTP_USER,
      to: email,
      subject: "Your verification code",
      text: `Your verification code is: ${code}`,
    });

    return { success: true, code };
  } catch (error) {
    console.error("Email sending error:", error);
    return {
      error: "Failed to send verification code. Please try again later.",
    };
  }
}

// Send notification to barber about new appointment
export async function sendBarberNotification({
  barber,
  customer,
  appointmentDetails,
}) {
  const { date, timeRange, slotsCount } = appointmentDetails;

  const formattedDate = new Date(date).toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const emailContent = `
    <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 20px;">
      <h2 style="color: #333;">New Appointment Booking</h2>
      
      <p>Hello ${barber.name},</p>
      
      <p>You have a new appointment booking:</p>
      
      <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 15px 0;">
        <p><strong>Customer:</strong> ${customer.name}</p>
        <p><strong>Email:</strong> ${customer.email}</p>
        <p><strong>Date:</strong> ${formattedDate}</p>
        <p><strong>Time:</strong> ${timeRange}</p>
        <p><strong>Duration:</strong> ${slotsCount * 15} minutes</p>
      </div>
      
      <p>Please be prepared for this appointment.</p>
      
      <p>Best regards,<br>BarberShop Team</p>
    </div>
  `;

  const mailOptions = {
    from: process.env.SMTP_USER,
    to: barber.email,
    subject: `New Appointment: ${customer.name} - ${formattedDate}`,
    html: emailContent,
    text: `
New Appointment Booking

Customer: ${customer.name}
Email: ${customer.email}
Date: ${formattedDate}
Time: ${timeRange}
Duration: ${slotsCount * 15} minutes

Please be prepared for this appointment.

Best regards,
BarberShop Team
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    return { success: true };
  } catch (error) {
    console.error("Email sending error:", error);
    throw new Error("Failed to send notification email");
  }
}

// Send confirmation to customer about their appointment
export async function sendCustomerConfirmation({
  customer,
  barber,
  appointmentDetails,
  sql, // Pass sql connection for database operations
}) {
  const { date, timeRange, slotsCount } = appointmentDetails;

  const formattedDate = new Date(date).toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  console.log("customer: ", customer, "\nbarber: ", barber, "\nappointmentdetails: ", appointmentDetails);

  // Generate a unique cancellation token
  const cancellationToken = generateCancellationToken();
  const appointmentId = `${customer.id}_${date}_${timeRange}`;
  
   const startTime = timeRange.split(' - ')[0];
  
  const [hours, minutes] = startTime.split(':');
  const appointmentDateTime = new Date(date);
  appointmentDateTime.setHours(parseInt(hours, 10));
  appointmentDateTime.setMinutes(parseInt(minutes, 10));
  appointmentDateTime.setSeconds(0);
  appointmentDateTime.setMilliseconds(0);
  
  const expiresAt = new Date(appointmentDateTime.getTime() - (12 * 60 * 60 * 1000)); // 12 hours before
  const createdAt = new Date();

  console.log("appointment ID: ", appointmentId, customer.id, cancellationToken, expiresAt, createdAt);
  console.log("appointmentDateTime: ", appointmentDateTime);
  console.log("expiresAt: ", expiresAt);
  
  try {
    await sql`
      INSERT INTO appointment_cancellation_tokens (appointment_id, customer_id, token, expires_at, created_at, used)
      VALUES (${appointmentId}, ${customer.id}, ${cancellationToken}, ${expiresAt}, ${createdAt}, ${false})
    `;
  } catch (error) {
    console.error("Failed to create cancellation token:", error);
  }


  // Create cancellation URL
  const baseUrl = process.env.VERCEL_URL || 'http://localhost:3000';
  const cancellationUrl = `${baseUrl}/cancel-appointment?token=${cancellationToken}`;

  const emailContent = `
    <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 20px;">
      <h2 style="color: #333;">Appointment Confirmed!</h2>
      
      <p>Hello ${customer.name},</p>
      
      <p>Your appointment has been successfully booked:</p>
      
      <div style="background-color: #e8f5e8; padding: 15px; border-radius: 5px; margin: 15px 0;">
        <p><strong>Barber:</strong> ${barber.name}</p>
        <p><strong>Date:</strong> ${formattedDate}</p>
        <p><strong>Time:</strong> ${timeRange}</p>
        <p><strong>Duration:</strong> ${slotsCount * 15} minutes</p>
      </div>
      
      <p>We look forward to seeing you! Please arrive a few minutes early.</p>
      
      <div style="margin: 25px 0; padding: 15px; background-color: #f8f9fa; border-radius: 5px; border-left: 4px solid #dc3545;">
        <p style="margin: 0 0 10px 0; font-weight: bold; color: #721c24;">Need to cancel?</p>
        <p style="margin: 0 0 15px 0; color: #721c24; font-size: 14px;">
          If you need to cancel this appointment, click the link below:
        </p>
        <a href="${cancellationUrl}" 
           style="display: inline-block; padding: 10px 20px; background-color: #dc3545; color: white; text-decoration: none; border-radius: 4px; font-weight: bold;">
          Cancel Appointment
        </a>
        <p style="margin: 10px 0 0 0; color: #6c757d; font-size: 12px;">
          This link will expire after your appointment date.
        </p>
      </div>
      
      <p>Best regards,<br>BarberShop Team</p>
    </div>
  `;

  const mailOptions = {
    from: process.env.SMTP_USER,
    to: customer.email,
    subject: `Appointment Confirmed - ${formattedDate} at ${timeRange}`,
    html: emailContent,
  };

  try {
    await transporter.sendMail(mailOptions);
    return { success: true };
  } catch (error) {
    console.error("Email sending error:", error);
    throw new Error("Failed to send confirmation email");
  }
}

// Send cancellation notification to barber
export async function sendBarberCancellationNotification({
  barber,
  customer,
  appointmentDetails,
}) {
  const { date, timeRange, slotsCount } = appointmentDetails;

  const formattedDate = new Date(date).toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const emailContent = `
    <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 20px;">
      <h2 style="color: #dc3545;">Appointment Cancelled</h2>
      
      <p>Hello ${barber.name},</p>
      
      <p>An appointment has been cancelled:</p>
      
      <div style="background-color: #f8d7da; padding: 15px; border-radius: 5px; margin: 15px 0; border-left: 4px solid #dc3545;">
        <p><strong>Customer:</strong> ${customer.name}</p>
        <p><strong>Date:</strong> ${formattedDate}</p>
        <p><strong>Time:</strong> ${timeRange}</p>
        <p><strong>Duration:</strong> ${slotsCount * 15} minutes</p>
      </div>
      
      <p>This time slot is now available for new bookings.</p>
      
      <p>Best regards,<br>BarberShop Team</p>
    </div>
  `;

  const mailOptions = {
    from: process.env.SMTP_USER,
    to: barber.email,
    subject: `Appointment Cancelled - ${formattedDate}`,
    html: emailContent,
  };

  try {
    await transporter.sendMail(mailOptions);
    return { success: true };
  } catch (error) {
    console.error("Email sending error:", error);
    throw new Error("Failed to send cancellation notification");
  }
}


export async function sendCustomerCancellationNotification({
  customer,
  barber,
  appointmentDetails,
}) {
  const { formattedDate, time } = appointmentDetails;

  const emailContent = `
    <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 20px;">
      <h2 style="color: #dc3545;">Appointment Cancelled</h2>
      
      <p>Dear ${customer.name},</p>
      
      <p>We regret to inform you that your appointment has been cancelled by your barber:</p>
      
      <div style="background-color: #f8d7da; padding: 15px; border-radius: 5px; margin: 15px 0; border-left: 4px solid #dc3545;">
        <p><strong>Barber:</strong> ${barber.name}</p>
        <p><strong>Date:</strong> ${formattedDate}</p>
        <p><strong>Time:</strong> ${time}</p>
        <p><strong>Status:</strong> <span style="color: #dc3545; font-weight: bold;">CANCELLED</span></p>
      </div>
      
      <p>We apologize for any inconvenience this may cause. Please feel free to book a new appointment at your convenience.</p>
      
      <div style="margin: 20px 0; padding: 15px; background-color: #e8f5e8; border-radius: 5px; border-left: 4px solid #28a745;">
        <p style="margin: 0 0 10px 0; font-weight: bold; color: #155724;">Need a new appointment?</p>
        <p style="margin: 0 0 15px 0; color: #155724; font-size: 14px;">
          Visit our website to book a new appointment:
        </p>
        <a href="${process.env.VERCEL_URL || 'http://localhost:3000'}" 
           style="display: inline-block; padding: 10px 20px; background-color: #28a745; color: white; text-decoration: none; border-radius: 4px; font-weight: bold;">
          Book New Appointment
        </a>
      </div>
      
      <p>If you have any questions, please don't hesitate to contact us.</p>
      
      <p>Best regards,<br>BarberShop Team</p>
    </div>
  `;

  const mailOptions = {
    from: process.env.SMTP_USER,
    to: customer.email,
    subject: `Appointment Cancelled - ${formattedDate} at ${time}`,
    html: emailContent,
    text: `
Dear ${customer.name},

We regret to inform you that your appointment has been cancelled by your barber.

Appointment Details:
Barber: ${barber.name}
Date: ${formattedDate}
Time: ${time}
Status: CANCELLED

We apologize for any inconvenience this may cause. Please feel free to book a new appointment at your convenience.

Visit our website to book a new appointment: ${process.env.VERCEL_URL || 'http://localhost:3000'}

If you have any questions, please don't hesitate to contact us.

Best regards,
BarberShop Team
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    return { success: true };
  } catch (error) {
    console.error("Email sending error:", error);
    throw new Error("Failed to send cancellation notification email");
  }
}