// Script to generate a very large JSON file for stress testing
// This creates a JSON with ~2 million lines

const fs = require('fs');

function generateLargeJSON(targetSizeLines) {
  const result = {
    metadata: {
      version: "1.0.0",
      generated: new Date().toISOString(),
      totalRecords: Math.floor(targetSizeLines / 20), // ~20 lines per record
      description: "Large test dataset for JSON Tree Visualizer performance testing"
    },
    users: [],
    products: [],
    transactions: [],
    logs: []
  };

  const numRecords = Math.floor(targetSizeLines / 80); // Distribute across 4 arrays

  // Generate users
  for (let i = 0; i < numRecords; i++) {
    result.users.push({
      id: `user_${i}`,
      name: `User ${i}`,
      email: `user${i}@example.com`,
      age: 20 + (i % 50),
      active: i % 2 === 0,
      roles: ['user', i % 10 === 0 ? 'admin' : 'member'],
      metadata: {
        created: new Date(2020 + (i % 5), i % 12, 1).toISOString(),
        lastLogin: new Date().toISOString(),
        preferences: {
          theme: i % 2 === 0 ? 'dark' : 'light',
          notifications: true,
          language: 'en'
        }
      }
    });
  }

  // Generate products
  for (let i = 0; i < numRecords; i++) {
    result.products.push({
      id: `product_${i}`,
      name: `Product ${i}`,
      description: `Description for product ${i}`,
      price: (10 + (i % 990)).toFixed(2),
      category: ['electronics', 'clothing', 'food', 'books'][i % 4],
      inStock: i % 3 !== 0,
      tags: [`tag${i % 10}`, `tag${i % 20}`, `tag${i % 30}`],
      ratings: {
        average: (3 + (i % 3)).toFixed(1),
        count: 10 + (i % 500)
      }
    });
  }

  // Generate transactions
  for (let i = 0; i < numRecords; i++) {
    result.transactions.push({
      id: `tx_${i}`,
      userId: `user_${i % (numRecords / 2)}`,
      productId: `product_${i % numRecords}`,
      amount: (5 + (i % 495)).toFixed(2),
      status: ['pending', 'completed', 'failed'][i % 3],
      timestamp: new Date(2023, i % 12, (i % 28) + 1).toISOString(),
      paymentMethod: ['credit_card', 'paypal', 'crypto'][i % 3]
    });
  }

  // Generate logs
  for (let i = 0; i < numRecords; i++) {
    result.logs.push({
      id: `log_${i}`,
      level: ['info', 'warn', 'error'][i % 3],
      message: `Log message ${i} - This is a test log entry`,
      timestamp: new Date(2024, 0, 1, (i % 24), (i % 60), (i % 60)).toISOString(),
      source: `service_${i % 10}`,
      metadata: {
        requestId: `req_${i}`,
        userId: `user_${i % (numRecords / 2)}`,
        duration: i % 1000
      }
    });
  }

  return result;
}

// Generate and save
console.log('Generating large JSON file...');
const targetLines = 2000000; // 2 million lines
const data = generateLargeJSON(targetLines);
const jsonString = JSON.stringify(data, null, 2);
const actualLines = jsonString.split('\n').length;

console.log(`Generated JSON with ${actualLines.toLocaleString()} lines`);
console.log(`File size: ${(jsonString.length / 1024 / 1024).toFixed(2)} MB`);

fs.writeFileSync('largeTestData.json', jsonString);
console.log('File saved as largeTestData.json');
