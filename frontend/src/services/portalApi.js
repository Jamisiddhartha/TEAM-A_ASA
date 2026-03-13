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


export function getInPrincipleApprovalLetterPdfUrl(id) {
  return `${api.defaults.baseURL}/applications/${id}/in-principle-approval-letter-pdf`;
}
