User Task Queuing System with Rate Limiting
A robust Node.js API cluster implementation that handles user tasks with rate limiting and queuing capabilities. This system ensures fair task processing while maintaining rate limits of 1 task per second and 20 tasks per minute per user.
Features
•	Node.js API cluster with two replica sets for high availability
•	Per-user rate limiting (1 task/second, 20 tasks/minute)
•	Task queuing system to handle excess requests
•	Request preservation (no dropped requests)
•	Task completion logging to file
•	Graceful error handling and cluster recovery
•	Comprehensive testing suite
Prerequisites
•	Node.js (v12 or higher)
•	npm (Node Package Manager)
Installation
1.	Clone the repository:
git clone <repository-url>
cd user-task-queuing-system
2.	Install dependencies:
npm install express axios
Project Structure
├── server.js           # Main server implementation
├── test.js            # Test script
├── task_log.txt       # Task execution log file
Configuration
The system can be configured through environment variables:
•	PORT: Server port (default: 3000)
•	Additional configuration can be modified in the server code: 
o	numCPUs: Number of cluster workers (default: 2)
o	Rate limits can be adjusted in the constants at the top of server.js
Usage
1.	Start the server:
node server.js
2.	The API will be available at http://localhost:3000/tasks
3.	Send POST requests with the following structure:
{
    "user_id": "123"
}
4.	Run the test suite:
node test.js
API Endpoints
POST /tasks
Processes a task for a specific user.
Request Body:
{
    "user_id": "string"
}


Response:
{
    "message": "Task accepted",
    "queuePosition": number
}
Status Codes:
•	202: Task accepted (queued or processed)
•	400: Invalid request (missing user_id)
•	500: Server error
Testing
The included test script (test.js) simulates multiple users sending concurrent requests. It helps verify:
•	Rate limiting functionality
•	Queue management
•	Task processing
•	System stability under load
Run the tests:
node test.js
Logging
Task completions are logged to task_log.txt in the following format:
<user_id>-task completed at-<timestamp>
Rate Limiting Details
The system implements two levels of rate limiting:
1.	Per-second limit: Maximum 1 task per second per user
2.	Per-minute limit: Maximum 20 tasks per minute per user
Excess requests are queued and processed when capacity becomes available.
Error Handling
The system includes robust error handling for:
•	Invalid requests
•	Worker crashes (automatic worker respawning)
•	Rate limit exceeded scenarios
•	File system errors

