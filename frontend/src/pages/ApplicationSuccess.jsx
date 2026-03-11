import { CheckCircle2, ClipboardList, Download, FileText, Mail, User } from "lucide-react";
import { Link, Navigate, useLocation } from "react-router-dom";
import Header from "../components/Header";
import { getDeclarationPdfUrl } from "../services/portalApi";

const STORAGE_KEY = "lastSubmittedApplication";

function ApplicationSuccess() {
  const location = useLocation();
  const storedApplication = (() => {
    try {
      const raw = sessionStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  })();

  const application = location.state?.application || storedApplication;

  if (!application) {
    return <Navigate to="/form" replace />;
  }

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#f7f5ef_0%,#ece8dd_100%)]">
      <Header />
      <main className="mx-auto max-w-6xl px-6 pb-16 pt-28">
        <section className="overflow-hidden rounded-[36px] border border-black/10 bg-[linear-gradient(135deg,#2e2e38_0%,#1f1f1f_100%)] shadow-2xl">
          <div className="grid gap-8 px-6 py-10 md:grid-cols-[1.1fr_0.9fr] md:px-10">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-[#ffe600]/40 bg-[#ffe600]/10 px-4 py-2 text-sm font-semibold text-[#ffe600]">
                <CheckCircle2 size={18} />
                Application Submitted Successfully
              </div>
              <h1 className="mt-5 text-4xl font-bold text-white">Your ASA onboarding request is now in the system.</h1>
              <p className="mt-4 max-w-2xl text-base text-white/75">
                The application has been recorded in PostgreSQL, the declaration signature has been captured, and the UIDAI onboarding review is ready to continue.
              </p>

              <div className="mt-8 flex flex-wrap gap-4">
                <Link
                  to="/dashboard"
                  className="rounded-2xl bg-[#ffe600] px-6 py-3 font-semibold text-[#1f1f1f] transition hover:bg-[#f1d600]"
                >
                  Open Dashboard
                </Link>
                
                <a
                  href={getDeclarationPdfUrl(application.id)}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 rounded-2xl border border-[#ffe600]/35 bg-[#ffe600]/10 px-6 py-3 font-semibold text-[#ffe600] transition hover:bg-[#ffe600]/20"
                >
                  <Download size={18} />
                  Download Signed Declaration PDF
                </a>
              </div>
            </div>

            <div className="rounded-[28px] border border-white/10 bg-white/5 p-6 backdrop-blur-sm">
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-white/55">Submission Snapshot</p>
              <div className="mt-6 space-y-4">
                <div className="rounded-2xl bg-white px-5 py-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-[#6c6c73]">Application ID</p>
                  <p className="mt-2 text-2xl font-bold text-[#1f1f1f]">{application.applicationId}</p>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <InfoTile icon={User} label="Applicant" value={application.applicantName} />
                  <InfoTile icon={Mail} label="Official Email" value={application.email} />
                  <InfoTile icon={ClipboardList} label="Current Step" value={`Step ${application.currentStep}`} />
                  <InfoTile icon={FileText} label="Status" value={application.overallStatus} />
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="mt-8 grid gap-6 md:grid-cols-3">
          <div className="rounded-[28px] border border-black/10 bg-white p-6 shadow-lg">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#6c6c73]">Next Action</p>
            <h2 className="mt-3 text-xl font-bold text-[#1f1f1f]">Review progress</h2>
            <p className="mt-3 text-sm leading-6 text-[#5f6368]">
              Use the dashboard to follow UIDAI onboarding checkpoints for Step 1 and Step 2.
            </p>
          </div>
          <div className="rounded-[28px] border border-black/10 bg-white p-6 shadow-lg">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#6c6c73]">Saved Record</p>
            <h2 className="mt-3 text-xl font-bold text-[#1f1f1f]">Stored in PostgreSQL</h2>
            <p className="mt-3 text-sm leading-6 text-[#5f6368]">
              Your submitted form, application summary, stage records, and signature-backed declaration details are available in the portal data.
            </p>
          </div>
          <div className="rounded-[28px] border border-black/10 bg-white p-6 shadow-lg">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#6c6c73]">Output</p>
            <h2 className="mt-3 text-xl font-bold text-[#1f1f1f]">Signed PDF Ready</h2>
            <p className="mt-3 text-sm leading-6 text-[#5f6368]">
              Download the declaration PDF to see the UIDAI wording, applicant details, authenticated signatory block, and captured signature image in one document.
            </p>
          </div>
        </section>
      </main>
    </div>
  );
}

function InfoTile({ icon: Icon, label, value }) {
  return (
    <div className="rounded-2xl bg-[#f7f5ef] px-4 py-4">
      <div className="flex items-center gap-3">
        <div className="rounded-xl bg-[#ffe600] p-2 text-[#1f1f1f]">
          <Icon size={18} />
        </div>
        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-[#6c6c73]">{label}</p>
          <p className="mt-1 text-sm font-semibold text-[#1f1f1f]">{value || "Not available"}</p>
        </div>
      </div>
    </div>
  );
}

export default ApplicationSuccess;




