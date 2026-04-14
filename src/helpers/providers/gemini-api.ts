import { Provider, DataReader } from './types';
import {
  getFullPrompt,
  getExplanationPrompt,
  getRevisionPrompt,
} from '../prompts';
import { KnownError } from '../error';

const API_BASE = 'https://generativelanguage.googleapis.com/v1beta/models';

function makeReader(text: string): DataReader {
  return (writer) => {
    writer(text);
    return Promise.resolve(text);
  };
}

function emptyReader(): DataReader {
  return () => Promise.resolve('');
}

function extractCommand(text: string): string {
  const match = text.match(/```(?:\w*)\n([\s\S]*?)```/);
  return match ? match[1].trim() : text.trim();
}

export class GeminiApiProvider implements Provider {
  private apiKey: string;
  private model: string;

  constructor(apiKey: string, model?: string) {
    if (!apiKey) {
      throw new KnownError(
        'Please set your Gemini API key via `ai config set GEMINI_API_KEY=<your key>`'
      );
    }
    this.apiKey = apiKey;
    this.model = model || 'gemini-2.5-flash';
  }

  private async generate(prompt: string): Promise<string> {
    const url = `${API_BASE}/${this.model}:generateContent?key=${this.apiKey}`;
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
      }),
    });

    if (!res.ok) {
      const body = await res.text();
      throw new KnownError(
        `Gemini API error ${res.status}: ${body}`
      );
    }

    const data = await res.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
  }

  async getScriptAndInfo(prompt: string) {
    const output = await this.generate(getFullPrompt(prompt));
    const command = extractCommand(output);
    return {
      readScript: makeReader(command),
      readInfo: emptyReader(),
    };
  }

  async getExplanation(script: string) {
    const output = await this.generate(getExplanationPrompt(script));
    return { readExplanation: makeReader(output.trim()) };
  }

  async getRevision(prompt: string, code: string) {
    const output = await this.generate(getRevisionPrompt(prompt, code));
    const command = extractCommand(output);
    return {
      readScript: makeReader(command),
      readInfo: emptyReader(),
    };
  }

  async generateChat(messages: Array<{ role: string; content: string }>) {
    const contents = messages.map((m) => ({
      role: m.role === 'user' ? 'user' : 'model',
      parts: [{ text: m.content }],
    }));
    const url = `${API_BASE}/${this.model}:generateContent?key=${this.apiKey}`;
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents }),
    });

    if (!res.ok) {
      const body = await res.text();
      throw new KnownError(`Gemini API error ${res.status}: ${body}`);
    }

    const data = await res.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
    return { readResponse: makeReader(text.trim()) };
  }
}
