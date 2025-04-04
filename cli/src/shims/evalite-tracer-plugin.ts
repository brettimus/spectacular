import type { Plugin } from 'vite';

/**
 * Vite plugin to replace evalite's traceAISDKModel with an identity function
 * when the SKIP_TRACING environment variable is set.
 * 
 * This avoids using AsyncLocalStorage which causes browser compatibility issues.
 */
export function evaliteTracerPlugin(): Plugin {
  return {
    name: 'evalite-tracer-plugin',
    enforce: 'pre', // Run before other plugins to ensure it happens before transformation
    
    transform(code, id) {      
      // Only process evalite/ai-sdk or modules that import from it
      if (id.includes('evalite') && id.includes('ai-sdk') || 
          code.includes("from 'evalite/ai-sdk'") || 
          code.includes('from "evalite/ai-sdk"')) {
            
        // Check if this is the actual evalite/ai-sdk module
        if (id.includes('evalite') && id.includes('ai-sdk') && 
            (code.includes('export') && code.includes('traceAISDKModel'))) {
          
          console.log(`[evalite-tracer-plugin] Replacing traceAISDKModel in ${id}`);
          
          // Replace the entire module with a simple identity function
          return `
            // Evalite tracer replaced with identity function (SKIP_TRACING=true)
            export const traceAISDKModel = (model) => model;
          `;
        }
        
        // For importers of the module, make sure imports still work
        if (code.includes('traceAISDKModel') && 
            (code.includes("from 'evalite/ai-sdk'") || code.includes('from "evalite/ai-sdk"'))) {
          
          console.log(`[evalite-tracer-plugin] Updating traceAISDKModel import in ${id}`);
          
          // No need to modify the imports - we're replacing the module they import from
          return code;
        }
      }
      
      return null; // Don't modify other files
    }
  };
} 