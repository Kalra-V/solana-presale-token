import { ScanCommand, QueryCommand } from "@aws-sdk/lib-dynamodb";
import { ddb } from "../db/db";
import type { EventItem, UserStats, PresaleStats, Activity } from "../types.js";

const TABLE_NAME = "presale_index";

export async function getUserDeposits(
  userPubkey: string
): Promise<EventItem[]> {
  const command = new ScanCommand({
    TableName: TABLE_NAME,
    FilterExpression: "eventType = :eventType AND user_pubkey = :userPubkey",
    ExpressionAttributeValues: {
      ":eventType": "DEPOSIT",
      ":userPubkey": userPubkey,
    },
  });

  const response = await ddb.send(command);
  return (response.Items || []) as EventItem[];
}

export async function getAllDeposits(): Promise<EventItem[]> {
  const command = new ScanCommand({
    TableName: TABLE_NAME,
    FilterExpression: "eventType = :eventType",
    ExpressionAttributeValues: {
      ":eventType": "DEPOSIT",
    },
  });

  const response = await ddb.send(command);
  return (response.Items || []) as EventItem[];
}

export async function getRecentActivities(
  limit: number = 50
): Promise<Activity[]> {
  const command = new ScanCommand({
    TableName: TABLE_NAME,
    Limit: limit * 2, // Get more to account for filtering
  });

  const response = await ddb.send(command);
  const items = (response.Items || []) as EventItem[];

  // Sort by timestamp descending and limit
  const sorted = items
    .sort(
      (a, b) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    )
    .slice(0, limit)
    .map((item) => ({
      eventType: item.eventType,
      txSignature: item.txSignature,
      timestamp: item.timestamp,
      user_pubkey: item.user_pubkey,
      lamports: item.lamports,
      token_amount: item.token_amount,
    }));

  return sorted;
}

export async function getUserStats(userPubkey: string): Promise<UserStats> {
  const deposits = await getUserDeposits(userPubkey);

  const totalSolDeposited = deposits.reduce((sum, deposit) => {
    return sum + (deposit.lamports || 0);
  }, 0);

  const solAmount = totalSolDeposited / 1e9; // Convert lamports to SOL
  const estimatedTokens = solAmount * 0.1; // 0.1 tokens per SOL

  const depositHistory = deposits.map((deposit) => ({
    txSignature: deposit.txSignature,
    amount: (deposit.lamports || 0) / 1e9,
    timestamp: deposit.timestamp,
  }));

  // Check if user has claimed tokens
  const distributeCommand = new ScanCommand({
    TableName: TABLE_NAME,
    FilterExpression: "eventType = :eventType AND user_pubkey = :userPubkey",
    ExpressionAttributeValues: {
      ":eventType": "DISTRIBUTE",
      ":userPubkey": userPubkey,
    },
  });

  const distributeResponse = await ddb.send(distributeCommand);
  const isDistributed = (distributeResponse.Items || []).length > 0;

  return {
    totalSolDeposited: solAmount,
    estimatedTokens,
    isDistributed,
    deposits: depositHistory.sort(
      (a, b) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    ),
  };
}

export async function getPresaleStats(): Promise<PresaleStats> {
  const deposits = await getAllDeposits();

  const totalSolRaised =
    deposits.reduce((sum, deposit) => {
      return sum + (deposit.lamports || 0);
    }, 0) / 1e9;

  // Get unique participants
  const uniqueParticipants = new Set(
    deposits.map((d) => d.user_pubkey).filter(Boolean)
  );

  // Check if distribution is enabled
  const enableDistCommand = new ScanCommand({
    TableName: TABLE_NAME,
    FilterExpression: "eventType = :eventType",
    ExpressionAttributeValues: {
      ":eventType": "ENABLE_DISTRIBUTION",
    },
  });

  const enableDistResponse = await ddb.send(enableDistCommand);
  const isDistributable = (enableDistResponse.Items || []).length > 0;

  return {
    totalSolRaised,
    participantCount: uniqueParticipants.size,
    isDistributable,
  };
}

export async function getAllParticipants(): Promise<
  Array<{ user_pubkey: string; totalDeposited: number; isDistributed: boolean }>
> {
  const deposits = await getAllDeposits();

  // Group by user
  const userMap = new Map<
    string,
    { totalDeposited: number; isDistributed: boolean }
  >();

  deposits.forEach((deposit) => {
    const pubkey = deposit.user_pubkey;
    if (!pubkey) return;

    const existing = userMap.get(pubkey) || {
      totalDeposited: 0,
      isDistributed: false,
    };
    existing.totalDeposited += (deposit.lamports || 0) / 1e9;
    userMap.set(pubkey, existing);
  });

  // Check distribution status for each user
  const distributeCommand = new ScanCommand({
    TableName: TABLE_NAME,
    FilterExpression: "eventType = :eventType",
    ExpressionAttributeValues: {
      ":eventType": "DISTRIBUTE",
    },
  });

  const distributeResponse = await ddb.send(distributeCommand);
  const distributedItems = (distributeResponse.Items || []) as EventItem[];

  distributedItems.forEach((item) => {
    const pubkey = item.user_pubkey;
    if (pubkey && userMap.has(pubkey)) {
      const user = userMap.get(pubkey)!;
      user.isDistributed = true;
    }
  });

  return Array.from(userMap.entries()).map(([user_pubkey, data]) => ({
    user_pubkey,
    ...data,
  }));
}
