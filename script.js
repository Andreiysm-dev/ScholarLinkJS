
const SUBJECTS = [
    'Mathematics',
    'Physics',
    'Chemistry',
    'Biology',
    'English',
    'History',
    'Computer Science',
    'Filipino'
];

document.addEventListener('DOMContentLoaded', () => {
    console.log('Page loaded');
    const path = window.location.pathname;
    const isHomePage = path.includes('homePage.html');
    const isLandingPage = path.includes('landingPage.html');
    const isTutorDetails = path.includes('tutorDetails.html');
    const isMessages = path.includes('messages.html');
    const searchResultsContainer = document.getElementById('searchResults');
    const searchQueryElement = document.getElementById('searchQuery');

    if (searchResultsContainer && searchQueryElement) {
        console.log('Search page elements found - initializing search');
        displaySearchResults();
    }

    if (isLandingPage) {
        const accountSection = document.querySelector('.account');
        const loginModal = document.getElementById('loginModal');
        const signupModal = document.getElementById('signupModal');
        const closeBtns = document.querySelectorAll('.close-button');
        const loginForm = document.getElementById('loginForm');
        const signupForm = document.getElementById('signupForm');
        const switchToSignupBtn = document.getElementById('switchToSignup');

        if (accountSection) {
            accountSection.innerHTML = `
                <a href="#" id="loginBtn">Log In</a>
                <a href="#" id="signupBtn">Sign Up</a>
            `;
            
            const loginBtn = document.getElementById('loginBtn');
            const signupBtn = document.getElementById('signupBtn');
            
            if (loginBtn) {
                loginBtn.addEventListener('click', () => {
                    if (loginModal) loginModal.style.display = 'block';
                });
            }
            
            if (signupBtn) {
                signupBtn.addEventListener('click', () => {
                    if (signupModal) signupModal.style.display = 'block';
                });
            }

            if (switchToSignupBtn) {
                switchToSignupBtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    if (loginModal) loginModal.style.display = 'none';
                    if (signupModal) signupModal.style.display = 'block';
                });
            }
            const switchToLoginBtn = document.getElementById('switchToLogin');
            if (switchToLoginBtn) {
                switchToLoginBtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    if (signupModal) signupModal.style.display = 'none';
                    if (loginModal) loginModal.style.display = 'block';
                });
            }


            closeBtns.forEach(btn => {
                btn.addEventListener('click', () => {
                    if (loginModal) loginModal.style.display = 'none';
                    if (signupModal) signupModal.style.display = 'none';
                });
            });


            window.addEventListener('click', (event) => {
                if (event.target === loginModal) {
                    loginModal.style.display = 'none';
                }
                if (event.target === signupModal) {
                    signupModal.style.display = 'none';
                }
            });


            if (loginForm) {
                loginForm.addEventListener('submit', function(e) {
                    e.preventDefault();
                    const email = document.getElementById('loginEmail').value.trim().toLowerCase();
                    const password = document.getElementById('loginPassword').value;
                    
                    const users = JSON.parse(localStorage.getItem('users') || '[]');
                    const user = users.find(u => u.email === email && u.password === password);
                    
                    if (user) {
                        localStorage.setItem('currentUser', JSON.stringify(user));
                        alert('Login successful!');
                        window.location.href = 'homePage.html';
                    } else {
                        alert('Invalid credentials!');
                    }
                });
            }


            if (signupForm) {
                signupForm.addEventListener('submit', function(e) {
                    e.preventDefault();
                    console.log('Signup form submitted'); 


                    const fullName = document.getElementById('fullName').value.trim();
                    const email = document.getElementById('email').value.trim().toLowerCase();
                    const password = document.getElementById('password').value;
                    const confirmPassword = document.getElementById('confirmPassword').value;
                    
                    console.log('Form values:', { fullName, email }); 

                    if (password !== confirmPassword) {
                        alert('Passwords do not match!');
                        return;
                    }
                    
                    const users = JSON.parse(localStorage.getItem('users') || '[]');
                    
                    if (users.some(user => user.email.toLowerCase() === email.toLowerCase())) {
                        alert('Email already registered!');
                        return;
                    }
                    
                    const newUser = { 
                        fullName, 
                        email, 
                        password,
                        isTutor: false
                    };
                    
                    users.push(newUser);
                    localStorage.setItem('users', JSON.stringify(users));
                    localStorage.setItem('currentUser', JSON.stringify(newUser));
                    
                    alert('Registration successful!');
                    window.location.href = 'homePage.html';
                });
            }

            const tutorSignupForm = document.getElementById('tutorSignupForm');
            if (tutorSignupForm) {
                tutorSignupForm.addEventListener('submit', function(e) {
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

                    console.log('Tutor form values:', { fullName, email, university }); 
                    
                    if (password !== confirmPassword) {
                        alert('Passwords do not match!');
                        return;
                    }
                    
                    const users = JSON.parse(localStorage.getItem('users') || '[]');
                    const tutors = JSON.parse(localStorage.getItem('tutors') || '[]');
                    
                    if (users.some(user => user.email.toLowerCase() === email.toLowerCase())) {
                        alert('Email already registered!');
                        return;
                    }
                    
                    const newTutor = {
                        fullName,
                        email,
                        university,
                        degree,
                        yearLevel,
                        subjects,
                        bio,
                        profilePhoto: document.getElementById('profilePhotoPreview')?.src || 'https://via.placeholder.com/150'
                    };
                    
                    console.log('Creating new tutor:', newTutor); 

                    const newUser = { 
                        fullName, 
                        email, 
                        password, 
                        isTutor: true 
                    };
                    
                    users.push(newUser);
                    tutors.push(newTutor);
                    
                    localStorage.setItem('users', JSON.stringify(users));
                    localStorage.setItem('tutors', JSON.stringify(tutors));
                    localStorage.setItem('currentUser', JSON.stringify(newUser));
                    
                    alert('Registration successful!');
                    window.location.href = 'homePage.html';
                });
            }
        }
    }

    if (isHomePage) {

        const welcomeMessage = document.querySelector('.hero-content h2');
        const currentUser = JSON.parse(localStorage.getItem('currentUser'));
        
        if (welcomeMessage && currentUser) {
            welcomeMessage.textContent = `Welcome, ${currentUser.fullName}!`;
        }


        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => {
                localStorage.removeItem('currentUser');
                alert('Logged out successfully!');
                window.location.href = 'landingPage.html';
            });
        }
        

        console.log('Calling display functions...');
        displayRecommendedTutors();
        displayPopularSubjects();
    }

    if (isTutorDetails) {
        displayTutorDetails();
    }

    if (isMessages) {
        displayMessages();
    }




    const profilePhotoInput = document.getElementById('profilePhoto');
    const profilePhotoPreview = document.getElementById('profilePhotoPreview');

    if (profilePhotoInput) {
        profilePhotoInput.addEventListener('change', (event) => {
            const file = event.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function(e) {
                    profilePhotoPreview.src = e.target.result;
                    profilePhotoPreview.style.display = 'block'; 
                };
                reader.readAsDataURL(file);
            } else {
                profilePhotoPreview.src = '';
                profilePhotoPreview.style.display = 'none'; 
            }
        });
    }


    function cleanupTutorData() {
        const tutors = JSON.parse(localStorage.getItem('tutors') || '[]');
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        

        const uniqueTutors = tutors.filter((tutor, index, self) =>
            index === self.findIndex((t) => t.email === tutor.email)
        );
        
        localStorage.setItem('tutors', JSON.stringify(uniqueTutors));
        
        users.forEach(user => {
            user.isTutor = uniqueTutors.some(tutor => tutor.email === user.email);
        });
        localStorage.setItem('users', JSON.stringify(users));
        

        const currentUser = JSON.parse(localStorage.getItem('currentUser'));
        if (currentUser) {
            currentUser.isTutor = uniqueTutors.some(tutor => tutor.email === currentUser.email);
            localStorage.setItem('currentUser', JSON.stringify(currentUser));
        }
    }


    const tutorApplicationForm = document.getElementById('tutorApplicationForm');
    if (tutorApplicationForm) {

        cleanupTutorData();
        
        tutorApplicationForm.addEventListener('submit', function(e) {
            e.preventDefault();
            console.log('Tutor application form submitted');

            const currentUser = JSON.parse(localStorage.getItem('currentUser'));
            if (!currentUser) {
                alert('Please log in first');
                window.location.href = 'landingPage.html';
                return;
            }

            const profilePhotoInput = document.getElementById('profilePhoto');
            const file = profilePhotoInput.files[0];
            
            if (!file) {
                alert('Please select a profile photo');
                return;
            }

            const reader = new FileReader();
            reader.onload = function(e) {
                const photoDataUrl = e.target.result;
                console.log('Photo loaded successfully'); 
                

                const newTutor = {
                    fullName: document.getElementById('tutorFullName').value,
                    email: currentUser.email,
                    bio: document.getElementById('tutorBio').value,
                    university: document.getElementById('university').value,
                    degree: document.getElementById('degree').value,
                    yearLevel: document.getElementById('yearLevel').value,
                    subjects: Array.from(document.getElementById('subjects').selectedOptions).map(option => option.value),
                    profilePhoto: photoDataUrl 
                };

                console.log('Creating new tutor with photo'); 


                const tutors = JSON.parse(localStorage.getItem('tutors') || '[]');
                const filteredTutors = tutors.filter(tutor => tutor.email !== currentUser.email);
                filteredTutors.push(newTutor);
                
                console.log('Saving tutor data to localStorage'); 
                localStorage.setItem('tutors', JSON.stringify(filteredTutors));


                const users = JSON.parse(localStorage.getItem('users') || '[]');
                const userIndex = users.findIndex(u => u.email === currentUser.email);
                if (userIndex !== -1) {
                    users[userIndex].isTutor = true;
                    users[userIndex].profilePhoto = photoDataUrl;
                    localStorage.setItem('users', JSON.stringify(users));

                    currentUser.isTutor = true;
                    currentUser.profilePhoto = photoDataUrl;
                    localStorage.setItem('currentUser', JSON.stringify(currentUser));
                }

                alert('Application submitted successfully!');
                window.location.href = 'homePage.html';
            };

            reader.onerror = function(error) {
                console.error('Error reading file:', error);
                alert('Error uploading photo. Please try again.');
            };

            console.log('Starting to read photo file'); 
            reader.readAsDataURL(file);
        });


        const profilePhotoInput = document.getElementById('profilePhoto');
        const profilePhotoPreview = document.getElementById('profilePhotoPreview');

        if (profilePhotoInput && profilePhotoPreview) {
            profilePhotoInput.addEventListener('change', function(e) {
                const file = e.target.files[0];
                if (file) {
                    const reader = new FileReader();
                    reader.onload = function(e) {
                        profilePhotoPreview.src = e.target.result;
                        profilePhotoPreview.style.display = 'block';
                    };
                    reader.readAsDataURL(file);
                } else {
                    profilePhotoPreview.src = '';
                    profilePhotoPreview.style.display = 'none';
                }
            });
        }
    }


    function loadUserProfile() {
        const currentUser = JSON.parse(localStorage.getItem('currentUser'));
        if (!currentUser) {
            window.location.href = 'landingPage.html';
            return;
        }


        document.getElementById('fullName').value = currentUser.fullName;
        document.getElementById('email').value = currentUser.email;
        

        const profilePhotoPreview = document.getElementById('profilePhotoPreview');
        if (profilePhotoPreview && currentUser.profilePhoto) {
            profilePhotoPreview.src = currentUser.profilePhoto;
            profilePhotoPreview.style.display = 'block';
        }


        if (currentUser.isTutor) {
            const tutors = JSON.parse(localStorage.getItem('tutors') || '[]');
            const tutorInfo = tutors.find(t => t.email === currentUser.email);
            
            if (tutorInfo) {
                document.getElementById('tutorFields').style.display = 'block';
                document.getElementById('university').value = tutorInfo.university || '';
                document.getElementById('degree').value = tutorInfo.degree || '';
                document.getElementById('bio').value = tutorInfo.bio || '';
                

                const subjectsSelect = document.getElementById('subjects');
                if (subjectsSelect && tutorInfo.subjects) {
                    Array.from(subjectsSelect.options).forEach(option => {
                        option.selected = tutorInfo.subjects.includes(option.value);
                    });
                }
            }
        }
    }


    const handleProfilePhotoChange = (event) => {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = function(e) {
            const photoDataUrl = e.target.result;
            const profilePhotoPreview = document.getElementById('profilePhotoPreview');
            
            if (profilePhotoPreview) {
                profilePhotoPreview.src = photoDataUrl;
                profilePhotoPreview.style.display = 'block';
            }


            const currentUser = JSON.parse(localStorage.getItem('currentUser'));
            if (currentUser) {
                const users = JSON.parse(localStorage.getItem('users') || '[]');
                const userIndex = users.findIndex(u => u.email === currentUser.email);
                if (userIndex !== -1) {
                    users[userIndex].profilePhoto = photoDataUrl;
                    localStorage.setItem('users', JSON.stringify(users));
                }


                if (currentUser.isTutor) {
                    const tutors = JSON.parse(localStorage.getItem('tutors') || '[]');
                    const tutorIndex = tutors.findIndex(t => t.email === currentUser.email);
                    if (tutorIndex !== -1) {
                        tutors[tutorIndex].profilePhoto = photoDataUrl;
                        localStorage.setItem('tutors', JSON.stringify(tutors));
                    }
                }


                currentUser.profilePhoto = photoDataUrl;
                localStorage.setItem('currentUser', JSON.stringify(currentUser));
            }
        };

        reader.readAsDataURL(file);
    };


    const profileForm = document.getElementById('profileForm');
    if (profileForm) {
        loadUserProfile();
        

        const profilePhotoInput = document.getElementById('profilePhoto');
        const profilePhotoPreview = document.getElementById('profilePhotoPreview');
        handlePhotoUpload(profilePhotoInput, profilePhotoPreview, updateUserPhoto);
        
        profileForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const currentUser = JSON.parse(localStorage.getItem('currentUser'));
            if (!currentUser) {
                alert('Please log in first');
                window.location.href = 'landingPage.html';
                return;
            }

            const newFullName = document.getElementById('fullName').value;
            const currentPassword = document.getElementById('currentPassword').value;
            const newPassword = document.getElementById('newPassword').value;
            const confirmNewPassword = document.getElementById('confirmNewPassword').value;
            const profilePhotoPreview = document.getElementById('profilePhotoPreview');


            if (newPassword || confirmNewPassword) {
                if (currentPassword !== currentUser.password) {
                    alert('Current password is incorrect');
                    return;
                }
                if (newPassword !== confirmNewPassword) {
                    alert('New passwords do not match');
                    return;
                }
            }


            const users = JSON.parse(localStorage.getItem('users') || '[]');
            const userIndex = users.findIndex(u => u.email === currentUser.email);
            
            if (userIndex === -1) {
                alert('User not found');
                return;
            }


            const updatedUser = {
                ...currentUser,
                fullName: newFullName,
                password: newPassword || currentUser.password,
                profilePhoto: profilePhotoPreview.src
            };


            users[userIndex] = updatedUser;
            localStorage.setItem('users', JSON.stringify(users));
            localStorage.setItem('currentUser', JSON.stringify(updatedUser));


            if (currentUser.isTutor) {
                const tutors = JSON.parse(localStorage.getItem('tutors') || '[]');
                const tutorIndex = tutors.findIndex(t => t.email === currentUser.email);
                
                if (tutorIndex !== -1) {
                    const updatedTutor = {
                        ...tutors[tutorIndex],
                        fullName: newFullName,
                        university: document.getElementById('university').value,
                        degree: document.getElementById('degree').value,
                        bio: document.getElementById('bio').value,
                        subjects: Array.from(document.getElementById('subjects').selectedOptions).map(option => option.value),
                        profilePhoto: profilePhotoPreview.src
                    };
                    
                    tutors[tutorIndex] = updatedTutor;
                    localStorage.setItem('tutors', JSON.stringify(tutors));
                }
            }

            alert('Profile updated successfully!');
            window.location.reload();
        });
    }


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


    function updateUserPhoto(photoDataUrl) {
        const currentUser = JSON.parse(localStorage.getItem('currentUser'));
        if (!currentUser) return;


        const users = JSON.parse(localStorage.getItem('users') || '[]');
        const userIndex = users.findIndex(u => u.email === currentUser.email);
        if (userIndex !== -1) {
            users[userIndex].profilePhoto = photoDataUrl;
            localStorage.setItem('users', JSON.stringify(users));
        }


        if (currentUser.isTutor) {
            const tutors = JSON.parse(localStorage.getItem('tutors') || '[]');
            const tutorIndex = tutors.findIndex(t => t.email === currentUser.email);
            if (tutorIndex !== -1) {
                tutors[tutorIndex].profilePhoto = photoDataUrl;
                localStorage.setItem('tutors', JSON.stringify(tutors));
            }
        }


        currentUser.profilePhoto = photoDataUrl;
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
    }


    function displaySearchResults() {
        console.log('displaySearchResults function called');
        

        const urlParams = new URLSearchParams(window.location.search);
        const searchQuery = urlParams.get('query');
        console.log('Search query:', searchQuery);
        

        const searchQueryElement = document.getElementById('searchQuery');
        const resultsContainer = document.getElementById('searchResults');
        
        console.log('Elements found:', {
            searchQueryElement: !!searchQueryElement,
            resultsContainer: !!resultsContainer
        });
        
   
        if (searchQueryElement) {
            searchQueryElement.textContent = searchQuery;
        }
        

        const tutors = JSON.parse(localStorage.getItem('tutors') || '[]');
        console.log('Tutors found in localStorage:', tutors);
        

        const filteredTutors = tutors.filter(tutor => 
            tutor.fullName.toLowerCase().includes(searchQuery.toLowerCase())
        );
        console.log('Filtered tutors:', filteredTutors);
        

        if (resultsContainer) {
            if (filteredTutors.length === 0) {
                resultsContainer.innerHTML = `
                    <div class="no-results">
                        <p>No tutors found matching "${searchQuery}"</p>
                        <a href="homePage.html" class="cta-button">Back to Home</a>
                    </div>
                `;
            } else {
                resultsContainer.innerHTML = '';
                filteredTutors.forEach(tutor => {
                    const card = document.createElement('div');
                    card.className = 'tutor-card';
                    card.innerHTML = `
                        <img src="${tutor.profilePhoto || 'https://via.placeholder.com/150'}" 
                             alt="${tutor.fullName}"
                             onerror="this.src='https://via.placeholder.com/150'">
                        <div class="tutor-card-content">
                            <h4>${tutor.fullName}</h4>
                            <p><strong>Subjects:</strong> ${tutor.subjects.join(', ')}</p>
                            <p><strong>University:</strong> ${tutor.university || 'Not specified'}</p>
                            <p class="tutor-bio">${tutor.bio ? tutor.bio.substring(0, 100) + (tutor.bio.length > 100 ? '...' : '') : ''}</p>
                        </div>
                        <button class="cta-button view-profile-btn">View Profile</button>
                    `;
                    
                    resultsContainer.appendChild(card);
                });
            }
        }
    }

    function displayNoResults(message) {
        const resultsContainer = document.getElementById('searchResults');
        if (resultsContainer) {
            resultsContainer.innerHTML = `
                <div class="no-results">
                    <p>${message}</p>
                    <a href="homePage.html" class="cta-button">Back to Home</a>
                </div>
            `;
        }
    }


    document.addEventListener('DOMContentLoaded', () => {
        if (window.location.pathname.includes('search.html')) {
            console.log('Search page detected');
            displaySearchResults();
        }
    });

    const menuToggle = document.getElementById('menuToggle');
    const sideMenu = document.querySelector('.side-menu');
    const mainSections = document.querySelectorAll('.hero, .featured-tutors, .search-results');
    
    if (menuToggle && sideMenu) {
        menuToggle.addEventListener('click', () => {
            sideMenu.classList.toggle('active');
            

            mainSections.forEach(section => {
                section.classList.toggle('menu-active');
            });
            

            const isMenuActive = sideMenu.classList.contains('active');
            localStorage.setItem('menuState', isMenuActive ? 'open' : 'closed');
        });
        

        const savedMenuState = localStorage.getItem('menuState');
        if (savedMenuState === 'open') {
            sideMenu.classList.add('active');
            mainSections.forEach(section => {
                section.classList.add('menu-active');
            });
        }
    }
});

function displayRecommendedTutors() {
    console.log('Starting displayRecommendedTutors');
    const tutorsContainer = document.querySelector('.tutor-cards');
    if (!tutorsContainer) {
        console.log('Tutors container not found');
        return;
    }

    const tutors = JSON.parse(localStorage.getItem('tutors') || '[]');
    console.log('Fetched tutors:', tutors); 
    tutorsContainer.innerHTML = '';

    if (tutors.length === 0) {
        console.log('No tutors found');
        const noTutors = createElement('div', 'no-tutors');
        const message = createElement('p');
        message.innerHTML = 'No tutors available yet. <a href="becomeTutor.html">Become our first tutor!</a>';
        noTutors.appendChild(message);
        tutorsContainer.appendChild(noTutors);
        return;
    }

    tutors.forEach(tutor => {
        console.log('Processing tutor:', tutor); 
        const card = createElement('div', 'tutor-card');
        
        const img = createElement('img');
        if (tutor.profilePhoto) {
            console.log('Tutor has profile photo:', tutor.email); 
            img.src = tutor.profilePhoto;
        } else {
            console.log('No profile photo for tutor:', tutor.email); 
            img.src = 'https://via.placeholder.com/150';
        }
        img.alt = tutor.fullName;
        img.onerror = () => {
            console.log('Error loading image for:', tutor.email); 
            img.src = 'https://via.placeholder.com/150';
        };
        
        const content = createElement('div', 'tutor-card-content');
        
        const name = createElement('h4', '', tutor.fullName);
        const subjects = createElement('p', '', `Subjects: ${tutor.subjects.join(', ')}`);
        const bio = createElement('p', '', tutor.bio.substring(0, 100) + (tutor.bio.length > 100 ? '...' : ''));
        
        content.appendChild(name);
        content.appendChild(subjects);
        content.appendChild(bio);
        
        const detailsBtn = createElement('button', 'details-btn', 'Details');
        detailsBtn.onclick = () => {
            console.log('Storing tutor for details:', tutor); // Debug log
            localStorage.setItem('selectedTutor', JSON.stringify(tutor));
            window.location.href = 'tutorDetails.html';
        };
        
        card.appendChild(img);
        card.appendChild(content);
        card.appendChild(detailsBtn);
        
        tutorsContainer.appendChild(card);
    });
    console.log('Finished displaying tutors');
}


const displayPopularSubjects = () => {
    const subjectsContainer = document.querySelector('#popularSubjects .subject-cards');
    if (!subjectsContainer) {
        console.log('Subjects container not found');
        return;
    }


    const allSubjects = [
        'Mathematics',
        'Physics',
        'Chemistry',
        'Biology',
        'English',
        'History',
        'Computer Science',
        'Filipino'
    ];

    const subjectImages = {
        'Mathematics': 'https://via.placeholder.com/150?text=Math',
        'Physics': 'https://via.placeholder.com/150?text=Physics',
        'Chemistry': 'https://via.placeholder.com/150?text=Chemistry',
        'Biology': 'https://via.placeholder.com/150?text=Biology',
        'English': 'https://via.placeholder.com/150?text=English',
        'History': 'https://via.placeholder.com/150?text=History',
        'Computer Science': 'https://via.placeholder.com/150?text=CS',
        'Filipino': 'https://via.placeholder.com/150?text=Filipino'
    };


    const subjectStats = getSubjectStats();
    console.log('Subject stats:', subjectStats);


    subjectsContainer.innerHTML = '';


    allSubjects.forEach(subject => {
        const count = subjectStats[subject] || 0;
        const card = createElement('div', 'subject-card');
        
        const img = createElement('img');
        img.src = subjectImages[subject];
        img.alt = subject;
        
        const title = createElement('h4', '', subject);
        const tutorCount = createElement('p', '', `${count} ${count === 1 ? 'Tutor' : 'Tutors'} Available`);
        
        const button = createElement('button', '', 'Find a Tutor');
        if (count === 0) {
            button.disabled = true;
            button.classList.add('disabled');
        } else {
            button.addEventListener('click', () => {
                window.location.href = `findTutor.html#${subject.toLowerCase()}`;
            });
        }

        card.appendChild(img);
        card.appendChild(title);
        card.appendChild(tutorCount);
        card.appendChild(button);
        
        subjectsContainer.appendChild(card);
    });

    console.log('Subjects displayed');
};


const getSubjectStats = () => {
    const tutors = JSON.parse(localStorage.getItem('tutors') || '[]');
    const subjectCount = {};
    

    tutors.forEach(tutor => {
        tutor.subjects.forEach(subject => {
            subjectCount[subject] = (subjectCount[subject] || 0) + 1;
        });
    });
    
    return subjectCount;
};


const createElement = (tag, className, text = '') => {
    const element = document.createElement(tag);
    if (className) element.className = className;
    if (text) element.textContent = text;
    return element;
};


const updateAccountSection = () => {
    const accountSection = document.querySelector('.account');
    if (!accountSection) return;

    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUser) {
        accountSection.innerHTML = `
            <a href="#" id="loginBtn">Log In</a>
            <a href="#" id="signupBtn">Sign Up</a>
        `;

       
        const loginBtn = document.getElementById('loginBtn');
        const signupBtn = document.getElementById('signupBtn');
        
        if (loginBtn) {
            loginBtn.addEventListener('click', () => {
                if (loginModal) loginModal.style.display = 'block';
            });
        }
        
        if (signupBtn) {
            signupBtn.addEventListener('click', () => {
                if (signupModal) signupModal.style.display = 'block';
            });
        }
    } else {

        accountSection.innerHTML = `
            <a href="#" id="logoutBtn">Log Out</a>
        `;
        

        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', handleLogout);
        }
    }
};


const handleLogout = () => {
    localStorage.removeItem('currentUser');
    alert('Logged out successfully!');
    window.location.href = 'landingPage.html';  
};


const displayTutorDetails = () => {
    console.log('Starting displayTutorDetails');
    const tutorProfileContainer = document.querySelector('.tutor-profile');
    if (!tutorProfileContainer) return;

    const tutor = JSON.parse(localStorage.getItem('selectedTutor'));
    console.log('Tutor data from localStorage:', tutor);

    if (!tutor) {
        console.log('No tutor data found in localStorage');
        window.location.href = 'homePage.html';
        return;
    }


    tutorProfileContainer.innerHTML = `
        <div class="tutor-header">
            <img src="${tutor.profilePhoto || 'https://via.placeholder.com/150'}" alt="${tutor.fullName}">
            <h1>${tutor.fullName}</h1>
        </div>
        <div class="tutor-info">
            <p><strong>Email:</strong> ${tutor.email}</p>
            <p><strong>Subjects:</strong> ${tutor.subjects.join(', ')}</p>
            <p><strong>University:</strong> ${tutor.university}</p>
            <p><strong>Degree:</strong> ${tutor.degree} (Year ${tutor.yearLevel})</p>
            <p><strong>Bio:</strong> ${tutor.bio}</p>
            <button 
                class="book-session-btn" 
                data-tutor-email="${tutor.email}"
                onclick="bookTutor(this.getAttribute('data-tutor-email'))"
            >Book a Session</button>
        </div>
    `;


    console.log('Re-storing tutor data:', tutor);
    localStorage.setItem('selectedTutor', JSON.stringify(tutor));
};


const bookTutor = (tutorEmail) => {
    console.log('Starting bookTutor function');
    console.log('Tutor email received:', tutorEmail);
    
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUser) {
        alert('Please log in to book a session');
        return;
    }

    const selectedTutor = JSON.parse(localStorage.getItem('selectedTutor'));
    console.log('Selected Tutor:', selectedTutor);

    if (!selectedTutor || !tutorEmail) {
        console.log('Tutor data missing:', {
            selectedTutor,
            tutorEmail
        });
        alert('Error: Tutor information not found');
        return;
    }


    const message = {
        id: Date.now(),
        from: currentUser.email,
        to: tutorEmail, 
        type: 'booking',
        status: 'pending',
        timestamp: new Date().toISOString(),
        subject: 'Session Booking Request',
        content: `${currentUser.fullName} would like to book a tutoring session.`,
        read: false
    };

    console.log('Created message:', message);


    const messages = JSON.parse(localStorage.getItem('messages') || '[]');
    messages.push(message);
    localStorage.setItem('messages', JSON.stringify(messages));

    alert('Booking request sent! The tutor will respond to your request soon.');
    window.location.href = 'messages.html';
};


const displayMessages = () => {
    const messageList = document.querySelector('.message-list');
    if (!messageList) return;

    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUser) {
        window.location.href = 'landingPage.html';
        return;
    }

    const messages = JSON.parse(localStorage.getItem('messages') || '[]');
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    

    const getFullName = (email) => {
        const user = users.find(u => u.email === email);
        return user ? user.fullName : email;
    };

    const userMessages = messages.filter(msg => 
        msg.to === currentUser.email || msg.from === currentUser.email
    );

    if (userMessages.length === 0) {
        messageList.innerHTML = '<p class="no-messages">No messages yet</p>';
        return;
    }

    messageList.innerHTML = userMessages
        .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
        .map(msg => `
            <div class="message-card ${!msg.read && msg.to === currentUser.email ? 'unread' : ''}">
                <div class="message-header">
                    <span class="message-type ${msg.type}">${msg.type.toUpperCase()}</span>
                    <span class="message-from">From: ${getFullName(msg.from)}</span>
                    <span class="message-to">To: ${getFullName(msg.to)}</span>
                    <span class="message-date">${new Date(msg.timestamp).toLocaleDateString()}</span>
                    <button onclick="deleteMessage('${msg.id}')">Delete</button>
                </div>
                <h3>${msg.subject}</h3>
                <p>${msg.content}</p>
                ${msg.type === 'booking' && msg.to === currentUser.email && msg.status === 'pending' ? `
                    <div class="message-actions">
                        <button onclick="respondToBooking('${msg.id}', true)">Accept</button>
                        <button onclick="respondToBooking('${msg.id}', false)">Decline</button>
                    </div>
                ` : ''}
                ${msg.status !== 'pending' ? `
                    <div class="message-status ${msg.status}">
                        ${msg.status.toUpperCase()}
                    </div>
                ` : ''}
            </div>
        `).join('');
};


const respondToBooking = (messageId, accept) => {
    const messages = JSON.parse(localStorage.getItem('messages') || '[]');
    const messageIndex = messages.findIndex(msg => msg.id.toString() === messageId);
    
    if (messageIndex !== -1) {
        messages[messageIndex].status = accept ? 'accepted' : 'declined';
        messages[messageIndex].read = true;

        const responseMessage = {
            id: Date.now(),
            from: messages[messageIndex].to,
            to: messages[messageIndex].from,
            type: 'response',
            status: accept ? 'accepted' : 'declined',
            timestamp: new Date().toISOString(),
            subject: 'Booking Request Response',
            content: `Your booking request has been ${accept ? 'accepted' : 'declined'}.`,
            read: false
        };
        
        messages.push(responseMessage);
        localStorage.setItem('messages', JSON.stringify(messages));
        displayMessages();
    }
};


window.deleteMessage = (messageId) => {
    const messages = JSON.parse(localStorage.getItem('messages') || '[]');
    const updatedMessages = messages.filter(msg => msg.id.toString() !== messageId);
    localStorage.setItem('messages', JSON.stringify(updatedMessages));
    displayMessages(); 
};


displayMessages();


function filterTutorsBySubject(subject) {
    console.log('Filtering by subject:', subject); // Debug log
    const tutors = JSON.parse(localStorage.getItem('tutors') || '[]');
    console.log('Available tutors:', tutors); // Debug log


    const filteredTutors = tutors.filter(tutor => {
        return tutor.subjects && tutor.subjects.some(tutorSubject => 
            tutorSubject.toLowerCase().trim() === subject.toLowerCase().trim()
        );
    });

    console.log('Filtered tutors:', filteredTutors); 
    displayFilteredTutors(filteredTutors);
}


function displayFilteredTutors(filteredTutors) {
    const tutorCards = document.querySelector('.tutor-cards');
    if (!tutorCards) {
        console.log('Tutor cards container not found');
        return;
    }


    tutorCards.innerHTML = '';

    if (!filteredTutors || filteredTutors.length === 0) {
        const noResults = document.createElement('div');
        noResults.className = 'no-results';
        noResults.textContent = 'No tutors found for this subject.';
        tutorCards.appendChild(noResults);
        return;
    }

    console.log('Displaying tutors:', filteredTutors); 
    filteredTutors.forEach(tutor => {
        const card = document.createElement('div');
        card.className = 'tutor-card';


        card.innerHTML = `
            <img src="${tutor.profilePhoto || 'https://via.placeholder.com/150'}" 
                 alt="${tutor.fullName}"
                 onerror="this.src='https://via.placeholder.com/150'">
            <div class="tutor-card-content">
                <h4>${tutor.fullName}</h4>
                <p><strong>Subjects:</strong> ${tutor.subjects.join(', ')}</p>
                <p><strong>University:</strong> ${tutor.university || 'Not specified'}</p>
                <p class="tutor-bio">${tutor.bio ? tutor.bio.substring(0, 100) + (tutor.bio.length > 100 ? '...' : '') : ''}</p>
            </div>
            <button class="cta-button view-profile-btn">View Profile</button>
        `;


        const viewProfileBtn = card.querySelector('.view-profile-btn');
        viewProfileBtn.addEventListener('click', () => {
            localStorage.setItem('selectedTutor', JSON.stringify(tutor));
            window.location.href = 'tutorDetails.html';
        });

        tutorCards.appendChild(card);
    });
}


function initializeFindTutorPage() {
    console.log('Initializing find tutor page');
    const subjectFilters = document.querySelector('.subject-filters');
    const tutorCards = document.querySelector('.tutor-cards');
    
    if (!subjectFilters || !tutorCards) {
        console.error('Required elements not found');
        return;
    }


    subjectFilters.innerHTML = '';


    const allTutorsBtn = document.createElement('button');
    allTutorsBtn.className = 'subject-filter active';
    allTutorsBtn.textContent = 'All Tutors';
    allTutorsBtn.addEventListener('click', () => {
        document.querySelectorAll('.subject-filter').forEach(btn => 
            btn.classList.remove('active')
        );
        allTutorsBtn.classList.add('active');
        displayAllTutors();
    });
    subjectFilters.appendChild(allTutorsBtn);


    SUBJECTS.forEach(subject => {
        const filterBtn = document.createElement('button');
        filterBtn.className = 'subject-filter';
        filterBtn.textContent = subject;
        filterBtn.addEventListener('click', () => {
            document.querySelectorAll('.subject-filter').forEach(btn => 
                btn.classList.remove('active')
            );
            filterBtn.classList.add('active');
            filterTutorsBySubject(subject);
        });
        subjectFilters.appendChild(filterBtn);
    });


    const hashSubject = window.location.hash.slice(1);
    if (hashSubject) {
        const decodedSubject = decodeURIComponent(hashSubject);
        const matchingSubject = SUBJECTS.find(
            subject => subject.toLowerCase() === decodedSubject.toLowerCase()
        );
        if (matchingSubject) {
            const subjectButton = Array.from(document.querySelectorAll('.subject-filter'))
                .find(btn => btn.textContent === matchingSubject);
            if (subjectButton) {
                subjectButton.click();
                return;
            }
        }
    }


    displayAllTutors();
}


function displayAllTutors() {
    const tutors = JSON.parse(localStorage.getItem('tutors') || '[]');
    console.log('Displaying all tutors:', tutors);
    displayFilteredTutors(tutors);
}


document.addEventListener('DOMContentLoaded', () => {
    if (window.location.pathname.includes('findTutor.html')) {
        console.log('Find Tutor page detected');
        initializeFindTutorPage();
    }
});