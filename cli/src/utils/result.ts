import { cancel, isCancel, log } from "@clack/prompts";
import { CodeGenError, isError } from "@/types";
import { CANCEL_MESSAGE, HATCH_LOG_LEVEL } from "@/const";

export function handleResult(result: unknown) {
  if (isCancel(result)) {
    handleCancel();
  }

  if (isError(result)) {
    handleError(result);
  }
}

export function handleError(error: Error | CodeGenError) {
  if (error instanceof CodeGenError) {
    log.warn(
      `Could not scaffold project according to your description\n(error: ${error.message})`,
    );
    log.info("Continuing...");
  } else {
    log.error(`exiting with an error: ${error.message}`);
    // HACK - Allow us to log the error in more depth if `HATCH_LOG_LEVEL` is set to `debug`
    if (HATCH_LOG_LEVEL === "debug") {
      console.error("\n\n*********LOGGING VERBOSE ERROR*********\n");
      console.error(error);
      console.error(
        "\n\n*********LOGGING VERBOSE ERROR AGAIN, BUT AS JSON*********\n",
      );
      console.error(JSON.stringify(error, null, 2));
    }
    process.exit(1);
  }
}

export function handleCancel() {
  cancel(CANCEL_MESSAGE);
  process.exit(0);
}
