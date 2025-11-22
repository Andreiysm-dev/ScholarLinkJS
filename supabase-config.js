// Supabase Configuration
// Replace these with your actual Supabase project credentials
const SUPABASE_URL = 'https://dfdlttucodurrwhnhadu.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRmZGx0dHVjb2R1cnJ3aG5oYWR1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM1NTc1NzcsImV4cCI6MjA3OTEzMzU3N30.TC5HMgyR1WnzgwaPxhne1y3NNnSPMNcoLny9Wnb1Tqc';

// Initialize Supabase client
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Database service functions
class DatabaseService {
    // User management
    async createUser(userData) {
        try {
            const { data, error } = await supabase
                .from('users')
                .insert([userData])
                .select();
            
            if (error) throw error;
            return { success: true, data: data[0] };
        } catch (error) {
            if (error?.message && error.message.includes('duplicate key value')) {
                const existing = await this.getUserByEmail(userData.email);
                if (existing.success && existing.data) {
                    return { success: true, data: existing.data };
                }
            }

            console.error('Error creating user:', error);
            return { success: false, error: error.message };
        }
    }

    async getUserByEmail(email) {
        try {
            const { data, error } = await supabase
                .from('users')
                .select('*')
                .eq('email', email.toLowerCase())
                .single();
            
            if (error && error.code !== 'PGRST116') throw error;
            return { success: true, data };
        } catch (error) {
            console.error('Error fetching user:', error);
            return { success: false, error: error.message };
        }
    }

    async updateUser(email, updates) {
        try {
            const { data, error } = await supabase
                .from('users')
                .update(updates)
                .eq('email', email)
                .select();
            
            if (error) throw error;
            return { success: true, data: data[0] };
        } catch (error) {
            console.error('Error updating user:', error);
            return { success: false, error: error.message };
        }
    }

    async deleteUser(email) {
        try {
            const { error } = await supabase
                .from('users')
                .delete()
                .eq('email', email);
            
            if (error) throw error;
            return { success: true };
        } catch (error) {
            console.error('Error deleting user:', error);
            return { success: false, error: error.message };
        }
    }

    // Tutor management
    async createTutor(tutorData) {
        try {
            const { data, error } = await supabase
                .from('tutors')
                .insert([tutorData])
                .select();
            
            if (error) throw error;
            return { success: true, data: data[0] };
        } catch (error) {
            console.error('Error creating tutor:', error);
            return { success: false, error: error.message };
        }
    }

    async getAllTutors() {
        try {
            const { data, error } = await supabase
                .from('tutors')
                .select('*')
                .order('created_at', { ascending: false });
            
            if (error) throw error;
            return { success: true, data };
        } catch (error) {
            console.error('Error fetching tutors:', error);
            return { success: false, error: error.message };
        }
    }

    async getTutorByEmail(email) {
        try {
            const { data, error } = await supabase
                .from('tutors')
                .select('*')
                .eq('email', email.toLowerCase())
                .single();
            
            if (error && error.code !== 'PGRST116') throw error;
            return { success: true, data };
        } catch (error) {
            console.error('Error fetching tutor:', error);
            return { success: false, error: error.message };
        }
    }

    async updateTutor(email, updates) {
        try {
            const { data, error } = await supabase
                .from('tutors')
                .update(updates)
                .eq('email', email)
                .select();
            
            if (error) throw error;
            return { success: true, data: data[0] };
        } catch (error) {
            console.error('Error updating tutor:', error);
            return { success: false, error: error.message };
        }
    }

    async deleteTutor(email) {
        try {
            const { error } = await supabase
                .from('tutors')
                .delete()
                .eq('email', email);
            
            if (error) throw error;
            return { success: true };
        } catch (error) {
            console.error('Error deleting tutor:', error);
            return { success: false, error: error.message };
        }
    }

    // Session booking
    async createSession(sessionData) {
        try {
            const { data, error } = await supabase
                .from('sessions')
                .insert([sessionData])
                .select();
            if (error) throw error;
            return { success: true, data: data[0] };
        } catch (error) {
            console.error('Error creating session:', error);
            return { success: false, error: error.message };
        }
    }

    async getSessionsByStudent(email) {
        try {
            const { data, error } = await supabase
                .from('sessions')
                .select('*')
                .eq('student_email', email)
                .order('scheduled_at', { ascending: true });
            if (error) throw error;
            return { success: true, data };
        } catch (error) {
            console.error('Error fetching student sessions:', error);
            return { success: false, error: error.message };
        }
    }

    async getSessionsByTutor(email) {
        try {
            const { data, error } = await supabase
                .from('sessions')
                .select('*')
                .eq('tutor_email', email)
                .order('scheduled_at', { ascending: true });
            if (error) throw error;
            return { success: true, data };
        } catch (error) {
            console.error('Error fetching tutor sessions:', error);
            return { success: false, error: error.message };
        }
    }

    async updateSessionStatus(sessionId, updates) {
        try {
            const { data, error } = await supabase
                .from('sessions')
                .update(updates)
                .eq('id', sessionId)
                .select();
            if (error) throw error;
            return { success: true, data: data[0] };
        } catch (error) {
            console.error('Error updating session:', error);
            return { success: false, error: error.message };
        }
    }

    // File upload for profile photos
    async uploadProfilePhoto(file, fileName) {
        try {
            const { data, error } = await supabase.storage
                .from('profile-photos')
                .upload(fileName, file);
            
            if (error) throw error;
            
            // Get public URL
            const { data: urlData } = supabase.storage
                .from('profile-photos')
                .getPublicUrl(fileName);
            
            return { success: true, url: urlData.publicUrl };
        } catch (error) {
            console.error('Error uploading photo:', error);
            return { success: false, error: error.message };
        }
    }
}

// Create global instance
const dbService = new DatabaseService();

// Session management
class SessionManager {
    static setCurrentUser(user) {
        sessionStorage.setItem('currentUser', JSON.stringify(user));
    }

    static getCurrentUser() {
        const user = sessionStorage.getItem('currentUser');
        return user ? JSON.parse(user) : null;
    }

    static clearCurrentUser() {
        sessionStorage.removeItem('currentUser');
    }

    static setAdminStatus(isAdmin) {
        sessionStorage.setItem('isAdmin', isAdmin.toString());
    }

    static getAdminStatus() {
        return sessionStorage.getItem('isAdmin') === 'true';
    }

    static clearAdminStatus() {
        sessionStorage.removeItem('isAdmin');
    }
}
