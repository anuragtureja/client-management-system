import { useState } from "react";
import { useClients, useCreateClient, useUpdateClient, useDeleteClient } from "@/hooks/use-clients";
import { Sidebar } from "@/components/Sidebar";
import { ClientForm } from "@/components/ClientForm";
import { StatusBadge } from "@/components/StatusBadge";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription 
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
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  Plus, 
  Search, 
  MoreVertical, 
  Pencil, 
  Trash2, 
  User, 
  Mail, 
  Briefcase 
} from "lucide-react";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import type { Client, InsertClient } from "@shared/schema";

export default function Dashboard() {
  const { data: clients, isLoading } = useClients();
  const createMutation = useCreateClient();
  const updateMutation = useUpdateClient();
  const deleteMutation = useDeleteClient();
  const { toast } = useToast();

  const [search, setSearch] = useState("");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const filteredClients = clients?.filter(client => 
    client.name.toLowerCase().includes(search.toLowerCase()) || 
    client.email.toLowerCase().includes(search.toLowerCase())
  );

  const handleCreate = async (data: InsertClient) => {
    try {
      await createMutation.mutateAsync(data);
      setIsCreateOpen(false);
      toast({
        title: "Success",
        description: "Client created successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: (error as Error).message,
        variant: "destructive",
      });
    }
  };

  const handleUpdate = async (data: InsertClient) => {
    if (!editingClient) return;
    try {
      await updateMutation.mutateAsync({ id: editingClient.id, ...data });
      setEditingClient(null);
      toast({
        title: "Success",
        description: "Client updated successfully",
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
    if (!deletingId) return;
    try {
      await deleteMutation.mutateAsync(deletingId);
      setDeletingId(null);
      toast({
        title: "Success",
        description: "Client deleted successfully",
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
    <div className="flex bg-secondary/30 min-h-screen">
      <Sidebar />
      
      <main className="flex-1 ml-64 p-8">
        <header className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Client Dashboard</h1>
              <p className="text-muted-foreground mt-1">Manage your projects and client relationships</p>
            </div>
            
            <Button 
              onClick={() => setIsCreateOpen(true)}
              className="rounded-xl px-6 py-6 bg-primary hover:bg-primary/90 shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 hover:-translate-y-0.5 transition-all duration-200"
            >
              <Plus className="w-5 h-5 mr-2" />
              Add New Client
            </Button>
          </div>

          <div className="mt-8 flex gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input 
                placeholder="Search clients..." 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 rounded-xl bg-white border-border/60 focus:border-primary focus:ring-primary/20 h-12"
              />
            </div>
          </div>
        </header>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-48 bg-white/50 animate-pulse rounded-2xl" />
            ))}
          </div>
        ) : filteredClients?.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center bg-white rounded-3xl border border-dashed border-border/60">
            <div className="w-16 h-16 bg-secondary rounded-full flex items-center justify-center mb-4">
              <User className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-semibold text-foreground">No clients found</h3>
            <p className="text-muted-foreground mt-2 max-w-sm">
              Get started by adding your first client to the system.
            </p>
            <Button 
              onClick={() => setIsCreateOpen(true)}
              variant="outline" 
              className="mt-6 rounded-xl"
            >
              Add Client
            </Button>
          </div>
        ) : (
          <div className="bg-white rounded-3xl border border-border/50 shadow-sm overflow-hidden">
            <Table>
              <TableHeader className="bg-secondary/30">
                <TableRow>
                  <TableHead className="w-[300px] pl-6 py-4">Client Name</TableHead>
                  <TableHead className="py-4">Status</TableHead>
                  <TableHead className="py-4">Budget</TableHead>
                  <TableHead className="py-4">Assigned To</TableHead>
                  <TableHead className="text-right pr-6 py-4">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredClients?.map((client) => (
                  <TableRow key={client.id} className="group hover:bg-secondary/20 transition-colors">
                    <TableCell className="pl-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">
                          {client.name.substring(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-semibold text-foreground">{client.name}</p>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                            <Mail className="w-3 h-3" />
                            {client.email}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={client.status} />
                    </TableCell>
                    <TableCell>
                      <span className="font-mono font-medium text-foreground">
                        ${Number(client.budget).toLocaleString()}
                      </span>
                    </TableCell>
                    <TableCell>
                      {client.assignedDeveloper ? (
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-orange-100 flex items-center justify-center text-xs text-orange-700 font-bold">
                            {client.assignedDeveloper.substring(0, 1)}
                          </div>
                          <span className="text-sm text-foreground/80">{client.assignedDeveloper}</span>
                        </div>
                      ) : (
                        <span className="text-sm text-muted-foreground italic">Unassigned</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right pr-6">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0 rounded-lg hover:bg-secondary">
                            <MoreVertical className="h-4 w-4 text-muted-foreground" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-40 rounded-xl">
                          <DropdownMenuItem onClick={() => setEditingClient(client)} className="cursor-pointer">
                            <Pencil className="mr-2 h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => setDeletingId(client.id)}
                            className="text-destructive focus:text-destructive cursor-pointer"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}

        {/* Create Dialog */}
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogContent className="sm:max-w-[600px] rounded-2xl">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold flex items-center gap-2">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Briefcase className="w-5 h-5 text-primary" />
                </div>
                New Client
              </DialogTitle>
              <DialogDescription>
                Add a new client project to the system. Fill out all required fields.
              </DialogDescription>
            </DialogHeader>
            <ClientForm 
              onSubmit={handleCreate} 
              isSubmitting={createMutation.isPending}
              onCancel={() => setIsCreateOpen(false)}
            />
          </DialogContent>
        </Dialog>

        {/* Edit Dialog */}
        <Dialog open={!!editingClient} onOpenChange={(open) => !open && setEditingClient(null)}>
          <DialogContent className="sm:max-w-[600px] rounded-2xl">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold">Edit Client</DialogTitle>
              <DialogDescription>
                Update project details for {editingClient?.name}
              </DialogDescription>
            </DialogHeader>
            {editingClient && (
              <ClientForm 
                defaultValues={editingClient}
                onSubmit={handleUpdate}
                isSubmitting={updateMutation.isPending}
                onCancel={() => setEditingClient(null)}
              />
            )}
          </DialogContent>
        </Dialog>

        {/* Delete Alert */}
        <AlertDialog open={!!deletingId} onOpenChange={(open) => !open && setDeletingId(null)}>
          <AlertDialogContent className="rounded-2xl">
            <AlertDialogHeader>
              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete the client
                and remove their data from the servers.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="rounded-xl">Cancel</AlertDialogCancel>
              <AlertDialogAction 
                onClick={handleDelete}
                className="rounded-xl bg-destructive hover:bg-destructive/90"
              >
                Delete Client
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </main>
    </div>
  );
}
