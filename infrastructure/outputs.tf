output "resource_group_name" {
  description = "Name of the created resource group."
  value       = module.resource_group.name
}

output "resource_group_id" {
  description = "ID of the created resource group."
  value       = module.resource_group.id
}

output "location" {
  description = "Location of the created resource group."
  value       = module.resource_group.location
}

output "key_vault_name" {
  description = "Name of the Key Vault. Add secrets manually via the Azure Portal."
  value       = azurerm_key_vault.this.name
}

output "key_vault_uri" {
  description = "URI of the Key Vault, used to reference secrets from apps."
  value       = azurerm_key_vault.this.vault_uri
}

output "managed_identity_id" {
  description = "Resource ID of the user-assigned managed identity."
  value       = azurerm_user_assigned_identity.app.id
}

output "managed_identity_client_id" {
  description = "Client ID of the user-assigned managed identity, used by the Container App."
  value       = azurerm_user_assigned_identity.app.client_id
}

output "managed_identity_principal_id" {
  description = "Principal ID of the user-assigned managed identity, used for role assignments."
  value       = azurerm_user_assigned_identity.app.principal_id
}

output "container_app_environment_id" {
  description = "Resource ID of the shared Container App Environment (owned by the backend's Terraform)."
  value       = data.azurerm_container_app_environment.shared.id
}

output "container_app_environment_default_domain" {
  description = "Default domain of the shared Container App Environment, used to build internal FQDNs between apps."
  value       = data.azurerm_container_app_environment.shared.default_domain
}
