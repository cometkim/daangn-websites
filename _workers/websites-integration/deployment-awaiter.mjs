import { parseArgs } from 'node:util';
import { setInterval } from 'node:timers/promises';

import { $ } from 'zx';

const {
  WEBSITES_ADMIN_KEY,
  WEBSITES_INTEGRATION_ENDPOINT,

  // This script is available only on the Cloudflare Pages build, and some env vars will be injected from.
  // See https://developers.cloudflare.com/pages/configuration/build-configuration/
  CF_PAGES,
  CF_PAGES_COMMIT_SHA,
  CF_PAGES_BRANCH,
  CF_PAGES_URL,
} = process.env;

if (CF_PAGES !== '1') {
  throw new Error("deployment-awaiter should be executed only on Cloudflare Pages' build");
}

const baseUrl = new URL(WEBSITES_INTEGRATION_ENDPOINT);

const { values } = parseArgs({
  args: process.argv.slice(2),
  options: {
    workflowId: {
      type: 'string',
    },
    timeout: {
      type: 'string',
      default: (10 * 1000 * 60).toString(), // 10 mins
    },
  },
});

const params = {
  workflow_id: values.workflowId,
  ref: CF_PAGES_BRANCH,
  commit_sha: CF_PAGES_COMMIT_SHA,
};

const initResponse = await fetch(new URL('/deployments', baseUrl), {
  method: 'POST',
  headers: {
    Authorization: `AdminKey ${WEBSITES_ADMIN_KEY}`,
    Accept: 'application/json',
    'Content-Type': 'application/json',
  },
  body: JSON.stringify(params),
});
const initData = await initResponse.json();
if (!initResponse.ok) {
  console.error({ status: initResponse.status, data: initData });
  process.exit(1);
}

let state = initData.state;
const checkUrl = new URL(initData.check_url);
const artifactUrl = new URL(initData.artifact_url);

const timeout = Number.parseInt(values.timeout);
for await (const startTime of setInterval(5000, timeout)) {
  const now = Date.now();
  if (now - startTime >= timeout) {
    console.error(`Timeout exceeded (${timeout} ms)`);
    process.exit(1);
  }

  const res = await fetch(checkUrl);
  const data = await res.json();
  if (!res.ok) {
    console.error({ status: res.status, data });
    process.exit(1);
  }

  state = data.state;
  if (state.type === 'IDLE') {
    throw new Error('invariant');
  }
  if (state.type === 'IN_PROGRESS') {
    continue;
  }
  if (state.type === 'DONE') {
    if (state.status === 'failure') {
      console.error(
        `Workflow run failed: https://github.com/daangn/websites/actions/runs/${state.runId}`,
      );
      process.exit(1);
    }
    if (state.status === 'cancelled') {
      console.error(
        `Workflow run cancelled: https://github.com/daangn/websites/actions/runs/${state.runId}`,
      );
      process.exit(1);
    }
    if (state.status === 'success') {
      break;
    }
  }
}

console.log('Downloading artifact...');
await $`curl -fL -H "Authorization: ${WEBSITES_ADMIN_KEY}" "${artifactUrl.toString()}" -o public.tar.zst`;

console.log('Extracting artifact...');
await $`tar --use-compress-program="zstd -d" -xvf public.tar.zst`;