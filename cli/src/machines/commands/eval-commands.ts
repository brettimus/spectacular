import { initContext } from "../../context";
import { intro, outro, text, spinner } from "@clack/prompts";
import pico from "picocolors";
import { SPECTACULAR_TITLE } from "../../const";
import { createSpecGenerationActor } from "../workflows/spec-generation";
import { createSchemaGenerationActor } from "../workflows/schema-generation";
import { promptOpenAiKey } from "../../openai-api-key";

/**
 * Evaluation command to test only the spec generation part
 */
export async function commandEvalSpecGeneration(): Promise<void> {
  intro(pico.bold(`${SPECTACULAR_TITLE} - Spec Generation Evaluation`));

  // Initialize context
  const ctx = await initContext();

  // Ensure we have an API key
  await promptOpenAiKey(ctx);

  // Get test project description
  const description = await text({
    message: "Enter a project description for evaluation:",
    placeholder: "A blog platform with authentication",
    validate(value) {
      if (!value) return "Please enter a description";
      if (value.length < 10) return "Description is too short";
      return;
    },
  });

  if (typeof description !== "string") {
    outro("Evaluation cancelled");
    return;
  }

  // Update context with description
  ctx.description = description;

  // Create and start the machine
  const actor = createSpecGenerationActor(ctx);
  actor.start();

  // Set up spinner
  const spin = spinner();
  spin.start("Generating specification...");

  // Subscribe to state changes
  const subscription = actor.subscribe((state) => {
    if (state.matches("describing")) {
      spin.message("Getting description...");
    } else if (state.matches("ideating")) {
      spin.message("Ideating project...");
    } else if (state.matches("savingSpec")) {
      spin.message("Saving specification...");
    }
  });

  // Start the workflow
  actor.send({ type: "DESCRIBE_PROJECT" });

  try {
    // Wait for the output
    const result = await actor.getSnapshot().output;
    subscription.unsubscribe();

    spin.stop("Specification generated successfully!");

    outro(`Specification saved to: ${pico.green(result.specPath)}`);
    outro(`Took ${pico.yellow(result.duration)} ms to generate`);
  } catch (error) {
    subscription.unsubscribe();
    spin.stop("Evaluation failed");
    console.error("Error:", error);
    outro("Failed to generate specification");
  }
}

/**
 * Evaluation command that only tests schema generation with a given spec
 */
export async function commandEvalSchemaGeneration(
  specPath: string,
): Promise<void> {
  intro(pico.bold(`${SPECTACULAR_TITLE} - Schema Generation Evaluation`));

  if (!specPath) {
    outro("Please provide a spec path");
    return;
  }

  // Initialize context
  const ctx = await initContext();

  // Ensure we have an API key
  await promptOpenAiKey(ctx);

  // Create and start the machine
  const actor = createSchemaGenerationActor(ctx, specPath);
  actor.start();

  // Set up spinner
  const spin = spinner();
  spin.start("Generating schema...");

  // Subscribe to state changes
  const subscription = actor.subscribe((state) => {
    if (state.matches("downloadingTemplate")) {
      spin.message("Downloading template...");
    } else if (state.matches("installingDependencies")) {
      spin.message("Installing dependencies...");
    } else if (state.matches("generatingSchema")) {
      spin.message("Generating schema...");
    } else if (state.matches("validatingSchema")) {
      spin.message("Validating schema...");
    } else if (state.matches("healing")) {
      spin.message(
        `Healing schema (attempt ${state.context.healingAttempt})...`,
      );
    }
  });

  // Start the workflow
  actor.send({ type: "START", specPath });

  try {
    // Wait for the output
    const result = await actor.getSnapshot().output;
    subscription.unsubscribe();

    if (result.success) {
      spin.stop("Schema generated successfully!");
      outro(`Schema saved to: ${pico.green(result.schemaFilePath)}`);
      outro(`Took ${pico.yellow(result.duration)} ms to generate`);
    } else {
      spin.stop("Schema generation failed");
      outro("Failed to generate schema");
    }
  } catch (error) {
    subscription.unsubscribe();
    spin.stop("Evaluation failed");
    console.error("Error:", error);
    outro("Failed to generate schema");
  }
}

/**
 * Evaluation command that runs a full integration test
 */
export async function commandEvalFullWorkflow(): Promise<void> {
  intro(pico.bold(`${SPECTACULAR_TITLE} - Full Workflow Evaluation`));

  // Initialize context
  const ctx = await initContext();

  // Ensure we have an API key
  await promptOpenAiKey(ctx);

  // Get test project description
  const description = await text({
    message: "Enter a project description for evaluation:",
    placeholder: "A blog platform with authentication",
    validate(value) {
      if (!value) return "Please enter a description";
      if (value.length < 10) return "Description is too short";
      return;
    },
  });

  if (typeof description !== "string") {
    outro("Evaluation cancelled");
    return;
  }

  // Update context with description
  ctx.description = description;

  // Step 1: Create specification
  outro("STEP 1: Generating specification");
  const specActor = createSpecGenerationActor(ctx);
  specActor.start();

  // Set up spinner
  let spin = spinner();
  spin.start("Generating specification...");

  // Subscribe to state changes
  let subscription = specActor.subscribe((state) => {
    if (state.matches("describing")) {
      spin.message("Getting description...");
    } else if (state.matches("ideating")) {
      spin.message("Ideating project...");
    } else if (state.matches("savingSpec")) {
      spin.message("Saving specification...");
    }
  });

  // Start the workflow
  specActor.send({ type: "DESCRIBE_PROJECT" });

  try {
    // Wait for the output
    const specResult = await specActor.getSnapshot().output;
    subscription.unsubscribe();

    spin.stop("Specification generated successfully!");
    outro(`Specification saved to: ${pico.green(specResult.specPath)}`);

    // Step 2: Generate schema
    outro("STEP 2: Generating schema");
    const schemaActor = createSchemaGenerationActor(ctx, specResult.specPath);
    schemaActor.start();

    // Set up new spinner
    spin = spinner();
    spin.start("Generating schema...");

    // Subscribe to state changes
    subscription = schemaActor.subscribe((state) => {
      if (state.matches("downloadingTemplate")) {
        spin.message("Downloading template...");
      } else if (state.matches("installingDependencies")) {
        spin.message("Installing dependencies...");
      } else if (state.matches("generatingSchema")) {
        spin.message("Generating schema...");
      } else if (state.matches("validatingSchema")) {
        spin.message("Validating schema...");
      } else if (state.matches("healing")) {
        spin.message(
          `Healing schema (attempt ${state.context.healingAttempt})...`,
        );
      }
    });

    // Start the workflow
    schemaActor.send({ type: "START", specPath: specResult.specPath });

    try {
      // Wait for the output
      const schemaResult = await schemaActor.getSnapshot().output;
      subscription.unsubscribe();

      if (schemaResult.success) {
        spin.stop("Schema generated successfully!");
        outro(`Schema saved to: ${pico.green(schemaResult.schemaFilePath)}`);

        // Full workflow completed successfully
        outro(pico.green("✓ Full workflow evaluation completed successfully!"));
        outro(
          `Total time: ${pico.yellow(specResult.duration + schemaResult.duration)} ms`,
        );
      } else {
        spin.stop("Schema generation failed");
        outro("Failed to generate schema");
      }
    } catch (error) {
      subscription.unsubscribe();
      spin.stop("Schema generation failed");
      console.error("Error:", error);
      outro("Failed to generate schema");
    }
  } catch (error) {
    subscription.unsubscribe();
    spin.stop("Specification generation failed");
    console.error("Error:", error);
    outro("Failed to generate specification");
  }
}
