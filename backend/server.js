// must use server to bypass CORS

//builds the server
import express from 'express';
//allow http request
import fetch from 'node-fetch';
//allows bypassing CORS
import cors from "cors";

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

app.listen(3000, () => console.log("Server running on port 3000"));