# Saito Network Testing Tool

A command-line utility for managing and testing Saito network configurations. This tool helps developers deploy, manage, and monitor multiple Saito nodes in various testing scenarios.

## Overview

The nettest tool provides functionality to:
- Deploy test networks from predefined scenarios
- Manage node configurations and states
- Monitor node status and logs
- Create and manage test scenarios
- View network endpoints

## Installation

The tool is included in the Saito repository and can be run using npm:

```
npm run nettest help
```

## Commands

### Basic Operations

- `install` - Checks and installs required dependencies (pm2)
- `clear` - Stops all pm2 processes and deletes all node folders
- `start` - Starts the network in sequence (node1 first, then others)
- `stop` - Stops all running nodes
- `status` - Shows current pm2 process status

### Scenario Management

- `list` - Shows available scenarios with their descriptions
- `whatis <scenario>` - Displays detailed description of a specific scenario
- `deploy <scenario> <branch> [--noconfirm]` - Sets up test nodes based on scenario configuration
  - `scenario`: Name of the scenario folder in nettest/scenarios/
  - `branch`: Git branch to use for node deployment
  - `--noconfirm`: Skip the prompt to start network after deployment
- `reset <scenario>` - Resets configuration for all nodes in a scenario
- `snapshot` - Creates a new scenario from the current network state
  - Prompts for scenario name and description
  - Copies configuration and issuance files
  - Optionally includes blockchain data

### Monitoring

- `logs <node_number>` - Displays live logs for specified node
- `endpoints` - Lists all node endpoints in the network

## Scenarios

Scenarios are predefined network configurations stored in `nettest/scenarios/`. Each scenario contains:
- Node configurations
- Module configurations
- Optional blockchain data
- README.md with scenario description

### Creating New Scenarios

You can create new scenarios in two ways:
1. Manually create directories and configuration files in `nettest/scenarios/`
2. Use `nettest snapshot` to save current network state as a new scenario

### Scenario Structure

```
nettest/scenarios/
└── example_scenario/
    ├── README.md
    ├── 1/
    │   ├── config/
    │   │   ├── options.conf
    │   │   └── modules.config.js
    │   └── data/
    │       ├── issuance/
    │       └── blocks/
    ├── 2/
    │   └── ...
    └── 3/
        └── ...
```

## Examples

Deploy a basic test network:
```
npm run nettest deploy base main
```

View network status:
```
npm run nettest status
```

Create a new scenario:
```
npm run nettest snapshot
```

View node logs:
```
npm run nettest logs 1
```

## Troubleshooting

If you encounter issues:
1. Check node logs using `nettest logs <node_number>`
2. Verify node configurations with `nettest endpoints`
3. Try clearing and redeploying: `nettest clear` followed by `nettest deploy`
4. Check the nettest log file in `nettest/nettest.log`

## Contributing

To add new scenarios:
1. Create a new directory in `nettest/scenarios/`
2. Add required configuration files
3. Include a README.md describing the scenario's purpose and behavior
4. Test the scenario with deploy and reset commands

## License

This tool is part of the Saito project and shares its licensing.