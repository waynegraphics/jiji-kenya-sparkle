import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import PageHero from "@/components/PageHero";
import { Briefcase, MapPin, Clock, DollarSign, ArrowRight, Users, Target, Heart, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";

const Careers = () => {
  const [selectedDepartment, setSelectedDepartment] = useState("All");
  const [applyingTo, setApplyingTo] = useState<any>(null);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [coverLetter, setCoverLetter] = useState("");

  const { data: openings, isLoading } = useQuery({
    queryKey: ["career-openings"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("career_openings")
        .select("*")
        .eq("status", "active")
        .order("display_order", { ascending: true });
      if (error) throw error;
      return data;
    },
  });

  const applyMutation = useMutation({
    mutationFn: async () => {
      if (!fullName || !email) throw new Error("Name and email are required");
      const { error } = await supabase.from("career_applications").insert({
        opening_id: applyingTo.id,
        full_name: fullName,
        email,
        phone: phone || null,
        cover_letter: coverLetter || null,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Application submitted successfully!");
      setApplyingTo(null);
      setFullName("");
      setEmail("");
      setPhone("");
      setCoverLetter("");
    },
    onError: (err: any) => toast.error(err.message),
  });

  const departments = ["All", ...new Set(openings?.map((j) => j.department) || [])];
  const filteredJobs = selectedDepartment === "All"
    ? openings || []
    : (openings || []).filter((j) => j.department === selectedDepartment);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <PageHero
        title="Careers"
        subtitle="Join us in building Kenya's premier online marketplace"
        badge="Join Our Team"
        badgeIcon={Briefcase}
        breadcrumbLabel="Careers"
      />

      <main className="container mx-auto py-8 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-4">Careers at APA Bazaar</h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Help us build Kenya's most trusted marketplace. Join a team that's passionate about connecting buyers and sellers.
            </p>
          </div>

          {/* Why Work With Us */}
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            <div className="bg-card rounded-xl p-6 shadow-sm border border-border">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4"><Target className="h-6 w-6 text-primary" /></div>
              <h3 className="text-lg font-semibold mb-2">Mission-Driven</h3>
              <p className="text-sm text-muted-foreground">Work on products that make a real difference in people's lives.</p>
            </div>
            <div className="bg-card rounded-xl p-6 shadow-sm border border-border">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4"><Users className="h-6 w-6 text-primary" /></div>
              <h3 className="text-lg font-semibold mb-2">Great Team</h3>
              <p className="text-sm text-muted-foreground">Collaborate with talented, passionate people who care about building great products.</p>
            </div>
            <div className="bg-card rounded-xl p-6 shadow-sm border border-border">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4"><Heart className="h-6 w-6 text-primary" /></div>
              <h3 className="text-lg font-semibold mb-2">Work-Life Balance</h3>
              <p className="text-sm text-muted-foreground">Flexible working arrangements and a supportive environment.</p>
            </div>
          </div>

          {/* Department Filter */}
          <div className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">Open Positions</h2>
            <div className="flex flex-wrap gap-2 mb-6">
              {departments.map((dept) => (
                <button
                  key={dept}
                  onClick={() => setSelectedDepartment(dept as string)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    selectedDepartment === dept ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80"
                  }`}
                >
                  {dept}
                </button>
              ))}
            </div>
          </div>

          {/* Apply Dialog */}
          <Dialog open={!!applyingTo} onOpenChange={(o) => !o && setApplyingTo(null)}>
            <DialogContent className="max-w-lg">
              <DialogHeader><DialogTitle>Apply for {applyingTo?.title}</DialogTitle></DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>Full Name *</Label>
                  <Input value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Your full name" />
                </div>
                <div>
                  <Label>Email *</Label>
                  <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="your@email.com" />
                </div>
                <div>
                  <Label>Phone</Label>
                  <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+254..." />
                </div>
                <div>
                  <Label>Cover Letter</Label>
                  <Textarea value={coverLetter} onChange={(e) => setCoverLetter(e.target.value)} rows={5} placeholder="Tell us why you're a great fit..." />
                </div>
                <Button className="w-full" onClick={() => applyMutation.mutate()} disabled={applyMutation.isPending}>
                  <Send className="h-4 w-4 mr-2" /> {applyMutation.isPending ? "Submitting..." : "Submit Application"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          {/* Job Listings */}
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-40 w-full rounded-xl" />
              ))}
            </div>
          ) : filteredJobs.length > 0 ? (
            <div className="space-y-6">
              {filteredJobs.map((job) => (
                <div key={job.id} className="bg-card rounded-xl p-6 shadow-sm border border-border hover:shadow-md transition-all">
                  <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl font-semibold">{job.title}</h3>
                        <Badge>{job.department}</Badge>
                      </div>
                      <p className="text-muted-foreground mb-4">{job.description}</p>
                      <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mb-4">
                        <div className="flex items-center gap-2"><MapPin className="h-4 w-4" /> {job.location}</div>
                        <div className="flex items-center gap-2"><Clock className="h-4 w-4" /> {job.job_type}</div>
                        {job.salary_range && <div className="flex items-center gap-2"><DollarSign className="h-4 w-4" /> {job.salary_range}</div>}
                        {job.application_deadline && (
                          <div className="text-xs">Deadline: {new Date(job.application_deadline).toLocaleDateString()}</div>
                        )}
                      </div>
                      {job.requirements && job.requirements.length > 0 && (
                        <div className="mb-4">
                          <h4 className="font-semibold text-sm mb-2">Key Requirements:</h4>
                          <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground ml-2">
                            {job.requirements.map((req: string, i: number) => <li key={i}>{req}</li>)}
                          </ul>
                        </div>
                      )}
                      {job.benefits && job.benefits.length > 0 && (
                        <div>
                          <h4 className="font-semibold text-sm mb-2">Benefits:</h4>
                          <div className="flex flex-wrap gap-2">
                            {job.benefits.map((b: string, i: number) => (
                              <Badge key={i} variant="secondary">{b}</Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="flex-shrink-0">
                      <Button onClick={() => setApplyingTo(job)}>
                        Apply Now <ArrowRight className="h-4 w-4 ml-2" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <Briefcase className="h-16 w-16 text-muted-foreground/50 mx-auto mb-4" />
              <h2 className="text-xl font-semibold mb-2">No open positions</h2>
              <p className="text-muted-foreground">Check back later for new opportunities.</p>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Careers;
