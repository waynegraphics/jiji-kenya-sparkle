import { Link } from "react-router-dom";
import { Home, ChevronRight, Sparkles } from "lucide-react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

interface PageHeroProps {
  title: string;
  subtitle: string;
  badge: string;
  badgeIcon: React.ComponentType<{ className?: string }>;
  breadcrumbLabel: string;
}

const PageHero = ({ title, subtitle, badge, badgeIcon: BadgeIcon, breadcrumbLabel }: PageHeroProps) => {
  return (
    <section className="relative overflow-hidden border-b border-border/50">
      {/* Background layers */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary/90 to-primary/70" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,hsl(var(--secondary)/0.3),transparent)]" />
      
      {/* Geometric decorations */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-secondary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-secondary/15 rounded-full blur-2xl translate-y-1/2 -translate-x-1/4" />
      
      {/* Dot pattern */}
      <div className="absolute inset-0 opacity-[0.07]" style={{
        backgroundImage: `radial-gradient(circle, hsl(var(--primary-foreground)) 1px, transparent 1px)`,
        backgroundSize: '24px 24px'
      }} />

      <div className="container mx-auto px-4 py-8 sm:py-12 md:py-20 relative z-10">
        {/* Breadcrumb */}
        <Breadcrumb className="mb-8">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link to="/" className="flex items-center gap-1.5 text-primary-foreground/70 hover:text-primary-foreground transition-colors text-sm">
                  <Home className="h-3.5 w-3.5" />
                  Home
                </Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator>
              <ChevronRight className="h-3.5 w-3.5 text-primary-foreground/40" />
            </BreadcrumbSeparator>
            <BreadcrumbItem>
              <BreadcrumbPage className="text-primary-foreground font-medium text-sm">{breadcrumbLabel}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <div className="max-w-3xl">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-primary-foreground/15 backdrop-blur-md text-primary-foreground px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider mb-5 border border-primary-foreground/10">
            <BadgeIcon className="h-3.5 w-3.5" />
            {badge}
          </div>
          
          {/* Title */}
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold text-primary-foreground mb-3 sm:mb-4 leading-tight tracking-tight">
            {title}
          </h1>
          
          {/* Subtitle */}
          <p className="text-base md:text-lg text-primary-foreground/75 max-w-2xl leading-relaxed">
            {subtitle}
          </p>
        </div>
      </div>
    </section>
  );
};

export default PageHero;
