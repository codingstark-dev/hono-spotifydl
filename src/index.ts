import { serve } from "@hono/node-server";
import { Hono } from "hono";
import Spotify from "spotifydl-core";
import { lookup } from "mime-types";
const getBase64 = async (buffer: Buffer) => {
  try {
    const base64 = buffer.toString("base64");
    return "data:audio/mpeg;base64," + base64;
  } catch (e) {
    return "";
  }
};
const app = new Hono();
const credentials = {
  clientId: "",
  clientSecret: "",
};
const spotify = new Spotify(credentials);
app.get("/", async (c) => {
  try {
    const query = c.req.query("url");
    const type = c.req.query("type");
    console.log(query);
    if (!query) {
      return c.json({
        error: "No url provided",
      });
    }
    if (type === "track") {
      let getTrack = await spotify.getTrack(query!);
      let buffer = await spotify.downloadTrack(query!);
      let base64Audio = await getBase64(buffer as Buffer);
      return c.json({
        track: getTrack,
        base64Audio: base64Audio,
      });
    } else if (type === "playlist") {
      let getPlaylist = await spotify.getPlaylist(query!);
      return c.json({
        playlist: getPlaylist,
      });
    }
  } catch (error: any) {
    return c.json({
      error: error.message,
    });
  }
});

const port = 3000;
console.log(`Server is running on port ${port}`);

serve({
  fetch: app.fetch,
  port,
});
