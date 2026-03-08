#!/usr/bin/env bash

# speckit-pipeline.sh <feature-name> <feature-description>
#
# Automated speckit pipeline script that runs the complete specification workflow
# in discrete, checkpointed steps to avoid rate limit interruptions.
#
# Usage: ./scripts/speckit-pipeline.sh <feature-name> "<feature-description>"
#
# Example: ./scripts/speckit-pipeline.sh 001-user-auth "User authentication with email and password"

set -e

FEATURE=$1
DESC=$2
SPEC_DIR="specs/$FEATURE"

# Validate arguments
if [[ -z "$FEATURE" || -z "$DESC" ]]; then
    echo "Usage: $0 <feature-name> \"<feature-description>\""
    echo "Example: $0 001-user-auth \"User authentication with email and password\""
    exit 1
fi

# Create spec directory
mkdir -p "$SPEC_DIR"

echo "========================================="
echo "Speckit Pipeline for: $FEATURE"
echo "Description: $DESC"
echo "========================================="
echo ""

# Step 1: Specify
echo "[Step 1/5] Running /speckit.specify..."
claude -p "Run /speckit.specify for: $DESC. Save all output to $SPEC_DIR/spec.md. Then STOP and confirm the file is saved before proceeding." --allowedTools "Read,Write,Edit,Bash,Glob"
echo "✓ Step 1 complete: spec.md created"
echo ""

# Step 2: Clarify
echo "[Step 2/5] Running /speckit.clarify..."
claude -p "Run /speckit.clarify on $SPEC_DIR/spec.md. Update the spec with any resolutions. Save the updated spec.md." --allowedTools "Read,Write,Edit,Bash"
echo "✓ Step 2 complete: spec.md clarified"
echo ""

# Step 3: Plan
echo "[Step 3/5] Running /speckit.plan..."
claude -p "Run /speckit.plan on $SPEC_DIR/spec.md. Save the implementation plan to $SPEC_DIR/plan.md." --allowedTools "Read,Write,Edit,Bash"
echo "✓ Step 3 complete: plan.md created"
echo ""

# Step 4: Tasks
echo "[Step 4/5] Running /speckit.tasks..."
claude -p "Run /speckit.tasks on $SPEC_DIR/plan.md. Save the task breakdown to $SPEC_DIR/tasks.md." --allowedTools "Read,Write,Edit,Bash"
echo "✓ Step 4 complete: tasks.md created"
echo ""

# Step 5: Analyze (optional)
echo "[Step 5/5] Running /speckit.analyze..."
claude -p "Run /speckit.analyze on the specification artifacts in $SPEC_DIR/. Apply any necessary remediations and save the results." --allowedTools "Read,Write,Edit,Bash"
echo "✓ Step 5 complete: analysis complete"
echo ""

echo "========================================="
echo "Pipeline complete for $FEATURE"
echo "All artifacts saved to: $SPEC_DIR"
echo "========================================="
echo ""
echo "Generated files:"
ls -la "$SPEC_DIR"
