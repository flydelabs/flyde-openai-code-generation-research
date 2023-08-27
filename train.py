import os
import openai


file = openai.File.create(
  file=open("dataset-cc.jsonl", "rb"),
  purpose='fine-tune'
)

# log to console the file id
print(file.id)

# openai.api_key = os.getenv("OPENAI_API_KEY")
# openai.FineTuningJob.create(training_file="file-abc123", model="gpt-3.5-turbo", suffix="flydev")
