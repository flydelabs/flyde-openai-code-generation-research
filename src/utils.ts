import { Configuration, OpenAIApi } from "openai";

export async function promptGpt(system: string, prompt: string) {
  const configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
  });
  const openai = new OpenAIApi(configuration);

  const completion = await openai.createChatCompletion(
    {
      model: "gpt-3.5-turbo",
      temperature: 0,
      messages: [
        { role: "system", content: system },
        { role: "user", content: prompt },
      ],
    },
    { timeout: 30000 }
  );

  return {
    content: completion.data.choices[0].message?.content,
    usage: completion.data.usage?.total_tokens,
  };
}

export function chunkArray<T>(arr: T[], chunkSize: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < arr.length; i += chunkSize) {
    chunks.push(arr.slice(i, i + chunkSize));
  }
  return chunks;
}

export interface BatchProcessorConfig<T, R> {
  items: T[];
  processItem: (item: T) => Promise<R>;
  batchSize?: number;
  onItemStart?: (item: T) => void;
  onCompleteItem?: (item: T, result: R) => void;
  onErrorItem?: (item: T, error: unknown) => void;
}

export async function batchProcessor<T, R>({
  items,
  batchSize,
  onItemStart,
  onCompleteItem,
  onErrorItem,
  processItem,
}: BatchProcessorConfig<T, R>) {
  const chunks = chunkArray(items, batchSize ?? 4);
  for (const chunk of chunks) {
    await Promise.all(
      chunk.map(async (item) => {
        try {
          onItemStart?.(item);
          const result = await processItem(item);
          onCompleteItem?.(item, result);
        } catch (error) {
          onErrorItem?.(item, error);
        }
      })
    );
  }
}
