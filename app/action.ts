'use server';

import { openai } from '@ai-sdk/openai';
import { streamText } from 'ai';
import { createStreamableValue } from 'ai/rsc';
import Groq from 'groq-sdk';
import { toFile } from 'openai';

export interface Message {
  role: 'user' | 'assistant';
  content: string;
}

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export async function continueConversation(history: Message[]) {
  'use server';

  const stream = createStreamableValue();

  (async () => {
    const { textStream } = await streamText({
      model: openai('gpt-4o-mini'),
      system:
        'You are a helpful assistant that can answer questions and help with tasks.',
      messages: history,
    });

    for await (const text of textStream) {
      stream.update(text);
    }

    stream.done();
  })();

  return {
    messages: history,
    newMessage: stream.value,
  };
}

export async function transcribe(audioData: string) {
  'use server';

  const audioBuffer = Buffer.from(audioData, 'base64');
  // const transcription = await openai.audio.transcriptions.create({
  //   file: await toFile(audioBuffer, "audio.wav", {
  //     type: "audio/wav",
  //   }),
  //   model: "whisper-1",
  // });
  const { text } = await groq.audio.transcriptions.create({
    file: await toFile(audioBuffer, 'audio.wav', {
      type: 'audio/wav',
    }),
    model: 'whisper-large-v3',
  });
  return {
    transcription: text,
  };
}

// export async function transcribe(url: string) {
//   'use server';

//   const response = await fetch(
//     'https://api.deepgram.com/v1/listen?tier=enhanced&punctuate=true&paragraphs=true&diarize=true',
//     {
//       method: 'POST',
//       headers: {
//         Authorization: 'Token ' + process.env.DEEPGRAM_API_KEY,
//         'Content-Type': 'application/json',
//       },
//       body: url,
//     }
//   );

//   const data = await response.json();
//   console.log('data', data);
//   const parsedData = JSON.parse(data);
//   const transcription =
//     parsedData.results.channels[0].alternatives[0].paragraphs.transcript;
//   return transcription;
// }

// const groq = new Groq({
//   apiKey: process.env.GROQ_API_KEY,
// });

// export async function getTranscript(input: string | File) {
// 	if (typeof input === "string") return input;

// 	try {
// 		const { text } = await groq.audio.transcriptions.create({
// 			file: input,
// 			model: "whisper-large-v3",
// 		});

// 		return text.trim() || null;
// 	} catch {
// 		return null; // Empty audio file
// 	}
// }

// export async function writeAudioFile(audio: string) {
//   const filePath = "tmp/input.mp3";
//   const finalAudio = Buffer.from(audio, "base64");
//   fs.writeFileSync(filePath, finalAudio);
// }

// export const transcribeUrl = async () => {
//   const deepgram = createClient(process.env.DEEPGRAM_API_KEY);
//   // const deepgram = createClient('67bd6546d6471d3edf6f28613a78cbf68b918eea');
//   const { result, error } = await deepgram.listen.prerecorded.transcribeUrl(
//     {
//       url: 'tmp/input.wav',
//     },
//     // STEP 3: Configure Deepgram options for audio analysis
//     {
//       model: 'nova-2',
//       smart_format: true,
//     }
//   );
//   if (error) console.log('error', error);
//   // STEP 4: Print the results
//   if (!error) console.log('result',result);
// };
