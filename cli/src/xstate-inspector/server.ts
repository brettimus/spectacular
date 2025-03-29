import { Hono } from 'hono';
import { serve } from '@hono/node-server';
import { WebSocket, WebSocketServer } from 'ws';
import open from 'open';

// This is the port the WebSocket server will run on
const PORT = 8080;
const WS_PATH = '/';

// Create a Hono app
const app = new Hono();

// Store active WebSocket connections
const clients: Set<WebSocket> = new Set();

// Serve the HTML page with iframe
app.get('/', (c) => {
  return c.html(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>XState Inspector</title>
      <style>
        body, html { 
          margin: 0; 
          padding: 0; 
          height: 100%; 
          overflow: hidden;
        }
        iframe {
          width: 100%;
          height: 100%;
          border: 0;
        }
        #log {
          position: fixed;
          bottom: 0;
          left: 0;
          right: 0;
          height: 150px;
          background: rgba(0,0,0,0.8);
          color: white;
          font-family: monospace;
          padding: 10px;
          overflow-y: auto;
          z-index: 1000;
          display: none;
        }
      </style>
    </head>
    <body>
      <div id="log"></div>
      <iframe src="https://stately.ai/inspect" allow="clipboard-write"></iframe>
      <script>
        const log = document.getElementById('log');
        function logMessage(msg) {
          if (typeof msg === 'object') {
            msg = JSON.stringify(msg, null, 2);
          }
          const div = document.createElement('div');
          div.textContent = msg;
          log.appendChild(div);
          log.scrollTop = log.scrollHeight;
        }
        
        // Debug key - press Ctrl+D to show debug log
        document.addEventListener('keydown', (e) => {
          if (e.key === 'd' && e.ctrlKey) {
            log.style.display = log.style.display === 'none' ? 'block' : 'none';
          }
        });
        
        // Function to check if an event is from XState
        function isXStateEvent(event) {
          return event && 
            (event.type && (
              event.type.startsWith('@xstate') || 
              event.type === '@statelyai.connected' ||
              event.type === '@statelyai.disconnected'
            )) ||
            (event._version && event._version.startsWith('1')); // XState event version
        }
        
        // Setup WebSocket connection
        const ws = new WebSocket('ws://localhost:${PORT}${WS_PATH}');
        
        ws.onopen = () => {
          logMessage('WebSocket connection established');
          
          // Send a special message to the iframe to get the connection started
          const iframe = document.querySelector('iframe');
          if (iframe && iframe.contentWindow) {
            // We need to send a message to trigger a response from the iframe
            iframe.contentWindow.postMessage({ type: '@statelyai.inspector.init' }, '*');
          }
        };
        
        // Forward messages from the CLI to the inspector iframe
        ws.onmessage = (event) => {
          try {
            const message = event.data;
            const parsedMessage = JSON.parse(message);
            
            // Only forward XState events
            if (isXStateEvent(parsedMessage)) {
              logMessage(\`From CLI: \${JSON.stringify(parsedMessage, null, 2)}\`);
              
              const iframe = document.querySelector('iframe');
              if (iframe && iframe.contentWindow) {
                iframe.contentWindow.postMessage(parsedMessage, '*');
              }
            }
          } catch (error) {
            logMessage(\`Error handling message: \${error.message}\`);
          }
        };

        // Setup message listener for the iframe
        window.addEventListener('message', (event) => {
          try {
            // Only process and forward XState-related events
            if (isXStateEvent(event.data)) {
              logMessage(\`From iframe: \${JSON.stringify(event.data, null, 2)}\`);
              
              // Forward the connection event specifically
              if (event.data && event.data.type === '@statelyai.connected') {
                logMessage('CONNECTION EVENT RECEIVED! Forwarding to CLI...');
              }
              
              if (ws.readyState === WebSocket.OPEN) {
                ws.send(JSON.stringify(event.data));
              }
            }
          } catch (error) {
            logMessage(\`Error forwarding message: \${error.message}\`);
          }
        });
      </script>
    </body>
    </html>
  `);
});

// Create a WebSocket server
const wss = new WebSocketServer({ noServer: true });

// Function to check if an event is from XState
function isXStateEvent(data) {
  try {
    const event = typeof data === 'string' ? JSON.parse(data) : data;
    return event && 
      (event.type && (
        event.type.startsWith('@xstate') || 
        event.type === '@statelyai.connected' ||
        event.type === '@statelyai.disconnected'
      )) ||
      (event._version && event._version.startsWith('1')); // XState event version
  } catch (e) {
    return false;
  }
}

// Handle WebSocket connections
wss.on('connection', (ws) => {
  console.log('Client connected');
  clients.add(ws);

  // Forward messages to all connected browser clients
  ws.on('message', (message) => {
    // Only log and forward XState events
    if (isXStateEvent(message.toString())) {
      console.log(`Received XState message: ${message.toString().substring(0, 100)}...`);
      
      // Forward to all other clients
      for (const client of clients) {
        if (client !== ws && client.readyState === WebSocket.OPEN) {
          client.send(message.toString());
        }
      }
    }
  });

  // Handle client disconnection
  ws.on('close', () => {
    console.log('Client disconnected');
    clients.delete(ws);
  });
});

// Export a function to start the server
export function startInspectorServer() {
  const server = serve({ fetch: app.fetch, port: PORT });
  
  // Handle WebSocket upgrades
  server.addListener('upgrade', (request, socket, head) => {
    // Handle all upgrade requests
    wss.handleUpgrade(request, socket, head, (ws) => {
      wss.emit('connection', ws, request);
    });
  });

  console.log(`🔍 XState Inspector server started at http://localhost:${PORT}`);
  
  // Open the browser automatically
  open(`http://localhost:${PORT}`);
  
  return server;
}

// If this file is run directly, start the server
if (import.meta.url === import.meta.resolve(process.argv[1])) {
  startInspectorServer();
} 