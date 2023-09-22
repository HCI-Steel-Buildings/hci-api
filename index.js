import express from "express";
import fetch from "node-fetch";
import dotenv from "dotenv";

dotenv.config();

const app = express();
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
        items (limit: 200) {
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

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
