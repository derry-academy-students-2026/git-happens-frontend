# AcrPull for the shared ACR (in rg-ai-academy-26) and Key Vault Secrets User
# on our own vault are both granted manually via `az role assignment create` -
# neither the developer's account nor the CI service principal has permission
# to create role assignments (Microsoft.Authorization/roleAssignments/write),
# even scoped to resources we own outright.
