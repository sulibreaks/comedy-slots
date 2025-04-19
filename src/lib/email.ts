import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

type BookingEmailProps = {
  to: string;
  showTitle: string;
  showDate: string;
  status: string;
  isComedian: boolean;
};

export async function sendBookingStatusEmail({
  to,
  showTitle,
  showDate,
  status,
  isComedian,
}: BookingEmailProps) {
  const subject = isComedian
    ? `Your booking for "${showTitle}" has been ${status.toLowerCase()}`
    : `New booking for "${showTitle}" - Action Required`;

  let content = '';
  if (isComedian) {
    switch (status) {
      case 'APPROVED':
        content = `Great news! Your booking for "${showTitle}" on ${showDate} has been approved. We look forward to seeing you at the show!`;
        break;
      case 'REJECTED':
        content = `We're sorry, but your booking for "${showTitle}" on ${showDate} has been rejected. Please try booking another show.`;
        break;
      case 'PENDING':
        content = `Your booking for "${showTitle}" on ${showDate} has been received and is pending approval. We'll notify you when the promoter reviews your booking.`;
        break;
      default:
        content = `The status of your booking for "${showTitle}" on ${showDate} has been updated to ${status}.`;
    }
  } else {
    content = `A new booking request has been received for "${showTitle}" on ${showDate}. Please review and approve or reject this booking in your dashboard.`;
  }

  try {
    const data = await resend.emails.send({
      from: 'Comedy Slots <notifications@comedy-slots.com>',
      to: [to],
      subject: subject,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #1a1a1a; font-size: 24px; margin-bottom: 24px;">
            ${subject}
          </h1>
          <p style="color: #4a4a4a; font-size: 16px; line-height: 1.5;">
            ${content}
          </p>
          <div style="margin-top: 32px; padding-top: 32px; border-top: 1px solid #eaeaea;">
            <p style="color: #666666; font-size: 14px;">
              This is an automated message from Comedy Slots. Please do not reply to this email.
            </p>
          </div>
        </div>
      `,
    });

    return { success: true, data };
  } catch (error) {
    console.error('Failed to send email:', error);
    return { success: false, error };
  }
} 