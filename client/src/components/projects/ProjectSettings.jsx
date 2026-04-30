import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router-dom";
import { Trash2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { updateProjectSchema } from "@/schemas/project";
import { useUpdateProject, useDeleteProject } from "@/hooks/useProjects";

export default function ProjectSettings({ project, isOwner, isAdmin }) {
  const update = useUpdateProject(project._id);
  const remove = useDeleteProject();
  const navigate = useNavigate();
  const [confirmName, setConfirmName] = useState("");

  const form = useForm({
    resolver: zodResolver(updateProjectSchema),
    defaultValues: { name: project.name, description: project.description || "" },
  });

  useEffect(() => {
    form.reset({ name: project.name, description: project.description || "" });
  }, [project, form]);

  const onSubmit = form.handleSubmit((values) => update.mutate(values));

  return (
    <div className="space-y-6 max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle>Project details</CardTitle>
          <CardDescription>
            Only project admins can update these.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="space-y-4">
            <div className="grid gap-1.5">
              <Label htmlFor="name">Name</Label>
              <Input id="name" disabled={!isAdmin} {...form.register("name")} />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                disabled={!isAdmin}
                rows={3}
                {...form.register("description")}
              />
            </div>
            {isAdmin && (
              <Button type="submit" disabled={update.isPending}>
                {update.isPending && <Spinner className="mr-2" />}
                Save changes
              </Button>
            )}
          </form>
        </CardContent>
      </Card>

      {isOwner && (
        <Card className="border-red-200 dark:border-red-900">
          <CardHeader>
            <CardTitle className="text-red-600">Danger zone</CardTitle>
            <CardDescription>
              Deleting a project removes all of its tasks and activity. This cannot be undone.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <AlertDialog onOpenChange={() => setConfirmName("")}>
              <AlertDialogTrigger asChild>
                <Button variant="destructive">
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete project
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete this project?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Type <strong>{project.name}</strong> to confirm. This will permanently
                    delete the project, all tasks, and activity logs.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <Input
                  value={confirmName}
                  onChange={(e) => setConfirmName(e.target.value)}
                  placeholder={project.name}
                  className="my-4"
                />
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    disabled={confirmName !== project.name || remove.isPending}
                    onClick={async () => {
                      try {
                        await remove.mutateAsync(project._id);
                        navigate("/projects", { replace: true });
                      } catch {
                        /* toast in hook */
                      }
                    }}
                  >
                    {remove.isPending ? "Deleting..." : "Delete project"}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
