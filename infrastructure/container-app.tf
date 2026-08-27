resource "azurerm_container_app" "frontend" {
  name                         = "${var.project_name}-${var.environment}"
  container_app_environment_id = data.azurerm_container_app_environment.shared.id
  resource_group_name          = module.resource_group.name
  revision_mode                = "Single"

  identity {
    type         = "UserAssigned"
    identity_ids = [azurerm_user_assigned_identity.app.id]
  }

  registry {
    server   = var.acr_login_server
    identity = azurerm_user_assigned_identity.app.id
  }

  secret {
    name                = "port"
    identity            = azurerm_user_assigned_identity.app.id
    key_vault_secret_id = "${azurerm_key_vault.this.vault_uri}secrets/port"
  }

  secret {
    name                = "api-base-url"
    identity            = azurerm_user_assigned_identity.app.id
    key_vault_secret_id = "${azurerm_key_vault.this.vault_uri}secrets/api-base-url"
  }

  secret {
    name                = "api-timeout-ms"
    identity            = azurerm_user_assigned_identity.app.id
    key_vault_secret_id = "${azurerm_key_vault.this.vault_uri}secrets/api-timeout-ms"
  }

  secret {
    name                = "node-env"
    identity            = azurerm_user_assigned_identity.app.id
    key_vault_secret_id = "${azurerm_key_vault.this.vault_uri}secrets/node-env"
  }

  secret {
    name                = "log-level"
    identity            = azurerm_user_assigned_identity.app.id
    key_vault_secret_id = "${azurerm_key_vault.this.vault_uri}secrets/log-level"
  }

  secret {
    name                = "static-max-age"
    identity            = azurerm_user_assigned_identity.app.id
    key_vault_secret_id = "${azurerm_key_vault.this.vault_uri}secrets/static-max-age"
  }

  template {
    min_replicas = 1
    max_replicas = 1

    container {
      name   = "frontend"
      image  = var.container_image
      cpu    = 0.25
      memory = "0.5Gi"

      env {
        name        = "PORT"
        secret_name = "port"
      }

      env {
        name        = "API_BASE_URL"
        secret_name = "api-base-url"
      }

      env {
        name        = "API_TIMEOUT_MS"
        secret_name = "api-timeout-ms"
      }

      env {
        name        = "NODE_ENV"
        secret_name = "node-env"
      }

      env {
        name        = "LOG_LEVEL"
        secret_name = "log-level"
      }

      env {
        name        = "STATIC_MAX_AGE"
        secret_name = "static-max-age"
      }
    }
  }

  # Only the frontend is public facing; the backend's ingress is internal-only.
  ingress {
    external_enabled = true
    target_port      = 3000

    traffic_weight {
      latest_revision = true
      percentage      = 100
    }
  }

  tags = merge(var.tags, {
    environment = var.environment
  })
}
