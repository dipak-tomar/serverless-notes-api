import { DynamoDBDocumentClient, GetCommand } from "@aws-sdk/lib-dynamodb";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { formatResponse, AppError } from "../../libs/util";

const client = DynamoDBDocumentClient.from(new DynamoDBClient({}));

export const handler = async (event: any) => {
  try {
    const id = event.pathParameters?.id;
    if (!id) throw new AppError(400, "Missing note ID");

    const { Item } = await client.send(
      new GetCommand({
        TableName: process.env.TABLE_NAME,
        Key: { id },
      })
    );

    if (!Item) throw new AppError(404, "Note not found");
    return formatResponse(200, Item);
  } catch (error) {
    if (error instanceof AppError) {
      return formatResponse(error.statusCode, { message: error.message });
    }
    return formatResponse(500, { message: "Internal server error" });
  }
};
