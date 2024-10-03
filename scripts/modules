#!/bin/bash

CONFIG_FILE="./config/modules.config.js"

add_module() {
  local module="$1"
  local module_js="$module/$module.js"

  # Add to "core" section
  if grep -q "core: \[" "$CONFIG_FILE"; then
    sed -i "/core: \[/a\    \"$module_js\"," "$CONFIG_FILE"
    echo "Module added to core: $module"
  else
    echo "No core section found."
  fi

  # Add to "lite" section
  if grep -q "lite: \[" "$CONFIG_FILE"; then
    sed -i "/lite: \[/a\    \"$module_js\"," "$CONFIG_FILE"
    echo "Module added to lite: $module"
  else
    echo "No lite section found."
  fi

  # Remove any trailing commas before the closing brackets for both core and lite sections
  sed -i '/core: \[/,/]/s/,\s*]/ ]/' "$CONFIG_FILE"
  sed -i '/lite: \[/,/]/s/,\s*]/ ]/' "$CONFIG_FILE"
}


remove_module() {
  local module="$1"
  local module_js="$module/$module.js"

  if grep -q "$module_js" "$CONFIG_FILE"; then
    sed -i "\|$module_js|d" "$CONFIG_FILE"
    echo "Module removed: $module"
  else
    echo "No match found for module: $module"
  fi
}


enable_module() {
  local module="$1"
  local module_js="$module/$module.js"

  if grep -q "// *\"$module_js\"" "$CONFIG_FILE"; then
    sed -i "s|// *\"$module_js\"|\"$module_js\"|g" "$CONFIG_FILE"
    echo "Module enabled: $module"
  elif grep -q "'$module_js'" "$CONFIG_FILE"; then
    echo "Module already enabled: $module"
  else
    echo "No match found for module: $module"
  fi
}

disable_module() {
  local module="$1"
  local module_js="$module/$module.js"

  if grep -q "\"$module_js\"" "$CONFIG_FILE"; then
    sed -i "s|\"$module_js\"|//\"$module_js\"|g" "$CONFIG_FILE"
    echo "Module disabled: $module"
  elif grep -q "// *\"$module_js\"" "$CONFIG_FILE"; then
    echo "Module already disabled: $module"
  else
    echo "No match found for module: $module"
  fi
}

case "$1" in
  add)
    add_module "$2"
    ;;
  remove)
    remove_module "$2"
    ;;
  enable)
    enable_module "$2"
    ;;
  disable)
    disable_module "$2"
    ;;
  *)
    echo "Usage: $0 {add|remove|enable|disable} <module_name>"
    ;;
esac

