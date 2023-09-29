#!/bin/env bash
output=/opt/saito/logs/money.log

/opt/saito/saito-rust --mode utxo-issuance

awk '{sum += $1} END {print sum>>"/opt/saito/logs/money.log"}' /opt/saito/data/issuance.file
