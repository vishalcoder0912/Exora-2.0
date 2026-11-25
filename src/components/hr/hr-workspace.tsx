"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Download, UserPlus, UserRoundPlus } from "lucide-react";
import { toast } from "sonner";

import { AddCandidateDialog, AddEmployeeDialog } from "@/components/hr/hr-dialogs";
import { CandidatesTable, CandidateProfile } from "@/components/hr/hr-candidates";
import { EmployeeProfile, EmployeesTable } from "@/components/hr/hr-employees";
import { InterviewsPanel, OffersTable } from "@/components/hr/hr-interviews-offers";
import { HrOverview } from "@/components/hr/hr-overview";
import { PageHeader } from "@/components/shared/page-header";
import { SectionCard } from "@/components/shared/section-card";
import { DetailSheet } from "@/components/shared/detail-sheet";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { downloadCsv } from "@/lib/format";
import { createId, useApp } from "@/store/app-store";
import type { CandidateStage, OfferStatus } from "@/types";

export function HrWorkspace() {
  const { state, dispatch } = useApp();
  const router = useRouter();
  const searchParams = useSearchParams();
  const openParam = searchParams.get("open");
  const { data } = state;

  const [tab, setTab] = useState("overview");
  const [addEmployeeOpen, setAddEmployeeOpen] = useState(false);
  const [addCandidateOpen, setAddCandidateOpen] = useState(false);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string | null>(null);
  const [selectedCandidateId, setSelectedCandidateId] = useState<string | null>(null);
  const [offerStatuses, setOfferStatuses] = useState<Record<string, OfferStatus>>({});

  const departments = useMemo(
    () => Array.from(new Set(data.employees.map((employee) => employee.department))).sort(),
    [data.employees],
  );

  const selectedEmployee =
    data.employees.find((employee) => employee.id === selectedEmployeeId) ?? null;
  const selectedCandidate =
    data.candidates.find((candidate) => candidate.id === selectedCandidateId) ?? null;

  useEffect(() => {
    if (!openParam) return;
    const employee = data.employees.find((item) => item.id === openParam);
    const candidate = data.candidates.find((item) => item.id === openParam);
    if (employee) {
      setSelectedEmployeeId(employee.id);
      setSelectedCandidateId(null);
      setTab("employees");
    } else if (candidate) {
      setSelectedCandidateId(candidate.id);
      setSelectedEmployeeId(null);
      setTab("candidates");
    }
  }, [openParam, data.employees, data.candidates]);

  function logAudit(activity: string, entity: string) {
    dispatch({
      type: "ADD_AUDIT_EVENT",
      payload: {
        id: createId("AUD"),
        activity,
        user: "Alex Morgan",
        department: "Human Resources",
        entity,
        timestamp: new Date().toISOString(),
        status: "Success",
        type: "Employee update",
        metadata: {
          requestedAction: activity,
          approvalStatus: "Approved",
          executedTool: "HR workspace",
          result: `${entity} updated in the demo workspace`,
        },
      },
    });
  }

  function openCandidate(id: string) {
    setSelectedEmployeeId(null);
    setSelectedCandidateId(id);
  }

  function openEmployee(id: string) {
    setSelectedCandidateId(null);
    setSelectedEmployeeId(id);
  }

  function clearOpenParam() {
    if (openParam) router.replace("/hr", { scroll: false });
  }

  function closeEmployeeSheet() {
    setSelectedEmployeeId(null);
    clearOpenParam();
  }

  function closeCandidateSheet() {
    setSelectedCandidateId(null);
    clearOpenParam();
  }

  function updateCandidateStage(id: string, stage: CandidateStage) {
    const candidate = data.candidates.find((item) => item.id === id);
    dispatch({ type: "UPDATE_CANDIDATE_STAGE", id, stage });
    toast.success(`${candidate?.name ?? "Candidate"} moved to ${stage}`);
    logAudit(`Candidate stage updated to ${stage}`, candidate?.name ?? id);
  }

  function updateOfferStatus(id: string, status: OfferStatus) {
    const offer = data.offers.find((item) => item.id === id);
    setOfferStatuses((current) => ({ ...current, [id]: status }));
    toast.success(`${offer?.candidateName ?? "Offer"} marked ${status}`);
    logAudit(`Offer status updated to ${status}`, offer?.candidateName ?? id);
  }

  function exportCurrentTab() {
    const employeeRows = data.employees.map((employee) => ({
      ID: employee.employeeId,
      Name: employee.name,
      Department: employee.department,
      Role: employee.role,
      Email: employee.email,
      Status: employee.status,
      "Joining date": employee.joiningDate,
    }));
    const candidateRows = data.candidates.map((candidate) => ({
      ID: candidate.id,
      Name: candidate.name,
      Position: candidate.position,
      Department: candidate.department,
      Stage: candidate.stage,
      Source: candidate.source,
      Recruiter: candidate.recruiter,
      "Last contact": candidate.lastContact,
    }));
    const interviewRows = data.interviews.map((interview) => ({
      ID: interview.id,
      Candidate: interview.candidateName,
      Interviewer: interview.interviewer,
      Date: interview.date,
      Time: interview.time,
      Type: interview.type,
      Status: interview.status,
    }));
    const offerRows = data.offers.map((offer) => ({
      ID: offer.id,
      Candidate: offer.candidateName,
      Position: offer.position,
      Package: offer.package,
      "Offer date": offer.offerDate,
      Status: offerStatuses[offer.id] ?? offer.status,
      Recruiter: offer.recruiter,
    }));

    const rowsByTab: Record<string, Record<string, string | number>[]> = {
      overview: employeeRows,
      employees: employeeRows,
      candidates: candidateRows,
      interviews: interviewRows,
      offers: offerRows,
    };
    downloadCsv(`nexus-hr-${tab}.csv`, rowsByTab[tab] ?? employeeRows);
    toast.success(`Exported ${tab} data as CSV`);
  }

  return (
    <div className="mx-auto w-full max-w-[1440px] space-y-5 px-4 py-6 lg:px-8">
      <PageHeader
        title="Human Resources"
        subtitle="Manage people, recruitment, and employee operations."
        badge="People"
        actions={
          <>
            <Button size="sm" onClick={() => setAddEmployeeOpen(true)}>
              <UserPlus className="size-3.5" /> Add employee
            </Button>
            <Button size="sm" variant="outline" onClick={() => setAddCandidateOpen(true)}>
              <UserRoundPlus className="size-3.5" /> Add candidate
            </Button>
            <Button size="sm" variant="outline" onClick={exportCurrentTab}>
              <Download className="size-3.5" /> Export
            </Button>
          </>
        }
      />

      <Tabs value={tab} onValueChange={setTab} className="space-y-4">
        <TabsList className="flex h-auto w-full flex-wrap justify-start gap-1 rounded-lg border border-border bg-card p-1">
          <TabsTrigger value="overview" className="text-xs">
            Overview
          </TabsTrigger>
          <TabsTrigger value="employees" className="text-xs">
            Employees
          </TabsTrigger>
          <TabsTrigger value="candidates" className="text-xs">
            Candidates
          </TabsTrigger>
          <TabsTrigger value="interviews" className="text-xs">
            Interviews
          </TabsTrigger>
          <TabsTrigger value="offers" className="text-xs">
            Offers
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-0">
          <HrOverview data={data} onNavigate={setTab} onCandidateOpen={openCandidate} />
        </TabsContent>

        <TabsContent value="employees" className="mt-0">
          <SectionCard
            title="Employee directory"
            description={`${data.employees.length} detailed profiles from ${data.metrics.totalEmployees} total employees`}
            contentClassName="overflow-x-auto"
          >
            <EmployeesTable
              employees={data.employees}
              departments={departments}
              onOpen={openEmployee}
            />
          </SectionCard>
        </TabsContent>

        <TabsContent value="candidates" className="mt-0">
          <SectionCard
            title="Recruitment pipeline"
            description={`${data.candidates.length} candidates across all stages`}
            contentClassName="overflow-x-auto"
          >
            <CandidatesTable
              candidates={data.candidates}
              departments={departments}
              today={data.today}
              onOpen={openCandidate}
            />
          </SectionCard>
        </TabsContent>

        <TabsContent value="interviews" className="mt-0">
          <SectionCard
            title="Interview schedule"
            description={`${data.interviews.length} interviews on record · click a candidate to open their profile`}
          >
            <InterviewsPanel interviews={data.interviews} onCandidateOpen={openCandidate} />
          </SectionCard>
        </TabsContent>

        <TabsContent value="offers" className="mt-0">
          <SectionCard
            title="Offers"
            description="Offer status changes are kept in this session for the prototype."
          >
            <OffersTable
              offers={data.offers}
              statusOverrides={offerStatuses}
              onStatusChange={updateOfferStatus}
            />
          </SectionCard>
        </TabsContent>
      </Tabs>

      <AddEmployeeDialog
        open={addEmployeeOpen}
        onOpenChange={setAddEmployeeOpen}
        onCreated={(name) => logAudit("Employee record created", name)}
      />
      <AddCandidateDialog
        open={addCandidateOpen}
        onOpenChange={setAddCandidateOpen}
        onCreated={(name) => logAudit("Candidate added to pipeline", name)}
      />

      <DetailSheet
        open={Boolean(selectedEmployee)}
        onOpenChange={(open) => {
          if (!open) closeEmployeeSheet();
        }}
        title={selectedEmployee?.name ?? "Employee profile"}
        description={
          selectedEmployee ? `${selectedEmployee.role} · ${selectedEmployee.department}` : undefined
        }
      >
        {selectedEmployee && <EmployeeProfile employee={selectedEmployee} />}
      </DetailSheet>

      <DetailSheet
        open={Boolean(selectedCandidate)}
        onOpenChange={(open) => {
          if (!open) closeCandidateSheet();
        }}
        title={selectedCandidate?.name ?? "Candidate profile"}
        description={
          selectedCandidate
            ? `${selectedCandidate.position} · ${selectedCandidate.department}`
            : undefined
        }
      >
        {selectedCandidate && (
          <CandidateProfile
            candidate={selectedCandidate}
            today={data.today}
            onStageChange={updateCandidateStage}
          />
        )}
      </DetailSheet>
    </div>
  );
}
