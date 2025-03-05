import { useState, useEffect, useCallback } from "react";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Textarea } from "../components/ui/textarea";
import { API_BASE_URL } from "../config";
import { Chat } from "./Chat";

interface Conversation {
  id: number;
  projectId: number;
  question: string;
  answer: string;
  context?: string;
  createdAt: string;
}

interface ConversationsPanelProps {
  projectId: number;
}

export function ConversationsPanel({ projectId }: ConversationsPanelProps) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    question: "",
    answer: "",
    context: "",
  });

  const fetchConversations = useCallback(async () => {
    if (!projectId) return;
    
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/api/conversations/project/${projectId}`);
      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }
      const data = await response.json() as Conversation[];
      setConversations(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch conversations");
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE_URL}/api/conversations`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          projectId,
          question: formData.question,
          answer: formData.answer,
          context: formData.context || undefined,
        }),
      });

      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }

      // Reset form and refresh conversations
      setFormData({
        question: "",
        answer: "",
        context: "",
      });
      fetchConversations();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save conversation");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this message?")) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`${API_BASE_URL}/api/conversations/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }

      fetchConversations();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete message");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Chat</CardTitle>
        </CardHeader>
        <CardContent>
          <Chat />
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Conversation Thread</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 mb-6">
            {loading && <p>Loading conversations...</p>}
            {!loading && conversations.length === 0 && (
              <p>No messages yet. Start the conversation below.</p>
            )}
            
            {conversations.map((conversation) => (
              <Card key={conversation.id} className="overflow-hidden">
                <CardContent className="p-4">
                  <div className="flex justify-between items-start">
                    <div className="w-full">
                      <div className="flex justify-between">
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {new Date(conversation.createdAt).toLocaleString()}
                        </p>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => handleDelete(conversation.id)}
                          className="h-6 w-6 p-0"
                        >
                          ✕
                        </Button>
                      </div>
                      <div className="mt-2 space-y-3">
                        <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded-lg">
                          <p className="font-medium">Question:</p>
                          <p>{conversation.question}</p>
                        </div>
                        <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded-lg">
                          <p className="font-medium">Answer:</p>
                          <p>{conversation.answer}</p>
                        </div>
                        {conversation.context && (
                          <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded-lg">
                            <p className="font-medium">Context:</p>
                            <p>{conversation.context}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="question" className="text-sm font-medium">Question</label>
              <Textarea
                id="question"
                name="question"
                value={formData.question}
                onChange={handleInputChange}
                required
                rows={3}
                placeholder="What would you like to ask about this project?"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="answer" className="text-sm font-medium">Answer</label>
              <Textarea
                id="answer"
                name="answer"
                value={formData.answer}
                onChange={handleInputChange}
                required
                rows={3}
                placeholder="Provide an answer to the question"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="context" className="text-sm font-medium">Context (Optional)</label>
              <Textarea
                id="context"
                name="context"
                value={formData.context}
                onChange={handleInputChange}
                rows={3}
                placeholder="Any additional context for this conversation"
              />
            </div>
            <Button type="submit" disabled={loading}>
              Add to Conversation
            </Button>
          </form>
          {error && <p className="text-red-500 mt-4">{error}</p>}
        </CardContent>
      </Card>
    </div>
  );
} 