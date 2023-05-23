# Flyde - OpenAI Benchmark Process

This project contains code used to benchmark various approaches of code generation for Flyde.

Read the blog post here - [ TODO LINK ]

Learn more about Flyde: https://www.flyde.dev

## Running

### Install dependencies

`pnpm install`

### Generate Part Versions

In order to conform to OpenAI's recommendation of at least 500 items in the training data set, several versions of a prompt for each code part are generated. Along with an additional version for the code part's function.

`pnpm run generate:versions`
Note: requires an OpenAPI key on `OPEN_AI_KEY`

### Preparing the dataset

This process aggregates all the generated versions into a single JSON that is later passed to the OpenAI CLI helper tool - https://platform.openai.com/docs/guides/fine-tuning/cli-data-preparation-tool

`pnpm run prepare:dataset`

### Train

`OPENAI_API_KEY=[key] openai api fine_tunes.create -t dataset_prepared.jsonl -m babbage`
