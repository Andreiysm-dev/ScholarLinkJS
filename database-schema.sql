-- Supabase Database Schema for ScholarLinked

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    is_tutor BOOLEAN DEFAULT FALSE,
    profile_photo TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tutors table
CREATE TABLE IF NOT EXISTS tutors (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL REFERENCES users(email) ON DELETE CASCADE,
    bio TEXT,
    university VARCHAR(255),
    degree VARCHAR(255),
    year_level VARCHAR(50),
    subjects TEXT[], -- Array of subjects
    profile_photo TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_tutors_email ON tutors(email);
CREATE INDEX IF NOT EXISTS idx_tutors_subjects ON tutors USING GIN(subjects);

-- Sessions (booked tutoring) table
CREATE TABLE IF NOT EXISTS sessions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    student_email VARCHAR(255) NOT NULL REFERENCES users(email) ON DELETE CASCADE,
    tutor_email VARCHAR(255) NOT NULL REFERENCES tutors(email) ON DELETE CASCADE,
    subject VARCHAR(255) NOT NULL,
    scheduled_at TIMESTAMP WITH TIME ZONE NOT NULL,
    status VARCHAR(50) DEFAULT 'pending',
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_sessions_tutor_email ON sessions(tutor_email);
CREATE INDEX IF NOT EXISTS idx_sessions_student_email ON sessions(student_email);

-- Enable Row Level Security (RLS)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE tutors ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for users table
CREATE POLICY "Users can view all profiles" ON users
    FOR SELECT USING (true);

CREATE POLICY "Users can insert their own profile" ON users
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update their own profile" ON users
    FOR UPDATE USING (email = current_setting('request.jwt.claims', true)::json->>'email');

CREATE POLICY "Users can delete their own profile" ON users
    FOR DELETE USING (email = current_setting('request.jwt.claims', true)::json->>'email');

-- RLS Policies for tutors table
CREATE POLICY "Anyone can view tutor profiles" ON tutors
    FOR SELECT USING (true);

CREATE POLICY "Users can create tutor profiles" ON tutors
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Tutors can update their own profile" ON tutors
    FOR UPDATE USING (email = current_setting('request.jwt.claims', true)::json->>'email');

CREATE POLICY "Tutors can delete their own profile" ON tutors
    FOR DELETE USING (email = current_setting('request.jwt.claims', true)::json->>'email');

CREATE POLICY "Students can manage their sessions" ON sessions
    FOR INSERT WITH CHECK (student_email = current_setting('request.jwt.claims', true)::json->>'email');

CREATE POLICY "Students can view their sessions" ON sessions
    FOR SELECT USING (student_email = current_setting('request.jwt.claims', true)::json->>'email');

CREATE POLICY "Tutors can view assigned sessions" ON sessions
    FOR SELECT USING (tutor_email = current_setting('request.jwt.claims', true)::json->>'email');

CREATE POLICY "Tutors can update session status" ON sessions
    FOR UPDATE USING (tutor_email = current_setting('request.jwt.claims', true)::json->>'email');


-- Create storage bucket for profile photos
INSERT INTO storage.buckets (id, name, public) 
VALUES ('profile-photos', 'profile-photos', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for profile photos
CREATE POLICY "Anyone can view profile photos" ON storage.objects
    FOR SELECT USING (bucket_id = 'profile-photos');

CREATE POLICY "Authenticated users can upload profile photos" ON storage.objects
    FOR INSERT WITH CHECK (bucket_id = 'profile-photos');

CREATE POLICY "Users can update their own photos" ON storage.objects
    FOR UPDATE USING (bucket_id = 'profile-photos');

CREATE POLICY "Users can delete their own photos" ON storage.objects
    FOR DELETE USING (bucket_id = 'profile-photos');

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers to automatically update updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tutors_updated_at BEFORE UPDATE ON tutors
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
