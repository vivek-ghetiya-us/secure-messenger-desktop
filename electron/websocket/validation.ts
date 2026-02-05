export interface IncomingMessage {
  type: string;
  data: {
    chatId: number;
    ts: string;
    sender: string;
    body: string;
  };
}

export function validateWebSocketMessage(message: any): message is IncomingMessage {
  if (typeof message !== 'object' || message === null) {
    return false;
  }

  if (message.type !== 'new-message') {
    return false;
  }

  const { data } = message;
  if (typeof data !== 'object' || data === null) {
    return false;
  }

  // Validate required fields
  if (typeof data.chatId !== 'number' || data.chatId <= 0) {
    return false;
  }

  if (typeof data.ts !== 'string' || !data.ts) {
    return false;
  }

  if (typeof data.sender !== 'string' || !data.sender.trim()) {
    return false;
  }

  if (typeof data.body !== 'string' || !data.body.trim()) {
    return false;
  }

  // Validate body length (max 10KB)
  if (data.body.length > 10000) {
    return false;
  }

  // Validate timestamp format
  try {
    const date = new Date(data.ts);
    if (isNaN(date.getTime())) {
      return false;
    }
  } catch {
    return false;
  }

  return true;
}
