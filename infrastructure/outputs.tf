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
