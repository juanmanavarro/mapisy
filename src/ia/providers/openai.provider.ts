import { Injectable } from '@nestjs/common';
import OpenAI from 'openai';
import { JsonHelper } from 'src/chatbot/helpers/json';

@Injectable()
export class OpenaiProvider {
  private api;

  constructor() {
    this.api = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }

  async json(userPrompt, systemPrompt = null, options = {}) {
    const messages = [
      { role: 'user', content: userPrompt },
    ];

    if ( systemPrompt ) {
      messages.unshift({ role: 'system', content: systemPrompt });
    }

    let response = await this.api.chat.completions.create({
      model: 'gpt-4o-mini',
      messages,
      temperature: 0,
      max_tokens: 4096,
      response_format: { type: "json_object" },
      ...options,
    });

    return JsonHelper.extract(response.choices[0].message.content);
  }

  async text(userPrompt, systemPrompt = null, options = {}) {
    const messages = [
      { role: 'user', content: userPrompt },
    ];

    if ( systemPrompt ) {
      messages.unshift({ role: 'system', content: systemPrompt });
    }

    const response = await this.api.chat.completions.create({
      model: 'gpt-4o-mini',
      messages,
      temperature: 0,
      max_tokens: 4096,
      ...options,
    });

    return response.choices[0].message.content;
  }

  async listen(base64audio, options = {}) {
    const file = await OpenAI.toFile(Buffer.from(base64audio, "base64"), 'audio.ogg');
    return await this.api.audio.transcriptions.create({
      file,
      model: 'whisper-1',
      ...options,
    });
  }

  async runAssistant(threadId, text, instructions = null) {
    let thread;
    try {
      thread = await this.api.beta.threads.retrieve(threadId);
    } catch (error) {
      thread = null;
    }

    if ( !thread ) {
      thread = await this.api.beta.threads.create({
        messages: [
          {
            role: "user",
            content: text,
          },
        ],
      });
    } else {
      await this.api.beta.threads.messages.create(
        threadId,
        { role: 'user', content: text }
      );
    }

    const threadMessages = await this.api.beta.threads.messages.list(thread.id);
    console.log(thread.id, threadMessages.data.map(d => d.content));

    const run = await this.api.beta.threads.runs.create(
      thread.id,
      { assistant_id: 'asst_HHpT6zzBogiwUgFR4fyP4YHs', instructions }
    );
    let runStatus = null
    do {
      runStatus = await this.api.beta.threads.runs.retrieve(
        thread.id,
        run.id
      );
    } while (runStatus.status !== 'completed');

    const { data: messages } = await this.api.beta.threads.messages.list(thread.id);
    if ( !messages.length || messages[0].role !== 'assistant' ) {
      return {
        // created_at: message.created_at,
        role: 'assistant',
        content: 'Ha habido algún error',
      };
    }

    const response = JSON.parse(messages[0].content[0].text.value);

    return {
      response,
      thread,
    }
  }

  async watchToJson(image, prompt) {
    return await this.api.chat.completions.create({
      model: "gpt-4o-mini",
      response_format: { type: "json_object" },
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: prompt },
            {
              type: "image_url",
              image_url: {
                "url": image,
              },
            },
          ],
        },
      ],
    });
  }
}
