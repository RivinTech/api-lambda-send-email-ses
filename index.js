import { SESClient, SendEmailCommand } from '@aws-sdk/client-ses';
import processResponse from './process-response.js';

const UTF8CHARSET = 'UTF-8';
const FROM_EMAIL = process.env.FROM_EMAIL;

const ses = new SESClient({});

export const handler = async (event) => {

  if (process.env.DEBUG_LOGGING == "true")
    console.log(event);

  if (event.httpMethod === 'OPTIONS') {
    return processResponse(true);
  }

  let origin = null;
  if (event.headers.origin)
    origin = event.headers.origin;
  else if (event.headers.Origin)
    origin = event.headers.Origin;
    
  console.log(origin);
  
  if (process.env.CORS_ORIGIN != '*' && (!origin || origin !== process.env.CORS_ORIGIN)) {
    return processResponse(false, 'Invalid', 401);
  }

  if (!event.body) {
    return processResponse(true, 'Please specify email parameters: toEmails, subject, and message', 400);
  }

  let emailData;
  try {
    emailData = JSON.parse(event.body);
  } catch {
    return processResponse(true, 'Invalid JSON in request body', 400);
  }

  const { toEmails, ccEmails, bccEmails, subject, message, replyToEmails } = emailData;

  if (!Array.isArray(toEmails) || !subject || !message) {
    return processResponse(true, 'Please specify email parameters: toEmails, subject and message', 400);
  }

  const destination = {
    ToAddresses: toEmails,
    ...(ccEmails?.length ? { CcAddresses: ccEmails } : {}),
    ...(bccEmails?.length ? { BccAddresses: bccEmails } : {})
  };

  const isHtml = isHTML(message);
  const body = isHtml
    ? { Html: { Charset: UTF8CHARSET, Data: message } }
    : { Text: { Charset: UTF8CHARSET, Data: message } };

  const emailParams = {
    Destination: destination,
    Message: {
      Body: body,
      Subject: {
        Charset: UTF8CHARSET,
        Data: subject
      }
    },
    Source: FROM_EMAIL,
    ...(replyToEmails?.length ? { ReplyToAddresses: replyToEmails } : {})
  };

  try {
    console.log("sending '" + subject + "' to " + toEmails);

    await ses.send(new SendEmailCommand(emailParams));
    return processResponse(true);
  } catch (err) {
    console.error('SES error:', err);
    return processResponse(true, 'Error sending email. Check logs for details.', 500);
  }
};

function isHTML(value) {
  const trimmed = value.trim();
  return (
    trimmed.startsWith('<') &&
    trimmed.endsWith('>') &&
    /<(body|div|s|h[1-6]|p)/i.test(trimmed)
  );
}

