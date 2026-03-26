const fs = require("fs");
const path = require("path");
const { execFile } = require("child_process");

const DEFAULT_BAP_ROOTS = [
  process.env.BAP_ROOT || "",
  path.join(process.env.USERPROFILE || "", "Downloads", "swcs2.0-main (1)", "swcs2.0-main"),
  path.join(process.env.USERPROFILE || "", "Downloads", "swcs2.0-main", "swcs2.0-main"),
  path.join(process.env.USERPROFILE || "", "Downloads", "swcs2.0-main (1)"),
];

const MIGRATOR_PATH = path.join(__dirname, "bap_migrate_workflow_config.js");
const SUMMARY_SCRIPT_PATH = path.join(__dirname, "bap_db_summary.js");
const CAF_WORKFLOW_REFERENCE_PATH = path.join(__dirname, "reference_data", "caf_workflow_reference.json");

const uniqueStrings = (values) => [...new Set(values.filter(Boolean).map((value) => String(value).trim()).filter(Boolean))];

const ensureOutputDir = () => {
  const outputDir = path.join(__dirname, "..", "resukt");
  fs.mkdirSync(outputDir, { recursive: true });
  return outputDir;
};

const findFirstExistingPath = (candidates) => uniqueStrings(candidates).find((candidate) => fs.existsSync(candidate)) || null;

const readJson = (filePath) => JSON.parse(fs.readFileSync(filePath, "utf8"));

const deepClone = (value) => JSON.parse(JSON.stringify(value));

const parseDotEnv = (text) => {
  const result = {};
  for (const rawLine of String(text || "").split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) continue;
    const match = line.match(/^([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)$/);
    if (!match) continue;
    let [, key, value] = match;
    value = value.trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    result[key] = value;
  }
  return result;
};

const loadEnvFile = (filePath) => {
  if (!filePath || !fs.existsSync(filePath)) return {};
  return parseDotEnv(fs.readFileSync(filePath, "utf8"));
};

const stripUiSummaryFields = (formJson) => {
  const clean = deepClone(formJson || {});
  delete clean.pages;
  delete clean.totalFormFields;
  delete clean.totalBuilderFields;
  delete clean.totalFieldOptions;
  delete clean.totalFormRules;
  delete clean.addMoreGroups;
  return clean;
};

const isCafForm = (formSchema) => {
  const meta = formSchema?.meta || {};
  const serviceId = String(meta.service_id || "");
  const formName = String(meta.form_name || "").toLowerCase();
  return serviceId === "591.0" || formName.includes("combined application form");
};

const detectBapPaths = () => {
  const root = findFirstExistingPath(DEFAULT_BAP_ROOTS);
  const backend = findFirstExistingPath([
    process.env.BAP_BACKEND_PATH || "",
    root ? path.join(root, "apps", "backend") : "",
  ]);
  const frontend = findFirstExistingPath([
    process.env.BAP_FRONTEND_PATH || "",
    root ? path.join(root, "apps", "frontend") : "",
  ]);
  const nodeModules = findFirstExistingPath([
    backend ? path.join(backend, "node_modules") : "",
    root ? path.join(root, "node_modules") : "",
  ]);

  return { root, backend, frontend, nodeModules };
};

const buildServiceInfo = (formSchema, referenceConfig) => {
  const meta = formSchema?.meta || {};
  const referenceService = referenceConfig?.service || {};
  const departmentId = Number(meta.department_id ?? referenceService.department_id ?? 0);
  const serviceId = String(meta.service_id ?? referenceService.service_id ?? "");
  const formTypeId = Number(meta.form_type_id ?? referenceService.form_type_id ?? 1);
  const formName = meta.form_name || referenceService.form_name || "Generated Form";

  return {
    department_id: departmentId,
    service_id: serviceId,
    form_type_id: formTypeId,
    form_name: formName,
    service_code: referenceService.service_code || serviceId,
    department_code: referenceService.department_code || String(departmentId),
  };
};

const buildEmptyWorkflow = (service, formSchema) => ({
  workflow_code: `${String(service.service_id || "SERVICE").replace(/[^A-Za-z0-9]/g, "_")}_WORKFLOW`,
  workflow_name: `${service.form_name || formSchema?.meta?.form_name || "Generated Form"} Workflow`,
  workflow_version_label: formSchema?.meta?.form_version || "V1.0",
  workflow_version_number: 1,
  workflow_actions: [],
  steps: [],
  officer_forms: [],
});

const buildBapSyncPayload = (formJson) => {
  const formSchema = stripUiSummaryFields(formJson);
  const referenceConfig =
    isCafForm(formSchema) && fs.existsSync(CAF_WORKFLOW_REFERENCE_PATH)
      ? readJson(CAF_WORKFLOW_REFERENCE_PATH)
      : null;

  formSchema.meta = {
    ...(formSchema.meta || {}),
    form_version:
      formSchema?.meta?.form_version ||
      referenceConfig?.form_schema?.meta?.form_version ||
      referenceConfig?.workflow?.workflow_version_label ||
      "V1.0",
  };

  const service = buildServiceInfo(formSchema, referenceConfig);
  const workflow = referenceConfig?.workflow
    ? deepClone(referenceConfig.workflow)
    : buildEmptyWorkflow(service, formSchema);

  return {
    service,
    form_schema: formSchema,
    workflow,
  };
};

const runNodeScript = (scriptPath, env) =>
  new Promise((resolve, reject) => {
    execFile(
      process.execPath,
      [scriptPath],
      {
        cwd: path.dirname(scriptPath),
        env,
        timeout: 180000,
        maxBuffer: 20 * 1024 * 1024,
      },
      (error, stdout, stderr) => {
        if (error) {
          const message = String(stderr || stdout || error.message || "Node script failed").trim();
          return reject(new Error(message));
        }
        resolve({
          stdout: String(stdout || "").trim(),
          stderr: String(stderr || "").trim(),
        });
      },
    );
  });

const buildChildEnv = (bapPaths, payloadPath) => {
  const backendEnv = loadEnvFile(bapPaths.backend ? path.join(bapPaths.backend, ".env") : "");
  const nodePath = uniqueStrings([
    bapPaths.nodeModules,
    bapPaths.backend ? path.join(bapPaths.backend, "node_modules") : "",
    bapPaths.root ? path.join(bapPaths.root, "node_modules") : "",
    process.env.NODE_PATH || "",
  ]).join(path.delimiter);

  return {
    ...process.env,
    ...backendEnv,
    JSON_FILE: payloadPath,
    NODE_PATH: nodePath,
    BAP_ROOT: bapPaths.root || "",
    BAP_BACKEND_PATH: bapPaths.backend || "",
    BAP_FRONTEND_PATH: bapPaths.frontend || "",
  };
};

const loadLatestGeneratedFormJson = () => {
  const filePath = path.join(__dirname, "..", "resukt", "generated_form_schema.json");
  if (!fs.existsSync(filePath)) {
    throw new Error("No generated form JSON found to sync");
  }
  return readJson(filePath);
};

const syncGeneratedFormJsonToBap = async (formJsonInput) => {
  const bapPaths = detectBapPaths();
  if (!bapPaths.backend || !bapPaths.frontend || !bapPaths.nodeModules) {
    throw new Error("Unable to locate the BAP backend/frontend paths or Prisma client");
  }

  if (!fs.existsSync(MIGRATOR_PATH)) {
    throw new Error(`BAP migrator script not found: ${MIGRATOR_PATH}`);
  }
  if (!fs.existsSync(SUMMARY_SCRIPT_PATH)) {
    throw new Error(`BAP summary script not found: ${SUMMARY_SCRIPT_PATH}`);
  }

  const formJson = formJsonInput || loadLatestGeneratedFormJson();
  const payload = buildBapSyncPayload(formJson);
  const outputDir = ensureOutputDir();
  const payloadPath = path.join(outputDir, "generated_bap_sync_payload.json");
  fs.writeFileSync(payloadPath, JSON.stringify(payload, null, 2), "utf8");

  const childEnv = buildChildEnv(bapPaths, payloadPath);
  const migration = await runNodeScript(MIGRATOR_PATH, childEnv);
  const summaryRaw = await runNodeScript(SUMMARY_SCRIPT_PATH, childEnv);

  let summary = null;
  try {
    summary = JSON.parse(summaryRaw.stdout || "{}");
  } catch {
    summary = { raw: summaryRaw.stdout || "" };
  }

  return {
    ok: true,
    syncedAt: new Date().toISOString(),
    payloadFile: {
      outputPath: payloadPath,
      fileName: path.basename(payloadPath),
    },
    summary,
    migrationLog: migration.stdout || "Migration completed successfully",
    bapPaths,
  };
};

module.exports = {
  syncGeneratedFormJsonToBap,
  detectBapPaths,
};
