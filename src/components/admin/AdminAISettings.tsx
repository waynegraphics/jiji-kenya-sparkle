import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Brain, Settings, BarChart3, Shield, Loader2 } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { format } from "date-fns";

const PROVIDERS = [
  { value: "gemini", label: "Google Gemini (Default)", requiresKey: false },
  { value: "openai", label: "OpenAI", requiresKey: true },
  { value: "claude", label: "Claude", requiresKey: true },
];

const MODELS: Record<string, { value: string; label: string }[]> = {
  gemini: [
    { value: "google/gemini-3-flash-preview", label: "Gemini 3 Flash (Fast)" },
    { value: "google/gemini-2.5-flash", label: "Gemini 2.5 Flash (Balanced)" },
    { value: "google/gemini-2.5-pro", label: "Gemini 2.5 Pro (Best)" },
    { value: "google/gemini-3-pro-preview", label: "Gemini 3 Pro (Next-gen)" },
  ],
  openai: [
    { value: "openai/gpt-5-nano", label: "GPT-5 Nano (Fast)" },
    { value: "openai/gpt-5-mini", label: "GPT-5 Mini (Balanced)" },
    { value: "openai/gpt-5", label: "GPT-5 (Best)" },
  ],
  claude: [
    { value: "openai/gpt-5-mini", label: "Default (via Gateway)" },
  ],
};

const AdminAISettings = () => {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    provider: "gemini",
    model: "google/gemini-3-flash-preview",
    temperature: 0.2,
    enable_smart_search: true,
    enable_seller_assistant: true,
    enable_price_suggestion: true,
    enable_seo_optimization: true,
    openai_api_key: "",
    claude_api_key: "",
  });

  const { data: settings, isLoading } = useQuery({
    queryKey: ["ai-settings"],
    queryFn: async () => {
      const { data, error } = await supabase.from("ai_settings").select("*").limit(1).single();
      if (error) throw error;
      return data;
    },
  });

  const { data: usageLogs } = useQuery({
    queryKey: ["ai-usage-logs"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("ai_usage_logs")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(50);
      if (error) throw error;
      return data;
    },
  });

  const { data: usageStats } = useQuery({
    queryKey: ["ai-usage-stats"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("ai_usage_logs")
        .select("action_type, success");
      if (error) throw error;
      const stats = {
        total: data.length,
        search: data.filter(l => l.action_type === "search").length,
        generate: data.filter(l => l.action_type?.startsWith("generate") || l.action_type === "full_optimize").length,
        price: data.filter(l => l.action_type === "price_suggestion").length,
        errors: data.filter(l => !l.success).length,
      };
      return stats;
    },
  });

  useEffect(() => {
    if (settings) {
      setFormData({
        provider: settings.provider || "gemini",
        model: settings.model || "google/gemini-3-flash-preview",
        temperature: Number(settings.temperature) || 0.2,
        enable_smart_search: settings.enable_smart_search ?? true,
        enable_seller_assistant: settings.enable_seller_assistant ?? true,
        enable_price_suggestion: settings.enable_price_suggestion ?? true,
        enable_seo_optimization: settings.enable_seo_optimization ?? true,
        openai_api_key: settings.openai_api_key || "",
        claude_api_key: settings.claude_api_key || "",
      });
    }
  }, [settings]);

  const saveMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from("ai_settings")
        .update({
          provider: formData.provider,
          model: formData.model,
          temperature: formData.temperature,
          enable_smart_search: formData.enable_smart_search,
          enable_seller_assistant: formData.enable_seller_assistant,
          enable_price_suggestion: formData.enable_price_suggestion,
          enable_seo_optimization: formData.enable_seo_optimization,
          openai_api_key: formData.openai_api_key || null,
          claude_api_key: formData.claude_api_key || null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", settings!.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ai-settings"] });
      toast.success("AI settings saved successfully");
    },
    onError: () => toast.error("Failed to save settings"),
  });

  if (isLoading) {
    return <div className="flex items-center justify-center p-12"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }

  const currentProvider = PROVIDERS.find(p => p.value === formData.provider);
  const availableModels = MODELS[formData.provider] || MODELS.gemini;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Brain className="h-8 w-8 text-primary" />
        <div>
          <h2 className="text-2xl font-bold">AI Engine Settings</h2>
          <p className="text-muted-foreground">Configure the AI-powered features for your marketplace</p>
        </div>
      </div>

      <Tabs defaultValue="provider">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="provider" className="gap-2"><Settings className="h-4 w-4" /> Provider</TabsTrigger>
          <TabsTrigger value="modules" className="gap-2"><Brain className="h-4 w-4" /> Modules</TabsTrigger>
          <TabsTrigger value="usage" className="gap-2"><BarChart3 className="h-4 w-4" /> Usage</TabsTrigger>
        </TabsList>

        <TabsContent value="provider" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle>AI Provider</CardTitle>
              <CardDescription>Select your preferred AI provider and configure model settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label>Provider</Label>
                <Select value={formData.provider} onValueChange={(v) => {
                  setFormData(prev => ({
                    ...prev,
                    provider: v,
                    model: MODELS[v]?.[0]?.value || prev.model,
                  }));
                }}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {PROVIDERS.map(p => (
                      <SelectItem key={p.value} value={p.value}>
                        {p.label}
                        {!p.requiresKey && <Badge variant="secondary" className="ml-2 text-xs">Free</Badge>}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {currentProvider?.requiresKey && formData.provider === "openai" && (
                <div className="space-y-2">
                  <Label>OpenAI API Key</Label>
                  <Input
                    type="password"
                    value={formData.openai_api_key}
                    onChange={(e) => setFormData(prev => ({ ...prev, openai_api_key: e.target.value }))}
                    placeholder="sk-..."
                  />
                </div>
              )}

              {currentProvider?.requiresKey && formData.provider === "claude" && (
                <div className="space-y-2">
                  <Label>Claude API Key</Label>
                  <Input
                    type="password"
                    value={formData.claude_api_key}
                    onChange={(e) => setFormData(prev => ({ ...prev, claude_api_key: e.target.value }))}
                    placeholder="sk-ant-..."
                  />
                </div>
              )}

              <div className="space-y-2">
                <Label>Model</Label>
                <Select value={formData.model} onValueChange={(v) => setFormData(prev => ({ ...prev, model: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {availableModels.map(m => (
                      <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label>Temperature: {formData.temperature.toFixed(1)}</Label>
                  <span className="text-xs text-muted-foreground">
                    {formData.temperature <= 0.3 ? "Precise & Structured" : formData.temperature <= 0.6 ? "Balanced" : "Creative"}
                  </span>
                </div>
                <Slider
                  value={[formData.temperature]}
                  onValueChange={([v]) => setFormData(prev => ({ ...prev, temperature: v }))}
                  min={0}
                  max={1}
                  step={0.1}
                />
              </div>

              <Button onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending}>
                {saveMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                Save Provider Settings
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="modules" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle>AI Modules</CardTitle>
              <CardDescription>Toggle individual AI features on or off</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {[
                { key: "enable_smart_search", label: "Smart Search AI", desc: "Parse natural language search queries into structured filters" },
                { key: "enable_seller_assistant", label: "Seller Assistant AI", desc: "Help sellers optimize titles, descriptions, and listings" },
                { key: "enable_price_suggestion", label: "Price Suggestion AI", desc: "Suggest competitive prices based on market data" },
                { key: "enable_seo_optimization", label: "SEO Optimization AI", desc: "Generate SEO keywords and meta descriptions" },
              ].map(module => (
                <div key={module.key} className="flex items-center justify-between border rounded-lg p-4">
                  <div>
                    <p className="font-medium">{module.label}</p>
                    <p className="text-sm text-muted-foreground">{module.desc}</p>
                  </div>
                  <Switch
                    checked={(formData as any)[module.key]}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, [module.key]: checked }))}
                  />
                </div>
              ))}
              <Button onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending}>
                {saveMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                Save Module Settings
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="usage" className="space-y-4 mt-4">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {[
              { label: "Total Requests", value: usageStats?.total || 0, color: "text-primary" },
              { label: "Searches", value: usageStats?.search || 0, color: "text-blue-500" },
              { label: "Generations", value: usageStats?.generate || 0, color: "text-green-500" },
              { label: "Price Suggestions", value: usageStats?.price || 0, color: "text-amber-500" },
              { label: "Errors", value: usageStats?.errors || 0, color: "text-destructive" },
            ].map(stat => (
              <Card key={stat.label}>
                <CardContent className="p-4 text-center">
                  <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Recent AI Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Time</TableHead>
                    <TableHead>Action</TableHead>
                    <TableHead>Prompt</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {usageLogs?.map(log => (
                    <TableRow key={log.id}>
                      <TableCell className="text-xs">{format(new Date(log.created_at), "MMM d, HH:mm")}</TableCell>
                      <TableCell>
                        <Badge variant={log.action_type === "search" ? "default" : "secondary"}>
                          {log.action_type}
                        </Badge>
                      </TableCell>
                      <TableCell className="max-w-[200px] truncate text-sm">{log.prompt_summary}</TableCell>
                      <TableCell>
                        <Badge variant={log.success ? "default" : "destructive"}>
                          {log.success ? "OK" : "Error"}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                  {(!usageLogs || usageLogs.length === 0) && (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                        No AI usage logs yet
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminAISettings;
