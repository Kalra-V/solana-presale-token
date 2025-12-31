import { PutCommand } from "@aws-sdk/lib-dynamodb";
import { ddb } from "./db";

const TABLE_NAME = "presale_index";

type BaseEvent = {
  eventType: string;
  txSignature: string;
  slot: number;
  timestamp: string;
};

export async function writeEvent(
    base: BaseEvent,
    attributes: Record<string, any>
  ) {
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
  
    await ddb.send(command);
  }