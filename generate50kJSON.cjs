// Script to generate a 50,000-line JSON file for stress testing
// This creates realistic, deeply nested data structures

const fs = require('fs');

function generateLargeJSON(targetLines) {
    const result = {
        metadata: {
            version: "2.0.0",
            generated: new Date().toISOString(),
            description: "Large test dataset - 50k lines for JSON Tree Visualizer performance testing",
            estimatedLines: targetLines
        },
        users: [],
        products: [],
        orders: [],
        analytics: {
            dailyStats: [],
            monthlyReports: [],
            realTimeMetrics: {}
        },
        configurations: {},
        logs: []
    };

    // Calculate distribution
    const numRecords = Math.floor(targetLines / 100); // ~100 lines per record group

    // Generate users with nested preferences
    for (let i = 0; i < numRecords; i++) {
        result.users.push({
            id: `user_${i}`,
            username: `user${i}`,
            email: `user${i}@example.com`,
            profile: {
                firstName: `FirstName${i}`,
                lastName: `LastName${i}`,
                age: 20 + (i % 50),
                dateOfBirth: new Date(1970 + (i % 50), i % 12, (i % 28) + 1).toISOString(),
                avatar: `https://example.com/avatars/${i}.jpg`,
                bio: `This is a biographical description for user ${i}. They are interested in various topics and activities.`
            },
            settings: {
                theme: i % 2 === 0 ? 'dark' : 'light',
                language: ['en', 'es', 'fr', 'de', 'ja'][i % 5],
                timezone: `UTC${(i % 24) - 12}`,
                notifications: {
                    email: i % 2 === 0,
                    push: i % 3 === 0,
                    sms: i % 5 === 0,
                    preferences: {
                        marketing: i % 4 === 0,
                        updates: true,
                        newsletter: i % 3 === 0
                    }
                },
                privacy: {
                    profileVisibility: ['public', 'friends', 'private'][i % 3],
                    showEmail: i % 2 === 0,
                    showPhone: i % 4 === 0,
                    allowMessages: i % 3 !== 0
                }
            },
            status: {
                active: i % 2 === 0,
                verified: i % 3 === 0,
                premium: i % 5 === 0,
                lastLogin: new Date(2024, 10, (i % 30) + 1).toISOString(),
                loginCount: 10 + (i % 1000),
                accountCreated: new Date(2020 + (i % 5), i % 12, 1).toISOString()
            },
            roles: i % 10 === 0 ? ['admin', 'moderator', 'user'] : ['user'],
            permissions: {
                canPost: true,
                canComment: i % 2 === 0,
                canModerate: i % 10 === 0,
                canAdmin: i % 50 === 0
            }
        });
    }

    // Generate products with detailed specifications
    for (let i = 0; i < numRecords; i++) {
        result.products.push({
            id: `prod_${i}`,
            sku: `SKU-${1000 + i}`,
            name: `Product ${i}`,
            description: `Detailed description for product ${i}. This product offers exceptional quality and value.`,
            category: {
                primary: ['electronics', 'clothing', 'food', 'books', 'toys', 'home'][i % 6],
                secondary: ['accessories', 'components', 'seasonal', 'bestseller'][i % 4],
                tags: [`tag${i % 10}`, `tag${i % 20}`, `category${i % 15}`]
            },
            pricing: {
                basePrice: (10 + (i % 990)).toFixed(2),
                currency: 'USD',
                discount: i % 5 === 0 ? {
                    percentage: (5 + (i % 45)),
                    validUntil: new Date(2025, 11, 31).toISOString()
                } : null,
                tax: {
                    rate: 0.08,
                    included: i % 2 === 0
                }
            },
            inventory: {
                inStock: i % 3 !== 0,
                quantity: 10 + (i % 500),
                warehouse: `WH-${i % 10}`,
                reserved: i % 7,
                reorderLevel: 20,
                reorderQuantity: 100
            },
            ratings: {
                average: (3 + (i % 3)).toFixed(1),
                count: 10 + (i % 500),
                distribution: {
                    5: 10 + (i % 50),
                    4: 5 + (i % 30),
                    3: 2 + (i % 20),
                    2: (i % 10),
                    1: (i % 5)
                }
            },
            specifications: {
                dimensions: {
                    length: 10 + (i % 50),
                    width: 5 + (i % 30),
                    height: 3 + (i % 20),
                    unit: 'cm'
                },
                weight: {
                    value: 100 + (i % 500),
                    unit: 'g'
                },
                material: ['plastic', 'metal', 'wood', 'fabric', 'glass'][i % 5],
                color: ['red', 'blue', 'green', 'black', 'white', 'multicolor'][i % 6]
            }
        });
    }

    // Generate orders with line items
    for (let i = 0; i < numRecords; i++) {
        result.orders.push({
            id: `order_${i}`,
            orderNumber: `ORD-${100000 + i}`,
            customer: {
                userId: `user_${i % (numRecords / 2)}`,
                email: `user${i % (numRecords / 2)}@example.com`,
                shippingAddress: {
                    street: `${100 + i} Main St`,
                    city: ['New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix'][i % 5],
                    state: ['NY', 'CA', 'IL', 'TX', 'AZ'][i % 5],
                    zipCode: `${10000 + (i % 90000)}`,
                    country: 'USA'
                },
                billingAddress: {
                    street: `${100 + i} Main St`,
                    city: ['New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix'][i % 5],
                    state: ['NY', 'CA', 'IL', 'TX', 'AZ'][i % 5],
                    zipCode: `${10000 + (i % 90000)}`,
                    country: 'USA'
                }
            },
            items: [
                {
                    productId: `prod_${i % numRecords}`,
                    quantity: 1 + (i % 5),
                    unitPrice: (10 + (i % 100)).toFixed(2),
                    subtotal: ((1 + (i % 5)) * (10 + (i % 100))).toFixed(2)
                },
                {
                    productId: `prod_${(i + 1) % numRecords}`,
                    quantity: 1 + (i % 3),
                    unitPrice: (15 + (i % 80)).toFixed(2),
                    subtotal: ((1 + (i % 3)) * (15 + (i % 80))).toFixed(2)
                }
            ],
            pricing: {
                subtotal: (50 + (i % 450)).toFixed(2),
                tax: (4 + (i % 36)).toFixed(2),
                shipping: (5 + (i % 15)).toFixed(2),
                total: (59 + (i % 501)).toFixed(2),
                currency: 'USD'
            },
            payment: {
                method: ['credit_card', 'paypal', 'crypto', 'bank_transfer'][i % 4],
                status: ['pending', 'completed', 'failed', 'refunded'][i % 4],
                transactionId: `txn_${i}`,
                processedAt: new Date(2024, 10, (i % 30) + 1).toISOString()
            },
            shipping: {
                carrier: ['FedEx', 'UPS', 'USPS', 'DHL'][i % 4],
                trackingNumber: `TRK${100000000 + i}`,
                estimatedDelivery: new Date(2024, 11, (i % 28) + 1).toISOString(),
                status: ['processing', 'shipped', 'in_transit', 'delivered'][i % 4]
            },
            status: {
                current: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'][i % 5],
                history: [
                    {
                        status: 'pending',
                        timestamp: new Date(2024, 10, (i % 30) + 1, 10, 0).toISOString()
                    },
                    {
                        status: 'processing',
                        timestamp: new Date(2024, 10, (i % 30) + 1, 12, 0).toISOString()
                    }
                ]
            },
            createdAt: new Date(2024, 10, (i % 30) + 1).toISOString(),
            updatedAt: new Date(2024, 10, (i % 30) + 1, 15, 0).toISOString()
        });
    }

    // Generate analytics data
    for (let i = 0; i < Math.floor(numRecords / 2); i++) {
        result.analytics.dailyStats.push({
            date: new Date(2024, 10, (i % 30) + 1).toISOString().split('T')[0],
            metrics: {
                visitors: {
                    total: 1000 + (i % 5000),
                    unique: 500 + (i % 2500),
                    returning: 200 + (i % 1000)
                },
                pageViews: 5000 + (i % 20000),
                bounceRate: (30 + (i % 40)).toFixed(2),
                avgSessionDuration: 180 + (i % 300),
                conversions: {
                    total: 10 + (i % 100),
                    rate: (1 + (i % 5)).toFixed(2),
                    revenue: (100 + (i % 10000)).toFixed(2)
                },
                topPages: [
                    { url: '/home', views: 1000 + (i % 1000) },
                    { url: '/products', views: 800 + (i % 800) },
                    { url: '/about', views: 300 + (i % 300) }
                ]
            }
        });
    }

    // Generate configuration settings
    result.configurations = {
        application: {
            name: "JSON Tree Visualizer Test App",
            version: "1.0.0",
            environment: "production",
            features: {
                authentication: { enabled: true, providers: ['oauth', 'saml', 'local'] },
                payments: { enabled: true, gateways: ['stripe', 'paypal', 'square'] },
                notifications: { enabled: true, channels: ['email', 'sms', 'push'] },
                analytics: { enabled: true, provider: 'google-analytics' }
            },
            limits: {
                maxUploadSize: 10485760,
                maxRequestsPerMinute: 1000,
                maxConcurrentUsers: 10000,
                sessionTimeout: 3600
            }
        },
        database: {
            host: "localhost",
            port: 5432,
            name: "test_db",
            pool: {
                min: 2,
                max: 10,
                idle: 10000
            }
        },
        cache: {
            type: "redis",
            host: "localhost",
            port: 6379,
            ttl: 3600
        },
        security: {
            cors: {
                enabled: true,
                origins: ['https://example.com', 'https://app.example.com'],
                methods: ['GET', 'POST', 'PUT', 'DELETE'],
                credentials: true
            },
            rateLimit: {
                enabled: true,
                maxRequests: 100,
                windowMs: 60000
            }
        }
    };

    // Generate logs
    for (let i = 0; i < Math.floor(numRecords / 2); i++) {
        result.logs.push({
            id: `log_${i}`,
            timestamp: new Date(2024, 10, (i % 30) + 1, (i % 24), (i % 60), (i % 60)).toISOString(),
            level: ['debug', 'info', 'warn', 'error', 'critical'][i % 5],
            message: `Log entry ${i}: Application event occurred`,
            context: {
                service: `service_${i % 10}`,
                method: ['GET', 'POST', 'PUT', 'DELETE'][i % 4],
                endpoint: [`/api/users/${i}`, `/api/products/${i}`, `/api/orders/${i}`][i % 3],
                statusCode: i % 7 === 0 ? 500 : (i % 5 === 0 ? 404 : 200),
                responseTime: 10 + (i % 990),
                userId: i % 3 === 0 ? `user_${i % (numRecords / 2)}` : null
            },
            metadata: {
                requestId: `req_${i}`,
                sessionId: `sess_${i % 100}`,
                ipAddress: `192.168.${(i % 255)}.${(i % 255)}`,
                userAgent: 'Mozilla/5.0 (compatible; TestBot/1.0)',
                tags: [`env:prod`, `service:${i % 10}`]
            }
        });
    }

    return result;
}

// Generate and save
console.log('Generating 50k-line JSON file...');
const targetLines = 50000;
const data = generateLargeJSON(targetLines);
const jsonString = JSON.stringify(data, null, 2);
const actualLines = jsonString.split('\n').length;

console.log(`Generated JSON with ${actualLines.toLocaleString()} lines`);
console.log(`File size: ${(jsonString.length / 1024 / 1024).toFixed(2)} MB`);
console.log(`Objects created: ${data.users.length} users, ${data.products.length} products, ${data.orders.length} orders`);

fs.writeFileSync('testData50k.json', jsonString);
console.log('File saved as testData50k.json');
