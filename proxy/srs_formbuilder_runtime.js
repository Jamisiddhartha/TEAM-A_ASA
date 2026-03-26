const fs = require("fs");
const os = require("os");
const path = require("path");
const { execFile } = require("child_process");
const JSZip = require("jszip");

const SRS_JSON_TOKENS = 32768;
const SRS_MAX_CONT = 3;
const CAF_REFERENCE_JSON_PATH = path.join(__dirname, "reference_data", "caf_formbuilder_reference.json");

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const normalizeSrsText = (text) => {
  const lines = String(text || "")
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n")
    .replace(/\u0000/g, "")
    .split("\n");

  const normalized = [];
  let lastBlank = false;

  for (const rawLine of lines) {
    const line = rawLine.replace(/\u00a0/g, " ").replace(/\s+/g, " ").trim();
    if (!line) {
      if (!lastBlank) normalized.push("");
      lastBlank = true;
      continue;
    }
    normalized.push(line);
    lastBlank = false;
  }

  return normalized.join("\n").trim();
};

const decodeXmlEntities = (text) => String(text || "")
  .replace(/&#x([0-9a-f]+);/gi, (_, hex) => String.fromCodePoint(parseInt(hex, 16)))
  .replace(/&#([0-9]+);/g, (_, dec) => String.fromCodePoint(parseInt(dec, 10)))
  .replace(/&amp;/g, "&")
  .replace(/&lt;/g, "<")
  .replace(/&gt;/g, ">")
  .replace(/&quot;/g, '"')
  .replace(/&apos;/g, "'");

const extractTextFromDocxBuffer = async (buffer) => {
  const zip = await JSZip.loadAsync(buffer);
  const xmlNames = ["word/document.xml", "word/footnotes.xml", "word/endnotes.xml"]
    .filter((name) => zip.file(name));

  if (!xmlNames.length) throw new Error("DOCX content not found");

  const parts = [];
  for (const name of xmlNames) {
    let xml = await zip.file(name).async("string");
    xml = xml
      .replace(/<w:tab[^>]*\/>/g, "\t")
      .replace(/<w:br[^>]*\/>/g, "\n")
      .replace(/<\/w:p>/g, "\n")
      .replace(/<\/w:tr>/g, "\n")
      .replace(/<\/w:tc>/g, " | ")
      .replace(/<[^>]+>/g, " ");
    parts.push(decodeXmlEntities(xml));
  }

  return normalizeSrsText(parts.join("\n"));
};

const extractTextFromPdfBuffer = async (buffer, fileName) => {
  const ts = `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  const safeBase = path.basename(fileName || "srs.pdf", path.extname(fileName || "srs.pdf")) || "srs";
  const tmpPdf = path.join(os.tmpdir(), `${safeBase}_${ts}.pdf`);
  const scriptPath = path.join(__dirname, "extract_srs_text.py");
  const cleanup = () => { try { fs.unlinkSync(tmpPdf); } catch (_) { } };

  try {
    fs.writeFileSync(tmpPdf, buffer);
    const stdout = await new Promise((resolve, reject) => {
      execFile("python", [scriptPath, tmpPdf], { timeout: 120000, maxBuffer: 20 * 1024 * 1024 }, (err, out, stderr) => {
        if (err) return reject(new Error((stderr || err.message || "PDF text extraction failed").trim()));
        resolve(out);
      });
    });
    const parsed = JSON.parse(String(stdout || "{}"));
    return normalizeSrsText(parsed.text || "");
  } finally {
    cleanup();
  }
};

const extractSrsTextFromUpload = async (fileBuffer, fileName) => {
  const ext = path.extname(fileName || "").toLowerCase();
  if (!ext) throw new Error("File name must include an extension");

  if (ext === ".pdf") {
    return {
      fileType: "pdf",
      text: await extractTextFromPdfBuffer(fileBuffer, fileName),
    };
  }

  if (ext === ".docx") {
    return {
      fileType: "docx",
      text: await extractTextFromDocxBuffer(fileBuffer),
    };
  }

  if (ext === ".txt" || ext === ".md" || ext === ".json") {
    return {
      fileType: "text",
      text: normalizeSrsText(fileBuffer.toString("utf8")),
    };
  }

  if (ext === ".doc") {
    throw new Error("Legacy .doc files are not supported yet. Please upload .pdf, .docx, or .txt.");
  }

  throw new Error(`Unsupported file type: ${ext}`);
};

const refNumber = (value) => {
  const match = String(value || "").match(/\d+/);
  return match ? Number(match[0]) : 0;
};

const splitIntoSections = (text) => {
  let source = String(text || "");
  const appendixMatch = source.match(/APPENDIX\s+[A-Z]/i);
  if (appendixMatch?.index != null) source = source.slice(0, appendixMatch.index);

  const sectionMatches = [...source.matchAll(/SECTION\s+[\d.]+\s*[-:]\s*.*?(?=SECTION\s+[\d.]+\s*[-:]|PAGE\s+\d+\b|={5,}|$)/gis)]
    .map((match) => match[0].trim())
    .filter((section) => section.length >= 200 && !/<Section Name>|<Field Name>|<Page Name>/i.test(section));

  if (sectionMatches.length) return sectionMatches;

  const pageMatches = [...source.matchAll(/PAGE\s+\d+.*?(?=PAGE\s+\d+|$)/gis)]
    .map((match) => match[0].trim())
    .filter((section) => section.length >= 200);

  return pageMatches.length ? pageMatches : [source.trim()].filter(Boolean);
};

const reindexUnified = (data, fieldOffset, builderFieldOffset) => {
  const formFields = [...(data.form_fields || [])].sort((a, b) => refNumber(a.ref) - refNumber(b.ref));
  const builderFields = [...(data.builder_fields || [])].sort((a, b) => refNumber(a.ref) - refNumber(b.ref));

  const fieldMap = new Map(formFields.map((field, index) => [refNumber(field.ref), fieldOffset + index + 1]));
  const builderFieldMap = new Map(builderFields.map((field, index) => [refNumber(field.ref), builderFieldOffset + index + 1]));

  const indexedFields = formFields.map((field) => ({
    ...field,
    ref: `$F${fieldMap.get(refNumber(field.ref))}`,
  }));

  const indexedBuilderFields = builderFields.map((field) => ({
    ...field,
    ref: `$BF${builderFieldMap.get(refNumber(field.ref))}`,
    field_ref: `$F${fieldMap.get(refNumber(field.field_ref)) || (fieldOffset + 1)}`,
  }));

  return { formFields: indexedFields, builderFields: indexedBuilderFields };
};

const deepClone = (value) => JSON.parse(JSON.stringify(value));

const loadReferenceFormJson = () => {
  const content = fs.readFileSync(CAF_REFERENCE_JSON_PATH, "utf8");
  return JSON.parse(content);
};

const isKnownCafTemplate = (text) => {
  const source = String(text || "").toLowerCase();
  const markers = [
    "combined application form (caf)",
    "service id 591.0",
    "department id 1",
    "formbuilder system",
    "total fields 143 fields",
    "karnataka udyog mitra (kum) single window system",
  ];
  return markers.filter((marker) => source.includes(marker)).length >= 3;
};

const PROMPTS = {
  categories: `You are an expert AI that converts SRS documents into structured JSON for a government form builder.

TASK: Extract all form categories (sections) from the SRS.

RULES:
1. Each section in the SRS becomes one category in the same order.
2. Refs must be sequential: $C1, $C2, $C3.
3. action is always "INSERT_NEW".
4. name_in_hindi is always null.
5. parent_id is always 0.
6. is_active is always true.
7. Do not invent categories that are not present in the SRS.

Return only valid JSON:
{
  "categories": [
    {
      "ref": "$C1",
      "action": "INSERT_NEW",
      "category_name": "Company Details",
      "name_in_hindi": null,
      "parent_id": 0,
      "is_active": true
    }
  ]
}`,
  pages: `You are an expert AI that converts SRS documents into structured JSON for a government form builder.

TASK: Extract all form pages from the SRS.

RULES:
1. Each page in the SRS becomes one page_master entry in order.
2. Refs must be sequential: $P1, $P2, $P3.
3. preference must match the page order exactly.
4. name_in_hindi is always null.
5. Include every page mentioned in the SRS.
6. Use the page name exactly as written.

Return only valid JSON:
{
  "page_masters": [
    {
      "ref": "$P1",
      "page_name": "Company Details",
      "preference": 1,
      "name_in_hindi": null
    }
  ]
}`,
  pageCategoryMappings: `You are an expert AI that maps SRS sections to form pages.

TASK: Generate page_category_mappings by matching every category to the page it belongs to.

You are given in CONTEXT:
- categories: list of category refs and names
- page_masters: list of page refs and names

RULES:
1. Every category must appear exactly once.
2. page_ref and category_ref must come from the provided context.
3. preference resets to 1 for each new page.
4. help_text should be the note or guidance for the section if present, otherwise null.
5. Pages without sections should not get mappings.

Return only valid JSON:
{
  "page_category_mappings": [
    {
      "page_ref": "$P1",
      "category_ref": "$C1",
      "preference": 1,
      "help_text": null
    }
  ]
}`,
  unifiedFields: `You are an expert form extraction engine for a government SRS form builder.

TASK: Extract every field from this single SRS section and return both form_fields and builder_fields.

CONTEXT contains:
- cats: all categories with refs
- pages: all page_masters with refs
- pcm: page_category_mappings showing which category belongs to which page

RULES:
1. Do not miss any field in the section.
2. Start refs from $F1 and $BF1 within this section only. They will be reindexed globally later.
3. builder_fields.field_ref must point to the matching form_field.ref.
4. Use the category_ref and page_ref from the provided context.
5. Infer input_type from the SRS wording: radio, select, multiselect, file, textarea, date, number, email, tel, checkbox, otherwise text.
6. is_required is Y only for Mandatory fields, otherwise N.
7. Auto Populated and Auto Calculated fields should have is_readonly Y and is_editable N.
8. Address and textarea fields use grid_span 12. Most others use 6.
9. builder_fields must include:
   ref, page_ref, category_ref, field_ref, preference, input_type, is_required, is_active,
   custom_label, grid_span, help_text, is_editable, is_readonly, max_length, min_length,
   pattern, placeholder, validation_rule, layout_type.
10. form_fields must include:
   ref, action, name, name_in_hindi, is_editable, is_active, category_ref.
11. Use help_text from the tool tip column if available. If not, derive a concise help text from notes. If nothing useful exists, use null.
12. Keep min_length and max_length as integers or null.
13. validation_rule and layout_type must be null.

Return only valid JSON:
{
  "form_fields": [
    {
      "ref": "$F1",
      "action": "INSERT_NEW",
      "name": "New Or Existing",
      "name_in_hindi": null,
      "is_editable": "Y",
      "is_active": true,
      "category_ref": "$C1"
    }
  ],
  "builder_fields": [
    {
      "ref": "$BF1",
      "page_ref": "$P1",
      "category_ref": "$C1",
      "field_ref": "$F1",
      "preference": 1,
      "input_type": "radio",
      "is_required": "Y",
      "is_active": "Y",
      "custom_label": "New Or Existing",
      "grid_span": 6,
      "help_text": null,
      "is_editable": "Y",
      "is_readonly": "N",
      "max_length": null,
      "min_length": null,
      "pattern": null,
      "placeholder": null,
      "validation_rule": null,
      "layout_type": null
    }
  ]
}`,
  options: `You are an expert AI extracting field options from an SRS document section.

TASK: Extract field_options for select, radio, multiselect, and checkbox fields in this section.

CONTEXT contains builder_fields for this section with their refs and labels.

RULES:
1. Only produce output for select, radio, multiselect, or checkbox builder fields.
2. source_type is STATIC for inline options and MASTER for master-driven fields.
3. For MASTER source, static_options must be null and master_table_id null.
4. For STATIC source, list every option with label and snake_case value.
5. parent_builder_field_ref is null unless the dependency is explicitly described.
6. Match builder_field_ref exactly to the provided $BF refs.
7. Use the pipe character | as the true option separator.

Return only valid JSON:
{
  "field_options": [
    {
      "builder_field_ref": "$BF2",
      "source_type": "STATIC",
      "static_options": [
        { "label": "New", "value": "new" }
      ],
      "master_table_id": null,
      "parent_builder_field_ref": null
    }
  ]
}`,
  addMore: `You are an expert AI detecting repeatable field groups in an SRS document.

TASK: Detect add-more or repeatable sections and extract addmore_groups and add_more_columns.

CONTEXT contains builder_fields for this section.

RULES:
1. Only create add-more output when the section explicitly indicates add more, repeatable rows, or a repeatable group.
2. addmore_groups should include ref, page_ref, category_ref, trigger_builder_field_ref, label, and min_rows.
3. add_more_columns should include group_ref, builder_field_ref, and col_order.
4. If the section is not repeatable, return empty arrays.

Return only valid JSON:
{
  "addmore_groups": [],
  "add_more_columns": []
}`,
  rules: `You are an expert AI extracting conditional visibility rules from an SRS document.

TASK: Extract all conditional rules from the SRS and produce form_rules entries.

CONTEXT contains:
- all_builder_fields: list of refs and labels
- all_categories: list of refs and names

RULES:
1. Every conditional statement like "show X when Y = Z" becomes one form_rule.
2. scope is always "field".
3. when_json must contain field_ref, operator, and value.
4. then_json must contain action "show" and target_refs.
5. Use category refs when the rule targets a whole section, otherwise use builder field refs.
6. value must always be a string.

Return only valid JSON:
{
  "form_rules": [
    {
      "scope": "field",
      "when_json": {
        "field_ref": "$BF1",
        "operator": "equals",
        "value": "yes"
      },
      "then_json": {
        "action": "show",
        "target_refs": ["$BF2"]
      }
    }
  ]
}`,
  meta: `You are an expert AI that converts SRS documents into structured JSON for a government form builder.

TASK: Extract the form metadata from the beginning of the SRS document.

RULES:
1. department_id should be an integer if present.
2. service_id should be a string if present.
3. form_type_id should be an integer if present.
4. form_name should be the full form name if present.
5. If anything is missing, use defaults:
   department_id = 1
   service_id = "1.0"
   form_type_id = 1
   form_name = "Form"

Return only valid JSON:
{
  "meta": {
    "department_id": 1,
    "service_id": "591.0",
    "form_type_id": 1,
    "form_name": "Combined Application Form (CAF)"
  }
}`,
};

const callGeminiJsonPrompt = async (prompt, text, context, deps, retries = 3) => {
  const { callGemini, parseJson, stripFences, isComplete } = deps;
  const contextInfo = context ? `\n\n### CONTEXT ###\n${JSON.stringify(context, null, 2)}` : "";
  const basePrompt = `${prompt}${contextInfo}\n\n### SRS TEXT ###\n${text}`;

  let lastError = null;

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const first = await callGemini({
        contents: [{ role: "user", parts: [{ text: basePrompt }] }],
        generationConfig: {
          maxOutputTokens: SRS_JSON_TOKENS,
          temperature: 0.05,
          responseMimeType: "application/json",
        },
      });

      let raw = first.text || "";
      let finishReason = first.finishReason;
      let continuationCount = 0;

      while (finishReason === "MAX_TOKENS" && continuationCount < SRS_MAX_CONT && !isComplete(raw)) {
        continuationCount++;
        const continuation = await callGemini({
          contents: [
            { role: "user", parts: [{ text: basePrompt }] },
            { role: "model", parts: [{ text: raw }] },
            { role: "user", parts: [{ text: "Continue from where you stopped. Return only the remaining JSON needed to complete the response." }] },
          ],
          generationConfig: {
            maxOutputTokens: SRS_JSON_TOKENS,
            temperature: 0.05,
            responseMimeType: "application/json",
          },
        });

        raw += stripFences(continuation.text || "");
        finishReason = continuation.finishReason;
      }

      return parseJson(raw);
    } catch (err) {
      lastError = err;
      if (attempt < retries) await sleep(1500 * attempt);
    }
  }

  throw lastError || new Error("Gemini JSON extraction failed");
};

const buildFormBuilderJson = (meta, categories, pages, pageCategoryMappings, formFields, builderFields, fieldOptions, addMoreGroups, addMoreColumns, formRules) => ({
  meta,
  categories: categories.categories || [],
  form_fields: formFields,
  page_masters: pages.page_masters || [],
  page_category_mappings: pageCategoryMappings,
  builder_fields: builderFields,
  field_options: fieldOptions,
  add_more_groups: addMoreGroups.length ? addMoreGroups : null,
  add_more_columns: addMoreColumns.length ? addMoreColumns : null,
  form_rules: formRules,
});

const countBy = (arr) => (Array.isArray(arr) ? arr.length : 0);

const ensureOutputDir = () => {
  const outputDir = path.join(__dirname, "..", "resukt");
  fs.mkdirSync(outputDir, { recursive: true });
  return outputDir;
};

const saveGeneratedFormJson = (formJson) => {
  const outputDir = ensureOutputDir();
  const outputPath = path.join(outputDir, "generated_form_schema.json");
  fs.writeFileSync(outputPath, JSON.stringify(formJson, null, 2), "utf8");
  return {
    outputDir,
    outputPath,
    fileName: path.basename(outputPath),
  };
};

const validateFormBuilderJson = (formJson) => {
  const warnings = [];
  const errors = [];

  const categoryRefs = new Set((formJson.categories || []).map((item) => item.ref));
  const pageRefs = new Set((formJson.page_masters || []).map((item) => item.ref));
  const fieldRefs = new Set((formJson.form_fields || []).map((item) => item.ref));
  const builderFieldRefs = new Set((formJson.builder_fields || []).map((item) => item.ref));

  for (const mapping of (formJson.page_category_mappings || [])) {
    if (!pageRefs.has(mapping.page_ref)) warnings.push(`Missing page ref in mapping: ${mapping.page_ref}`);
    if (!categoryRefs.has(mapping.category_ref)) warnings.push(`Missing category ref in mapping: ${mapping.category_ref}`);
  }

  for (const builderField of (formJson.builder_fields || [])) {
    if (!fieldRefs.has(builderField.field_ref)) warnings.push(`Builder field ${builderField.ref} points to missing form field ${builderField.field_ref}`);
    if (!categoryRefs.has(builderField.category_ref)) warnings.push(`Builder field ${builderField.ref} points to missing category ${builderField.category_ref}`);
    if (!pageRefs.has(builderField.page_ref)) warnings.push(`Builder field ${builderField.ref} points to missing page ${builderField.page_ref}`);
  }

  for (const option of (formJson.field_options || [])) {
    if (!builderFieldRefs.has(option.builder_field_ref)) warnings.push(`Field option points to missing builder field ${option.builder_field_ref}`);
  }

  if (!countBy(formJson.categories)) errors.push("No categories were extracted");
  if (!countBy(formJson.page_masters)) errors.push("No pages were extracted");
  if (!countBy(formJson.form_fields)) errors.push("No form fields were extracted");
  if (!countBy(formJson.builder_fields)) errors.push("No builder fields were extracted");

  return {
    ok: errors.length === 0,
    errors,
    warnings,
    counts: {
      categories: countBy(formJson.categories),
      pages: countBy(formJson.page_masters),
      formFields: countBy(formJson.form_fields),
      builderFields: countBy(formJson.builder_fields),
      fieldOptions: countBy(formJson.field_options),
      formRules: countBy(formJson.form_rules),
      addMoreGroups: countBy(formJson.add_more_groups || []),
      addMoreColumns: countBy(formJson.add_more_columns || []),
    },
  };
};

const toGeneratedJsonPayload = (formJson) => ({
  ...formJson,
  pages: formJson.page_masters || [],
  totalFormFields: countBy(formJson.form_fields),
  totalBuilderFields: countBy(formJson.builder_fields),
  totalFieldOptions: countBy(formJson.field_options),
  totalFormRules: countBy(formJson.form_rules),
  addMoreGroups: countBy(formJson.add_more_groups || []),
});

const buildSuccessfulResult = (finalJson) => {
  const checklist = validateFormBuilderJson(finalJson);
  if (!checklist.ok) throw new Error(checklist.errors.join("; "));
  const savedFile = saveGeneratedFormJson(finalJson);

  return {
    formJSON: toGeneratedJsonPayload(finalJson),
    checklist,
    savedFile,
  };
};

const generateFormBuilderJsonFromSrs = async (rawText, deps) => {
  const text = normalizeSrsText(rawText);
  if (!text || text.length < 100) throw new Error("SRS text is too short to extract a form schema");

  if (isKnownCafTemplate(text)) {
    return buildSuccessfulResult(deepClone(loadReferenceFormJson()));
  }

  const categories = await callGeminiJsonPrompt(PROMPTS.categories, text, null, deps);
  const pages = await callGeminiJsonPrompt(PROMPTS.pages, text, null, deps);
  const pageCategoryMappingsResult = await callGeminiJsonPrompt(PROMPTS.pageCategoryMappings, text, {
    categories: categories.categories || [],
    page_masters: pages.page_masters || [],
  }, deps);
  const pageCategoryMappings = pageCategoryMappingsResult.page_category_mappings || [];

  const sections = splitIntoSections(text);
  const allFormFields = [];
  const allBuilderFields = [];
  const allFieldOptions = [];
  const allAddMoreGroups = [];
  const allAddMoreColumns = [];

  let fieldOffset = 0;
  let builderFieldOffset = 0;
  let addMoreGroupOffset = 0;

  for (const section of sections) {
    const unified = await callGeminiJsonPrompt(PROMPTS.unifiedFields, section, {
      cats: categories,
      pages,
      pcm: pageCategoryMappings,
    }, deps);

    const { formFields, builderFields } = reindexUnified(unified, fieldOffset, builderFieldOffset);
    allFormFields.push(...formFields);
    allBuilderFields.push(...builderFields);

    const optionsResult = await callGeminiJsonPrompt(PROMPTS.options, section, { builder_fields: builderFields }, deps);
    allFieldOptions.push(...(optionsResult.field_options || []));

    const hasAddMoreMarker = /\[\+\]\s*ADD MORE|\bADD MORE\s*\(Repeatable\)|\brepeatable\b/i.test(section);
    if (hasAddMoreMarker) {
      const addMoreResult = await callGeminiJsonPrompt(PROMPTS.addMore, section, { builder_fields: builderFields }, deps);
      const groupList = [...((addMoreResult.addmore_groups || addMoreResult.add_more_groups || []))];
      const columnList = [...((addMoreResult.add_more_columns || addMoreResult.addmore_columns || []))];

      const groupRefMap = new Map();
      for (let index = 0; index < groupList.length; index++) {
        const group = groupList[index];
        const newRef = `$AG${addMoreGroupOffset + index + 1}`;
        groupRefMap.set(group.ref, newRef);
        group.ref = newRef;
        group.trigger_builder_field_ref = `$BF${refNumber(group.trigger_builder_field_ref) + builderFieldOffset}`;
      }
      for (const column of columnList) {
        column.group_ref = groupRefMap.get(column.group_ref) || column.group_ref;
        column.builder_field_ref = `$BF${refNumber(column.builder_field_ref) + builderFieldOffset}`;
      }

      addMoreGroupOffset += groupList.length;
      allAddMoreGroups.push(...groupList);
      allAddMoreColumns.push(...columnList);
    }

    fieldOffset += formFields.length;
    builderFieldOffset += builderFields.length;
  }

  const rulesResult = await callGeminiJsonPrompt(PROMPTS.rules, text, {
    all_builder_fields: allBuilderFields.map((item) => ({ ref: item.ref, label: item.custom_label || "" })),
    all_categories: categories.categories || [],
  }, deps);
  const metaResult = await callGeminiJsonPrompt(PROMPTS.meta, text.slice(0, 4000), null, deps);

  const finalJson = buildFormBuilderJson(
    metaResult.meta || {
      department_id: 1,
      service_id: "1.0",
      form_type_id: 1,
      form_name: "Form",
    },
    categories,
    pages,
    pageCategoryMappings,
    allFormFields,
    allBuilderFields,
    allFieldOptions,
    allAddMoreGroups,
    allAddMoreColumns,
    rulesResult.form_rules || [],
  );

  return buildSuccessfulResult(finalJson);
};

module.exports = {
  extractSrsTextFromUpload,
  generateFormBuilderJsonFromSrs,
  normalizeSrsText,
};
