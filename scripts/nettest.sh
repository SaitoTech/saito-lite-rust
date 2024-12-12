#!/bin/bash

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
LOG_FILE="${PROJECT_DIR}/nettest/nettest.log"

# Ensure log directory exists
mkdir -p "$(dirname "$LOG_FILE")"

# Function to log with timestamp
# Function to log with timestamp
log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" >> "$LOG_FILE"
}

# Function to both log and echo to user
announce() {
    echo "$1"
    log "$1"
}

# Function to execute command and log output
execute() {
    local cmd="$1"
    local output
    output=$($cmd 2>&1)
    log "Command: $cmd"
    log "Output: $output"
    return ${PIPESTATUS[0]}
}


function check_folder_structure() {
    local base_dir="${PROJECT_DIR}/nettest"
    local required_dirs=(
        "${base_dir}"
        "${base_dir}/nodes"
        "${base_dir}/scenarios"
    )

    for dir in "${required_dirs[@]}"; do
        if [ ! -d "$dir" ]; then
            announce "Creating directory: $dir"
            execute "mkdir -p $dir"
        fi
    done

    # Check if the base structure exists
    if [ ! -d "${base_dir}" ]; then
        announce "Error: Required base directory ${base_dir} could not be created"
        exit 1
    fi

    announce "Checking folder structure..."
    announce "Base directory: ${base_dir}"
    execute "tree ${base_dir} || ls -R ${base_dir}"
}

function check_pm2_installed() {
    if ! command -v pm2 &> /dev/null; then
        announce "pm2 is not installed. Installing globally..."
        
        # Try installing without sudo first
        if execute "npm install -g pm2 &> /dev/null"; then
            announce "pm2 installed successfully"
            log "pm2 installed successfully"
            return 0
        fi
        
        # If failed, prompt for sudo
        announce "Requires elevated permissions to install pm2 globally"
        announce "Please enter your password if prompted"
                
        if sudo npm install -g pm2; then
            announce "pm2 installed successfully"
            return 0
        else
            announce "Error: Failed to install pm2"
            exit 1
        fi
    else
        announce "pm2 is already installed"
    fi
}

function install_network() {
    announce "Installing network testing dependencies..."
    check_pm2_installed
}

function clear_network() {
    announce "Clearing network configuration..."
    
    # Stop and delete all pm2 processes
    if command -v pm2 &> /dev/null; then
        announce "Stopping all pm2 processes..."
        execute "pm2 delete all &> /dev/null || true"
        announce "PM2 processes cleared"
    fi
    
    # Delete node folders
    local nodes_dir="${PROJECT_DIR}/nettest/nodes"
    if [ -d "$nodes_dir" ]; then
        announce "Removing all node folders..."
        execute "rm -rf ${nodes_dir:?}/*"
        execute "mkdir -p $nodes_dir"  # Recreate empty nodes directory
        announce "Node folders cleared"
    else
        announce "No nodes directory found at $nodes_dir"
    fi
    
    announce "Network cleared successfully"
}

function deploy_scenario() {
    local scenario=$1
    local branch=$2
    local scenario_dir="${PROJECT_DIR}/nettest/scenarios/${scenario}"
    local nodes_dir="${PROJECT_DIR}/nettest/nodes"

    announce "----------------------------------------"
    announce "Checking requirements..."
    check_folder_structure
    announce "----------------------------------------"

    announce "Deploying scenario: [$scenario] from branch: [$branch]"

    # Check if scenario exists
    if [ ! -d "$scenario_dir" ]; then
        announce "Error: Scenario directory not found: $scenario_dir"
        exit 1
    fi

    # Clear existing setup
    clear_network

    # Find all numbered node directories in scenario
    for node_dir in "$scenario_dir"/[0-9]*; do
        if [ -d "$node_dir" ]; then
            local node_num=$(basename "$node_dir")
            local target_dir="${nodes_dir}/${node_num}"
            announce "----------------------------------------"
            announce "Setting up node${node_num}..."
            # Clone repository
            announce "Cloning branch ${branch} for node${node_num}..."
            execute "git clone --depth 1 --branch $branch ${PROJECT_DIR} $target_dir" || {
                announce "Error: Git clone failed for node${node_num}"
                exit 1
            }

            # Copy data directory if it exists
            if [ -d "${node_dir}/data" ]; then
                announce "Copying data files for node${node_num}..."
                execute "mkdir -p ${target_dir}/data"
                execute "cp -r ${node_dir}/data/* ${target_dir}/data/" || true
            fi

            # Copy conf directory if it exists
            if [ -d "${node_dir}/config" ]; then
                announce "Copying configuration files for node${node_num}..."
                execute "mkdir -p ${target_dir}/config"
                execute "cp -r ${node_dir}/config/* ${target_dir}/config/" || true
            fi

            # Install dependencies and compile
            announce "Running [npm install] for node${node_num}..."
            (cd "$target_dir" && {
                execute "npm install" || {
                    announce "Error: npm install failed for node${node_num}"
                    exit 1
                }
                announce "---"
                
                announce "Compiling node${node_num}..."
                execute "npm run nuke dev" || {
                    announce "Error: compilation failed for node${node_num}"
                    exit 1
                }
                announce "---"

                announce "Creating PM2 configuration for node${node_num}..."
                pm2 start "npm start" --time --merge-logs -l ./saito.log --name "node${node_num}" && pm2 stop "node${node_num}" || {
                    announce "Error: PM2 configuration failed for node${node_num}"
                    exit 1
                }
                announce "PM2 configuration for node${node_num} created"
                announce "---"
            }) &
        fi
    done

    # Wait for all background processes to complete
    wait

    announce "----------------------------------------"
    start_network

    announce "Deployment complete!"
    display_issuance
    announce "----------------------------------------"
    show_endpoints
    announce "----------------------------------------"
}

function reset_scenario() {
    local scenario=$1
    local scenario_dir="${PROJECT_DIR}/nettest/scenarios/${scenario}"
    local nodes_dir="${PROJECT_DIR}/nettest/nodes"

    announce "Resetting scenario: $scenario"

    # Check if scenario exists
    if [ ! -d "$scenario_dir" ]; then
        announce "Error: Scenario directory not found: $scenario_dir"
        exit 1
    fi

    # Stop all nodes
    stop_network

    # Process each node
    for node_dir in "$scenario_dir"/[0-9]*; do
        if [ -d "$node_dir" ]; then
            local node_num=$(basename "$node_dir")
            local target_dir="${nodes_dir}/${node_num}"
            
            announce "Resetting node${node_num}..."
            
            # Clear existing conf and data directories
            if [ -d "${target_dir}/conf" ]; then
                announce "Clearing configuration for node${node_num}..."
                execute "rm -rf ${target_dir:?}/config/*"
            fi
            
            if [ -d "${target_dir}/data" ]; then
                announce "Clearing data for node${node_num}..."
                execute "rm -rf ${target_dir:?}/data/*"
            fi

            # Copy new data directory if it exists
            if [ -d "${node_dir}/data" ]; then
                announce "Copying new data files for node${node_num}..."
                execute "mkdir -p ${target_dir}/data"
                execute "cp -r ${node_dir}/data/* ${target_dir}/data/" || true
            fi

            # Copy new conf directory if it exists
            if [ -d "${node_dir}/conf" ]; then
                announce "Copying new configuration files for node${node_num}..."
                execute "mkdir -p ${target_dir}/config"
                execute "cp -r ${node_dir}/config/* ${target_dir}/config/" || true
            fi
        fi
    done

    announce "Reset complete!"
    display_issuance
    announce "Start the network by running [npm run nettest start]"
}

function display_issuance() {
    local node_dir="${PROJECT_DIR}/nettest/nodes/1"
    local issuance_file="${node_dir}/data/issuance/issuance.keys"

    if [ -f "$issuance_file" ]; then
        announce "----------------------------------------"
        announce "Keys with SAITO on the Network:"
        cat "$issuance_file" >> "$LOG_FILE"
        cat "$issuance_file"
        announce "\n----------------------------------------"
    else
        announce "No issuance file found at: $issuance_file"
    fi
}

function start_network() {
    announce "Starting network..."
    if ! command -v pm2 &> /dev/null; then
        announce "Error: pm2 not found"
        exit 1
    fi

    # Check for any stopped processes
    local stopped_processes=$(pm2 jlist | grep -c '"status":"stopped"' || announce "0")
    stopped_processes=$(announce "$stopped_processes" | tr -d '[:space:]')  # Remove any whitespace
    
    #announce "Stopped processes: $stopped_processes"
    if [ "$stopped_processes" = "00" ]; then
        announce "No stopped processes found. Nothing to start."
        exit 0
    fi

    announce "Starting node1..."
    pm2 start node1
    
    announce "Waiting 15 seconds for node1 to initialize..."
    sleep 15
    
    announce "Starting remaining nodes..."
    pm2 start all
    
    announce "Network started"
    announce "----------------------------------------"
    show_endpoints
}

function stop_network() {
    announce "Stopping network..."
    if command -v pm2 &> /dev/null; then
        pm2 stop all
        announce "All nodes stopped"
    else
        announce "Error: pm2 not found"
        exit 1
    fi
}

function show_status() {
    if command -v pm2 &> /dev/null; then
        pm2 status
    else
        announce "Error: pm2 not found"
        exit 1
    fi
}

function view_logs() {
    local node_num=$1
    local node_dir="${PROJECT_DIR}/nettest/nodes/${node_num}"
    local log_file="${node_dir}/saito.log"

    if [ -z "$node_num" ]; then
        announce "Error: Node number is required"
        announce "Usage: nettest logs <node_number>"
        exit 1
    fi

    if [ ! -d "$node_dir" ]; then
        announce "Error: Node directory not found: $node_dir"
        exit 1
    fi

    if [ ! -f "$log_file" ]; then
        announce "Error: Log file not found: $log_file"
        exit 1
    fi

    announce "Viewing logs for node${node_num}..."
    
    # For tail command, we want to show the output to user
    tail -f "$log_file"
}

function show_endpoints() {
    announce "Node Endpoints:"
    local nodes_dir="${PROJECT_DIR}/nettest/nodes"
    
    # Check if nodes directory exists
    if [ ! -d "$nodes_dir" ]; then
        announce "No nodes directory found at: $nodes_dir"
        return 1
    fi

    # Loop through numbered directories
    for node_dir in "$nodes_dir"/[0-9]*; do
        if [ -d "$node_dir" ]; then
            local node_num=$(basename "$node_dir")
            local options_file="${node_dir}/config/options"
            
            if [ -f "$options_file" ]; then
                # Extract endpoint details using grep and sed
                local protocol=$(grep -o '"endpoint":[^}]*"protocol":"[^"]*"' "$options_file" | sed 's/.*"protocol":"\([^"]*\)".*/\1/')
                local host=$(grep -o '"endpoint":[^}]*"host":"[^"]*"' "$options_file" | sed 's/.*"host":"\([^"]*\)".*/\1/')
                local port=$(grep -o '"endpoint":[^}]*"port":[0-9]*' "$options_file" | sed 's/.*"port":\([0-9]*\).*/\1/')
                
                if [ -n "$protocol" ] && [ -n "$host" ] && [ -n "$port" ]; then
                    announce "Node $node_num endpoint: $protocol://$host:$port/"
                else
                    announce "Node $node_num: Unable to parse endpoint configuration"
                fi
            else
                announce "Node $node_num: No options file found"
            fi
        fi
    done
}

function show_help() {
    announce "Saito Network Testing Tool"
    announce "========================="
    announce ""
    announce "Available commands:"
    announce ""
    announce "install"
    announce "  Checks and installs required dependencies (pm2)"
    announce ""
    announce "clear"
    announce "  Stops all pm2 processes and deletes all node folders"
    announce ""
    announce "deploy <scenario> <branch>"
    announce "  Sets up test nodes based on scenario configuration"
    announce "  - scenario: Name of the scenario folder in nettest/scenario/"
    announce "  - branch: Git branch to use for node deployment"
    announce ""
    announce "reset <scenario>"
    announce "  Resets configuration for all nodes in a scenario"
    announce "  - scenario: Name of the scenario to reset"
    announce ""
    announce "start"
    announce "  Starts the network in sequence (node1 first, then others)"
    announce ""
    announce "stop"
    announce "  Stops all running nodes"
    announce ""
    announce "status"
    announce "  Shows current pm2 process status"
    announce ""
    announce "logs <node_number>"
    announce "  Displays live logs for specified node"
    announce "  - node_number: Number of the node to view logs for"
    announce ""
    announce "endpoints"
    announce "  Lists all node endpoints in the network"
    announce ""
}

# Main command handler
case "$1" in
    "install")
        install_network
        ;;
    "clear")
        clear_network
        ;;
    "deploy")
        if [ -z "$2" ] || [ -z "$3" ]; then
            announce "Usage: nettest deploy <scenario> <branch>"
            exit 1
        fi
        deploy_scenario "$2" "$3"
        ;;
    "reset")
        if [ -z "$2" ]; then
            announce "Usage: nettest reset <scenario>"
            exit 1
        fi
        reset_scenario "$2"
        ;;
    "start")
        start_network
        ;;
    "stop")
        stop_network
        ;;
    "status")
        show_status
        ;;
    "logs")
        if [ -z "$2" ]; then
            announce "Usage: nettest logs <node_number>"
            exit 1
        fi
        view_logs "$2"
        ;;
    "endpoints")
        show_endpoints
        ;;
    "help")
        show_help
        ;;
    *)
        announce "Usage: nettest {install|clear|deploy|reset|start|stop|status|logs|endpoints|help}"
        announce "Run 'nettest help' for detailed information about commands"
        exit 1
        ;;
esac