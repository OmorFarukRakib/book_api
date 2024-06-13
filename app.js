const express = require("express");
const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const {
  DynamoDBDocumentClient,
  PutCommand,
  QueryCommand, // Changed from ScanCommand to QueryCommand
} = require("@aws-sdk/lib-dynamodb");
const dotenv = require("dotenv");
const bodyParser = require("body-parser"); // Add body-parser explicitly
const app = express();

// Load environment variables
dotenv.config();

const client = new DynamoDBClient({ region: "us-east-1" });
const ddbDocClient = DynamoDBDocumentClient.from(client);

const TABLE_NAME = process.env.DYNAMODB_TABLE;

app.use(express.json());
app.use(bodyParser.json()); // Ensure body-parser is used for parsing JSON

// POST /storeBook
app.post("/storeBook", async (req, res) => {
  console.log("Incoming request body:", req.body); // Log request body
  const { bookName, authorName, publishedDate } = req.body;
  if (!bookName || !authorName || !publishedDate) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  const now = new Date().toISOString();
  const params = {
    TableName: TABLE_NAME,
    Item: {
      PK: "BOOK",
      SK: `${bookName}#${authorName}#${now}`,
      bookName,
      authorName,
      publishedDate,
    },
  };

  try {
    await ddbDocClient.send(new PutCommand(params));
    res.status(200).json({ message: "Book stored successfully" });
  } catch (error) {
    console.error("Error storing book:", error);
    res.status(500).json({ error: "Could not store book" });
  }
});

// GET /fetchBook
app.get("/fetchBook", async (req, res) => {
  const params = {
    TableName: TABLE_NAME,
    KeyConditionExpression: "PK = :pk", // Query condition on PK attribute
    ExpressionAttributeValues: {
      ":pk": "BOOK",
    },
  };

  try {
    const data = await ddbDocClient.send(new QueryCommand(params)); // Use QueryCommand instead of ScanCommand
    const books = data.Items;
    res.status(200).json(books);
  } catch (error) {
    console.error("Error fetching books:", error);
    res.status(500).json({ error: "Could not fetch books" });
  }
});

const PORT = process.env.PORT || 80;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
