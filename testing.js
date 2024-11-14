const axios = require('axios');

const API_URL = 'http://localhost:3000/tasks';
const NUM_USERS = 2;
const REQUESTS_PER_USER = 25;

async function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function sendRequest(userId) {
    try {
        const response = await axios.post(API_URL, {
            user_id: userId.toString()
        });
        console.log(`Request accepted for User ${userId} - Queue position: ${response.data.queuePosition}`);
        return response;
    } catch (error) {
        console.error(`Error for User ${userId}:`, error.message);
        return null;
    }
}

async function runTest() {
    console.log('Starting test...');

    for (let userId = 1; userId <= NUM_USERS; userId++) {
        console.log(`Starting requests for User ${userId}`);
        
        for (let i = 0; i < REQUESTS_PER_USER; i++) {
            await sendRequest(userId);
            await sleep(100);
        }
    }

    console.log('\nAll requests sent. Waiting for tasks to complete...');
    await sleep(30000);
}

console.log('Test starting...');
runTest().then(() => {
    console.log('Test completed. Check task_log.txt for results.');
}).catch(console.error);