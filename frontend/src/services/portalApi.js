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

export async function fetchApplications() {
  const response = await api.get("/applications");
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


