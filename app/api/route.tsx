import OpenAI from 'openai';
import { OpenAIStream, StreamingTextResponse } from 'ai';
import { NextResponse } from 'next/server';
 
// Create an OpenAI API client (that's edge friendly!)
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});
 
export const dynamic = 'force-dynamic';
 
export async function POST(req: Request) {
    try {
        
  // 'data' contains the additional data that you have sent:
  const { messages, data } = await req.json();
 
  const initialMessages = messages.slice(0, -1);
  const currentMessage = messages[messages.length - 1];
 
  // Ask OpenAI for a streaming chat completion given the prompt
  const response = await openai.chat.completions.create({
    model: 'gpt-4-vision-preview',
    stream: true,
    max_tokens: 150,
    messages: [
      ...initialMessages,
      {
        ...currentMessage,
        content: [
          { type: 'text', text: currentMessage.content },
 
          // forward the image information to OpenAI:
          {
            type: 'image_url',
            image_url: data.imageUrl,
          },
        ],
      },
    ],
  });
 
  // Convert the response into a friendly text-stream
  const stream = OpenAIStream(response);
  // Respond with the stream
  return new StreamingTextResponse(stream);
    } catch (error) {
        if (error instanceof OpenAI.APIError) {
            const {name, status, headers, message} = error;
            return NextResponse.json({name, status, headers, message},{status});
        } else {
            
        }
    }
}