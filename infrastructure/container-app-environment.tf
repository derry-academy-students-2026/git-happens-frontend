resource "azurerm_log_analytics_workspace" "container_apps" {
  name                = "log-${var.project_name}-${var.environment}"
  location            = module.resource_group.location
  resource_group_name = module.resource_group.name
  sku                 = "PerGB2018"
  retention_in_days   = 30

  tags = merge(var.tags, {
    environment = var.environment
  })
}

resource "azurerm_container_app_environment" "this" {
  name                       = "cae-${var.project_name}-${var.environment}"
  location                   = module.resource_group.location
  resource_group_name        = module.resource_group.name
  log_analytics_workspace_id = azurerm_log_analytics_workspace.container_apps.id

  tags = merge(var.tags, {
    environment = var.environment
  })
}
