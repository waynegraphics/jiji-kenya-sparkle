import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";

interface JobFiltersProps {
  filters: Record<string, string>;
  onChange: (key: string, value: string) => void;
}

const jobTypes = ["Any", "Full-time", "Part-time", "Contract", "Internship", "Freelance", "Temporary"];
const experienceLevels = ["Any", "Entry Level", "Mid Level", "Senior Level", "Executive", "No Experience"];
const industries = [
  "Any", "Technology", "Finance", "Healthcare", "Education", "Manufacturing",
  "Retail", "Hospitality", "Construction", "Agriculture", "Media", "Legal"
];
const salaryPeriods = ["Any", "Monthly", "Hourly", "Daily", "Weekly", "Yearly"];

const JobFilters = ({ filters, onChange }: JobFiltersProps) => {
  return (
    <div className="space-y-4 border-t pt-4">
      <h4 className="text-sm font-medium text-muted-foreground">Job Filters</h4>
      
      {/* Job Type */}
      <div className="space-y-2">
        <Label className="text-sm">Job Type</Label>
        <Select
          value={filters.jobType || "Any"}
          onValueChange={(value) => onChange("jobType", value)}
        >
          <SelectTrigger className="h-9">
            <SelectValue placeholder="Any" />
          </SelectTrigger>
          <SelectContent>
            {jobTypes.map((opt) => (
              <SelectItem key={opt} value={opt}>{opt}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Experience Level */}
      <div className="space-y-2">
        <Label className="text-sm">Experience Level</Label>
        <Select
          value={filters.experienceLevel || "Any"}
          onValueChange={(value) => onChange("experienceLevel", value)}
        >
          <SelectTrigger className="h-9">
            <SelectValue placeholder="Any" />
          </SelectTrigger>
          <SelectContent>
            {experienceLevels.map((opt) => (
              <SelectItem key={opt} value={opt}>{opt}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Industry */}
      <div className="space-y-2">
        <Label className="text-sm">Industry</Label>
        <Select
          value={filters.industry || "Any"}
          onValueChange={(value) => onChange("industry", value)}
        >
          <SelectTrigger className="h-9">
            <SelectValue placeholder="Any" />
          </SelectTrigger>
          <SelectContent>
            {industries.map((opt) => (
              <SelectItem key={opt} value={opt}>{opt}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Salary Range */}
      <div className="space-y-2">
        <Label className="text-sm">Salary Range (KES)</Label>
        <div className="flex gap-2">
          <Input
            type="number"
            placeholder="Min"
            className="h-9"
            value={filters.salaryMin || ""}
            onChange={(e) => onChange("salaryMin", e.target.value)}
          />
          <Input
            type="number"
            placeholder="Max"
            className="h-9"
            value={filters.salaryMax || ""}
            onChange={(e) => onChange("salaryMax", e.target.value)}
          />
        </div>
      </div>

      {/* Salary Period */}
      <div className="space-y-2">
        <Label className="text-sm">Salary Period</Label>
        <Select
          value={filters.salaryPeriod || "Any"}
          onValueChange={(value) => onChange("salaryPeriod", value)}
        >
          <SelectTrigger className="h-9">
            <SelectValue placeholder="Any" />
          </SelectTrigger>
          <SelectContent>
            {salaryPeriods.map((opt) => (
              <SelectItem key={opt} value={opt}>{opt}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Remote Work */}
      <div className="flex items-center space-x-2">
        <Checkbox
          id="remote"
          checked={filters.isRemote === "true"}
          onCheckedChange={(checked) => onChange("isRemote", checked ? "true" : "")}
        />
        <Label htmlFor="remote" className="text-sm cursor-pointer">
          Remote Work
        </Label>
      </div>

      {/* Urgent Hiring */}
      <div className="flex items-center space-x-2">
        <Checkbox
          id="urgent"
          checked={filters.urgentHiring === "true"}
          onCheckedChange={(checked) => onChange("urgentHiring", checked ? "true" : "")}
        />
        <Label htmlFor="urgent" className="text-sm cursor-pointer">
          Urgent Hiring
        </Label>
      </div>
    </div>
  );
};

export default JobFilters;
