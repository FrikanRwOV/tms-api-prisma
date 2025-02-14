import { SES } from "aws-sdk";

interface EmailParams {
  to: string | string[];
  subject: string;
  body: string;
  from?: string;
}

export async function sendEmail({
  to,
  subject,
  body,
  from = process.env.DEFAULT_FROM_EMAIL,
}: EmailParams): Promise<void> {
  const ses = new SES();

  const recipients = Array.isArray(to) ? to : [to];

  const params = {
    Source:
      from || process.env.DEFAULT_FROM_EMAIL || "magaya@openvantage.co.za",
    Destination: {
      ToAddresses: recipients,
    },
    Message: {
      Subject: {
        Data: subject,
        Charset: "UTF-8",
      },
      Body: {
        Html: {
          Data: body,
          Charset: "UTF-8",
        },
      },
    },
  };

  try {
    const response = await ses.sendEmail(params).promise();
    console.log(response);
  } catch (error) {
    console.error("Failed to send email:", error);
    throw new Error("Failed to send email");
  }
}
