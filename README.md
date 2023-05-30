# Flyde - OpenAI Benchmark Process

This project contains code used to benchmark various approaches of code generation for Flyde.

Read the blog post here - https://medium.com/@gabrielgrinberg/openai-fine-tuning-vs-chat-completion-a-quality-latency-and-costs-comparison-fc58e3ec3ec

Learn more about Flyde: https://www.flyde.dev

Note: while most of the process was automated, some manual steps were required. If you're trying to reproduce the results, please reach out to me and I'll be happy to help.

## Running

### Install dependencies

`pnpm install`

### Scripts

Note: some scripts require a valid and GPT-4 enabled OpenAPI key available on env variable `OPEN_AI_KEY`.

#### pnpm run generate:versions

Generate prompts and an alternate version of the code for each code part.

#### pnpm run prepare:dataset

Writes a JSON file with all the prompts and code parts

#### pnpm run prepare:jsonl

Tranforms the JSON file into a JSONL file that can be used by the OpenAI CLI tool

### pnpm run benchmark:generate

Generates parts based on the benchmark prompts

### pnpm run benchmark:score

Scores the generated parts using GPT-4

### pnpm run benchmark:csv

Generates a CSV file with the results
