import { useMemo, useState } from "react";
import {
  DndContext,
  PointerSensor,
  useSensor,
  useSensors,
  closestCenter,
  DragOverlay,
  useDroppable,
} from "@dnd-kit/core";
import { SortableContext, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { cn, statusLabel } from "@/lib/utils";
import TaskCard from "./TaskCard";
import { useUpdateTask } from "@/hooks/useTasks";
import { toast } from "sonner";
import { extractApiMessage } from "@/lib/utils";

const COLUMNS = ["TODO", "IN_PROGRESS", "DONE"];

function SortableTaskCard({ task, onSelect }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: task._id,
    data: { task },
  });
  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };
  return (
    <div ref={setNodeRef} style={style}>
      <TaskCard
        task={task}
        onClick={() => onSelect?.(task)}
        dragHandleProps={{ ...attributes, ...listeners }}
      />
    </div>
  );
}

function Column({ id, title, count, tasks, onSelect }) {
  const { setNodeRef, isOver } = useDroppable({ id });
  return (
    <div className="flex flex-col rounded-lg border bg-muted/30 min-h-[60vh]">
      <div className="flex items-center justify-between p-3 border-b">
        <div className="font-medium text-sm">{title}</div>
        <span className="text-xs text-muted-foreground bg-background border rounded-full px-2 py-0.5">
          {count}
        </span>
      </div>
      <div
        ref={setNodeRef}
        className={cn(
          "flex-1 p-3 space-y-2 transition-colors",
          isOver && "bg-primary/5"
        )}
      >
        <SortableContext items={tasks.map((t) => t._id)} strategy={verticalListSortingStrategy}>
          {tasks.length === 0 ? (
            <div className="text-xs text-muted-foreground text-center py-8">
              No tasks
            </div>
          ) : (
            tasks.map((t) => (
              <SortableTaskCard key={t._id} task={t} onSelect={onSelect} />
            ))
          )}
        </SortableContext>
      </div>
    </div>
  );
}

export default function KanbanBoard({ projectId, tasks, onSelectTask }) {
  const [activeTask, setActiveTask] = useState(null);
  const updateTask = useUpdateTask(projectId);
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } })
  );

  const grouped = useMemo(() => {
    const map = { TODO: [], IN_PROGRESS: [], DONE: [] };
    for (const t of tasks) map[t.status]?.push(t);
    return map;
  }, [tasks]);

  function findContainer(id) {
    if (COLUMNS.includes(id)) return id;
    const t = tasks.find((x) => x._id === id);
    return t?.status;
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={(event) => {
        const task = tasks.find((t) => t._id === event.active.id);
        setActiveTask(task || null);
      }}
      onDragEnd={async (event) => {
        setActiveTask(null);
        const { active, over } = event;
        if (!over) return;
        const fromStatus = findContainer(active.id);
        const toStatus = findContainer(over.id);
        if (!fromStatus || !toStatus || fromStatus === toStatus) return;

        const task = tasks.find((t) => t._id === active.id);
        if (!task) return;
        try {
          await updateTask.mutateAsync({
            id: task._id,
            status: toStatus,
            updatedAt: task.updatedAt,
          });
        } catch (err) {
          toast.error(extractApiMessage(err, "Failed to move task"));
        }
      }}
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {COLUMNS.map((col) => (
          <Column
            key={col}
            id={col}
            title={statusLabel(col)}
            count={grouped[col].length}
            tasks={grouped[col]}
            onSelect={onSelectTask}
          />
        ))}
      </div>
      <DragOverlay>
        {activeTask ? <TaskCard task={activeTask} /> : null}
      </DragOverlay>
    </DndContext>
  );
}
