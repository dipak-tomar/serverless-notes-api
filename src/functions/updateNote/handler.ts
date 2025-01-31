import {
  DynamoDBDocumentClient,
  UpdateCommand,
  GetCommand,
} from "@aws-sdk/lib-dynamodb";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { formatResponse, AppError } from "../../libs/util";
import { UpdateNoteSchema } from "./schema";

const client = DynamoDBDocumentClient.from(new DynamoDBClient({}));

export const handler = async (event: any) => {
  try {
    const id = event.pathParameters?.id;
    if (!id) {
      throw new AppError(400, "Note ID is required");
    }

    const body = JSON.parse(event.body || "{}");
    const validation = UpdateNoteSchema.safeParse(body);

    if (!validation.success) {
      throw new AppError(400, `Invalid input: ${validation.error.message}`);
    }

    const { title, content, tags } = validation.data;

    const existingNote = await client.send(
      new GetCommand({
        TableName: process.env.TABLE_NAME,
        Key: { id },
      })
    );

    if (!existingNote.Item) {
      throw new AppError(404, "Note not found");
    }

    const updatedAt = new Date().toISOString();

    await client.send(
      new UpdateCommand({
        TableName: process.env.TABLE_NAME,
        Key: { id },
        UpdateExpression:
          "SET title = :title, content = :content, tags = :tags, updatedAt = :updatedAt",
        ExpressionAttributeValues: {
          ":title": title ?? existingNote.Item.title,
          ":content": content ?? existingNote.Item.content,
          ":tags": tags ?? existingNote.Item.tags,
          ":updatedAt": updatedAt,
        },
        ReturnValues: "ALL_NEW",
      })
    );

    return formatResponse(200, { message: "Note updated successfully" });
  } catch (error) {
    if (error instanceof AppError) {
      return formatResponse(error.statusCode, { message: error.message });
    }
    return formatResponse(500, { message: "Internal server error" });
  }
};
