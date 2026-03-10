import pool, { db } from "../config/db.js";
import { asaApplicationsTable } from "../config/schema.js";
import { eq, desc } from "drizzle-orm";

export const submitApplication = async (req, res) => {
  console.log("Submit Application route hit by user ID:", req.user.id);
  
  try {
    const formData = req.body;
    
    // basic validation
    if (!formData || !formData.applicantName) {
      return res.status(400).json({ 
        success: false, 
        message: "Missing essential application data" 
      });
    }

    const { applicantName, applicantType } = formData;
    const userId = req.user.id;

    // insert JSONB data
    const newApplications = await db.insert(asaApplicationsTable).values({
      user_id: userId,
      applicant_name: applicantName,
      applicant_type: applicantType,
      form_data: formData
    }).returning({
      id: asaApplicationsTable.id,
      status: asaApplicationsTable.status,
      submitted_at: asaApplicationsTable.submitted_at
    });

    const newApplication = newApplications[0];

    res.status(201).json({
      success: true,
      message: "ASA Application submitted successfully",
      application: newApplication
    });

  } catch (err) {
    console.log("Error submitting application:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getMyApplications = async (req, res) => {
  try {
    const userId = req.user.id;
    
    const applications = await db.select({
      id: asaApplicationsTable.id,
      applicant_name: asaApplicationsTable.applicant_name,
      status: asaApplicationsTable.status,
      submitted_at: asaApplicationsTable.submitted_at
    })
    .from(asaApplicationsTable)
    .where(eq(asaApplicationsTable.user_id, userId))
    .orderBy(desc(asaApplicationsTable.submitted_at));

    res.json({
      success: true,
      applications: applications
    });
    
  } catch (err) {
    console.log("Error fetching applications:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};
