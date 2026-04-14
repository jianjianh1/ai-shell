export type DataReader = (writer: (data: string) => void) => Promise<string>;

export interface Provider {
  getScriptAndInfo(prompt: string): Promise<{
    readScript: DataReader;
    readInfo: DataReader;
  }>;

  getExplanation(script: string): Promise<{
    readExplanation: DataReader;
  }>;

  getRevision(prompt: string, code: string): Promise<{
    readScript: DataReader;
  }>;

  generateChat(
    messages: Array<{ role: string; content: string }>
  ): Promise<{
    readResponse: DataReader;
  }>;
}
