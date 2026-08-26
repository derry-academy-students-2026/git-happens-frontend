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
