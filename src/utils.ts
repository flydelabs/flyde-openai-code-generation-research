import { openai } from "./utils/open-ai";

export async function promptGpt(system: string, prompt: string) {
  const completion = await openai.createChatCompletion(
    {
      model: "gpt-3.5-turbo",
      temperature: 0,
      messages: [
        { role: "system", content: system },
        { role: "user", content: prompt },
      ],
    },
    { timeout: 45000 }
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

export async function withRetries<T>(fn: () => Promise<T>) {
  for (let i = 0; i < 3; i++) {
    try {
      return await fn();
    } catch (e) {
      console.log("Retrying", e);
    }
  }
  throw new Error("Failed after 3 retries");
}

export function calcAverage(arr: number[]) {
  return arr.reduce((a, b) => a + b, 0) / arr.length;
}

export function calcPercentile(arr: number[], percentile: number) {
  const sorted = arr.sort((a, b) => a - b);
  const index = Math.ceil((percentile / 100) * sorted.length);
  return sorted[index];
}

export function toCsv(data: string[][]) {
  return data
    .map((row) => row.map((c) => c.replace(/,/g, " ")).join(","))
    .join("\n");
}
