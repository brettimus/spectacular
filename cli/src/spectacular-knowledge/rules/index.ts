// Drizzle Schema Rules
import settingDefaultFunctionsForSqliteColumns from "./drizzle-schema-rules/setting-default-functions-for-sqlite-columns-with-drizzle-orm.md?raw";
import handlingJsonColumns from "./drizzle-schema-rules/handling-json-columns-in-sqlite.md?raw";
import creatingTextColumn from "./drizzle-schema-rules/creating-a-text-column-in-sqlite-with-drizzle-orm.md?raw";
import handlingBlobColumns from "./drizzle-schema-rules/handling-blob-columns-in-sqlite-with-drizzle-orm.md?raw";
import definingSqliteRealColumnTypes from "./drizzle-schema-rules/defining-sqlite-real-column-types-with-drizzle-orm.md?raw";
import definingNonNullableIntegerColumns from "./drizzle-schema-rules/defining-non-nullable-integer-columns-in-sqlite-tables-using-drizzle-orm.md?raw";
import definingDefaultValues from "./drizzle-schema-rules/defining-default-values-for-sqlite-columns-using-drizzle-orm.md?raw";
import definingBooleanColumns from "./drizzle-schema-rules/defining-boolean-columns-in-sqlite-with-drizzle-orm.md?raw";
import customizingIntegerColumns from "./drizzle-schema-rules/customizing-integer-columns-in-sqlite-with-drizzle-orm.md?raw";
import autoIncrementingPrimaryKey from "./drizzle-schema-rules/auto-incrementing-integer-primary-key-in-sqlite.md?raw";
import automatingDateTimeDefaults from "./drizzle-schema-rules/automating-date-and-time-defaults-in-sqlite-with-drizzle-orm.md?raw";
import alwaysNullColumn from "./drizzle-schema-rules/always-null-column-in-sqlite-with-drizzle-orm.md?raw";
import definingSqliteColumnTypes from "./drizzle-schema-rules/defining-sqlite-column-types-with-drizzle-orm.md?raw";

// Hono Rules
import websocketsWithDurableObjects from "./hono-rules/websockets-with-durable-objects-in-hono.md?raw";
import streamingResponses from "./hono-rules/streaming-responses-in-hono.md?raw";
import commonHonoMistakes from "./hono-rules/common-hono-mistakes-to-avoid.md?raw";
import integratingDrizzleOrm from "./hono-rules/integrating-drizzle-orm-with-hono.md?raw";
import errorHandling from "./hono-rules/error-handling-in-hono.md?raw";
import validatingRequestData from "./hono-rules/validating-request-data-in-hono.md?raw";
import usingMiddleware from "./hono-rules/using-middleware-in-hono.md?raw";
import handlingRequestsAndResponses from "./hono-rules/handling-requests-and-responses-in-hono.md?raw";
import accessingEnvironmentVariables from "./hono-rules/accessing-environment-variables-in-cloudflare-workers.md?raw";
import routeGrouping from "./hono-rules/route-grouping-in-hono.md?raw";
import pathParameters from "./hono-rules/path-parameters-in-hono.md?raw";
import multipartFormDataBodies from "./hono-rules/multipart-form-data-bodies.md?raw";

// Drizzle Query Rules
import accessingJsonColumns from "./drizzle-query-rules/accessing-json-columns-in-drizzle-orm.md?raw";
import basicCrudOperations from "./drizzle-query-rules/basic-crud-operations-with-drizzle-orm-and-sqlite.md?raw";
import updatingRecords from "./drizzle-query-rules/updating-records-with-drizzle-orm.md?raw";
import filteringWithComparisonOperators from "./drizzle-query-rules/filtering-with-comparison-operators-in-drizzle-orm.md?raw";
import deletingRecords from "./drizzle-query-rules/deleting-records-with-drizzle-orm.md?raw";
import buildingQueriesWithMultipleFilters from "./drizzle-query-rules/building-queries-with-multiple-filters-in-drizzle-orm.md?raw";
import handlingErrorsInDrizzleOrm from "./drizzle-query-rules/handling-errors-in-drizzle-orm-with-hono.md?raw";
import filteringWithEqualityOperators from "./drizzle-query-rules/filtering-with-equality-operators-in-drizzle-orm.md?raw";
import orderingQueryResults from "./drizzle-query-rules/ordering-query-results-with-drizzle-orm.md?raw";
import countingRecords from "./drizzle-query-rules/counting-records-with-drizzle-orm.md?raw";

// Export individual rules with intuitive names
export {
  // Drizzle Schema Rules
  settingDefaultFunctionsForSqliteColumns,
  handlingJsonColumns,
  creatingTextColumn,
  handlingBlobColumns,
  definingSqliteRealColumnTypes,
  definingNonNullableIntegerColumns,
  definingDefaultValues,
  definingBooleanColumns,
  customizingIntegerColumns,
  autoIncrementingPrimaryKey,
  automatingDateTimeDefaults,
  alwaysNullColumn,
  definingSqliteColumnTypes,
  // Hono Rules
  websocketsWithDurableObjects,
  streamingResponses,
  commonHonoMistakes,
  integratingDrizzleOrm,
  errorHandling,
  validatingRequestData,
  usingMiddleware,
  handlingRequestsAndResponses,
  accessingEnvironmentVariables,
  routeGrouping,
  pathParameters,
  multipartFormDataBodies,
  // Drizzle Query Rules
  accessingJsonColumns,
  basicCrudOperations,
  updatingRecords,
  filteringWithComparisonOperators,
  deletingRecords,
  buildingQueriesWithMultipleFilters,
  handlingErrorsInDrizzleOrm,
  filteringWithEqualityOperators,
  orderingQueryResults,
  countingRecords,
};

// Export an array of all rules
export const drizzleSchemaRules = [
  {
    id: "settingDefaultFunctionsForSqliteColumns",
    content: settingDefaultFunctionsForSqliteColumns,
  },
  {
    id: "handlingJsonColumns",
    content: handlingJsonColumns,
  },
  {
    id: "creatingTextColumn",
    content: creatingTextColumn,
  },
  {
    id: "handlingBlobColumns",
    content: handlingBlobColumns,
  },
  {
    id: "definingSqliteRealColumnTypes",
    content: definingSqliteRealColumnTypes,
  },
  {
    id: "definingNonNullableIntegerColumns",
    content: definingNonNullableIntegerColumns,
  },
  {
    id: "definingDefaultValues",
    content: definingDefaultValues,
  },
  {
    id: "definingBooleanColumns",
    content: definingBooleanColumns,
  },
  {
    id: "customizingIntegerColumns",
    content: customizingIntegerColumns,
  },
  {
    id: "autoIncrementingPrimaryKey",
    content: autoIncrementingPrimaryKey,
  },
  {
    id: "automatingDateTimeDefaults",
    content: automatingDateTimeDefaults,
  },
  {
    id: "alwaysNullColumn",
    content: alwaysNullColumn,
  },
  {
    id: "definingSqliteColumnTypes",
    content: definingSqliteColumnTypes,
  },
];

export const honoRules = [
  {
    id: "websocketsWithDurableObjects",
    content: websocketsWithDurableObjects,
  },
  {
    id: "streamingResponses",
    content: streamingResponses,
  },
  {
    id: "commonHonoMistakes",
    content: commonHonoMistakes,
  },
  {
    id: "integratingDrizzleOrm",
    content: integratingDrizzleOrm,
  },
  {
    id: "errorHandling",
    content: errorHandling,
  },
  {
    id: "validatingRequestData",
    content: validatingRequestData,
  },
  {
    id: "usingMiddleware",
    content: usingMiddleware,
  },
  {
    id: "handlingRequestsAndResponses",
    content: handlingRequestsAndResponses,
  },
  {
    id: "accessingEnvironmentVariables",
    content: accessingEnvironmentVariables,
  },
  {
    id: "routeGrouping",
    content: routeGrouping,
  },
  {
    id: "pathParameters",
    content: pathParameters,
  },
  {
    id: "multipartFormDataBodies",
    content: multipartFormDataBodies,
  },
];

export const drizzleQueryRules = [
  {
    id: "accessingJsonColumns",
    content: accessingJsonColumns,
  },
  {
    id: "basicCrudOperations",
    content: basicCrudOperations,
  },
  {
    id: "updatingRecords",
    content: updatingRecords,
  },
  {
    id: "filteringWithComparisonOperators",
    content: filteringWithComparisonOperators,
  },
  {
    id: "deletingRecords",
    content: deletingRecords,
  },
  {
    id: "buildingQueriesWithMultipleFilters",
    content: buildingQueriesWithMultipleFilters,
  },
  {
    id: "handlingErrorsInDrizzleOrm",
    content: handlingErrorsInDrizzleOrm,
  },
  {
    id: "filteringWithEqualityOperators",
    content: filteringWithEqualityOperators,
  },
  {
    id: "orderingQueryResults",
    content: orderingQueryResults,
  },
  {
    id: "countingRecords",
    content: countingRecords,
  },
];

// Combined array of all rules
export const allRules = [...drizzleSchemaRules, ...honoRules, ...drizzleQueryRules];
