import { auth, db } from './firebase-config.js';
import {
    signInWithPopup,
    GoogleAuthProvider,
    signOut,
    onAuthStateChanged,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    updateProfile
} from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';
import {
    collection,
    addDoc,
    query,
    orderBy,
    limit,
    onSnapshot,
    serverTimestamp,
    doc,
    updateDoc,
    increment,
    where,
    getDocs,
    setDoc,
    getDoc,
    arrayUnion,
    arrayRemove
} from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';

// Global variables
let currentUser = null;
let unsubscribePosts = null;
let unsubscribeMessages = null;
let currentChatUser = null;
let userFollowing = [];

// DOM elements
const loadingScreen = document.getElementById('loading-screen');
const loginScreen = document.getElementById('login-screen');
const mainScreen = document.getElementById('main-screen');
const logoutBtn = document.getElementById('logout-btn');
const userAvatar = document.getElementById('user-avatar');
const composerAvatar = document.getElementById('composer-avatar');
const userName = document.getElementById('user-name');
const postContent = document.getElementById('post-content');
const postBtn = document.getElementById('post-btn');
const charCount = document.getElementById('char-count');
const postsContainer = document.getElementById('posts-container');

// Auth form elements
const signinTab = document.getElementById('signin-tab');
const signupTab = document.getElementById('signup-tab');
const signinForm = document.getElementById('signin-form');
const signupForm = document.getElementById('signup-form');
const signinEmail = document.getElementById('signin-email');
const signinPassword = document.getElementById('signin-password');
const signinBtn = document.getElementById('signin-btn');
const googleSigninBtn = document.getElementById('google-signin-btn');
const signupDisplayname = document.getElementById('signup-displayname');
const signupEmail = document.getElementById('signup-email');
const signupPassword = document.getElementById('signup-password');
const signupConfirmPassword = document.getElementById('signup-confirm-password');
const signupStream = document.getElementById('signup-stream');
const signupBtn = document.getElementById('signup-btn');
const googleSignupBtn = document.getElementById('google-signup-btn');
const backToSigninBtn = document.getElementById('back-to-signin');
const termsCheckbox = document.getElementById('terms-checkbox');

// Following elements
const followingBtn = document.getElementById('following-btn');
const followingModal = document.getElementById('following-modal');
const closeFollowing = document.getElementById('close-following');
const discoverTab = document.getElementById('discover-tab');
const followingListTab = document.getElementById('following-list-tab');
const discoverUsers = document.getElementById('discover-users');
const followingList = document.getElementById('following-list');
const discoverUsersList = document.getElementById('discover-users-list');
const followingUsersList = document.getElementById('following-users-list');
const followingCount = document.getElementById('following-count');

// Profile elements
const profileBtn = document.getElementById('profile-btn');
const profileModal = document.getElementById('profile-modal');
const closeProfile = document.getElementById('close-profile');
const profileAvatar = document.getElementById('profile-avatar');
const profileName = document.getElementById('profile-name');
const profileEmail = document.getElementById('profile-email');
const profileStreamInfo = document.getElementById('profile-stream-info');
const profileFollowingCount = document.getElementById('profile-following-count');
const profileFollowersCount = document.getElementById('profile-followers-count');
const profilePostsCount = document.getElementById('profile-posts-count');
const followersTab = document.getElementById('followers-tab');
const myPostsTab = document.getElementById('my-posts-tab');
const activityTab = document.getElementById('activity-tab');
const followersContent = document.getElementById('followers-content');
const postsContent = document.getElementById('posts-content');
const activityContent = document.getElementById('activity-content');
const followersList = document.getElementById('followers-list');
const userPostsList = document.getElementById('user-posts-list');
const totalPosts = document.getElementById('total-posts');
const totalLikesReceived = document.getElementById('total-likes-received');
const engagementRate = document.getElementById('engagement-rate');
const memberSince = document.getElementById('member-since');

// Stream elements
const streamsBtn = document.getElementById('streams-btn');
const streamsModal = document.getElementById('streams-modal');
const closeStreams = document.getElementById('close-streams');
const streamUsersList = document.getElementById('stream-users-list');
const userStream = document.getElementById('user-stream');
let currentStreamTab = 'central';

// Messages elements
const messagesBtn = document.getElementById('messages-btn');
const messagesModal = document.getElementById('messages-modal');
const closeMessages = document.getElementById('close-messages');
const chatModal = document.getElementById('chat-modal');
const closeChatBtn = document.getElementById('close-chat');
const chatTitle = document.getElementById('chat-title');
const chatMessages = document.getElementById('chat-messages');
const messageInput = document.getElementById('message-input');
const sendMessageBtn = document.getElementById('send-message');
const usersList = document.getElementById('users-list');
const unreadCount = document.getElementById('unread-count');

// Toast elements
const errorToast = document.getElementById('error-toast');
const successToast = document.getElementById('success-toast');
const errorMessage = document.getElementById('error-message');
const successMessage = document.getElementById('success-message');
const closeError = document.getElementById('close-error');

// Initialize the app
window.addEventListener('load', () => {
    setTimeout(() => {
        loadingScreen.style.display = 'none';
        initializeApp();
    }, 1000);
});

// Initialize app functionality
function initializeApp() {
    setupEventListeners();
    setupAuthStateListener();
}

// Setup event listeners
function setupEventListeners() {
    // Authentication tabs
    signinTab.addEventListener('click', () => showAuthTab('signin'));
    signupTab.addEventListener('click', () => showAuthTab('signup'));
    
    // Authentication forms
    signinBtn.addEventListener('click', signInWithEmail);
    googleSigninBtn.addEventListener('click', signInWithGoogle);
    signupBtn.addEventListener('click', signUpWithEmail);
    googleSignupBtn.addEventListener('click', signInWithGoogle);
    backToSigninBtn.addEventListener('click', () => showAuthTab('signin'));
    logoutBtn.addEventListener('click', signOutUser);
    
    // Form submissions on Enter key
    signinEmail.addEventListener('keydown', handleAuthKeydown);
    signinPassword.addEventListener('keydown', handleAuthKeydown);
    signupDisplayname.addEventListener('keydown', handleAuthKeydown);
    signupEmail.addEventListener('keydown', handleAuthKeydown);
    signupPassword.addEventListener('keydown', handleAuthKeydown);
    signupConfirmPassword.addEventListener('keydown', handleAuthKeydown);
    
    // Password validation feedback
    signupPassword.addEventListener('input', updatePasswordValidation);
    signupConfirmPassword.addEventListener('input', updatePasswordValidation);
    signupDisplayname.addEventListener('input', updateDisplayNameValidation);
    
    // Post creation
    postContent.addEventListener('input', updateCharCount);
    postContent.addEventListener('keydown', handlePostKeydown);
    postBtn.addEventListener('click', createPost);
    
    // Profile
    profileBtn.addEventListener('click', openProfileModal);
    closeProfile.addEventListener('click', closeProfileModal);
    followersTab.addEventListener('click', () => showProfileTab('followers'));
    myPostsTab.addEventListener('click', () => showProfileTab('posts'));
    activityTab.addEventListener('click', () => showProfileTab('activity'));
    
    // Streams
    streamsBtn.addEventListener('click', openStreamsModal);
    closeStreams.addEventListener('click', closeStreamsModal);
    
    // Stream tabs
    document.querySelectorAll('.stream-tab').forEach(tab => {
        tab.addEventListener('click', (e) => {
            const stream = e.target.getAttribute('data-stream');
            showStreamTab(stream);
        });
    });
    
    // Following
    followingBtn.addEventListener('click', openFollowingModal);
    closeFollowing.addEventListener('click', closeFollowingModal);
    discoverTab.addEventListener('click', () => showFollowingTab('discover'));
    followingListTab.addEventListener('click', () => showFollowingTab('following'));
    
    // Messaging
    messagesBtn.addEventListener('click', openMessagesModal);
    closeMessages.addEventListener('click', closeMessagesModal);
    closeChatBtn.addEventListener('click', closeChatModal);
    messageInput.addEventListener('keydown', handleMessageKeydown);
    sendMessageBtn.addEventListener('click', sendMessage);
    
    // Toast notifications
    closeError.addEventListener('click', hideErrorToast);
    
    // Auto-hide success toast
    setTimeout(() => {
        if (successToast.style.display !== 'none') {
            hideSuccessToast();
        }
    }, 3000);
}

// Auth UI functions
function showAuthTab(tab) {
    if (tab === 'signin') {
        signinTab.classList.add('active');
        signupTab.classList.remove('active');
        signinForm.style.display = 'block';
        signupForm.style.display = 'none';
    } else {
        signupTab.classList.add('active');
        signinTab.classList.remove('active');
        signupForm.style.display = 'block';
        signinForm.style.display = 'none';
    }
}

function handleAuthKeydown(e) {
    if (e.key === 'Enter') {
        e.preventDefault();
        if (signinForm.style.display !== 'none') {
            signInWithEmail();
        } else {
            signUpWithEmail();
        }
    }
}

// Authentication functions
async function signInWithEmail() {
    const email = signinEmail.value.trim();
    const password = signinPassword.value;
    
    if (!email || !password) {
        showError('Please enter both email and password.');
        return;
    }
    
    try {
        signinBtn.disabled = true;
        signinBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Signing in...';
        
        await signInWithEmailAndPassword(auth, email, password);
        showSuccess('Successfully signed in!');
    } catch (error) {
        console.error('Sign in failed:', error);
        let errorMsg = 'Failed to sign in. ';
        switch (error.code) {
            case 'auth/user-not-found':
                errorMsg += 'No account found with this email.';
                break;
            case 'auth/wrong-password':
                errorMsg += 'Incorrect password.';
                break;
            case 'auth/invalid-email':
                errorMsg += 'Invalid email address.';
                break;
            case 'auth/too-many-requests':
                errorMsg += 'Too many failed attempts. Try again later.';
                break;
            default:
                errorMsg += 'Please try again.';
        }
        showError(errorMsg);
    } finally {
        signinBtn.disabled = false;
        signinBtn.innerHTML = '<i class="fas fa-sign-in-alt"></i> Sign In';
    }
}

async function signUpWithEmail() {
    const displayName = signupDisplayname.value.trim();
    const email = signupEmail.value.trim();
    const password = signupPassword.value;
    const confirmPassword = signupConfirmPassword.value;
    const stream = signupStream.value;
    
    // Enhanced validation
    if (!displayName || !email || !password || !confirmPassword || !stream) {
        showError('Please fill in all fields to create your account.');
        return;
    }
    
    if (displayName.length < 2) {
        showError('Display name must be at least 2 characters long.');
        return;
    }
    
    if (displayName.length > 50) {
        showError('Display name must be less than 50 characters.');
        return;
    }
    
    if (password !== confirmPassword) {
        showError('Passwords do not match. Please check and try again.');
        return;
    }
    
    if (password.length < 6) {
        showError('Password must be at least 6 characters long.');
        return;
    }
    
    if (!termsCheckbox.checked) {
        showError('Please agree to the Terms of Service and Privacy Policy.');
        return;
    }
    
    try {
        signupBtn.disabled = true;
        signupBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Creating your account...';
        
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        await updateProfile(userCredential.user, { displayName: displayName });
        
        // Create user document in Firestore with stream
        await createUserDocument(userCredential.user, stream);
        
        // Clear form
        clearSignupForm();
        
        showSuccess(`Welcome to SocialSpace, ${displayName}! Your account has been created successfully.`);
    } catch (error) {
        console.error('Sign up failed:', error);
        let errorMsg = 'Account creation failed. ';
        switch (error.code) {
            case 'auth/email-already-in-use':
                errorMsg += 'This email is already registered. Try signing in instead.';
                break;
            case 'auth/invalid-email':
                errorMsg += 'Please enter a valid email address.';
                break;
            case 'auth/weak-password':
                errorMsg += 'Please choose a stronger password.';
                break;
            default:
                errorMsg += error.message;
        }
        showError(errorMsg);
    } finally {
        signupBtn.disabled = false;
        signupBtn.innerHTML = '<i class="fas fa-user-plus"></i> Create My Account';
    }
}

function clearSignupForm() {
    signupDisplayname.value = '';
    signupEmail.value = '';
    signupPassword.value = '';
    signupConfirmPassword.value = '';
    signupStream.value = '';
    termsCheckbox.checked = false;
    
    // Clear validation styling
    clearFieldValidation(signupDisplayname);
    clearFieldValidation(signupPassword);
    clearFieldValidation(signupConfirmPassword);
}

// Real-time validation functions
function updateDisplayNameValidation() {
    const name = signupDisplayname.value.trim();
    const helpText = signupDisplayname.parentNode.querySelector('.field-help');
    
    if (name.length === 0) {
        clearFieldValidation(signupDisplayname);
        helpText.textContent = 'This is how others will see your name';
        helpText.className = 'field-help';
    } else if (name.length < 2) {
        setFieldValidation(signupDisplayname, false);
        helpText.textContent = 'Display name must be at least 2 characters';
        helpText.className = 'field-help error';
    } else if (name.length > 50) {
        setFieldValidation(signupDisplayname, false);
        helpText.textContent = 'Display name must be less than 50 characters';
        helpText.className = 'field-help error';
    } else {
        setFieldValidation(signupDisplayname, true);
        helpText.textContent = 'Great! This name looks good';
        helpText.className = 'field-help success';
    }
}

function updatePasswordValidation() {
    const password = signupPassword.value;
    const confirmPassword = signupConfirmPassword.value;
    const passwordHelp = signupPassword.parentNode.querySelector('.field-help');
    const confirmHelp = signupConfirmPassword.parentNode.querySelector('.field-help');
    
    // Password strength validation
    if (password.length === 0) {
        clearFieldValidation(signupPassword);
        passwordHelp.textContent = 'Must be at least 6 characters long';
        passwordHelp.className = 'field-help';
    } else if (password.length < 6) {
        setFieldValidation(signupPassword, false);
        passwordHelp.textContent = `Password too short (${password.length}/6 characters)`;
        passwordHelp.className = 'field-help error';
    } else {
        setFieldValidation(signupPassword, true);
        const strength = getPasswordStrength(password);
        passwordHelp.textContent = `Password strength: ${strength}`;
        passwordHelp.className = `field-help ${strength.toLowerCase() === 'weak' ? 'warning' : 'success'}`;
    }
    
    // Password confirmation validation
    if (confirmPassword.length === 0) {
        clearFieldValidation(signupConfirmPassword);
        confirmHelp.textContent = 'Re-enter your password to confirm';
        confirmHelp.className = 'field-help';
    } else if (password !== confirmPassword) {
        setFieldValidation(signupConfirmPassword, false);
        confirmHelp.textContent = 'Passwords do not match';
        confirmHelp.className = 'field-help error';
    } else if (password === confirmPassword && password.length >= 6) {
        setFieldValidation(signupConfirmPassword, true);
        confirmHelp.textContent = 'Passwords match!';
        confirmHelp.className = 'field-help success';
    }
}

function getPasswordStrength(password) {
    let score = 0;
    if (password.length >= 8) score++;
    if (/[a-z]/.test(password)) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;
    
    if (score < 2) return 'Weak';
    if (score < 4) return 'Medium';
    return 'Strong';
}

function setFieldValidation(field, isValid) {
    field.classList.remove('valid', 'invalid');
    field.classList.add(isValid ? 'valid' : 'invalid');
}

function clearFieldValidation(field) {
    field.classList.remove('valid', 'invalid');
}

async function signInWithGoogle() {
    try {
        const provider = new GoogleAuthProvider();
        const result = await signInWithPopup(auth, provider);
        // For Google users, set a default stream or prompt for stream selection
        await createUserDocument(result.user, 'central');
        showSuccess('Successfully signed in with Google!');
    } catch (error) {
        console.error('Google sign in failed:', error);
        if (error.code !== 'auth/popup-closed-by-user') {
            showError('Failed to sign in with Google. Please try again.');
        }
    }
}

async function createUserDocument(user, stream = 'central') {
    try {
        const userRef = doc(db, 'users', user.uid);
        const userDoc = await getDoc(userRef);
        
        if (!userDoc.exists()) {
            await setDoc(userRef, {
                displayName: user.displayName || 'Anonymous',
                email: user.email,
                photoURL: user.photoURL || '',
                stream: stream,
                following: [],
                followers: [],
                createdAt: serverTimestamp()
            });
        }
    } catch (error) {
        console.error('Failed to create user document:', error);
    }
}

async function signOutUser() {
    try {
        await signOut(auth);
    } catch (error) {
        console.error('Sign out failed:', error);
        showError('Failed to sign out. Please try again.');
    }
}

// Setup auth state listener
function setupAuthStateListener() {
    onAuthStateChanged(auth, (user) => {
        if (user) {
            currentUser = user;
            setupUserInterface();
            showMainScreen();
            loadPosts();
            loadUsers();
        } else {
            currentUser = null;
            showLoginScreen();
            cleanup();
        }
    });
}

// UI setup functions
async function setupUserInterface() {
    if (!currentUser) return;
    
    userAvatar.src = currentUser.photoURL || '';
    composerAvatar.src = currentUser.photoURL || '';
    userName.textContent = currentUser.displayName || 'User';
    
    // Load user's following list and stream info
    await loadUserFollowing();
    await loadUserStream();
    
    // Update character count
    updateCharCount();
}

async function loadUserFollowing() {
    try {
        const userRef = doc(db, 'users', currentUser.uid);
        const userDoc = await getDoc(userRef);
        
        if (userDoc.exists()) {
            userFollowing = userDoc.data().following || [];
            followingCount.textContent = userFollowing.length;
        }
    } catch (error) {
        console.error('Failed to load following list:', error);
    }
}

async function loadUserStream() {
    try {
        const userRef = doc(db, 'users', currentUser.uid);
        const userDoc = await getDoc(userRef);
        
        if (userDoc.exists()) {
            const userData = userDoc.data();
            const streamName = userData.stream || 'central';
            const streamEmojis = {
                central: '🏛️',
                north: '🏔️',
                east: '🌅',
                west: '🌄',
                south: '🏖️'
            };
            
            userStream.textContent = `${streamEmojis[streamName]} ${streamName.charAt(0).toUpperCase() + streamName.slice(1)}`;
            userStream.style.display = 'inline-block';
        }
    } catch (error) {
        console.error('Failed to load user stream:', error);
    }
}

function showLoginScreen() {
    loginScreen.style.display = 'block';
    mainScreen.style.display = 'none';
}

function showMainScreen() {
    loginScreen.style.display = 'none';
    mainScreen.style.display = 'block';
}

// Post functions
function updateCharCount() {
    const remaining = 500 - postContent.value.length;
    charCount.textContent = remaining;
    charCount.style.color = remaining < 50 ? '#ff4444' : '#888';
    
    postBtn.disabled = postContent.value.trim().length === 0 || remaining < 0;
}

function handlePostKeydown(e) {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        if (!postBtn.disabled) {
            createPost();
        }
    }
}

async function createPost() {
    if (!currentUser || !postContent.value.trim()) return;
    
    try {
        postBtn.disabled = true;
        postBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Posting...';
        
        await addDoc(collection(db, 'posts'), {
            content: postContent.value.trim(),
            authorId: currentUser.uid,
            authorName: currentUser.displayName,
            authorAvatar: currentUser.photoURL,
            timestamp: serverTimestamp(),
            likes: 0,
            likedBy: []
        });
        
        postContent.value = '';
        updateCharCount();
        showSuccess('Post created successfully!');
        
    } catch (error) {
        console.error('Failed to create post:', error);
        showError('Failed to create post. Please try again.');
    } finally {
        postBtn.disabled = false;
        postBtn.innerHTML = '<i class="fas fa-paper-plane"></i> Post';
    }
}

// Load and display posts
function loadPosts() {
    if (unsubscribePosts) {
        unsubscribePosts();
    }
    
    const postsQuery = query(
        collection(db, 'posts'),
        orderBy('timestamp', 'desc'),
        limit(50)
    );
    
    unsubscribePosts = onSnapshot(postsQuery, (snapshot) => {
        const posts = [];
        snapshot.forEach((doc) => {
            posts.push({ id: doc.id, ...doc.data() });
        });
        
        displayPosts(posts);
    }, (error) => {
        console.error('Failed to load posts:', error);
        showError('Failed to load posts. Please refresh the page.');
    });
}

function displayPosts(posts) {
    if (posts.length === 0) {
        postsContainer.innerHTML = `
            <div class="no-posts">
                <i class="fas fa-comments" style="font-size: 3rem; color: #333; margin-bottom: 20px;"></i>
                <h3>No posts yet</h3>
                <p>Be the first to share something!</p>
            </div>
        `;
        return;
    }
    
    const postsHTML = posts.map(post => createPostHTML(post)).join('');
    postsContainer.innerHTML = postsHTML;
    
    // Setup like buttons
    posts.forEach(post => {
        const likeBtn = document.getElementById(`like-${post.id}`);
        if (likeBtn) {
            likeBtn.addEventListener('click', () => toggleLike(post.id, post.likedBy || []));
        }
        
        const messageBtn = document.getElementById(`message-${post.id}`);
        if (messageBtn) {
            messageBtn.addEventListener('click', () => openChatWithUser(post.authorId, post.authorName));
        }
    });
}

function createPostHTML(post) {
    const timestamp = post.timestamp ? new Date(post.timestamp.toDate()).toLocaleString() : 'Just now';
    const isLiked = post.likedBy && post.likedBy.includes(currentUser.uid);
    const canMessage = post.authorId !== currentUser.uid;
    
    return `
        <div class="post">
            <div class="post-header">
                <img src="${post.authorAvatar || ''}" alt="${post.authorName}" class="user-avatar">
                <div>
                    <div class="post-author">${post.authorName || 'Anonymous'}</div>
                    <div class="post-time">${timestamp}</div>
                </div>
            </div>
            <div class="post-content">${escapeHtml(post.content || '')}</div>
            <div class="post-actions">
                <button id="like-${post.id}" class="post-action ${isLiked ? 'liked' : ''}">
                    <i class="fas fa-heart"></i>
                    <span>${post.likes || 0}</span>
                </button>
                ${canMessage ? `
                    <button id="message-${post.id}" class="post-action">
                        <i class="fas fa-paper-plane"></i>
                        Message
                    </button>
                ` : ''}
            </div>
        </div>
    `;
}

async function toggleLike(postId, likedBy) {
    if (!currentUser) return;
    
    try {
        const postRef = doc(db, 'posts', postId);
        const isLiked = likedBy.includes(currentUser.uid);
        
        if (isLiked) {
            // Unlike
            await updateDoc(postRef, {
                likes: increment(-1),
                likedBy: likedBy.filter(uid => uid !== currentUser.uid)
            });
        } else {
            // Like
            await updateDoc(postRef, {
                likes: increment(1),
                likedBy: [...likedBy, currentUser.uid]
            });
        }
    } catch (error) {
        console.error('Failed to toggle like:', error);
        showError('Failed to update like. Please try again.');
    }
}

// Profile functions
function openProfileModal() {
    profileModal.style.display = 'flex';
    loadProfileData();
    showProfileTab('followers');
}

function closeProfileModal() {
    profileModal.style.display = 'none';
}

function showProfileTab(tab) {
    // Update active tab
    document.querySelectorAll('.profile-tab').forEach(tabEl => {
        tabEl.classList.remove('active');
    });
    document.querySelectorAll('.profile-tab-content').forEach(content => {
        content.classList.remove('active');
    });
    
    // Show selected tab
    document.querySelector(`[data-tab="${tab}"]`).classList.add('active');
    document.getElementById(`${tab}-content`).classList.add('active');
    
    // Load content based on tab
    switch(tab) {
        case 'followers':
            loadFollowers();
            break;
        case 'posts':
            loadUserPosts();
            break;
        case 'activity':
            loadActivityStats();
            break;
    }
}

async function loadProfileData() {
    if (!currentUser) return;
    
    try {
        // Set basic profile info
        profileAvatar.src = currentUser.photoURL || '';
        profileName.textContent = currentUser.displayName || 'User';
        profileEmail.textContent = currentUser.email || '';
        
        // Load user document for additional info
        const userRef = doc(db, 'users', currentUser.uid);
        const userDoc = await getDoc(userRef);
        
        if (userDoc.exists()) {
            const userData = userDoc.data();
            const streamName = userData.stream || 'central';
            const streamEmojis = {
                central: '🏛️',
                north: '🏔️',
                east: '🌅',
                west: '🌄',
                south: '🏖️'
            };
            
            profileStreamInfo.textContent = `${streamEmojis[streamName]} ${streamName.charAt(0).toUpperCase() + streamName.slice(1)} Stream`;
            
            // Update counts
            const followingCount = userData.following ? userData.following.length : 0;
            const followersCount = userData.followers ? userData.followers.length : 0;
            
            profileFollowingCount.textContent = followingCount;
            profileFollowersCount.textContent = followersCount;
            
            // Format member since date
            if (userData.createdAt) {
                const createdDate = new Date(userData.createdAt.toDate());
                memberSince.textContent = createdDate.toLocaleDateString('en-US', { 
                    month: 'short', 
                    year: 'numeric' 
                });
            }
        }
        
        // Load posts count
        await loadPostsCount();
        
    } catch (error) {
        console.error('Failed to load profile data:', error);
    }
}

async function loadFollowers() {
    try {
        followersList.innerHTML = '<div class="loading-users"><i class="fas fa-spinner fa-spin"></i> Loading your followers...</div>';
        
        const userRef = doc(db, 'users', currentUser.uid);
        const userDoc = await getDoc(userRef);
        
        if (!userDoc.exists()) {
            followersList.innerHTML = '<div class="loading-users">No followers data found</div>';
            return;
        }
        
        const userData = userDoc.data();
        const followersIds = userData.followers || [];
        
        if (followersIds.length === 0) {
            followersList.innerHTML = `
                <div class="no-followers">
                    <i class="fas fa-heart" style="font-size: 3rem; color: #666; margin-bottom: 15px;"></i>
                    <h4>No followers yet</h4>
                    <p>When people follow you, they'll appear here. Keep posting great content to attract followers!</p>
                </div>
            `;
            return;
        }
        
        // Load follower details
        const followers = [];
        for (const followerId of followersIds) {
            const followerRef = doc(db, 'users', followerId);
            const followerDoc = await getDoc(followerRef);
            if (followerDoc.exists()) {
                followers.push({ id: followerId, ...followerDoc.data() });
            }
        }
        
        displayFollowers(followers);
        
    } catch (error) {
        console.error('Failed to load followers:', error);
        followersList.innerHTML = '<div class="loading-users">Failed to load followers</div>';
    }
}

function displayFollowers(followers) {
    const streamEmojis = {
        central: '🏛️',
        north: '🏔️',
        east: '🌅',
        west: '🌄',
        south: '🏖️'
    };
    
    const followersHTML = followers.map(follower => {
        const isFollowing = userFollowing.includes(follower.id);
        return `
            <div class="user-item">
                <div class="user-info">
                    <img src="${follower.photoURL || ''}" alt="${follower.displayName}" class="user-avatar">
                    <div>
                        <div>${follower.displayName || 'Anonymous'}</div>
                        <div style="font-size: 0.8rem; color: #888;">${streamEmojis[follower.stream]} ${follower.stream ? follower.stream.charAt(0).toUpperCase() + follower.stream.slice(1) : 'Central'}</div>
                    </div>
                </div>
                <div class="user-actions">
                    <button class="btn follow-btn ${isFollowing ? 'following' : ''}" onclick="toggleFollow('${follower.id}', '${follower.displayName}')">
                        ${isFollowing ? 'Unfollow' : 'Follow'}
                    </button>
                    <button class="btn btn-icon" onclick="openChatWithUser('${follower.id}', '${follower.displayName}')">
                        <i class="fas fa-paper-plane"></i>
                    </button>
                </div>
            </div>
        `;
    }).join('');
    
    followersList.innerHTML = followersHTML;
}

async function loadUserPosts() {
    try {
        userPostsList.innerHTML = '<div class="loading-posts"><i class="fas fa-spinner fa-spin"></i> Loading your posts...</div>';
        
        const postsQuery = query(
            collection(db, 'posts'),
            where('authorId', '==', currentUser.uid),
            orderBy('timestamp', 'desc'),
            limit(50)
        );
        
        const snapshot = await getDocs(postsQuery);
        const posts = [];
        
        snapshot.forEach((doc) => {
            posts.push({ id: doc.id, ...doc.data() });
        });
        
        if (posts.length === 0) {
            userPostsList.innerHTML = `
                <div class="no-posts">
                    <i class="fas fa-pen" style="font-size: 3rem; color: #666; margin-bottom: 15px;"></i>
                    <h4>No posts yet</h4>
                    <p>You haven't posted anything yet. Share your thoughts to get started!</p>
                </div>
            `;
            return;
        }
        
        displayUserPosts(posts);
        
    } catch (error) {
        console.error('Failed to load user posts:', error);
        userPostsList.innerHTML = '<div class="loading-posts">Failed to load your posts</div>';
    }
}

function displayUserPosts(posts) {
    const postsHTML = posts.map(post => {
        const timestamp = post.timestamp ? new Date(post.timestamp.toDate()).toLocaleString() : '';
        return `
            <div class="post">
                <div class="post-header">
                    <img src="${post.authorAvatar || ''}" alt="${post.authorName}" class="user-avatar">
                    <div class="post-info">
                        <span class="post-author">${post.authorName || 'Anonymous'}</span>
                        <span class="post-time">${timestamp}</span>
                    </div>
                </div>
                <div class="post-content">${escapeHtml(post.content)}</div>
                <div class="post-actions">
                    <button class="action-btn like-btn" onclick="likePost('${post.id}')">
                        <i class="fas fa-heart"></i>
                        <span>${post.likes || 0}</span>
                    </button>
                </div>
            </div>
        `;
    }).join('');
    
    userPostsList.innerHTML = postsHTML;
}

async function loadPostsCount() {
    try {
        const postsQuery = query(
            collection(db, 'posts'),
            where('authorId', '==', currentUser.uid)
        );
        
        const snapshot = await getDocs(postsQuery);
        profilePostsCount.textContent = snapshot.size;
        
    } catch (error) {
        console.error('Failed to load posts count:', error);
        profilePostsCount.textContent = '0';
    }
}

async function loadActivityStats() {
    try {
        // Load total posts
        const postsQuery = query(
            collection(db, 'posts'),
            where('authorId', '==', currentUser.uid)
        );
        const postsSnapshot = await getDocs(postsQuery);
        const userPosts = [];
        let totalLikes = 0;
        
        postsSnapshot.forEach((doc) => {
            const post = doc.data();
            userPosts.push(post);
            totalLikes += post.likes || 0;
        });
        
        totalPosts.textContent = userPosts.length;
        totalLikesReceived.textContent = totalLikes;
        
        // Calculate engagement rate
        const avgLikesPerPost = userPosts.length > 0 ? (totalLikes / userPosts.length).toFixed(1) : 0;
        engagementRate.textContent = `${avgLikesPerPost} avg`;
        
    } catch (error) {
        console.error('Failed to load activity stats:', error);
        totalPosts.textContent = '0';
        totalLikesReceived.textContent = '0';
        engagementRate.textContent = '0%';
    }
}

// Stream functions
function openStreamsModal() {
    streamsModal.style.display = 'flex';
    showStreamTab(currentStreamTab);
}

function closeStreamsModal() {
    streamsModal.style.display = 'none';
}

function showStreamTab(stream) {
    // Update active tab
    document.querySelectorAll('.stream-tab').forEach(tab => {
        tab.classList.remove('active');
    });
    document.querySelector(`[data-stream="${stream}"]`).classList.add('active');
    
    currentStreamTab = stream;
    loadStreamUsers(stream);
}

async function loadStreamUsers(stream) {
    try {
        streamUsersList.innerHTML = '<div class="loading-users"><i class="fas fa-spinner fa-spin"></i> Loading stream users...</div>';
        
        const usersQuery = query(
            collection(db, 'users'),
            where('stream', '==', stream)
        );
        const snapshot = await getDocs(usersQuery);
        
        const users = [];
        snapshot.forEach((doc) => {
            const userData = { id: doc.id, ...doc.data() };
            if (userData.id !== currentUser.uid) {
                users.push(userData);
            }
        });
        
        displayStreamUsers(users, stream);
    } catch (error) {
        console.error('Failed to load stream users:', error);
        streamUsersList.innerHTML = '<div class="loading-users">Failed to load users from this stream</div>';
    }
}

function displayStreamUsers(users, stream) {
    const streamEmojis = {
        central: '🏛️',
        north: '🏔️',
        east: '🌅',
        west: '🌄',
        south: '🏖️'
    };
    
    if (users.length === 0) {
        streamUsersList.innerHTML = `<div class="loading-users">No other users found in ${streamEmojis[stream]} ${stream.charAt(0).toUpperCase() + stream.slice(1)} stream</div>`;
        return;
    }
    
    const usersHTML = users.map(user => {
        const isFollowing = userFollowing.includes(user.id);
        return `
            <div class="user-item">
                <div class="user-info">
                    <img src="${user.photoURL || ''}" alt="${user.displayName}" class="user-avatar">
                    <div>
                        <div>${user.displayName || 'Anonymous'}</div>
                        <div style="font-size: 0.8rem; color: #888;">${streamEmojis[user.stream]} ${user.stream ? user.stream.charAt(0).toUpperCase() + user.stream.slice(1) : 'Central'}</div>
                    </div>
                </div>
                <div class="user-actions">
                    <button class="btn follow-btn ${isFollowing ? 'following' : ''}" onclick="toggleFollow('${user.id}', '${user.displayName}')">
                        ${isFollowing ? 'Unfollow' : 'Follow'}
                    </button>
                    <button class="btn btn-icon" onclick="openChatWithUser('${user.id}', '${user.displayName}')">
                        <i class="fas fa-paper-plane"></i>
                    </button>
                </div>
            </div>
        `;
    }).join('');
    
    streamUsersList.innerHTML = usersHTML;
}

// Following functions
function showFollowingTab(tab) {
    if (tab === 'discover') {
        discoverTab.classList.add('active');
        followingListTab.classList.remove('active');
        discoverUsers.style.display = 'block';
        followingList.style.display = 'none';
    } else {
        followingListTab.classList.add('active');
        discoverTab.classList.remove('active');
        followingList.style.display = 'block';
        discoverUsers.style.display = 'none';
    }
}

function openFollowingModal() {
    followingModal.style.display = 'flex';
    loadDiscoverUsers();
    loadFollowingUsers();
}

function closeFollowingModal() {
    followingModal.style.display = 'none';
}

async function loadDiscoverUsers() {
    try {
        discoverUsersList.innerHTML = '<div class="loading-users"><i class="fas fa-spinner fa-spin"></i> Loading users...</div>';
        
        const usersQuery = query(collection(db, 'users'));
        const snapshot = await getDocs(usersQuery);
        
        const users = [];
        snapshot.forEach((doc) => {
            const userData = { id: doc.id, ...doc.data() };
            if (userData.id !== currentUser.uid) {
                users.push(userData);
            }
        });
        
        displayDiscoverUsers(users);
    } catch (error) {
        console.error('Failed to load users:', error);
        discoverUsersList.innerHTML = '<div class="loading-users">Failed to load users</div>';
    }
}

async function loadFollowingUsers() {
    try {
        followingUsersList.innerHTML = '<div class="loading-users"><i class="fas fa-spinner fa-spin"></i> Loading following...</div>';
        
        if (userFollowing.length === 0) {
            followingUsersList.innerHTML = '<div class="loading-users">You are not following anyone yet</div>';
            return;
        }
        
        const followingUsersData = [];
        for (const userId of userFollowing) {
            const userRef = doc(db, 'users', userId);
            const userDoc = await getDoc(userRef);
            if (userDoc.exists()) {
                followingUsersData.push({ id: userId, ...userDoc.data() });
            }
        }
        
        displayFollowingUsers(followingUsersData);
    } catch (error) {
        console.error('Failed to load following users:', error);
        followingUsersList.innerHTML = '<div class="loading-users">Failed to load following</div>';
    }
}

function displayDiscoverUsers(users) {
    if (users.length === 0) {
        discoverUsersList.innerHTML = '<div class="loading-users">No other users found</div>';
        return;
    }
    
    const usersHTML = users.map(user => {
        const isFollowing = userFollowing.includes(user.id);
        return `
            <div class="user-item">
                <div class="user-info">
                    <img src="${user.photoURL || ''}" alt="${user.displayName}" class="user-avatar">
                    <span>${user.displayName || 'Anonymous'}</span>
                </div>
                <div class="user-actions">
                    <button class="btn follow-btn ${isFollowing ? 'following' : ''}" onclick="toggleFollow('${user.id}', '${user.displayName}')">
                        ${isFollowing ? 'Unfollow' : 'Follow'}
                    </button>
                    <button class="btn btn-icon" onclick="openChatWithUser('${user.id}', '${user.displayName}')">
                        <i class="fas fa-paper-plane"></i>
                    </button>
                </div>
            </div>
        `;
    }).join('');
    
    discoverUsersList.innerHTML = usersHTML;
}

function displayFollowingUsers(users) {
    if (users.length === 0) {
        followingUsersList.innerHTML = '<div class="loading-users">You are not following anyone yet</div>';
        return;
    }
    
    const usersHTML = users.map(user => `
        <div class="user-item">
            <div class="user-info">
                <img src="${user.photoURL || ''}" alt="${user.displayName}" class="user-avatar">
                <span>${user.displayName || 'Anonymous'}</span>
            </div>
            <div class="user-actions">
                <button class="btn follow-btn following" onclick="toggleFollow('${user.id}', '${user.displayName}')">
                    Unfollow
                </button>
                <button class="btn btn-icon" onclick="openChatWithUser('${user.id}', '${user.displayName}')">
                    <i class="fas fa-paper-plane"></i>
                </button>
            </div>
        </div>
    `).join('');
    
    followingUsersList.innerHTML = usersHTML;
}

async function toggleFollow(userId, userName) {
    if (!currentUser) return;
    
    try {
        const currentUserRef = doc(db, 'users', currentUser.uid);
        const targetUserRef = doc(db, 'users', userId);
        
        const isFollowing = userFollowing.includes(userId);
        
        if (isFollowing) {
            // Unfollow
            await updateDoc(currentUserRef, {
                following: arrayRemove(userId)
            });
            await updateDoc(targetUserRef, {
                followers: arrayRemove(currentUser.uid)
            });
            userFollowing = userFollowing.filter(id => id !== userId);
            showSuccess(`Unfollowed ${userName}`);
        } else {
            // Follow
            await updateDoc(currentUserRef, {
                following: arrayUnion(userId)
            });
            await updateDoc(targetUserRef, {
                followers: arrayUnion(currentUser.uid)
            });
            userFollowing.push(userId);
            showSuccess(`Now following ${userName}`);
        }
        
        followingCount.textContent = userFollowing.length;
        loadDiscoverUsers();
        loadFollowingUsers();
        
    } catch (error) {
        console.error('Failed to toggle follow:', error);
        showError('Failed to update follow status. Please try again.');
    }
}

// Messaging functions
async function loadUsers() {
    try {
        const usersQuery = query(collection(db, 'posts'));
        const snapshot = await getDocs(usersQuery);
        
        const users = new Map();
        snapshot.forEach((doc) => {
            const post = doc.data();
            if (post.authorId && post.authorId !== currentUser.uid) {
                users.set(post.authorId, {
                    id: post.authorId,
                    name: post.authorName,
                    avatar: post.authorAvatar
                });
            }
        });
        
        displayUsers(Array.from(users.values()));
    } catch (error) {
        console.error('Failed to load users:', error);
        usersList.innerHTML = '<div class="loading-users">Failed to load users</div>';
    }
}

function displayUsers(users) {
    if (users.length === 0) {
        usersList.innerHTML = '<div class="loading-users">No other users found</div>';
        return;
    }
    
    const usersHTML = users.map(user => `
        <div class="user-item" onclick="openChatWithUser('${user.id}', '${user.name}')">
            <img src="${user.avatar || ''}" alt="${user.name}" class="user-avatar">
            <span>${user.name || 'Anonymous'}</span>
        </div>
    `).join('');
    
    usersList.innerHTML = usersHTML;
}

function openMessagesModal() {
    messagesModal.style.display = 'flex';
    loadUsers();
}

function closeMessagesModal() {
    messagesModal.style.display = 'none';
}

function openChatWithUser(userId, userName) {
    currentChatUser = { id: userId, name: userName };
    chatTitle.innerHTML = `<i class="fas fa-comments"></i> Chat with ${userName}`;
    
    closeMessagesModal();
    chatModal.style.display = 'flex';
    
    loadChatMessages(userId);
    messageInput.focus();
}

function closeChatModal() {
    chatModal.style.display = 'none';
    if (unsubscribeMessages) {
        unsubscribeMessages();
    }
    currentChatUser = null;
}

function loadChatMessages(userId) {
    if (unsubscribeMessages) {
        unsubscribeMessages();
    }
    
    const messagesQuery = query(
        collection(db, 'messages'),
        where('participants', 'array-contains', currentUser.uid),
        orderBy('timestamp', 'asc'),
        limit(100)
    );
    
    unsubscribeMessages = onSnapshot(messagesQuery, (snapshot) => {
        const messages = [];
        snapshot.forEach((doc) => {
            const message = { id: doc.id, ...doc.data() };
            if (message.participants.includes(userId)) {
                messages.push(message);
            }
        });
        
        displayChatMessages(messages);
    }, (error) => {
        console.error('Failed to load messages:', error);
        showError('Failed to load messages.');
    });
}

function displayChatMessages(messages) {
    if (messages.length === 0) {
        chatMessages.innerHTML = '<div class="no-messages">No messages yet. Start the conversation!</div>';
        return;
    }
    
    const messagesHTML = messages.map(message => {
        const isOwn = message.senderId === currentUser.uid;
        const timestamp = message.timestamp ? new Date(message.timestamp.toDate()).toLocaleString() : '';
        
        return `
            <div class="message ${isOwn ? 'own' : ''}">
                <div class="message-content">
                    ${escapeHtml(message.content)}
                    <div class="message-time">${timestamp}</div>
                </div>
            </div>
        `;
    }).join('');
    
    chatMessages.innerHTML = messagesHTML;
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

function handleMessageKeydown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
    }
}

async function sendMessage() {
    if (!currentUser || !currentChatUser || !messageInput.value.trim()) return;
    
    try {
        sendMessageBtn.disabled = true;
        sendMessageBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
        
        await addDoc(collection(db, 'messages'), {
            content: messageInput.value.trim(),
            senderId: currentUser.uid,
            senderName: currentUser.displayName,
            participants: [currentUser.uid, currentChatUser.id],
            timestamp: serverTimestamp()
        });
        
        messageInput.value = '';
        
    } catch (error) {
        console.error('Failed to send message:', error);
        showError('Failed to send message. Please try again.');
    } finally {
        sendMessageBtn.disabled = false;
        sendMessageBtn.innerHTML = '<i class="fas fa-paper-plane"></i>';
    }
}

// Utility functions
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function showError(message) {
    errorMessage.textContent = message;
    errorToast.style.display = 'flex';
    setTimeout(hideErrorToast, 5000);
}

function hideErrorToast() {
    errorToast.style.display = 'none';
}

function showSuccess(message) {
    successMessage.textContent = message;
    successToast.style.display = 'flex';
    setTimeout(hideSuccessToast, 3000);
}

function hideSuccessToast() {
    successToast.style.display = 'none';
}

function cleanup() {
    if (unsubscribePosts) {
        unsubscribePosts();
        unsubscribePosts = null;
    }
    if (unsubscribeMessages) {
        unsubscribeMessages();
        unsubscribeMessages = null;
    }
}

// Make functions available globally for onclick handlers
window.openChatWithUser = openChatWithUser;
window.toggleFollow = toggleFollow;
