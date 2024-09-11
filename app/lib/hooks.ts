// import { getTranscript, transcribe, transcribeUrl, writeAudioFile } from '@/action';
// import { createClient } from '@deepgram/sdk';
import { transcribe } from '@/action';
import { useRef, useState } from 'react';

type UseVoiceRecorderReturnType = {
  isRecording: boolean;
  startRecording: () => void;
  stopRecording: () => void;
  audioUrl: string | null;
  transcript: string | null;
  transcriptSet: boolean;
};

const useVoiceRecorder = (): UseVoiceRecorderReturnType => {
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [transcript, setTranscript] = useState<string | null>(null);
  const [transcriptSet, setTranscriptSet] = useState<boolean>(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const startRecording = async () => {
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: true,
        });
        const mediaRecorder = new MediaRecorder(stream);

        mediaRecorderRef.current = mediaRecorder;
        mediaRecorderRef.current.ondataavailable = (event) => {
          if (event.data.size > 0) {
            audioChunksRef.current.push(event.data);
          }
        };
        const getBase64 = (blob: Blob) =>
          new Promise<string | ArrayBuffer | null>((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsDataURL(blob);
          });

        mediaRecorderRef.current.onstop = async () => {
          const audioBlob = new Blob(audioChunksRef.current, {
            type: 'audio/wav',
          });
          const base64Audio = (await getBase64(audioBlob)) as string;
          const audioUrlData = base64Audio.replaceAll(
            'data:audio/wav;base64,',
            ''
          );
          const audioUrlAsData = `${audioUrlData}`;
          // const response = await fetch('/api/transcribe', {
          //   method: 'POST',
          //   body: JSON.stringify({ audioData: audioUrlAsData }),
          // });
          const data = await transcribe(audioUrlAsData);
          setTranscript(data.transcription);
          setTranscriptSet(true);
          setAudioUrl(audioUrl);
          audioChunksRef.current = [];
        };

        mediaRecorder.start();
        setIsRecording(true);
      } catch (err) {
        console.error('Error accessing microphone', err);
      }
    } else {
      console.error('MediaDevices API not supported.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  return {
    isRecording,
    startRecording,
    stopRecording,
    audioUrl,
    transcript,
    transcriptSet,
  };
};
export default useVoiceRecorder;

// -- version-2
// import { createClient } from '@deepgram/sdk';
// import { useRef, useState } from 'react';

// type UseVoiceRecorderReturnType = {
//   isRecording: boolean;
//   startRecording: () => void;
//   stopRecording: () => void;
//   audioUrl: string | null;
//   audioBlob: Blob | null; // Add audioBlob to return type
// };

// const useVoiceRecorder = (
//   onRecordingStop?: (audioBlob: Blob) => void
// ): UseVoiceRecorderReturnType => {
//   const [isRecording, setIsRecording] = useState<boolean>(false);
//   const [audioUrl, setAudioUrl] = useState<string | null>(null);
//   const [audioBlob, setAudioBlob] = useState<Blob | null>(null); // Store the Blob for the audio file
//   const mediaRecorderRef = useRef<MediaRecorder | null>(null);
//   const audioChunksRef = useRef<Blob[]>([]);

//   const startRecording = async () => {
//     if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
//       try {
//         const stream = await navigator.mediaDevices.getUserMedia({
//           audio: true,
//         });
//         const mediaRecorder = new MediaRecorder(stream);

//         mediaRecorderRef.current = mediaRecorder;
//         mediaRecorderRef.current.ondataavailable = (event) => {
//           if (event.data.size > 0) {
//             audioChunksRef.current.push(event.data);
//           }
//         };

//         mediaRecorderRef.current.onstop = () => {
//           const audioBlob = new Blob(audioChunksRef.current, {
//             type: 'audio/wav',
//           });
//           setAudioBlob(audioBlob); // Set the Blob when recording stops
//           const audioUrl = URL.createObjectURL(audioBlob);
//           setAudioUrl(audioUrl);
//           audioChunksRef.current = [];
//           transcribeUrl(audioUrl);
//           if (onRecordingStop) {
//             onRecordingStop(audioBlob); // Pass the audioBlob to the callback
//           }
//         };

//         mediaRecorder.start();
//         setIsRecording(true);
//       } catch (err) {
//         console.error('Error accessing microphone', err);
//       }
//     } else {
//       console.error('MediaDevices API not supported.');
//     }
//   };

//   const stopRecording = () => {
//     if (mediaRecorderRef.current) {
//       mediaRecorderRef.current.stop();
//       setIsRecording(false);
//     }
//   };

//   return {
//     isRecording,
//     startRecording,
//     stopRecording,
//     audioUrl,
//     audioBlob, // Return the Blob so it can be accessed externally
//   };
// };

// export default useVoiceRecorder;

// const transcribeUrl = async () => {
//   const deepgram = createClient('67bd6546d6471d3edf6f28613a78cbf68b918eea');
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

// -- version-3
// import { useState, useRef } from 'react';

// type UseVoiceRecorderReturnType = {
//   isRecording: boolean;
//   startRecording: () => void;
//   stopRecording: () => void;
//   audioUrl: string | null;
//   transcript: string | null;
// };

// const useVoiceRecorder = (): UseVoiceRecorderReturnType => {
//   const [isRecording, setIsRecording] = useState<boolean>(false);
//   const [audioUrl, setAudioUrl] = useState<string | null>(null);
//   const [transcript, setTranscript] = useState<string | null>(null);
//   const mediaRecorderRef = useRef<MediaRecorder | null>(null);
//   const audioChunksRef = useRef<Blob[]>([]);

//   const startRecording = async () => {
//     if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
//       try {
//         const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
//         const mediaRecorder = new MediaRecorder(stream);

//         mediaRecorderRef.current = mediaRecorder;
//         mediaRecorderRef.current.ondataavailable = (event) => {
//           if (event.data.size > 0) {
//             audioChunksRef.current.push(event.data);
//           }
//         };

//         mediaRecorderRef.current.onstop = async () => {
//           const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
//           const audioUrl = URL.createObjectURL(audioBlob);
//           setAudioUrl(audioUrl);
//           audioChunksRef.current = [];

//           // Send the audio to Deepgram for transcription
//           await sendToDeepgram(audioBlob);
//         };

//         mediaRecorder.start();
//         setIsRecording(true);
//       } catch (err) {
//         console.error('Error accessing microphone', err);
//       }
//     } else {
//       console.error('MediaDevices API not supported.');
//     }
//   };

//   const stopRecording = () => {
//     if (mediaRecorderRef.current) {
//       mediaRecorderRef.current.stop();
//       setIsRecording(false);
//     }
//   };

//   const sendToDeepgram = async (audioBlob: Blob) => {
//     const formData = new FormData();
//     formData.append('file', audioBlob, 'recording.wav');
//     console.log('formData', formData);

//     try {
//       const response = await fetch('https://api.deepgram.com/v1/listen', {
//         method: 'POST',
//         headers: {
//           'Authorization': `Token ${process.env.DEEPGRAM_API_KEY}`, // Replace with your Deepgram API key
//           'Content-Type': 'multipart/form-data',
//         },
//         body: formData,
//       });

//       const data = await response.json();
//       console.log('data', data);
//       const parsedData = JSON.parse(data);
//       const { transcript } = parsedData;
//       setTranscript(transcript);
//     } catch (error) {
//       console.error('Error sending audio to Deepgram:', error);
//     }
//   };

//   return {
//     isRecording,
//     startRecording,
//     stopRecording,
//     audioUrl,
//     transcript,
//   };
// };

// export default useVoiceRecorder;

// -- version-4
// import { useState, useEffect, useRef } from 'react';

// type UseVoiceRecorderReturnType = {
//   isRecording: boolean;
//   startRecording: () => void;
//   stopRecording: () => void;
//   audioUrl: string | null;
//   transcript: string | null;
// };

// const useVoiceRecorder = (): UseVoiceRecorderReturnType => {
//   const [isRecording, setIsRecording] = useState<boolean>(false);
//   const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
//   const [audioUrl, setAudioUrl] = useState<string | null>(null);
//   const [transcript, setTranscript] = useState<string | null>(null);
//   const mediaRecorderRef = useRef<MediaRecorder | null>(null);
//   const audioChunksRef = useRef<Blob[]>([]);

//   const startRecording = async () => {
//     if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
//       try {
//         const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
//         const mediaRecorder = new MediaRecorder(stream);

//         mediaRecorderRef.current = mediaRecorder;
//         mediaRecorderRef.current.ondataavailable = (event) => {
//           if (event.data.size > 0) {
//             audioChunksRef.current.push(event.data);
//           }
//         };

//         mediaRecorderRef.current.onstop = () => {
//           const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
//           setAudioBlob(audioBlob);
//           const audioUrl = URL.createObjectURL(audioBlob);
//           setAudioUrl(audioUrl);
//           audioChunksRef.current = [];
//         };

//         mediaRecorder.start();
//         setIsRecording(true);
//       } catch (err) {
//         console.error('Error accessing microphone', err);
//       }
//     } else {
//       console.error('MediaDevices API not supported.');
//     }
//   };

//   const stopRecording = () => {
//     if (mediaRecorderRef.current) {
//       mediaRecorderRef.current.stop();
//       setIsRecording(false);
//     }
//   };

//   const getTranscriptFromDeepgram = async (audioBlob: Blob) => {
//     const deepgramApiKey = '67bd6546d6471d3edf6f28613a78cbf68b918eea';
//     const formData = new FormData();
//     formData.append('audio', audioBlob, 'recording.wav');
//     console.log('formData', formData);

//     try {
//       const response = await fetch('https://api.deepgram.com/v1/listen', {
//         method: 'POST',
//         headers: {
//           Accept: "application/json",
//           Authorization: `Token ${deepgramApiKey}`,
//           "Content-Type": "audio/wav",
//         },
//         body: formData,
//       });
//       const data = await response.json();
//       console.log('data', data);
//       setTranscript(data.results.channels[0].alternatives[0].transcript);
//     } catch (error) {
//       console.error('Error fetching transcript:', error);
//     }
//   };

//   useEffect(() => {
//     if (audioBlob) {
//       console.log('audioBlob', audioBlob);
//       getTranscriptFromDeepgram(audioBlob);
//       // // Convert the audio URL back to Blob and send to Deepgram
//       // fetch(audioUrl)
//       //   .then((res) => res.blob())
//       //   .then((audioBlob) => {
//       //     console.log('audioBlob', audioBlob);
//       //     getTranscriptFromDeepgram(audioBlob);
//       //   });
//     }
//   }, [audioBlob]);

//   return {
//     isRecording,
//     startRecording,
//     stopRecording,
//     audioUrl,
//     transcript,
//   };
// };

// export default useVoiceRecorder;

// -- version-5
// import { useState, useRef } from 'react';

// type UseVoiceRecorderReturnType = {
//   isRecording: boolean;
//   startRecording: () => void;
//   stopRecording: () => void;
//   audioUrl: string | null;
// };

// const useVoiceRecorder = (): UseVoiceRecorderReturnType => {
//   const [isRecording, setIsRecording] = useState<boolean>(false);
//   const [audioUrl, setAudioUrl] = useState<string | null>(null);
//   const mediaRecorderRef = useRef<MediaRecorder | null>(null);
//   const audioChunksRef = useRef<Blob[]>([]);

//   const startRecording = async () => {
//     if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
//       try {
//         const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
//         const mediaRecorder = new MediaRecorder(stream);

//         mediaRecorderRef.current = mediaRecorder;
//         mediaRecorderRef.current.ondataavailable = (event) => {
//           if (event.data.size > 0) {
//             audioChunksRef.current.push(event.data);
//           }
//         };

//         mediaRecorderRef.current.onstop = () => {
//           const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });

//           // Create a URL for the blob and serve it as /file.wav
//           const fileName = '/file.wav'; // Assuming we'll use this name in the public folder
//           const fileUrl = URL.createObjectURL(audioBlob);

//           // In a real server, you'd upload the blob to the server here.
//           // For now, simulate serving from the /file.wav endpoint.

//           // Save blob as a file accessible from `/file.wav`
//           setAudioUrl(fileUrl);

//           // Clear audio chunks after saving
//           audioChunksRef.current = [];
//         };

//         mediaRecorder.start();
//         setIsRecording(true);
//       } catch (err) {
//         console.error('Error accessing microphone', err);
//       }
//     } else {
//       console.error('MediaDevices API not supported.');
//     }
//   };

//   const stopRecording = () => {
//     if (mediaRecorderRef.current) {
//       mediaRecorderRef.current.stop();
//       setIsRecording(false);
//     }
//   };

//   return {
//     isRecording,
//     startRecording,
//     stopRecording,
//     audioUrl,
//   };
// };

// export default useVoiceRecorder;
