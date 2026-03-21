// must use server to bypass CORS

//builds the server
import express from 'express';
//allow http request
import fetch from 'node-fetch';
//allows bypassing CORS
import cors from "cors";
//dotenv
import 'dotenv/config';

const app = express();
app.use(cors());

app.get("/proxy", async (req, res) => {
  //web link
  const url = req.query.url;
  try {
    const response = await fetch(url, {
        headers: {
            "User-Agent": "Mozilla/5.0",
            "Accept": "text/html"
        }
    });
    const html = await response.text();
    //send to browser
    res.send(html);
  } catch (err) {
    res.status(500).send(err.toString());
  }
});

app.get("/testURL", async (req, res) => {
  res.json({
    apiKey: process.env.TEST_WORK_URL
  })
})

app.listen(3000, () => console.log("Test: Server running on port 3000"));