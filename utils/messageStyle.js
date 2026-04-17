import fs from "fs";
import stylizedChar from "./fancy.js";

const thumbnail = fs.readFileSync("./database/DigiX.jpg");

export default function stylizedCardMessage(text) {
  return {
    text: stylizedChar(text || "..."),
    contextInfo: {
      externalAdReply: {
        title: "NARUTO-MD-V1",
        body: "Golden Naruto",
        thumbnail: thumbnail,
        sourceUrl: "https://whatsapp.com",
        mediaType: 1,
        renderLargerThumbnail: false
      }
    }
  };
}