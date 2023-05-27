export const prompts = [
  // from validation - simple
  "Concatenate two inputs",
  "JSON string to object converter",
  "Run SQL query",
  "Get the first element of an array",

  // from validation - complex
  "Debounce a value",
  "Throttle a value",
  "Round robin a value into one of 3 outputs",

  // project specific
  "Receive a list of objects and sum the 'price' property of each",
  "sort an array of objects by the 'age' property",
  "Transform a map of id to objects into an array of objects and remove those without the 'id' property",
  "receive an object, a property name and 3 values. If the value of the property is equal to the first value, output the object to output 1, if it's the second, output to output 2, if it's the third, output to output 3, otherwise, output to 'default' output",
  "receive an item and emit it 5 times, with 200ms delay between each time",

  // external world parts
  "Send an HTTP POST request",
  "parse a csv file without any libraries",
  "return the user's location based on their IP address",
  "receive the url of a website and return the h1 tag of the page if it exists, using a headless browser",
  "send a message to a slack channel",
];
