import Database from "better-sqlite3";
import path from "node:path";
import { app } from "electron";

// Simple name lists
const FIRST_NAMES = [
  "James", "Mary", "John", "Patricia", "Robert", "Jennifer",
  "Michael", "Linda", "William", "Barbara", "David", "Elizabeth",
  "Richard", "Susan", "Joseph", "Jessica", "Thomas", "Sarah",
  "Charles", "Karen", "Christopher", "Nancy", "Daniel", "Lisa",
];

const LAST_NAMES = [
  "Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia",
  "Miller", "Davis", "Martinez", "Wilson", "Anderson", "Taylor",
];

// Simple message templates
const MESSAGES = [
  "Hey! How are you?",
  "Did you see the news today?",
  "Let's catch up soon",
  "Thanks for your help!",
  "Can we schedule a meeting?",
  "That sounds great!",
  "Perfect, see you then",
  "What do you think?",
  "Good morning!",
  "Have a great day!",
];

// Helper to pick random item from array
function random<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

export function seedDatabase() {
  const dbPath = path.join(app.getPath("userData"), "secure-messenger.sqlite");
  const db = new Database(dbPath);

  // Don't seed if already done
  const { count } = db.prepare("SELECT COUNT(*) as count FROM chats").get() as { count: number };
  if (count >= 200) {
    console.log("Database already seeded");
    db.close();
    return;
  }

  console.log("Seeding database...");

  const now = Date.now();
  const chatIds: number[] = [];

  // Create 200 chats
  for (let i = 0; i < 200; i++) {
    const name = `${random(FIRST_NAMES)} ${random(LAST_NAMES)}`;
    const unreadCount = Math.floor(Math.random() * 10);
    const daysAgo = Math.floor(Math.random() * 30);
    const lastMessageAt = new Date(now - daysAgo * 24 * 60 * 60 * 1000).toISOString();

    const result = db.prepare("INSERT INTO chats (title, lastMessageAt, unreadCount) VALUES (?, ?, ?)")
      .run(name, lastMessageAt, unreadCount);

    chatIds.push(result.lastInsertRowid as number);
  }

  console.log(`✓ Created ${chatIds.length} chats`);

  // Create 20,000+ messages
  let totalMessages = 0;

  for (let i = 0; i < chatIds.length; i++) {
    const chatId = chatIds[i];

    // First 50 chats get more messages (100-150 each)
    // Next 100 get medium amount (50-100 each)
    // Last 50 get fewer messages (10-30 each)
    let messageCount;
    if (i < 50) {
      messageCount = 100 + Math.floor(Math.random() * 50);
    } else if (i < 150) {
      messageCount = 50 + Math.floor(Math.random() * 50);
    } else {
      messageCount = 10 + Math.floor(Math.random() * 20);
    }

    // Create messages for this chat
    for (let j = 0; j < messageCount; j++) {
      const sender = Math.random() > 0.5 ? "me" : `${random(FIRST_NAMES)} ${random(LAST_NAMES)}`;
      const body = random(MESSAGES);
      const hoursAgo = Math.floor(Math.random() * 720); // Last 30 days
      const ts = new Date(now - hoursAgo * 60 * 60 * 1000).toISOString();

      db.prepare("INSERT INTO messages (chatId, sender, body, ts) VALUES (?, ?, ?, ?)")
        .run(chatId, sender, body, ts);

      totalMessages++;
    }

    // Show progress every 50 chats
    if ((i + 1) % 50 === 0) {
      console.log(`  Created messages for ${i + 1} chats...`);
    }
  }

  console.log(`✓ Created ${totalMessages} messages`);
  console.log("✓ Seeding complete!");

  db.close();
}
