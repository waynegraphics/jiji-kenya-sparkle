import { useState } from "react";
import { Link } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Briefcase, MapPin, Clock, DollarSign, ArrowRight, Users, Target, Heart, Home, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

interface JobOpening {
  id: string;
  title: string;
  department: string;
  location: string;
  type: "Full-time" | "Part-time" | "Contract" | "Internship";
  salary?: string;
  description: string;
  requirements: string[];
}

const Careers = () => {
  const [selectedDepartment, setSelectedDepartment] = useState<string>("All");

  const jobOpenings: JobOpening[] = [
    {
      id: "1",
      title: "Senior Frontend Developer",
      department: "Engineering",
      location: "Nairobi, Kenya / Remote",
      type: "Full-time",
      salary: "Competitive",
      description: "We're looking for an experienced frontend developer to help build and improve our marketplace platform using React, TypeScript, and modern web technologies.",
      requirements: [
        "5+ years of frontend development experience",
        "Strong proficiency in React and TypeScript",
        "Experience with modern CSS frameworks",
        "Knowledge of state management solutions",
      ],
    },
    {
      id: "2",
      title: "Product Designer",
      department: "Design",
      location: "Nairobi, Kenya",
      type: "Full-time",
      salary: "Competitive",
      description: "Join our design team to create beautiful, intuitive user experiences that make buying and selling easier for our users.",
      requirements: [
        "3+ years of product design experience",
        "Strong portfolio showcasing UX/UI work",
        "Proficiency in Figma or similar tools",
        "Understanding of user research methods",
      ],
    },
    {
      id: "3",
      title: "Customer Support Specialist",
      department: "Support",
      location: "Nairobi, Kenya",
      type: "Full-time",
      salary: "Competitive",
      description: "Help our users succeed by providing excellent customer support through various channels and resolving issues efficiently.",
      requirements: [
        "2+ years of customer support experience",
        "Excellent communication skills",
        "Problem-solving mindset",
        "Ability to work in a fast-paced environment",
      ],
    },
    {
      id: "4",
      title: "Marketing Manager",
      department: "Marketing",
      location: "Nairobi, Kenya / Hybrid",
      type: "Full-time",
      salary: "Competitive",
      description: "Lead our marketing efforts to grow our user base and increase brand awareness across Kenya.",
      requirements: [
        "4+ years of marketing experience",
        "Experience with digital marketing channels",
        "Strong analytical skills",
        "Knowledge of the Kenyan market",
      ],
    },
  ];

  const departments = ["All", "Engineering", "Design", "Support", "Marketing", "Sales"];

  const filteredJobs = selectedDepartment === "All"
    ? jobOpenings
    : jobOpenings.filter((job) => job.department === selectedDepartment);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Modern Hero Section */}
      <section className="relative bg-gradient-to-br from-primary/30 via-primary/20 to-primary/10 border-b overflow-hidden">
        <div className="absolute inset-0 opacity-5" style={{
          backgroundImage: `linear-gradient(to right, currentColor 1px, transparent 1px), linear-gradient(to bottom, currentColor 1px, transparent 1px)`,
          backgroundSize: '40px 40px'
        }}></div>
        <div className="container mx-auto px-4 py-16 md:py-24 relative">
          {/* Breadcrumb */}
          <Breadcrumb className="mb-6">
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link to="/" className="flex items-center gap-1">
                    <Home className="h-4 w-4" />
                    Home
                  </Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator>
                <ChevronRight className="h-4 w-4" />
              </BreadcrumbSeparator>
              <BreadcrumbItem>
                <BreadcrumbPage>Careers</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>

          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-primary/20 text-primary px-4 py-2 rounded-full text-sm font-medium mb-6 backdrop-blur-sm">
              <Briefcase className="h-5 w-5" />
              Join Our Team
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
              Careers
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto">
              Join us in building Kenya's premier online marketplace
            </p>
          </div>
        </div>
      </section>

      <main className="container mx-auto py-8 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-4">Careers at APA Bazaar</h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Help us build Kenya's most trusted marketplace. Join a team that's passionate about 
              connecting buyers and sellers.
            </p>
          </div>

          {/* Why Work With Us */}
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            <div className="bg-card rounded-xl p-6 shadow-sm border border-border">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <Target className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Mission-Driven</h3>
              <p className="text-sm text-muted-foreground">
                Work on products that make a real difference in people's lives and help grow Kenya's economy.
              </p>
            </div>
            <div className="bg-card rounded-xl p-6 shadow-sm border border-border">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Great Team</h3>
              <p className="text-sm text-muted-foreground">
                Collaborate with talented, passionate people who care about building great products.
              </p>
            </div>
            <div className="bg-card rounded-xl p-6 shadow-sm border border-border">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <Heart className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Work-Life Balance</h3>
              <p className="text-sm text-muted-foreground">
                Flexible working arrangements and a supportive environment that values your well-being.
              </p>
            </div>
          </div>

          {/* Department Filter */}
          <div className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">Open Positions</h2>
            <div className="flex flex-wrap gap-2 mb-6">
              {departments.map((dept) => (
                <button
                  key={dept}
                  onClick={() => setSelectedDepartment(dept)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    selectedDepartment === dept
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground hover:bg-muted/80"
                  }`}
                >
                  {dept}
                </button>
              ))}
            </div>
          </div>

          {/* Job Listings */}
          {filteredJobs.length > 0 ? (
            <div className="space-y-6">
              {filteredJobs.map((job) => (
                <div
                  key={job.id}
                  className="bg-card rounded-xl p-6 shadow-sm border border-border hover:shadow-md transition-all"
                >
                  <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl font-semibold">{job.title}</h3>
                        <Badge>{job.department}</Badge>
                      </div>
                      <p className="text-muted-foreground mb-4">{job.description}</p>
                      <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mb-4">
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4" />
                          {job.location}
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4" />
                          {job.type}
                        </div>
                        {job.salary && (
                          <div className="flex items-center gap-2">
                            <DollarSign className="h-4 w-4" />
                            {job.salary}
                          </div>
                        )}
                      </div>
                      <div className="mb-4">
                        <h4 className="font-semibold text-sm mb-2">Key Requirements:</h4>
                        <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground ml-2">
                          {job.requirements.map((req, index) => (
                            <li key={index}>{req}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                    <div className="flex-shrink-0">
                      <Button asChild>
                        <a href={`/careers/apply/${job.id}`}>
                          Apply Now <ArrowRight className="h-4 w-4 ml-2" />
                        </a>
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
              <p className="text-muted-foreground">
                Check back later for new opportunities.
              </p>
            </div>
          )}

          {/* General Application */}
          <div className="mt-12 bg-gradient-to-r from-primary/10 to-primary/5 rounded-xl p-8 text-center">
            <h2 className="text-2xl font-semibold mb-4">Don't See a Role That Fits?</h2>
            <p className="text-muted-foreground mb-6">
              We're always looking for talented people. Send us your resume and we'll keep you in 
              mind for future opportunities.
            </p>
            <Button asChild>
              <a href="/contact-us">
                Send General Application <ArrowRight className="h-4 w-4 ml-2" />
              </a>
            </Button>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Careers;
