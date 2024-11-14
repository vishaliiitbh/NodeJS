const express = require('express');
const fs = require('fs');
const cluster = require('cluster');
const os = require('os');

const app = express();
app.use(express.json());

const userQueues = new Map();
const userLastExecutionTime = new Map();
const userMinuteCounter = new Map();


async function task(user_id) {
    const timestamp = Date.now();
    const logEntry = `${user_id}-task completed at-${timestamp}\n`;
    fs.appendFileSync('task_log.txt', logEntry);
    console.log(logEntry.trim());
}

async function processUserQueue(userId) {
    const queue = userQueues.get(userId);
    if (!queue || queue.length === 0) return;

    const now = Date.now();
    const lastExecution = userLastExecutionTime.get(userId) || 0;
    const minuteCounter = userMinuteCounter.get(userId) || new Map();

    for (const [timestamp] of minuteCounter) {
        if (now - timestamp > 60000) {
            minuteCounter.delete(timestamp);
        }
    }

    if (now - lastExecution >= 1000 && minuteCounter.size < 20) {     
        
        await task(userId);
        userLastExecutionTime.set(userId, now);
        minuteCounter.set(now, true);
        userMinuteCounter.set(userId, minuteCounter);
        queue.shift();
        if (queue.length > 0) {
            setTimeout(() => processUserQueue(userId), 1000);
        }
    } 
    else {
        setTimeout(() => processUserQueue(userId), 100);
    }
}

app.post('/tasks', async (req, res) => {
    const userId = req.body.user_id;
    if (!userId) {
        return res.status(400).json({ error: 'user_id is required' });
    }

    if (!userQueues.has(userId)) {
        userQueues.set(userId, []);
    }

    const queue = userQueues.get(userId);
    queue.push(Date.now());

    if (queue.length === 1) {
        processUserQueue(userId);
    }

    res.status(202).json({ 
        message: 'Task accepted',
        queuePosition: queue.length - 1
    });
});


if (cluster.isMaster) {
    const numCPUs = 2; 
    console.log(`Master cluster setting up ${numCPUs} workers...`);

    for (let i = 0; i < numCPUs; i++) {
        cluster.fork();
    }

    cluster.on('exit', (worker, code, signal) => {
        console.log(`Worker ${worker.process.pid} died. Starting a new worker...`);
        cluster.fork();
    });
} 
else {
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
        console.log(`Worker ${process.pid} started on port ${PORT}`);
    });
}

process.on('SIGTERM', () => {
    console.log('Received SIGTERM. Performing graceful shutdown...');
    process.exit(0);
});