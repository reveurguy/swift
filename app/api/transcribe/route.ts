import Groq from 'groq-sdk';
import { NextResponse } from 'next/server';
import OpenAI, { toFile } from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});
const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

// export default async function handler(
//   req:Re
//   res
// ) {
//   try {
//     // Extract Base64 encoded data from the request
//     const bodyData = JSON.parse(req.body);
//     const base64Audio = bodyData.audioData;

//     // Decode Base64 to binary
//     const audioBuffer = Buffer.from(base64Audio, "base64");

//     // Use OpenAI API to transcribe the audio
//     const transcription = await openai.audio.transcriptions.create({
//       file: await toFile(audioBuffer, "audio.wav", {
//         contentType: "audio/wav",
//       }),
//       model: "whisper-1",
//     });

//     // Send the transcription text as response
//     res.json({ transcription: transcription.text });
//   } catch (error) {
//     console.error("Error during transcription:", error);
//     res.status(500).send("Error during transcription");
//   }
// }

export async function POST(req: Request) {
  const { audioData } = await req.json();
  try {
    // Decode Base64 to binary
    const audioBuffer = Buffer.from(audioData, 'base64');
    const transcription = await openai.audio.transcriptions.create({
      file: await toFile(audioBuffer, 'audio.wav', {
        type: 'audio/wav',
      }),
      model: 'whisper-1',
    });
    // const { text } = await groq.audio.transcriptions.create({
    //   file: await toFile(audioBuffer, "audio.wav", {
    //     type: "audio/wav",
    //   }),
    //   model: "whisper-large-v3",
    // });
    return NextResponse.json({ transcription: transcription.text });
  } catch (error) {
    console.error('Error during transcription:', error);
    return NextResponse.json(
      { error: 'Error during transcription' },
      { status: 500 }
    );
  }
}
