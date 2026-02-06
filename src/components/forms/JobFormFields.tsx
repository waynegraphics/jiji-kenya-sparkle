import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { JobFormData } from "@/types/categories";
import { X } from "lucide-react";
import { useState, useEffect } from "react";

interface JobFormFieldsProps {
  data: Partial<JobFormData>;
  onChange: (data: Partial<JobFormData>) => void;
  errors: Record<string, string>;
}

const jobTypes = [
  { value: "full_time", label: "Full Time" },
  { value: "part_time", label: "Part Time" },
  { value: "contract", label: "Contract" },
  { value: "temporary", label: "Temporary" },
  { value: "internship", label: "Internship" },
  { value: "volunteer", label: "Volunteer" },
  { value: "freelance", label: "Freelance" },
];

const experienceLevels = [
  { value: "no_experience", label: "No Experience Required" },
  { value: "entry", label: "Entry Level (0-2 years)" },
  { value: "mid", label: "Mid Level (2-5 years)" },
  { value: "senior", label: "Senior Level (5-10 years)" },
  { value: "executive", label: "Executive (10+ years)" },
];

const industries = [
  "Accounting & Finance", "Agriculture", "Automotive", "Banking",
  "Construction", "Consulting", "Education", "Energy & Utilities",
  "Entertainment", "Government", "Healthcare", "Hospitality & Tourism",
  "Human Resources", "Information Technology", "Insurance", "Legal",
  "Manufacturing", "Marketing & Advertising", "Media", "NGO & Non-Profit",
  "Real Estate", "Retail", "Sales", "Security", "Telecommunications",
  "Transportation & Logistics", "Other"
];

const educationLevels = [
  "High School / O-Level", "A-Level / Diploma", "Bachelor's Degree",
  "Master's Degree", "PhD / Doctorate", "Professional Certification",
  "Vocational Training", "No Formal Education Required"
];

const salaryPeriods = [
  { value: "hourly", label: "Per Hour" },
  { value: "daily", label: "Per Day" },
  { value: "weekly", label: "Per Week" },
  { value: "monthly", label: "Per Month" },
  { value: "yearly", label: "Per Year" },
];

const applicationMethods = [
  { value: "apply_here", label: "Apply Through This Platform" },
  { value: "email", label: "Send Email" },
  { value: "website", label: "Apply on Company Website" },
  { value: "phone", label: "Call to Apply" },
  { value: "in_person", label: "Apply in Person" },
];

const commonSkills = [
  "Communication", "Teamwork", "Problem Solving", "Leadership", "Time Management",
  "Microsoft Office", "Excel", "Data Analysis", "Project Management", "Customer Service",
  "Sales", "Marketing", "Social Media", "Python", "JavaScript", "SQL", "React",
  "Accounting", "Bookkeeping", "Driving License", "First Aid", "Languages"
];

const commonBenefits = [
  "Health Insurance", "NHIF", "NSSF", "Pension", "Paid Leave", "Annual Leave",
  "Sick Leave", "Training & Development", "Career Growth", "Performance Bonus",
  "Flexible Hours", "Remote Work", "Transport Allowance", "Lunch Provided",
  "Company Phone", "Company Car", "Gym Membership", "Team Events"
];

const JobFormFields = ({ data, onChange, errors }: JobFormFieldsProps) => {
  const [selectedSkills, setSelectedSkills] = useState<string[]>(data.required_skills || []);
  const [selectedBenefits, setSelectedBenefits] = useState<string[]>(data.benefits || []);

  useEffect(() => {
    onChange({ ...data, required_skills: selectedSkills, benefits: selectedBenefits });
  }, [selectedSkills, selectedBenefits]);

  const toggleSkill = (skill: string) => {
    setSelectedSkills(prev => 
      prev.includes(skill) ? prev.filter(s => s !== skill) : [...prev, skill]
    );
  };

  const toggleBenefit = (benefit: string) => {
    setSelectedBenefits(prev => 
      prev.includes(benefit) ? prev.filter(b => b !== benefit) : [...prev, benefit]
    );
  };

  return (
    <div className="space-y-6">
      {/* Job Title */}
      <div className="space-y-2">
        <Label>Job Title *</Label>
        <Input
          value={data.job_title || ""}
          onChange={(e) => onChange({ ...data, job_title: e.target.value })}
          placeholder="e.g., Senior Software Engineer"
          className={errors.job_title ? "border-destructive" : ""}
        />
        {errors.job_title && <p className="text-sm text-destructive">{errors.job_title}</p>}
      </div>

      {/* Job Type & Industry */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Job Type *</Label>
          <Select
            value={data.job_type}
            onValueChange={(value) => onChange({ ...data, job_type: value as JobFormData['job_type'] })}
          >
            <SelectTrigger className={errors.job_type ? "border-destructive" : ""}>
              <SelectValue placeholder="Select job type" />
            </SelectTrigger>
            <SelectContent>
              {jobTypes.map((type) => (
                <SelectItem key={type.value} value={type.value}>
                  {type.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.job_type && <p className="text-sm text-destructive">{errors.job_type}</p>}
        </div>

        <div className="space-y-2">
          <Label>Industry *</Label>
          <Select
            value={data.industry}
            onValueChange={(value) => onChange({ ...data, industry: value })}
          >
            <SelectTrigger className={errors.industry ? "border-destructive" : ""}>
              <SelectValue placeholder="Select industry" />
            </SelectTrigger>
            <SelectContent>
              {industries.map((ind) => (
                <SelectItem key={ind} value={ind}>
                  {ind}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.industry && <p className="text-sm text-destructive">{errors.industry}</p>}
        </div>
      </div>

      {/* Experience Level */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Experience Level</Label>
          <Select
            value={data.experience_level || ""}
            onValueChange={(value) => onChange({ ...data, experience_level: value as JobFormData['experience_level'] })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select experience level" />
            </SelectTrigger>
            <SelectContent>
              {experienceLevels.map((exp) => (
                <SelectItem key={exp.value} value={exp.value}>
                  {exp.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Minimum Years of Experience</Label>
          <Input
            type="number"
            value={data.min_experience_years || ""}
            onChange={(e) => onChange({ ...data, min_experience_years: parseInt(e.target.value) || undefined })}
            placeholder="e.g., 3"
            min={0}
          />
        </div>
      </div>

      {/* Education Level */}
      <div className="space-y-2">
        <Label>Education Level</Label>
        <Select
          value={data.education_level || ""}
          onValueChange={(value) => onChange({ ...data, education_level: value })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select minimum education" />
          </SelectTrigger>
          <SelectContent>
            {educationLevels.map((edu) => (
              <SelectItem key={edu} value={edu}>
                {edu}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Company Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Company Name *</Label>
          <Input
            value={data.company_name || ""}
            onChange={(e) => onChange({ ...data, company_name: e.target.value })}
            placeholder="e.g., Safaricom PLC"
            className={errors.company_name ? "border-destructive" : ""}
          />
          {errors.company_name && <p className="text-sm text-destructive">{errors.company_name}</p>}
        </div>

        <div className="space-y-2">
          <Label>Company Website</Label>
          <Input
            type="url"
            value={data.company_website || ""}
            onChange={(e) => onChange({ ...data, company_website: e.target.value })}
            placeholder="https://www.example.com"
          />
        </div>
      </div>

      {/* Salary */}
      <div className="space-y-4">
        <Label>Salary Range</Label>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">Minimum (KES)</Label>
            <Input
              type="number"
              value={data.salary_min || ""}
              onChange={(e) => onChange({ ...data, salary_min: parseFloat(e.target.value) || undefined })}
              placeholder="e.g., 50000"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">Maximum (KES)</Label>
            <Input
              type="number"
              value={data.salary_max || ""}
              onChange={(e) => onChange({ ...data, salary_max: parseFloat(e.target.value) || undefined })}
              placeholder="e.g., 100000"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">Period</Label>
            <Select
              value={data.salary_period || ""}
              onValueChange={(value) => onChange({ ...data, salary_period: value as JobFormData['salary_period'] })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select" />
              </SelectTrigger>
              <SelectContent>
                {salaryPeriods.map((period) => (
                  <SelectItem key={period.value} value={period.value}>
                    {period.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <Label>Salary Negotiable</Label>
            <p className="text-sm text-muted-foreground">Is the salary negotiable?</p>
          </div>
          <Switch
            checked={data.is_salary_negotiable ?? true}
            onCheckedChange={(checked) => onChange({ ...data, is_salary_negotiable: checked })}
          />
        </div>
      </div>

      {/* Remote Work */}
      <div className="flex items-center justify-between">
        <div>
          <Label>Remote Work Available</Label>
          <p className="text-sm text-muted-foreground">Can this job be done remotely?</p>
        </div>
        <Switch
          checked={data.is_remote || false}
          onCheckedChange={(checked) => onChange({ ...data, is_remote: checked })}
        />
      </div>

      {/* Application Method */}
      <div className="space-y-4">
        <div className="space-y-2">
          <Label>How to Apply</Label>
          <Select
            value={data.application_method || ""}
            onValueChange={(value) => onChange({ ...data, application_method: value as JobFormData['application_method'] })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select application method" />
            </SelectTrigger>
            <SelectContent>
              {applicationMethods.map((method) => (
                <SelectItem key={method.value} value={method.value}>
                  {method.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {data.application_method === "email" && (
          <div className="space-y-2">
            <Label>Application Email</Label>
            <Input
              type="email"
              value={data.application_email || ""}
              onChange={(e) => onChange({ ...data, application_email: e.target.value })}
              placeholder="hr@company.com"
            />
          </div>
        )}

        {data.application_method === "website" && (
          <div className="space-y-2">
            <Label>Application URL</Label>
            <Input
              type="url"
              value={data.application_url || ""}
              onChange={(e) => onChange({ ...data, application_url: e.target.value })}
              placeholder="https://careers.company.com/apply"
            />
          </div>
        )}
      </div>

      {/* Application Deadline */}
      <div className="space-y-2">
        <Label>Application Deadline</Label>
        <Input
          type="date"
          value={data.application_deadline?.split('T')[0] || ""}
          onChange={(e) => onChange({ ...data, application_deadline: e.target.value ? new Date(e.target.value).toISOString() : undefined })}
          min={new Date().toISOString().split('T')[0]}
        />
      </div>

      {/* Required Skills */}
      <div className="space-y-3">
        <Label>Required Skills</Label>
        <div className="flex flex-wrap gap-2">
          {commonSkills.map((skill) => (
            <Badge
              key={skill}
              variant={selectedSkills.includes(skill) ? "default" : "outline"}
              className="cursor-pointer transition-colors"
              onClick={() => toggleSkill(skill)}
            >
              {skill}
              {selectedSkills.includes(skill) && <X className="h-3 w-3 ml-1" />}
            </Badge>
          ))}
        </div>
      </div>

      {/* Benefits */}
      <div className="space-y-3">
        <Label>Benefits Offered</Label>
        <div className="flex flex-wrap gap-2">
          {commonBenefits.map((benefit) => (
            <Badge
              key={benefit}
              variant={selectedBenefits.includes(benefit) ? "default" : "outline"}
              className="cursor-pointer transition-colors"
              onClick={() => toggleBenefit(benefit)}
            >
              {benefit}
              {selectedBenefits.includes(benefit) && <X className="h-3 w-3 ml-1" />}
            </Badge>
          ))}
        </div>
      </div>
    </div>
  );
};

export default JobFormFields;
