
interface DiscordWebhookMessage {
  content?: string;
  embeds?: {
    title?: string;
    description?: string;
    color?: number;
    fields?: { name: string; value: string }[];
    timestamp?: string;
  }[];
}

export async function sendDiscordError(
  error: Error,
  input?: any,
  context?: Record<string, any>
) {
  const webhookUrl = process.env.DISCORD_ERROR_WEBHOOK_URL;

  if (!webhookUrl) {
    console.warn("Discord webhook URL not configured");
    return;
  }
  console.log("sending discord error", error, input, context);
  const message: DiscordWebhookMessage = {
    embeds: [
      {
        title: "❌ Error Detected",
        description: error.message,
        color: 0xff0000, // Red
        fields: [
          {
            name: "Stack Trace",
            value: error?.stack?.slice(0, 1000) || "No stack trace available",
          },
          {
            name: "Input",
            value: JSON.stringify(input, null, 2).slice(0, 1000),
          },
          ...(context
            ? Object.entries(context).map(([key, value]) => ({
                name: key,
                value: JSON.stringify(value, null, 2).slice(0, 1000),
              }))
            : []),
        ],
        timestamp: new Date().toISOString(),
      },
    ],
  };

  try {
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(message),
    });

    if (!response.ok) {
      throw new Error(`Discord webhook failed with status ${response.status}`);
    }
    console.log("Discord error sent successfully");
  } catch (err) {
    console.error("Failed to send error to Discord:", err);
  }
}
