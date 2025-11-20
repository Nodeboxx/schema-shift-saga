# Changelog

All notable changes to MedEx Prescription SaaS will be documented in this file.

## [3.0.0] - 2025-11-20

### Added - Enterprise SaaS Platform

#### Role-Based Authentication System
- **Automatic role-based routing** - Super admins go to /admin, clinic admins to /clinic, doctors to /dashboard
- `RoleRedirect` component for intelligent navigation based on user role
- Separate dashboards for each user type with appropriate features
- `AuthProvider` with comprehensive role management and loading states

#### Admin Dashboard (Complete Redesign)
- **Left sidebar navigation** with 11 management modules
- **Overview Dashboard** with 5 key metrics:
  - Total users
  - Total clinics
  - Total prescriptions
  - Total appointments
  - Active users
- **User Management** - View, search, and manage all system users
- **Clinics Management** - Manage all registered clinics
- **Appointments Management** (NEW)
  - View all system appointments
  - Search by patient, doctor, or clinic
  - Real-time status tracking
  - Duration and time management
  - Color-coded status badges
- **CMS Editor** - Edit public website content
- **SMTP Settings** - Configure email servers
- **Email Templates** - Manage email communications
- **Notifications** - Configure notification channels
- **Analytics** - System-wide analytics and insights
- **Impersonation** - Admin can impersonate users
- **Audit Logs** - Track all system changes

#### Checkout System
- Three-tier pricing structure (Free, Pro, Enterprise)
- Complete checkout flow with plan summary
- Payment form UI (Stripe-ready integration)
- Subscription creation in database
- Terms and conditions acceptance
- Automatic profile tier update on subscription

#### Public Pages
- Professional landing page with hero, features, and pricing sections
- Public prescription verification page at /verify/:id
- CMS-editable content for all public sections

#### Multi-Tenancy Foundation
- Clinic-based data isolation
- Doctor-level data separation
- Row Level Security policies for secure data access
- Separate workspaces for each organization

### Changed
- **Dashboard routing now respects user roles** - No more mixing of admin/user interfaces
- Admin users automatically redirected to admin panel
- Clinic admins redirected to clinic management
- Navigation structure completely separated by role
- Authentication flow improved with early role detection
- Layout system redesigned for role-specific UI

### Security
- Fixed infinite recursion in RLS policies
- Added SECURITY DEFINER functions for clinic access (`is_clinic_member`, `is_clinic_owner`)
- Improved role checking mechanisms across all routes
- Prevented privilege escalation attacks with proper role validation
- Enhanced audit logging for admin actions

### Fixed
- Admin dashboard navigation showing incorrect items
- Role detection timing causing permission errors
- Settings page access denied for authenticated users
- Checkout page crashing with undefined plan
- RLS policy recursion causing database timeouts
- Super admin being redirected to regular dashboard

## [2.1.0] - 2025-11-20

### Added - Enterprise Admin System

#### Role System Enhancements
- Implemented server-side role resolution via RPC `get_user_roles()`
- Added role priority system (super_admin > clinic_admin > doctor > staff)
- Created `AuthContext` for global role state management
- Added `AdminGuard` component for route protection
- Implemented role-based navigation visibility

#### Admin Panel Features
- **Overview Tab**: System analytics with user/clinic/prescription metrics
- **Users Tab**: User management with suspend/activate controls
- **Clinics Tab**: Clinic listing with subscription management
- **CMS Tab**: Content management for hero, pricing, features sections
- **SMTP Tab**: Email server configuration with test functionality
- **Templates Tab**: Email template CRUD with preview
- **Notifications Tab**: Channel configuration (email/SMS/push)
- **Analytics Tab**: Detailed system metrics and charts
- **Impersonate Tab**: Secure user impersonation with audit logging
- **Audit Tab**: Comprehensive audit logs for role changes

#### Database Schema
- Added `user_roles` table with unique constraint on (user_id, role)
- Added `role_audit` table for tracking role changes
- Added `smtp_settings` table for email configuration
- Added `email_templates` table for template management
- Added `notifications_config` table for notification settings
- Added `impersonation_sessions` table for impersonation tracking
- Added `system_metrics` table for analytics data

#### Security Enhancements
- Implemented RLS policies for all admin tables
- Created `has_role()` SECURITY DEFINER function to prevent recursive RLS
- Added trigger to prevent super_admin role removal from admin@example.com
- Added auto-assignment trigger for admin users
- Implemented encrypted password storage for SMTP settings

#### Edge Functions
- Created `test-smtp` function for validating email server settings
- Added CORS support for all edge functions
- Implemented proper error handling and logging

#### Scripts & Automation
- Added `scripts/init-admin.sh` for idempotent admin initialization
- Added `scripts/assignRoles.ts` for programmatic role assignment
- Created migration files with timestamps for version control

#### Documentation
- Created comprehensive `README.DEV.md` with architecture details
- Added `DEPLOYMENT.md` with deployment instructions for Docker/VM/Cloud
- Added `CHANGELOG.md` for tracking changes
- Updated `docker-compose.yml` with health checks

### Changed

#### Navigation & Routing
- Modified `AppLayout` to show all features to super_admin
- Fixed role-based navigation to prioritize admin features
- Updated `Dashboard` to not auto-redirect super_admins
- Enhanced navigation icons and labels

#### UI/UX Improvements
- Applied enterprise color scheme with gradients
- Added colorful stat cards with icons
- Implemented responsive tab navigation in admin panel
- Enhanced table layouts with proper spacing and badges

### Fixed

#### Role Detection Issues
- Fixed super_admin landing on doctor dashboard
- Corrected role priority logic in navigation
- Resolved race condition in role loading
- Fixed missing features for super_admin users

#### Layout Problems
- Fixed sidebar not showing all navigation items
- Corrected routing for admin panel tabs
- Resolved loading spinner blocking navigation

## [1.0.0] - 2024-12-01

### Initial Release

#### Core Features
- Prescription writer with template system
- Patient management
- Appointment scheduling
- Clinic management
- User authentication with Supabase
- Basic role-based access control
- Medicine database with search
- PDF prescription generation
- QR code verification

#### Database Tables
- profiles
- patients
- prescriptions
- prescription_items
- appointments
- clinics
- clinic_members
- medicines
- generics
- dosage_forms
- manufacturers
- drug_classes

#### Authentication
- Email/password signup and login
- Session management
- Profile creation on signup
- Basic role assignment

---

## Version Numbering

We follow [Semantic Versioning](https://semver.org/):
- MAJOR version for incompatible API changes
- MINOR version for added functionality in a backwards compatible manner
- PATCH version for backwards compatible bug fixes

## Migration Notes

### Upgrading from 1.x to 2.0

1. **Run Database Migrations**:
   ```bash
   # Apply the role system migration
   psql $DATABASE_URL < supabase/migrations/20251120173653_7b01b76c-89c7-4235-baa6-da68e5a7113b.sql
   ```

2. **Initialize Admin Users**:
   ```bash
   export DATABASE_URL="postgresql://..."
   bash scripts/init-admin.sh
   ```

3. **Update Environment Variables**:
   - No new environment variables required
   - Existing Supabase credentials continue to work

4. **Clear User Sessions**:
   - Users should log out and log back in
   - This ensures new role system is activated

5. **Verify Admin Access**:
   ```sql
   SELECT p.email, ur.role 
   FROM user_roles ur 
   JOIN profiles p ON p.id = ur.user_id 
   ORDER BY p.email;
   ```

## Breaking Changes

### Version 2.0.0
- **Role Storage**: Roles now stored in `user_roles` table instead of `profiles.role`
- **Admin Access**: Super admins must use `/admin` route for admin panel
- **Navigation**: Navigation items now role-based with new logic
- **RPC Dependency**: Frontend now depends on `get_user_roles()` RPC

## Deprecations

### Version 2.0.0
- `profiles.role` column (use `user_roles` table instead)
- Client-side role checking (use `AuthContext` with server RPC)

## Known Issues

### Version 2.0.0
- None reported

---

For detailed deployment instructions, see [DEPLOYMENT.md](./DEPLOYMENT.md)
For developer documentation, see [README.DEV.md](./README.DEV.md)
