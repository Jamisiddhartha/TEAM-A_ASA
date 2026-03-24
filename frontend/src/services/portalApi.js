import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:5000/api",
});

export async function sendOtp(payload) {
  const response = await api.post("/auth/send-otp", payload);
  return response.data;
}

export async function verifyOtp(payload) {
  const response = await api.post("/auth/verify-otp", payload);
  return response.data;
}

export async function registerUser(payload) {
  const response = await api.post("/auth/register", payload);
  return response.data;
}

export async function loginUser(payload) {
  const response = await api.post("/auth/login", payload);
  return response.data;
}

export async function fetchApplications(user = null) {
  const params = {};
  if (user?.role) params.role = user.role;
  if (user?.id) params.userId = user.id;
  if (user?.email) params.email = user.email;

  const response = await api.get("/applications", { params });
  return response.data.applications;
}

export async function createApplication(payload) {
  const response = await api.post("/applications", payload);
  return response.data.application;
}

export async function submitApplicationForm(payload) {
  const response = await api.post("/applications/form-submission", payload);
  return response.data;
}

export function getDeclarationPdfUrl(id) {
  return `${api.defaults.baseURL}/applications/${id}/declaration-pdf`;
}

export async function fetchAdminStep2Applications() {
  const response = await api.get("/applications/admin/step2");
  return response.data.applications;
}

export async function issueInPrincipleApproval(applicationId, payload = {}) {
  const response = await api.post(`/applications/${applicationId}/in-principle-approval`, payload);
  return response.data;
}

export async function fetchInPrincipleApproval(applicationId) {
  const response = await api.get(`/applications/${applicationId}/in-principle-approval`);
  return response.data.step3;
}

export async function fetchStep4Details(applicationId) {
  const response = await api.get(`/applications/${applicationId}/step4`);
  return response.data.step4;
}

export async function submitStep4Details(applicationId, payload = {}) {
  const response = await api.post(`/applications/${applicationId}/step4/submit`, payload);
  return response.data;
}

export async function reviewStep4Details(applicationId, payload = {}) {
  const response = await api.post(`/applications/${applicationId}/step4/review`, payload);
  return response.data;
}

export async function fetchAuditors() {
  const response = await api.get("/applications/meta/auditors");
  return response.data.auditors;
}

export async function fetchStep5Details(applicationId) {
  const response = await api.get(`/applications/${applicationId}/step5`);
  return response.data.step5;
}

export async function assignStep5Auditor(applicationId, payload = {}) {
  const response = await api.post(`/applications/${applicationId}/step5/assign`, payload);
  return response.data;
}

export async function saveStep5Progress(applicationId, payload = {}) {
  const response = await api.post(`/applications/${applicationId}/step5/save`, payload);
  return response.data;
}

export async function submitStep5Audit(applicationId, payload = {}) {
  const response = await api.post(`/applications/${applicationId}/step5/submit`, payload);
  return response.data;
}

export async function fetchStep6Details(applicationId) {
  const response = await api.get(`/applications/${applicationId}/step6`);
  return response.data.step6;
}

export async function submitStep6Details(applicationId, payload = {}) {
  const response = await api.post(`/applications/${applicationId}/step6/submit`, payload);
  return response.data;
}

export async function reviewStep6Details(applicationId, payload = {}) {
  const response = await api.post(`/applications/${applicationId}/step6/review`, payload);
  return response.data;
}

export async function fetchStep7Details(applicationId) {
  const response = await api.get(`/applications/${applicationId}/step7`);
  return response.data.step7;
}

export async function issueStep7Details(applicationId, payload = {}) {
  const response = await api.post(`/applications/${applicationId}/step7/issue`, payload);
  return response.data;
}

export async function completeStep7Details(applicationId, payload = {}) {
  const response = await api.post(`/applications/${applicationId}/step7/complete`, payload);
  return response.data;
}

export async function fetchStep8Details(applicationId) {
  const response = await api.get(`/applications/${applicationId}/step8`);
  return response.data.step8;
}

export async function submitStep8Details(applicationId, payload = {}) {
  const response = await api.post(`/applications/${applicationId}/step8/submit`, payload);
  return response.data;
}

export async function reviewStep8Details(applicationId, payload = {}) {
  const response = await api.post(`/applications/${applicationId}/step8/review`, payload);
  return response.data;
}

export async function fetchStep9Details(applicationId) {
  const response = await api.get(`/applications/${applicationId}/step9`);
  return response.data.step9;
}

export async function issueStep9Details(applicationId, payload = {}) {
  const response = await api.post(`/applications/${applicationId}/step9/issue`, payload);
  return response.data;
}


export async function updateStep9TechCentreDetails(applicationId, payload = {}) {
  const response = await api.post(`/applications/${applicationId}/step9/tech-centre-update`, payload);
  return response.data;
}
export async function fetchStep10Details(applicationId) {
  const response = await api.get(`/applications/${applicationId}/step10`);
  return response.data.step10;
}

export async function submitStep10Details(applicationId, payload = {}) {
  const response = await api.post(`/applications/${applicationId}/step10/submit`, payload);
  return response.data;
}

export async function reviewStep10Details(applicationId, payload = {}) {
  const response = await api.post(`/applications/${applicationId}/step10/review`, payload);
  return response.data;
}

export async function fetchStep11Details(applicationId) {
  const response = await api.get(`/applications/${applicationId}/step11`);
  return response.data.step11;
}

export async function issueStep11Details(applicationId, payload = {}) {
  const response = await api.post(`/applications/${applicationId}/step11/issue`, payload);
  return response.data;
}

export function getInPrincipleApprovalLetterPdfUrl(id) {
  return `${api.defaults.baseURL}/applications/${id}/in-principle-approval-letter-pdf`;
}

