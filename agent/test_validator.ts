import { validateCode } from "./validator";

const validCode = `
import React from 'react';
export default function Test() {
  return <div>Hello World</div>;
}
`;

const invalidCode = `
import React from 'react';
export default function Test() {
  return <div>Hello World</div>
// Missing closing brace
`;

console.log("--- Testing Valid Code ---");
const result1 = validateCode("test.tsx", validCode);
console.log("Result:", result1);

console.log("\n--- Testing Invalid Code ---");
const result2 = validateCode("test.tsx", invalidCode);
console.log("Result:", result2);

if (result1.isValid && !result2.isValid) {
  console.log("\n✅ Validator working as expected!");
} else {
  console.log("\n❌ Validator test failed!");
  process.exit(1);
}
