// ScholarLinked - Updated with Supabase Integration
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded, initializing ScholarLinked with Supabase...');
    
    // Check if we're on different pages
    const normalizedPath = window.location.pathname.replace(/\\/g, '/');
    const isLandingPage = document.body.classList.contains('landing-page') || normalizedPath.endsWith('landingPage.html') || normalizedPath === '/' || normalizedPath.endsWith('index.html');
    const isHomePage = document.body.classList.contains('home-page') || normalizedPath.endsWith('homePage.html');
    const isProfilePage = normalizedPath.endsWith('profile.html');
    const isTutorDetailsPage = normalizedPath.endsWith('tutorDetails.html');
    const isTutorApprovalPage = normalizedPath.endsWith('tutorApproval.html');

    const getQueryParam = (key) => new URLSearchParams(window.location.search).get(key);
    const openTutorDetails = (email) => {
        if (!email) return;
        const destination = `tutorDetails.html?email=${encodeURIComponent(email)}`;
        window.location.href = destination;
    };
    window.openTutorDetails = openTutorDetails;

    const bookingState = {
        tutorEmail: null,
        subjects: []
    };

    function normalizeSubjects(rawSubjects) {
        if (Array.isArray(rawSubjects)) {
            return rawSubjects.filter(Boolean);
        }
        if (typeof rawSubjects === 'string') {
            return rawSubjects
                .replace(/^{|}$/g, '')
                .split(',')
                .map(subject => subject.trim())
                .filter(Boolean);
        }
        return [];
    }

    function closeBookingModal() {
        const modal = document.getElementById('bookingModal');
        if (modal) {
            modal.style.display = 'none';
        }
    }

    async function handleBookingFormSubmit(event) {
        event.preventDefault();
        const subjectSelect = document.getElementById('bookingSubject');
        const timeInput = document.getElementById('bookingTime');
        const messageInput = document.getElementById('bookingMessage');

        if (!subjectSelect || !timeInput || !bookingState.tutorEmail) {
            return;
        }

        const subject = subjectSelect.value;
        const scheduledAtValue = timeInput.value;

        if (!subject) {
            alert('Please select a subject to proceed.');
            return;
        }

        if (!scheduledAtValue) {
            alert('Please pick a preferred date and time.');
            return;
        }

        const scheduledAt = new Date(scheduledAtValue);
        if (Number.isNaN(scheduledAt.getTime())) {
            alert('Invalid date/time format.');
            return;
        }

        const notes = messageInput?.value.trim() || null;
        const result = await bookSession(bookingState.tutorEmail, {
            subject,
            scheduled_at: scheduledAt.toISOString(),
            notes
        });

        if (result && result.success) {
            closeBookingModal();
        }
    }

    function ensureBookingModal() {
        if (document.getElementById('bookingModal')) {
            return;
        }

        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.id = 'bookingModal';
        modal.innerHTML = `
            <div class="modal-content booking-modal-content">
                <span class="close-button booking-close">&times;</span>
                <h2>Request a Session</h2>
                <form id="bookingForm" class="booking-form">
                    <label>
                        Subject
                        <select id="bookingSubject" required></select>
                    </label>
                    <label>
                        Preferred Date & Time
                        <input type="datetime-local" id="bookingTime" required>
                    </label>
                    <label>
                        Message (optional)
                        <textarea id="bookingMessage" rows="4" placeholder="Add context or goals"></textarea>
                    </label>
                    <button type="submit" class="submit-button">Send Request</button>
                </form>
            </div>
        `;

        document.body.appendChild(modal);
        const closeBtn = modal.querySelector('.booking-close');
        closeBtn?.addEventListener('click', closeBookingModal);
        modal.addEventListener('click', (event) => {
            if (event.target === modal) {
                closeBookingModal();
            }
        });
        const form = modal.querySelector('#bookingForm');
        form?.addEventListener('submit', handleBookingFormSubmit);
    }

    function openBookingModal(tutorEmail, subjects = []) {
        if (!tutorEmail) return;
        ensureBookingModal();
        const modal = document.getElementById('bookingModal');
        if (!modal) return;

        bookingState.tutorEmail = tutorEmail;
        bookingState.subjects = normalizeSubjects(subjects);

        const subjectSelect = document.getElementById('bookingSubject');
        if (subjectSelect) {
            subjectSelect.innerHTML = '';
            const options = bookingState.subjects.length ? bookingState.subjects : ['General Tutoring'];
            options.forEach((subject, index) => {
                const option = document.createElement('option');
                option.value = subject;
                option.textContent = subject;
                if (index === 0) option.selected = true;
                subjectSelect.appendChild(option);
            });
        }

        const timeInput = document.getElementById('bookingTime');
        if (timeInput) {
            timeInput.value = '';
        }

        const messageInput = document.getElementById('bookingMessage');
        if (messageInput) {
            messageInput.value = '';
        }

        modal.style.display = 'block';
    }

    window.openBookingModal = openBookingModal;
    
    // Initialize page-specific functionality
    if (isLandingPage) {
        initializeLandingPage();
    }
    
    if (isHomePage) {
        initializeHomePage();
    }
    
    if (isProfilePage) {
        initializeProfilePage();
    }

    if (isTutorDetailsPage) {
        initializeTutorDetailsPage();
    }

    if (isTutorApprovalPage) {
        initializeTutorApprovalPage();
    }
    
    // Initialize common functionality
    initializeCommonFeatures();
    
    // Landing Page Functions
    function initializeLandingPage() {
        console.log('Initializing landing page...');
        
        const loginForm = document.getElementById('loginForm');
        const signupForm = document.getElementById('signupForm');
        const tutorSignupForm = document.getElementById('tutorSignupForm');
        const loginBtn = document.getElementById('loginBtn');
        const signupBtn = document.getElementById('signupBtn');
        const switchToSignup = document.getElementById('switchToSignup');
        const switchToLogin = document.getElementById('switchToLogin');
        const loginModal = document.getElementById('loginModal');
        const signupModal = document.getElementById('signupModal');
        const closeButtons = document.querySelectorAll('.close-button');

        // Login Form Handler
        if (loginForm) {
            loginForm.addEventListener('submit', async function(e) {
                e.preventDefault();
                const email = document.getElementById('loginEmail').value.trim().toLowerCase();
                const password = document.getElementById('loginPassword').value;
                
                try {
                    // Get user from database
                    const profileResult = await dbService.getUserByEmail(email);
                    
                    if (!profileResult.success || !profileResult.data) {
                        alert('Invalid credentials. Please check your email and password.');
                        return;
                    }

                    const user = profileResult.data;
                    
                    // Verify password (stored in plain text in database)
                    if (user.password !== password) {
                        alert('Invalid credentials. Please check your email and password.');
                        return;
                    }

                    // Login successful - set session
                    SessionManager.setCurrentUser(user);
                    alert('Login successful!');
                    window.location.href = 'homePage.html';
                } catch (error) {
                    console.error('Login error:', error);
                    alert('Login failed. Please try again.');
                }
            });
        }

        const attachModalListeners = () => {
            if (loginBtn && loginModal) {
                loginBtn.addEventListener('click', () => loginModal.style.display = 'block');
            }

            if (signupBtn && signupModal) {
                signupBtn.addEventListener('click', () => signupModal.style.display = 'block');
            }

            if (switchToSignup && loginModal && signupModal) {
                switchToSignup.addEventListener('click', (e) => {
                    e.preventDefault();
                    loginModal.style.display = 'none';
                    signupModal.style.display = 'block';
                });
            }

            if (switchToLogin && signupModal && loginModal) {
                switchToLogin.addEventListener('click', (e) => {
                    e.preventDefault();
                    signupModal.style.display = 'none';
                    loginModal.style.display = 'block';
                });
            }

            closeButtons.forEach(btn => {
                btn.addEventListener('click', () => {
                    if (loginModal) loginModal.style.display = 'none';
                    if (signupModal) signupModal.style.display = 'none';
                });
            });

            window.addEventListener('click', (event) => {
                if (event.target === loginModal) loginModal.style.display = 'none';
                if (event.target === signupModal) signupModal.style.display = 'none';
            });
        };

        const attachNavGuard = () => {
            const navLinks = document.querySelectorAll('.nav-link');
            navLinks.forEach(link => {
                link.addEventListener('click', (e) => {
                    e.preventDefault();
                    const currentUser = SessionManager.getCurrentUser();
                    if (!currentUser) {
                        alert('Please sign up first to access this feature.');
                    } else {
                        window.location.href = link.getAttribute('data-target');
                    }
                });
            });
        };

        attachModalListeners();
        attachNavGuard();

        // Student Signup Form Handler
        if (signupForm) {
            signupForm.addEventListener('submit', async function(e) {
                e.preventDefault();
                console.log('Student signup form submitted');

                const fullName = document.getElementById('fullName').value.trim();
                const email = document.getElementById('email').value.trim().toLowerCase();
                const password = document.getElementById('password').value;
                const confirmPassword = document.getElementById('confirmPassword').value;
                
                if (password !== confirmPassword) {
                    alert('Passwords do not match!');
                    return;
                }
                
                try {
                    // Check if user already exists
                    const existingUser = await dbService.getUserByEmail(email);
                    if (existingUser.success && existingUser.data) {
                        alert('Email already registered!');
                        return;
                    }

                    const newUser = { 
                        full_name: fullName, 
                        email, 
                        password,
                        is_tutor: false
                    };
                    
                    const result = await dbService.createUser(newUser);
                    if (result.success) {
                        SessionManager.setCurrentUser(result.data);
                        alert('Registration successful!');
                        window.location.href = 'homePage.html';
                    } else {
                        alert('Registration failed: ' + result.error);
                    }
                } catch (error) {
                    console.error('Signup error:', error);
                    alert('Registration failed. Please try again.');
                }
            });
        }

        // Tutor Signup Form Handler
        if (tutorSignupForm) {
            tutorSignupForm.addEventListener('submit', async function(e) {
                e.preventDefault();
                console.log('Tutor signup form submitted');

                const fullName = document.getElementById('fullName').value.trim();
                const email = document.getElementById('email').value.trim().toLowerCase();
                const password = document.getElementById('password').value;
                const confirmPassword = document.getElementById('confirmPassword').value;
                const university = document.getElementById('university').value.trim();
                const degree = document.getElementById('degree').value.trim();
                const yearLevel = document.getElementById('yearLevel').value;
                const subjects = Array.from(document.getElementById('subjects').selectedOptions).map(option => option.value);
                const bio = document.getElementById('bio').value.trim();
                
                if (password !== confirmPassword) {
                    alert('Passwords do not match!');
                    return;
                }
                
                try {
                    // Check if user already exists
                    const existingUser = await dbService.getUserByEmail(email);
                    if (existingUser.success && existingUser.data) {
                        alert('Email already registered!');
                        return;
                    }
                    
                    // Create user first
                    const newUser = { 
                        full_name: fullName, 
                        email, 
                        password, 
                        is_tutor: true 
                    };
                    
                    const userResult = await dbService.createUser(newUser);
                    if (!userResult.success) {
                        alert('Registration failed: ' + userResult.error);
                        return;
                    }
                    
                    // Handle profile photo upload
                    let profilePhotoUrl = 'https://via.placeholder.com/150';
                    const profilePhotoPreview = document.getElementById('profilePhotoPreview');
                    if (profilePhotoPreview && profilePhotoPreview.src && !profilePhotoPreview.src.includes('placeholder')) {
                        // Convert data URL to file and upload
                        const response = await fetch(profilePhotoPreview.src);
                        const blob = await response.blob();
                        const fileName = `${email}-${Date.now()}.jpg`;
                        const uploadResult = await dbService.uploadProfilePhoto(blob, fileName);
                        if (uploadResult.success) {
                            profilePhotoUrl = uploadResult.url;
                        }
                    }
                    
                    // Create tutor profile
                    const newTutor = {
                        full_name: fullName,
                        email,
                        university,
                        degree,
                        year_level: yearLevel,
                        subjects,
                        bio,
                        profile_photo: profilePhotoUrl
                    };
                    
                    const tutorResult = await dbService.createTutor(newTutor);
                    if (tutorResult.success) {
                        // Update user with profile photo
                        await dbService.updateUser(email, { profile_photo: profilePhotoUrl });
                        
                        SessionManager.setCurrentUser({...userResult.data, profile_photo: profilePhotoUrl});
                        alert('Registration successful!');
                        window.location.href = 'homePage.html';
                    } else {
                        alert('Tutor profile creation failed: ' + tutorResult.error);
                    }
                } catch (error) {
                    console.error('Tutor signup error:', error);
                    alert('Registration failed. Please try again.');
                }
            });
        }

        // Initialize navigation links
        const navLinks = document.querySelectorAll('.nav-link');
        navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const currentUser = SessionManager.getCurrentUser();
                if (!currentUser) {
                    alert('Please sign up first to access this feature.');
                } else {
                    window.location.href = link.getAttribute('data-target');
                }
            });
        });

        // Display featured tutors
        displayFeaturedTutors();
    }

    // Home Page Functions
    function initializeHomePage() {
        console.log('Initializing home page...');
        
        const welcomeMessage = document.querySelector('.hero-content h2');
        const currentUser = SessionManager.getCurrentUser();
        
        if (welcomeMessage && currentUser) {
            welcomeMessage.textContent = `Welcome! ${currentUser.full_name}`;
        }

        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => {
                SessionManager.clearCurrentUser();
                alert('Logged out successfully!');
                window.location.href = 'landingPage.html';
            });
        }
        
        console.log('Calling display functions...');
        displayRecommendedTutors();
        displayFeaturedTutors();
    }

    async function initializeTutorApprovalPage() {
        const container = document.getElementById('approvalList');
        if (!container) return;

        const currentUser = SessionManager.getCurrentUser();
        if (!currentUser || !currentUser.is_tutor) {
            container.innerHTML = '<p class="status-message">Log in as a tutor to manage session requests.</p>';
            return;
        }

        container.innerHTML = '<p class="status-message">Loading requests...</p>';

        try {
            const result = await dbService.getSessionsByTutor(currentUser.email);
            if (!result.success) {
                container.innerHTML = '<p class="status-message">Unable to load requests right now.</p>';
                return;
            }

            const pending = (result.data || []).filter(session => session.status === 'pending');
            if (!pending.length) {
                container.innerHTML = '<p class="status-message">No pending requests at the moment.</p>';
                return;
            }

            container.innerHTML = '';
            pending.forEach(session => container.appendChild(createApprovalCard(session)));
        } catch (error) {
            console.error('Approval page error:', error);
            container.innerHTML = '<p class="status-message">Error loading requests.</p>';
        }
    }

    function createApprovalCard(session) {
        const card = document.createElement('article');
        card.className = 'approval-card';
        card.dataset.sessionId = session.id;

        const knowsAbout = normalizeSubjects(session.subject);
        const subjectText = Array.isArray(knowsAbout) && knowsAbout.length ? knowsAbout.join(', ') : session.subject;

        card.innerHTML = `
            <header class="approval-card__header">
                <div>
                    <h3>${session.student_email}</h3>
                    <p>${subjectText}</p>
                </div>
                <span class="approval-card__status">Pending</span>
            </header>
            <p>${session.notes || 'No message provided.'}</p>
            <div class="approval-card__meta">
                <span>${formatFriendlyDate(session.scheduled_at)}</span>
            </div>
        `;

        const controls = document.createElement('div');
        controls.className = 'approval-actions';
        const approveBtn = document.createElement('button');
        approveBtn.type = 'button';
        approveBtn.className = 'approve-btn';
        approveBtn.textContent = 'Approve';
        approveBtn.addEventListener('click', () => handleSessionDecision(card, session.id, 'confirmed'));

        const declineBtn = document.createElement('button');
        declineBtn.type = 'button';
        declineBtn.className = 'decline-btn';
        declineBtn.textContent = 'Decline';
        declineBtn.addEventListener('click', () => handleSessionDecision(card, session.id, 'declined'));

        controls.append(approveBtn, declineBtn);
        card.appendChild(controls);

        return card;
    }

    async function handleSessionDecision(card, sessionId, status) {
        const result = await dbService.updateSessionStatus(sessionId, { status });
        if (result.success) {
            const statusLabel = card.querySelector('.approval-card__status');
            if (statusLabel) {
                statusLabel.textContent = status === 'confirmed' ? 'Approved' : 'Declined';
            }
            const buttons = card.querySelectorAll('button');
            buttons.forEach(btn => btn.disabled = true);
        } else {
            alert('Unable to update request: ' + (result.error || 'Unknown error'));
        }
    }

    function formatFriendlyDate(value) {
        if (!value) return 'No date selected';
        const date = new Date(value);
        if (Number.isNaN(date.getTime())) return 'Invalid date';
        return date.toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' });
    }

    // Profile Page Functions
    function initializeProfilePage() {
        console.log('Initializing profile page...');
        loadUserProfile();
        
        const profileForm = document.getElementById('profileForm');
        if (profileForm) {
            profileForm.addEventListener('submit', handleProfileUpdate);
        }

        const profilePhotoInput = document.getElementById('profilePhoto');
        const profilePhotoPreview = document.getElementById('profilePhotoPreview');
        if (profilePhotoInput && profilePhotoPreview) {
            handlePhotoUpload(profilePhotoInput, profilePhotoPreview);
        }
    }

    // Common Features
    function initializeCommonFeatures() {
        // Initialize side menu toggle
        const menuToggle = document.querySelector('.menu-toggle');
        const sideMenu = document.querySelector('.side-menu');
        const mainSections = document.querySelectorAll('main > section');
        
        if (menuToggle && sideMenu) {
            menuToggle.addEventListener('click', () => {
                sideMenu.classList.toggle('active');
                mainSections.forEach(section => {
                    section.classList.toggle('menu-active');
                });
                
                // Save menu state to sessionStorage
                const isMenuActive = sideMenu.classList.contains('active');
                sessionStorage.setItem('menuState', isMenuActive ? 'open' : 'closed');
            });
            
            // Restore menu state
            const savedMenuState = sessionStorage.getItem('menuState');
            if (savedMenuState === 'open') {
                sideMenu.classList.add('active');
                mainSections.forEach(section => {
                    section.classList.add('menu-active');
                });
            }
        }

        // Initialize tutor application form
        initializeTutorApplicationForm();
    }

    // Tutor Application Form
    function initializeTutorApplicationForm() {
        const tutorApplicationForm = document.getElementById('tutorApplicationForm');
        if (tutorApplicationForm) {
            tutorApplicationForm.addEventListener('submit', async function(e) {
                e.preventDefault();
                console.log('Tutor application form submitted');

                const currentUser = SessionManager.getCurrentUser();
                if (!currentUser) {
                    alert('Please log in first');
                    window.location.href = 'landingPage.html';
                    return;
                }

                const fullName = document.getElementById('tutorFullName').value;
                const bio = document.getElementById('tutorBio').value;
                const university = document.getElementById('university').value;
                const degree = document.getElementById('degree').value;
                const yearLevel = document.getElementById('yearLevel').value;
                const subjects = Array.from(document.getElementById('subjects').selectedOptions).map(option => option.value);
                const profilePhotoPreview = document.getElementById('profilePhotoPreview');

                try {
                    // Handle profile photo upload
                    let profilePhotoUrl = 'https://via.placeholder.com/150';
                    if (profilePhotoPreview && profilePhotoPreview.src && !profilePhotoPreview.src.includes('placeholder')) {
                        const response = await fetch(profilePhotoPreview.src);
                        const blob = await response.blob();
                        const fileName = `${currentUser.email}-${Date.now()}.jpg`;
                        const uploadResult = await dbService.uploadProfilePhoto(blob, fileName);
                        if (uploadResult.success) {
                            profilePhotoUrl = uploadResult.url;
                        }
                    }

                    // Create tutor profile
                    const newTutor = {
                        full_name: fullName,
                        email: currentUser.email,
                        bio,
                        university,
                        degree,
                        year_level: yearLevel,
                        subjects,
                        profile_photo: profilePhotoUrl
                    };

                    const tutorResult = await dbService.createTutor(newTutor);
                    if (!tutorResult.success) {
                        alert('Failed to create tutor profile: ' + tutorResult.error);
                        return;
                    }

                    // Update user status
                    const userUpdate = await dbService.updateUser(currentUser.email, { 
                        is_tutor: true, 
                        profile_photo: profilePhotoUrl 
                    });
                    
                    if (userUpdate.success) {
                        // Update session
                        const updatedUser = {...currentUser, is_tutor: true, profile_photo: profilePhotoUrl};
                        SessionManager.setCurrentUser(updatedUser);
                        
                        alert('Application submitted successfully!');
                        window.location.href = 'homePage.html';
                    } else {
                        alert('Failed to update user status: ' + userUpdate.error);
                    }
                } catch (error) {
                    console.error('Tutor application error:', error);
                    alert('Application failed. Please try again.');
                }
            });

            // Initialize photo handling
            const profilePhotoInput = document.getElementById('profilePhoto');
            const profilePhotoPreview = document.getElementById('profilePhotoPreview');
            if (profilePhotoInput && profilePhotoPreview) {
                handlePhotoUpload(profilePhotoInput, profilePhotoPreview);
            }
        }
    }

    // Profile Management Functions
    async function loadUserProfile() {
        const currentUser = SessionManager.getCurrentUser();
        if (!currentUser) {
            window.location.href = 'landingPage.html';
            return;
        }

        // Load basic user info
        document.getElementById('fullName').value = currentUser.full_name;
        document.getElementById('email').value = currentUser.email;
        
        // Load profile photo
        const profilePhotoPreview = document.getElementById('profilePhotoPreview');
        if (profilePhotoPreview && currentUser.profile_photo) {
            profilePhotoPreview.src = currentUser.profile_photo;
            profilePhotoPreview.style.display = 'block';
        }

        // Load tutor-specific info if user is a tutor
        if (currentUser.is_tutor) {
            try {
                const tutorResult = await dbService.getTutorByEmail(currentUser.email);
                if (tutorResult.success && tutorResult.data) {
                    const tutorInfo = tutorResult.data;
                    document.getElementById('tutorFields').style.display = 'block';
                    document.getElementById('university').value = tutorInfo.university || '';
                    document.getElementById('degree').value = tutorInfo.degree || '';
                    document.getElementById('bio').value = tutorInfo.bio || '';
                    
                    // Set subjects
                    const subjectsSelect = document.getElementById('subjects');
                    if (subjectsSelect && tutorInfo.subjects) {
                        Array.from(subjectsSelect.options).forEach(option => {
                            option.selected = tutorInfo.subjects.includes(option.value);
                        });
                    }
                }
            } catch (error) {
                console.error('Error loading tutor profile:', error);
            }
        }
    }

    async function handleProfileUpdate(e) {
        e.preventDefault();
        
        const currentUser = SessionManager.getCurrentUser();
        if (!currentUser) {
            alert('Please log in first');
            return;
        }

        const newFullName = document.getElementById('fullName').value.trim();
        const newPassword = document.getElementById('newPassword').value;
        const confirmPassword = document.getElementById('confirmPassword').value;
        const profilePhotoPreview = document.getElementById('profilePhotoPreview');

        if (newPassword && newPassword !== confirmPassword) {
            alert('Passwords do not match!');
            return;
        }

        try {
            // Handle profile photo upload if changed
            let profilePhotoUrl = currentUser.profile_photo;
            if (profilePhotoPreview && profilePhotoPreview.src && 
                profilePhotoPreview.src !== currentUser.profile_photo) {
                const response = await fetch(profilePhotoPreview.src);
                const blob = await response.blob();
                const fileName = `${currentUser.email}-${Date.now()}.jpg`;
                const uploadResult = await dbService.uploadProfilePhoto(blob, fileName);
                if (uploadResult.success) {
                    profilePhotoUrl = uploadResult.url;
                }
            }

            // Update user
            const userUpdates = {
                full_name: newFullName,
                profile_photo: profilePhotoUrl
            };
            
            if (newPassword) {
                userUpdates.password = newPassword;
            }

            const userResult = await dbService.updateUser(currentUser.email, userUpdates);
            if (!userResult.success) {
                alert('Failed to update profile: ' + userResult.error);
                return;
            }

            // Update tutor profile if user is a tutor
            if (currentUser.is_tutor) {
                const tutorUpdates = {
                    full_name: newFullName,
                    university: document.getElementById('university').value,
                    degree: document.getElementById('degree').value,
                    bio: document.getElementById('bio').value,
                    subjects: Array.from(document.getElementById('subjects').selectedOptions).map(option => option.value),
                    profile_photo: profilePhotoUrl
                };
                
                await dbService.updateTutor(currentUser.email, tutorUpdates);
            }

            // Update session
            const updatedUser = {...currentUser, ...userUpdates};
            SessionManager.setCurrentUser(updatedUser);

            alert('Profile updated successfully!');
            window.location.reload();
        } catch (error) {
            console.error('Profile update error:', error);
            alert('Failed to update profile. Please try again.');
        }
    }

    // Display Functions
    async function displayRecommendedTutors() {
        console.log('Starting displayRecommendedTutors');
        const tutorsContainer = document.querySelector('.tutor-cards');
        if (!tutorsContainer) {
            console.log('Tutors container not found');
            return;
        }

        try {
            const result = await dbService.getAllTutors();
            if (!result.success) {
                console.error('Failed to fetch tutors:', result.error);
                return;
            }

            const tutors = result.data || [];
            console.log('Fetched tutors:', tutors);
            tutorsContainer.innerHTML = '';

            if (tutors.length === 0) {
                const noTutors = document.createElement('div');
                noTutors.className = 'no-tutors';
                noTutors.innerHTML = 'No tutors available yet.';
                tutorsContainer.appendChild(noTutors);
                return;
            }

            // Display up to 6 tutors
            const displayTutors = tutors.slice(0, 6);
            displayTutors.forEach(tutor => {
                const tutorCard = createTutorCard(tutor);
                tutorsContainer.appendChild(tutorCard);
            });
        } catch (error) {
            console.error('Error displaying tutors:', error);
        }
    }

    async function displayFeaturedTutors() {
        const tutorsContainer = document.querySelector('.tutor-cards');
        if (!tutorsContainer) {
            console.log('Tutors container not found');
            return;
        }

        try {
            const result = await dbService.getAllTutors();
            if (!result.success) {
                console.error('Failed to fetch tutors:', result.error);
                return;
            }

            const tutors = result.data || [];
            tutorsContainer.innerHTML = '';

            if (tutors.length === 0) {
                const noTutors = document.createElement('div');
                noTutors.className = 'no-tutors';
                noTutors.innerHTML = 'No featured tutors available yet.';
                tutorsContainer.appendChild(noTutors);
                return;
            }

            // Display up to 3 featured tutors
            const featuredTutors = tutors.slice(0, 3);
            featuredTutors.forEach(tutor => {
                const tutorCard = createTutorCard(tutor);
                tutorsContainer.appendChild(tutorCard);
            });
        } catch (error) {
            console.error('Error displaying featured tutors:', error);
        }
    }

    async function initializeTutorDetailsPage() {
        const email = getQueryParam('email');
        const container = document.getElementById('tutorDetailsContainer');
        if (!container) return;

        if (!email) {
            container.innerHTML = '<p class="status-message">No tutor selected.</p>';
            return;
        }

        try {
            const result = await dbService.getTutorByEmail(email);
            if (!result.success || !result.data) {
                container.innerHTML = '<p class="status-message">Tutor not found.</p>';
                return;
            }

            renderTutorProfile(result.data);
        } catch (error) {
            console.error('Error loading tutor details:', error);
            container.innerHTML = '<p class="status-message">Unable to load tutor details right now.</p>';
        }
    }

    function normalizeSubjects(rawSubjects) {
        if (Array.isArray(rawSubjects)) {
            return rawSubjects.filter(Boolean);
        }
        if (typeof rawSubjects === 'string') {
            return rawSubjects
                .replace(/^{|}$/g, '')
                .split(',')
                .map(subject => subject.trim())
                .filter(Boolean);
        }
        return [];
    }

    function renderTutorProfile(tutor) {
        const container = document.getElementById('tutorDetailsContainer');
        if (!container) return;

        const subjectsList = normalizeSubjects(tutor.subjects);
        const subjectDisplay = subjectsList.length ? subjectsList.join(', ') : 'Subjects not listed';
        const serializedSubjects = JSON.stringify(subjectsList);
        const rating = tutor.rating ? Number(tutor.rating).toFixed(1) : '4.9';

        container.innerHTML = `
            <div class="tutor-header">
                <div class="tutor-hero">
                    <div class="tutor-photo-wrapper">
                        <img src="${tutor.profile_photo || 'https://via.placeholder.com/150'}" alt="${tutor.full_name}">
                        <div class="tutor-rating"><span>${rating}</span> ★</div>
                    </div>
                    <div class="tutor-headline">
                        <h1>${tutor.full_name}</h1>
                        <p>${tutor.university || 'University not specified'} · ${tutor.degree || 'Degree not specified'}</p>
                        <div class="subject-badges">
                            ${subjectsList.map(subject => `<span class="subject-badge">${subject}</span>`).join('')}
                            ${subjectsList.length === 0 ? '<span class="subject-badge muted">General Tutoring</span>' : ''}
                        </div>
                    </div>
                </div>
            </div>
            <div class="tutor-info">
                <div class="tutor-info-grid">
                    <p><strong>Email</strong><span>${tutor.email}</span></p>
                    <p><strong>Teaching</strong><span>${subjectDisplay}</span></p>
                    <p><strong>Experience</strong><span>${tutor.experience || '5+ years of tutoring'}</span></p>
                    <p><strong>Languages</strong><span>${tutor.languages || 'English, Filipino'}</span></p>
                </div>
                <p class="tutor-bio-text">${tutor.bio || 'This tutor is ready to guide you through their expertise with thoughtful, student-first sessions.'}</p>
                <button class="book-session-btn" onclick='openBookingModal("${tutor.email}", ${serializedSubjects})'>Book a Session</button>
            </div>
        `;
    }

    function createTutorCard(tutor) {
        const tutorCard = document.createElement('div');
        tutorCard.className = 'tutor-card';
        const subjectsList = normalizeSubjects(tutor.subjects);
        const subjectDisplay = subjectsList.length ? subjectsList.join(', ') : 'No subjects listed';
        tutorCard.innerHTML = `
            <img src="${tutor.profile_photo || 'https://via.placeholder.com/150'}" alt="${tutor.full_name}" class="tutor-photo">
            <h3>${tutor.full_name}</h3>
            <p class="tutor-university">${tutor.university || 'University not specified'}</p>
            <p class="tutor-degree">${tutor.degree || 'Degree not specified'}</p>
            <p class="tutor-subjects">${subjectDisplay}</p>
            <p class="tutor-bio">${tutor.bio || 'No bio available'}</p>
            <button class="contact-btn" onclick="openTutorDetails('${tutor.email}')">Book a Session</button>
        `;
        return tutorCard;
    }

    const bookSession = async (tutorEmail, bookingDetails = null) => {
        const currentUser = SessionManager.getCurrentUser();
        if (!currentUser) {
            alert('Please log in to book a session.');
            const loginModal = document.getElementById('loginModal');
            if (loginModal) loginModal.style.display = 'block';
            return;
        }

        let subject = bookingDetails?.subject?.trim();
        let scheduledAt = bookingDetails?.scheduled_at ? new Date(bookingDetails.scheduled_at) : null;
        const notes = bookingDetails?.notes ?? prompt('Notes for the tutor (optional):');

        if (!subject) {
            subject = prompt('Subject you want to book:');
            if (!subject) {
                alert('Subject is required to book a session.');
                return;
            }
        }

        if (!scheduledAt) {
            const scheduledAtInput = prompt('Preferred date/time (YYYY-MM-DD HH:mm):');
            if (!scheduledAtInput) {
                alert('Please select a date/time.');
                return;
            }

            scheduledAt = new Date(scheduledAtInput);
        }

        if (Number.isNaN(scheduledAt.getTime())) {
            alert('Invalid date/time format.');
            return;
        }

        try {
            const result = await dbService.createSession({
                student_email: currentUser.email,
                tutor_email: tutorEmail,
                subject,
                scheduled_at: scheduledAt.toISOString(),
                notes: notes || null,
                status: 'pending'
            });

            if (result.success) {
                alert('Session request sent! The tutor will confirm shortly.');
            } else {
                alert('Failed to book session: ' + result.error);
            }
        } catch (error) {
            console.error('Error booking session:', error);
            alert('Unable to book session right now. Please try again.');
        }

        return { success: result?.success ?? false, error: result?.error };
    };

    window.bookSession = bookSession;

    // Utility Functions
    function handlePhotoUpload(photoInput, photoPreview, onPhotoLoaded = null) {
        if (!photoInput || !photoPreview) return;

        photoInput.addEventListener('change', (event) => {
            const file = event.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function(e) {
                    const photoDataUrl = e.target.result;
                    photoPreview.src = photoDataUrl;
                    photoPreview.style.display = 'block';

                    if (onPhotoLoaded) {
                        onPhotoLoaded(photoDataUrl);
                    }
                };
                reader.readAsDataURL(file);
            } else {
                photoPreview.src = '';
                photoPreview.style.display = 'none';
            }
        });
    }

    // Search functionality
    async function displaySearchResults() {
        console.log('displaySearchResults function called');
        
        const urlParams = new URLSearchParams(window.location.search);
        const searchQuery = urlParams.get('query');
        
        if (!searchQuery) {
            console.log('No search query found');
            return;
        }

        try {
            const result = await dbService.getAllTutors();
            if (!result.success) {
                console.error('Failed to fetch tutors for search:', result.error);
                return;
            }

            const tutors = result.data || [];
            const filteredTutors = tutors.filter(tutor => {
                const searchLower = searchQuery.toLowerCase();
                return tutor.full_name.toLowerCase().includes(searchLower) ||
                       tutor.university.toLowerCase().includes(searchLower) ||
                       tutor.degree.toLowerCase().includes(searchLower) ||
                       (tutor.subjects && tutor.subjects.some(subject => 
                           subject.toLowerCase().includes(searchLower))) ||
                       (tutor.bio && tutor.bio.toLowerCase().includes(searchLower));
            });

            const resultsContainer = document.querySelector('.search-results');
            if (resultsContainer) {
                resultsContainer.innerHTML = '';
                
                if (filteredTutors.length === 0) {
                    resultsContainer.innerHTML = '<p>No tutors found matching your search.</p>';
                } else {
                    filteredTutors.forEach(tutor => {
                        const tutorCard = createTutorCard(tutor);
                        resultsContainer.appendChild(tutorCard);
                    });
                }
            }
        } catch (error) {
            console.error('Error in search:', error);
        }
    }

async function displayAccountsAdmin() {
    const accountsList = document.getElementById('accountsList');
    if (!accountsList) return;

    try {
        // For admin, we'd need a special endpoint to get all users
        // This is a simplified version
        accountsList.innerHTML = '<p>User management coming soon...</p>';
    } catch (error) {
        console.error('Error displaying accounts:', error);
    }
}

async function deleteTutorAdmin(email) {
    if (!confirm('Are you sure you want to delete this tutor?')) return;

    try {
        const result = await dbService.deleteTutor(email);
        if (result.success) {
            // Also update user status
            await dbService.updateUser(email, { is_tutor: false });
            displayTutorsAdmin(); // Refresh the list
        } else {
            alert('Failed to delete tutor: ' + result.error);
        }
    } catch (error) {
        console.error('Error deleting tutor:', error);
        alert('Failed to delete tutor');
    }
}

// Make admin functions globally available
window.displayTutorsAdmin = displayTutorsAdmin;
window.displayAccountsAdmin = displayAccountsAdmin;
window.deleteTutorAdmin = deleteTutorAdmin;
});
