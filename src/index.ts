import * as core from "@actions/core";
import * as github from "@actions/github";
import { GitHub } from "@actions/github/lib/utils";
import { Octokit } from "@octokit/core/dist-types";
import { throttling } from "@octokit/plugin-throttling";

async function cleanupRunners() {
  const { token, dummyRunner } = getInputs();
  const octokit = getOctokit(token);
  const { owner, repo } = github.context.repo;

  const runners = await octokit.paginate(
    octokit.actions.listSelfHostedRunnersForRepo,
    {
      owner,
      repo,
    }
  );
  core.info(`${runners.length} runners found for ${owner}/${repo}`);

  const offlineRunnersToDelete = runners.map(async ({ id, status, name }) => {
    if (status === "online" || name === dummyRunner) {
      core.info(`Runner ${name} is either online or a dummy runner, skipping`);
      return;
    }

    await octokit.actions.deleteSelfHostedRunnerFromRepo({
      runner_id: id,
      owner,
      repo,
    });
  });

  await Promise.all(offlineRunnersToDelete);
}
cleanupRunners();

function getInputs() {
  if (process.env.CI) {
    const token = core.getInput("githubToken", { required: true });
    const dummyRunner = core.getInput("dummyRunner");

    return { token, dummyRunner };
  } else {
    const token = process.env.GITHUB_TOKEN;
    const dummyRunner = process.env.DUMMY_RUNNER;

    if (!token) {
      throw Error("GITHUB_TOKEN must be supplied");
    }
    return { token, dummyRunner };
  }
}

function getOctokit(token: string) {
  const ThrottledOctokit = GitHub.plugin(throttling);
  // https://github.com/octokit/plugin-throttling.js
  const octokit = new ThrottledOctokit({
    auth: token,
    throttle: {
      onRateLimit: (
        retryAfter: number,
        options: {
          method: string;
          url: string;
          request: { retryCount: number };
        },
        octokit: Octokit
      ) => {
        octokit.log.warn(
          `Request quota exhausted for request ${options.method} ${options.url}`
        );

        if (options.request.retryCount === 0) {
          // only retries once
          octokit.log.info(`Retrying after ${retryAfter} seconds!`);
          return true;
        }
      },
      onAbuseLimit: (
        _retryAfter: number,
        options: { method: string; url: string },
        octokit: Octokit
      ) => {
        // does not retry, only logs a warning
        octokit.log.warn(
          `Abuse detected for request ${options.method} ${options.url}`
        );
      },
    },
  });

  return octokit;
}
