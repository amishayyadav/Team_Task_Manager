import { Link } from "react-router-dom";
import { Users, Calendar } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatRelative } from "@/lib/utils";

export default function ProjectCard({ project }) {
  return (
    <Link to={`/projects/${project._id}`} className="group">
      <Card className="h-full transition-shadow group-hover:shadow-md">
        <CardHeader>
          <div className="flex items-start justify-between gap-2">
            <CardTitle className="line-clamp-1">{project.name}</CardTitle>
            <Badge variant={project.role === "ADMIN" ? "default" : "secondary"}>
              {project.role}
            </Badge>
          </div>
          {project.description && (
            <CardDescription className="line-clamp-2">{project.description}</CardDescription>
          )}
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span className="inline-flex items-center gap-1.5">
              <Users className="h-4 w-4" />
              {project.memberCount} {project.memberCount === 1 ? "member" : "members"}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Calendar className="h-4 w-4" />
              Updated {formatRelative(project.updatedAt)}
            </span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
