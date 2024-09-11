'use client';
import { readStreamableValue } from 'ai/rsc';
import { Mic } from 'lucide-react';
import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';
import { continueConversation } from './action';
import useVoiceRecorder from './lib/hooks';
import { EnterIcon, LoadingIcon } from './lib/icons';
import { cn } from './lib/utils';

type Message = {
  role: 'user' | 'assistant';
  content: string;
  latency?: number;
  audioUrl?: string;
};

export const maxDuration = 60;

export default function Home() {
  const [input, setInput] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState<number | null>(null);
  const [isPending, setIsPending] = useState(false);
  const [conversation, setConversation] = useState<Message[]>([]);
  const {
    isRecording,
    startRecording,
    stopRecording,
    transcript,
    transcriptSet,
  } = useVoiceRecorder();

  useEffect(() => {
    function keyDown(e: KeyboardEvent) {
      if (e.key === 'Enter') {
        e.preventDefault();
        handleFormSubmit();
      }
      if (e.key === 'Escape') {
        setInput('');
      }
    }

    window.addEventListener('keydown', keyDown);
    return () => window.removeEventListener('keydown', keyDown);
  }, [handleFormSubmit, setInput]);

  async function handleFormSubmit() {
    setIsPending(true);
    const { messages, newMessage } = await continueConversation([
      ...conversation,
      { role: 'user', content: input },
    ]);

    let textContent = '';

    for await (const delta of readStreamableValue(newMessage)) {
      textContent = `${textContent}${delta}`;

      setConversation([
        ...messages,
        { role: 'assistant', content: textContent },
      ]);
    }
    setInput('');
    const audio = await getElevenLabsResponse(textContent);
    const audioUrl = URL.createObjectURL(audio);
    setConversation((prevMessages) =>
      prevMessages.map((msg, i) =>
        i === prevMessages.length - 1 ? { ...msg, audioUrl } : msg
      )
    );
    setIsPending(false);
  }

  const getElevenLabsResponse = async (text: string) => {
    const response = await fetch('/api/speech', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        apiKey: process.env.ELEVENLABS_API_KEY,
        message: text,
      }),
    });

    const data = await response.blob();
    return data;
  };

  const handlePlay = (index: number) => {
    if (conversation[index]?.audioUrl && audioRef.current) {
      audioRef.current.src = conversation[index].audioUrl!;
      audioRef.current.play();
      setIsPlaying(index);

      audioRef.current.onended = () => {
        setIsPlaying(null); // Reset state when audio finishes
      };
    }
  };

  const handleRecordingInput = async () => {
    setIsPending(true);
    const { messages, newMessage } = await continueConversation([
      ...conversation,
      { role: 'user', content: transcript as string },
    ]);

    let textContent = '';

    for await (const delta of readStreamableValue(newMessage)) {
      textContent = `${textContent}${delta}`;

      setConversation([
        ...messages,
        { role: 'assistant', content: textContent },
      ]);
    }
    setInput('');
    const audio = await getElevenLabsResponse(textContent);
    const audioUrl = URL.createObjectURL(audio);
    setConversation((prevMessages) =>
      prevMessages.map((msg, i) =>
        i === prevMessages.length - 1 ? { ...msg, audioUrl } : msg
      )
    );
    setIsPending(false);
  };

  useEffect(() => {
    if (isRecording === false && transcriptSet) {
      handleRecordingInput();
    }
  }, [isRecording, transcriptSet]);

  return (
    <>
      <div className="min-h-10 pb-4" />
      <div className="mb-5 w-full max-w-3xl overflow-y-auto">
        {conversation.map((message, index) => (
          <div
            key={index}
            className={cn(
              message.role === 'user'
                ? 'flex justify-end'
                : 'flex justify-start',
              'my-4 flex flex-1 gap-3 text-sm text-gray-600'
            )}>
            <div className="leading-relaxed">
              <span
                className={cn(
                  message.role === 'user' ? 'text-right' : 'text-left',
                  'block text-sm tracking-normal text-white'
                )}>
                {message.role === 'user' ? 'You' : 'Assistant'}
              </span>
              <div
                className={cn(
                  message.role === 'user'
                    ? 'rounded-b-lg rounded-tl-lg'
                    : 'rounded-b-lg rounded-tr-lg',
                  'bg-zinc-200 px-4 py-1.5 font-medium text-black'
                )}>
                {message.content}
              </div>
              {message.role === 'assistant' && message.audioUrl && (
                <div
                  onClick={() => handlePlay(index)}
                  className="mt-2 w-fit cursor-pointer rounded-full bg-white/50 p-1 hover:bg-white">
                  {isPlaying === index && (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="15"
                      height="15"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="black"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="animate-spin">
                      <path d="M12 2v4" />
                      <path d="m16.2 7.8 2.9-2.9" />
                      <path d="M18 12h4" />
                      <path d="m16.2 16.2 2.9 2.9" />
                      <path d="M12 18v4" />
                      <path d="m4.9 19.1 2.9-2.9" />
                      <path d="M2 12h4" />
                      <path d="m4.9 4.9 2.9 2.9" />
                    </svg>
                  )}
                  {isPlaying !== index && (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="15"
                      height="15"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="black"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round">
                      <path d="M11 4.702a.705.705 0 0 0-1.203-.498L6.413 7.587A1.4 1.4 0 0 1 5.416 8H3a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h2.416a1.4 1.4 0 0 1 .997.413l3.383 3.384A.705.705 0 0 0 11 19.298z" />
                      <path d="M16 9a5 5 0 0 1 0 6" />
                      <path d="M19.364 18.364a9 9 0 0 0 0-12.728" />
                    </svg>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
      <div className="flex w-full max-w-3xl items-center gap-2">
        <div className="flex w-full max-w-3xl items-center rounded-full border border-transparent bg-neutral-200/80 focus-within:border-neutral-400 hover:border-neutral-300 hover:focus-within:border-neutral-400 dark:bg-neutral-800/80 dark:focus-within:border-neutral-600 dark:hover:border-neutral-700 dark:hover:focus-within:border-neutral-600">
          <input
            type="text"
            className="w-full bg-transparent p-4 placeholder:text-neutral-600 focus:outline-none dark:placeholder:text-neutral-400"
            required
            placeholder="Ask me anything"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            ref={inputRef}
          />

          <button
            type="submit"
            className="p-4 text-neutral-700 hover:text-black dark:text-neutral-300 dark:hover:text-white"
            disabled={isPending}
            onClick={handleFormSubmit}
            aria-label="Submit">
            {isPending ? <LoadingIcon /> : <EnterIcon />}
          </button>
        </div>
        <button
          onClick={() => {
            if (isRecording) {
              stopRecording();
            } else {
              startRecording();
            }
          }}
          className="flex size-12 items-center justify-center rounded-full bg-white p-2 focus-visible:outline-none">
          {isRecording ? (
            <Image
              src="/audio-wave.gif"
              unoptimized
              quality={100}
              alt="stop"
              width={24}
              height={24}
              className="size-6"
            />
          ) : (
            <Mic color="black" className="size-7" />
          )}
        </button>
      </div>

      <div className="mt-10 min-h-28 max-w-xl space-y-4 text-balance pt-4 text-center text-neutral-400 dark:text-neutral-600">
        {conversation.length === 0 && (
          <p>
            A fast, open-source voice assistant powered by{' '}
            <A href="https://openai.com">OpenAI</A>,{' '}
            <A href="https://elevenlabs.io">Eleven Labs</A>, and{' '}
            <A href="https://vercel.com">Vercel</A>.{' '}
          </p>
        )}
      </div>
      <audio ref={audioRef} controls className="mb-2 hidden" />
    </>
  );
}

function A(props: any) {
  return (
    <a
      {...props}
      className="font-medium text-neutral-500 hover:underline dark:text-neutral-500"
    />
  );
}
