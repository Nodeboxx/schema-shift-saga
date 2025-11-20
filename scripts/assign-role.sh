#!/bin/bash

# Script to assign roles to existing users
# Usage: ./scripts/assign-role.sh <email> <role>
# Roles: super_admin, clinic_admin, doctor, staff, patient

set -e

EMAIL=$1
ROLE=$2

if [ -z "$EMAIL" ] || [ -z "$ROLE" ]; then
    echo "Usage: ./scripts/assign-role.sh <email> <role>"
    echo "Roles: super_admin, clinic_admin, doctor, staff, patient"
    exit 1
fi

# Validate role
if [[ ! "$ROLE" =~ ^(super_admin|clinic_admin|doctor|staff|patient)$ ]]; then
    echo "Invalid role. Must be one of: super_admin, clinic_admin, doctor, staff, patient"
    exit 1
fi

echo "Assigning role '$ROLE' to user: $EMAIL"

# Use the database function to assign role
psql $DATABASE_URL -c "SELECT public.assign_user_role('$EMAIL', '$ROLE'::app_role);"

echo "Role assigned successfully!"
