#!/bin/bash
# This example script shows how to run this program locally rather than hosted in github actions.
# It sets the required environment variables to clean up stale runners from a repository,
# then cleans up all offline runners that are not the specified dummy runner.

# The github repository to operate on
export GITHUB_REPOSITORY=smartcontractkit/chainlink

# This token should have access for modifying and listing github runners
# respective github repository
export GITHUB_TOKEN=<github personal access token>

# A "dummy runner" in the context of https://github.com/philips-labs/terraform-aws-github-runner#usages
# Specifically, "This offline runner will ensure your builds will not fail immediately and stay queued
# until there is a runner to pick it up."
# This environment variable is optional.
export DUMMY_RUNNER=ip-192-168-197-167

# Install deps
yarn
# Build the program
yarn build
# Run the program
yarn start
