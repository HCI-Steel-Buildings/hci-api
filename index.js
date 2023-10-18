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
          id
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
app.get("/api/it-data", async (req, res) => {
  const query = `
    query {
      boards(ids: 5353369660) {
        name
        columns {
          title
          type
        }
        items (limit: 100) {
          id
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
    Authorization: AUTH_TOKEN, // Moved the token check to a safer location
  };

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

app.post("/api/update-contact-status", async (req, res) => {
  const itemId = parseInt(req.body.itemId, 10);
  const boardId = 4803932474;
  const columnId = "status_1"; // Use the actual column ID for "Contacted?"

  const columnValue = JSON.stringify({ label: "YES" });

  const body = {
    query: `
      mutation UpdateContactStatus($myItemId: Int!, $myBoardId: Int!, $myColumnId: String!, $myColumnValue: JSON!) {
        change_column_value(item_id: $myItemId, board_id: $myBoardId, column_id: $myColumnId, value: $myColumnValue) {
          id
        }
      }
      `,
    variables: {
      myBoardId: boardId,
      myItemId: itemId,
      myColumnId: columnId,
      myColumnValue: columnValue,
    },
  };

  let headers = {
    "Content-Type": "application/json",
    Authorization: AUTH_TOKEN,
  };

  try {
    const response = await fetch(MONDAY_API_ENDPOINT, {
      method: "POST",
      headers: headers,
      body: JSON.stringify(body),
    });

    const responseBody = await response.json();

    if (responseBody.errors) {
      console.error("Response from Monday.com:", responseBody);
      return res.status(500).send("Internal Server Error");
    }

    res.json(responseBody.data.change_column_value);
  } catch (error) {
    console.error("Error updating Contacted? status on Monday.com:", error);
    res.status(500).send("Internal Server Error");
  }
});
app.post("/api/add-item", async (req, res) => {
  const boardId = 5353369660; // Your new board ID
  const itemName = req.body.itemName; // This is the new item's name
  const columnValues = req.body.columnValues; // This should be a JSON string

  const body = {
    query: `
      mutation ($myBoardId: Int!, $myItemName: String!, $myColumnValues: JSON!) {
        create_item (board_id: $myBoardId, item_name: $myItemName, column_values: $myColumnValues) {
          id
        }
      }
    `,
    variables: {
      myBoardId: boardId,
      myItemName: itemName,
      myColumnValues: columnValues, // Make sure this is in the correct JSON format expected by Monday.com
    },
  };

  let headers = {
    "Content-Type": "application/json",
    Authorization: AUTH_TOKEN, // Assuming your AUTH_TOKEN is always valid here
  };

  try {
    const response = await fetch(MONDAY_API_ENDPOINT, {
      method: "POST",
      headers: headers,
      body: JSON.stringify(body),
    });

    const responseBody = await response.json();

    if (responseBody.errors) {
      console.error("Response from Monday.com:", responseBody);
      return res.status(500).send("Internal Server Error");
    }

    res.json(responseBody.data.create_item);
  } catch (error) {
    console.error("Error adding an item on Monday.com:", error);
    res.status(500).send("Internal Server Error");
  }
});
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
