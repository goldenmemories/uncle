const sgMail = require('@sendgrid/mail');

exports.handler = async (event, context) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const { recipients, subject, message } = JSON.parse(event.body);
    
    sgMail.setApiKey(process.env.SENDGRID_API_KEY);
    
    const emails = recipients.map(recipient => ({
      to: recipient.email,
      from: process.env.SENDER_EMAIL || 'your-email@example.com',
      subject: subject,
      text: message,
    }));
    
    await sgMail.send(emails);
    
    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'Emails sent successfully' })
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Error sending emails', error: error.message })
    };
  }
};
