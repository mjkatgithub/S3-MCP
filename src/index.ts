import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema
} from "@modelcontextprotocol/sdk/types.js";
import {
  getObjectMetadata,
  listBuckets,
  listObjects,
  searchObjectsByName
} from "./s3.js";

type ToolResponse = {
  content: { type: "text"; text: string }[];
  isError?: boolean;
};

const server = new Server(
  {
    name: "s3-mcp",
    version: "0.1.0"
  },
  {
    capabilities: {
      tools: {}
    }
  }
);

server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: "s3_list_buckets",
        description: "List all buckets.",
        inputSchema: {
          type: "object",
          properties: {}
        }
      },
      {
        name: "s3_list_objects",
        description: "List objects in a bucket. Supports prefix and recursive listing.",
        inputSchema: {
          type: "object",
          properties: {
            bucket: { type: "string" },
            prefix: { type: "string" },
            recursive: { type: "boolean", default: true },
            maxResults: { type: "integer", minimum: 1 }
          },
          required: ["bucket"]
        }
      },
      {
        name: "s3_get_object_metadata",
        description: "Fetch object metadata including tags.",
        inputSchema: {
          type: "object",
          properties: {
            bucket: { type: "string" },
            key: { type: "string" }
          },
          required: ["bucket", "key"]
        }
      },
      {
        name: "s3_search_objects",
        description: "Search objects by name (substring match).",
        inputSchema: {
          type: "object",
          properties: {
            bucket: { type: "string" },
            nameContains: { type: "string" },
            prefix: { type: "string" },
            maxResults: { type: "integer", minimum: 1 }
          },
          required: ["bucket", "nameContains"]
        }
      }
    ]
  };
});

const toResponse = (payload: unknown): ToolResponse => {
  return {
    content: [
      {
        type: "text",
        text: JSON.stringify(payload, null, 2)
      }
    ]
  };
};

const toError = (error: unknown): ToolResponse => {
  const message = error instanceof Error ? error.message : String(error);
  return {
    content: [
      {
        type: "text",
        text: message
      }
    ],
    isError: true
  };
};

const requireString = (value: unknown, field: string): string => {
  const text = typeof value === "string" ? value.trim() : "";
  if (!text) {
    throw new Error(`Missing required field: ${field}`);
  }
  return text;
};

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    switch (name) {
      case "s3_list_buckets": {
        const buckets = await listBuckets();
        return toResponse({ buckets });
      }
      case "s3_list_objects": {
        const bucket = requireString(args?.bucket, "bucket");
        const prefix = args?.prefix ? String(args.prefix) : undefined;
        const recursive =
          typeof args?.recursive === "boolean" ? args.recursive : true;
        const maxResults =
          typeof args?.maxResults === "number" ? args.maxResults : undefined;
        const result = await listObjects(bucket, prefix, recursive, maxResults);
        return toResponse(result);
      }
      case "s3_get_object_metadata": {
        const bucket = requireString(args?.bucket, "bucket");
        const key = requireString(args?.key, "key");
        const result = await getObjectMetadata(bucket, key);
        return toResponse(result);
      }
      case "s3_search_objects": {
        const bucket = requireString(args?.bucket, "bucket");
        const nameContains = requireString(args?.nameContains, "nameContains");
        const prefix = args?.prefix ? String(args.prefix) : undefined;
        const maxResults =
          typeof args?.maxResults === "number" ? args.maxResults : undefined;
        const results = await searchObjectsByName(
          bucket,
          nameContains,
          prefix,
          maxResults
        );
        return toResponse({
          bucket,
          nameContains,
          prefix,
          results
        });
      }
      default:
        return toError(`Unknown tool: ${name}`);
    }
  } catch (error) {
    return toError(error);
  }
});

const transport = new StdioServerTransport();
await server.connect(transport);
