import { useCallback, useEffect, useState } from "react";
import { Button } from "../components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Textarea } from "../components/ui/textarea";
import { API_BASE_URL } from "../config";

interface Specification {
  id: number;
  projectId: number;
  content: string;
  version: number;
  createdAt: string;
  updatedAt: string;
}

interface SpecificationsPanelProps {
  projectId: number;
}

export function SpecificationsPanel({ projectId }: SpecificationsPanelProps) {
  const [specifications, setSpecifications] = useState<Specification[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    content: "",
  });
  const [latestSpec, setLatestSpec] = useState<Specification | null>(null);

  const fetchSpecifications = useCallback(async () => {
    if (!projectId) {
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/specifications/project/${projectId}`,
      );
      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }
      const data = (await response.json()) as Specification[];
      setSpecifications(data);

      // Set the latest specification (highest version)
      if (data.length > 0) {
        const latest = data.reduce((prev, current) =>
          prev.version > current.version ? prev : current,
        );
        setLatestSpec(latest);
      } else {
        setLatestSpec(null);
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to fetch specifications",
      );
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    fetchSpecifications();
  }, [fetchSpecifications]);

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE_URL}/api/specifications`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          projectId,
          content: formData.content,
        }),
      });

      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }

      // Reset form and refresh specifications
      setFormData({ content: "" });
      fetchSpecifications();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to save specification",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (
      !confirm("Are you sure you want to delete this specification version?")
    ) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE_URL}/api/specifications/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }

      fetchSpecifications();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to delete specification",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleUseLatestAsTemplate = () => {
    if (latestSpec) {
      setFormData({ content: latestSpec.content });
    }
  };

  return (
    <div className="space-y-6">
      {/* Latest Specification */}
      {latestSpec && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle>Current Specification (v{latestSpec.version})</CardTitle>
            <div className="text-sm text-gray-500">
              Last updated: {new Date(latestSpec.updatedAt).toLocaleString()}
            </div>
          </CardHeader>
          <CardContent>
            <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg overflow-auto max-h-96">
              <pre className="whitespace-pre-wrap break-words">
                {latestSpec.content}
              </pre>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Create New Specification */}
      <Card>
        <CardHeader>
          <CardTitle>Create New Specification Version</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {latestSpec && (
              <Button
                type="button"
                variant="outline"
                onClick={handleUseLatestAsTemplate}
                className="mb-2"
              >
                Use Current as Template
              </Button>
            )}
            <div className="space-y-2">
              <label htmlFor="content" className="text-sm font-medium">
                Content (JSON)
              </label>
              <Textarea
                id="content"
                name="content"
                value={formData.content}
                onChange={handleInputChange}
                required
                rows={10}
                placeholder='{"example": "JSON content for your specification"}'
              />
            </div>
            <Button type="submit" disabled={loading}>
              Save New Version
            </Button>
          </form>
          {error && <p className="text-red-500 mt-4">{error}</p>}
        </CardContent>
      </Card>

      {/* Specification History */}
      {specifications.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Specification History</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {specifications.map((spec) => (
                <Card key={spec.id} className="overflow-hidden">
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold">
                          Version {spec.version}
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Created: {new Date(spec.createdAt).toLocaleString()}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(spec.id)}
                        className="h-6 w-6 p-0"
                      >
                        ✕
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
