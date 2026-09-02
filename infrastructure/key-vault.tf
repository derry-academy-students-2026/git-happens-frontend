data "azurerm_client_config" "current" {}

resource "random_id" "kv_suffix" {
  byte_length = 4
}

# Key Vault names must be globally unique and <=24 characters total.
resource "azurerm_key_vault" "this" {
  name                       = "${var.key_vault_name_prefix}-${var.environment}-${random_id.kv_suffix.hex}"
  location                   = module.resource_group.location
  resource_group_name        = module.resource_group.name
  tenant_id                  = data.azurerm_client_config.current.tenant_id
  sku_name                   = "standard"
  enable_rbac_authorization  = true
  purge_protection_enabled   = true
  soft_delete_retention_days = 7

  tags = merge(var.tags, {
    environment = var.environment
  })
}
