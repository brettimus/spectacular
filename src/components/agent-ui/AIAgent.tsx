import { useAgent } from "agents-sdk/react";
import { useAgentChat } from "agents-sdk/ai-react";
import { Button } from "../ui/button";

export function ChatInterface() {
  // Connect to the agent
  const agent = useAgent({
    agent: "dialogue-agent",
  });

  // Set up the chat interaction
  const { messages, input, handleInputChange, handleSubmit, clearHistory } =
    useAgentChat({
      agent,
      maxSteps: 5,
    });

  return (
    <div className="chat-interface">
      {/* Message History */}
      <div className="message-flow">
        {messages.map((message) => (
          <div key={message.id} className="message">
            <div className="role">{message.role}</div>
            <div className="content">{message.content}</div>
          </div>
        ))}
      </div>

      {/* Input Area */}
      <form onSubmit={handleSubmit} className="input-area">
        <input
          value={input}
          onChange={handleInputChange}
          placeholder="Type your message..."
          className="message-input"
        />
      </form>

      <Button onClick={clearHistory} className="clear-button">
        Clear Chat
      </Button>
    </div>
  );
}
