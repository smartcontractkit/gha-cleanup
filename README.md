# Self hosted Github Action Runner Cleanup

This action cleans up stray runners that have been generated by automated scale-up processes such as https://github.com/philips-labs/terraform-aws-github-runner. It removes all runners from the repository it is being on run that are offline.

# Local usage

This action can be used locally too, for one-off runs or testing. See [./run-example.sh](./run-example.sh).

# Dependencies

- Node v12
- Yarn 1.x

# Building

```sh
yarn
yarn build
```

# Running

```sh
yarn start
```

# Inputs

See [./action.yml](./action.yml).
