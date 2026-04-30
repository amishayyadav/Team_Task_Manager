import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";

const ANY = "__any__";

export default function TaskFiltersBar({ value, onChange, members = [] }) {
  const set = (patch) => onChange({ ...value, ...patch });

  return (
    <div className="flex flex-col md:flex-row gap-2 md:items-center">
      <div className="relative flex-1">
        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search tasks..."
          value={value.search || ""}
          onChange={(e) => set({ search: e.target.value })}
          className="pl-8"
        />
      </div>
      <Select
        value={value.status || ANY}
        onValueChange={(v) => set({ status: v === ANY ? "" : v })}
      >
        <SelectTrigger className="md:w-40"><SelectValue placeholder="Status" /></SelectTrigger>
        <SelectContent>
          <SelectItem value={ANY}>All statuses</SelectItem>
          <SelectItem value="TODO">To do</SelectItem>
          <SelectItem value="IN_PROGRESS">In progress</SelectItem>
          <SelectItem value="DONE">Done</SelectItem>
        </SelectContent>
      </Select>
      <Select
        value={value.priority || ANY}
        onValueChange={(v) => set({ priority: v === ANY ? "" : v })}
      >
        <SelectTrigger className="md:w-36"><SelectValue placeholder="Priority" /></SelectTrigger>
        <SelectContent>
          <SelectItem value={ANY}>All priorities</SelectItem>
          <SelectItem value="LOW">Low</SelectItem>
          <SelectItem value="MEDIUM">Medium</SelectItem>
          <SelectItem value="HIGH">High</SelectItem>
        </SelectContent>
      </Select>
      <Select
        value={value.assignee || ANY}
        onValueChange={(v) => set({ assignee: v === ANY ? "" : v })}
      >
        <SelectTrigger className="md:w-44"><SelectValue placeholder="Assignee" /></SelectTrigger>
        <SelectContent>
          <SelectItem value={ANY}>Anyone</SelectItem>
          <SelectItem value="me">Assigned to me</SelectItem>
          <SelectItem value="none">Unassigned</SelectItem>
          {members.map((m) => (
            <SelectItem key={m.user._id} value={m.user._id}>
              {m.user.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Button
        variant={value.overdue === "true" ? "default" : "outline"}
        onClick={() =>
          set({ overdue: value.overdue === "true" ? "" : "true" })
        }
      >
        Overdue
      </Button>
      {(value.search || value.status || value.priority || value.assignee || value.overdue) && (
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onChange({})}
          aria-label="Clear filters"
        >
          <X className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
}
