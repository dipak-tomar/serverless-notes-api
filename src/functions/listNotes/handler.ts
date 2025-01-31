import { DynamoDBDocumentClient, ScanCommand } from "@aws-sdk/lib-dynamodb";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { formatResponse } from "../../libs/util";

const client = DynamoDBDocumentClient.from(new DynamoDBClient({}));

export const handler = async (event: any) => {
  try {
    const tagsParam = event.queryStringParameters?.tags;
    const tagList = tagsParam
      ? tagsParam
          .split(",")
          .map((tag: string) => tag.trim())
          .filter((tag: string) => tag !== "")
      : [];

    let filterExpression;
    const expressionAttributeValues: { [key: string]: string } = {};

    if (tagList.length > 0) {
      const filterConditions = tagList.map((tag: string, index: number) => {
        const placeholder = `:tag${index}`;
        expressionAttributeValues[placeholder] = tag;
        return `contains(tags, ${placeholder})`;
      });
      filterExpression = filterConditions.join(" AND ");
    }

    const scanParams: any = {
      TableName: process.env.TABLE_NAME,
    };

    if (filterExpression) {
      scanParams.FilterExpression = filterExpression;
      scanParams.ExpressionAttributeValues = expressionAttributeValues;
    }

    const { Items } = await client.send(new ScanCommand(scanParams));

    return formatResponse(200, { notes: Items || [] });
  } catch (error) {
    console.error(error);
    return formatResponse(500, { message: "Internal server error" });
  }
};
