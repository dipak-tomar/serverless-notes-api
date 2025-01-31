import { DynamoDBDocumentClient, PutCommand } from "@aws-sdk/lib-dynamodb";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { v4 as uuidv4 } from "uuid";
import { formatResponse, AppError } from "../../libs/util";
import { CreateNoteSchema } from "./schema";

const client = DynamoDBDocumentClient.from(new DynamoDBClient({}));

export const handler = async (event: any) => {
  try {
    const body = JSON.parse(event.body || "{}");
    const validation = CreateNoteSchema.safeParse(body);

    if (!validation.success) {
      throw new AppError(400, `Invalid input: ${validation.error.message}`);
    }

    const note = {
      ...validation.data,
      id: uuidv4(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await client.send(
      new PutCommand({
        TableName: process.env.TABLE_NAME,
        Item: note,
      })
    );

    return formatResponse(201, note);
  } catch (error) {
    if (error instanceof AppError) {
      return formatResponse(error.statusCode, { message: error.message });
    }
    return formatResponse(500, { message: "Internal server error" });
  }
};
