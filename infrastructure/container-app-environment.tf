# Shared Container Apps platform, created and owned by the backend's Terraform.
# The frontend reuses it rather than creating a duplicate environment.
data "azurerm_container_app_environment" "shared" {
  name                = var.container_app_environment_name
  resource_group_name = var.container_app_environment_resource_group_name
}
