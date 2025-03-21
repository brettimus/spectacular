import { useCallback, useEffect, useState } from "react";
import { Button } from "../components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../components/ui/tabs";
import { API_BASE_URL } from "../config";
import { ConversationsPanel } from "./ConversationsPanel";
import { SpecificationsPanel } from "./SpecificationsPanel";

interface Project {
  id: number;
  name: string;
  description: string;
  createdAt: string;
  updatedAt: string;
}

export function ApiTester() {
  const [activeTab, setActiveTab] = useState("conversations");
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showNewProjectForm, setShowNewProjectForm] = useState(false);
  const [newProjectData, setNewProjectData] = useState({
    name: "",
    description: "",
  });

  const fetchProjects = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/projects`);
      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }
      const data = (await response.json()) as Project[];
      setProjects(data);

      // Set default selected project if none is selected
      if (data.length > 0 && !selectedProject) {
        setSelectedProject(data[0]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch projects");
    } finally {
      setLoading(false);
    }
  }, [selectedProject]);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  const handleProjectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const projectId = Number.parseInt(e.target.value, 10);
    if (projectId === -1) {
      // "Create New Project" option selected
      setShowNewProjectForm(true);
    } else {
      const project = projects.find((p) => p.id === projectId);
      if (project) {
        setSelectedProject(project);
      }
    }
  };

  const handleNewProjectInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setNewProjectData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/api/projects`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newProjectData),
      });

      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }

      const newProject = (await response.json()) as Project;

      // Reset form
      setNewProjectData({ name: "", description: "" });
      setShowNewProjectForm(false);

      // Refresh projects and select the new one
      await fetchProjects();
      setSelectedProject(newProject);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create project");
    } finally {
      setLoading(false);
    }
  };

  const handleCancelNewProject = () => {
    setShowNewProjectForm(false);
    setNewProjectData({ name: "", description: "" });
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Project Workspace</h1>
        <Button variant="outline" onClick={() => window.location.reload()}>
          Refresh
        </Button>
      </div>

      {/* Project Switcher */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Select Project</CardTitle>
        </CardHeader>
        <CardContent>
          {loading && <p>Loading projects...</p>}
          {error && <p className="text-red-500">{error}</p>}

          {!showNewProjectForm ? (
            <div className="flex items-center gap-4">
              <select
                className="flex-1 p-2 border rounded-md"
                value={selectedProject?.id || ""}
                onChange={handleProjectChange}
              >
                <option value="" disabled>
                  Select a project
                </option>
                {projects.map((project) => (
                  <option key={project.id} value={project.id}>
                    {project.name}
                  </option>
                ))}
                <option value="-1">➕ Create New Project</option>
              </select>

              {selectedProject && (
                <div className="flex-1">
                  <h3 className="font-medium">
                    Current Project: {selectedProject.name}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {selectedProject.description}
                  </p>
                </div>
              )}
            </div>
          ) : (
            <form onSubmit={handleCreateProject} className="space-y-4">
              <div>
                <label
                  htmlFor="name"
                  className="block text-sm font-medium mb-1"
                >
                  Project Name
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={newProjectData.name}
                  onChange={handleNewProjectInputChange}
                  className="w-full p-2 border rounded-md"
                  required
                />
              </div>
              <div>
                <label
                  htmlFor="description"
                  className="block text-sm font-medium mb-1"
                >
                  Description
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={newProjectData.description}
                  onChange={handleNewProjectInputChange}
                  className="w-full p-2 border rounded-md"
                  rows={3}
                  required
                />
              </div>
              <div className="flex gap-2">
                <Button type="submit" disabled={loading}>
                  Create Project
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCancelNewProject}
                >
                  Cancel
                </Button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>

      {/* Project Content Tabs */}
      {selectedProject && (
        <Tabs
          defaultValue="conversations"
          value={activeTab}
          onValueChange={setActiveTab}
          className="w-full"
        >
          <TabsList className="grid grid-cols-2 mb-8">
            <TabsTrigger value="conversations">Conversation Thread</TabsTrigger>
            <TabsTrigger value="specifications">Specification</TabsTrigger>
          </TabsList>

          <TabsContent value="conversations">
            <ConversationsPanel projectId={selectedProject.id} />
          </TabsContent>

          <TabsContent value="specifications">
            <SpecificationsPanel projectId={selectedProject.id} />
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}
