variable "resource_group_name" {
  description = "Name of the Azure resource group."
  type        = string
  default     = null
}

variable "location" {
  description = "Azure region in which to deploy resources."
  type        = string
  default     = "UK South"
}

variable "environment" {
  description = "Deployment environment (dev, test, or prod)."
  type        = string
  default     = "dev"

  validation {
    condition     = contains(["dev", "test", "prod"], var.environment)
    error_message = "environment must be one of: dev, test, prod."
  }
}

variable "project_name" {
  description = "Short name of the project, used for tagging and naming resources."
  type        = string
  default     = "git-happens-frontend"
}

variable "tags" {
  description = "Common tags applied to all resources."
  type        = map(string)
  default = {
    project    = "git-happens-frontend"
    managed_by = "terraform"
  }
}
