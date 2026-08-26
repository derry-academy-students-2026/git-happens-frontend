terraform {
  required_version = ">= 1.0"
  required_providers {
    azurerm = {
      source  = "hashicorp/azurerm"
      version = "~> 3.0"
    }
    random = {
      source  = "hashicorp/random"
      version = "~> 3.0"
    }
  }
}

provider "azurerm" {
  features {}

  # When using 'az login', credentials are automatically picked up.
  # Uncomment below if using service principal authentication instead.
  # client_id       = var.azure_client_id
  # client_secret   = var.azure_client_secret
  # subscription_id = var.azure_subscription_id
  # tenant_id       = var.azure_tenant_id
}
