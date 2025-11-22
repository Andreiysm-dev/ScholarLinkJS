# Supabase Migration Guide for ScholarLinked

## Prerequisites

1. **Create a Supabase Account**
   - Go to [supabase.com](https://supabase.com)
   - Sign up for a free account
   - Create a new project

2. **Install Dependencies**
   ```bash
   npm install
   ```

## Setup Steps

### 1. Configure Supabase Project

1. In your Supabase dashboard, go to **Settings** > **API**
2. Copy your **Project URL** and **anon public key**
3. Update `supabase-config.js`:
   ```javascript
   const SUPABASE_URL = 'your-project-url-here';
   const SUPABASE_ANON_KEY = 'your-anon-key-here';
   ```

### 2. Set Up Database Schema

1. In Supabase dashboard, go to **SQL Editor**
2. Copy and paste the contents of `database-schema.sql`
3. Click **Run** to create the tables and policies

### 3. Configure Storage

1. In Supabase dashboard, go to **Storage**
2. The `profile-photos` bucket should be created automatically
3. If not, create it manually and make it public

### 4. Update HTML Files

Add the Supabase CDN script to all your HTML files, before your existing scripts:

```html
<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
<script src="supabase-config.js"></script>
<script src="script.js"></script>
```

### 5. Migration Process

The migration will:
- Replace localStorage calls with Supabase database operations
- Move profile photos to Supabase Storage
- Maintain session data in sessionStorage (for better security)
- Keep the same user interface and functionality

### 6. Testing

1. Start your development server:
   ```bash
   npm start
   ```
2. Test user registration and login
3. Test tutor profile creation
4. Verify data persistence across browser sessions

## Key Changes

- **Data Storage**: localStorage → Supabase PostgreSQL database
- **File Storage**: Base64 in localStorage → Supabase Storage
- **Session Management**: localStorage → sessionStorage (more secure)
- **Real-time**: Data syncs across devices and browsers
- **Scalability**: No storage limits, better performance

## Security Features

- Row Level Security (RLS) policies protect user data
- Users can only modify their own profiles
- Public read access for tutor discovery
- Secure file upload with proper permissions

## Troubleshooting

- Check browser console for error messages
- Verify Supabase credentials are correct
- Ensure database schema was applied successfully
- Check network connectivity to Supabase

## Next Steps

After migration, you can add:
- Real-time messaging between students and tutors
- Advanced search and filtering
- Rating and review system
- Payment integration
- Email notifications
