const fs = require("fs");

const { PrismaClient, YnFlag } = require("@prisma/client");

const INPUT_JSON = process.env.JSON_FILE || "";
const ACTIVE_FLAG = YnFlag?.Y || "Y";

const readConfig = () => {
  if (!INPUT_JSON || !fs.existsSync(INPUT_JSON)) {
    throw new Error(`JSON file not found: ${INPUT_JSON || "(missing JSON_FILE env)"}`);
  }
  return JSON.parse(fs.readFileSync(INPUT_JSON, "utf8"));
};

async function main() {
  const config = readConfig();
  const serviceId = String(config?.service?.service_id || config?.form_schema?.meta?.service_id || "");
  const formTypeId = Number(config?.service?.form_type_id || config?.form_schema?.meta?.form_type_id || 0);

  if (!serviceId || !formTypeId) {
    throw new Error("Unable to derive service_id/form_type_id from sync payload");
  }

  const prisma = new PrismaClient();

  try {
    const [
      serviceCount,
      formMappings,
      activePages,
      formFields,
      builderFields,
      addMoreGroups,
      formRules,
      workflowSteps,
    ] = await Promise.all([
      prisma.service.count({ where: { service_id: serviceId } }),
      prisma.formMapping.count({ where: { service_id: serviceId, form_type_id: formTypeId } }),
      prisma.formPageMaster.count({
        where: { service_id: serviceId, form_id: formTypeId, is_active: ACTIVE_FLAG },
      }),
      prisma.formField.count({
        where: {
          formBuilderFields: {
            some: { service_id: serviceId, form_id: formTypeId, is_active: ACTIVE_FLAG },
          },
        },
      }),
      prisma.formBuilderField.count({
        where: { service_id: serviceId, form_id: formTypeId, is_active: ACTIVE_FLAG },
      }),
      prisma.formAddMoreGroup.count({
        where: { service_id: serviceId, form_id: formTypeId },
      }),
      prisma.formRule.count({
        where: { service_id: serviceId, form_id: formTypeId },
      }),
      prisma.applicationWorkflowConfiguration.count({
        where: { serviceId, formTypeId },
      }),
    ]);

    const result = {
      serviceId,
      formTypeId,
      counts: {
        services: serviceCount,
        formMappings,
        pages: activePages,
        formFields,
        builderFields,
        addMoreGroups,
        formRules,
        workflowSteps,
      },
    };

    process.stdout.write(`${JSON.stringify(result)}\n`);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error) => {
  console.error(error?.stack || error?.message || String(error));
  process.exitCode = 1;
});
