---
title: "Infrastructure-as-Code ChatApp Deployment"
description: "Terraform for a single EC2 instance with an Elastic IP inside a custom VPC, subnet, route table and security group."
tech:
  [
    "Terraform",
    "AWS EC2",
    "AWS VPC",
    "Infrastructure as Code",
    "DevOps",
    "Cloud Architecture",
  ]
github: "https://github.com/1Mangesh1/chat-app-infrastructure"
demo: ""
featured: false
date: 2025-03-20T00:00:00Z
status: "archived"
---

**What it does.** It uses Terraform to run the [Real-time ChatApp](/portfolio/realtime-chatapp/) on one EC2 instance in AWS `ap-south-1`.

**What it provisions.** `main.tf` creates a VPC (`10.0.0.0/16`) with an internet gateway, one public subnet (`10.0.1.0/24`) and a route table. The route table sends outbound traffic through the gateway. The file also creates a security group, a `t2.micro` instance in that subnet, and an Elastic IP for the instance. The security group opens SSH (port 22) and the app port (3000). The instance's user data, `commands.sh`, installs Git and Node.js, clones the chat app and starts it with `npm run start`.

**Inputs and outputs.** `variables.tf` takes the region (default `ap-south-1`), the AWS credentials, a project name used in resource tags, and the EC2 key pair name. `outputs.tf` returns the instance's public IP, the Elastic IP, and the VPC and subnet IDs.
