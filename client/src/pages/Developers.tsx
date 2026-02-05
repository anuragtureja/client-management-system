import { useState } from "react";
import { useDevelopers, useCreateDeveloper, useDeleteDeveloper, useDeveloper } from "@/hooks/use-developers";
import { Sidebar } from "@/components/Sidebar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Plus,
  Search,
  MoreVertical,
  Trash2,
  User,
  Mail,
  Loader2,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertDeveloperSchema, type InsertDeveloper } from "@shared/schema";

export default function Developers() {
  const { data: developers, isLoading } = useDevelopers();
  const createMutation = useCreateDeveloper();
  const deleteMutation = useDeleteDeveloper();
  const { toast } = useToast();

  const [search, setSearch] = useState("");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [selectedId, setSelectedId] = useState<number | null>(null);

  const form = useForm<InsertDeveloper>({
    resolver: zodResolver(insertDeveloperSchema),
    defaultValues: {
      name: "",
      email: "",
      techStack: "",
      skills: "",
      description: "",
    },
  });

  const filteredDevelopers = developers?.filter(
    (dev) =>
      dev.name.toLowerCase().includes(search.toLowerCase()) ||
      dev.email.toLowerCase().includes(search.toLowerCase())
  );

  const handleCreate = async (data: InsertDeveloper) => {
    try {
      await createMutation.mutateAsync(data);
      setIsCreateOpen(false);
      form.reset();
      toast({
        title: "Success",
        description: "Developer added successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: (error as Error).message,
        variant: "destructive",
      });
    }
  };

  const handleDelete = async () => {
    if (deletingId === null) return;
    try {
      await deleteMutation.mutateAsync(deletingId);
      setDeletingId(null);
      toast({
        title: "Success",
        description: "Developer deleted successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: (error as Error).message,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="flex">
      <Sidebar />
      <div className="flex-1 ml-64">
        <div className="p-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex justify-between items-center mb-2">
              <h1 className="text-4xl font-bold text-foreground">
                Developers
              </h1>
              <Button
                onClick={() => setIsCreateOpen(true)}
                className="rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Developer
              </Button>
            </div>
            <p className="text-muted-foreground">
              Manage your team of developers
            </p>
          </div>

          {/* Search Bar */}
          <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                placeholder="Search by name or email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-12 rounded-xl h-11"
              />
            </div>
          </div>

          {/* Table */}
          <div className="rounded-xl border border-border bg-white shadow-sm overflow-hidden">
            {isLoading ? (
              <div className="flex justify-center items-center h-64">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : (
              <Table>
                <TableHeader className="bg-secondary/50">
                  <TableRow className="hover:bg-secondary/50">
                    <TableHead className="font-semibold text-foreground">Name</TableHead>
                    <TableHead className="font-semibold text-foreground">Email</TableHead>
                    <TableHead className="font-semibold text-foreground">Tech</TableHead>
                    <TableHead className="font-semibold text-foreground">Skills</TableHead>
                    <TableHead className="text-right font-semibold text-foreground">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(!filteredDevelopers || filteredDevelopers.length === 0) ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8">
                        <p className="text-muted-foreground">
                          {developers?.length === 0
                            ? "No developers yet. Add your first developer!"
                            : "No developers match your search."}
                        </p>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredDevelopers.map((developer) => (
                      <TableRow key={developer.id} className="cursor-pointer" onClick={() => setSelectedId(developer.id)}>
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                              <User className="w-4 h-4" />
                            </div>
                            {developer.name}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Mail className="w-4 h-4" />
                            {developer.email}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-muted-foreground">{developer.techStack || '-'}</div>
                        </TableCell>
                        <TableCell>
                          <div className="text-muted-foreground">{developer.skills || '-'}</div>
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <button className="p-2 hover:bg-secondary rounded-lg transition-colors">
                                <MoreVertical className="w-4 h-4 text-muted-foreground" />
                              </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                onClick={() => setDeletingId(developer.id)}
                                className="text-destructive cursor-pointer"
                              >
                                <Trash2 className="w-4 h-4 mr-2" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            )}
          </div>
        </div>
      </div>

      {/* Create Developer Dialog */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="rounded-2xl max-w-md">
          <DialogHeader>
            <DialogTitle>Add New Developer</DialogTitle>
            <DialogDescription>
              Add a new developer to your team
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(handleCreate)}
              className="space-y-4"
            >
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="John Doe"
                        {...field}
                        className="rounded-xl"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="john@example.com"
                        type="email"
                        {...field}
                        className="rounded-xl"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="techStack"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tech Stack</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="React, Node, Postgres"
                        {...field}
                        value={field.value ?? ""}
                        className="rounded-xl"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="skills"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Skills</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Testing, CI/CD, TDD"
                        {...field}
                        value={field.value ?? ""}
                        className="rounded-xl"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Short bio or notes about the developer"
                        {...field}
                        value={field.value ?? ""}
                        className="rounded-xl"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex justify-end gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsCreateOpen(false);
                    form.reset();
                  }}
                  className="rounded-xl"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={createMutation.isPending}
                  className="rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20"
                >
                  {createMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Adding...
                    </>
                  ) : (
                    "Add Developer"
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Developer Details Dialog */}
      <Dialog open={selectedId !== null} onOpenChange={() => setSelectedId(null)}>
        <DialogContent className="rounded-2xl max-w-lg">
          <DialogHeader>
            <DialogTitle>Developer Details</DialogTitle>
            <DialogDescription>Full developer information</DialogDescription>
          </DialogHeader>
          <DeveloperDetails id={selectedId} onClose={() => setSelectedId(null)} />
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deletingId !== null} onOpenChange={() => setDeletingId(null)}>
        <AlertDialogContent className="rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Developer</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this developer? This action
              cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-xl">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleteMutation.isPending}
              className="rounded-xl bg-destructive hover:bg-destructive/90"
            >
              {deleteMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function DeveloperDetails({ id, onClose }: { id: number | null; onClose: () => void }) {
  const { data: developer, isLoading } = useDeveloper(id ?? 0);

  if (!id) return null;

  return (
    <div>
      {isLoading ? (
        <div className="flex justify-center items-center h-40">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : developer ? (
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-medium">{developer.name}</h3>
            <p className="text-muted-foreground">{developer.email}</p>
          </div>
          <div>
            <strong>Tech Stack:</strong>
            <p className="text-muted-foreground">{developer.techStack || '-'}</p>
          </div>
          <div>
            <strong>Skills:</strong>
            <p className="text-muted-foreground">{developer.skills || '-'}</p>
          </div>
          <div>
            <strong>Description:</strong>
            <p className="text-muted-foreground whitespace-pre-wrap">{developer.description || '-'}</p>
          </div>
          <div className="flex justify-end">
            <Button onClick={onClose} className="rounded-xl">Close</Button>
          </div>
        </div>
      ) : (
        <p className="text-muted-foreground">Developer not found.</p>
      )}
    </div>
  );
}
