# Supabase Storage Setup Guide

## To fix the logo upload issue, you need to create a storage bucket in your Supabase project:

### Step 1: Go to Supabase Dashboard
1. Visit https://supabase.com/dashboard
2. Select your project

### Step 2: Navigate to Storage
1. Click on "Storage" in the left sidebar
2. Click "Create a new bucket"

### Step 3: Create the Bucket
1. **Bucket name**: `images` (or `airline-logos` if you prefer)
2. **Public bucket**: ✅ Check this box (so images can be accessed publicly)
3. **File size limit**: Set to 5MB or higher
4. **Allowed MIME types**: Leave empty for all types, or add:
   - `image/*`
   - `image/png`
   - `image/jpeg`
   - `image/jpg`
   - `image/svg+xml`
   - `image/gif`

### Step 4: Set Bucket Policies
After creating the bucket, go to "Policies" and add these policies:

#### Policy 1: Allow authenticated users to upload
- **Policy name**: `Allow authenticated uploads`
- **Target roles**: `authenticated`
- **Policy definition**:
```sql
(auth.role() = 'authenticated')
```

#### Policy 2: Allow public access to read files
- **Policy name**: `Allow public read access`
- **Target roles**: `public`
- **Policy definition**:
```sql
(true)
```

### Step 5: Alternative - Use SQL Commands
If the policy editor doesn't work, run these SQL commands in your Supabase SQL Editor:

```sql
-- Create storage policies for the 'images' bucket
-- Allow authenticated users to upload files
CREATE POLICY "Allow authenticated uploads" ON storage.objects
FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'images');

-- Allow public access to read files
CREATE POLICY "Allow public read access" ON storage.objects
FOR SELECT TO public
USING (bucket_id = 'images');

-- Allow authenticated users to update their own files
CREATE POLICY "Allow authenticated updates" ON storage.objects
FOR UPDATE TO authenticated
USING (bucket_id = 'images')
WITH CHECK (bucket_id = 'images');

-- Allow authenticated users to delete their own files
CREATE POLICY "Allow authenticated deletes" ON storage.objects
FOR DELETE TO authenticated
USING (bucket_id = 'images');
```

### Step 6: Test the Upload
After setting up the bucket and policies, try uploading an airline logo again.

## Alternative: Use URL Input Instead

If you prefer not to set up storage, you can modify the airlines page to use URL input instead of file upload. Let me know if you'd like me to make that change.

# Add full_name column to users table in Supabase

To add a `full_name` column to your `users` table, run the following SQL command in the Supabase SQL editor:

```sql
ALTER TABLE users ADD COLUMN full_name text;
```

This will allow you to store and retrieve the full name of each user. 