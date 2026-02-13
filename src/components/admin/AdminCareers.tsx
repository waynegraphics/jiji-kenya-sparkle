import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Plus, Edit, Trash2, Eye, X, FileText } from "lucide-react";

const AdminCareers = () => {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [viewApp, setViewApp] = useState<any>(null);

  // Job form state
  const [title, setTitle] = useState("");
  const [department, setDepartment] = useState("");
  const [location, setLocation] = useState("Nairobi, Kenya");
  const [jobType, setJobType] = useState("Full-time");
  const [salaryRange, setSalaryRange] = useState("");
  const [description, setDescription] = useState("");
  const [requirements, setRequirements] = useState("");
  const [benefits, setBenefits] = useState("");
  const [status, setStatus] = useState("active");
  const [deadline, setDeadline] = useState("");

  const { data: openings, isLoading } = useQuery({
    queryKey: ["admin-career-openings"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("career_openings")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const { data: applications } = useQuery({
    queryKey: ["admin-career-applications"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("career_applications")
        .select("*, career_openings(title)")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const saveMutation = useMutation({
    mutationFn: async (jobData: any) => {
      if (editing) {
        const { error } = await supabase.from("career_openings").update(jobData).eq("id", editing.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("career_openings").insert(jobData);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-career-openings"] });
      toast.success(editing ? "Job updated" : "Job created");
      resetForm();
    },
    onError: (err: any) => toast.error(err.message),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("career_openings").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-career-openings"] });
      toast.success("Job deleted");
    },
  });

  const updateAppStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await supabase
        .from("career_applications")
        .update({ status, reviewed_at: new Date().toISOString() })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-career-applications"] });
      toast.success("Application status updated");
    },
  });

  const resetForm = () => {
    setShowForm(false);
    setEditing(null);
    setTitle("");
    setDepartment("");
    setLocation("Nairobi, Kenya");
    setJobType("Full-time");
    setSalaryRange("");
    setDescription("");
    setRequirements("");
    setBenefits("");
    setStatus("active");
    setDeadline("");
  };

  const openEdit = (job: any) => {
    setEditing(job);
    setTitle(job.title);
    setDepartment(job.department);
    setLocation(job.location);
    setJobType(job.job_type);
    setSalaryRange(job.salary_range || "");
    setDescription(job.description);
    setRequirements((job.requirements || []).join("\n"));
    setBenefits((job.benefits || []).join("\n"));
    setStatus(job.status);
    setDeadline(job.application_deadline ? job.application_deadline.split("T")[0] : "");
    setShowForm(true);
  };

  const handleSave = () => {
    if (!title || !department) {
      toast.error("Title and department are required");
      return;
    }
    saveMutation.mutate({
      title,
      department,
      location,
      job_type: jobType,
      salary_range: salaryRange || null,
      description,
      requirements: requirements ? requirements.split("\n").filter(Boolean) : [],
      benefits: benefits ? benefits.split("\n").filter(Boolean) : [],
      status,
      application_deadline: deadline ? new Date(deadline).toISOString() : null,
    });
  };

  return (
    <div className="space-y-6">
      <Tabs defaultValue="openings">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Careers</h2>
          <TabsList>
            <TabsTrigger value="openings">Job Openings</TabsTrigger>
            <TabsTrigger value="applications">Applications ({applications?.length || 0})</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="openings" className="space-y-4">
          <div className="flex justify-end">
            <Button onClick={() => setShowForm(true)}>
              <Plus className="h-4 w-4 mr-2" /> Add Job
            </Button>
          </div>

          <Dialog open={showForm} onOpenChange={(o) => !o && resetForm()}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editing ? "Edit Job" : "Add Job Opening"}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Title *</Label>
                    <Input value={title} onChange={(e) => setTitle(e.target.value)} />
                  </div>
                  <div>
                    <Label>Department *</Label>
                    <Input value={department} onChange={(e) => setDepartment(e.target.value)} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Location</Label>
                    <Input value={location} onChange={(e) => setLocation(e.target.value)} />
                  </div>
                  <div>
                    <Label>Job Type</Label>
                    <Select value={jobType} onValueChange={setJobType}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Full-time">Full-time</SelectItem>
                        <SelectItem value="Part-time">Part-time</SelectItem>
                        <SelectItem value="Contract">Contract</SelectItem>
                        <SelectItem value="Internship">Internship</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Salary Range</Label>
                    <Input value={salaryRange} onChange={(e) => setSalaryRange(e.target.value)} placeholder="e.g. KES 100k - 200k" />
                  </div>
                  <div>
                    <Label>Application Deadline</Label>
                    <Input type="date" value={deadline} onChange={(e) => setDeadline(e.target.value)} />
                  </div>
                </div>
                <div>
                  <Label>Description</Label>
                  <Textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={4} />
                </div>
                <div>
                  <Label>Requirements (one per line)</Label>
                  <Textarea value={requirements} onChange={(e) => setRequirements(e.target.value)} rows={4} placeholder="5+ years experience&#10;Strong React skills" />
                </div>
                <div>
                  <Label>Benefits (one per line)</Label>
                  <Textarea value={benefits} onChange={(e) => setBenefits(e.target.value)} rows={3} placeholder="Health insurance&#10;Remote work" />
                </div>
                <div>
                  <Label>Status</Label>
                  <Select value={status} onValueChange={setStatus}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="closed">Closed</SelectItem>
                      <SelectItem value="draft">Draft</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button className="w-full" onClick={handleSave} disabled={saveMutation.isPending}>
                  {saveMutation.isPending ? "Saving..." : editing ? "Update" : "Create"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {openings?.map((job) => (
                <TableRow key={job.id}>
                  <TableCell className="font-medium">{job.title}</TableCell>
                  <TableCell>{job.department}</TableCell>
                  <TableCell>{job.job_type}</TableCell>
                  <TableCell>
                    <Badge variant={job.status === "active" ? "default" : "secondary"}>{job.status}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button size="sm" variant="ghost" onClick={() => openEdit(job)}><Edit className="h-4 w-4" /></Button>
                      <Button size="sm" variant="ghost" className="text-destructive" onClick={() => { if (confirm("Delete?")) deleteMutation.mutate(job.id); }}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {(!openings || openings.length === 0) && (
                <TableRow><TableCell colSpan={5} className="text-center py-8 text-muted-foreground">No job openings yet.</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </TabsContent>

        <TabsContent value="applications" className="space-y-4">
          <Dialog open={!!viewApp} onOpenChange={(o) => !o && setViewApp(null)}>
            <DialogContent className="max-w-lg">
              <DialogHeader><DialogTitle>Application Details</DialogTitle></DialogHeader>
              {viewApp && (
                <div className="space-y-3 text-sm">
                  <div><strong>Name:</strong> {viewApp.full_name}</div>
                  <div><strong>Email:</strong> {viewApp.email}</div>
                  <div><strong>Phone:</strong> {viewApp.phone || "—"}</div>
                  <div><strong>Position:</strong> {viewApp.career_openings?.title || "—"}</div>
                  <div><strong>Cover Letter:</strong><p className="mt-1 text-muted-foreground whitespace-pre-wrap">{viewApp.cover_letter || "None"}</p></div>
                  {viewApp.resume_url && (
                    <div><strong>Resume:</strong> <a href={viewApp.resume_url} target="_blank" rel="noopener noreferrer" className="text-primary underline">Download</a></div>
                  )}
                  <div className="flex gap-2 pt-2">
                    <Button size="sm" variant="default" onClick={() => { updateAppStatus.mutate({ id: viewApp.id, status: "reviewed" }); setViewApp(null); }}>Mark Reviewed</Button>
                    <Button size="sm" variant="secondary" onClick={() => { updateAppStatus.mutate({ id: viewApp.id, status: "shortlisted" }); setViewApp(null); }}>Shortlist</Button>
                    <Button size="sm" variant="outline" onClick={() => { updateAppStatus.mutate({ id: viewApp.id, status: "rejected" }); setViewApp(null); }}>Reject</Button>
                  </div>
                </div>
              )}
            </DialogContent>
          </Dialog>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Position</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {applications?.map((app: any) => (
                <TableRow key={app.id}>
                  <TableCell className="font-medium">{app.full_name}</TableCell>
                  <TableCell>{app.email}</TableCell>
                  <TableCell>{app.career_openings?.title || "—"}</TableCell>
                  <TableCell>
                    <Badge variant={app.status === "pending" ? "secondary" : app.status === "shortlisted" ? "default" : "outline"}>
                      {app.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{new Date(app.created_at).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <Button size="sm" variant="ghost" onClick={() => setViewApp(app)}><Eye className="h-4 w-4" /></Button>
                  </TableCell>
                </TableRow>
              ))}
              {(!applications || applications.length === 0) && (
                <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">No applications yet.</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminCareers;
