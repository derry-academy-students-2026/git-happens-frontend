# AcrPull for the shared ACR (in rg-ai-academy-26) is granted manually via
# `az role assignment create` - student accounts don't have permission to
# create role assignments scoped to that shared resource group in Terraform.

resource "azurerm_role_assignment" "kv_secrets_user" {
  scope                = azurerm_key_vault.this.id
  role_definition_name = "Key Vault Secrets User"
  principal_id         = azurerm_user_assigned_identity.app.principal_id
}
