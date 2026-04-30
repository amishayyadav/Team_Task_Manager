import { MoreHorizontal, Crown, UserMinus, Shield } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useState } from "react";
import { formatDate, getInitials } from "@/lib/utils";
import { useUpdateMemberRole, useRemoveMember } from "@/hooks/useMembers";

export default function MembersTable({ project, isAdmin, currentUserId }) {
  const updateRole = useUpdateMemberRole(project._id);
  const removeMember = useRemoveMember(project._id);
  const [pending, setPending] = useState(null);

  const ownerId = project.owner?._id || project.owner;

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Member</TableHead>
              <TableHead className="w-32">Role</TableHead>
              <TableHead className="w-44">Joined</TableHead>
              <TableHead className="w-12" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {project.members.map((m) => {
              const isOwner = m.user._id === String(ownerId);
              const isSelf = m.user._id === currentUserId;
              return (
                <TableRow key={m.user._id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback>{getInitials(m.user.name)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium flex items-center gap-1.5">
                          {m.user.name}
                          {isOwner && <Crown className="h-3.5 w-3.5 text-amber-500" />}
                        </div>
                        <div className="text-xs text-muted-foreground">{m.user.email}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={m.role === "ADMIN" ? "default" : "secondary"}>
                      {m.role}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {formatDate(m.joinedAt)}
                  </TableCell>
                  <TableCell>
                    {(isAdmin || isSelf) && !isOwner && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {isAdmin && m.role !== "ADMIN" && (
                            <DropdownMenuItem
                              onClick={() =>
                                updateRole.mutate({ userId: m.user._id, role: "ADMIN" })
                              }
                            >
                              <Shield className="mr-2 h-4 w-4" />
                              Make admin
                            </DropdownMenuItem>
                          )}
                          {isAdmin && m.role === "ADMIN" && (
                            <DropdownMenuItem
                              onClick={() =>
                                updateRole.mutate({ userId: m.user._id, role: "MEMBER" })
                              }
                            >
                              <Shield className="mr-2 h-4 w-4" />
                              Demote to member
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem
                            className="text-red-600"
                            onClick={() => setPending(m)}
                          >
                            <UserMinus className="mr-2 h-4 w-4" />
                            {isSelf ? "Leave project" : "Remove from project"}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      <AlertDialog open={Boolean(pending)} onOpenChange={(o) => !o && setPending(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {pending?.user._id === currentUserId
                ? "Leave this project?"
                : `Remove ${pending?.user.name}?`}
            </AlertDialogTitle>
            <AlertDialogDescription>
              Their assigned tasks will be set to unassigned.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={async () => {
                if (pending) await removeMember.mutateAsync(pending.user._id);
                setPending(null);
              }}
            >
              Confirm
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
