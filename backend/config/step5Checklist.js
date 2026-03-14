export const STEP5_CHECKLIST_TEMPLATE = [
  {
    controlNo: 1,
    sectionCode: "A",
    sectionTitle: "Information Security Governance",
    shortTitle: "Security organisation and CISO function",
    controlDescription:
      "ASA should have a designated CISO or equivalent independent security function overseeing information security governance and compliance.",
  },
  {
    controlNo: 2,
    sectionCode: "A",
    sectionTitle: "Information Security Governance",
    shortTitle: "Appointment of management and technical SPOCs",
    controlDescription:
      "ASA should appoint MPOC and TPOC for Aadhaar operations and communicate any changes to UIDAI in a timely manner.",
  },
  {
    controlNo: 3,
    sectionCode: "A",
    sectionTitle: "Information Security Governance",
    shortTitle: "Information security policy and procedure",
    controlDescription:
      "ASA should maintain information security policies and procedures aligned with leading standards and Aadhaar requirements.",
  },
  {
    controlNo: 4,
    sectionCode: "A",
    sectionTitle: "Information Security Governance",
    shortTitle: "Aadhaar authentication application design",
    controlDescription:
      "Authentication application design architecture should be documented, validated, and aligned with Aadhaar security requirements.",
  },
  {
    controlNo: 5,
    sectionCode: "A",
    sectionTitle: "Information Security Governance",
    shortTitle: "Aadhaar authentication data flow diagram",
    controlDescription:
      "ASA should document the Aadhaar data flow for its ASA applications and processing ecosystem.",
  },
  {
    controlNo: 6,
    sectionCode: "A",
    sectionTitle: "Information Security Governance",
    shortTitle: "Risk assessment",
    controlDescription:
      "ASA should perform at least annual risk assessments of its ICT infrastructure and third-party ecosystem supporting authentication services.",
  },
  {
    controlNo: 7,
    sectionCode: "A",
    sectionTitle: "Information Security Governance",
    shortTitle: "Third party information security policy",
    controlDescription:
      "Third-party vendors and service providers should be governed by a security policy that binds them to ASA security controls and compliance.",
  },
  {
    controlNo: 8,
    sectionCode: "B",
    sectionTitle: "Compliance Requirement",
    shortTitle: "Annual information security audit by CERT-In auditor",
    controlDescription:
      "Operations and systems should be audited by a CERT-In empanelled auditor and non-compliances should be tracked with corrective actions.",
  },
  {
    controlNo: 9,
    sectionCode: "C",
    sectionTitle: "Data Privacy",
    shortTitle: "Data protection policy",
    controlDescription:
      "ASA should establish and publish a data protection policy covering Aadhaar, IT Act, and applicable DPDP/SPDI requirements.",
  },
  {
    controlNo: 10,
    sectionCode: "C",
    sectionTitle: "Data Privacy",
    shortTitle: "Data classification and labelling policy",
    controlDescription:
      "ASA should maintain a data classification and labelling policy for Aadhaar and related data and state the classification used.",
  },
  {
    controlNo: 11,
    sectionCode: "D",
    sectionTitle: "Asset Management",
    shortTitle: "Asset inventory maintenance",
    controlDescription:
      "ASA should maintain an asset inventory for information assets and hardware with defined ownership, classification, and periodic review.",
  },
  {
    controlNo: 12,
    sectionCode: "D",
    sectionTitle: "Asset Management",
    shortTitle: "Security hardening of assets",
    controlDescription:
      "Assets used for Aadhaar authentication should be hardened in accordance with the ASA hardening baseline.",
  },
  {
    controlNo: 13,
    sectionCode: "D",
    sectionTitle: "Asset Management",
    shortTitle: "Maintenance of software inventory",
    controlDescription:
      "Only licensed software should be used for Aadhaar-related infrastructure and software license records should be maintained.",
  },
  {
    controlNo: 14,
    sectionCode: "D",
    sectionTitle: "Asset Management",
    shortTitle: "Asset disposal procedure",
    controlDescription:
      "ASA should define secure disposal procedures for information assets and documents containing Aadhaar-related information.",
  },
  {
    controlNo: 15,
    sectionCode: "D",
    sectionTitle: "Asset Management",
    shortTitle: "Asset repair procedure and movement logs",
    controlDescription:
      "Assets sent for repair should be sanitised and tracked using movement logs and maintenance documentation.",
  },
  {
    controlNo: 16,
    sectionCode: "E",
    sectionTitle: "Human Resource Security",
    shortTitle: "BGV and NDA with third-party contractors",
    controlDescription:
      "ASA should obtain undertakings on background verification and confidentiality from third-party contractors handling Aadhaar data.",
  },
  {
    controlNo: 17,
    sectionCode: "E",
    sectionTitle: "Human Resource Security",
    shortTitle: "Training and awareness",
    controlDescription:
      "Employees and relevant contractors should receive security awareness education and regular updates on ASA policies and procedures.",
  },
  {
    controlNo: 18,
    sectionCode: "E",
    sectionTitle: "Human Resource Security",
    shortTitle: "Specialised training",
    controlDescription:
      "Specialised training should be conducted for functional roles involved in the authentication ecosystem.",
  },
  {
    controlNo: 19,
    sectionCode: "E",
    sectionTitle: "Human Resource Security",
    shortTitle: "Training periodicity",
    controlDescription:
      "Trainings should be conducted at least half-yearly and when major ecosystem changes occur, with records retained.",
  },
  {
    controlNo: 20,
    sectionCode: "E",
    sectionTitle: "Human Resource Security",
    shortTitle: "Employee and third-party qualification",
    controlDescription:
      "Personnel engaged for authentication systems and processes should have the required qualifications and competence.",
  },
  {
    controlNo: 21,
    sectionCode: "F",
    sectionTitle: "Incident Management",
    shortTitle: "Incident management procedure and RCA",
    controlDescription:
      "ASA should maintain an incident management framework including forensic investigation, RCA, and corrective actions.",
  },
  {
    controlNo: 22,
    sectionCode: "G",
    sectionTitle: "Access Control",
    shortTitle: "Access control policy and procedure",
    controlDescription:
      "ASA should have a provisioning and deprovisioning process for access to systems, logs, code, and Aadhaar-related information.",
  },
  {
    controlNo: 23,
    sectionCode: "G",
    sectionTitle: "Access Control",
    shortTitle: "Access provisioning mechanism",
    controlDescription:
      "Only authorised individuals should be able to access authentication facilities and the ASA should maintain ACL records.",
  },
  {
    controlNo: 24,
    sectionCode: "G",
    sectionTitle: "Access Control",
    shortTitle: "Privilege user access management",
    controlDescription:
      "Systems and procedures for privilege user access management should be in place and limited to authorised users.",
  },
  {
    controlNo: 25,
    sectionCode: "G",
    sectionTitle: "Access Control",
    shortTitle: "Privilege accounts",
    controlDescription:
      "Privileged accounts should be accessible to a limited set of users and must not be used by normal users.",
  },
  {
    controlNo: 26,
    sectionCode: "G",
    sectionTitle: "Access Control",
    shortTitle: "Periodic access review",
    controlDescription:
      "Access should be granted on least privilege and reviewed periodically, at least half-yearly.",
  },
  {
    controlNo: 27,
    sectionCode: "G",
    sectionTitle: "Access Control",
    shortTitle: "Access revocation mechanism",
    controlDescription:
      "Rights and privileges should be revoked within 24 hours of personnel exit and unused user IDs should be deleted.",
  },
  {
    controlNo: 28,
    sectionCode: "G",
    sectionTitle: "Access Control",
    shortTitle: "Segregation of duties",
    controlDescription:
      "Operational, development, testing, and security responsibilities should be segregated with compensating controls where needed.",
  },
  {
    controlNo: 29,
    sectionCode: "G",
    sectionTitle: "Access Control",
    shortTitle: "Initial password allocation",
    controlDescription:
      "Initial passwords should be allocated securely and changed on first login.",
  },
  {
    controlNo: 30,
    sectionCode: "G",
    sectionTitle: "Access Control",
    shortTitle: "Password management guidelines",
    controlDescription:
      "Password construction and rotation should follow strong policy requirements, avoid reuse, and prevent weak or guessable passwords.",
  },
  {
    controlNo: 31,
    sectionCode: "G",
    sectionTitle: "Access Control",
    shortTitle: "User account lockout",
    controlDescription:
      "Excessive failed login attempts should lock the account until appropriate reset or unlock procedures are completed.",
  },
  {
    controlNo: 32,
    sectionCode: "G",
    sectionTitle: "Access Control",
    shortTitle: "Restriction on usage of generic IDs",
    controlDescription:
      "Common or shared user IDs should not be used except under documented and approved exception handling.",
  },
  {
    controlNo: 33,
    sectionCode: "G",
    sectionTitle: "Access Control",
    shortTitle: "Local admin access rights",
    controlDescription:
      "Users should not have local admin rights on systems; administrative access should be tightly restricted and monitored.",
  },
  {
    controlNo: 34,
    sectionCode: "G",
    sectionTitle: "Access Control",
    shortTitle: "Password hardcoded and auto log-on",
    controlDescription:
      "Passwords must not be hardcoded in scripts, programs, or automated log-on processes.",
  },
  {
    controlNo: 35,
    sectionCode: "G",
    sectionTitle: "Access Control",
    shortTitle: "Password security",
    controlDescription:
      "Passwords should be stored in encrypted or hashed form and must not be stored or transmitted in clear text.",
  },
  {
    controlNo: 36,
    sectionCode: "H",
    sectionTitle: "Physical Security",
    shortTitle: "Physical security of ASA data centre",
    controlDescription:
      "The ASA data centre should be fully secured with appropriate physical controls.",
  },
  {
    controlNo: 37,
    sectionCode: "H",
    sectionTitle: "Physical Security",
    shortTitle: "24x7 protection of ASA data centre",
    controlDescription:
      "The ASA data centre should be under round-the-clock protection through guards and CCTV surveillance.",
  },
  {
    controlNo: 38,
    sectionCode: "H",
    sectionTitle: "Physical Security",
    shortTitle: "Physical access restrictions and entry logs",
    controlDescription:
      "Physical access to the data centre should be restricted, pre-approved, logged, and movement of assets should be documented.",
  },
  {
    controlNo: 39,
    sectionCode: "H",
    sectionTitle: "Physical Security",
    shortTitle: "Preventive maintenance activity at data centre",
    controlDescription:
      "Preventive maintenance such as fire extinguisher and CCTV audits should be performed quarterly.",
  },
  {
    controlNo: 40,
    sectionCode: "H",
    sectionTitle: "Physical Security",
    shortTitle: "Emergency evacuation plans",
    controlDescription:
      "Emergency controls such as intrusion response and evacuation plans should be documented and implemented.",
  },
  {
    controlNo: 41,
    sectionCode: "H",
    sectionTitle: "Physical Security",
    shortTitle: "Clear desk and clear screen",
    controlDescription:
      "Clear desk and clear screen policies should be in force with unattended screen locking controls.",
  },
  {
    controlNo: 42,
    sectionCode: "H",
    sectionTitle: "Physical Security",
    shortTitle: "Physical location of ASA servers",
    controlDescription:
      "ASA should ensure that its data centres and servers are located within India.",
  },
  {
    controlNo: 43,
    sectionCode: "I",
    sectionTitle: "Data Security",
    shortTitle: "HSM",
    controlDescription:
      "ASA should maintain a dedicated on-premise FIPS 140-2 compliant HSM for management of security and encryption keys.",
  },
  {
    controlNo: 44,
    sectionCode: "I",
    sectionTitle: "Data Security",
    shortTitle: "End-point security - USB access",
    controlDescription:
      "USB access on servers and endpoints should be disabled by default and only allowed on approved exception basis.",
  },
  {
    controlNo: 45,
    sectionCode: "I",
    sectionTitle: "Data Security",
    shortTitle: "End-point security - antivirus / anti-malware",
    controlDescription:
      "Licensed malware and antivirus solutions should be installed, configured, and updated in real time.",
  },
  {
    controlNo: 46,
    sectionCode: "I",
    sectionTitle: "Data Security",
    shortTitle: "End-point security",
    controlDescription:
      "Endpoints used for Aadhaar-related operations should enforce appropriate session timeout and endpoint protection measures.",
  },
  {
    controlNo: 47,
    sectionCode: "I",
    sectionTitle: "Data Security",
    shortTitle: "Patch management",
    controlDescription:
      "Patch management processes should keep application, server, and network layers up to date at N or N-1 level.",
  },
  {
    controlNo: 48,
    sectionCode: "I",
    sectionTitle: "Data Security",
    shortTitle: "Data leakage prevention",
    controlDescription:
      "Security measures should exist to detect and prevent data leakage, with details of the DLP or alternate controls documented.",
  },
  {
    controlNo: 49,
    sectionCode: "J",
    sectionTitle: "Network Security",
    shortTitle: "IPS / IDS / WAF implementation",
    controlDescription:
      "Network intrusion prevention, intrusion detection, and web application firewall controls should be implemented and internet access restricted appropriately.",
  },
  {
    controlNo: 50,
    sectionCode: "J",
    sectionTitle: "Network Security",
    shortTitle: "Vulnerability assessment",
    controlDescription:
      "Information security policy should include vulnerability assessment and penetration testing for networks, infrastructure, and applications.",
  },
  {
    controlNo: 51,
    sectionCode: "K",
    sectionTitle: "Operations Security",
    shortTitle: "Segregation of testing and production environments",
    controlDescription:
      "Test and production facilities or environments should be physically and logically separated.",
  },
  {
    controlNo: 52,
    sectionCode: "K",
    sectionTitle: "Operations Security",
    shortTitle: "Service continuity and service availability",
    controlDescription:
      "ASA should ensure operational continuity and high availability with DC, DR, BCP, DR tests, and crisis management arrangements.",
  },
  {
    controlNo: 53,
    sectionCode: "K",
    sectionTitle: "Operations Security",
    shortTitle: "Audit program",
    controlDescription:
      "ASA should maintain an audit program with defined frequency, methods, responsibilities, and reporting informed by previous audit results.",
  },
  {
    controlNo: 54,
    sectionCode: "K",
    sectionTitle: "Operations Security",
    shortTitle: "Grievance handling",
    controlDescription:
      "ASA should provide grievance handling mechanisms and evidence of the channels available for grievance reporting.",
  },
  {
    controlNo: 55,
    sectionCode: "L",
    sectionTitle: "Application Security",
    shortTitle: "Secure software development",
    controlDescription:
      "System and processes for secure software development should be implemented and developer training records maintained.",
  },
  {
    controlNo: 56,
    sectionCode: "L",
    sectionTitle: "Application Security",
    shortTitle: "Compliance to API specifications and application security",
    controlDescription:
      "Client applications used for authentication should conform to current UIDAI API standards and security specifications.",
  },
  {
    controlNo: 57,
    sectionCode: "L",
    sectionTitle: "Application Security",
    shortTitle: "Configuration reviews and system walkthrough",
    controlDescription:
      "Authentication applications and infrastructure should be integrated with IDAM, PIM/PAM, and SIEM with supporting review evidence.",
  },
  {
    controlNo: 58,
    sectionCode: "M",
    sectionTitle: "Logging and Monitoring",
    shortTitle: "Logs recording",
    controlDescription:
      "Critical user activities, exceptions, and security events should be logged and retained for investigation and access monitoring.",
  },
  {
    controlNo: 59,
    sectionCode: "M",
    sectionTitle: "Logging and Monitoring",
    shortTitle: "Logs monitoring",
    controlDescription:
      "Security logs should be monitored regularly and access to audit trails should be restricted to authorised personnel.",
  },
  {
    controlNo: 60,
    sectionCode: "M",
    sectionTitle: "Logging and Monitoring",
    shortTitle: "Clock synchronisation through NTP",
    controlDescription:
      "ICT systems should synchronise clocks using NIC or NPL NTP sources or equivalent traceable sources that do not deviate from them.",
  },
];

export const STEP5_STATUS_OPTIONS = ["pending", "in_progress", "submitted"];
export const STEP5_COMPLIANCE_OPTIONS = ["pending", "compliant", "non_compliant", "not_applicable"];
