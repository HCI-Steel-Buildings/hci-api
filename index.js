import express from "express";
import fetch from "node-fetch";
import dotenv from "dotenv";
import cors from "cors";

dotenv.config();

const app = express();
app.use(express.json());

app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST"],
    credentials: true,
  })
);
const PORT = process.env.PORT || 3001;

const MONDAY_API_ENDPOINT = "https://api.monday.com/v2/";
const AUTH_TOKEN = process.env.MONDAY_API_TOKEN;

app.get("/api/monday-data", async (req, res) => {
  const query = `
    query {
      boards(ids: 4803932474) {
        name
        columns {
          title
          type
        }
        items (limit: 100) {
          name
          column_values {
            text
            value
          }
        }
      }
    }
  `;

  let headers = {
    "Content-Type": "application/json",
  };

  if (AUTH_TOKEN) {
    headers.Authorization = AUTH_TOKEN;
  }

  try {
    const response = await fetch(MONDAY_API_ENDPOINT, {
      method: "POST",
      headers: headers,
      body: JSON.stringify({ query }),
    });

    const responseBody = await response.json();
    res.json(responseBody.data.boards[0]);
  } catch (error) {
    console.error("Error fetching data from Monday.com:", error);
    res.status(500).send("Internal Server Error");
  }
});

app.post("/api/update-contacted", async (req, res) => {
  const { itemId } = req.body;

  // Assuming "Contacted?" column has an ID of "text_column"
  // (You'll need to get the exact ID of the column from your board)
  const columnId = "status_1";

  const value = JSON.stringify({ text: "YES" });

  const mutation = `
    mutation {
      change_column_value (board_id: 4803932474, item_id: ${itemId}, column_id: "${columnId}", value: ${value}) {
        id
      }
    }
  `;

  let headers = {
    "Content-Type": "application/json",
  };

  if (AUTH_TOKEN) {
    headers.Authorization = AUTH_TOKEN;
  }

  try {
    const response = await fetch(MONDAY_API_ENDPOINT, {
      method: "POST",
      headers: headers,
      body: JSON.stringify({ query: mutation }),
    });

    const responseBody = await response.json();
    res.json(responseBody.data.change_column_value);
  } catch (error) {
    console.error("Error updating item on Monday.com:", error);
    res.status(500).send("Internal Server Error");
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
