// Messages System - Stores messages locally, fetches user info from Supabase
class MessagesManager {
    constructor() {
        this.currentUser = null;
        this.currentConversation = null;
        this.allUsers = [];
        this.init();
    }

    async init() {
        // Check if user is logged in
        this.currentUser = SessionManager.getCurrentUser();
        if (!this.currentUser) {
            window.location.href = 'landingPage.html';
            return;
        }

        // Load all users from Supabase for recipient selection
        await this.loadUsers();

        // Setup event listeners
        this.setupEventListeners();

        // Load and display conversations
        this.loadConversations();

        // Setup logout
        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => {
                SessionManager.clearCurrentUser();
                window.location.href = 'landingPage.html';
            });
        }
    }

    async loadUsers() {
        try {
            // Fetch all users from Supabase
            const { data, error } = await supabase
                .from('users')
                .select('email, full_name')
                .order('full_name');

            if (error) throw error;

            this.allUsers = data || [];
            this.populateRecipientSelect();
        } catch (error) {
            console.error('Error loading users:', error);
            this.allUsers = [];
        }
    }

    populateRecipientSelect() {
        const select = document.getElementById('recipientSelect');
        if (!select) return;

        // Clear existing options except the first one
        select.innerHTML = '<option value="">Choose a user...</option>';

        // Add users (excluding current user)
        this.allUsers.forEach(user => {
            if (user.email !== this.currentUser.email) {
                const option = document.createElement('option');
                option.value = user.email;
                option.textContent = `${user.full_name} (${user.email})`;
                select.appendChild(option);
            }
        });
    }

    setupEventListeners() {
        // New message button
        const newMessageBtn = document.getElementById('newMessageBtn');
        if (newMessageBtn) {
            newMessageBtn.addEventListener('click', () => {
                document.getElementById('newMessageModal').style.display = 'block';
            });
        }

        // Close modal
        const closeModal = document.getElementById('closeNewMessageModal');
        if (closeModal) {
            closeModal.addEventListener('click', () => {
                document.getElementById('newMessageModal').style.display = 'none';
            });
        }

        // Close modal when clicking outside
        window.addEventListener('click', (e) => {
            const modal = document.getElementById('newMessageModal');
            if (e.target === modal) {
                modal.style.display = 'none';
            }
        });

        // Start conversation
        const startBtn = document.getElementById('startConversationBtn');
        const recipientSelect = document.getElementById('recipientSelect');
        
        if (recipientSelect) {
            recipientSelect.addEventListener('change', (e) => {
                if (startBtn) {
                    startBtn.disabled = !e.target.value;
                }
            });
        }

        if (startBtn) {
            startBtn.addEventListener('click', () => {
                const recipientEmail = recipientSelect.value;
                if (recipientEmail) {
                    this.openConversation(recipientEmail);
                    document.getElementById('newMessageModal').style.display = 'none';
                    recipientSelect.value = '';
                    if (startBtn) startBtn.disabled = true;
                }
            });
        }
    }

    getMessages() {
        const messages = localStorage.getItem('messages');
        return messages ? JSON.parse(messages) : [];
    }

    saveMessages(messages) {
        localStorage.setItem('messages', JSON.stringify(messages));
    }

    async sendMessage() {
        const messageInput = document.getElementById('messageInput');
        if (!messageInput || !this.currentConversation) return;

        const content = messageInput.value.trim();
        if (!content) return;

        const messages = this.getMessages();
        const newMessage = {
            id: Date.now() + Math.random(),
            from: this.currentUser.email,
            to: this.currentConversation,
            content: content,
            timestamp: new Date().toISOString(),
            read: false
        };

        messages.push(newMessage);
        this.saveMessages(messages);

        // Clear input
        messageInput.value = '';

        // Reload conversations and chat
        this.loadConversations();
        this.loadChat(this.currentConversation);
    }

    loadConversations() {
        const messages = this.getMessages();
        const conversationsList = document.getElementById('conversationsList');
        if (!conversationsList) return;

        // Get unique conversation partners
        const partners = new Set();
        messages.forEach(msg => {
            if (msg.from === this.currentUser.email) {
                partners.add(msg.to);
            } else if (msg.to === this.currentUser.email) {
                partners.add(msg.from);
            }
        });

        if (partners.size === 0) {
            conversationsList.innerHTML = '<div class="no-conversations">No conversations yet. Start a new one!</div>';
            return;
        }

        // Create conversation items
        const conversationItems = Array.from(partners).map(partnerEmail => {
            // Get last message with this partner
            const conversationMessages = messages
                .filter(msg => 
                    (msg.from === this.currentUser.email && msg.to === partnerEmail) ||
                    (msg.to === this.currentUser.email && msg.from === partnerEmail)
                )
                .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

            const lastMessage = conversationMessages[0];
            const unreadCount = conversationMessages.filter(msg => 
                msg.to === this.currentUser.email && !msg.read
            ).length;

            // Get user name from Supabase data or email
            const user = this.allUsers.find(u => u.email === partnerEmail);
            const userName = user ? user.full_name : partnerEmail;

            return {
                email: partnerEmail,
                name: userName,
                lastMessage: lastMessage,
                unreadCount: unreadCount,
                timestamp: lastMessage.timestamp
            };
        }).sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

        // Render conversations
        conversationsList.innerHTML = conversationItems.map(conv => {
            const timeAgo = this.getTimeAgo(new Date(conv.timestamp));
            const preview = conv.lastMessage.content.length > 50 
                ? conv.lastMessage.content.substring(0, 50) + '...' 
                : conv.lastMessage.content;
            
            const isActive = this.currentConversation === conv.email ? 'active' : '';
            
            return `
                <div class="conversation-item ${isActive}" data-email="${conv.email}">
                    <div class="conversation-avatar">
                        <i class="fas fa-user"></i>
                    </div>
                    <div class="conversation-info">
                        <div class="conversation-header">
                            <span class="conversation-name">${conv.name}</span>
                            <span class="conversation-time">${timeAgo}</span>
                        </div>
                        <div class="conversation-preview">
                            <span class="preview-text">${preview}</span>
                            ${conv.unreadCount > 0 ? `<span class="unread-badge">${conv.unreadCount}</span>` : ''}
                        </div>
                    </div>
                </div>
            `;
        }).join('');

        // Add click listeners
        conversationsList.querySelectorAll('.conversation-item').forEach(item => {
            item.addEventListener('click', () => {
                const email = item.getAttribute('data-email');
                this.openConversation(email);
            });
        });
    }

    openConversation(partnerEmail) {
        this.currentConversation = partnerEmail;
        this.loadChat(partnerEmail);
        this.loadConversations(); // Refresh to update active state
        this.markAsRead(partnerEmail);
    }

    async loadChat(partnerEmail) {
        const chatPanel = document.getElementById('chatPanel');
        if (!chatPanel) return;

        // Get user info
        const user = this.allUsers.find(u => u.email === partnerEmail);
        const userName = user ? user.full_name : partnerEmail;

        // Get messages with this partner
        const messages = this.getMessages();
        const conversationMessages = messages
            .filter(msg => 
                (msg.from === this.currentUser.email && msg.to === partnerEmail) ||
                (msg.to === this.currentUser.email && msg.from === partnerEmail)
            )
            .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

        // Render chat interface
        chatPanel.innerHTML = `
            <div class="chat-header">
                <div class="chat-partner-info">
                    <div class="chat-avatar">
                        <i class="fas fa-user"></i>
                    </div>
                    <div>
                        <h3>${userName}</h3>
                        <p class="chat-email">${partnerEmail}</p>
                    </div>
                </div>
            </div>
            <div class="chat-messages" id="chatMessages">
                ${conversationMessages.length === 0 ? 
                    '<div class="no-messages">No messages yet. Start the conversation!</div>' :
                    conversationMessages.map(msg => {
                        const isOwn = msg.from === this.currentUser.email;
                        const time = new Date(msg.timestamp).toLocaleTimeString([], { 
                            hour: '2-digit', 
                            minute: '2-digit' 
                        });
                        return `
                            <div class="message ${isOwn ? 'own-message' : 'other-message'}">
                                <div class="message-content">
                                    <p>${this.escapeHtml(msg.content)}</p>
                                    <span class="message-time">${time}</span>
                                </div>
                            </div>
                        `;
                    }).join('')
                }
            </div>
            <div class="chat-input-container">
                <textarea 
                    id="messageInput" 
                    class="chat-input" 
                    placeholder="Type your message..."
                    rows="1"
                ></textarea>
                <button id="sendMessageBtn" class="send-btn">
                    <i class="fas fa-paper-plane"></i>
                </button>
            </div>
        `;

        // Scroll to bottom
        setTimeout(() => {
            const chatMessages = document.getElementById('chatMessages');
            if (chatMessages) {
                chatMessages.scrollTop = chatMessages.scrollHeight;
            }
        }, 100);

        // Re-attach event listeners
        const sendBtn = document.getElementById('sendMessageBtn');
        const messageInput = document.getElementById('messageInput');
        
        if (sendBtn) {
            sendBtn.addEventListener('click', () => this.sendMessage());
        }

        if (messageInput) {
            messageInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    this.sendMessage();
                }
            });

            // Auto-resize textarea
            messageInput.addEventListener('input', function() {
                this.style.height = 'auto';
                this.style.height = (this.scrollHeight) + 'px';
            });
        }
    }

    markAsRead(partnerEmail) {
        const messages = this.getMessages();
        let updated = false;

        messages.forEach(msg => {
            if (msg.to === this.currentUser.email && 
                msg.from === partnerEmail && 
                !msg.read) {
                msg.read = true;
                updated = true;
            }
        });

        if (updated) {
            this.saveMessages(messages);
        }
    }

    getTimeAgo(date) {
        const now = new Date();
        const diff = now - date;
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(diff / 3600000);
        const days = Math.floor(diff / 86400000);

        if (minutes < 1) return 'Just now';
        if (minutes < 60) return `${minutes}m ago`;
        if (hours < 24) return `${hours}h ago`;
        if (days < 7) return `${days}d ago`;
        return date.toLocaleDateString();
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    new MessagesManager();
});

