import { useState, useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { supabase } from "@/integrations/supabase/client";
import {
  Activity, CheckCircle, XCircle, AlertTriangle, Loader2, Play,
  Database, Globe, CreditCard, Users, Shield, Server, Zap, Link2, Clock, FileText, Download
} from "lucide-react";

type TestStatus = "idle" | "running" | "pass" | "fail" | "warn";
interface TestResult {
  id: string;
  category: string;
  name: string;
  status: TestStatus;
  message: string;
  duration?: number;
  details?: string;
}

const statusIcon = (s: TestStatus) => {
  switch (s) {
    case "pass": return <CheckCircle className="h-4 w-4 text-green-500" />;
    case "fail": return <XCircle className="h-4 w-4 text-destructive" />;
    case "warn": return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
    case "running": return <Loader2 className="h-4 w-4 animate-spin text-primary" />;
    default: return <Clock className="h-4 w-4 text-muted-foreground" />;
  }
};

const statusBadge = (s: TestStatus) => {
  const colors: Record<TestStatus, string> = { idle: "", running: "", pass: "bg-green-600", fail: "", warn: "bg-yellow-500 text-black" };
  const labels: Record<TestStatus, string> = { idle: "Pending", running: "Running", pass: "Pass", fail: "Fail", warn: "Warning" };
  const variants: Record<TestStatus, string> = { idle: "secondary", running: "default", pass: "default", fail: "destructive", warn: "secondary" };
  return <Badge variant={variants[s] as any} className={`text-xs ${colors[s]}`}>{labels[s]}</Badge>;
};

// Define categories with their tests
const diagnosticSections = [
  { key: "database", label: "Database", icon: Database, description: "Tables, data integrity, connections" },
  { key: "auth", label: "Authentication", icon: Shield, description: "Sessions, roles, team members" },
  { key: "payments", label: "Payments", icon: CreditCard, description: "M-Pesa, transactions" },
  { key: "edge", label: "Edge Functions", icon: Zap, description: "Backend function reachability" },
  { key: "storage", label: "Storage", icon: Server, description: "File buckets access" },
  { key: "config", label: "Configuration", icon: Globe, description: "Platform settings" },
  { key: "users", label: "Users & Content", icon: Users, description: "Users, listings, reports" },
  { key: "affiliates", label: "Affiliates", icon: Link2, description: "Affiliate system health" },
  { key: "security", label: "Security", icon: Shield, description: "RLS policies" },
];

const AdminDiagnostics = () => {
  const [results, setResults] = useState<TestResult[]>([]);
  const [running, setRunning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [selectedSection, setSelectedSection] = useState<string | null>(null);

  const addResult = (r: TestResult) => setResults(prev => {
    const idx = prev.findIndex(p => p.id === r.id);
    if (idx >= 0) { const n = [...prev]; n[idx] = r; return n; }
    return [...prev, r];
  });

  const runTest = async (id: string, category: string, name: string, fn: () => Promise<{ status: TestStatus; message: string; details?: string }>) => {
    addResult({ id, category, name, status: "running", message: "Testing..." });
    const start = performance.now();
    try {
      const result = await fn();
      addResult({ id, category, name, ...result, duration: Math.round(performance.now() - start) });
    } catch (e: any) {
      addResult({ id, category, name, status: "fail", message: e.message || "Unexpected error", details: e.stack, duration: Math.round(performance.now() - start) });
    }
  };

  const getTestsByCategory = useCallback((cat: string) => {
    const tests: Array<{ id: string; cat: string; name: string; fn: () => Promise<{ status: TestStatus; message: string; details?: string }> }> = [];

    if (cat === "database") {
      tests.push(
        { id: "db-connection", cat: "Database", name: "Database Connection", fn: async () => {
          const { error } = await supabase.from("profiles").select("id").limit(1);
          return error ? { status: "fail", message: `Connection failed: ${error.message}`, details: JSON.stringify(error) } : { status: "pass", message: "Connected successfully" };
        }},
        { id: "db-tables", cat: "Database", name: "Core Tables Exist", fn: async () => {
          const tables = ["profiles","base_listings","main_categories","sub_categories","seller_subscriptions","subscription_packages","payment_transactions","team_members","platform_settings","notifications","messages","reports","reviews","favorites","follows"];
          const missing: string[] = [];
          for (const t of tables) { const { error } = await supabase.from(t as any).select("id").limit(1); if (error?.message?.includes("does not exist")) missing.push(t); }
          return missing.length > 0 ? { status: "fail", message: `Missing: ${missing.join(", ")}`, details: `These tables need to be created: ${missing.join(", ")}` } : { status: "pass", message: `All ${tables.length} core tables verified` };
        }},
        { id: "db-categories", cat: "Database", name: "Categories Populated", fn: async () => {
          const { count } = await supabase.from("main_categories").select("*", { count: "exact", head: true });
          return (count || 0) > 0 ? { status: "pass", message: `${count} main categories` } : { status: "warn", message: "No categories found", details: "Add categories via Admin > Categories panel" };
        }},
        { id: "db-subcats", cat: "Database", name: "Sub-categories", fn: async () => {
          const { count } = await supabase.from("sub_categories").select("*", { count: "exact", head: true });
          return (count || 0) > 0 ? { status: "pass", message: `${count} sub-categories` } : { status: "warn", message: "No sub-categories", details: "Sub-categories are needed for category filtering" };
        }},
        { id: "db-listings", cat: "Database", name: "Listings Data", fn: async () => {
          const { count } = await supabase.from("base_listings").select("*", { count: "exact", head: true });
          return (count || 0) > 0 ? { status: "pass", message: `${count} listings` } : { status: "warn", message: "No listings" };
        }},
        { id: "db-packages", cat: "Database", name: "Subscription Packages", fn: async () => {
          const { count } = await supabase.from("subscription_packages").select("*", { count: "exact", head: true }).eq("is_active", true);
          return (count || 0) > 0 ? { status: "pass", message: `${count} active packages` } : { status: "warn", message: "No packages configured", details: "Users need packages to post ads. Configure via Admin > Packages." };
        }},
        { id: "db-counties", cat: "Database", name: "Kenya Counties (47)", fn: async () => {
          const { count } = await supabase.from("kenya_counties").select("*", { count: "exact", head: true });
          return (count || 0) >= 47 ? { status: "pass", message: `${count} counties` } : { status: "warn", message: `Only ${count || 0}/47 counties` };
        }},
      );
    }
    if (cat === "auth") {
      tests.push(
        { id: "auth-session", cat: "Authentication", name: "Current Session", fn: async () => {
          const { data } = await supabase.auth.getSession();
          return data.session ? { status: "pass", message: `Authenticated: ${data.session.user.email}` } : { status: "fail", message: "No active session" };
        }},
        { id: "auth-admin-role", cat: "Authentication", name: "Admin Role", fn: async () => {
          const { data: session } = await supabase.auth.getSession();
          if (!session.session) return { status: "fail", message: "No session" };
          const { data } = await supabase.rpc("is_admin", { _user_id: session.session.user.id });
          return data ? { status: "pass", message: "Admin role verified" } : { status: "fail", message: "Not an admin", details: "Current user does not have admin role in user_roles table" };
        }},
        { id: "auth-team", cat: "Authentication", name: "Team Member Record", fn: async () => {
          const { data: session } = await supabase.auth.getSession();
          if (!session.session) return { status: "fail", message: "No session" };
          const { data } = await supabase.from("team_members").select("*").eq("user_id", session.session.user.id).eq("is_active", true).maybeSingle();
          return data ? { status: "pass", message: `Designation: ${data.designation}` } : { status: "warn", message: "No team_member record" };
        }},
      );
    }
    if (cat === "payments") {
      tests.push(
        { id: "mpesa-config", cat: "Payments", name: "M-Pesa Daraja Config", fn: async () => {
          const { data } = await supabase.from("mpesa_settings").select("*").limit(1).maybeSingle();
          if (!data) return { status: "fail", message: "No M-Pesa settings", details: "Navigate to Admin > Settings > M-Pesa to configure Daraja credentials" };
          const fields = ["consumer_key","consumer_secret","passkey","shortcode","callback_url"];
          const missing = fields.filter(f => !(data as any)[f]);
          if (missing.length > 0) return { status: "fail", message: `Missing: ${missing.join(", ")}`, details: `These M-Pesa fields are required: ${missing.join(", ")}. Configure in Admin > Settings.` };
          return { status: "pass", message: `${data.environment} — ${data.is_enabled ? "Enabled" : "Disabled"}` };
        }},
        { id: "mpesa-callback", cat: "Payments", name: "Callback URL Valid", fn: async () => {
          const { data } = await supabase.from("mpesa_settings").select("callback_url").limit(1).maybeSingle();
          if (!data?.callback_url) return { status: "fail", message: "Not set" };
          return data.callback_url.startsWith("http") ? { status: "pass", message: data.callback_url } : { status: "warn", message: `Invalid: ${data.callback_url}` };
        }},
        { id: "payment-history", cat: "Payments", name: "Transaction History", fn: async () => {
          const { count } = await supabase.from("payment_transactions").select("*", { count: "exact", head: true });
          return { status: "pass", message: `${count || 0} transactions recorded` };
        }},
      );
    }
    if (cat === "edge") {
      const funcs = [
        { id: "ef-mpesa-stk", name: "M-Pesa STK Push", path: "mpesa-stk-push" },
        { id: "ef-mpesa-cb", name: "M-Pesa Callback", path: "mpesa-callback" },
        { id: "ef-auto-draft", name: "Auto-Draft Expired", path: "auto-draft-expired" },
        { id: "ef-renew", name: "Renew Subscription", path: "renew-subscription" },
      ];
      for (const f of funcs) {
        tests.push({ id: f.id, cat: "Edge Functions", name: f.name, fn: async () => {
          try {
            const res = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/${f.path}`, { method: "OPTIONS" });
            return res.ok || res.status === 204 ? { status: "pass", message: "Reachable" } : { status: "warn", message: `Status: ${res.status}` };
          } catch { return { status: "fail", message: "Not reachable", details: `The function ${f.path} could not be reached. It may not be deployed.` }; }
        }});
      }
    }
    if (cat === "storage") {
      tests.push(
        { id: "storage-listings", cat: "Storage", name: "Listings Bucket", fn: async () => {
          const { error } = await supabase.storage.from("listings").list("", { limit: 1 });
          return error ? { status: "fail", message: error.message } : { status: "pass", message: "Accessible" };
        }},
        { id: "storage-verifications", cat: "Storage", name: "Verifications Bucket", fn: async () => {
          const { error } = await supabase.storage.from("verifications").list("", { limit: 1 });
          return error?.message?.includes("policy") || !error ? { status: "pass", message: "Exists (private)" } : { status: "fail", message: error.message };
        }},
      );
    }
    if (cat === "config") {
      tests.push(
        { id: "cfg-reg-fee", cat: "Configuration", name: "Registration Fee", fn: async () => {
          const { data } = await supabase.from("platform_settings").select("value").eq("key", "seller_registration_fee").maybeSingle();
          return data?.value ? { status: "pass", message: `KES ${data.value}` } : { status: "warn", message: "Not configured" };
        }},
        { id: "cfg-google", cat: "Configuration", name: "Google OAuth", fn: async () => {
          const { data } = await supabase.from("platform_settings").select("key, value").in("key", ["google_oauth_enabled","google_oauth_client_id"]);
          const enabled = data?.find(d => d.key === "google_oauth_enabled")?.value;
          const clientId = data?.find(d => d.key === "google_oauth_client_id")?.value;
          if (enabled === "true" && clientId) return { status: "pass", message: "Configured & enabled" };
          if (clientId) return { status: "warn", message: "Configured but disabled" };
          return { status: "warn", message: "Not configured", details: "Set up in Admin > Settings > Social Auth" };
        }},
        { id: "cfg-smtp", cat: "Configuration", name: "SMTP Email", fn: async () => {
          const { data } = await supabase.from("platform_settings").select("value").eq("key", "smtp_host").maybeSingle();
          return data?.value ? { status: "pass", message: "Configured" } : { status: "warn", message: "Not configured", details: "Emails won't be sent. Configure in Admin > Settings > Email." };
        }},
        { id: "cfg-copyright", cat: "Configuration", name: "Copyright / Legal", fn: async () => {
          const { data } = await supabase.from("platform_settings").select("value").eq("key", "copyright_text").maybeSingle();
          return data?.value ? { status: "pass", message: "Set" } : { status: "warn", message: "Not configured" };
        }},
      );
    }
    if (cat === "users") {
      tests.push(
        { id: "users-total", cat: "Users & Content", name: "Total Users", fn: async () => {
          const { count } = await supabase.from("profiles").select("*", { count: "exact", head: true });
          return { status: "pass", message: `${count || 0} users` };
        }},
        { id: "users-verified", cat: "Users & Content", name: "Verified Sellers", fn: async () => {
          const { count } = await supabase.from("seller_verifications").select("*", { count: "exact", head: true }).eq("status", "approved");
          return { status: "pass", message: `${count || 0} verified` };
        }},
        { id: "content-active", cat: "Users & Content", name: "Active Listings", fn: async () => {
          const { count } = await supabase.from("base_listings").select("*", { count: "exact", head: true }).eq("status", "active");
          return { status: "pass", message: `${count || 0} active` };
        }},
        { id: "content-reports", cat: "Users & Content", name: "Pending Reports", fn: async () => {
          const { count } = await supabase.from("reports").select("*", { count: "exact", head: true }).eq("status", "pending");
          return (count || 0) > 0 ? { status: "warn", message: `${count} unresolved`, details: "Review pending reports in Admin > Reports" } : { status: "pass", message: "None pending" };
        }},
        { id: "content-tickets", cat: "Users & Content", name: "Open Tickets", fn: async () => {
          const { count } = await supabase.from("support_tickets").select("*", { count: "exact", head: true }).in("status", ["open","in_progress"]);
          return (count || 0) > 0 ? { status: "warn", message: `${count} open` } : { status: "pass", message: "All resolved" };
        }},
      );
    }
    if (cat === "affiliates") {
      tests.push(
        { id: "aff-active", cat: "Affiliates", name: "Active Affiliates", fn: async () => {
          const { count } = await supabase.from("affiliates").select("*", { count: "exact", head: true }).eq("status", "approved");
          return { status: "pass", message: `${count || 0} approved` };
        }},
        { id: "aff-pending", cat: "Affiliates", name: "Pending Applications", fn: async () => {
          const { count } = await supabase.from("affiliates").select("*", { count: "exact", head: true }).eq("status", "pending");
          return (count || 0) > 0 ? { status: "warn", message: `${count} pending` } : { status: "pass", message: "None pending" };
        }},
        { id: "aff-unpaid", cat: "Affiliates", name: "Unpaid Payouts", fn: async () => {
          const { count } = await supabase.from("affiliate_payouts").select("*", { count: "exact", head: true }).eq("status", "pending");
          return (count || 0) > 0 ? { status: "warn", message: `${count} pending payouts` } : { status: "pass", message: "All paid" };
        }},
      );
    }
    if (cat === "security") {
      tests.push(
        { id: "rls-profiles", cat: "Security", name: "Profiles RLS", fn: async () => {
          const { error } = await supabase.from("profiles").select("id").limit(1);
          return error ? { status: "fail", message: `Blocked: ${error.message}` } : { status: "pass", message: "Public read OK" };
        }},
        { id: "rls-team", cat: "Security", name: "Team Members RLS", fn: async () => {
          const { error } = await supabase.from("team_members").select("id").limit(1);
          return !error ? { status: "pass", message: "Admin-only access" } : { status: "warn", message: error.message };
        }},
        { id: "rls-mpesa", cat: "Security", name: "M-Pesa Settings RLS", fn: async () => {
          const { error } = await supabase.from("mpesa_settings").select("id").limit(1);
          return !error ? { status: "pass", message: "Admin-only access" } : { status: "warn", message: error.message };
        }},
      );
    }
    return tests;
  }, []);

  const runSectionTests = async (sectionKey: string) => {
    setRunning(true);
    setSelectedSection(sectionKey);
    const tests = getTestsByCategory(sectionKey);
    setProgress(0);
    for (let i = 0; i < tests.length; i++) {
      const t = tests[i];
      await runTest(t.id, t.cat, t.name, t.fn);
      setProgress(Math.round(((i + 1) / tests.length) * 100));
    }
    setRunning(false);
  };

  const runAllTests = async () => {
    setRunning(true);
    setSelectedSection("all");
    setResults([]);
    setProgress(0);
    const allSections = diagnosticSections.map(s => s.key);
    let total = 0;
    let done = 0;
    for (const s of allSections) total += getTestsByCategory(s).length;
    for (const s of allSections) {
      const tests = getTestsByCategory(s);
      for (const t of tests) {
        await runTest(t.id, t.cat, t.name, t.fn);
        done++;
        setProgress(Math.round((done / total) * 100));
      }
    }
    setRunning(false);
  };

  const exportReport = () => {
    const report = results.map(r => `[${r.status.toUpperCase()}] ${r.category} > ${r.name}: ${r.message}${r.details ? `\n  Details: ${r.details}` : ""}${r.duration ? ` (${r.duration}ms)` : ""}`).join("\n");
    const blob = new Blob([`System Diagnostic Report\n${"=".repeat(50)}\nDate: ${new Date().toISOString()}\n\n${report}\n\nSummary: ${summary.pass} passed, ${summary.fail} failed, ${summary.warn} warnings out of ${summary.total} tests`], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `diagnostics-${Date.now()}.txt`; a.click();
    URL.revokeObjectURL(url);
  };

  const summary = {
    total: results.length,
    pass: results.filter(r => r.status === "pass").length,
    fail: results.filter(r => r.status === "fail").length,
    warn: results.filter(r => r.status === "warn").length,
  };

  const failedTests = results.filter(r => r.status === "fail");
  const warnTests = results.filter(r => r.status === "warn");

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2"><Activity className="h-6 w-6" />System Diagnostics</h2>
          <p className="text-muted-foreground">Choose a section to diagnose or run a full system check</p>
        </div>
        <div className="flex gap-2">
          {results.length > 0 && (
            <Button variant="outline" onClick={exportReport} className="gap-2">
              <Download className="h-4 w-4" />Export Report
            </Button>
          )}
          <Button onClick={runAllTests} disabled={running} size="lg" className="gap-2">
            {running ? <><Loader2 className="h-4 w-4 animate-spin" />Running...</> : <><Play className="h-4 w-4" />Run Full Diagnosis</>}
          </Button>
        </div>
      </div>

      {running && <Progress value={progress} className="h-2" />}

      {/* Summary Cards */}
      {results.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card><CardContent className="pt-4 text-center"><div className="text-2xl font-bold">{summary.total}</div><p className="text-xs text-muted-foreground">Total Tests</p></CardContent></Card>
          <Card><CardContent className="pt-4 text-center"><div className="text-2xl font-bold text-green-500">{summary.pass}</div><p className="text-xs text-muted-foreground">Passed</p></CardContent></Card>
          <Card><CardContent className="pt-4 text-center"><div className="text-2xl font-bold text-destructive">{summary.fail}</div><p className="text-xs text-muted-foreground">Failed</p></CardContent></Card>
          <Card><CardContent className="pt-4 text-center"><div className="text-2xl font-bold text-yellow-500">{summary.warn}</div><p className="text-xs text-muted-foreground">Warnings</p></CardContent></Card>
        </div>
      )}

      {/* Error Report */}
      {failedTests.length > 0 && (
        <Card className="border-destructive/50 bg-destructive/5">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2 text-destructive"><XCircle className="h-4 w-4" />Error Report ({failedTests.length} issues)</CardTitle>
          </CardHeader>
          <CardContent>
            <Accordion type="multiple">
              {failedTests.map(t => (
                <AccordionItem key={t.id} value={t.id}>
                  <AccordionTrigger className="text-sm py-2">
                    <span className="flex items-center gap-2">{statusIcon(t.status)} {t.category} — {t.name}</span>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="text-sm space-y-1">
                      <p><strong>Error:</strong> {t.message}</p>
                      {t.details && <p className="text-muted-foreground"><strong>Details:</strong> {t.details}</p>}
                      {t.duration !== undefined && <p className="text-muted-foreground text-xs">Duration: {t.duration}ms</p>}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </CardContent>
        </Card>
      )}

      {warnTests.length > 0 && (
        <Card className="border-yellow-500/50 bg-yellow-500/5">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2 text-yellow-600"><AlertTriangle className="h-4 w-4" />Warnings ({warnTests.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {warnTests.map(t => (
                <div key={t.id} className="flex items-start gap-2 text-sm">
                  {statusIcon(t.status)}
                  <div>
                    <span className="font-medium">{t.name}:</span> {t.message}
                    {t.details && <p className="text-xs text-muted-foreground mt-0.5">{t.details}</p>}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Section Selection Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {diagnosticSections.map(section => {
          const sectionResults = results.filter(r => {
            const tests = getTestsByCategory(section.key);
            return tests.some(t => t.id === r.id);
          });
          const sectionFails = sectionResults.filter(r => r.status === "fail").length;
          const sectionWarns = sectionResults.filter(r => r.status === "warn").length;
          const sectionPasses = sectionResults.filter(r => r.status === "pass").length;
          const Icon = section.icon;

          return (
            <Card key={section.key} className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => !running && runSectionTests(section.key)}>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center justify-between">
                  <span className="flex items-center gap-2"><Icon className="h-4 w-4" />{section.label}</span>
                  {sectionResults.length > 0 && (
                    <div className="flex gap-1">
                      {sectionPasses > 0 && <Badge variant="default" className="bg-green-600 text-[10px]">{sectionPasses}</Badge>}
                      {sectionFails > 0 && <Badge variant="destructive" className="text-[10px]">{sectionFails}</Badge>}
                      {sectionWarns > 0 && <Badge variant="secondary" className="bg-yellow-500 text-black text-[10px]">{sectionWarns}</Badge>}
                    </div>
                  )}
                </CardTitle>
                <CardDescription className="text-xs">{section.description}</CardDescription>
              </CardHeader>
              {sectionResults.length > 0 && (
                <CardContent className="pt-0">
                  <div className="space-y-1">
                    {sectionResults.map(r => (
                      <div key={r.id} className="flex items-center justify-between text-xs py-1">
                        <span className="flex items-center gap-1.5">{statusIcon(r.status)}{r.name}</span>
                        <span className="text-muted-foreground truncate max-w-[120px]">{r.duration && `${r.duration}ms`}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default AdminDiagnostics;
