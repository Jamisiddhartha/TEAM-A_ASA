const fs = require("fs");
const path = require("path");
const { PrismaClient, YnFlag, OptionSourceType } = require("@prisma/client");

const prisma = new PrismaClient();
const INPUT_JSON = process.env.JSON_FILE || path.join(__dirname, "workflow_final_schema.json");

const ROLE_ALIASES = {
  investor: ["investor"],
  verifier: ["district level verifier", "nodal officer", "nodal_officer"],
  "district level verifier": ["district level verifier", "nodal officer", "nodal_officer"],
  "district level line department": ["district level line department", "department user", "department_user"],
  approver: ["approver", "dist level caf approver", "joint director"],
  "nodal officer": ["nodal officer", "nodal_officer"],
};

function normalizeKey(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function slugify(value) {
  return String(value || "")
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
}

function parseJsonFile(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function parseValidationRule(value) {
  if (value === null || value === undefined || value === "") return null;
  if (typeof value === "object") return value;
  try {
    return JSON.parse(value);
  } catch {
    return { value: String(value) };
  }
}

function enumYn(value, fallback = YnFlag.N) {
  return String(value || "").trim().toUpperCase() === "Y" ? YnFlag.Y : fallback;
}

function boolToActiveStatus(value) {
  return value ? "Y" : "N";
}

function processingLevelForJurisdiction(code) {
  return String(code || "").toUpperCase() === "STATE" ? "State" : "District";
}

function optionSourceTypeFor(value) {
  return String(value || "").toUpperCase() === "MASTER"
    ? OptionSourceType.MASTER
    : OptionSourceType.STATIC;
}

function firstNumber(value, fallback = 0) {
  const match = String(value ?? "").match(/\d+/);
  return match ? Number(match[0]) : fallback;
}

async function resolveRoleId(roleName, roleCache) {
  const key = normalizeKey(roleName);
  if (!key) return null;
  if (roleCache.has(key)) return roleCache.get(key);

  const candidates = [key, ...(ROLE_ALIASES[key] || [])];
  for (const candidate of candidates) {
    const found = await prisma.roles.findFirst({
      where: {
        OR: [
          { name: { equals: candidate, mode: "insensitive" } },
          { name: { contains: candidate, mode: "insensitive" } },
        ],
      },
      select: { id: true, name: true },
    });
    if (found) {
      roleCache.set(key, found.id);
      return found.id;
    }
  }

  roleCache.set(key, null);
  return null;
}

async function ensureService(service) {
  return prisma.service.upsert({
    where: { service_id: String(service.service_id) },
    update: {
      department_id: Number(service.department_id),
      service_name: service.form_name,
      is_caf_required: true,
      isActive: true,
      comments: "Synced from workflow_final_schema.json",
    },
    create: {
      service_id: String(service.service_id),
      department_id: Number(service.department_id),
      service_name: service.form_name,
      is_caf_required: true,
      isActive: true,
      comments: "Synced from workflow_final_schema.json",
    },
  });
}

async function ensureFormType(meta) {
  return prisma.formType.upsert({
    where: { id: Number(meta.form_type_id) },
    update: {
      name: meta.form_name || "CAF",
      abbr: meta.form_type_abbr || "CAF",
      isActive: true,
    },
    create: {
      id: Number(meta.form_type_id),
      name: meta.form_name || "CAF",
      abbr: meta.form_type_abbr || "CAF",
      isActive: true,
    },
  });
}

async function ensureFormMapping(service, meta) {
  const formCode =
    meta.form_code ||
    `UK-SR-${String(service.service_id)}_${String(meta.form_type_id).padStart(2, "0")}-FRM-01`;

  const existing = await prisma.formMapping.findFirst({
    where: {
      department_id: Number(service.department_id),
      service_id: String(service.service_id),
      form_type_id: Number(meta.form_type_id),
    },
  });

  if (existing) {
    return prisma.formMapping.update({
      where: { id: existing.id },
      data: {
        form_name: meta.form_name,
        form_code: formCode,
        form_version: meta.form_version || "1.0",
        is_active: YnFlag.Y,
        modified: new Date(),
      },
    });
  }

  return prisma.formMapping.create({
    data: {
      department_id: Number(service.department_id),
      service_id: String(service.service_id),
      form_type_id: Number(meta.form_type_id),
      form_name: meta.form_name,
      form_code: formCode,
      form_version: meta.form_version || "1.0",
      is_active: YnFlag.Y,
      created: new Date(),
    },
  });
}

async function upsertNamedFormMapping(service, formTypeId, formName) {
  const formCode = `UK-SR-${String(service.service_id).replace(".0", "")}_${String(formTypeId).padStart(2, "0")}-FRM-AUTO`;
  const existing = await prisma.formMapping.findFirst({
    where: {
      department_id: Number(service.department_id),
      service_id: String(service.service_id),
      form_type_id: Number(formTypeId),
    },
    orderBy: { id: "desc" },
  });

  if (existing) {
    return prisma.formMapping.update({
      where: { id: existing.id },
      data: {
        department_id: Number(service.department_id),
        form_name: formName,
        form_code: existing.form_code || formCode,
        form_version: "V1.0",
        is_active: YnFlag.Y,
        modified: new Date(),
      },
    });
  }

  return prisma.formMapping.create({
    data: {
      department_id: Number(service.department_id),
      service_id: String(service.service_id),
      form_type_id: Number(formTypeId),
      form_name: formName,
      form_code: formCode,
      form_version: "V1.0",
      is_active: YnFlag.Y,
      created: new Date(),
    },
  });
}

async function syncFormSchema(config) {
  const formSchema = config.form_schema;
  const meta = formSchema.meta || {};
  const service = config.service || meta;

  await ensureService(service);
  await ensureFormType({
    ...meta,
    form_type_abbr: "CAF",
    form_version: config.workflow?.workflow_version_label || "1.0",
  });
  await ensureFormMapping(service, {
    ...meta,
    form_code: `CAF_${String(service.service_id).replace(/[^a-zA-Z0-9]/g, "")}`,
    form_version: config.workflow?.workflow_version_label || "1.0",
  });

  const categoryMap = new Map();
  const fieldMap = new Map();
  const pageMap = new Map();
  const builderFieldMap = new Map();
  const addMoreGroupMap = new Map();

  for (const category of formSchema.categories || []) {
    const categoryCode = category.category_code || slugify(category.category_name);
    const saved = await prisma.formCategory.upsert({
      where: { categoryCode },
      update: {
        categoryName: category.category_name,
        nameInHindi: category.name_in_hindi || null,
        nameAlt: category.category_name,
        parentId: Number(category.parent_id || 0),
        isActive: category.is_active !== false,
        modified: new Date(),
      },
      create: {
        categoryName: category.category_name,
        nameInHindi: category.name_in_hindi || null,
        nameAlt: category.category_name,
        parentId: Number(category.parent_id || 0),
        categoryCode,
        isActive: category.is_active !== false,
        created: new Date(),
      },
    });
    categoryMap.set(category.ref, saved.id);
  }

  for (const field of formSchema.form_fields || []) {
    const formCheckId = field.formchk_id || `FORMCHK_${String(firstNumber(field.ref)).padStart(4, "0")}`;
    const saved = await prisma.formField.upsert({
      where: { formCheckId },
      update: {
        parentId: 0,
        categoryId: categoryMap.get(field.category_ref) || null,
        name: field.name,
        nameInHindi: field.name_in_hindi || null,
        isEditable: String(field.is_editable || "Y"),
        isActive: field.is_active !== false,
        createdDate: new Date(),
      },
      create: {
        formCheckId,
        parentId: 0,
        categoryId: categoryMap.get(field.category_ref) || null,
        name: field.name,
        nameInHindi: field.name_in_hindi || null,
        isEditable: String(field.is_editable || "Y"),
        isActive: field.is_active !== false,
        createdDate: new Date(),
      },
    });
    fieldMap.set(field.ref, saved.id);
  }

  for (const page of formSchema.page_masters || []) {
    const existing = await prisma.formPageMaster.findFirst({
      where: {
        service_id: String(service.service_id),
        form_id: Number(meta.form_type_id),
        page_name: page.page_name,
      },
    });

    const payload = {
      service_id: String(service.service_id),
      page_name: page.page_name,
      is_active: YnFlag.Y,
      name_in_hindi: page.name_in_hindi || null,
      preference: Number(page.preference),
      form_id: Number(meta.form_type_id),
      form_code: `CAF_${String(service.service_id).replace(/[^a-zA-Z0-9]/g, "")}`,
      modified: new Date(),
    };

    const saved = existing
      ? await prisma.formPageMaster.update({ where: { id: existing.id }, data: payload })
      : await prisma.formPageMaster.create({ data: { ...payload, created: new Date() } });

    pageMap.set(page.ref, saved.id);
  }

  for (const mapping of formSchema.page_category_mappings || []) {
    const pageId = pageMap.get(mapping.page_ref);
    const categoryId = categoryMap.get(mapping.category_ref);
    if (!pageId || !categoryId) continue;

    const existing = await prisma.formPageCategoryMapping.findFirst({
      where: { page_id: pageId, category_id: categoryId },
    });

    if (existing) {
      await prisma.formPageCategoryMapping.update({
        where: { id: existing.id },
        data: {
          preference: Number(mapping.preference || 1),
          help_text: mapping.help_text || null,
          is_active: YnFlag.Y,
        },
      });
    } else {
      await prisma.formPageCategoryMapping.create({
        data: {
          page_id: pageId,
          category_id: categoryId,
          preference: Number(mapping.preference || 1),
          help_text: mapping.help_text || null,
          is_active: YnFlag.Y,
        },
      });
    }
  }

  for (const builderField of formSchema.builder_fields || []) {
    const pageId = pageMap.get(builderField.page_ref);
    const categoryId = categoryMap.get(builderField.category_ref);
    const formFieldId = fieldMap.get(builderField.field_ref);
    if (!pageId || !categoryId || !formFieldId) continue;

    const existing = await prisma.formBuilderField.findFirst({
      where: {
        service_id: String(service.service_id),
        form_id: Number(meta.form_type_id),
        page_id: pageId,
        category_id: categoryId,
        form_field_id: formFieldId,
        preference: Number(builderField.preference || 1),
      },
    });

    const payload = {
      service_id: String(service.service_id),
      form_id: Number(meta.form_type_id),
      page_id: pageId,
      category_id: categoryId,
      form_field_id: formFieldId,
      preference: Number(builderField.preference || 1),
      input_type: builderField.input_type,
      custom_label: builderField.custom_label || null,
      help_text: builderField.help_text || null,
      placeholder: builderField.placeholder || null,
      gridSpan: Number(builderField.grid_span || 12),
      layoutType: builderField.layout_type || null,
      component_props: builderField.component_props || null,
      is_required: enumYn(builderField.is_required),
      is_editable: enumYn(builderField.is_editable, YnFlag.Y),
      is_readonly: enumYn(builderField.is_readonly),
      is_active: enumYn(builderField.is_active, YnFlag.Y),
      min_length: builderField.min_length ?? null,
      max_length: builderField.max_length ?? null,
      pattern: builderField.pattern || null,
      step: builderField.step || null,
      row_type: builderField.row_type || null,
      validation_rule: parseValidationRule(builderField.validation_rule),
      modified: new Date(),
    };

    const saved = existing
      ? await prisma.formBuilderField.update({ where: { id: existing.id }, data: payload })
      : await prisma.formBuilderField.create({ data: { ...payload, created: new Date() } });

    builderFieldMap.set(builderField.ref, saved.id);
  }

  for (const option of formSchema.field_options || []) {
    const builderFieldId = builderFieldMap.get(option.builder_field_ref);
    if (!builderFieldId) continue;

    const existing = await prisma.formFieldOptionConfig.findUnique({
      where: { builder_field_id: builderFieldId },
    });

    const payload = {
      source_type: optionSourceTypeFor(option.source_type),
      master_table_id: option.master_table_id ?? null,
      static_options: option.static_options ?? null,
      parent_builder_field_id: builderFieldMap.get(option.parent_builder_field_ref) || null,
      is_active: YnFlag.Y,
      modified: new Date(),
    };

    if (existing) {
      await prisma.formFieldOptionConfig.update({
        where: { builder_field_id: builderFieldId },
        data: payload,
      });
    } else {
      await prisma.formFieldOptionConfig.create({
        data: { builder_field_id: builderFieldId, ...payload, created: new Date() },
      });
    }
  }

  for (const group of formSchema.addmore_groups || []) {
    const triggerBuilderFieldId = builderFieldMap.get(group.trigger_builder_field_ref);
    const pageId = pageMap.get(group.page_ref);
    const categoryId = categoryMap.get(group.category_ref);
    if (!triggerBuilderFieldId || !pageId || !categoryId) continue;

    const existing = await prisma.formAddMoreGroup.findFirst({
      where: {
        service_id: String(service.service_id),
        form_id: Number(meta.form_type_id),
        page_id: pageId,
        category_id: categoryId,
        trigger_builder_field_id: triggerBuilderFieldId,
      },
    });

    const payload = {
      service_id: String(service.service_id),
      form_id: Number(meta.form_type_id),
      page_id: pageId,
      category_id: categoryId,
      trigger_builder_field_id: triggerBuilderFieldId,
      label: group.label || null,
      min_rows: group.min_rows ?? 1,
      max_rows: group.max_rows ?? null,
      is_active: YnFlag.Y,
      modified: new Date(),
    };

    const saved = existing
      ? await prisma.formAddMoreGroup.update({ where: { id: existing.id }, data: payload })
      : await prisma.formAddMoreGroup.create({ data: { ...payload, created: new Date() } });

    addMoreGroupMap.set(group.ref, saved.id);
  }

  for (const column of formSchema.add_more_columns || []) {
    const groupId = addMoreGroupMap.get(column.group_ref);
    const builderFieldId = builderFieldMap.get(column.builder_field_ref);
    if (!groupId || !builderFieldId) continue;

    const existing = await prisma.formAddMoreColumn.findFirst({
      where: { group_id: groupId, builder_field_id: builderFieldId },
    });

    if (existing) {
      await prisma.formAddMoreColumn.update({
        where: { id: existing.id },
        data: { col_order: Number(column.col_order || 1) },
      });
    } else {
      await prisma.formAddMoreColumn.create({
        data: { group_id: groupId, builder_field_id: builderFieldId, col_order: Number(column.col_order || 1) },
      });
    }
  }

  if (Array.isArray(formSchema.form_rules)) {
    await prisma.formRule.deleteMany({
      where: {
        service_id: String(service.service_id),
        form_id: Number(meta.form_type_id),
      },
    });

    for (const rule of formSchema.form_rules) {
      await prisma.formRule.create({
        data: {
          service_id: String(service.service_id),
          form_id: Number(meta.form_type_id),
          scope: rule.scope || "FORM",
          when_json: rule.when_json || {},
          then_json: rule.then_json || {},
          is_active: YnFlag.Y,
          created: new Date(),
        },
      });
    }
  }
}

async function syncWorkflow(config) {
  const workflow = config.workflow || {};
  if (!Array.isArray(workflow.steps) || !workflow.steps.length) return;
  const service = config.service || {};
  const roleCache = new Map();

  for (const step of workflow.steps || []) {
    const roleId = step.role_id || (await resolveRoleId(step.role_name, roleCache)) || 0;
    const nextAllocationRoleId =
      step.next_allocation_role_id || (await resolveRoleId(step.next_allocation_role_name, roleCache));

    const transitions = {};
    const actionCodes = [];
    let forwardRoleId = 0;
    let revertRoleId = 0;
    let nextRoleId = Number(nextAllocationRoleId || 0);

    for (const action of step.actions || []) {
      const nextRoleIdForAction =
        action.next_role_id || (await resolveRoleId(action.next_role_name, roleCache)) || 0;
      const code = String(action.action_code);
      actionCodes.push(code);
      transitions[code] = {
        next_step: action.next_step ?? null,
        next_roles: nextRoleIdForAction > 0 ? [nextRoleIdForAction] : [],
      };

      if (code === "F" || code === "FA") {
        forwardRoleId = nextRoleIdForAction || forwardRoleId;
        nextRoleId = nextRoleIdForAction || nextRoleId;
      }
      if (code === "RB" || code === "RBI") {
        revertRoleId = nextRoleIdForAction || revertRoleId;
      }
    }

    const existing = await prisma.applicationWorkflowConfiguration.findFirst({
      where: {
        serviceId: String(service.service_id),
        configVersion: Number(workflow.workflow_version_number || 1),
        step: Number(step.step_no),
      },
    });

    const payload = {
      step: Number(step.step_no),
      departmentId: Number(service.department_id),
      serviceId: String(service.service_id),
      configVersion: Number(workflow.workflow_version_number || 1),
      status: "PUBLISHED",
      startDate: new Date(),
      endDate: null,
      roleId,
      jurisdictionLevelId: step.jurisdiction_level_id || null,
      assignmentStrategyId: step.assignment_strategy_id || null,
      actionMasterIdsJson: (step.actions || []).map((item) => item.action_master_id).filter(Boolean),
      jurisdictionLevel: String(step.jurisdiction_code || "DISTRICT").toUpperCase(),
      assignmentStrategy: String(step.assignment_strategy_code || "ROLE").toUpperCase(),
      assignmentRuleJson: {
        role_id: roleId,
        strategy: String(step.assignment_strategy_code || "ROLE").toUpperCase(),
        jurisdiction_level: String(step.jurisdiction_code || "DISTRICT").toUpperCase(),
        next_allocation_role_id: nextAllocationRoleId || null,
        sub_responsibility: step.sub_responsibility || null,
        allowParallelForward: Boolean(step.parallel_forward),
        allowParallelForwardWhileRetainOwnership: Boolean(step.retain_ownership),
      },
      actionAllowedJson: Array.from(new Set(actionCodes)),
      transitionMapJson: transitions,
      slaHours: Number(step.sla_hours || 0),
      slaBreachRequiresReason: Boolean(step.delay_reason_required),
      nextAllocationRoleId: nextAllocationRoleId || null,
      createdBy: "workflow-json-migrator",
      updatedBy: "workflow-json-migrator",
      processingLevel: processingLevelForJurisdiction(step.jurisdiction_code),
      currentRoleId: roleId,
      formTypeId: Number(step.form_type_id || config.service.form_type_id),
      nextRoleId,
      approverId: 0,
      forwardRoleId,
      revertRoleId,
      isDelayReasonRequired: boolToActiveStatus(step.delay_reason_required),
      timeInHours: String(step.sla_hours || 0),
      canRevertToInvestor: actionCodes.includes("RBI") ? "Y" : "N",
      canVerifyDocument: normalizeKey(step.sub_responsibility) === "document verification" ? "Y" : "N",
      canForwardToMultipleRoleId: step.parallel_forward ? String(forwardRoleId || "") : null,
      canForwardToMultipleUserId: null,
      isOwnDepartment: "Y",
      permissableTabFormId: String(step.form_type_id || config.service.form_type_id || ""),
      documentShowLast: "N",
      processAnytime: "N",
      showLiceneceList: "0",
      showFieldEditableOrNot: "0",
      formServiceJs: "",
      formActionController: "",
      subformActionName:
        normalizeKey(step.sub_responsibility) === "document verification" ? "DOCUMENT_VERIFICATION" : "",
      licenceNumberFormat: null,
    };

    if (existing) {
      await prisma.applicationWorkflowConfiguration.update({
        where: { id: existing.id },
        data: payload,
      });
    } else {
      await prisma.applicationWorkflowConfiguration.create({ data: payload });
    }
  }
}

async function syncOfficerForms(config) {
  const workflow = config.workflow || {};
  const service = config.service || {};
  const officerForms = workflow.officer_forms || [];
  if ((!Array.isArray(workflow.steps) || !workflow.steps.length) && !officerForms.length) return;

  const expectedFormTypeIds = new Set(
    (workflow.steps || []).map((step) => Number(step.form_type_id)).filter(Boolean),
  );

  const activeMappings = await prisma.formMapping.findMany({
    where: { service_id: String(service.service_id), is_active: YnFlag.Y },
    select: { id: true, form_type_id: true },
  });

  for (const mapping of activeMappings) {
    if (!expectedFormTypeIds.has(Number(mapping.form_type_id))) {
      await prisma.formMapping.update({
        where: { id: mapping.id },
        data: { is_active: YnFlag.N, modified: new Date() },
      });
    }
  }

  const byFormType = new Map();
  for (const form of officerForms) {
    byFormType.set(Number(form.form_type_id), form);
  }

  for (const step of workflow.steps || []) {
    const formTypeId = Number(step.form_type_id);
    if (!formTypeId) continue;

    let formName = "Workflow Form";
    if (formTypeId === 1) formName = "Combined Application Form (CAF)";
    if (formTypeId === 5) formName = "Verification Level";
    if (formTypeId === 7) formName = "Approver Level";
    if (formTypeId === 8) formName = "Department Internal Forward Level";
    await upsertNamedFormMapping(service, formTypeId, formName);
  }

  for (const form of officerForms) {
    const formTypeId = Number(form.form_type_id);
    const pageName = form.workflow_section_name || form.page_name || form.role_name;
    const categoryName = form.category_name || "For Department Use Only";
    const categoryCode = slugify(`${service.service_id}_${formTypeId}_${categoryName}`);

    const category = await prisma.formCategory.upsert({
      where: { categoryCode },
      update: {
        categoryName,
        nameAlt: categoryName,
        parentId: 0,
        isActive: true,
        modified: new Date(),
      },
      create: {
        categoryName,
        nameAlt: categoryName,
        parentId: 0,
        categoryCode,
        isActive: true,
        created: new Date(),
      },
    });

    const existingPage = await prisma.formPageMaster.findFirst({
      where: {
        service_id: String(service.service_id),
        form_id: formTypeId,
        page_name: pageName,
        is_active: YnFlag.Y,
      },
    });

    const page = existingPage
      ? await prisma.formPageMaster.update({
          where: { id: existingPage.id },
          data: { preference: 1, modified: new Date() },
        })
      : await prisma.formPageMaster.create({
          data: {
            service_id: String(service.service_id),
            page_name: pageName,
            is_active: YnFlag.Y,
            name_in_hindi: null,
            preference: 1,
            form_id: formTypeId,
            form_code: `UK-SR-${String(service.service_id).replace(".0", "")}_${String(formTypeId).padStart(2, "0")}-FRM-AUTO`,
            created: new Date(),
          },
        });

    const pageCategory = await prisma.formPageCategoryMapping.findFirst({
      where: { page_id: page.id, category_id: category.id },
    });
    if (!pageCategory) {
      await prisma.formPageCategoryMapping.create({
        data: {
          page_id: page.id,
          category_id: category.id,
          preference: 1,
          help_text: null,
          is_active: YnFlag.Y,
        },
      });
    }

    for (const field of form.fields || []) {
      const formCheckId = `WF_${String(service.service_id).replace(/\W/g, "")}_${formTypeId}_${String(field.field_number).padStart(3, "0")}`;
      const formField = await prisma.formField.upsert({
        where: { formCheckId },
        update: {
          parentId: 0,
          categoryId: category.id,
          name: field.name,
          nameInHindi: null,
          isEditable: field.is_editable || "Y",
          isActive: true,
          createdDate: new Date(),
        },
        create: {
          formCheckId,
          parentId: 0,
          categoryId: category.id,
          name: field.name,
          nameInHindi: null,
          isEditable: field.is_editable || "Y",
          isActive: true,
          createdDate: new Date(),
        },
      });

      const existingBuilder = await prisma.formBuilderField.findFirst({
        where: {
          service_id: String(service.service_id),
          form_id: formTypeId,
          page_id: page.id,
          category_id: category.id,
          form_field_id: formField.id,
        },
      });

      const builder = existingBuilder
        ? await prisma.formBuilderField.update({
            where: { id: existingBuilder.id },
            data: {
              preference: Number(field.field_number),
              input_type: field.input_type,
              custom_label: field.name,
              help_text: field.notes || null,
              placeholder: null,
              gridSpan: Number(field.grid_span || 12),
              layoutType: null,
              component_props: null,
              is_required: enumYn(field.is_required),
              is_editable: enumYn(field.is_editable, YnFlag.Y),
              is_readonly: enumYn(field.is_readonly),
              is_active: YnFlag.Y,
              min_length: null,
              max_length: null,
              pattern: null,
              step: null,
              row_type: null,
              validation_rule: field.validation_rule || null,
              modified: new Date(),
            },
          })
        : await prisma.formBuilderField.create({
            data: {
              service_id: String(service.service_id),
              form_id: formTypeId,
              page_id: page.id,
              category_id: category.id,
              form_field_id: formField.id,
              preference: Number(field.field_number),
              input_type: field.input_type,
              custom_label: field.name,
              help_text: field.notes || null,
              placeholder: null,
              gridSpan: Number(field.grid_span || 12),
              layoutType: null,
              component_props: null,
              is_required: enumYn(field.is_required),
              is_editable: enumYn(field.is_editable, YnFlag.Y),
              is_readonly: enumYn(field.is_readonly),
              is_active: YnFlag.Y,
              min_length: null,
              max_length: null,
              pattern: null,
              step: null,
              row_type: null,
              validation_rule: field.validation_rule || null,
              created: new Date(),
            },
          });

      if (field.static_options) {
        const optionExisting = await prisma.formFieldOptionConfig.findUnique({
          where: { builder_field_id: builder.id },
        });
        if (optionExisting) {
          await prisma.formFieldOptionConfig.update({
            where: { builder_field_id: builder.id },
            data: {
              source_type: OptionSourceType.STATIC,
              static_options: field.static_options,
              master_table_id: null,
              parent_builder_field_id: null,
              is_active: YnFlag.Y,
              modified: new Date(),
            },
          });
        } else {
          await prisma.formFieldOptionConfig.create({
            data: {
              builder_field_id: builder.id,
              source_type: OptionSourceType.STATIC,
              static_options: field.static_options,
              master_table_id: null,
              parent_builder_field_id: null,
              is_active: YnFlag.Y,
              created: new Date(),
            },
          });
        }
      }
    }
  }
}

async function main() {
  if (!fs.existsSync(INPUT_JSON)) {
    throw new Error(`JSON file not found: ${INPUT_JSON}`);
  }

  const config = parseJsonFile(INPUT_JSON);
  await syncFormSchema(config);
  await syncWorkflow(config);
  await syncOfficerForms(config);

  console.log(`Migration completed successfully from ${INPUT_JSON}`);
}

main()
  .catch((error) => {
    console.error("Migration failed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
