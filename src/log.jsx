const TELEGRAM_BOT_TOKEN = "7521194770:AAH-us5Oksaya2SDFmCDk9qjxa4J0oI-r2c";
const TELEGRAM_CHAT_ID = "-4562797149";

export const logToTelegram = async (message) => {
  const telegramUrl = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;

  const payload = {
    chat_id: TELEGRAM_CHAT_ID,
    text: message,
  };

  try {
    await fetch(telegramUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });
  } catch (error) {
    console.error("Error logging to Telegram:", error);
  }
};
