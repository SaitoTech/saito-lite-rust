


#!/bin/bash

set -e

# Check if a circuit name was provided
if [ "$#" -ne 1 ]; then
    echo "Usage: $0 <circuit_name>"
    exit 1
fi

CIRCUIT_NAME=$1
# (/mods/mod_name/  you should run `./../../scripts/your_script.sh circuit_name`)
WORKING_DIR=$(pwd)

# Input file is expected to be /mods/mod_name/input.json (where the script is called)
INPUT_FILE="${WORKING_DIR}/input.json"

# ZK folder structure
ZK_DIR="${WORKING_DIR}/zk"
BUILD_DIR="${ZK_DIR}/build"
OUTPUT_DIR="${ZK_DIR}/output"

PTAU_FILE="pot12_final.ptau"

# Ensure input.json exists in working directory
if [ ! -f "$INPUT_FILE" ]; then
    echo "Error: input.json not found in ${WORKING_DIR}"
    echo "Please ensure input.json exists in the directory where you run this script."
    exit 1
fi

# Create build and output directories if they don't exist
mkdir -p "$BUILD_DIR"
mkdir -p "$OUTPUT_DIR"

echo "### Step 1: Compiling the Circuit"
# Output .r1cs, .wasm, and .sym files into /zk/build
circom "zk/circuits/${CIRCUIT_NAME}.circom" --r1cs --wasm --sym -o "$BUILD_DIR"

echo "### Step 2: Generating the Witness"
node "$BUILD_DIR/${CIRCUIT_NAME}_js/generate_witness.js" \
     "$BUILD_DIR/${CIRCUIT_NAME}_js/${CIRCUIT_NAME}.wasm" \
     "$INPUT_FILE" \
     "$OUTPUT_DIR/witness.wtns"

echo "### Done!"
echo "Circuit compilation artifacts are in:  $BUILD_DIR"
echo "Generated witness file is in:          $OUTPUT_DIR"D_DIR/${CIRCUIT_NAME}_js/generate_witness.js $BUILD_DIR/${CIRCUIT_NAME}_js/${CIRCUIT_NAME}.wasm $INPUT_FILE $OUTPUT_DIR/witness.wtns

echo "### Step 3: Setting Up Powers of Tau (Phase 1)"
if [ ! -f $PTAU_FILE ]; then
    echo "Powers of Tau file not found. Generating..."
    snarkjs powersoftau new bn128 12 $BUILD_DIR/pot12_0000.ptau
    snarkjs powersoftau contribute $BUILD_DIR/pot12_0000.ptau $BUILD_DIR/pot12_0001.ptau --name="First contribution"
    snarkjs powersoftau prepare phase2 $BUILD_DIR/pot12_0001.ptau $PTAU_FILE
else
    echo "Using existing $PTAU_FILE"
fi

echo "### Step 4: Groth16 Setup"
snarkjs groth16 setup $BUILD_DIR/$CIRCUIT_NAME.r1cs $PTAU_FILE $BUILD_DIR/${CIRCUIT_NAME}_0000.zkey

echo "### Step 5: Contributing to the ZKey"
snarkjs zkey contribute $BUILD_DIR/${CIRCUIT_NAME}_0000.zkey $OUTPUT_DIR/${CIRCUIT_NAME}_final.zkey --name="1st Contributor"

echo "### Step 6: Exporting Verification Key"
snarkjs zkey export verificationkey $OUTPUT_DIR/${CIRCUIT_NAME}_final.zkey $OUTPUT_DIR/verification_key.json

echo "### Step 7: Generating Proof"
snarkjs groth16 prove $OUTPUT_DIR/${CIRCUIT_NAME}_final.zkey $OUTPUT_DIR/witness.wtns $BUILD_DIR/proof.json $BUILD_DIR/public.json

echo "### Step 8: Verifying Proof"
snarkjs groth16 verify $OUTPUT_DIR/verification_key.json $BUILD_DIR/public.json $BUILD_DIR/proof.json

echo "### All Steps Completed!"
echo "Output files are in the $BUILD_DIR directory."

