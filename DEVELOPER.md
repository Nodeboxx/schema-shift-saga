# Developer Documentation

## Table of Contents

1. [Project Overview](#project-overview)
2. [Technology Stack](#technology-stack)
3. [Architecture](#architecture)
4. [Features](#features)
5. [Database Schema](#database-schema)
6. [Setup & Installation](#setup--installation)
7. [Development Guide](#development-guide)
8. [API & Edge Functions](#api--edge-functions)
9. [Authentication](#authentication)
10. [Deployment](#deployment)
11. [Security](#security)
12. [Troubleshooting](#troubleshooting)

---

## Project Overview

This is a comprehensive prescription management system built for healthcare professionals. The application enables doctors to create, manage, and customize digital prescriptions with multi-template support, medicine databases, and patient management capabilities.

### Key Capabilities

- **Digital Prescription Creation**: Create and save prescriptions with customizable templates
- **Template Management**: Multiple specialty templates (General Medicine, Cardiology, Pediatrics, etc.)
- **Medicine Database**: Searchable database of medicines with dosage forms, generics, and manufacturers
- **Patient Management**: Store and retrieve patient information
- **Voice Input**: Speech-to-text for prescription data entry
- **Multi-page Support**: Handle complex prescriptions across multiple pages
- **Data Import**: Bulk import medicine data from CSV/Excel files
- **Print Ready**: Optimized for professional prescription printing

---

## Technology Stack

### Frontend
- **React 18.3.1**: UI framework
- **TypeScript**: Type-safe development
- **Vite**: Build tool and dev server
- **Tailwind CSS**: Utility-first styling
- **shadcn/ui**: Component library based on Radix UI
- **React Router v6**: Client-side routing
- **React Query (TanStack Query)**: Server state management
- **Sonner**: Toast notifications

### Backend (Lovable Cloud)
- **Supabase**: PostgreSQL database, authentication, storage
- **Edge Functions**: Serverless functions (Deno runtime)
- **Row Level Security (RLS)**: Database access control

### Additional Libraries
- **XLSX**: Excel file processing
- **Lucide React**: Icon system
- **React Hook Form + Zod**: Form validation
- **date-fns**: Date manipulation

---

## Architecture

### Project Structure

```
├── public/                    # Static assets
│   ├── *.csv                 # Sample medicine data files
│   └── *.xlsx                # Medicine database exports
├── src/
│   ├── components/           # React components
│   │   ├── ui/              # shadcn/ui components
│   │   └── prescription/    # Prescription-specific components
│   ├── hooks/               # Custom React hooks
│   ├── integrations/        # External service integrations
│   │   └── supabase/       # Supabase client & types
│   ├── lib/                # Utility functions
│   ├── pages/              # Route pages
│   ├── services/           # Business logic services
│   ├── types/              # TypeScript type definitions
│   └── utils/              # Helper utilities
├── supabase/
│   ├── functions/          # Edge functions
│   ├── migrations/         # Database migrations
│   └── config.toml         # Supabase configuration
└── scripts/                # Build & deployment scripts
```

### Component Architecture

**Prescription System Components:**

```
PrescriptionPage (Container)
├── PrescriptionHeader (Patient info, date)
├── PrescriptionControls (Save, print, template selector)
├── PrescriptionBody
│   ├── LeftColumn (CC, O/E, Dx, Advice, Follow-up)
│   └── RightColumn (Rx - Medicine list)
└── PrescriptionFooter (Custom footer content)
```

**Key Design Patterns:**
- **Container/Presentational Pattern**: Separation of logic and UI
- **Custom Hooks**: Reusable stateful logic (useVoiceInput)
- **Compound Components**: Complex UI components broken into sub-components
- **Controlled Components**: Form inputs managed by React state

---

## Features

### 1. Prescription Management

#### Create Prescription
- Patient information entry (name, age, sex, weight)
- Template selection (General Medicine, Cardiology, Pediatrics, etc.)
- Dynamic sections based on selected template
- Multi-page prescription support
- Auto-save functionality

#### Template System
- **Fixed Sections** (all templates):
  - Chief Complaints (CC)
  - On Examination (O/E) - with vitals (BP, Pulse, Temp, SpO2, Anemia, Jaundice)
  - Diagnosis (Dx)
  - Advice/Management
  - Follow Up
  
- **Specialty-Specific Sections**:
  - General Medicine: H/O, P/H, Drug H/O, etc.
  - Cardiology: CVS Examination, ECG, Echo findings
  - Pediatrics: Growth parameters, developmental milestones
  - And more...

#### Medicine Management
- Autocomplete medicine search
- Dosage form icons and details
- Generic name display
- Strength and manufacturer info
- Custom dose selector (frequency patterns)
- Duration selector (days/weeks/months)
- Additional instructions field
- Category support for grouping medicines

### 2. Medicine Database

#### Data Structure
- **Medicines**: Brand name, generic, strength, dosage form, manufacturer
- **Generics**: Generic drug names with drug class mapping
- **Dosage Forms**: Tablet, Capsule, Syrup, Injection, etc. (with icons)
- **Drug Classes**: Therapeutic classifications
- **Manufacturers**: Pharmaceutical companies

#### Search & Autocomplete
- Real-time search across medicine database
- Fuzzy matching for brand names
- Displays complete medicine information
- Includes dosage form icons

### 3. Patient Management
- Patient profile creation and storage
- Auto-fill patient data on prescription creation
- Patient history tracking
- Age calculation (years, months, days)
- Weight tracking (kg, grams)

### 4. Data Import System
- CSV/Excel file upload
- Bulk medicine data import
- Validation and error handling
- Progress tracking
- Support for multiple data types (medicines, generics, manufacturers, dosage forms, drug classes)

### 5. Voice Input
- Speech-to-text transcription
- Supports multiple text fields
- Uses Deepgram API via edge function
- Real-time audio recording and processing

### 6. User Settings
- Profile management (name, degree, specialization)
- Template customization
  - Enable/disable sections
  - Add custom fields
  - Reorder sections
- Footer customization (left/right content)
- Active template selection

### 7. Printing & Export
- Print-optimized layout
- Custom print styles
- Page break handling
- Professional prescription format
- Header/footer customization

---

## Database Schema

### Core Tables

#### `profiles`
User profile and settings
```sql
- id (uuid, PK, FK to auth.users)
- email (text)
- full_name (text)
- name_bn (text) -- Bengali name
- degree_en (text)
- degree_bn (text)
- active_template (text)
- custom_templates (jsonb) -- Custom template definitions
- left_template_sections (jsonb) -- Section configuration
- footer_left (text)
- footer_right (text)
- created_at (timestamp)
```

#### `patients`
Patient information
```sql
- id (uuid, PK)
- user_id (uuid, FK to profiles)
- name (text)
- age (text)
- sex (text)
- weight (text)
- created_at (timestamp)
```

#### `prescriptions`
Prescription master records
```sql
- id (uuid, PK)
- user_id (uuid, FK to profiles)
- patient_id (uuid, FK to patients)
- patient_name (text)
- patient_age (text)
- patient_age_years (integer)
- patient_age_months (integer)
- patient_age_days (integer)
- patient_sex (text)
- patient_weight (text)
- patient_weight_kg (numeric)
- patient_weight_grams (integer)
- prescription_date (date)
- active_template (text)
- template_data (jsonb) -- Template sections & fields
- cc_text (text) -- Chief Complaints
- dx_text (text) -- Diagnosis
- adv_text (text) -- Advice
- follow_up_text (text)
- instructions_text (text)
- oe_bp_s (text) -- Systolic BP
- oe_bp_d (text) -- Diastolic BP
- oe_pulse (text)
- oe_temp (text)
- oe_spo2 (text)
- oe_anemia (text)
- oe_jaundice (text)
- column_width_left (text)
- column_width_right (text)
- page_count (integer)
- created_at (timestamp)
- updated_at (timestamp)
```

#### `prescription_items`
Individual medicine/category entries
```sql
- id (uuid, PK)
- prescription_id (uuid, FK to prescriptions)
- item_type (text) -- 'medicine' or 'category'
- name (text) -- Medicine name
- dose (text)
- duration (text)
- details (text) -- Additional instructions
- category_content (text) -- For category items
- sort_order (integer)
- created_at (timestamp)
```

#### `prescription_pages`
Multi-page prescription support
```sql
- id (uuid, PK)
- prescription_id (uuid, FK to prescriptions)
- page_number (integer)
- content (jsonb) -- Page-specific content
- created_at (timestamp)
```

### Medicine Database Tables

#### `medicines`
```sql
- id (serial, PK)
- brand_name (text)
- generic_id (integer, FK to generics)
- generic_name (text)
- strength (text)
- dosage_form_id (integer, FK to dosage_forms)
- manufacturer_id (integer, FK to manufacturers)
- manufacturer_name (text)
- package_info (text)
- icon_url (text)
- slug (text, unique)
- created_at (timestamp)
```

#### `generics`
```sql
- id (serial, PK)
- name (text)
- drug_class_id (integer, FK to drug_classes)
- indication (text)
- slug (text, unique)
- created_at (timestamp)
```

#### `dosage_forms`
```sql
- id (serial, PK)
- name (text)
- icon_url (text)
- slug (text, unique)
- created_at (timestamp)
```

#### `manufacturers`
```sql
- id (serial, PK)
- name (text)
- slug (text, unique)
- created_at (timestamp)
```

#### `drug_classes`
```sql
- id (serial, PK)
- name (text)
- slug (text, unique)
- created_at (timestamp)
```

### Row Level Security (RLS) Policies

All tables have RLS enabled with policies ensuring:
- Users can only access their own data
- Patient records are user-scoped
- Prescriptions are user-scoped
- Medicine database tables are readable by all authenticated users
- Profile data is protected per user

---

## Setup & Installation

### Prerequisites
- Node.js 18+ 
- npm or bun package manager
- Lovable Cloud account (includes Supabase)

### Quick Start

1. **Clone the repository**
```bash
git clone <repository-url>
cd <project-directory>
```

2. **Install dependencies**
```bash
npm install
# or
bun install
```

3. **Environment Setup**
The `.env` file is automatically configured via Lovable Cloud and includes:
```env
VITE_SUPABASE_URL=<your-project-url>
VITE_SUPABASE_PUBLISHABLE_KEY=<your-anon-key>
VITE_SUPABASE_PROJECT_ID=<your-project-id>
```

4. **Run development server**
```bash
npm run dev
# or
bun dev
```

5. **Access the application**
Navigate to `http://localhost:5173`

### Initial Data Setup

#### Option 1: Use Data Import Page
1. Navigate to `/data-import`
2. Upload CSV/Excel files for:
   - Medicines
   - Generics
   - Dosage Forms
   - Manufacturers
   - Drug Classes

#### Option 2: Run Seed Script
```bash
npm run seed
```

---

## Development Guide

### Code Style & Conventions

- **TypeScript**: Strict mode enabled, use proper typing
- **Components**: Functional components with hooks
- **Styling**: Tailwind CSS with design tokens from `index.css`
- **File Naming**: PascalCase for components, camelCase for utilities
- **Imports**: Use absolute imports with `@/` prefix

### Design System

The app uses a semantic token system defined in `src/index.css` and `tailwind.config.ts`:

```css
/* Primary colors - adjust to your theme */
--primary: [hsl values];
--primary-foreground: [hsl values];

/* Background & surfaces */
--background: [hsl values];
--foreground: [hsl values];

/* UI elements */
--card: [hsl values];
--border: [hsl values];
--input: [hsl values];

/* Always use semantic tokens, not direct colors */
```

### Adding New Components

1. Create component file in appropriate directory
2. Use shadcn/ui components as base when possible
3. Apply design system tokens for styling
4. Add proper TypeScript interfaces
5. Export from index if creating a component library

### State Management

- **Local State**: `useState` for component-specific state
- **Server State**: TanStack Query for API data
- **Form State**: React Hook Form with Zod validation
- **Global State**: Context API when needed (minimal usage)

### Working with Supabase

```typescript
import { supabase } from "@/integrations/supabase/client";

// Query data
const { data, error } = await supabase
  .from('prescriptions')
  .select('*')
  .eq('user_id', userId);

// Insert data
const { data, error } = await supabase
  .from('prescriptions')
  .insert({ /* data */ });

// Update data
const { data, error } = await supabase
  .from('prescriptions')
  .update({ /* data */ })
  .eq('id', id);
```

### Creating Edge Functions

Edge functions are located in `supabase/functions/`:

```typescript
// supabase/functions/my-function/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

serve(async (req) => {
  try {
    const data = await req.json();
    
    // Your logic here
    
    return new Response(
      JSON.stringify({ success: true }),
      { headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500 }
    );
  }
});
```

Deployment is automatic when code is pushed.

---

## API & Edge Functions

### Available Edge Functions

#### 1. `transcribe-audio`
Speech-to-text transcription using Deepgram API

**Endpoint**: `/functions/v1/transcribe-audio`

**Request**:
```typescript
{
  audio: string; // Base64 encoded audio
}
```

**Response**:
```typescript
{
  text: string; // Transcribed text
}
```

**Setup**: Requires `DEEPGRAM_API_KEY` secret

#### 2. `import-medicine-data`
Bulk import medicine data from CSV/Excel

**Endpoint**: `/functions/v1/import-medicine-data`

**Request**:
```typescript
{
  fileUrl: string; // Storage URL of uploaded file
  dataType: 'medicine' | 'generic' | 'dosage_form' | 'manufacturer' | 'drug_class';
}
```

**Response**:
```typescript
{
  success: boolean;
  imported: number;
  errors?: string[];
}
```

#### 3. `download-icon`
Download and store dosage form icons

**Endpoint**: `/functions/v1/download-icon`

**Request**:
```typescript
{
  url: string; // Icon URL
  slug: string; // Dosage form slug
}
```

### Calling Edge Functions

```typescript
const { data, error } = await supabase.functions.invoke('function-name', {
  body: { /* request data */ }
});
```

---

## Authentication

### Setup

Authentication is configured with email/password by default:

```typescript
// Sign up
const { data, error } = await supabase.auth.signUp({
  email: 'user@example.com',
  password: 'password'
});

// Sign in
const { data, error } = await supabase.auth.signInWithPassword({
  email: 'user@example.com',
  password: 'password'
});

// Sign out
await supabase.auth.signOut();

// Get current session
const { data: { session } } = await supabase.auth.getSession();
```

### Protected Routes

```typescript
// Check authentication in route components
useEffect(() => {
  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate('/login');
    }
  };
  checkAuth();
}, []);
```

### Auto-confirm Email

For development, email confirmation is disabled. For production, configure in Lovable Cloud backend settings.

---

## Deployment

### Frontend Deployment

The app can be deployed to:
- **Lovable Cloud** (recommended - click Publish button)
- **Vercel**
- **Netlify**
- **Custom server**

#### Deploy to Lovable Cloud
1. Click the **Publish** button in the editor
2. Click **Update** to deploy frontend changes
3. Backend changes (migrations, edge functions) deploy automatically

#### Deploy to Vercel
```bash
npm install -g vercel
vercel
```

#### Deploy to Netlify
```bash
npm install -g netlify-cli
netlify deploy
```

### Environment Variables for Production

Ensure these are set in your deployment platform:
```env
VITE_SUPABASE_URL=<production-url>
VITE_SUPABASE_PUBLISHABLE_KEY=<production-anon-key>
VITE_SUPABASE_PROJECT_ID=<production-project-id>
```

### Database Migrations

Migrations are automatically applied via Lovable Cloud. For manual deployment:

```bash
# Link to project
supabase link --project-ref <project-ref>

# Push migrations
supabase db push
```

### Edge Functions Deployment

Edge functions deploy automatically through Lovable Cloud. No manual deployment needed.

---

## Security

### Row Level Security (RLS)

All tables have RLS policies enforcing user-based access:

```sql
-- Example: Users can only see their own prescriptions
CREATE POLICY "Users can view own prescriptions"
ON prescriptions FOR SELECT
USING (auth.uid() = user_id);

-- Medicine tables are readable by all authenticated users
CREATE POLICY "Authenticated users can read medicines"
ON medicines FOR SELECT
USING (auth.role() = 'authenticated');
```

### API Security

- All API calls require authentication
- Edge functions validate JWT tokens
- Database queries are scoped to authenticated user
- Input validation on all forms (Zod schemas)

### Secrets Management

Sensitive API keys stored as Lovable Cloud secrets:
- `DEEPGRAM_API_KEY` - for voice transcription

Never commit secrets to version control.

### Best Practices

1. **Always use parameterized queries** - prevent SQL injection
2. **Validate user input** - use Zod schemas
3. **Sanitize HTML content** - use `dangerouslySetInnerHTML` carefully
4. **Implement proper error handling** - don't expose internal errors
5. **Use HTTPS only** - enforce secure connections
6. **Regular dependency updates** - keep packages current

---

## Troubleshooting

### Common Issues

#### "Auth session missing" error
**Solution**: Check if user is logged in, redirect to login page

#### Medicine search not working
**Solution**: 
1. Ensure medicine data is imported
2. Check database connection
3. Verify RLS policies allow read access

#### Voice input not working
**Solution**: 
1. Check `DEEPGRAM_API_KEY` is set
2. Verify microphone permissions
3. Check browser compatibility (Chrome/Edge recommended)

#### Prescription not saving
**Solution**:
1. Check console for errors
2. Verify user authentication
3. Ensure all required fields are filled
4. Check network connectivity

#### Print layout issues
**Solution**:
1. Use Chrome/Edge for printing
2. Set margins to "Minimum"
3. Disable headers/footers
4. Check print CSS in `@media print` blocks

### Debug Mode

Enable debug logging:

```typescript
// Add to component
console.log('Debug:', { state, props, data });
```

Check browser console for errors and warnings.

### Performance Issues

1. **Slow medicine search**: 
   - Add database indexes on `brand_name`
   - Implement search debouncing (already implemented)
   
2. **Slow prescription load**:
   - Optimize database queries
   - Use select() to fetch only needed fields
   
3. **Large bundle size**:
   - Check for duplicate dependencies
   - Implement code splitting

### Getting Help

- Check browser console for errors
- Review network requests in DevTools
- Verify database schema matches types
- Check Lovable Cloud backend logs

---

## Contributing

### Development Workflow

1. Create feature branch from `main`
2. Make changes following code conventions
3. Test thoroughly (manual testing)
4. Create pull request
5. Code review
6. Merge to main

### Code Review Checklist

- [ ] TypeScript types are properly defined
- [ ] Components use design system tokens
- [ ] No direct color values (use CSS variables)
- [ ] Proper error handling implemented
- [ ] RLS policies updated if schema changed
- [ ] Edge functions tested
- [ ] Responsive design verified
- [ ] Print layout checked (if applicable)
- [ ] No console.log in production code
- [ ] Dependencies updated if needed

---

## Roadmap & Future Enhancements

### Planned Features
- [ ] PDF export functionality
- [ ] Email prescription to patients
- [ ] SMS notifications
- [ ] Prescription analytics dashboard
- [ ] Multi-language support
- [ ] Medicine interaction checker
- [ ] Prescription templates marketplace
- [ ] Mobile app (React Native)

### Known Limitations
- Voice input requires internet connection
- Print layout optimized for A4 paper
- Maximum 10 pages per prescription
- Medicine database requires manual updates

---

## License

[Add your license information here]

---

## Contact & Support

For questions or issues:
- Email: [your-email]
- Documentation: [docs-url]
- Issue Tracker: [github-issues-url]

---

**Last Updated**: 2025-11-20
**Version**: 1.0.0
**Maintained by**: [Your Name/Team]
