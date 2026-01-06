import { PutCommand } from "@aws-sdk/lib-dynamodb";
import { ddb } from "./db";

const TABLE_NAME = "presale_index";

type BaseEvent = {
  eventType: string;
  txSignature: string;
  slot: number;
  timestamp: string;
};

type WriteEventResult = {
  success: boolean;
  isDuplicate: boolean;
};

export async function writeEvent(
  base: BaseEvent,
  attributes: Record<string, any>
): Promise<WriteEventResult> {
  const item = {
    PK: `TX#${base.txSignature}`,
    SK: `EVENT#${base.eventType}`,

    eventType: base.eventType,
    txSignature: base.txSignature,
    slot: base.slot,
    timestamp: base.timestamp,

    ...attributes,
  };

  const command = new PutCommand({
    TableName: TABLE_NAME,
    Item: item,

    // idempotency: same tx + eventType cannot be written twice
    ConditionExpression: "attribute_not_exists(PK)",
  });

  try {
    await ddb.send(command);
    return { success: true, isDuplicate: false };
  } catch (error: any) {
    // Check if it's a duplicate entry
    if (error.name === "ConditionalCheckFailedException") {
      return { success: false, isDuplicate: true };
    }
    
    // For any other error, rethrow it
    throw error;
  }
}