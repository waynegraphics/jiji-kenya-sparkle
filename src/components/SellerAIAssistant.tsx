import { useState } from "react";
import { useAIAssistant } from "@/hooks/useAIAssistant";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Loader2, X, Wand2, DollarSign, FileText, Lightbulb } from "lucide-react";

interface SellerAIAssistantProps {
  category: string;
  title: string;
  description: string;
  price: string;
  location: string;
  categoryFields: Record<string, unknown>;
  onApplyTitle?: (title: string) => void;
  onApplyDescription?: (description: string) => void;
  onApplyPrice?: (price: string) => void;
}

const SellerAIAssistant = ({
  category,
  title,
  description,
  price,
  location,
  categoryFields,
  onApplyTitle,
  onApplyDescription,
  onApplyPrice,
}: SellerAIAssistantProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const { generateListing, suggestPrice, isLoading, result, setResult } = useAIAssistant();

  const handleAction = async (action: "generate_title" | "generate_description" | "suggest_price" | "full_optimize") => {
    if (action === "suggest_price") {
      await suggestPrice({ category, title, location, categoryFields });
    } else {
      await generateListing({
        action,
        category,
        title,
        description,
        price,
        location,
        categoryFields,
      });
    }
  };

  if (!isOpen) {
    return (
      <div className="fixed bottom-6 right-6 z-50">
        <Button
          type="button"
          size="icon"
          className="h-14 w-14 rounded-full shadow-lg bg-primary hover:bg-primary/90 text-primary-foreground"
          onClick={() => setIsOpen(true)}
        >
          <Sparkles className="h-6 w-6" />
        </Button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 w-[90vw] max-w-sm">
    <Card className="border-primary/20 bg-primary/5 shadow-2xl">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" />
            AI Listing Assistant
          </CardTitle>
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => { setIsOpen(false); setResult(null); }}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-2 gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="gap-1.5 text-xs"
            onClick={() => handleAction("generate_title")}
            disabled={isLoading}
          >
            <Wand2 className="h-3.5 w-3.5" /> Better Title
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="gap-1.5 text-xs"
            onClick={() => handleAction("generate_description")}
            disabled={isLoading}
          >
            <FileText className="h-3.5 w-3.5" /> Better Description
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="gap-1.5 text-xs"
            onClick={() => handleAction("suggest_price")}
            disabled={isLoading}
          >
            <DollarSign className="h-3.5 w-3.5" /> Suggest Price
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="gap-1.5 text-xs"
            onClick={() => handleAction("full_optimize")}
            disabled={isLoading}
          >
            <Lightbulb className="h-3.5 w-3.5" /> Full Optimize
          </Button>
        </div>

        {isLoading && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground py-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            AI is analyzing your listing...
          </div>
        )}

        {result && (
          <div className="space-y-3 border-t pt-3">
            {result.title && (
              <div className="space-y-1">
                <p className="text-xs font-medium text-muted-foreground">Suggested Title</p>
                <div className="flex items-center gap-2">
                  <p className="text-sm flex-1 bg-background rounded p-2">{result.title}</p>
                  {onApplyTitle && (
                    <Button type="button" size="sm" variant="default" className="text-xs shrink-0"
                      onClick={() => onApplyTitle(result.title!)}>
                      Apply
                    </Button>
                  )}
                </div>
              </div>
            )}

            {result.description && (
              <div className="space-y-1">
                <p className="text-xs font-medium text-muted-foreground">Suggested Description</p>
                <div className="space-y-1">
                  <p className="text-sm bg-background rounded p-2 max-h-32 overflow-y-auto whitespace-pre-wrap">{result.description}</p>
                  {onApplyDescription && (
                    <Button type="button" size="sm" variant="default" className="text-xs"
                      onClick={() => onApplyDescription(result.description!)}>
                      Apply Description
                    </Button>
                  )}
                </div>
              </div>
            )}

            {(result.suggested_price || result.price_min) && (
              <div className="space-y-1">
                <p className="text-xs font-medium text-muted-foreground">Price Suggestion</p>
                <div className="flex items-center gap-2 flex-wrap">
                  {result.suggested_price && (
                    <Badge variant="default" className="text-sm">KSh {result.suggested_price.toLocaleString()}</Badge>
                  )}
                  {result.price_min && result.price_max && (
                    <Badge variant="outline" className="text-xs">
                      Range: KSh {result.price_min.toLocaleString()} - KSh {result.price_max.toLocaleString()}
                    </Badge>
                  )}
                  {result.market_position && (
                    <Badge variant="secondary" className="text-xs capitalize">{result.market_position.replace("_", " ")}</Badge>
                  )}
                  {onApplyPrice && result.suggested_price && (
                    <Button type="button" size="sm" variant="default" className="text-xs"
                      onClick={() => onApplyPrice(String(result.suggested_price))}>
                      Apply
                    </Button>
                  )}
                </div>
                {result.reasoning && (
                  <p className="text-xs text-muted-foreground mt-1">{result.reasoning}</p>
                )}
              </div>
            )}

            {result.seo_keywords && result.seo_keywords.length > 0 && (
              <div className="space-y-1">
                <p className="text-xs font-medium text-muted-foreground">SEO Keywords</p>
                <div className="flex flex-wrap gap-1">
                  {result.seo_keywords.map((kw, i) => (
                    <Badge key={i} variant="outline" className="text-xs">{kw}</Badge>
                  ))}
                </div>
              </div>
            )}

            {result.tips && result.tips.length > 0 && (
              <div className="space-y-1">
                <p className="text-xs font-medium text-muted-foreground">Tips</p>
                <ul className="text-xs text-muted-foreground space-y-1 list-disc list-inside">
                  {result.tips.map((tip, i) => <li key={i}>{tip}</li>)}
                </ul>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
    </div>
  );
};

export default SellerAIAssistant;
