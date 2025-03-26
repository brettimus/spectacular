import { intro, outro, spinner, confirm } from "@clack/prompts";
import pico from "picocolors";
import { initContext } from "../../context";
import { SPECTACULAR_TITLE } from "../../const";
import { promptOpenAiKey } from "../../openai-api-key";
import { createSchemaGenerationActor } from "../workflows/schema-generation";
import { handleResult } from "../../utils/result";
import { saveGlobalDebugInfo } from "../../utils/credentials";

/**
 * Command that uses the schema generation workflow machine to generate 
 * a schema for a Cloudflare project
 */
export async function commandCreateSchemaMachine(
  specPath?: string,
  skipIntro = false
): Promise<{ success: boolean; schemaPath?: string }> {
  if (!skipIntro) {
    intro(pico.bold(SPECTACULAR_TITLE));
  }

  // Initialize the CLI context
  const ctx = await initContext();
  
  // Make sure we have an OpenAI API key
  await promptOpenAiKey(ctx);
  
  // Record debugging info
  saveGlobalDebugInfo({ ctx, _meta: { command: "create-schema" } });

  // If no spec path provided, ask if user wants to continue
  const shouldContinue = specPath ? true : await confirm({
    message: "Do you want to generate a schema without a specification?",
    initialValue: false,
  });

  if (!shouldContinue) {
    outro("Cancelled schema generation");
    return { success: false };
  }

  // Create and start the schema generation actor
  const schemaActor = createSchemaGenerationActor(ctx, specPath || "");
  
  // Set up a spinner to show progress
  const spin = spinner();
  spin.start("Generating schema...");
  
  // Subscribe to machine state changes to update the spinner
  const subscription = schemaActor.subscribe((state) => {
    if (state.matches("downloadingTemplate")) {
      spin.message("Downloading project template...");
    } else if (state.matches("installingDependencies")) {
      spin.message("Installing dependencies...");
    } else if (state.matches("generatingSchema")) {
      spin.message("Generating schema...");
    } else if (state.matches("validatingSchema")) {
      spin.message("Validating schema...");
    } else if (state.matches("healing")) {
      spin.message(`Healing schema (attempt ${state.context.healingAttempt})...`);
    }
    
    // Log any errors
    if (state.context.error) {
      console.error("Error:", state.context.error);
    }
  });
  
  // Start the machine with the START event
  schemaActor.start();
  schemaActor.send({ type: "START", specPath: specPath || "" });
  
  try {
    // Wait for the machine to finish
    const result = await schemaActor.getSnapshot().output;
    subscription.unsubscribe(); // Proper way to unsubscribe
    
    if (result.success) {
      spin.stop("Schema generation completed successfully!");
      outro(`Schema saved to: ${pico.green(result.schemaFilePath)}`);
      return {
        success: true,
        schemaPath: result.schemaFilePath
      };
    }
    
    spin.stop("Schema generation failed");
    outro("Failed to generate schema.");
    return { success: false };
  } catch (error) {
    subscription.unsubscribe(); // Proper way to unsubscribe
    spin.stop("Schema generation failed");
    handleResult({ error });
    return { success: false };
  }
} 