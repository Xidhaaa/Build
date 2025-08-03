# Overview

This is a Node.js web application for managing digital port passes and vehicle stickers with comprehensive authentication and administrative features. The system allows authenticated internal staff to manually issue passes through a secure web interface. It features a React frontend with role-based access control, staff management capabilities, and an Express.js backend with session-based authentication, file uploads, pass generation, and data storage. The application generates printable pass cards with QR codes containing staff designation information and supports three types of passes: Daily Pass (MVR 6.11), Vehicle Sticker (MVR 11.21), and Crane Lorry Vehicle Sticker Pass (MVR 81.51).

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture

The client-side application is built with React and TypeScript, utilizing a component-based architecture with the following key decisions:

- **UI Framework**: Uses Radix UI primitives with shadcn/ui components for consistent, accessible design
- **Styling**: Tailwind CSS with CSS custom properties for theming and responsive design
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: React Query (@tanstack/react-query) for server state management with optimistic updates
- **Forms**: React Hook Form with Zod validation for type-safe form handling
- **Build Tool**: Vite for fast development and optimized production builds

The frontend follows a structured directory pattern with components organized in a `/ui` folder for reusable UI elements and `/pages` for route-specific components.

## Backend Architecture

The server is built with Express.js and follows a modular architecture:

- **Framework**: Express.js with TypeScript for type safety
- **Database Layer**: Drizzle ORM for type-safe database operations with PostgreSQL
- **Storage Pattern**: Interface-based storage abstraction allowing for easy testing and different implementations
- **Development Setup**: Hot reload with tsx and Vite integration for seamless full-stack development

The backend uses a clean separation of concerns with dedicated modules for routes, storage operations, and server configuration.

## Data Storage

- **Database**: PostgreSQL with Neon serverless driver for cloud deployment
- **ORM**: Drizzle ORM chosen for its TypeScript-first approach and excellent type inference
- **Schema Management**: Centralized schema definitions in `/shared` folder for type consistency across frontend and backend
- **Migrations**: Drizzle Kit for database migrations and schema management

## Authentication & Authorization

The application includes a basic user management system with:

- User schema with username and password fields
- UUID primary keys for security
- Prepared for session-based authentication (connect-pg-simple included)

## Development Tools

- **TypeScript**: Strict type checking across the entire codebase
- **Build System**: Vite for frontend builds, esbuild for backend compilation
- **Development**: Hot reload for both frontend and backend development
- **Code Quality**: Consistent import aliases and path resolution