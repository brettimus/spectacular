import { type Context, initContext } from "@/deprecated-cli/context";
import { analyzeDatabaseTables } from "./analyze-tables";
import { generateSchema } from "./generate-schema";
import type { SelectedRule } from "./types";
import {
  verifyGeneratedSchema,
  // type SchemaVerificationObject,
} from "./verify-schema";

export class SchemaAgentService {
  async getSchemaFromSpec(
    specContent: string,
    projectDir: string,
  ): Promise<{ code: string }> {
    const context = initContext();
    context.specContent = specContent;
    context.projectPath = projectDir;
    const tablesResult = await this.analyzeTables(context);

    // TODO - Uncomment rules once we have some
    // const relevantRules = await this.identifyRelevantRules(context, tablesResult.object.schemaSpecification);
    const relevantRules = { object: { relevantRules: [] } };
    const schemaResult = await this.generateSchema(
      context,
      tablesResult.object.schemaSpecification,
      relevantRules.object.relevantRules,
    );

    if (projectDir) {
      // TODO - Try to fix
    }

    return { code: schemaResult.object.dbSchemaTs };
  }

  async analyzeTables(context: Context) {
    return analyzeDatabaseTables(context);
  }

  async generateSchema(
    context: Context,
    schemaSpecification: string,
    relevantRules: SelectedRule[],
  ) {
    return generateSchema(context, schemaSpecification, relevantRules);
  }

  async verifyGeneratedSchema(context: Context, schema: string) {
    return verifyGeneratedSchema(context, schema);
  }
}
