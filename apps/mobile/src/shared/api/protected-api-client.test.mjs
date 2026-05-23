import assert from "node:assert/strict";
import test from "node:test";

import { createProtectedApiClient } from "./protected-api-client.ts";

test("protected api client rejects requests when no authenticated Firebase user exists", async () => {
  let fetchCalled = false;

  const client = createProtectedApiClient({
    authInstance: {
      currentUser: null,
    },
    baseUrl: "http://localhost:3000",
    fetchImpl: async () => {
      fetchCalled = true;
      throw new Error("fetch should not be called");
    },
  });

  await assert.rejects(
    () =>
      client.post("/v1/calculate-electricity", {
        inputType: "kwh",
      }),
    /authenticated Firebase user/i,
  );

  assert.equal(fetchCalled, false);
});

test("protected api client attaches a bearer token from the current Firebase user", async () => {
  let requestUrl = "";
  let requestInit;

  const client = createProtectedApiClient({
    authInstance: {
      currentUser: {
        async getIdToken() {
          return "firebase-id-token";
        },
      },
    },
    baseUrl: "http://localhost:3000",
    fetchImpl: async (url, init) => {
      requestUrl = String(url);
      requestInit = init;

      return {
        async json() {
          return { success: true };
        },
      };
    },
  });

  await client.post("/v1/calculate-electricity", {
    inputType: "kwh",
  });

  assert.equal(requestUrl, "http://localhost:3000/v1/calculate-electricity");
  assert.equal(requestInit?.method, "POST");
  assert.equal(requestInit?.headers instanceof Headers, true);
  assert.equal(
    requestInit?.headers.get("authorization"),
    "Bearer firebase-id-token",
  );
  assert.equal(requestInit?.headers.get("content-type"), "application/json");
  assert.deepEqual(JSON.parse(String(requestInit?.body)), {
    inputType: "kwh",
  });
});
