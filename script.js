// Supabase configuration
const SUPABASE_URL = 'https://mvusbchsponczexuhfuw.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im12dXNiY2hzcG9uY3pleHVoZnV3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg5MDM2NzQsImV4cCI6MjA3NDQ3OTY3NH0.sv1fpNNbakCNwN_spcDR31QddU4qTFyS-X0ZQ_omV08';

// Initialize Supabase
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Make Supabase available globally
window.supabaseClient = supabase;

  document.addEventListener('DOMContentLoaded', function(){
    const $ = (s, el)=> (el||document).querySelector(s);
    
    // Page Navigation
    let currentPage = 'expenses';
    let currentYear = new Date().getFullYear().toString(); // Default to current year
    
    // Add resize listener for responsive grid updates
    window.addEventListener('resize', function() {
      updateGridTemplate();
    });
    
    // Initialize page navigation
    function initPageNavigation() {
      const tabExpenses = $('#tabExpenses');
      const tabIncome = $('#tabIncome');
      const pageExpenses = $('#pageExpenses');
      const pageIncome = $('#pageIncome');
      
      if (tabExpenses && tabIncome && pageExpenses && pageIncome) {
        // Set initial state
        showPage('expenses');
        
        // Add click listeners
        tabExpenses.addEventListener('click', () => showPage('expenses'));
        tabIncome.addEventListener('click', () => showPage('income'));
      }
    }
    
    function showPage(page) {
      const tabExpenses = $('#tabExpenses');
      const tabIncome = $('#tabIncome');
      const pageExpenses = $('#pageExpenses');
      const pageIncome = $('#pageIncome');
      const yearTabsContainer = $('#yearTabsContainer');
      
      if (page === 'expenses') {
        tabExpenses?.classList.add('active');
        tabIncome?.classList.remove('active');
        pageExpenses?.style.setProperty('display', 'block');
        pageIncome?.style.setProperty('display', 'none');
        yearTabsContainer?.style.setProperty('display', 'none');
        currentPage = 'expenses';
      } else if (page === 'income') {
        tabExpenses?.classList.remove('active');
        tabIncome?.classList.add('active');
        pageExpenses?.style.setProperty('display', 'none');
        pageIncome?.style.setProperty('display', 'block');
        yearTabsContainer?.style.setProperty('display', 'flex');
        currentPage = 'income';
        
        // Ensure current year is selected when switching to income page
        ensureCurrentYearSelected();
        
        // Apply lock state to income page elements
        updateInputsLockState();
      }
    }
    
    // Ensure current year is selected
    function ensureCurrentYearSelected() {
      const currentYearString = new Date().getFullYear().toString();
      const currentYearTab = document.querySelector(`[data-year="${currentYearString}"]`);
      
      if (currentYearTab) {
        // Remove active class from all tabs first
        document.querySelectorAll('.year-tab').forEach(tab => tab.classList.remove('active'));
        // Set current year as active
        currentYearTab.classList.add('active');
        currentYear = currentYearString;
        console.log('Ensured current year is selected:', currentYear);
        
        // Update income data for the current year
        updateIncomeForYear(currentYear);
      } else {
        // If current year tab doesn't exist, create it and set as active
        console.log('Current year tab not found, creating it:', currentYearString);
        createYearTab(currentYearString);
        switchYear(currentYearString);
      }
    }
    
    // Year Tab Navigation
    function initYearTabs() {
      const yearTabs = document.querySelectorAll('.year-tab');
      const manageYearsBtn = $('#manageYearsBtn');
      
      yearTabs.forEach(tab => {
        tab.addEventListener('click', () => {
          const year = tab.getAttribute('data-year');
          switchYear(year);
        });
      });
      
      if (manageYearsBtn) {
        manageYearsBtn.addEventListener('click', showYearManagementPanel);
      }
      
      // Set current year as active by default
      const currentYearString = new Date().getFullYear().toString();
      const currentYearTab = document.querySelector(`[data-year="${currentYearString}"]`);
      if (currentYearTab) {
        // Remove active class from all tabs first
        yearTabs.forEach(tab => tab.classList.remove('active'));
        // Set current year as active
        currentYearTab.classList.add('active');
        currentYear = currentYearString;
        console.log('Set current year as default:', currentYear);
      } else {
        // If current year tab doesn't exist, use the first available tab
        if (yearTabs.length > 0) {
          yearTabs[0].classList.add('active');
          currentYear = yearTabs[0].getAttribute('data-year');
          console.log('Current year tab not found, using first available:', currentYear);
        }
      }
    }
    
    function switchYear(year) {
      console.log('Switching to year:', year);
      
      // Remove active class from all year tabs
      document.querySelectorAll('.year-tab').forEach(tab => {
        tab.classList.remove('active');
      });
      
      // Add active class to selected year tab
      const selectedTab = document.querySelector(`[data-year="${year}"]`);
      if (selectedTab) {
        selectedTab.classList.add('active');
        currentYear = year;
        console.log('Current year set to:', currentYear);
        
        // Update income data for selected year
        if (currentPage === 'income') {
          updateIncomeForYear(year);
        }
      }
    }
    
    
    function removeYear(year) {
      showYearConfirmDialog(year);
    }
    
    function showYearConfirmDialog(year) {
      // Create overlay
      const overlay = document.createElement('div');
      overlay.className = 'year-confirm-overlay';
      
      // Create dialog
      const dialog = document.createElement('div');
      dialog.className = 'year-confirm-dialog';
      dialog.innerHTML = `
        <div class="year-confirm-message">Remove year ${year}?</div>
        <div class="year-confirm-buttons">
          <button class="year-confirm-btn year-confirm-yes" onclick="confirmRemoveYear(${year})">Sure!</button>
          <button class="year-confirm-btn year-confirm-no" onclick="closeYearConfirmDialog()">Cancel</button>
        </div>
      `;
      
      overlay.appendChild(dialog);
      document.body.appendChild(overlay);
      
      // Close on overlay click
      overlay.addEventListener('click', (e) => {
        if (e.target === overlay) {
          closeYearConfirmDialog();
        }
      });
    }
    
    async function confirmRemoveYear(year) {
      // Remove from state
      delete state.income[year];
      
      // Remove from DOM
      const yearTab = document.querySelector(`[data-year="${year}"]`);
      if (yearTab) {
        yearTab.remove();
      }
      
      // Switch to current year if we removed the active year
      if (currentYear === year.toString()) {
        const remainingTabs = document.querySelectorAll('.year-tab');
        if (remainingTabs.length > 0) {
          const firstTab = remainingTabs[0];
          switchYear(firstTab.getAttribute('data-year'));
        }
      }
      
      // Delete all income records for this year from Supabase
      if (supabaseReady && currentUser) {
        try {
          const { error } = await window.supabaseClient
            .from('income')
            .delete()
            .eq('user_id', currentUser.id)
            .eq('year', parseInt(year));
          
          if (error) throw error;
          console.log(`Deleted all income records for year ${year} from Supabase`);
        } catch (error) {
          console.error('Error deleting year data from Supabase:', error);
        }
      }
      
      // Refresh year management panel
      refreshYearManagementPanel();
      
      // Save changes locally and to Supabase
      save();
      
      // Close dialog
      closeYearConfirmDialog();
      
      console.log(`Removed year ${year} from income data and Supabase`);
    }
    
    function closeYearConfirmDialog() {
      const overlay = document.querySelector('.year-confirm-overlay');
      if (overlay) {
        overlay.remove();
      }
    }
    
    function showYearManagementPanel() {
      const manageBtn = $('#manageYearsBtn');
      if (!manageBtn) return;
      
      // Remove existing panel if any
      const existingPanel = document.querySelector('.year-management-panel');
      if (existingPanel) {
        existingPanel.remove();
      }
      
      // Create year management panel
      const panel = document.createElement('div');
      panel.className = 'year-management-panel show';
      
      // Get all existing years and sort them (smallest to largest for display)
      const existingYears = Array.from(document.querySelectorAll('.year-tab'))
        .map(tab => parseInt(tab.getAttribute('data-year')))
        .sort((a, b) => a - b);
      
      // Get min and max years for add buttons
      const minYear = Math.min(...existingYears);
      const maxYear = Math.max(...existingYears);
      
      // Create year list with separators
      let yearListHTML = '';
      for (let i = 0; i < existingYears.length; i++) {
        const year = existingYears[i];
        const isActive = currentYear === year.toString();
        
        // Add year item
        yearListHTML += `
          <div class="year-item ${isActive ? 'active' : ''}">
            <span>${year}</span>
            <div class="year-item-controls">
              <button class="year-btn year-btn-remove" onclick="removeYear(${year})" title="Remove ${year}">-</button>
            </div>
          </div>
        `;
        
        // Add separator between years only if there's a missing year
        if (i < existingYears.length - 1) {
          const nextYear = existingYears[i + 1];
          const middleYear = year + 1;
          const canAddBetween = middleYear < nextYear && !existingYears.includes(middleYear);
          
          // Only show separator if there's actually a missing year
          if (canAddBetween) {
            yearListHTML += `
              <div class="year-separator">
                <div class="year-separator-line"></div>
                <button class="year-add-between" 
                        onclick="addYearBetween(${year}, ${nextYear})" 
                        title="Add ${middleYear}">+</button>
                <div class="year-separator-line"></div>
              </div>
            `;
          }
        }
      }
      
      panel.innerHTML = `
        <div class="year-management-header">Manage Years</div>
        
        <div class="year-add-buttons">
          <button class="year-add-btn" onclick="addYearBefore(${minYear})" title="Add year before ${minYear}">
            <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M12 5v14M5 12h14"/>
            </svg>
            Add before ${minYear}
          </button>
        </div>
        
        <div class="year-list">
          ${yearListHTML}
        </div>
        
        <div class="year-add-buttons">
          <button class="year-add-btn" onclick="addYearAfter(${maxYear})" title="Add year after ${maxYear}">
            <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M12 5v14M5 12h14"/>
            </svg>
            Add after ${maxYear}
          </button>
        </div>
      `;
      
      // Position panel
      manageBtn.style.position = 'relative';
      manageBtn.appendChild(panel);
      
      // Close panel when clicking outside
      setTimeout(() => {
        document.addEventListener('click', function closePanel(e) {
          if (!panel.contains(e.target) && e.target !== manageBtn) {
            panel.remove();
            document.removeEventListener('click', closePanel);
          }
        });
      }, 100);
    }
    
    function refreshYearManagementPanel() {
      const panel = document.querySelector('.year-management-panel');
      if (panel) {
        showYearManagementPanel();
      }
    }
    
    function addYearBefore(year) {
      const newYear = year - 1;
      if (newYear < 1900) {
        alert('Cannot add years before 1900');
        return;
      }
      
      // Check if year already exists
      const existingYearTab = document.querySelector(`[data-year="${newYear}"]`);
      if (existingYearTab) {
        alert(`Year ${newYear} already exists!`);
        return;
      }
      
      addYearToTabs(newYear);
      refreshYearManagementPanel();
      console.log(`Added year ${newYear} before ${year}`);
    }
    
    function addYearAfter(year) {
      const newYear = year + 1;
      if (newYear > 2100) {
        alert('Cannot add years after 2100');
        return;
      }
      
      // Check if year already exists
      const existingYearTab = document.querySelector(`[data-year="${newYear}"]`);
      if (existingYearTab) {
        alert(`Year ${newYear} already exists!`);
        return;
      }
      
      addYearToTabs(newYear);
      refreshYearManagementPanel();
      console.log(`Added year ${newYear} after ${year}`);
    }
    
    function addYearBetween(year1, year2) {
      const newYear = year1 + 1;
      if (newYear >= year2) {
        alert('No year available between these years');
        return;
      }
      
      // Check if year already exists
      const existingYearTab = document.querySelector(`[data-year="${newYear}"]`);
      if (existingYearTab) {
        alert(`Year ${newYear} already exists!`);
        return;
      }
      
      addYearToTabs(newYear);
      refreshYearManagementPanel();
      console.log(`Added year ${newYear} between ${year1} and ${year2}`);
    }
    
    function createYearTabsFromData(incomeData) {
      const yearTabsContainer = $('#yearTabsContainer');
      if (!yearTabsContainer) return;
      
      // Clear existing year tabs (except the manage button)
      const existingTabs = yearTabsContainer.querySelectorAll('.year-tab');
      existingTabs.forEach(tab => tab.remove());
      
      // Get all years from income data and sort them
      const years = Object.keys(incomeData).map(year => parseInt(year)).sort((a, b) => a - b);
      
      // Create year tabs for all years
      years.forEach(year => {
        const yearTab = document.createElement('button');
        yearTab.className = 'year-tab';
        yearTab.setAttribute('data-year', year);
        yearTab.textContent = year;
        yearTab.addEventListener('click', () => switchYear(year.toString()));
        
        // Insert before manage button
        const manageBtn = $('#manageYearsBtn');
        yearTabsContainer.insertBefore(yearTab, manageBtn);
      });
      
      // Set the first year as active if no current year is set
      if (years.length > 0 && !currentYear) {
        switchYear(years[0].toString());
      }
      
      console.log(`Created year tabs from Supabase data:`, years);
      
      // Save years to Supabase to ensure they're persisted
      if (years.length > 0) {
        console.log('Saving years to Supabase:', years);
        save(); // This will update available_years in user_settings
      }
    }
    
    function addYearToTabs(newYear) {
      const yearTabsContainer = $('#yearTabsContainer');
      if (!yearTabsContainer) return;
      
      // Initialize the year in the income data structure
      if (!state.income[newYear]) {
        state.income[newYear] = [];
      }
      
      // Create new year tab
      const newYearTab = document.createElement('button');
      newYearTab.className = 'year-tab';
      newYearTab.setAttribute('data-year', newYear);
      newYearTab.textContent = newYear;
      newYearTab.addEventListener('click', () => switchYear(newYear.toString()));
      
      // Insert in chronological order (smallest to largest)
      const existingTabs = Array.from(yearTabsContainer.querySelectorAll('.year-tab'));
      const manageBtn = $('#manageYearsBtn');
      
      // Find the right position to insert (maintain chronological order)
      let insertBefore = manageBtn;
      for (const tab of existingTabs) {
        const tabYear = parseInt(tab.getAttribute('data-year'));
        if (newYear < tabYear) {
          insertBefore = tab;
          break;
        }
      }
      
      yearTabsContainer.insertBefore(newYearTab, insertBefore);
      
      // Save changes locally and to Supabase
      save();
      
      console.log(`Added year ${newYear} to income data and synced with Supabase`);
    }
    
    function updateIncomeForYear(year) {
      // Ensure the year exists in the income data structure
      if (!state.income[year]) {
        state.income[year] = [];
      }
      
      // Re-render the income list with year-specific data
      renderIncomeList('list-income', state.income[year]);
      
      // Update KPIs for the selected year
      renderKPIs();
    }
    
    // Initialize navigation
    initPageNavigation();
    initYearTabs();
    
    // Note: currentYear is now set in initYearTabs() to default to current year
    
    // Add row function
    function addRow(group){
      console.log('addRow called for group:', group);
      
      // Check if inputs are locked
      if (state.inputsLocked) {
        showNotification('Cannot add rows while inputs are locked', 'warning', 3000);
        return;
      }
      
      if(group==='biz') {
        const newRow = {name:'', cost:0, status:'Active', billing:'Monthly', next:''};
        // Initialize financial values
        newRow.monthlyUSD = 0;
        newRow.yearlyUSD = 0;
        newRow.monthlyEGP = 0;
        newRow.yearlyEGP = 0;
        state.biz.push(newRow);
        console.log('Added business row, total business rows:', state.biz.length);
      }
      else if(group==='income') {
        // Ensure we have the correct current year from the active tab
        const activeYearTab = document.querySelector('.year-tab.active');
        if (activeYearTab) {
          currentYear = activeYearTab.getAttribute('data-year');
        }
        
        // Fallback to current year if no tab is active
        if (!currentYear) {
          currentYear = new Date().getFullYear().toString();
          console.warn('No active year tab found, defaulting to:', currentYear);
        }
        
        console.log('Adding income row for year:', currentYear);
        
        // Ensure the current year exists in the income data structure
        if (!state.income[currentYear]) {
          state.income[currentYear] = [];
          console.log('Created new year array for:', currentYear);
        }
        
        // Set default date with current year
        const today = new Date();
        const year = parseInt(currentYear) || today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const day = String(today.getDate()).padStart(2, '0');
        const defaultDate = `${year}-${month}-${day}`;
        
        const newIncome = {
          name:'', 
          tags:'', 
          date: defaultDate, 
          allPayment:0, 
          paidUsd:0, 
          method:'Bank Transfer',
          icon: 'fa:dollar-sign'
        };
        
        state.income[currentYear].push(newIncome);
        console.log('Added income row to year:', currentYear, 'Total rows for this year:', state.income[currentYear].length);
        
        // Instantly save the new income row to Supabase
        setTimeout(() => {
          instantSaveIncomeRow(newIncome, currentYear);
        }, 100); // Small delay to ensure the row is properly added to state
      }
      else if(group==='personal') {
        const newRow = {name:'', cost:0, status:'Active', billing:'Monthly'};
        // Initialize financial values
        newRow.monthlyUSD = 0;
        newRow.yearlyUSD = 0;
        newRow.monthlyEGP = 0;
        newRow.yearlyEGP = 0;
        state.personal.push(newRow);
        console.log('Added personal row, total personal rows:', state.personal.length);
      }
      
      // Save and re-render
      save('add-row'); 
      clearCalculationCache(); // Clear cache when data changes
      renderAll();
    }
    
    // Make functions globally accessible
    window.addRow = addRow;
    window.removeYear = removeYear;
    window.addYearBefore = addYearBefore;
    window.saveImportedIncomeSequentially = saveImportedIncomeSequentially;
    window.saveAllRowsWithoutIds = saveAllRowsWithoutIds;
    
    // Function to force clear all IDs from income data
    window.clearAllIncomeIds = function() {
      let clearedCount = 0;
      
      Object.keys(state.income || {}).forEach(year => {
        const yearData = state.income[year] || [];
        yearData.forEach((row, index) => {
          if (row.id) {
            delete row.id;
            clearedCount++;
          }
        });
      });
      
      saveToLocal();
      showNotification(`Cleared ${clearedCount} IDs from income data`, 'info', 2000);
      return clearedCount;
    };
    window.addYearAfter = addYearAfter;
    window.addYearBetween = addYearBetween;
    window.confirmRemoveYear = confirmRemoveYear;
    window.closeYearConfirmDialog = closeYearConfirmDialog;
    
    // Supabase integration
    let currentUser = null;
    let supabaseReady = false;
    
    // Wait for Supabase to be ready
    const checkSupabase = setInterval(() => {
      if (window.supabaseClient) {
        supabaseReady = true;
        clearInterval(checkSupabase);
        console.log('Supabase is ready!');
        initializeAuth();
      }
    }, 100);
    
    // Timeout after 10 seconds
    setTimeout(() => {
      if (!supabaseReady) {
        console.error('Supabase failed to load after 10 seconds');
        showNotification('Supabase connection failed. Using local storage only.', 'error');
        loadLocalData();
      }
    }, 10000);
    
    function initializeAuth() {
      console.log('Initializing Supabase Auth...');
      
      // Check if user came from password reset link
      checkPasswordResetToken();
      
      // Set up Supabase authentication state listener
      window.supabaseClient.auth.onAuthStateChange((event, session) => {
        console.log('Supabase auth state changed:', event, session ? 'User signed in' : 'User signed out');
        if (session?.user) {
          currentUser = session.user;
          updateAuthUI();
          loadUserData();
        } else if (event === 'SIGNED_OUT') {
          currentUser = null;
          updateAuthUI();
          
          // Clear all data when signed out
          state.personal = [];
          state.biz = [];
          state.income = {
            2022: [],
            2023: [],
            2024: [],
            2025: []
          };
          state.fx = 48.1843;
          state.theme = 'dark';
          state.autosave = 'on';
          state.includeAnnualInMonthly = false;
          columnOrder = ['monthly', 'yearly', 'monthly-egp', 'yearly-egp'];
          
          // Clear local storage
          localStorage.removeItem('finance-notion-v6');
          localStorage.removeItem('columnOrder');
          
          // Render empty tables
          renderAll();
        } else {
          // No session (not signed in) - load local data if available
          currentUser = null;
          updateAuthUI();
          console.log('No user session - loading local data');
          loadLocalData();
        }
      });
      
      // Set up authentication event listeners
      const loginBtn = $('#btnLogin');
      const signInBtn = $('#btnSignIn');
      const logoutBtn = $('#btnLogout');
      const userMenuBtn = $('#userMenuBtn');
      const accountMenuBtn = $('#accountMenuBtn');
      
      if (loginBtn) {
        loginBtn.addEventListener('click', openAuthModal);
        console.log('Login button event listener added');
      }
      
      if (signInBtn) {
        signInBtn.addEventListener('click', openAuthModal);
        console.log('Sign In button event listener added');
      }
      
      if (logoutBtn) {
        logoutBtn.addEventListener('click', signOut);
        console.log('Logout button event listener added');
      }
      
      if (userMenuBtn) {
        userMenuBtn.addEventListener('click', toggleUserDropdown);
        console.log('User menu button event listener added');
      }
      
      if (accountMenuBtn) {
        accountMenuBtn.addEventListener('click', toggleAccountDropdown);
        console.log('Account menu button event listener added');
      }
      
      // Modal event listeners
      const emailSignInBtn = $('#emailSignInBtn');
      const emailSignUpBtn = $('#emailSignUpBtn');
      const forgotPasswordBtn = $('#forgotPasswordBtn');
      const sendResetBtn = $('#sendResetBtn');
      const backToSignInBtn = $('#backToSignInBtn');
      
      if (emailSignInBtn) {
        emailSignInBtn.addEventListener('click', signInWithEmail);
        console.log('Email sign-in button event listener added');
      }
      
      if (emailSignUpBtn) {
        emailSignUpBtn.addEventListener('click', signUpWithEmail);
        console.log('Email sign-up button event listener added');
      }
      
      if (forgotPasswordBtn) {
        forgotPasswordBtn.addEventListener('click', showForgotPasswordForm);
        console.log('Forgot password button event listener added');
      }
      
      if (sendResetBtn) {
        sendResetBtn.addEventListener('click', sendPasswordReset);
        console.log('Send reset button event listener added');
      }
      
      if (backToSignInBtn) {
        backToSignInBtn.addEventListener('click', showSignInForm);
        console.log('Back to sign-in button event listener added');
      }
      
      const updatePasswordBtn = $('#updatePasswordBtn');
      const cancelResetBtn = $('#cancelResetBtn');
      const changePasswordBtn = $('#changePasswordBtn');
      const savePasswordBtn = $('#savePasswordBtn');
      const cancelChangeBtn = $('#cancelChangeBtn');
      
      if (updatePasswordBtn) {
        updatePasswordBtn.addEventListener('click', updatePassword);
        console.log('Update password button event listener added');
      }
      
      if (cancelResetBtn) {
        cancelResetBtn.addEventListener('click', showSignInForm);
        console.log('Cancel reset button event listener added');
      }
      
      if (changePasswordBtn) {
        changePasswordBtn.addEventListener('click', () => {
          closeUserDropdown();
          openAuthModal();
          showChangePasswordForm();
        });
        console.log('Change password button event listener added');
      }
      
      
      if (savePasswordBtn) {
        savePasswordBtn.addEventListener('click', changePassword);
        console.log('Save password button event listener added');
      }
      
      if (cancelChangeBtn) {
        cancelChangeBtn.addEventListener('click', closeAuthModal);
        console.log('Cancel change button event listener added');
      }
      
      
      // Close modal when clicking overlay
      const authModal = $('#authModal');
      if (authModal) {
        authModal.addEventListener('click', (e) => {
          if (e.target === authModal || e.target.classList.contains('auth-modal-overlay')) {
            closeAuthModal();
          }
        });
      }
      
      // Close dropdown when clicking outside
      document.addEventListener('click', (e) => {
        const userInfo = $('#userInfo');
        const userDropdown = $('#userDropdown');
        const accountDropdown = $('#accountDropdown');
        const accountMenuBtn = $('#accountMenuBtn');
        
        if (userInfo && userDropdown && !userInfo.contains(e.target)) {
          closeUserDropdown();
        }
        
        if (accountDropdown && accountMenuBtn && !accountMenuBtn.contains(e.target) && !accountDropdown.contains(e.target)) {
          closeAccountDropdown();
        }
      });
      
      // Handle Enter key in email form
      const authEmail = $('#authEmail');
      const authPassword = $('#authPassword');
      
      if (authEmail) {
        authEmail.addEventListener('keypress', (e) => {
          if (e.key === 'Enter') {
            signInWithEmail();
          }
        });
      }
      
      if (authPassword) {
        authPassword.addEventListener('keypress', (e) => {
          if (e.key === 'Enter') {
            signInWithEmail();
          }
        });
      }
      
      // Show login button immediately
      updateAuthUI();
      
      // Test Supabase connection
      testSupabaseConnection();
    }
    
    async function testSupabaseConnection() {
      try {
        console.log('Testing Supabase connection...');
        // Try to get current user
        const { data: { user } } = await window.supabaseClient.auth.getUser();
        console.log('Current user:', user);
        
        // Test database connection
        const { data, error } = await window.supabaseClient.from('backups').select('count').limit(1);
        console.log('Database connection test:', data, error);
        
        console.log('Supabase connection test successful!');
      } catch (error) {
        console.error('Supabase connection test failed:', error);
      }
    }
    
    function updateAuthUI() {
      const loginBtn = $('#btnLogin');
      const signInBtn = $('#btnSignIn');
      const userInfo = $('#userInfo');
      const userName = $('#userName');
      const userEmail = $('#userEmail');
      const userPhoto = $('#userPhoto');
      const dropdownUserName = $('#dropdownUserName');
      const dropdownUserEmail = $('#dropdownUserEmail');
      const dropdownUserPhoto = $('#dropdownUserPhoto');
      const accountMenuBtn = $('#accountMenuBtn');
      
      if (currentUser) {
        loginBtn.style.display = 'none';
        if (signInBtn) signInBtn.style.display = 'none';
        if (accountMenuBtn) accountMenuBtn.style.display = 'flex';
        userInfo.style.display = 'block';
        
        // Handle Supabase user object
        const displayName = currentUser.user_metadata?.full_name || currentUser.user_metadata?.name || 'User';
        const email = currentUser.email || '';
        const photoURL = currentUser.user_metadata?.avatar_url;
        
        // Update main user info
        userName.textContent = displayName;
        userEmail.textContent = email;
        
        // Update dropdown user info
        if (dropdownUserName) dropdownUserName.textContent = displayName;
        if (dropdownUserEmail) dropdownUserEmail.textContent = email;
        
        // Handle profile photos
        if (photoURL) {
          userPhoto.src = photoURL;
          userPhoto.style.display = 'block';
          if (dropdownUserPhoto) {
            dropdownUserPhoto.src = photoURL;
            dropdownUserPhoto.style.display = 'block';
          }
        } else {
          userPhoto.style.display = 'none';
          if (dropdownUserPhoto) {
            dropdownUserPhoto.style.display = 'none';
          }
        }
        
        console.log('Auth UI updated for user:', { displayName, email, photoURL });
      } else {
        loginBtn.style.display = 'flex';
        if (signInBtn) signInBtn.style.display = 'flex';
        if (accountMenuBtn) accountMenuBtn.style.display = 'none';
        userInfo.style.display = 'none';
        console.log('Auth UI updated - no user');
      }
    }
    
    // User Dropdown Functions
    function toggleUserDropdown() {
      const dropdown = $('#userDropdown');
      if (dropdown) {
        const isVisible = dropdown.classList.contains('show');
        if (isVisible) {
          closeUserDropdown();
        } else {
          openUserDropdown();
        }
      }
    }
    
    function openUserDropdown() {
      const dropdown = $('#userDropdown');
      if (dropdown) {
        dropdown.style.display = 'block';
        // Small delay for smooth animation
        setTimeout(() => {
          dropdown.classList.add('show');
        }, 10);
      }
    }
    
    function closeUserDropdown() {
      const dropdown = $('#userDropdown');
      if (dropdown) {
        dropdown.classList.remove('show');
        // Hide after animation completes
        setTimeout(() => {
          dropdown.style.display = 'none';
        }, 200);
      }
    }
    
    // Account Dropdown Functions
    function toggleAccountDropdown() {
      const dropdown = $('#accountDropdown');
      if (dropdown) {
        const isVisible = dropdown.classList.contains('show');
        if (isVisible) {
          closeAccountDropdown();
        } else {
          openAccountDropdown();
        }
      }
    }
    
    function openAccountDropdown() {
      const dropdown = $('#accountDropdown');
      if (dropdown) {
        dropdown.style.display = 'block';
        // Small delay for smooth animation
        setTimeout(() => {
          dropdown.classList.add('show');
        }, 10);
      }
    }
    
    function closeAccountDropdown() {
      const dropdown = $('#accountDropdown');
      if (dropdown) {
        dropdown.classList.remove('show');
        // Hide after animation completes
        setTimeout(() => {
          dropdown.style.display = 'none';
        }, 200);
      }
    }
    
    // Modal Functions
    function openAuthModal() {
      const modal = $('#authModal');
      if (modal) {
        modal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
        
        // Ensure sign-in form is shown by default
        showSignInForm();
        
        console.log('Auth modal opened');
      }
    }
    
    function closeAuthModal() {
      const modal = $('#authModal');
      if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = '';
        clearAuthStatus();
      }
    }
    
    // Make functions globally available
    window.openAuthModal = openAuthModal;
    window.closeAuthModal = closeAuthModal;
    
    function showAuthStatus(message, type = 'success') {
      const status = $('#authStatus');
      if (status) {
        status.textContent = message;
        status.className = `auth-status ${type}`;
        status.style.display = 'block';
      }
    }
    
    function clearAuthStatus() {
      const status = $('#authStatus');
      if (status) {
        status.style.display = 'none';
      }
    }
    
    function showAuthLoading(show = true) {
      const loading = $('#authLoading');
      const emailForm = $('#emailAuthForm');
      const forgotForm = $('#forgotPasswordForm');
      const resetForm = $('#passwordResetForm');
      
      if (loading) loading.style.display = show ? 'flex' : 'none';
      
      // Only hide the currently visible form when loading
      if (show) {
        if (emailForm && emailForm.style.display === 'flex') emailForm.style.display = 'none';
        if (forgotForm && forgotForm.style.display === 'flex') forgotForm.style.display = 'none';
        if (resetForm && resetForm.style.display === 'flex') resetForm.style.display = 'none';
      } else {
        // When loading stops, show the appropriate form
        if (emailForm && emailForm.style.display !== 'none') emailForm.style.display = 'flex';
      }
    }
    
    function showForgotPasswordForm() {
      const emailForm = $('#emailAuthForm');
      const forgotForm = $('#forgotPasswordForm');
      const resetForm = $('#passwordResetForm');
      const changeForm = $('#changePasswordForm');
      
      // Hide all forms first
      if (emailForm) {
        emailForm.style.display = 'none';
        emailForm.classList.remove('hidden');
      }
      if (forgotForm) {
        forgotForm.style.display = 'none';
        forgotForm.classList.remove('hidden');
      }
      if (resetForm) {
        resetForm.style.display = 'none';
        resetForm.classList.remove('hidden');
      }
      if (changeForm) {
        changeForm.style.display = 'none';
        changeForm.classList.remove('hidden');
      }
      
      // Show forgot password form
      if (forgotForm) {
        forgotForm.style.display = 'flex';
        // Small delay for smooth transition
        setTimeout(() => {
          forgotForm.classList.remove('hidden');
        }, 10);
      }
      
      clearAuthStatus();
    }
    
    function showSignInForm() {
      const emailForm = $('#emailAuthForm');
      const forgotForm = $('#forgotPasswordForm');
      const resetForm = $('#passwordResetForm');
      const changeForm = $('#changePasswordForm');
      
      // Hide all forms first
      if (emailForm) {
        emailForm.style.display = 'none';
        emailForm.classList.remove('hidden');
      }
      if (forgotForm) {
        forgotForm.style.display = 'none';
        forgotForm.classList.remove('hidden');
      }
      if (resetForm) {
        resetForm.style.display = 'none';
        resetForm.classList.remove('hidden');
      }
      if (changeForm) {
        changeForm.style.display = 'none';
        changeForm.classList.remove('hidden');
      }
      
      // Show sign-in form
      if (emailForm) {
        emailForm.style.display = 'flex';
        // Small delay for smooth transition
        setTimeout(() => {
          emailForm.classList.remove('hidden');
        }, 10);
      }
      
      clearAuthStatus();
    }
    
    function showPasswordResetForm() {
      const emailForm = $('#emailAuthForm');
      const forgotForm = $('#forgotPasswordForm');
      const resetForm = $('#passwordResetForm');
      const changeForm = $('#changePasswordForm');
      
      // Hide all forms first
      if (emailForm) {
        emailForm.style.display = 'none';
        emailForm.classList.remove('hidden');
      }
      if (forgotForm) {
        forgotForm.style.display = 'none';
        forgotForm.classList.remove('hidden');
      }
      if (resetForm) {
        resetForm.style.display = 'none';
        resetForm.classList.remove('hidden');
      }
      if (changeForm) {
        changeForm.style.display = 'none';
        changeForm.classList.remove('hidden');
      }
      
      // Show password reset form
      if (resetForm) {
        resetForm.style.display = 'flex';
        // Small delay for smooth transition
        setTimeout(() => {
          resetForm.classList.remove('hidden');
        }, 10);
      }
      
      clearAuthStatus();
    }
    
    function showChangePasswordForm() {
      const emailForm = $('#emailAuthForm');
      const forgotForm = $('#forgotPasswordForm');
      const resetForm = $('#passwordResetForm');
      const changeForm = $('#changePasswordForm');
      
      // Hide all forms first
      if (emailForm) {
        emailForm.style.display = 'none';
        emailForm.classList.remove('hidden');
      }
      if (forgotForm) {
        forgotForm.style.display = 'none';
        forgotForm.classList.remove('hidden');
      }
      if (resetForm) {
        resetForm.style.display = 'none';
        resetForm.classList.remove('hidden');
      }
      if (changeForm) {
        changeForm.style.display = 'none';
        changeForm.classList.remove('hidden');
      }
      
      // Show change password form
      if (changeForm) {
        changeForm.style.display = 'flex';
        // Small delay for smooth transition
        setTimeout(() => {
          changeForm.classList.remove('hidden');
        }, 10);
      }
      
      clearAuthStatus();
    }
    
    function checkPasswordResetToken() {
      // Check URL parameters for password reset tokens
      const urlParams = new URLSearchParams(window.location.search);
      const accessToken = urlParams.get('access_token');
      const refreshToken = urlParams.get('refresh_token');
      const type = urlParams.get('type');
      
      console.log('URL params:', { accessToken: !!accessToken, refreshToken: !!refreshToken, type });
      
      // If this is a password recovery flow
      if (type === 'recovery' && accessToken && refreshToken) {
        console.log('Password reset token detected, showing reset form');
        
        // Set the session with the tokens
        window.supabaseClient.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken
        }).then(({ data, error }) => {
          if (error) {
            console.error('Error setting session:', error);
            showAuthStatus('Invalid or expired reset link. Please request a new one.', 'error');
            return;
          }
          
          if (data.session) {
            // User is now authenticated, show password reset form
            openAuthModal();
            showPasswordResetForm();
            showAuthStatus('Please enter your new password', 'success');
          }
        });
        
        // Clean up URL parameters
        const newUrl = window.location.origin + window.location.pathname;
        window.history.replaceState({}, document.title, newUrl);
      }
    }
    
    async function sendPasswordReset() {
      const email = $('#forgotEmail').value;
      
      if (!email) {
        showAuthStatus('Please enter your email address', 'error');
        return;
      }
      
      try {
        showAuthLoading(true);
        clearAuthStatus();
        
        const { error } = await window.supabaseClient.auth.resetPasswordForEmail(email, {
          redirectTo: window.location.origin + window.location.pathname
        });
        
        if (error) throw error;
        
        showAuthStatus('Password reset link sent! Check your email.', 'success');
        showAuthLoading(false);
        
        // Auto-close modal after 3 seconds
        setTimeout(() => {
          closeAuthModal();
        }, 3000);
        
      } catch (error) {
        console.error('Password reset error:', error);
        showAuthLoading(false);
        showAuthStatus('Failed to send reset link: ' + error.message, 'error');
      }
    }
    
    async function updatePassword() {
      const newPassword = $('#newPassword').value;
      const confirmPassword = $('#confirmPassword').value;
      
      if (!newPassword || !confirmPassword) {
        showAuthStatus('Please fill in all fields', 'error');
        return;
      }
      
      if (newPassword.length < 6) {
        showAuthStatus('Password must be at least 6 characters', 'error');
        return;
      }
      
      if (newPassword !== confirmPassword) {
        showAuthStatus('Passwords do not match', 'error');
        return;
      }
      
      try {
        showAuthLoading(true);
        clearAuthStatus();
        
        const { error } = await window.supabaseClient.auth.updateUser({
          password: newPassword
        });
        
        if (error) throw error;
        
        showAuthStatus('Password updated successfully! You can now sign in.', 'success');
        showAuthLoading(false);
        
        // Clear password fields
        $('#newPassword').value = '';
        $('#confirmPassword').value = '';
        
        // Auto-close modal after 3 seconds
        setTimeout(() => {
          closeAuthModal();
        }, 3000);
        
      } catch (error) {
        console.error('Password update error:', error);
        showAuthLoading(false);
        showAuthStatus('Failed to update password: ' + error.message, 'error');
      }
    }
    
    async function changePassword() {
      const currentPassword = $('#currentPassword').value;
      const newPassword = $('#changeNewPassword').value;
      const confirmPassword = $('#changeConfirmPassword').value;
      
      if (!currentPassword || !newPassword || !confirmPassword) {
        showAuthStatus('Please fill in all fields', 'error');
        return;
      }
      
      if (newPassword.length < 6) {
        showAuthStatus('New password must be at least 6 characters', 'error');
        return;
      }
      
      if (newPassword !== confirmPassword) {
        showAuthStatus('New passwords do not match', 'error');
        return;
      }
      
      if (currentPassword === newPassword) {
        showAuthStatus('New password must be different from current password', 'error');
        return;
      }
      
      try {
        showAuthLoading(true);
        clearAuthStatus();
        
        // First verify current password by attempting to sign in
        const { error: signInError } = await window.supabaseClient.auth.signInWithPassword({
          email: currentUser.email,
          password: currentPassword
        });
        
        if (signInError) {
          throw new Error('Current password is incorrect');
        }
        
        // If current password is correct, update to new password
        const { error: updateError } = await window.supabaseClient.auth.updateUser({
          password: newPassword
        });
        
        if (updateError) throw updateError;
        
        showAuthStatus('Password changed successfully!', 'success');
        showAuthLoading(false);
        
        // Clear password fields
        $('#currentPassword').value = '';
        $('#changeNewPassword').value = '';
        $('#changeConfirmPassword').value = '';
        
        // Auto-close modal after 2 seconds
        setTimeout(() => {
          closeAuthModal();
        }, 2000);
        
      } catch (error) {
        console.error('Password change error:', error);
        showAuthLoading(false);
        showAuthStatus('Failed to change password: ' + error.message, 'error');
      }
    }
    
    
    async function signInWithEmail() {
      const email = $('#authEmail').value;
      const password = $('#authPassword').value;
      
      if (!email || !password) {
        showAuthStatus('Please enter both email and password', 'error');
        return;
      }
      
      try {
        showAuthLoading(true);
        clearAuthStatus();
        
        // Try to sign in first
        let { data, error } = await window.supabaseClient.auth.signInWithPassword({
          email: email,
          password: password
        });
        
        // If sign in fails, check the error type
        if (error) {
          if (error.message.includes('email not confirmed') || error.message.includes('Email not confirmed')) {
            showAuthStatus('Please check your email and click the confirmation link before signing in.', 'error');
            showAuthLoading(false);
            return;
          } else if (error.message.includes('Invalid login credentials')) {
            showAuthStatus('Invalid email or password. Please try again.', 'error');
            showAuthLoading(false);
            return;
          } else {
            throw error;
          }
        }
        
        // Sign in was successful
        showAuthStatus('Sign in successful!', 'success');
        showAuthLoading(false);
        closeAuthModal();
      } catch (error) {
        console.error('Email sign in error:', error);
        showAuthLoading(false);
        showAuthStatus('Sign in failed: ' + error.message, 'error');
      }
    }
    
    async function signUpWithEmail() {
      const email = $('#authEmail').value;
      const password = $('#authPassword').value;
      
      if (!email || !password) {
        showAuthStatus('Please enter both email and password', 'error');
        return;
      }
      
      if (password.length < 6) {
        showAuthStatus('Password must be at least 6 characters', 'error');
        return;
      }
      
      try {
        showAuthLoading(true);
        clearAuthStatus();
        
        const { data, error } = await window.supabaseClient.auth.signUp({
          email: email,
          password: password
        });
        
        if (error) throw error;
        
        showAuthStatus('Account created! Please check your email to confirm.', 'success');
        showAuthLoading(false);
      } catch (error) {
        console.error('Email sign up error:', error);
        showAuthLoading(false);
        showAuthStatus('Sign up failed: ' + error.message, 'error');
      }
    }
    
    async function signOut() {
      try {
        await window.supabaseClient.auth.signOut();
        showNotification('Signed out successfully!', 'success');
        
        // Clear all data immediately
        clearAllData();
        
        // Refresh the page after a short delay to ensure clean state
        setTimeout(() => {
          window.location.reload();
        }, 1000);
        
      } catch (error) {
        console.error('Sign out error:', error);
        showNotification('Sign out failed. Please try again.', 'error');
      }
    }
    
    async function createUserDocument(user) {
      // Supabase automatically creates user profiles, no need to manually create
      console.log('User document created automatically by Supabase:', user);
    }
    
    async function loadUserData() {
      if (!currentUser) return;
      
      try {
        console.log('Loading user data with parallel requests for maximum speed...');
        
        // Start all requests in parallel for maximum speed
        const [settingsResult, personalResult, businessResult, incomeResult] = await Promise.allSettled([
        // Load user settings
          window.supabaseClient
          .from('user_settings')
          .select('*')
          .eq('user_id', currentUser.id)
            .single(),
            
          // Load personal expenses
          window.supabaseClient
            .from('personal_expenses')
            .select('*')
            .eq('user_id', currentUser.id)
            .order('created_at', { ascending: true }),
            
          // Load business expenses
          window.supabaseClient
            .from('business_expenses')
            .select('*')
            .eq('user_id', currentUser.id)
            .order('created_at', { ascending: true }),
            
          // Load income data
          window.supabaseClient
            .from('income')
            .select('*')
            .eq('user_id', currentUser.id)
            .order('year', { ascending: true })
            .order('created_at', { ascending: true })
        ]);
        
        // Process settings
        if (settingsResult.status === 'fulfilled' && settingsResult.value.data) {
          const settings = settingsResult.value.data;
          state.fx = settings.fx_rate || 48.1843;
          state.theme = settings.theme || 'dark';
          state.autosave = settings.autosave ? 'on' : 'off';
          state.includeAnnualInMonthly = settings.include_annual_in_monthly === true || settings.include_annual_in_monthly === 'true' || false;
          state.inputsLocked = settings.inputs_locked === true || settings.inputs_locked === 'true' || false;
          columnOrder = settings.column_order || ['monthly', 'yearly', 'monthly-egp', 'yearly-egp'];
          
          // Update UI elements to reflect loaded settings
          updateSettingsUI();
          
          // Apply lock state after loading settings
          updateLockIcon();
          updateInputsLockState();
        }
        
        // Process personal expenses
        if (personalResult.status === 'fulfilled' && personalResult.value.data) {
          const personalExpenses = personalResult.value.data;
          state.personal = personalExpenses.map(expense => {
            const row = {
            name: expense.name,
            cost: expense.cost,
            status: expense.status,
            billing: expense.billing,
              monthlyUSD: expense.monthly_usd || 0,
              yearlyUSD: expense.yearly_usd || 0,
              monthlyEGP: expense.monthly_egp || 0,
              yearlyEGP: expense.yearly_egp || 0,
            icon: expense.icon,
            id: expense.id
            };
            // Ensure financial values are calculated if missing
            if (!row.monthlyUSD) row.monthlyUSD = rowMonthlyUSD(row);
            if (!row.yearlyUSD) row.yearlyUSD = rowYearlyUSD(row);
            if (!row.monthlyEGP) row.monthlyEGP = row.monthlyUSD * state.fx;
            if (!row.yearlyEGP) row.yearlyEGP = row.yearlyUSD * state.fx;
            return row;
          });
        }
        
        // Process business expenses
        if (businessResult.status === 'fulfilled' && businessResult.value.data) {
          const businessExpenses = businessResult.value.data;
          state.biz = businessExpenses.map(expense => {
            const row = {
            name: expense.name,
            cost: expense.cost,
            status: expense.status,
            billing: expense.billing,
            next: expense.next_payment ? new Date(expense.next_payment).toISOString().split('T')[0] : '',
              monthlyUSD: expense.monthly_usd || 0,
              yearlyUSD: expense.yearly_usd || 0,
              monthlyEGP: expense.monthly_egp || 0,
              yearlyEGP: expense.yearly_egp || 0,
            icon: expense.icon,
            id: expense.id
            };
            // Ensure financial values are calculated if missing
            if (!row.monthlyUSD) row.monthlyUSD = rowMonthlyUSD(row);
            if (!row.yearlyUSD) row.yearlyUSD = rowYearlyUSD(row);
            if (!row.monthlyEGP) row.monthlyEGP = row.monthlyUSD * state.fx;
            if (!row.yearlyEGP) row.yearlyEGP = row.yearlyUSD * state.fx;
            return row;
          });
        }
        
        // Process income data
        if (incomeResult.status === 'fulfilled' && incomeResult.value.data) {
          const incomeData = incomeResult.value.data;
          // Completely clear and replace income data with Supabase data
          const newIncomeData = {};
          
          // Group income data by year
          incomeData.forEach(income => {
            const year = income.year.toString();
            if (!newIncomeData[year]) {
              newIncomeData[year] = [];
            }
            newIncomeData[year].push({
              name: income.name,
              tags: income.tags,
              date: income.date,
              allPayment: income.all_payment,
              paidUsd: income.paid_usd,
              method: income.method,
              icon: income.icon || 'fa:dollar-sign', // Default icon if not in schema
              id: income.id
            });
          });
          
          // Replace state.income with fresh data from Supabase
          state.income = newIncomeData;
          
          // Update available_years in settings to include all years from income data
          const incomeYears = Object.keys(state.income).map(year => parseInt(year)).sort((a, b) => a - b);
          
          // Create year tabs for all years found in Supabase data
          createYearTabsFromData(state.income);
        } else {
          // If no income data in Supabase, keep the years that were initialized from settings
          // but ensure we have at least the default years
          if (!state.income || Object.keys(state.income).length === 0) {
            state.income = {
              '2022': [],
              '2023': [],
              '2024': [],
              '2025': []
            };
          }
          createYearTabsFromData(state.income);
        }
        
        renderAll();
        showNotification('Data loaded from cloud!', 'success');
        
      } catch (error) {
        console.error('Error loading user data:', error);
        showNotification('Failed to load cloud data. Using local data.', 'error');
        loadLocalData();
      }
    }
    
    function loadLocalData() {
      console.log('Loading local data...');
      // Fallback to localStorage - COMPLETELY REPLACE state, don't merge
      const stored = localStorage.getItem('finance-notion-v6');
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          console.log('Found local data:', parsed);
          
          // Completely reset state to avoid merging
          state = {
            personal: parsed.personal || [],
            biz: parsed.biz || [],
            income: {},
            fx: parsed.fx || 48.1843,
            theme: parsed.theme || 'dark',
            autosave: parsed.autosave || 'on',
            includeAnnualInMonthly: parsed.includeAnnualInMonthly || true
          };
          
          // Handle migration from old income structure to new year-based structure
          if (parsed.income) {
            if (Array.isArray(parsed.income)) {
              // Old structure - migrate to current year
              state.income[currentYear] = parsed.income;
            } else {
              // New structure - use as is
              state.income = parsed.income;
            }
          }
        } catch (e) {
          console.error('Error parsing local data:', e);
        }
      } else {
        console.log('No local data found - initializing with default state');
        // No local data - initialize with default empty state
        state = {
          personal: [],
          biz: [],
          income: {
            '2022': [],
            '2023': [],
            '2024': [],
            '2025': []
          },
          fx: 48.1843,
          theme: 'dark',
          autosave: 'on',
          includeAnnualInMonthly: true
        };
      }
      
      // Ensure income structure exists
      if (!state.income || typeof state.income !== 'object') {
        state.income = {
          '2022': [],
          '2023': [],
          '2024': [],
          '2025': []
        };
      }
      
      console.log('Final state after loading:', state);
      renderAll();
    }
    
    function clearAllData() {
      // Clear all data from state
      state.personal = [];
      state.biz = [];
      state.income = {
        2022: [],
        2023: [],
        2024: [],
        2025: []
      };
      state.fx = 48.1843;
      state.theme = 'dark';
      state.autosave = 'on';
      state.includeAnnualInMonthly = true;
      columnOrder = ['monthly', 'yearly', 'monthly-egp', 'yearly-egp'];
      
      // Clear local storage
      localStorage.removeItem('finance-notion-v6');
      localStorage.removeItem('columnOrder');
      
      // Re-render with empty data
      renderAll();
      
      console.log('All data cleared - showing empty tables');
    }
    
    
    async function saveToSupabase() {
      if (!currentUser || !supabaseReady) return;
      
      try {
        // Get all available years from income data
        const availableYears = Object.keys(state.income).map(year => parseInt(year)).sort((a, b) => a - b);
        console.log('Calculated available years for Supabase:', availableYears);
        
        // Save user settings
        console.log('Saving settings to Supabase:', {
          user_id: currentUser.id,
          fx_rate: state.fx,
          theme: state.theme,
          autosave: state.autosave === 'on',
          include_annual_in_monthly: state.includeAnnualInMonthly,
          column_order: columnOrder,
          available_years: availableYears
        });
        
        await window.supabaseClient
          .from('user_settings')
          .upsert({
            user_id: currentUser.id,
            fx_rate: state.fx,
            theme: state.theme,
            autosave: state.autosave === 'on',
            include_annual_in_monthly: state.includeAnnualInMonthly,
            column_order: columnOrder,
            available_years: availableYears,
            inputs_locked: state.inputsLocked
          }, {
            onConflict: 'user_id'
          });
        
        // Save personal expenses
        for (const expense of state.personal) {
          if (expense.id) {
            // Update existing expense
            await window.supabaseClient
              .from('personal_expenses')
              .update({
                name: expense.name,
                cost: expense.cost,
                status: expense.status,
                billing: expense.billing,
                monthly_usd: expense.monthlyUSD || 0,
                yearly_usd: expense.yearlyUSD || 0,
                monthly_egp: expense.monthlyEGP || 0,
                yearly_egp: expense.yearlyEGP || 0,
                icon: expense.icon
              })
              .eq('id', expense.id);
          } else {
            // Create new expense
            const { data: newExpense, error } = await window.supabaseClient
              .from('personal_expenses')
              .insert({
                user_id: currentUser.id,
                name: expense.name,
                cost: expense.cost,
                status: expense.status,
                billing: expense.billing,
                monthly_usd: expense.monthlyUSD || 0,
                yearly_usd: expense.yearlyUSD || 0,
                monthly_egp: expense.monthlyEGP || 0,
                yearly_egp: expense.yearlyEGP || 0,
                icon: expense.icon
              })
              .select()
              .single();
            
            if (newExpense) {
              expense.id = newExpense.id;
            }
          }
        }
        
        // Save business expenses
        for (const expense of state.biz) {
          if (expense.id) {
            // Update existing expense
            await window.supabaseClient
              .from('business_expenses')
              .update({
                name: expense.name,
                cost: expense.cost,
                status: expense.status,
                billing: expense.billing,
                next_payment: expense.next ? new Date(expense.next).toISOString().split('T')[0] : null,
                monthly_usd: expense.monthlyUSD || 0,
                yearly_usd: expense.yearlyUSD || 0,
                monthly_egp: expense.monthlyEGP || 0,
                yearly_egp: expense.yearlyEGP || 0,
                icon: expense.icon
              })
              .eq('id', expense.id);
          } else {
            // Create new expense
            const { data: newExpense, error } = await window.supabaseClient
              .from('business_expenses')
              .insert({
                user_id: currentUser.id,
                name: expense.name,
                cost: expense.cost,
                status: expense.status,
                billing: expense.billing,
                next_payment: expense.next ? new Date(expense.next).toISOString().split('T')[0] : null,
                monthly_usd: expense.monthlyUSD || 0,
                yearly_usd: expense.yearlyUSD || 0,
                monthly_egp: expense.monthlyEGP || 0,
                yearly_egp: expense.yearlyEGP || 0,
                icon: expense.icon
              })
              .select()
              .single();
            
            if (newExpense) {
              expense.id = newExpense.id;
            }
          }
        }
        
        // Save income data for all years
        console.log('Saving income data for years:', Object.keys(state.income));
        let incomeSaveCount = 0;
        let incomeErrorCount = 0;
        
        for (const [year, incomeData] of Object.entries(state.income)) {
          console.log(`Saving ${incomeData.length} income records for year ${year}`);
          
          for (const income of incomeData) {
            try {
              console.log('Saving income record:', income);
              
              if (income.id) {
                // Update existing income
                const { error: updateError } = await window.supabaseClient
                  .from('income')
                  .update({
                    name: income.name || '',
                    tags: income.tags || '',
                    date: income.date || new Date().toISOString().split('T')[0],
                    all_payment: income.allPayment || 0,
                    paid_usd: income.paidUsd || 0,
                    method: income.method || 'Bank Transfer',
                    icon: income.icon || 'fa:dollar-sign',
                    year: parseInt(year)
                  })
                  .eq('id', income.id);
                
                if (updateError) {
                  console.error('Error updating income record:', updateError);
                  incomeErrorCount++;
                } else {
                  console.log('Successfully updated income record:', income.id);
                  incomeSaveCount++;
                }
              } else {
                // Create new income
                const { data: newIncome, error: insertError } = await window.supabaseClient
                  .from('income')
                  .insert({
                    user_id: currentUser.id,
                    name: income.name || '',
                    tags: income.tags || '',
                    date: income.date || new Date().toISOString().split('T')[0],
                    all_payment: income.allPayment || 0,
                    paid_usd: income.paidUsd || 0,
                    paid_egp: income.paidEgp || null,
                    method: income.method || 'Bank Transfer',
                    icon: income.icon || 'fa:dollar-sign',
                    year: parseInt(year)
                  })
                  .select()
                  .single();
                
                if (insertError) {
                  console.error('Error creating income record:', insertError);
                  incomeErrorCount++;
                } else if (newIncome) {
                  income.id = newIncome.id;
                  console.log('Successfully created income record:', newIncome.id);
                  incomeSaveCount++;
                }
              }
            } catch (error) {
              console.error('Unexpected error saving income record:', error);
              incomeErrorCount++;
            }
          }
        }
        
        console.log(`Income save completed: ${incomeSaveCount} successful, ${incomeErrorCount} errors`);
        
        showSaveIndicator();
      } catch (error) {
        console.error('Error saving to Supabase:', error);
        showSaveError();
      }
    }
    
    function saveToLocal() {
      try {
        localStorage.setItem('finance-notion-v6', JSON.stringify(state));
        localStorage.setItem('columnOrder', JSON.stringify(columnOrder));
        showSaveIndicator();
      } catch (error) {
        console.error('Failed to save data locally:', error);
        showSaveError();
      }
    }
    
    // Original localStorage key for fallback
    const LS_KEY = 'finance-notion-v6';



    const defaultState = {
      fx: 48.1843,
      autosave: 'on',
      autosaveInterval: 15,
      theme: 'dark',
        includeAnnualInMonthly: false,
      inputsLocked: false,
      personal: [],
      biz: [],
      income: {
        2022: [],
        2023: [],
        2024: [],
        2025: []
      }
    };

    function load(){ 
      // This function is now handled by loadUserData() and loadLocalData()
      return structuredClone(defaultState);
    }
    
    function save(source = 'general'){ 
      // Check if lock is active - if so, only save locally, not to cloud
      if (state.inputsLocked && currentUser && supabaseReady) {
        console.log('Lock is active - saving locally only, not to cloud');
        saveToLocal();
        return;
      }
      
      // If user is signed in, use instant save for 0ms cloud sync
      if (currentUser && supabaseReady) {
        instantSaveAll(source);
      } else {
        // Fallback to regular live save for local storage
        liveSave(source);
      }
    }
    
    // Autocomplete functionality
    function saveInputValue(field, value) {
      if (!value || value.trim() === '') return;
      
      if (!state.autocomplete) {
        state.autocomplete = {};
      }
      
      if (!state.autocomplete[field]) {
        state.autocomplete[field] = [];
      }
      
      // Add value if not already exists
      if (!state.autocomplete[field].includes(value.trim())) {
        state.autocomplete[field].unshift(value.trim());
        // Keep only last 10 values
        if (state.autocomplete[field].length > 10) {
          state.autocomplete[field] = state.autocomplete[field].slice(0, 10);
        }
        save();
      }
    }
    
    function getAutocompleteValues(field) {
      return state.autocomplete && state.autocomplete[field] ? state.autocomplete[field] : [];
    }
    
    function addAutocompleteToInput(input, field) {
      const autocompleteValues = getAutocompleteValues(field);
      if (autocompleteValues.length > 0) {
        input.setAttribute('list', `autocomplete-${field}`);
        
        // Create or update datalist
        let datalist = document.getElementById(`autocomplete-${field}`);
        if (!datalist) {
          datalist = document.createElement('datalist');
          datalist.id = `autocomplete-${field}`;
          document.body.appendChild(datalist);
        }
        
        // Clear existing options
        datalist.innerHTML = '';
        
        // Add options
        autocompleteValues.forEach(value => {
          const option = document.createElement('option');
          option.value = value;
          datalist.appendChild(option);
        });
      }
    }
  
  // Super Minimal Notification System
  function showNotification(message, type = 'success', duration = 3000) {
    const notificationCenter = document.getElementById('notificationCenter');
    const text = notificationCenter.querySelector('.notification-text');
    
    // Set message
    text.textContent = message;
    
    // Set type class for glow effect
    notificationCenter.className = `notification-center ${type}`;
    
    // Show notification
    notificationCenter.style.opacity = '1';
    notificationCenter.style.transform = 'translate(-50%, 0) translateX(0)';
    notificationCenter.classList.add('show');
    
    // Hide after duration
    setTimeout(() => {
      notificationCenter.classList.remove('show');
      notificationCenter.classList.add('hide');
      setTimeout(() => {
        notificationCenter.style.opacity = '0';
        notificationCenter.style.transform = 'translate(-50%, 0) translateX(20px)';
        notificationCenter.classList.remove('hide');
      }, 300);
    }, duration);
  }
  
  function showSaveIndicator() {
    if (currentUser && supabaseReady) {
      showNotification('Saved to cloud', 'save', 2000);
    } else {
      showNotification('Saved locally', 'save', 2000);
    }
  }
  
  function showSaveError() {
    if (currentUser && supabaseReady) {
      showNotification('Cloud save failed', 'error', 3000);
    } else {
      showNotification('Local save failed', 'error', 3000);
    }
  }

    let state = structuredClone(defaultState);
    
    // Initialize column order from localStorage or default
    const defaultColumnOrder = ['monthly', 'yearly', 'monthly-egp', 'yearly-egp'];
    let columnOrder = defaultColumnOrder;
    
    // Initialize autosave status
    updateAutosaveStatus();
    
    
    
    // Simplified system - no trial/license restrictions
    function hasFullAccess() { return true; }
    function isTrialExpired() { return false; }
    function isLicenseValid() { return true; }
    function setLicense(license) { return true; }
    function enableAllFunctions() { /* All functions enabled by default */ }
    function disableAllFunctions() { /* No restrictions */ }
    function getTrialDaysRemaining() { return 999; }

    // Theme
    function applyTheme(){ 
      document.documentElement.setAttribute('data-theme', state.theme==='light' ? 'light':'dark'); 
      const themeIcon = $('#iconTheme');
      if (state.theme === 'light') {
        // Show moon icon for light mode
        themeIcon.innerHTML = '<path d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"/>';
      } else {
        // Show sun icon for dark mode
        themeIcon.innerHTML = '<path d="M12 3v1m0 16v1m9-9h1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"/>';
      }
    }
    applyTheme();
    $('#btnTheme').addEventListener('click', ()=>{ state.theme = state.theme==='light'?'dark':'light'; save(); applyTheme(); });

    // Lock/Unlock functionality
    $('#btnLock').addEventListener('click', toggleInputsLock);
    
    function toggleInputsLock() {
      state.inputsLocked = !state.inputsLocked;
      updateLockIcon();
      updateInputsLockState();
      save('lock');
      
      // Save lock state to cloud if user is authenticated
      if (currentUser) {
        saveLockStateToCloud();
      }
    }
    
    function updateLockIcon() {
      const lockIcon = $('#iconLock');
      const lockBtn = $('#btnLock');
      
      if (state.inputsLocked) {
        // Show open lock icon when inputs are locked (unlock state)
        lockIcon.innerHTML = '<path d="M8 11V7a4 4 0 0 1 8 0v4"/><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M12 15v2"/>';
        lockBtn.title = 'Unlock all inputs';
        lockBtn.style.borderColor = 'var(--primary)';
        lockBtn.style.background = 'rgba(var(--primary-rgb), 0.1)';
      } else {
        // Show closed lock icon when inputs are unlocked (lock state)
        lockIcon.innerHTML = '<path d="M12 15v2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>';
        lockBtn.title = 'Lock all inputs';
        lockBtn.style.borderColor = 'var(--stroke)';
        lockBtn.style.background = 'transparent';
      }
    }
    
    function updateInputsLockState() {
      // Get all interactive elements
      const allInputs = document.querySelectorAll('input, select, textarea');
      const allButtons = document.querySelectorAll('.delete-btn, .icon-cell button');
      const allToggles = document.querySelectorAll('.status-toggle, .billing-toggle');
      const allFinancialInputs = document.querySelectorAll('.financial-input-wrapper, .calculated-div, .cost-input, [data-row-index]');
      const allDateInputs = document.querySelectorAll('.date-input-minimal, input[type="date"]');
      const allClickableElements = document.querySelectorAll('[onclick], [data-clickable]');
      const addRowButtons = document.querySelectorAll('button[data-add-row]');
      
      // Get income-specific elements
      const allIncomeInputs = document.querySelectorAll('.row-income input, .row-income select, .row-income textarea, .tag-input, .method-custom-input');
      const allIncomeClickable = document.querySelectorAll('.row-income .editable-value, .row-income .method-trigger-minimal, .row-income .tag-input-wrapper');
      
      // Get all X buttons and remove buttons from rows
      const allXButtons = document.querySelectorAll('.method-remove-btn, .tag-chip-remove, .year-btn-remove, .year-btn, .year-add-between, .year-add-btn');
      const allDeleteButtons = document.querySelectorAll('.delete-btn');
      
      // Get tag input fields specifically for hiding when locked
      const allTagInputs = document.querySelectorAll('.tag-input');
      
      // Combine all elements (excluding add row buttons for now)
      const allElements = [
        ...allInputs, 
        ...allButtons, 
        ...allToggles, 
        ...allFinancialInputs, 
        ...allDateInputs,
        ...allClickableElements,
        ...allIncomeInputs,
        ...allIncomeClickable
      ];
      
      allElements.forEach(element => {
        if (state.inputsLocked) {
          // Disable the element but keep its appearance
          element.disabled = true;
          element.style.pointerEvents = 'none';
          element.style.userSelect = 'none';
          
          // Add a subtle overlay to indicate it's locked without changing the original style
          if (!element.querySelector('.lock-indicator')) {
            const lockIndicator = document.createElement('div');
            lockIndicator.className = 'lock-indicator';
            lockIndicator.style.cssText = `
              position: absolute;
              top: 0;
              left: 0;
              right: 0;
              bottom: 0;
              background: rgba(0, 0, 0, 0.1);
              border-radius: inherit;
              pointer-events: none;
              z-index: 1;
            `;
            
            // Make parent relative if not already
            const computedStyle = getComputedStyle(element);
            if (computedStyle.position === 'static') {
              element.style.position = 'relative';
            }
            
            element.appendChild(lockIndicator);
          }
        } else {
          // Re-enable the element
          element.disabled = false;
          element.style.pointerEvents = 'auto';
          element.style.userSelect = 'auto';
          
          // Remove lock indicator
          const lockIndicator = element.querySelector('.lock-indicator');
          if (lockIndicator) {
            lockIndicator.remove();
          }
        }
      });
      
      // Handle "Add row" buttons - hide them when locked
      addRowButtons.forEach(button => {
        if (state.inputsLocked) {
          button.style.display = 'none';
        } else {
          button.style.display = '';
        }
      });
      
      // Handle X buttons and remove buttons - hide them when locked
      [...allXButtons, ...allDeleteButtons].forEach(button => {
        if (state.inputsLocked) {
          button.style.display = 'none';
        } else {
          button.style.display = '';
        }
      });
      
      // Handle tag input fields - hide them when locked but keep tag badges visible
      allTagInputs.forEach(tagInput => {
        const wrapper = tagInput.closest('.tag-input-wrapper');
        if (state.inputsLocked) {
          tagInput.style.display = 'none';
          if (wrapper) {
            wrapper.classList.add('locked');
          }
        } else {
          tagInput.style.display = '';
          if (wrapper) {
            wrapper.classList.remove('locked');
          }
        }
      });
      
      // Handle Paid EGP cells - add locked class to hide background
      const allPaidEgpCells = document.querySelectorAll('.paid-egp-cell.editable-value');
      allPaidEgpCells.forEach(cell => {
        if (state.inputsLocked) {
          cell.classList.add('locked');
        } else {
          cell.classList.remove('locked');
        }
      });
      
      // Show notification
      if (state.inputsLocked) {
        showNotification('All inputs locked', 'info', 2000);
      } else {
        showNotification('All inputs unlocked', 'success', 2000);
      }
    }
    
    // Function to save lock state to cloud
    async function saveLockStateToCloud() {
      if (!currentUser) return;
      
      try {
        await window.supabaseClient
          .from('user_settings')
          .upsert({
            user_id: currentUser.id,
            inputs_locked: state.inputsLocked
          }, {
            onConflict: 'user_id'
          });
        
        console.log('Lock state saved to cloud:', state.inputsLocked);
      } catch (error) {
        console.error('Error saving lock state to cloud:', error);
        showNotification('Failed to sync lock state to cloud', 'error', 3000);
      }
    }

    // Enhanced live saving functionality
    let saveTimeout = null;
    let isSaving = false;
    let saveQueue = new Set(); // Track what needs saving
    let lastSaveTime = 0;
    const MIN_SAVE_INTERVAL = 200; // Minimum 200ms between saves
    const MAX_DEBOUNCE_TIME = 1000; // Maximum 1 second debounce

    function liveSave(source = 'unknown') {
      console.log('Live save triggered from:', source);
      
      // Add to save queue
      saveQueue.add(source);
      
      // Skip if already saving
      if (isSaving) {
        console.log('Save already in progress, queuing...');
        return;
      }
      
      // Save immediately - 0ms delay for instant cloud sync
          isSaving = true;
          updateSyncStatus('syncing');
      console.log('Executing live save instantly for sources:', Array.from(saveQueue));
          
          // Check if lock is active - if so, only save locally, not to cloud
          const shouldSaveToCloud = currentUser && supabaseReady && !state.inputsLocked;
          const savePromise = shouldSaveToCloud ? saveToSupabase() : saveToLocal();
          
          savePromise.then(() => {
        lastSaveTime = Date.now();
            updateSyncStatus('success');
        showNotification('Data saved instantly', 'success', 800);
            setTimeout(() => {
              updateSyncStatus('');
              isSaving = false;
          saveQueue.clear();
        }, 800);
          }).catch((error) => {
            console.error('Save error:', error);
            updateSyncStatus('error');
            showNotification('Save failed', 'error', 2000);
            setTimeout(() => {
              updateSyncStatus('');
              isSaving = false;
          saveQueue.clear();
            }, 2000);
          });
        }
    
    // Instant save function for all inputs - 0ms delay
    let instantSaveInProgress = new Set();
    
    async function instantSaveAll(source = 'general') {
      // Check if lock is active - if so, only save locally, not to cloud
      if (state.inputsLocked) {
        console.log('Lock is active - saving locally only, not to cloud');
        saveToLocal();
        return;
      }
      
      if (!currentUser || !supabaseReady) {
        console.log('Supabase not ready, falling back to local save');
        saveToLocal();
        return;
      }
      
      const saveKey = `instant-${source}-${Date.now()}`;
      
      // Prevent duplicate saves
      if (instantSaveInProgress.has(saveKey)) {
        return;
      }
      
      instantSaveInProgress.add(saveKey);
      
      try {
        console.log('Instant save to cloud:', source);
        updateSyncStatus('syncing');
        
        // Save to cloud immediately
        await saveToSupabase();
        
        updateSyncStatus('success');
        showNotification('Synced to cloud instantly', 'success', 1000);
        
        // Also save locally as backup
        saveToLocal();
        
      } catch (error) {
        console.error('Instant save error:', error);
        updateSyncStatus('error');
        showNotification('Cloud sync failed', 'error', 2000);
        
        // Fallback to local save
        saveToLocal();
      } finally {
        // Remove from in-progress set
        instantSaveInProgress.delete(saveKey);
        setTimeout(() => {
          updateSyncStatus('');
        }, 1000);
      }
    }

    // Instant save function specifically for income data
    let incomeDebounceTimeouts = new Map();
    
    // Instant save function for expense financial inputs - 0ms delay
    let expenseSaveInProgress = new Set();
    
    async function instantSaveExpenseRow(expenseRow, isBiz) {
      // Check if lock is active - if so, only save locally, not to cloud
      if (state.inputsLocked) {
        console.log('Lock is active - saving expense row locally only, not to cloud');
        saveToLocal();
        return;
      }
      
      if (!currentUser || !supabaseReady) {
        console.log('Supabase not ready, falling back to local save');
        saveToLocal();
        return;
      }
      
      const tableName = isBiz ? 'business_expenses' : 'personal_expenses';
      const rowKey = `${tableName}-${expenseRow.id || 'new'}`;
      
      // Prevent duplicate saves for the same row
      if (expenseSaveInProgress.has(rowKey)) {
        return;
      }
      
      expenseSaveInProgress.add(rowKey);
      
      try {
        if (expenseRow.id) {
          // Update existing row - 0ms delay
          const { error } = await window.supabaseClient
            .from(tableName)
            .update({
              name: expenseRow.name,
              cost: expenseRow.cost,
              status: expenseRow.status,
              billing: expenseRow.billing,
              next_payment: expenseRow.next ? new Date(expenseRow.next).toISOString().split('T')[0] : null,
              monthly_usd: expenseRow.monthlyUSD || 0,
              yearly_usd: expenseRow.yearlyUSD || 0,
              monthly_egp: expenseRow.monthlyEGP || 0,
              yearly_egp: expenseRow.yearlyEGP || 0,
              icon: expenseRow.icon
            })
            .eq('id', expenseRow.id);
            
          if (error) throw error;
          console.log('Expense row updated in cloud instantly:', expenseRow.id);
        } else {
          // Create new row - 0ms delay
          const { data, error } = await window.supabaseClient
            .from(tableName)
            .insert({
              name: expenseRow.name,
              cost: expenseRow.cost,
              status: expenseRow.status,
              billing: expenseRow.billing,
              next_payment: expenseRow.next ? new Date(expenseRow.next).toISOString().split('T')[0] : null,
              monthly_usd: expenseRow.monthlyUSD || 0,
              yearly_usd: expenseRow.yearlyUSD || 0,
              monthly_egp: expenseRow.monthlyEGP || 0,
              yearly_egp: expenseRow.yearlyEGP || 0,
              icon: expenseRow.icon
            })
            .select()
            .single();
            
          if (error) throw error;
          
          // Update the local row with the new ID
          expenseRow.id = data.id;
          console.log('Expense row created in cloud instantly:', data.id);
        }
        
        // Also save locally as backup
        saveToLocal();
        
      } catch (error) {
        console.error('Error saving expense row to cloud:', error);
        // Fallback to local save
        saveToLocal();
      } finally {
        // Remove from in-progress set
        expenseSaveInProgress.delete(rowKey);
      }
    }
    
    async function instantSaveIncomeRow(incomeRow, year) {
      // Check if lock is active - if so, only save locally, not to cloud
      if (state.inputsLocked) {
        console.log('Lock is active - saving income row locally only, not to cloud');
        saveToLocal();
        return;
      }
      
      if (!currentUser || !supabaseReady) {
        console.log('Supabase not ready, falling back to local save');
        saveToLocal();
        return;
      }
      
      // Create a unique key for this income row to prevent duplicate saves
      const rowKey = incomeRow.id || `temp_${incomeRow.name}_${incomeRow.date}`;
      
      // Prevent duplicate saves for the same row
      if (incomeSaveInProgress && incomeSaveInProgress.has(rowKey)) {
        return;
      }
      
      // Initialize the set if it doesn't exist
      if (!incomeSaveInProgress) {
        incomeSaveInProgress = new Set();
      }
      
      incomeSaveInProgress.add(rowKey);
      
      // Save immediately - 0ms delay
        try {
          
          if (incomeRow.id) {
            // Update existing income record
            // Try to update with paid_egp first, fallback if field doesn't exist
            let updateError;
            try {
              const { error } = await window.supabaseClient
              .from('income')
              .update({
                name: incomeRow.name || '',
                tags: incomeRow.tags || '',
                date: incomeRow.date || new Date().toISOString().split('T')[0],
                all_payment: incomeRow.allPayment || 0,
                paid_usd: incomeRow.paidUsd || 0,
                  paid_egp: incomeRow.paidEgp || null,
                method: incomeRow.method || 'Bank Transfer',
                icon: incomeRow.icon || 'fa:dollar-sign',
                year: parseInt(year),
                updated_at: new Date().toISOString()
              })
              .eq('id', incomeRow.id);
              updateError = error;
            } catch (schemaError) {
              // If paid_egp field doesn't exist, fallback to without it
              console.warn('paid_egp field not found, falling back to standard fields:', schemaError);
              const { error } = await window.supabaseClient
                .from('income')
                .update({
                  name: incomeRow.name || '',
                  tags: incomeRow.tags || '',
                  date: incomeRow.date || new Date().toISOString().split('T')[0],
                  all_payment: incomeRow.allPayment || 0,
                  paid_usd: incomeRow.paidUsd || 0,
                  method: incomeRow.method || 'Bank Transfer',
                  icon: incomeRow.icon || 'fa:dollar-sign',
                  year: parseInt(year),
                  updated_at: new Date().toISOString()
                })
                .eq('id', incomeRow.id);
              updateError = error;
            }
            
            if (updateError) {
              console.error('Error updating income row:', updateError);
              showNotification('Failed to save changes, retrying...', 'error', 2000);
              
              // Retry once after a short delay
              setTimeout(async () => {
                try {
                  const { error: retryError } = await window.supabaseClient
                    .from('income')
                    .update({
                      tags: incomeRow.tags || '',
                      updated_at: new Date().toISOString()
                    })
                    .eq('id', incomeRow.id);
                  
                  if (retryError) {
                    showNotification('Failed to sync tags', 'error', 3000);
                  } else {
                    showNotification('Tags synced', 'success', 1000);
                  }
                } catch (retryErr) {
                  // Silent retry error
                }
              }, 1000);
              
              throw updateError;
            } else {
              showNotification('Tags updated', 'success', 800);
            }
          } else {
            // Create new income record
            const { data: newIncome, error: insertError } = await window.supabaseClient
              .from('income')
              .insert({
                user_id: currentUser.id,
                name: incomeRow.name || '',
                tags: incomeRow.tags || '',
                date: incomeRow.date || new Date().toISOString().split('T')[0],
                all_payment: incomeRow.allPayment || 0,
                paid_usd: incomeRow.paidUsd || 0,
                paid_egp: incomeRow.paidEgp || null,
                method: incomeRow.method || 'Bank Transfer',
                icon: incomeRow.icon || 'fa:dollar-sign',
                year: parseInt(year)
              })
              .select()
              .single();
            
            if (insertError) {
              console.error('Error creating income record:', insertError);
              showNotification('Failed to save income', 'error', 2000);
              throw insertError;
            } else {
              console.log('Successfully created income record:', newIncome);
              // Update the local row with the new ID
              if (newIncome) {
                incomeRow.id = newIncome.id;
              }
              showNotification('Income saved', 'success', 800);
            }
          }
          
          // Also save to local storage as backup
          saveToLocal();
          
        } catch (error) {
          console.error('Error in instant save income:', error);
          showNotification('Failed to save income', 'error', 2000);
          // Fallback to local save
          saveToLocal();
        } finally {
          // Remove from in-progress set
          incomeSaveInProgress.delete(rowKey);
        }
    }

    // Direct save function for tag removal (no debouncing)
    async function saveIncomeRowDirectly(incomeRow, year) {
      // Check if lock is active - if so, only save locally, not to cloud
      if (state.inputsLocked) {
        console.log('Lock is active - saving income row locally only, not to cloud');
        saveToLocal();
        return;
      }
      
      if (!currentUser || !supabaseReady) {
        saveToLocal();
        return;
      }
      
      try {
        
        if (incomeRow.id) {
          // Update existing income record directly
          // Try to update with paid_egp first, fallback to tags only if it fails
          let updateError;
          try {
            const { error } = await window.supabaseClient
              .from('income')
              .update({
                tags: incomeRow.tags || '',
                paid_egp: incomeRow.paidEgp || null,
                updated_at: new Date().toISOString()
              })
              .eq('id', incomeRow.id);
            updateError = error;
          } catch (schemaError) {
            // If paid_egp field doesn't exist, fallback to tags only
            console.warn('paid_egp field not found, falling back to tags only:', schemaError);
            const { error } = await window.supabaseClient
              .from('income')
              .update({
                tags: incomeRow.tags || '',
                updated_at: new Date().toISOString()
              })
              .eq('id', incomeRow.id);
            updateError = error;
          }
          
          if (updateError) {
            showNotification('Failed to save changes', 'error', 2000);
            throw updateError;
          } else {
            showNotification('Changes synced', 'success', 800);
          }
        } else {
          instantSaveIncomeRow(incomeRow, year);
        }
      } catch (error) {
        console.error('Error syncing changes:', error);
        showNotification(`Failed to sync changes: ${error.message}`, 'error', 3000);
      }
    }

    // Sequential save function for imported income data
    async function saveImportedIncomeSequentially(importedIncomeData) {
      if (!currentUser || !supabaseReady) {
        return;
      }

      let totalRows = 0;
      let savedRows = 0;
      let errorRows = 0;

      // Count total rows to save
      for (const [year, yearData] of Object.entries(importedIncomeData)) {
        totalRows += yearData.length;
      }

      if (totalRows === 0) {
        return;
      }

      showNotification(`Saving ${totalRows} imported income rows to cloud...`, 'info', 3000);

      try {
        // Process each year sequentially
        for (const [year, yearData] of Object.entries(importedIncomeData)) {
          const rowsToSave = yearData || [];
          
          if (rowsToSave.length === 0) continue;

          // Process each row in the year sequentially
          for (let i = 0; i < rowsToSave.length; i++) {
            const incomeRow = rowsToSave[i];
            
            // Find the corresponding row in state.income to update with the new ID
            const stateRowIndex = (state.income[year] || []).findIndex(stateRow => 
              stateRow.name === incomeRow.name && 
              stateRow.date === incomeRow.date &&
              stateRow.allPayment === incomeRow.allPayment &&
              !stateRow.id
            );
            
            try {
              // Use direct Supabase call instead of instantSaveIncomeRow to avoid debouncing
              const { data: newIncome, error: insertError } = await window.supabaseClient
                .from('income')
                .insert({
                  user_id: currentUser.id,
                  name: incomeRow.name || '',
                  tags: incomeRow.tags || '',
                  date: incomeRow.date || new Date().toISOString().split('T')[0],
                  all_payment: incomeRow.allPayment || 0,
                  paid_usd: incomeRow.paidUsd || 0,
                  paid_egp: incomeRow.paidEgp || null,
                  method: incomeRow.method || 'Bank Transfer',
                  icon: incomeRow.icon || 'fa:dollar-sign',
                  year: parseInt(year)
                })
                .select()
                .single();

              if (insertError) {
                errorRows++;
              } else {
                // Update the corresponding row in state.income with the new ID
                if (stateRowIndex >= 0) {
                  state.income[year][stateRowIndex].id = newIncome.id;
                }
                savedRows++;
              }

              // Small delay between saves to avoid overwhelming the API
              if (i < rowsToSave.length - 1) {
                await new Promise(resolve => setTimeout(resolve, 300));
              }

            } catch (error) {
              errorRows++;
            }
          }

          // Delay between years
          await new Promise(resolve => setTimeout(resolve, 500));
        }

        // Show final result
        if (errorRows === 0) {
          showNotification(`Successfully saved all ${savedRows} imported income rows to cloud!`, 'success', 3000);
        } else {
          showNotification(`Saved ${savedRows}/${totalRows} imported rows (${errorRows} failed)`, 'warning', 4000);
        }

        // Save to local storage as backup
        saveToLocal();

      } catch (error) {
        showNotification('Failed to save imported income data', 'error', 3000);
      }
    }

    // Helper function to find and save any income rows without IDs
    async function saveAllRowsWithoutIds() {
      if (!currentUser || !supabaseReady) {
        showNotification('Please sign in first to save to cloud', 'error', 3000);
        return;
      }

      const rowsWithoutIds = {};
      let totalCount = 0;

      // Find all rows without IDs
      for (const [year, yearData] of Object.entries(state.income || {})) {
        const rowsInYear = yearData.filter(row => !row.id);
        if (rowsInYear.length > 0) {
          rowsWithoutIds[year] = rowsInYear;
          totalCount += rowsInYear.length;
        }
      }

      if (totalCount === 0) {
        showNotification('All income rows already have IDs', 'info', 2000);
        return;
      }

      showNotification(`Found ${totalCount} rows to save. Starting save process...`, 'info', 2000);

      // Create cleaned data (remove any lingering IDs)
      const cleanedData = {};
      Object.keys(rowsWithoutIds).forEach(year => {
        cleanedData[year] = rowsWithoutIds[year].map(row => {
          const cleanRow = { ...row };
          delete cleanRow.id;
          return cleanRow;
        });
      });

      // Use the sequential save function
      await saveImportedIncomeSequentially(cleanedData);
    }

    function refreshData() {
      const refreshIcon = document.getElementById('iconRefresh');
      const syncStatus = document.getElementById('syncStatus');
      const originalTransform = refreshIcon.style.transform;
      
      // Update sync status
      updateSyncStatus('syncing');
      
      // Add spinning animation
      refreshIcon.style.transform = 'rotate(360deg)';
      refreshIcon.style.transition = 'transform 0.5s ease';
      
      // Only load fresh data from cloud - no saving
      if (currentUser && supabaseReady) {
        loadUserData().then(() => {
          updateSyncStatus('success');
          showNotification('Data synced from cloud', 'success', 2000);
          resetRefreshIcon();
        }).catch((error) => {
          updateSyncStatus('error');
          showNotification('Cloud sync failed', 'error', 2000);
          resetRefreshIcon();
        });
      } else {
        updateSyncStatus('offline');
        showNotification('Not connected to cloud', 'info', 2000);
        resetRefreshIcon();
      }
      
      function resetRefreshIcon() {
        setTimeout(() => {
          refreshIcon.style.transform = originalTransform;
          // Keep success status for 2 seconds, then hide
          if (syncStatus.classList.contains('success')) {
            setTimeout(() => {
              updateSyncStatus('');
            }, 2000);
          }
        }, 500);
      }
    }
    
    function updateSyncStatus(status) {
      const syncStatus = document.getElementById('syncStatus');
      if (!syncStatus) return;
      
      // Remove all status classes
      syncStatus.classList.remove('syncing', 'success', 'error', 'offline');
      
      // Add new status class
      if (status) {
        syncStatus.classList.add(status);
      }
    }
    
    async function syncWithCloud() {
      try {
        // First, save current data to cloud
        await saveToSupabase();
        
        // Then, load fresh data from cloud
        await loadUserData();
        
        // Verify sync was successful
        if (currentUser && supabaseReady) {
          console.log('Cloud sync completed successfully');
          return true;
        } else {
          throw new Error('Sync verification failed');
        }
      } catch (error) {
        console.error('Cloud sync error:', error);
        throw error;
      }
    }

    // Live saving is always enabled - no need for auto-refresh intervals
    
    // Check connection status and update sync indicator
    function checkConnectionStatus() {
      const syncStatus = document.getElementById('syncStatus');
      if (!syncStatus) return;
      
      if (navigator.onLine) {
        if (currentUser && supabaseReady) {
          updateSyncStatus('success');
        } else {
          updateSyncStatus('offline');
        }
      } else {
        updateSyncStatus('error');
      }
    }
    
    // Monitor connection status
    window.addEventListener('online', () => {
      checkConnectionStatus();
      showNotification('Connection restored', 'success', 2000);
    });
    
    window.addEventListener('offline', () => {
      updateSyncStatus('error');
      showNotification('Connection lost - using offline mode', 'warning', 3000);
    });
    
    // Initial connection check
    checkConnectionStatus();

    // Manual refresh button
    $('#btnRefresh').addEventListener('click', refreshData);

    // Numbers
    const nfUSD = new Intl.NumberFormat('en-US',{style:'currency', currency:'USD', maximumFractionDigits:2});
    const nfINT = new Intl.NumberFormat('en-US');
    const usdToEgp = (usd)=> usd * Number(state.fx || 0);
    const rowMonthlyUSD = (r)=> {
      if (r.status !== 'Active') return 0;
      if (r.billing === 'Monthly') return Number(r.cost||0);
      if (r.billing === 'Annually') {
        return state.includeAnnualInMonthly ? Number(r.cost||0)/12 : 0;
      }
      return 0;
    };
    const rowYearlyUSD  = (r)=> r.status==='Active' ? (r.billing==='Monthly' ? Number(r.cost||0)*12 : Number(r.cost||0)) : 0;
    function totals(arr){ const mUSD=arr.reduce((s,r)=>s+rowMonthlyUSD(r),0); const yUSD=arr.reduce((s,r)=>s+rowYearlyUSD(r),0); return { mUSD, yUSD, mEGP: usdToEgp(mUSD), yEGP: usdToEgp(yUSD) }; }
    
    // Income calculation functions
    // For income, each entry is a single payment, not a recurring amount
    const rowIncomeMonthlyUSD = (r) => {
      // Income entries are individual payments, so monthly = 0 unless it's this month
      const paymentDate = new Date(r.date);
      const now = new Date();
      const isThisMonth = paymentDate.getFullYear() === now.getFullYear() && 
                         paymentDate.getMonth() === now.getMonth();
      return isThisMonth ? Number(r.paidUsd || 0) : 0;
    };
    const rowIncomeYearlyUSD = (r) => {
      // Income entries are individual payments, so yearly = 0 unless it's this year
      const paymentDate = new Date(r.date);
      const now = new Date();
      const isThisYear = paymentDate.getFullYear() === now.getFullYear();
      return isThisYear ? Number(r.paidUsd || 0) : 0;
    };
    
    // Calculate lifetime income totals across all years
    function lifetimeIncomeTotals() {
      let totalUSD = 0;
      let totalEGP = 0;
      let totalEntries = 0;
      let earliestDate = null;
      let latestDate = null;
      
      // Sum up income from all years and find date range
      Object.keys(state.income).forEach(year => {
        const yearData = state.income[year] || [];
        yearData.forEach(r => {
          const usdAmount = Number(r.paidUsd || 0);
          totalUSD += usdAmount;
          totalEGP += usdAmount * Number(state.fx || 0); // Calculate EGP from USD
          totalEntries++;
          
          // Track date range for accurate time calculations
          if (r.date) {
            const entryDate = new Date(r.date);
            if (!earliestDate || entryDate < earliestDate) {
              earliestDate = entryDate;
            }
            if (!latestDate || entryDate > latestDate) {
              latestDate = entryDate;
            }
          }
        });
      });
      
      // Calculate time span in different units
      const now = new Date();
      const startDate = earliestDate || now;
      const endDate = latestDate || now;
      
      // Calculate actual time span (not just current year)
      const totalDays = Math.max(1, Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)) + 1);
      const totalHours = totalDays * 24;
      const totalMinutes = totalHours * 60;
      const totalSeconds = totalMinutes * 60;
      
      // Calculate years span
      const yearsSpan = Math.max(1, endDate.getFullYear() - startDate.getFullYear() + 1);
      const monthsSpan = Math.max(1, yearsSpan * 12);
      
      return {
        // Totals
        totalUSD,
        totalEGP,
        totalEntries,
        
        // Time-based calculations (based on actual earning period)
        yearlyUSD: totalUSD / yearsSpan,
        monthlyUSD: totalUSD / monthsSpan,
        dailyUSD: totalUSD / totalDays,
        hourlyUSD: totalUSD / totalHours,
        minutelyUSD: totalUSD / totalMinutes,
        secondlyUSD: totalUSD / totalSeconds,
        
        // EGP equivalents
        yearlyEGP: totalEGP / yearsSpan,
        monthlyEGP: totalEGP / monthsSpan,
        dailyEGP: totalEGP / totalDays,
        hourlyEGP: totalEGP / totalHours,
        minutelyEGP: totalEGP / totalMinutes,
        secondlyEGP: totalEGP / totalSeconds,
        
        // Additional info
        yearsSpan,
        monthsSpan,
        totalDays,
        startDate,
        endDate
      };
    }
    
    function incomeTotals(arr) { 
      const mUSD = arr.reduce((s, r) => s + rowIncomeMonthlyUSD(r), 0); 
      const yUSD = arr.reduce((s, r) => s + rowIncomeYearlyUSD(r), 0); 
      return { mUSD, yUSD, mEGP: usdToEgp(mUSD), yEGP: usdToEgp(yUSD) }; 
    }

    function setText(id,val){ const el=document.getElementById(id); if(el) el.textContent=val; }

    // Custom method options management
    function getCustomMethodOptions() {
      const saved = localStorage.getItem('customMethodOptions');
      return saved ? JSON.parse(saved) : [];
    }
    
    function saveCustomMethodOptions(options) {
      localStorage.setItem('customMethodOptions', JSON.stringify(options));
    }
    
    function addCustomMethodOption(option) {
      if (!option || option.trim() === '') return;
      const customOptions = getCustomMethodOptions();
      const trimmedOption = option.trim();
      if (!customOptions.includes(trimmedOption)) {
        customOptions.push(trimmedOption);
        saveCustomMethodOptions(customOptions);
      }
    }
    
    function removeCustomMethodOption(option) {
      const customOptions = getCustomMethodOptions();
      const filtered = customOptions.filter(opt => opt !== option);
      saveCustomMethodOptions(filtered);
    }
    
    function getAllMethodOptions() {
      const defaultOptions = ['Bank Transfer', 'Paypal', 'Cash', 'Crypto', 'InstaPay', 'Wire Transfer'];
      const customOptions = getCustomMethodOptions();
      return [...defaultOptions, ...customOptions];
    }
    
    // Helper function to format date for display (Month Day format)
    function formatDateForDisplay(dateString) {
      if (!dateString) return '';
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return '';
      
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 
                     'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      return `${months[date.getMonth()]} ${date.getDate()}`;
    }
    
    // Helper function to check if date is in the future
    function isFutureDate(dateString) {
      if (!dateString) return false;
      const date = new Date(dateString);
      const today = new Date();
      today.setHours(0, 0, 0, 0); // Reset time to start of day
      return date >= today;
    }


  function renderKPIs(){
      const p = totals(state.personal); const b = totals(state.biz);
    const currentYearData = state.income[currentYear] || [];
    const i = incomeTotals(currentYearData);
      const all = { mUSD:p.mUSD + b.mUSD, yUSD:p.yUSD + b.yUSD };
    all.mEGP = usdToEgp(all.mUSD); all.yEGP = usdToEgp(all.yUSD);
      setText('kpiAllMonthlyUSD', nfUSD.format(all.mUSD));
      setText('kpiAllMonthlyEGP', 'EGP ' + nfINT.format(Math.round(all.mEGP)));
      setText('kpiAllYearlyUSD', nfUSD.format(all.yUSD));
      setText('kpiAllYearlyEGP', 'EGP ' + nfINT.format(Math.round(all.yEGP)));
      setText('kpiFxSmall', Number(state.fx||0).toFixed(4));
      setText('kpiPersonalMonthly', nfUSD.format(p.mUSD));
      setText('kpiPersonalMonthlyEGP', 'EGP ' + nfINT.format(Math.round(p.mEGP)));
      setText('kpiPersonalYearly', nfUSD.format(p.yUSD));
      setText('kpiPersonalYearlyEGP', 'EGP ' + nfINT.format(Math.round(p.yEGP)));
      setText('kpiBizMonthly', nfUSD.format(b.mUSD));
      setText('kpiBizMonthlyEGP', 'EGP ' + nfINT.format(Math.round(b.mEGP)));
      setText('kpiBizYearly', nfUSD.format(b.yUSD));
      setText('kpiBizYearlyEGP', 'EGP ' + nfINT.format(Math.round(b.yEGP)));
    const total = all.mUSD; 
    const sp = total > 0 ? Math.round((p.mUSD/total)*100) : 0; 
    const sb = total > 0 ? Math.round((b.mUSD/total)*100) : 0;
      setText('sharePersonalVal', sp + '%'); setText('shareBizVal', sb + '%');
      const ps=$('#sharePersonalBar'); if(ps) ps.style.width=sp+'%'; const bs=$('#shareBizBar'); if(bs) bs.style.width=sb+'%';
    
    // Update Income KPIs with lifetime totals
    const lifetimeIncome = lifetimeIncomeTotals();
    setText('kpiIncomeAllMonthlyUSD', nfUSD.format(lifetimeIncome.monthlyUSD));
    setText('kpiIncomeAllMonthlyEGP', 'EGP ' + nfINT.format(Math.round(lifetimeIncome.monthlyEGP)));
    setText('kpiIncomeAllYearlyUSD', nfUSD.format(lifetimeIncome.yearlyUSD));
    setText('kpiIncomeAllYearlyEGP', 'EGP ' + nfINT.format(Math.round(lifetimeIncome.yearlyEGP)));
    setText('kpiIncomeFxSmall', Number(state.fx||0).toFixed(4));
    setText('kpiIncomeMonthlyCurrent', nfUSD.format(i.mUSD));
    setText('kpiIncomeMonthlyCurrentEGP', 'EGP ' + nfINT.format(Math.round(i.mEGP)));
     setText('kpiIncomeMonthlyAvg', nfUSD.format(lifetimeIncome.monthlyUSD));
     setText('kpiIncomeMonthlyAvgEGP', 'EGP ' + nfINT.format(Math.round(lifetimeIncome.monthlyEGP)));
    setText('kpiIncomeYearlyCurrent', nfUSD.format(i.yUSD));
    setText('kpiIncomeYearlyCurrentEGP', 'EGP ' + nfINT.format(Math.round(i.yEGP)));
    setText('kpiIncomeYearlyTarget', nfUSD.format(lifetimeIncome.yearlyUSD * 1.2)); // 20% above lifetime as target
    setText('kpiIncomeYearlyTargetEGP', 'EGP ' + nfINT.format(Math.round(lifetimeIncome.yearlyEGP * 1.2)));
    
    // Update lifetime income breakdown (no progress bars)
    setText('shareIncomeCompletedVal', nfUSD.format(lifetimeIncome.totalUSD));
    setText('shareIncomePendingVal', lifetimeIncome.totalEntries.toString());
    
    // Update analytics content
    updateAnalytics();
    updateIncomeAnalytics();
    }
    
    // Income Analytics function
    function updateIncomeAnalytics() {
      const currentYearData = state.income[currentYear] || [];
      const income = incomeTotals(currentYearData);
      updateIncomeAllAnalytics(income);
      updateIncomeMonthlyAnalytics(income);
      updateIncomeYearlyAnalytics(income);
    }
    
    function updateIncomeAllAnalytics(income) {
      const container = document.getElementById('analyticsIncomeAll');
      if (!container) return;

      const lifetimeIncome = lifetimeIncomeTotals();
      
      // Get all income data across all years
      let allIncomeEntries = [];
      Object.keys(state.income).forEach(year => {
        const yearData = state.income[year] || [];
        allIncomeEntries = allIncomeEntries.concat(yearData);
      });
      
      const totalItems = allIncomeEntries.length;
      const avgIncomePerEntry = totalItems > 0 ? lifetimeIncome.totalUSD / totalItems : 0;
      
      // Find highest and lowest income entries
      const sortedByCost = allIncomeEntries.sort((a, b) => {
        return Number(b.paidUsd || 0) - Number(a.paidUsd || 0);
      });
      
      const highestIncome = sortedByCost[0];
      const lowestIncome = sortedByCost[sortedByCost.length - 1];
      
      // Calculate year distribution
      const yearDistribution = {};
      Object.keys(state.income).forEach(year => {
        const yearData = state.income[year] || [];
        const yearTotal = yearData.reduce((sum, r) => sum + Number(r.paidUsd || 0), 0);
        if (yearTotal > 0) {
          yearDistribution[year] = yearTotal;
        }
      });
      
      const bestYear = Object.keys(yearDistribution).reduce((a, b) => 
        yearDistribution[a] > yearDistribution[b] ? a : b, Object.keys(yearDistribution)[0]);
      const bestYearAmount = yearDistribution[bestYear] || 0;

      container.innerHTML = `
        <div class="analytics-section">
          <div class="section-title">🏆 Lifetime Income Overview</div>
          <div class="analytics-grid-4">
            <div class="metric-item">
              <div class="metric-value">${nfUSD.format(lifetimeIncome.totalUSD)}</div>
              <div class="metric-label">Total Lifetime</div>
            </div>
            <div class="metric-item">
              <div class="metric-value">${totalItems}</div>
              <div class="metric-label">Total Entries</div>
            </div>
            <div class="metric-item">
              <div class="metric-value">${nfUSD.format(avgIncomePerEntry)}</div>
              <div class="metric-label">Avg Per Entry</div>
            </div>
            <div class="metric-item">
              <div class="metric-value">${Object.keys(yearDistribution).length}</div>
              <div class="metric-label">Active Years</div>
            </div>
          </div>
        </div>

        <div class="analytics-section">
          <div class="section-title">⏰ Complete Time Breakdown</div>
          <div class="analytics-grid-3">
            <div class="metric-item">
              <div class="metric-value">${nfUSD.format(lifetimeIncome.yearlyUSD)}</div>
              <div class="metric-label">Per Year</div>
            </div>
            <div class="metric-item">
              <div class="metric-value">${nfUSD.format(lifetimeIncome.monthlyUSD)}</div>
              <div class="metric-label">Per Month</div>
            </div>
            <div class="metric-item">
              <div class="metric-value">${nfUSD.format(lifetimeIncome.dailyUSD)}</div>
              <div class="metric-label">Per Day</div>
            </div>
            <div class="metric-item">
              <div class="metric-value">${nfUSD.format(lifetimeIncome.hourlyUSD)}</div>
              <div class="metric-label">Per Hour</div>
            </div>
            <div class="metric-item">
              <div class="metric-value">${nfUSD.format(lifetimeIncome.minutelyUSD)}</div>
              <div class="metric-label">Per Minute</div>
            </div>
            <div class="metric-item">
              <div class="metric-value">${nfUSD.format(lifetimeIncome.secondlyUSD)}</div>
              <div class="metric-label">Per Second</div>
            </div>
          </div>
        </div>

        <div class="analytics-section">
          <div class="section-title">💰 EGP Breakdown</div>
          <div class="analytics-grid-3">
            <div class="metric-item">
              <div class="metric-value">EGP ${nfINT.format(Math.round(lifetimeIncome.totalEGP))}</div>
              <div class="metric-label">Total Lifetime</div>
            </div>
            <div class="metric-item">
              <div class="metric-value">EGP ${nfINT.format(Math.round(lifetimeIncome.monthlyEGP))}</div>
              <div class="metric-label">Per Month</div>
            </div>
            <div class="metric-item">
              <div class="metric-value">EGP ${nfINT.format(Math.round(lifetimeIncome.dailyEGP))}</div>
              <div class="metric-label">Per Day</div>
            </div>
            <div class="metric-item">
              <div class="metric-value">EGP ${nfINT.format(Math.round(lifetimeIncome.hourlyEGP))}</div>
              <div class="metric-label">Per Hour</div>
            </div>
            <div class="metric-item">
              <div class="metric-value">EGP ${Math.round(lifetimeIncome.minutelyEGP * 100) / 100}</div>
              <div class="metric-label">Per Minute</div>
            </div>
            <div class="metric-item">
              <div class="metric-value">EGP ${Math.round(lifetimeIncome.secondlyEGP * 10000) / 10000}</div>
              <div class="metric-label">Per Second</div>
            </div>
          </div>
        </div>

        <div class="analytics-section">
          <div class="section-title">📊 Performance Insights</div>
          <div class="analytics-grid">
            <div class="metric-item">
              <div class="metric-value">${bestYear || 'N/A'}</div>
              <div class="metric-label">Best Year</div>
            </div>
            <div class="metric-item">
              <div class="metric-value">${nfUSD.format(bestYearAmount)}</div>
              <div class="metric-label">Best Year Total</div>
            </div>
            <div class="metric-item">
              <div class="metric-value">${highestIncome ? nfUSD.format(Number(highestIncome.paidUsd || 0)) : 'N/A'}</div>
              <div class="metric-label">Highest Entry</div>
            </div>
            <div class="metric-item">
              <div class="metric-value">${lowestIncome ? nfUSD.format(Number(lowestIncome.paidUsd || 0)) : 'N/A'}</div>
              <div class="metric-label">Lowest Entry</div>
            </div>
          </div>
        </div>

        <div class="analytics-section">
          <div class="section-title">Smart Insights</div>
          <div class="insight-card">
            <div class="insight-text">
              You've earned <strong>${nfUSD.format(lifetimeIncome.totalUSD)}</strong> across <strong>${totalItems}</strong> projects over <strong>${Object.keys(yearDistribution).length}</strong> years.
              That's <strong>${nfUSD.format(lifetimeIncome.dailyUSD)}</strong> per day or <strong>${nfUSD.format(lifetimeIncome.hourlyUSD)}</strong> per hour!
              ${bestYear ? ` Your best year was <strong>${bestYear}</strong> with <strong>${nfUSD.format(bestYearAmount)}</strong>.` : ''}
              ${highestIncome ? ` Your highest single entry was <strong>${nfUSD.format(Number(highestIncome.paidUsd || 0))}</strong> from "${highestIncome.name || 'Unnamed Project'}".` : ''}
            </div>
          </div>
        </div>
      `;
    }
    
    function updateIncomeMonthlyAnalytics(income) {
      const container = document.getElementById('analyticsIncomeMonthly');
      if (!container) return;

      const lifetimeIncome = lifetimeIncomeTotals();
      const currentYearData = state.income[currentYear] || [];
      const currentMonthIncome = income.mUSD;
      
      // Calculate actual monthly totals across all years
      const monthlyTotals = {};
      Object.keys(state.income).forEach(year => {
        const yearData = state.income[year] || [];
        yearData.forEach(r => {
          if (r.date && r.paidUsd) {
            const date = new Date(r.date);
            const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
            if (!monthlyTotals[monthKey]) {
              monthlyTotals[monthKey] = 0;
            }
            monthlyTotals[monthKey] += Number(r.paidUsd || 0);
          }
        });
      });
      
      const allMonthlyTotals = Object.values(monthlyTotals);
      const avgMonthlyAllTime = allMonthlyTotals.length > 0 ? 
        allMonthlyTotals.reduce((sum, val) => sum + val, 0) / allMonthlyTotals.length : 0;
      const bestMonth = allMonthlyTotals.length > 0 ? Math.max(...allMonthlyTotals) : 0;
      const worstMonth = allMonthlyTotals.length > 0 ? Math.min(...allMonthlyTotals) : 0;
      
      // Performance comparison
      const vsAverage = avgMonthlyAllTime > 0 ? ((currentMonthIncome - avgMonthlyAllTime) / avgMonthlyAllTime) * 100 : 0;
      const vsBest = bestMonth > 0 ? ((currentMonthIncome - bestMonth) / bestMonth) * 100 : 0;

      container.innerHTML = `
        <div class="analytics-section">
          <div class="section-title">📅 Monthly Performance</div>
          <div class="analytics-grid-4">
            <div class="metric-item">
              <div class="metric-value">${nfUSD.format(currentMonthIncome)}</div>
              <div class="metric-label">Current Month</div>
            </div>
            <div class="metric-item">
              <div class="metric-value">${nfUSD.format(avgMonthlyAllTime)}</div>
              <div class="metric-label">All-Time Avg</div>
            </div>
            <div class="metric-item">
              <div class="metric-value">${nfUSD.format(bestMonth)}</div>
              <div class="metric-label">Best Month</div>
            </div>
            <div class="metric-item">
              <div class="metric-value">${nfUSD.format(worstMonth)}</div>
              <div class="metric-label">Worst Month</div>
            </div>
          </div>
        </div>

        <div class="analytics-section">
          <div class="section-title">⏰ Monthly Time Breakdown</div>
          <div class="analytics-grid-3">
            <div class="metric-item">
              <div class="metric-value">${nfUSD.format(lifetimeIncome.monthlyUSD)}</div>
              <div class="metric-label">Per Month</div>
            </div>
            <div class="metric-item">
              <div class="metric-value">${nfUSD.format(lifetimeIncome.dailyUSD)}</div>
              <div class="metric-label">Per Day</div>
            </div>
            <div class="metric-item">
              <div class="metric-value">${nfUSD.format(lifetimeIncome.hourlyUSD)}</div>
              <div class="metric-label">Per Hour</div>
            </div>
            <div class="metric-item">
              <div class="metric-value">${nfUSD.format(lifetimeIncome.minutelyUSD)}</div>
              <div class="metric-label">Per Minute</div>
            </div>
            <div class="metric-item">
              <div class="metric-value">${nfUSD.format(lifetimeIncome.secondlyUSD)}</div>
              <div class="metric-label">Per Second</div>
            </div>
            <div class="metric-item">
              <div class="metric-value">${currentYearData.length}</div>
              <div class="metric-label">This Year Entries</div>
            </div>
          </div>
        </div>

        <div class="analytics-section">
          <div class="section-title">📊 Performance Comparison</div>
          <div class="analytics-grid">
            <div class="metric-item">
              <div class="metric-value ${vsAverage >= 0 ? 'trend-up' : 'trend-down'}">${vsAverage >= 0 ? '+' : ''}${vsAverage.toFixed(1)}%</div>
              <div class="metric-label">vs All-Time Avg</div>
            </div>
            <div class="metric-item">
              <div class="metric-value ${vsBest >= 0 ? 'trend-up' : 'trend-down'}">${vsBest >= 0 ? '+' : ''}${vsBest.toFixed(1)}%</div>
              <div class="metric-label">vs Best Month</div>
            </div>
            <div class="metric-item">
              <div class="metric-value">${allMonthlyTotals.length}</div>
              <div class="metric-label">Months Tracked</div>
            </div>
            <div class="metric-item">
              <div class="metric-value">EGP ${nfINT.format(Math.round(lifetimeIncome.monthlyEGP))}</div>
              <div class="metric-label">Monthly EGP</div>
            </div>
          </div>
        </div>

        <div class="analytics-section">
          <div class="section-title">Monthly Insights</div>
          <div class="insight-card">
            <div class="insight-text">
              This month you're earning <strong>${nfUSD.format(currentMonthIncome)}</strong>, which is 
              <strong>${vsAverage >= 0 ? vsAverage.toFixed(1) + '% above' : Math.abs(vsAverage).toFixed(1) + '% below'}</strong> your all-time monthly average.
              ${bestMonth > 0 ? ` Your best month ever was <strong>${nfUSD.format(bestMonth)}</strong>.` : ''}
              At this rate, you earn <strong>${nfUSD.format(lifetimeIncome.dailyUSD)}</strong> per day!
            </div>
          </div>
        </div>
      `;
    }
    
    function updateIncomeYearlyAnalytics(income) {
      const container = document.getElementById('analyticsIncomeYearly');
      if (!container) return;

      const lifetimeIncome = lifetimeIncomeTotals();
      const currentYearData = state.income[currentYear] || [];
      const currentYearTotal = income.yUSD;
      
      // Calculate yearly performance across all years
      const yearlyTotals = {};
      Object.keys(state.income).forEach(year => {
        const yearData = state.income[year] || [];
        const yearTotal = yearData.reduce((sum, r) => sum + Number(r.paidUsd || 0), 0);
        if (yearTotal > 0) {
          yearlyTotals[year] = yearTotal;
        }
      });
      
      const allYearlyValues = Object.values(yearlyTotals);
      const avgYearlyAllTime = allYearlyValues.length > 0 ? 
        allYearlyValues.reduce((sum, val) => sum + val, 0) / allYearlyValues.length : 0;
      const bestYear = Object.keys(yearlyTotals).reduce((a, b) => 
        yearlyTotals[a] > yearlyTotals[b] ? a : b, Object.keys(yearlyTotals)[0]);
      const bestYearAmount = yearlyTotals[bestYear] || 0;
      const worstYearAmount = allYearlyValues.length > 0 ? Math.min(...allYearlyValues) : 0;
      
      // Performance comparison
      const vsAverage = avgYearlyAllTime > 0 ? ((currentYearTotal - avgYearlyAllTime) / avgYearlyAllTime) * 100 : 0;
      const vsBest = bestYearAmount > 0 ? ((currentYearTotal - bestYearAmount) / bestYearAmount) * 100 : 0;
      
      // Growth calculation
      const years = Object.keys(yearlyTotals).sort();
      const growthRate = years.length > 1 ? 
        ((yearlyTotals[years[years.length - 1]] - yearlyTotals[years[0]]) / yearlyTotals[years[0]]) * 100 : 0;

      container.innerHTML = `
        <div class="analytics-section">
          <div class="section-title">📈 Yearly Performance</div>
          <div class="analytics-grid-4">
            <div class="metric-item">
              <div class="metric-value">${nfUSD.format(currentYearTotal)}</div>
              <div class="metric-label">This Year (${currentYear})</div>
            </div>
            <div class="metric-item">
              <div class="metric-value">${nfUSD.format(avgYearlyAllTime)}</div>
              <div class="metric-label">All-Time Avg</div>
            </div>
            <div class="metric-item">
              <div class="metric-value">${nfUSD.format(bestYearAmount)}</div>
              <div class="metric-label">Best Year (${bestYear || 'N/A'})</div>
            </div>
            <div class="metric-item">
              <div class="metric-value">${nfUSD.format(worstYearAmount)}</div>
              <div class="metric-label">Worst Year</div>
            </div>
          </div>
        </div>

        <div class="analytics-section">
          <div class="section-title">⏰ Yearly Time Breakdown</div>
          <div class="analytics-grid-3">
            <div class="metric-item">
              <div class="metric-value">${nfUSD.format(lifetimeIncome.yearlyUSD)}</div>
              <div class="metric-label">Per Year</div>
            </div>
            <div class="metric-item">
              <div class="metric-value">${nfUSD.format(lifetimeIncome.monthlyUSD)}</div>
              <div class="metric-label">Per Month</div>
            </div>
            <div class="metric-item">
              <div class="metric-value">${nfUSD.format(lifetimeIncome.dailyUSD)}</div>
              <div class="metric-label">Per Day</div>
            </div>
            <div class="metric-item">
              <div class="metric-value">${nfUSD.format(lifetimeIncome.hourlyUSD)}</div>
              <div class="metric-label">Per Hour</div>
            </div>
            <div class="metric-item">
              <div class="metric-value">${nfUSD.format(lifetimeIncome.minutelyUSD)}</div>
              <div class="metric-label">Per Minute</div>
            </div>
            <div class="metric-item">
              <div class="metric-value">${nfUSD.format(lifetimeIncome.secondlyUSD)}</div>
              <div class="metric-label">Per Second</div>
            </div>
          </div>
        </div>

        <div class="analytics-section">
          <div class="section-title">📊 Growth & Comparison</div>
          <div class="analytics-grid">
            <div class="metric-item">
              <div class="metric-value ${vsAverage >= 0 ? 'trend-up' : 'trend-down'}">${vsAverage >= 0 ? '+' : ''}${vsAverage.toFixed(1)}%</div>
              <div class="metric-label">vs All-Time Avg</div>
            </div>
            <div class="metric-item">
              <div class="metric-value ${vsBest >= 0 ? 'trend-up' : 'trend-down'}">${vsBest >= 0 ? '+' : ''}${vsBest.toFixed(1)}%</div>
              <div class="metric-label">vs Best Year</div>
            </div>
            <div class="metric-item">
              <div class="metric-value ${growthRate >= 0 ? 'trend-up' : 'trend-down'}">${growthRate >= 0 ? '+' : ''}${growthRate.toFixed(1)}%</div>
              <div class="metric-label">Total Growth</div>
            </div>
            <div class="metric-item">
              <div class="metric-value">${years.length}</div>
              <div class="metric-label">Years Tracked</div>
            </div>
          </div>
        </div>

        <div class="analytics-section">
          <div class="section-title">💰 EGP Yearly Breakdown</div>
          <div class="analytics-grid">
            <div class="metric-item">
              <div class="metric-value">EGP ${nfINT.format(Math.round(lifetimeIncome.yearlyEGP))}</div>
              <div class="metric-label">Per Year</div>
            </div>
            <div class="metric-item">
              <div class="metric-value">EGP ${nfINT.format(Math.round(lifetimeIncome.monthlyEGP))}</div>
              <div class="metric-label">Per Month</div>
            </div>
            <div class="metric-item">
              <div class="metric-value">EGP ${nfINT.format(Math.round(lifetimeIncome.dailyEGP))}</div>
              <div class="metric-label">Per Day</div>
            </div>
            <div class="metric-item">
              <div class="metric-value">${currentYearData.length}</div>
              <div class="metric-label">This Year Entries</div>
            </div>
          </div>
        </div>

        <div class="analytics-section">
          <div class="section-title">Yearly Insights</div>
          <div class="insight-card">
            <div class="insight-text">
              This year (${currentYear}) you've earned <strong>${nfUSD.format(currentYearTotal)}</strong>, which is 
              <strong>${vsAverage >= 0 ? vsAverage.toFixed(1) + '% above' : Math.abs(vsAverage).toFixed(1) + '% below'}</strong> your all-time yearly average.
              ${bestYear && bestYear !== currentYear ? ` Your best year was <strong>${bestYear}</strong> with <strong>${nfUSD.format(bestYearAmount)}</strong>.` : ''}
              ${years.length > 1 ? ` Over ${years.length} years, you've grown by <strong>${growthRate >= 0 ? '+' : ''}${growthRate.toFixed(1)}%</strong>!` : ''}
            </div>
          </div>
        </div>
      `;
    }

    // Analytics functionality
    function updateAnalytics() {
      const p = totals(state.personal);
      const b = totals(state.biz);
      const all = { mUSD: p.mUSD + b.mUSD, yUSD: p.yUSD + b.yUSD };
      all.mEGP = usdToEgp(all.mUSD);
      all.yEGP = usdToEgp(all.yUSD);

      // Update All analytics
      updateAllAnalytics(all, p, b);
      
      // Update Personal analytics
      updatePersonalAnalytics(p);
      
      // Update Biz analytics
      updateBizAnalytics(b);
    }

    function updateAllAnalytics(all, personal, biz) {
      const container = document.getElementById('analyticsAll');
      if (!container) return;

      const personalActive = state.personal.filter(r => r.status === 'Active');
      const bizActive = state.biz.filter(r => r.status === 'Active');
      const totalActive = personalActive.length + bizActive.length;
      const totalCancelled = state.personal.filter(r => r.status === 'Cancelled').length + state.biz.filter(r => r.status === 'Cancelled').length;
      
      // Calculate averages
      const avgPersonal = personalActive.length > 0 ? personal.mUSD / personalActive.length : 0;
      const avgBiz = bizActive.length > 0 ? biz.mUSD / bizActive.length : 0;
      const avgAll = totalActive > 0 ? all.mUSD / totalActive : 0;
      
      // Calculate monthly vs annual distribution
      const personalMonthly = personalActive.filter(r => r.billing === 'Monthly').length;
      const personalAnnual = personalActive.filter(r => r.billing === 'Annually').length;
      const bizMonthly = bizActive.filter(r => r.billing === 'Monthly').length;
      const bizAnnual = bizActive.filter(r => r.billing === 'Annually').length;
      
      // Calculate savings potential
      const personalAnnualSavings = personalActive
        .filter(r => r.billing === 'Annually')
        .reduce((sum, r) => sum + (Number(r.cost || 0) * 0.1), 0);
      const bizAnnualSavings = bizActive
        .filter(r => r.billing === 'Annually')
        .reduce((sum, r) => sum + (Number(r.cost || 0) * 0.1), 0);
      
      // Calculate spending breakdowns
      const dailySpending = all.mUSD / 30;
      const weeklySpending = all.mUSD / 4.33;
      const hourlySpending = all.mUSD / 720; // 30 days * 24 hours
      
      // Find highest expenses across all categories
      const allActiveItems = [...personalActive, ...bizActive];
      const sortedByCost = allActiveItems.sort((a, b) => {
        const aCost = a.billing === 'Monthly' ? Number(a.cost || 0) : Number(a.cost || 0) / 12;
        const bCost = b.billing === 'Monthly' ? Number(b.cost || 0) : Number(b.cost || 0) / 12;
        return bCost - aCost;
      });
      
      const highestExpense = sortedByCost[0];
      const totalMonthlyBills = personalMonthly + bizMonthly;
      const totalAnnualBills = personalAnnual + bizAnnual;

      container.innerHTML = `
        <div class="analytics-grid-4">
          <div class="analytics-section">
            <div class="section-title">Total Subscriptions</div>
            <div class="metric-grid">
              <div class="metric-item">
                <div class="metric-value">${totalActive + totalCancelled}</div>
                <div class="metric-label">All Time</div>
              </div>
              <div class="metric-item">
                <div class="metric-value">${Math.round(((totalActive / (totalActive + totalCancelled)) * 100) || 0)}%</div>
                <div class="metric-label">Active Rate</div>
              </div>
            </div>
          </div>
          
          <div class="analytics-section">
            <div class="section-title">Cost Efficiency</div>
            <div class="metric-grid">
              <div class="metric-item">
                <div class="metric-value">${nfUSD.format(avgAll)}</div>
                <div class="metric-label">Avg/Service</div>
              </div>
              <div class="metric-item">
                <div class="metric-value">${nfUSD.format(Math.max(...[personal.mUSD, biz.mUSD]))}</div>
                <div class="metric-label">Highest Category</div>
              </div>
            </div>
          </div>
          
          <div class="analytics-section">
            <div class="section-title">Time Breakdown</div>
            <div class="metric-grid">
              <div class="metric-item">
                <div class="metric-value">${nfUSD.format(all.mUSD)}</div>
                <div class="metric-label">Monthly</div>
              </div>
              <div class="metric-item">
                <div class="metric-value">${nfUSD.format(dailySpending)}</div>
                <div class="metric-label">Daily</div>
              </div>
              <div class="metric-item">
                <div class="metric-value">${nfUSD.format(weeklySpending)}</div>
                <div class="metric-label">Weekly</div>
              </div>
              <div class="metric-item">
                <div class="metric-value">${nfUSD.format(hourlySpending)}</div>
                <div class="metric-label">Hourly</div>
              </div>
              <div class="metric-item">
                <div class="metric-value">${nfUSD.format(hourlySpending / 60)}</div>
                <div class="metric-label">Per Minute</div>
              </div>
              <div class="metric-item">
                <div class="metric-value">${nfUSD.format((hourlySpending / 60) / 60)}</div>
                <div class="metric-label">Per Second</div>
              </div>
              <div class="metric-item">
                <div class="metric-value">${nfUSD.format(all.yUSD)}</div>
                <div class="metric-label">Yearly</div>
              </div>
            </div>
          </div>
          
          <div class="analytics-section">
            <div class="section-title">Currency Split</div>
            <div class="metric-grid">
              <div class="metric-item">
                <div class="metric-value">${Math.round((all.mUSD / (all.mUSD + all.mEGP * 0.032) * 100) || 0)}%</div>
                <div class="metric-label">USD Share</div>
              </div>
              <div class="metric-item">
                <div class="metric-value">${Math.round((all.mEGP * 0.032 / (all.mUSD + all.mEGP * 0.032) * 100) || 0)}%</div>
                <div class="metric-label">EGP Share</div>
              </div>
            </div>
          </div>
        </div>

        <div class="analytics-grid-3">
          <div class="analytics-section">
            <div class="section-title">Category Distribution</div>
            <ul class="breakdown-list">
              <li class="breakdown-item">
                <span class="breakdown-name">Personal (${personalActive.length})</span>
                <div>
                  <span class="breakdown-amount">${nfUSD.format(personal.mUSD)}</span>
                  <span class="breakdown-percentage">${all.mUSD > 0 ? Math.round((personal.mUSD / all.mUSD) * 100) : 0}%</span>
                </div>
              </li>
              <li class="breakdown-item">
                <span class="breakdown-name">Business (${bizActive.length})</span>
                <div>
                  <span class="breakdown-amount">${nfUSD.format(biz.mUSD)}</span>
                  <span class="breakdown-percentage">${all.mUSD > 0 ? Math.round((biz.mUSD / all.mUSD) * 100) : 0}%</span>
                </div>
              </li>
            </ul>
          </div>

          <div class="analytics-section">
            <div class="section-title">Billing Distribution</div>
            <ul class="breakdown-list">
              <li class="breakdown-item">
                <span class="breakdown-name">Monthly (${totalMonthlyBills})</span>
                <div>
                  <span class="breakdown-amount">${nfUSD.format(personalActive.filter(r => r.billing === 'Monthly').reduce((sum, r) => sum + Number(r.cost || 0), 0) + bizActive.filter(r => r.billing === 'Monthly').reduce((sum, r) => sum + Number(r.cost || 0), 0))}</span>
                  <span class="breakdown-percentage">${totalActive > 0 ? Math.round((totalMonthlyBills / totalActive) * 100) : 0}%</span>
                </div>
              </li>
              <li class="breakdown-item">
                <span class="breakdown-name">Annual (${totalAnnualBills})</span>
                <div>
                  <span class="breakdown-amount">${nfUSD.format(personalActive.filter(r => r.billing === 'Annually').reduce((sum, r) => sum + Number(r.cost || 0) / 12, 0) + bizActive.filter(r => r.billing === 'Annually').reduce((sum, r) => sum + Number(r.cost || 0) / 12, 0))}</span>
                  <span class="breakdown-percentage">${totalActive > 0 ? Math.round((totalAnnualBills / totalActive) * 100) : 0}%</span>
                </div>
              </li>
            </ul>
          </div>

          <div class="analytics-section">
            <div class="section-title">Top Expenses</div>
            <ul class="breakdown-list">
              ${sortedByCost.slice(0, 3).map(item => {
                const monthlyCost = item.billing === 'Monthly' ? Number(item.cost || 0) : Number(item.cost || 0) / 12;
                const category = state.personal.includes(item) ? 'Personal' : 'Business';
                return `
                  <li class="breakdown-item">
                    <span class="breakdown-name">${item.name || 'Unnamed'} (${category})</span>
                    <div>
                      <span class="breakdown-amount">${nfUSD.format(monthlyCost)}</span>
                      <span class="breakdown-percentage">${item.billing}</span>
                    </div>
                  </li>
                `;
              }).join('')}
            </ul>
          </div>
        </div>

        <div class="analytics-section">
          <div class="section-title">Insights</div>
          <div class="insight-card">
            <div class="insight-text">
              Total Portfolio: <strong>${totalActive + totalCancelled}</strong> services | Monthly Burn: <strong>${nfUSD.format(all.mUSD)}</strong> | 
              Efficiency: <strong>${Math.round((totalActive / (totalActive + totalCancelled)) * 100) || 0}%</strong> active rate
              ${highestExpense ? ` | Top Expense: <strong>${highestExpense.name || 'Unnamed'}</strong> (${nfUSD.format(highestExpense.billing === 'Monthly' ? Number(highestExpense.cost || 0) : Number(highestExpense.cost || 0) / 12)})` : ''}
            </div>
          </div>
        </div>
      `;
    }

    function updatePersonalAnalytics(personal) {
      const container = document.getElementById('analyticsPersonal');
      if (!container) return;

      const activeItems = state.personal.filter(r => r.status === 'Active');
      const monthlyItems = activeItems.filter(r => r.billing === 'Monthly');
      const annualItems = activeItems.filter(r => r.billing === 'Annually');
      const cancelledItems = state.personal.filter(r => r.status === 'Cancelled');
      
      // Calculate detailed metrics
      const avgMonthly = monthlyItems.length > 0 ? monthlyItems.reduce((sum, r) => sum + Number(r.cost || 0), 0) / monthlyItems.length : 0;
      const avgAnnual = annualItems.length > 0 ? annualItems.reduce((sum, r) => sum + Number(r.cost || 0), 0) / annualItems.length : 0;
      const avgAll = activeItems.length > 0 ? personal.mUSD / activeItems.length : 0;
      
      // Calculate spending breakdowns
      const dailyPersonal = personal.mUSD / 30;
      const weeklyPersonal = personal.mUSD / 4.33;
      const hourlyPersonal = personal.mUSD / 720;
      
      // Calculate potential savings
      const annualSavings = annualItems.reduce((sum, r) => sum + (Number(r.cost || 0) * 0.1), 0);
      
      // Find expense patterns
      const sortedByCost = activeItems.sort((a, b) => {
        const aCost = a.billing === 'Monthly' ? Number(a.cost || 0) : Number(a.cost || 0) / 12;
        const bCost = b.billing === 'Monthly' ? Number(b.cost || 0) : Number(b.cost || 0) / 12;
        return bCost - aCost;
      });
      
      const highestExpense = sortedByCost[0];
      const lowestExpense = sortedByCost[sortedByCost.length - 1];
      
      // Calculate cost distribution
      const highCostItems = activeItems.filter(item => {
        const monthlyCost = item.billing === 'Monthly' ? Number(item.cost || 0) : Number(item.cost || 0) / 12;
        return monthlyCost > avgAll;
      }).length;
      
      const lowCostItems = activeItems.filter(item => {
        const monthlyCost = item.billing === 'Monthly' ? Number(item.cost || 0) : Number(item.cost || 0) / 12;
        return monthlyCost <= avgAll;
      }).length;

      // Calculate monthly vs annual spending amounts
      const monthlySpending = monthlyItems.reduce((sum, r) => sum + Number(r.cost || 0), 0);
      const annualSpending = annualItems.reduce((sum, r) => sum + Number(r.cost || 0) / 12, 0);

      container.innerHTML = `
        <div class="analytics-grid-4">
          <div class="analytics-section">
            <div class="section-title">Personal Portfolio</div>
            <div class="metric-grid">
              <div class="metric-item">
                <div class="metric-value">${activeItems.length}</div>
                <div class="metric-label">Active Services</div>
              </div>
              <div class="metric-item">
                <div class="metric-value">${cancelledItems.length}</div>
                <div class="metric-label">Discontinued</div>
              </div>
            </div>
          </div>
          
          <div class="analytics-section">
            <div class="section-title">Spending Patterns</div>
            <div class="metric-grid">
              <div class="metric-item">
                <div class="metric-value">${nfUSD.format(avgMonthly)}</div>
                <div class="metric-label">Avg Monthly</div>
              </div>
              <div class="metric-item">
                <div class="metric-value">${nfUSD.format(avgAnnual)}</div>
                <div class="metric-label">Avg Annual</div>
              </div>
            </div>
          </div>
          
          <div class="analytics-section">
            <div class="section-title">Cost Distribution</div>
            <div class="metric-grid">
              <div class="metric-item">
                <div class="metric-value">${highCostItems}</div>
                <div class="metric-label">Premium Items</div>
              </div>
              <div class="metric-item">
                <div class="metric-value">${lowCostItems}</div>
                <div class="metric-label">Budget Items</div>
              </div>
            </div>
          </div>
          
          <div class="analytics-section">
            <div class="section-title">Time Breakdown</div>
            <div class="metric-grid">
              <div class="metric-item">
                <div class="metric-value">${nfUSD.format(personal.mUSD)}</div>
                <div class="metric-label">Monthly</div>
              </div>
              <div class="metric-item">
                <div class="metric-value">${nfUSD.format(dailyPersonal)}</div>
                <div class="metric-label">Daily</div>
              </div>
              <div class="metric-item">
                <div class="metric-value">${nfUSD.format(hourlyPersonal)}</div>
                <div class="metric-label">Hourly</div>
              </div>
              <div class="metric-item">
                <div class="metric-value">${nfUSD.format(hourlyPersonal / 60)}</div>
                <div class="metric-label">Per Minute</div>
            </div>
              <div class="metric-item">
                <div class="metric-value">${nfUSD.format((hourlyPersonal / 60) / 60)}</div>
                <div class="metric-label">Per Second</div>
              </div>
              <div class="metric-item">
                <div class="metric-value">${nfUSD.format(personal.yUSD)}</div>
                <div class="metric-label">Yearly</div>
              </div>
            </div>
          </div>
        </div>

        <div class="analytics-grid-3">
          <div class="analytics-section">
            <div class="section-title">Billing Distribution</div>
            <ul class="breakdown-list">
              <li class="breakdown-item">
                <span class="breakdown-name">Monthly (${monthlyItems.length})</span>
                <div>
                  <span class="breakdown-amount">${nfUSD.format(monthlySpending)}</span>
                  <span class="breakdown-percentage">${personal.mUSD > 0 ? Math.round((monthlySpending / personal.mUSD) * 100) : 0}%</span>
                </div>
              </li>
              <li class="breakdown-item">
                <span class="breakdown-name">Annual (${annualItems.length})</span>
                <div>
                  <span class="breakdown-amount">${nfUSD.format(annualSpending)}</span>
                  <span class="breakdown-percentage">${personal.mUSD > 0 ? Math.round((annualSpending / personal.mUSD) * 100) : 0}%</span>
                </div>
              </li>
            </ul>
          </div>

          <div class="analytics-section">
            <div class="section-title">Expense Analysis</div>
            <ul class="breakdown-list">
              <li class="breakdown-item">
                <span class="breakdown-name">High-Cost (>${nfUSD.format(avgAll)})</span>
                <div>
                  <span class="breakdown-amount">${highCostItems}</span>
                  <span class="breakdown-percentage">items</span>
                </div>
              </li>
              <li class="breakdown-item">
                <span class="breakdown-name">Low-Cost (≤${nfUSD.format(avgAll)})</span>
                <div>
                  <span class="breakdown-amount">${lowCostItems}</span>
                  <span class="breakdown-percentage">items</span>
                </div>
              </li>
            </ul>
          </div>

          <div class="analytics-section">
            <div class="section-title">Top Expenses</div>
            <ul class="breakdown-list">
              ${sortedByCost.slice(0, 3).map(item => {
                const monthlyCost = item.billing === 'Monthly' ? Number(item.cost || 0) : Number(item.cost || 0) / 12;
                return `
                  <li class="breakdown-item">
                    <span class="breakdown-name">${item.name || 'Unnamed'}</span>
                    <div>
                      <span class="breakdown-amount">${nfUSD.format(monthlyCost)}</span>
                      <span class="breakdown-percentage">${item.billing}</span>
                    </div>
                  </li>
                `;
              }).join('')}
            </ul>
          </div>
        </div>

        <div class="analytics-section">
          <div class="section-title">Insights</div>
          <div class="insight-card">
            <div class="insight-text">
              Personal Budget: <strong>${nfUSD.format(personal.mUSD)}</strong>/month | 
              Cost Efficiency: <strong>${Math.round((highCostItems / activeItems.length) * 100) || 0}%</strong> premium services | 
              Daily Impact: <strong>${nfUSD.format(dailyPersonal)}</strong>/day
              ${highestExpense ? ` | Biggest Expense: <strong>${highestExpense.name || 'Unnamed'}</strong> (${nfUSD.format(highestExpense.billing === 'Monthly' ? Number(highestExpense.cost || 0) : Number(highestExpense.cost || 0) / 12)})` : ''}
              ${annualSavings > 0 ? ` | Annual Savings Potential: <strong>${nfUSD.format(annualSavings)}</strong>` : ''}
            </div>
          </div>
        </div>
      `;
    }

    function updateBizAnalytics(biz) {
      const container = document.getElementById('analyticsBiz');
      if (!container) return;

      const activeItems = state.biz.filter(r => r.status === 'Active');
      const monthlyItems = activeItems.filter(r => r.billing === 'Monthly');
      const annualItems = activeItems.filter(r => r.billing === 'Annually');
      const cancelledItems = state.biz.filter(r => r.status === 'Cancelled');
      
      // Calculate detailed metrics
      const avgMonthly = monthlyItems.length > 0 ? monthlyItems.reduce((sum, r) => sum + Number(r.cost || 0), 0) / monthlyItems.length : 0;
      const avgAnnual = annualItems.length > 0 ? annualItems.reduce((sum, r) => sum + Number(r.cost || 0), 0) / annualItems.length : 0;
      const avgAll = activeItems.length > 0 ? biz.mUSD / activeItems.length : 0;
      
      // Calculate daily and weekly business spending
      const dailyBiz = biz.mUSD / 30;
      const weeklyBiz = biz.mUSD / 4.33;
      
      // Calculate potential savings from annual discounts
      const annualSavings = annualItems.reduce((sum, r) => sum + (Number(r.cost || 0) * 0.1), 0);
      
      // Find upcoming renewals (within 30 days) - all dates
      const upcomingRenewals = activeItems.filter(item => {
        if (!item.next) return false;
        const nextDate = new Date(item.next);
        const today = new Date();
        const diffTime = nextDate - today;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays <= 30;
      });
      
      // Find renewals due in next 7 days (urgent) - all dates
      const urgentRenewals = activeItems.filter(item => {
        if (!item.next) return false;
        const nextDate = new Date(item.next);
        const today = new Date();
        const diffTime = nextDate - today;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays <= 7;
      });
      
      // Find highest and lowest expenses
      const sortedByCost = activeItems.sort((a, b) => {
        const aCost = a.billing === 'Monthly' ? Number(a.cost || 0) : Number(a.cost || 0) / 12;
        const bCost = b.billing === 'Monthly' ? Number(b.cost || 0) : Number(b.cost || 0) / 12;
        return bCost - aCost;
      });
      
      const highestExpense = sortedByCost[0];
      
      // Calculate cost distribution
      const highCostItems = activeItems.filter(item => {
        const monthlyCost = item.billing === 'Monthly' ? Number(item.cost || 0) : Number(item.cost || 0) / 12;
        return monthlyCost > avgAll;
      }).length;
      
      const lowCostItems = activeItems.filter(item => {
        const monthlyCost = item.billing === 'Monthly' ? Number(item.cost || 0) : Number(item.cost || 0) / 12;
        return monthlyCost <= avgAll;
      }).length;
      
      // Calculate total upcoming renewal costs
      const upcomingRenewalCosts = upcomingRenewals.reduce((sum, item) => {
        return sum + Number(item.cost || 0);
      }, 0);

      container.innerHTML = `
        <div class="analytics-grid-4">
          <div class="analytics-section">
            <div class="section-title">Business Portfolio</div>
            <div class="metric-grid">
              <div class="metric-item">
                <div class="metric-value">${activeItems.length}</div>
                <div class="metric-label">Active Tools</div>
              </div>
              <div class="metric-item">
                <div class="metric-value">${cancelledItems.length}</div>
                <div class="metric-label">Discontinued</div>
              </div>
            </div>
          </div>
          
          <div class="analytics-section">
            <div class="section-title">Renewal Status</div>
            <div class="metric-grid">
              <div class="metric-item">
                <div class="metric-value">${upcomingRenewals.length}</div>
                <div class="metric-label">Due Soon</div>
              </div>
              <div class="metric-item">
                <div class="metric-value">${urgentRenewals.length}</div>
                <div class="metric-label">Urgent (7d)</div>
              </div>
            </div>
          </div>
          
          <div class="analytics-section">
            <div class="section-title">Investment Analysis</div>
            <div class="metric-grid">
              <div class="metric-item">
                <div class="metric-value">${nfUSD.format(avgMonthly)}</div>
                <div class="metric-label">Avg Monthly</div>
              </div>
              <div class="metric-item">
                <div class="metric-value">${nfUSD.format(avgAnnual)}</div>
                <div class="metric-label">Avg Annual</div>
              </div>
            </div>
          </div>
          
          <div class="analytics-section">
            <div class="section-title">Time Breakdown</div>
            <div class="metric-grid">
              <div class="metric-item">
                <div class="metric-value">${nfUSD.format(biz.mUSD)}</div>
                <div class="metric-label">Monthly</div>
              </div>
              <div class="metric-item">
                <div class="metric-value">${nfUSD.format(dailyBiz)}</div>
                <div class="metric-label">Daily</div>
              </div>
              <div class="metric-item">
                <div class="metric-value">${nfUSD.format(weeklyBiz)}</div>
                <div class="metric-label">Weekly</div>
              </div>
              <div class="metric-item">
                <div class="metric-value">${nfUSD.format(dailyBiz / 24)}</div>
                <div class="metric-label">Hourly</div>
              </div>
              <div class="metric-item">
                <div class="metric-value">${nfUSD.format((dailyBiz / 24) / 60)}</div>
                <div class="metric-label">Per Minute</div>
              </div>
              <div class="metric-item">
                <div class="metric-value">${nfUSD.format(((dailyBiz / 24) / 60) / 60)}</div>
                <div class="metric-label">Per Second</div>
              </div>
              <div class="metric-item">
                <div class="metric-value">${nfUSD.format(biz.yUSD)}</div>
                <div class="metric-label">Yearly</div>
              </div>
            </div>
          </div>
          
          <div class="analytics-section">
            <div class="section-title">Cost Efficiency</div>
            <div class="metric-grid">
              <div class="metric-item">
                <div class="metric-value">${highCostItems}</div>
                <div class="metric-label">High-Value</div>
              </div>
              <div class="metric-item">
                <div class="metric-value">${lowCostItems}</div>
                <div class="metric-label">Essential</div>
              </div>
            </div>
          </div>
        </div>

        <div class="analytics-grid-3">
          <div class="analytics-section">
            <div class="section-title">Billing Distribution</div>
            <ul class="breakdown-list">
              <li class="breakdown-item">
                <span class="breakdown-name">Monthly (${monthlyItems.length})</span>
                <div>
                  <span class="breakdown-amount">${nfUSD.format(monthlyItems.reduce((sum, r) => sum + Number(r.cost || 0), 0))}</span>
                  <span class="breakdown-percentage">${biz.mUSD > 0 ? Math.round((monthlyItems.reduce((sum, r) => sum + Number(r.cost || 0), 0) / biz.mUSD) * 100) : 0}%</span>
                </div>
              </li>
              <li class="breakdown-item">
                <span class="breakdown-name">Annual (${annualItems.length})</span>
                <div>
                  <span class="breakdown-amount">${nfUSD.format(annualItems.reduce((sum, r) => sum + Number(r.cost || 0) / 12, 0))}</span>
                  <span class="breakdown-percentage">${biz.mUSD > 0 ? Math.round((annualItems.reduce((sum, r) => sum + Number(r.cost || 0) / 12, 0) / biz.mUSD) * 100) : 0}%</span>
                </div>
              </li>
            </ul>
          </div>

          <div class="analytics-section">
            <div class="section-title">Expense Analysis</div>
            <ul class="breakdown-list">
              <li class="breakdown-item">
                <span class="breakdown-name">High-Cost (>${nfUSD.format(avgAll)})</span>
                <div>
                  <span class="breakdown-amount">${highCostItems}</span>
                  <span class="breakdown-percentage">items</span>
                </div>
              </li>
              <li class="breakdown-item">
                <span class="breakdown-name">Low-Cost (≤${nfUSD.format(avgAll)})</span>
                <div>
                  <span class="breakdown-amount">${lowCostItems}</span>
                  <span class="breakdown-percentage">items</span>
                </div>
              </li>
            </ul>
          </div>

          <div class="analytics-section">
            <div class="section-title">Top Expenses</div>
            <ul class="breakdown-list">
              ${sortedByCost.slice(0, 3).map(item => {
                const monthlyCost = item.billing === 'Monthly' ? Number(item.cost || 0) : Number(item.cost || 0) / 12;
                return `
                  <li class="breakdown-item">
                    <span class="breakdown-name">${item.name || 'Unnamed'}</span>
                    <div>
                      <span class="breakdown-amount">${nfUSD.format(monthlyCost)}</span>
                      <span class="breakdown-percentage">${item.billing}</span>
                    </div>
                  </li>
                `;
              }).join('')}
            </ul>
          </div>
        </div>

        ${upcomingRenewals.length > 0 ? `
        <div class="analytics-section">
          <div class="section-title">Upcoming Renewals</div>
          <ul class="breakdown-list">
            ${upcomingRenewals.slice(0, 3).map(item => {
              const nextDate = new Date(item.next);
              const today = new Date();
              const diffTime = nextDate - today;
              const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
              let statusText;
              if (diffDays === 0) {
                statusText = 'Today';
              } else if (diffDays === 1) {
                statusText = 'Tomorrow';
              } else if (diffDays > 0) {
                statusText = `${diffDays} days`;
              } else {
                statusText = 'Overdue';
              }
              return `
                <li class="breakdown-item">
                  <span class="breakdown-name">${item.name || 'Unnamed'}</span>
                  <div>
                    <span class="breakdown-amount">${formatDateForDisplay(item.next)}</span>
                    <span class="breakdown-percentage">${statusText}</span>
                  </div>
                </li>
              `;
            }).join('')}
          </ul>
        </div>
        ` : ''}

        <div class="analytics-section">
          <div class="section-title">Insights</div>
          <div class="insight-card">
            <div class="insight-text">
              Business Investment: <strong>${nfUSD.format(biz.mUSD)}</strong>/month | 
              Tool Efficiency: <strong>${Math.round((highCostItems / activeItems.length) * 100) || 0}%</strong> high-value tools | 
              Renewal Alert: <strong>${upcomingRenewals.length}</strong> due soon
              ${highestExpense ? ` | Top Investment: <strong>${highestExpense.name || 'Unnamed'}</strong> (${nfUSD.format(highestExpense.billing === 'Monthly' ? Number(highestExpense.cost || 0) : Number(highestExpense.cost || 0) / 12)})` : ''}
              ${upcomingRenewalCosts > 0 ? ` | Upcoming Costs: <strong>${nfUSD.format(upcomingRenewalCosts)}</strong>` : ''}
              ${annualSavings > 0 ? ` | Annual Savings: <strong>${nfUSD.format(annualSavings)}</strong>` : ''}
            </div>
          </div>
        </div>
      `;
    }

    // Icon Picker
    const iconPickerEl = document.getElementById('iconPicker');
    const iconSearchEl = document.getElementById('iconSearch');
    const iconGridEl = document.getElementById('iconPickerGrid');
    let iconPickCtx = null; // { arr, idx }

    let FONTAWESOME_ICONS = [];
    let faLoaded = false;
    const ICON_CACHE_KEY = 'finance-icon-cache-fontawesome-v3';
    const CUSTOM_ICONS_KEY = 'finance-custom-icons-v1';
    let customIcons = [];
    let currentStyle = 'solid'; // 'solid' or 'regular'

    // Load custom icons from localStorage
    function loadCustomIcons() {
      try {
        const stored = localStorage.getItem(CUSTOM_ICONS_KEY);
        if (stored) {
          customIcons = JSON.parse(stored);
        }
      } catch (e) {
        customIcons = [];
      }
    }

    // Save custom icons to localStorage
    function saveCustomIcons() {
      try {
        localStorage.setItem(CUSTOM_ICONS_KEY, JSON.stringify(customIcons));
      } catch (e) {
        console.error('Failed to save custom icons:', e);
      }
    }

    // Add custom icon
    function addCustomIcon(iconData, type, name) {
      const customIcon = {
        id: Date.now().toString(),
        data: iconData,
        type: type, // 'image' or 'glyph'
        name: name || `Custom ${type}`,
        dateAdded: new Date().toISOString()
      };
      customIcons.push(customIcon);
      saveCustomIcons();
    }

    async function ensureFontAwesomeLoaded(){
      if(faLoaded && FONTAWESOME_ICONS.length) return;
      try{
        // try cache first
        const cached = localStorage.getItem(ICON_CACHE_KEY);
        if(cached){
          FONTAWESOME_ICONS = JSON.parse(cached);
          faLoaded = true;
          return;
        }
        
        // Get only VERIFIED WORKING icons (tested and confirmed for Font Awesome 7.0.0)
        const curatedIcons = [
          // Personal icons (VERIFIED SOLID)
          'home','user','heart','star','gift','coffee','book','music','camera','car','plane','bus','shopping-cart','wallet','credit-card','calendar','clock','phone','envelope','utensils','bed','laptop','headphones','gamepad','tree','sun','moon','cloud','fire','bolt','shield','lock','key','search','download','upload','share','edit','trash','plus','minus','check','times','arrow-right','arrow-left','arrow-up','arrow-down','eye','bookmark','flag','thumbs-up','smile','comment','bell','cog','wrench','image','video','play','pause','stop','save','folder','file',
          
          // Business icons (VERIFIED SOLID)
          'briefcase','building','chart-line','chart-bar','chart-pie','calculator','coins','university','store','truck','box','clipboard','list','calendar-check','server','database','sync','users','handshake','target','trophy','award','graduation-cap','archive','inbox','paper-plane','print','expand','compress','check-circle','exclamation-circle','question-circle','info-circle','ban','unlock','sort','th-list','th','table','square','circle','equals','divide','percentage','compass','triangle',
          
          // Brand icons (VERIFIED BRANDS for FA 7.0.0)
          'amazon','apple','google','microsoft','facebook','twitter','instagram','linkedin','youtube','github','reddit','discord','slack','telegram','whatsapp','dropbox','stripe','paypal','visa','mastercard','bitcoin','dribbble','behance','figma','trello','wordpress','medium','chrome','firefox','android','spotify','netflix','adobe','shopify','wix','zoom','skype','docker','aws','gitlab','bitbucket','stackoverflow','codepen','npm','node-js','react','vue','angular','html5','css3','js','python','java','git','webflow'
        ];
        
        FONTAWESOME_ICONS = curatedIcons.map(name => `fa:${name}`);
        localStorage.setItem(ICON_CACHE_KEY, JSON.stringify(FONTAWESOME_ICONS));
        faLoaded = true;
      }catch(err){
        // Fallback minimal set
        FONTAWESOME_ICONS = ['fa:home','fa:user','fa:heart','fa:star','fa:briefcase','fa:building','fa:chart-line','fa:calculator','fa:wallet','fa:shopping-cart','fa:car','fa:plane','fa:laptop','fa:phone','fa:envelope','fa:calendar','fa:clock','fa:search','fa:settings','fa:trash','fa:edit','fa:plus','fa:minus','fa:check','fa:times'];
        faLoaded = true;
      }
    }

    function renderIconPicker(filter, category = 'all'){
      const q = (filter||'').trim().toLowerCase();
      iconGridEl.innerHTML = '';
      
      let items = [];
      
      // Filter by category
      if(category === 'custom'){
        items = customIcons.map(icon => `custom:${icon.id}`);
      } else if(category === 'personal'){
        items = FONTAWESOME_ICONS.filter(n => ['home','user','heart','star','gift','coffee','book','music','camera','tv','car','plane','train','bus','shopping','wallet','calendar','phone','envelope','utensils','bed','laptop','mobile','headphones','gamepad','football','tree','leaf','sun','moon','cloud','umbrella','fire','bolt','shield','lock','key','search','filter','download','upload','share','copy','edit','trash','plus','minus','check','times','arrow','eye','bookmark','flag','thumbs','smile','comment','bell','cog','tools','paint','image','video','film','microphone','volume','play','pause','stop','forward','backward','random','repeat','refresh','sync','undo','redo','save','folder','file'].some(keyword => n.includes(keyword)));
      } else if(category === 'business'){
        items = FONTAWESOME_ICONS.filter(n => ['briefcase','building','chart','calculator','file','receipt','money','coins','credit','university','store','warehouse','factory','truck','shipping','box','package','clipboard','list','check','calendar','clock','network','server','database','cloud','sync','cogs','wrench','hammer','tools','project','users','handshake','bullhorn','target','flag','trophy','medal','award','certificate','diploma','graduation','folder','archive','inbox','mail','phone','print','save','undo','redo','expand','compress','window','times','exclamation','question','info','ban','unlock','eye','sort','table','border','square','circle','ellipsis','equal','divide','percentage','trending','line','bar','pie','area','scatter','bubble','radar','polar','doughnut','gauge','speedometer','thermometer','compass','ruler','protractor','triangle','pentagon','hexagon','octagon','diamond','rhombus','trapezoid','parallelogram','kite'].some(keyword => n.includes(keyword)));
      } else if(category === 'brands'){
        items = FONTAWESOME_ICONS.filter(n => ['amazon','apple','google','microsoft','facebook','twitter','instagram','linkedin','youtube','github','reddit','discord','slack','telegram','whatsapp','dropbox','stripe','paypal','visa','mastercard','bitcoin','dribbble','behance','figma','trello','wordpress','medium','chrome','firefox','android','spotify','netflix','adobe','shopify','wix','zoom','skype','docker','aws','gitlab','bitbucket','stackoverflow','codepen','npm','node-js','react','vue','angular','html5','css3','js','python','java','git','webflow'].some(keyword => n.includes(keyword)));
      } else {
        items = FONTAWESOME_ICONS;
      }
      
      // Apply search filter
      if(q){
        items = items.filter(n => n.includes(q));
      }
      
      items = items.slice(0, 500);
      
      if(!items.length){ 
        iconGridEl.innerHTML = '<div class="text-sm" style="color:var(--muted)">No icons found</div>'; 
        return; 
      }
      
      const frag = document.createDocumentFragment();
      items.forEach(name=>{
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'icon-tile';
        btn.setAttribute('data-icon', name);
        
        // Handle custom icons
        if(name.startsWith('custom:')){
          const customId = name.replace('custom:', '');
          const customIcon = customIcons.find(icon => icon.id === customId);
          if(customIcon){
            if(customIcon.type === 'image'){
              btn.innerHTML = `<img src="${customIcon.data}" />`;
            } else if(customIcon.type === 'glyph'){
              btn.innerHTML = `<i class="fa-solid" style="font-family:'Font Awesome 7 Free'; color:inherit;">&#x${customIcon.data};</i>`;
            }
          }
        } else {
        // Use appropriate style - brands use fa-brands, others use fa-solid
        const iconName = name.replace('fa:', '');
          const isBrand = ['amazon','apple','google','microsoft','facebook','twitter','instagram','linkedin','youtube','github','reddit','discord','slack','telegram','whatsapp','dropbox','stripe','paypal','visa','mastercard','bitcoin','dribbble','behance','figma','trello','wordpress','medium','chrome','firefox','android','spotify','netflix','adobe','shopify','wix','zoom','skype','docker','aws','gitlab','bitbucket','stackoverflow','codepen','npm','node-js','react','vue','angular','html5','css3','js','python','java','git','webflow'].includes(iconName);
        const iconClass = isBrand ? 'fa-brands' : 'fa-solid';
        btn.innerHTML = `<i class="${iconClass} fa-${iconName}" style="color:inherit;"></i>`;
        }
        
        btn.addEventListener('click', ()=>{
          if(!iconPickCtx) return;
          const { arr, idx } = iconPickCtx;
          if(name.startsWith('custom:')){
            const customId = name.replace('custom:', '');
            const customIcon = customIcons.find(icon => icon.id === customId);
            if(customIcon){
              if(customIcon.type === 'image'){
                arr[idx].icon = `custom-image:${customIcon.data}`;
              } else if(customIcon.type === 'glyph'){
                arr[idx].icon = `fa-glyph:${customIcon.data}`;
              }
            }
          } else {
          arr[idx].icon = name;
          }
          
          // Use instant save for income rows, regular save for others
          const isIncomeRow = arr === state.income[currentYear] || 
                             Object.values(state.income || {}).some(yearData => yearData === arr);
          if (isIncomeRow && arr[idx]) {
            instantSaveIncomeRow(arr[idx], currentYear);
          } else {
            save();
          }
          
          iconPickerEl.close();
          iconPickCtx = null;
          renderAll();
        });
        frag.appendChild(btn);
      });
      iconGridEl.appendChild(frag);
      
      // Update count
      document.getElementById('iconCount').textContent = `Showing ${items.length} icons`;
    }

    iconSearchEl.addEventListener('input', ()=>renderIconPicker(iconSearchEl.value, currentTab));

    let currentTab = 'all';
    document.getElementById('iconTabs').addEventListener('click', (e)=>{
      if(e.target.classList.contains('tab-btn')){
        document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
        e.target.classList.add('active');
        currentTab = e.target.dataset.tab;
        renderIconPicker(iconSearchEl.value, currentTab);
      }
    });

    // Apply glyph button
    document.getElementById('applyGlyph').addEventListener('click', ()=>{
      const unicode = document.getElementById('glyphInput').value.trim();
      if(unicode.length >= 4){
        if(!iconPickCtx) return;
        const { arr, idx } = iconPickCtx;
        const cleanUnicode = unicode.replace(/^\\u/, '');
        arr[idx].icon = `fa-glyph:${cleanUnicode}`;
        
        // Add to custom icons
        addCustomIcon(cleanUnicode, 'glyph', `Glyph ${cleanUnicode}`);
        
        // Use instant save for income rows, regular save for others
        const isIncomeRow = arr === state.income[currentYear] || 
                           Object.values(state.income || {}).some(yearData => yearData === arr);
        if (isIncomeRow && arr[idx]) {
          instantSaveIncomeRow(arr[idx], currentYear);
        } else {
          save();
        }
        
        iconPickerEl.close();
        iconPickCtx = null;
        renderAll();
      }
    });
    
    // Custom image upload functionality
    let customImageData = null;
    
    document.getElementById('uploadCustomImage').addEventListener('click', ()=>{
      document.getElementById('customImageInput').click();
    });
    
    document.getElementById('customImageInput').addEventListener('change', (e)=>{
      const file = e.target.files[0];
      if (!file) return;
      
      const reader = new FileReader();
      reader.onload = (e)=>{
        customImageData = e.target.result;
        const imagePreview = document.getElementById('imagePreview');
        const applyBtn = document.getElementById('applyCustomImage');
        
        // Show preview
        imagePreview.innerHTML = `<img src="${customImageData}" style="width:16px; height:16px; object-fit:contain; filter: invert(1);" />`;
        
        applyBtn.disabled = false;
      };
      reader.readAsDataURL(file);
    });
    
    document.getElementById('applyCustomImage').addEventListener('click', ()=>{
      if (customImageData && iconPickCtx) {
        const { arr, idx } = iconPickCtx;
        arr[idx].icon = `custom-image:${customImageData}`;
        
        // Add to custom icons
        addCustomIcon(customImageData, 'image', 'Custom Image');
        
        // Use instant save for income rows, regular save for others
        const isIncomeRow = arr === state.income[currentYear] || 
                           Object.values(state.income || {}).some(yearData => yearData === arr);
        if (isIncomeRow && arr[idx]) {
          instantSaveIncomeRow(arr[idx], currentYear);
        } else {
          save();
        }
        
        iconPickerEl.close();
        iconPickCtx = null;
        renderAll();
      }
    });

    // Glyph input handler with preview
    const glyphPreview = document.getElementById('glyphPreview');
    document.getElementById('glyphInput').addEventListener('input', (e)=>{
      const unicode = e.target.value.trim();
      if(unicode.length >= 4){
        // Show preview - try different unicode formats
        const unicodeValue = unicode.startsWith('\\u') ? unicode : `\\u${unicode}`;
        const unicodeDecoded = unicodeValue.replace('\\u', '');
        glyphPreview.innerHTML = `<i class="fa-solid" style="font-family:'Font Awesome 7 Free'; font-size:16px;">&#x${unicodeDecoded};</i>`;
      } else {
        glyphPreview.innerHTML = '';
      }
    });

    document.getElementById('glyphInput').addEventListener('keydown', (e)=>{
      if(e.key === 'Enter'){
        const unicode = e.target.value.trim();
        if(unicode.length >= 4){
          if(!iconPickCtx) return;
          const { arr, idx } = iconPickCtx;
          const cleanUnicode = unicode.replace(/^\\u/, '');
          arr[idx].icon = `fa-glyph:${cleanUnicode}`;
          
          // Use instant save for income rows, regular save for others
          const isIncomeRow = arr === state.income[currentYear] || 
                             Object.values(state.income || {}).some(yearData => yearData === arr);
          if (isIncomeRow && arr[idx]) {
            instantSaveIncomeRow(arr[idx], currentYear);
          } else {
            save();
          }
          
          iconPickerEl.close();
          iconPickCtx = null;
          renderAll();
        }
      }
    });

    function openIconPicker(arr, idx){
      iconPickCtx = { arr, idx };
      iconSearchEl.value = '';
      currentTab = 'all';
      currentStyle = 'solid';
      document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
      document.querySelector('[data-tab="all"]').classList.add('active');
      document.getElementById('glyphInput').value = '';
      document.getElementById('glyphPreview').innerHTML = '';
      document.getElementById('customImageInput').value = '';
      document.getElementById('imagePreview').innerHTML = '';
      document.getElementById('applyCustomImage').disabled = true;
      customImageData = null;
      
      // Load custom icons
      loadCustomIcons();
      
      ensureFontAwesomeLoaded().then(()=>{ renderIconPicker('', 'all'); iconPickerEl.showModal(); });
    }

    function renderList(containerId, arr, isBiz){
      const wrap=document.getElementById(containerId); wrap.innerHTML='';
      arr.forEach((row,idx)=>{
        const mUSD=rowMonthlyUSD(row), yUSD=rowYearlyUSD(row), mEGP=usdToEgp(mUSD), yEGP=usdToEgp(yUSD);
        const div=document.createElement('div'); 
        div.className=isBiz?'row row-biz row-draggable row-drop-zone':'row row-draggable row-drop-zone';
        div.setAttribute('data-row-index', idx);
        div.setAttribute('draggable', 'true');
        
        // drag handle cell
        const dragHandleDiv=document.createElement('div'); 
        dragHandleDiv.className='drag-handle';
        dragHandleDiv.innerHTML='<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="w-4 h-4"><path d="M8 6h8M8 12h8M8 18h8"/></svg>';
        dragHandleDiv.title='Drag to reorder';
        
        // icon cell
        const iconName = row.icon || (isBiz ? 'fa:briefcase' : 'fa:shopping-cart');
        let iconHTML = '';
        if(iconName.startsWith('custom-image:')){
          const imageData = iconName.replace('custom-image:', '');
          iconHTML = `<img src="${imageData}" />`;
        } else if(iconName.startsWith('fa-glyph:')){
          const unicode = iconName.replace('fa-glyph:', '');
          iconHTML = `<i class="fa-solid" style="font-family:'Font Awesome 7 Free'; color:inherit;">&#x${unicode};</i>`;
        } else {
          const cleanIconName = iconName.replace(/^(fa-solid|fa-regular|fa:)/, '');
          const isBrand = ['amazon','apple','google','microsoft','facebook','twitter','instagram','linkedin','youtube','github','reddit','discord','slack','telegram','whatsapp','dropbox','stripe','paypal','visa','mastercard','bitcoin','dribbble','behance','figma','trello','wordpress','medium','chrome','firefox','android','spotify','netflix','adobe','shopify','wix','zoom','skype','docker','aws','gitlab','bitbucket','stackoverflow','codepen','npm','node-js','react','vue','angular','html5','css3','js','python','java','git','webflow'].includes(cleanIconName);
          const iconClass = isBrand ? 'fa-brands' : 'fa-solid';
          iconHTML = `<i class="${iconClass} fa-${cleanIconName}" style="color:inherit;"></i>`;
        }
        const iconDiv=document.createElement('div'); iconDiv.className='icon-cell';
        iconDiv.innerHTML=`<button type="button" title="Change icon" data-choose-icon>\
          ${iconHTML}\
        </button>`;
        // name & inputs
         const nameDiv=document.createElement('div'); 
         const nameInput = document.createElement('input');
         nameInput.className = 'input';
         nameInput.type = 'text';
         nameInput.value = row.name || '';
         nameInput.placeholder = 'Item name';
         nameInput.addEventListener('input', function() {
           row.name = this.value;
           save('name-input');
         });
         nameDiv.appendChild(nameInput);
         
         const costDiv=document.createElement('div'); 
         const costInput = document.createElement('input');
         costInput.className = 'input cost-input';
         costInput.type = 'number';
         costInput.step = '0.01';
         costInput.value = (row.cost || 0).toFixed(2);
         costInput.addEventListener('input', function() {
           row.cost = Number(this.value) || 0;
           save('cost-input');
          // Live calculations as you type
           updateRowCalculations(div, row, isBiz);
           renderKPIs();
         });
         costDiv.innerHTML = '<div class="cost-input-wrapper"></div>';
         const wrapper = costDiv.querySelector('.cost-input-wrapper');
         
         // Add dollar sign display BEFORE the input
         const dollarDisplay = document.createElement('span');
         dollarDisplay.className = 'cost-dollar-display';
         dollarDisplay.textContent = '$';
         wrapper.appendChild(dollarDisplay);
         
         wrapper.appendChild(costInput);
         
         const statusDiv=document.createElement('div'); 
         const statusToggle = document.createElement('div');
         statusToggle.className = 'toggle-switch status-' + (row.status === 'Active' ? 'active' : 'cancelled');
         
         const statusSlider = document.createElement('div');
         statusSlider.className = 'toggle-slider';
         
         const statusText = document.createElement('div');
         statusText.className = 'toggle-text';
         statusText.textContent = row.status === 'Active' ? 'ON' : 'OFF';
         
        statusSlider.appendChild(statusText);
        statusToggle.appendChild(statusSlider);
         
         statusToggle.addEventListener('click', function(e) {
           e.preventDefault();
           e.stopPropagation();
           
           // Toggle status
           if (row.status === 'Active') {
             row.status = 'Cancelled';
             statusToggle.className = 'toggle-switch status-cancelled';
             statusText.textContent = 'OFF';
           } else {
             row.status = 'Active';
             statusToggle.className = 'toggle-switch status-active';
             statusText.textContent = 'ON';
           }
           
           save('status-toggle');
           updateRowCalculations(div, row, isBiz);
           renderKPIs();
         });
         
         statusDiv.appendChild(statusToggle);
         
         const billingDiv=document.createElement('div'); 
         const billingToggle = document.createElement('div');
         billingToggle.className = 'toggle-switch billing-' + (row.billing === 'Monthly' ? 'monthly' : 'annually');
         
         const billingSlider = document.createElement('div');
         billingSlider.className = 'toggle-slider';
         
         const billingText = document.createElement('div');
         billingText.className = 'toggle-text';
         billingText.textContent = row.billing === 'Monthly' ? 'M' : 'Y';
         
        billingSlider.appendChild(billingText);
        billingToggle.appendChild(billingSlider);
         
         billingToggle.addEventListener('click', function(e) {
           e.preventDefault();
           e.stopPropagation();
           
          // Toggle billing
          if (row.billing === 'Monthly') {
            row.billing = 'Annually';
            billingToggle.className = 'toggle-switch billing-annually';
            billingText.textContent = 'Y';
          } else {
            row.billing = 'Monthly';
            billingToggle.className = 'toggle-switch billing-monthly';
            billingText.textContent = 'M';
          }
           
           save('billing-toggle');
           updateRowCalculations(div, row, isBiz);
           renderKPIs();
         });
         
         billingDiv.appendChild(billingToggle);
         
         
        div.append(dragHandleDiv,iconDiv,nameDiv,costDiv,statusDiv,billingDiv);
        if(isBiz){ 
          const dateDiv=document.createElement('div'); 
          dateDiv.style.position = 'relative';
          // Create a container for the date display
          const dateContainer = document.createElement('div');
          dateContainer.className = 'next-date-container';
          dateContainer.style.cssText = 'display: flex; align-items: center; gap: 0.25rem; font-size: 0.65rem; color: var(--muted);';
          
          // Create the date input (hidden by default)
          const dateInput = document.createElement('input');
          dateInput.className = 'input date-input-minimal';
          dateInput.type = 'date';
          dateInput.value = row.next || '';
          dateInput.style.display = 'none';
          
          // Create display element
          const dateDisplay = document.createElement('span');
          dateDisplay.className = 'next-date-display';
          dateDisplay.style.cssText = 'cursor: pointer; padding: 0.25rem 0.5rem; border-radius: 4px; transition: all 0.2s ease;';
          
          // Function to update display
          const updateDateDisplay = () => {
            if (row.next) {
              dateDisplay.textContent = formatDateForDisplay(row.next);
              dateDisplay.style.color = 'var(--fg)';
              dateDisplay.style.backgroundColor = 'var(--hover)';
            } else {
              dateDisplay.textContent = 'Set date';
              dateDisplay.style.color = 'var(--muted)';
              dateDisplay.style.backgroundColor = 'transparent';
            }
          };
          
          // Initial display update
          updateDateDisplay();
          
          // Click to edit
          dateDisplay.addEventListener('click', () => {
            dateInput.style.display = 'block';
            dateDisplay.style.display = 'none';
            dateInput.focus();
          });
          
          // Save and hide input
          dateInput.addEventListener('change', function() {
            row.next = this.value;
            this.style.display = 'none';
            dateDisplay.style.display = 'block';
            updateDateDisplay();
            save('date-input');
            renderKPIs(); // Update KPIs for renewal analytics
          });
          
          // Hide input on blur if no change
          dateInput.addEventListener('blur', function() {
            setTimeout(() => {
              this.style.display = 'none';
              dateDisplay.style.display = 'block';
            }, 100);
          });
          
          dateContainer.appendChild(dateDisplay);
          dateContainer.appendChild(dateInput);
          dateDiv.appendChild(dateContainer);
          div.appendChild(dateDiv); 
        }
        // computed columns - all editable with clean formatting and always-visible symbols
        const mUSDd=document.createElement('div'); 
        mUSDd.className='financial-input-wrapper'; 
        mUSDd.innerHTML='<span class="financial-symbol">$</span><span class="financial-value">' + Math.round(mUSD).toLocaleString() + '</span>';
        mUSDd.setAttribute('data-field', 'monthlyUSD');
        mUSDd.setAttribute('data-row-index', idx);
        mUSDd.setAttribute('data-type', 'usd');
        mUSDd.setAttribute('data-original', Math.round(mUSD));
        mUSDd.addEventListener('click', function() { makeEditable(this, row, isBiz, div); });
        
        const yUSDd=document.createElement('div'); 
        yUSDd.className='financial-input-wrapper'; 
        yUSDd.innerHTML='<span class="financial-symbol">$</span><span class="financial-value">' + Math.round(yUSD).toLocaleString() + '</span>';
        yUSDd.setAttribute('data-field', 'yearlyUSD');
        yUSDd.setAttribute('data-row-index', idx);
        yUSDd.setAttribute('data-type', 'usd');
        yUSDd.setAttribute('data-original', Math.round(yUSD));
        yUSDd.addEventListener('click', function() { makeEditable(this, row, isBiz, div); });
        
        const mEGPd=document.createElement('div'); 
        mEGPd.className='financial-input-wrapper'; 
        mEGPd.innerHTML='<span class="financial-symbol">EGP</span><span class="financial-value">' + Math.round(mEGP).toLocaleString() + '</span>';
        mEGPd.setAttribute('data-field', 'monthlyEGP');
        mEGPd.setAttribute('data-row-index', idx);
        mEGPd.setAttribute('data-type', 'egp');
        mEGPd.setAttribute('data-original', Math.round(mEGP));
        mEGPd.addEventListener('click', function() { makeEditable(this, row, isBiz, div); });
        
        const yEGPd=document.createElement('div'); 
        yEGPd.className='financial-input-wrapper'; 
        yEGPd.innerHTML='<span class="financial-symbol">EGP</span><span class="financial-value">' + Math.round(yEGP).toLocaleString() + '</span>';
        yEGPd.setAttribute('data-field', 'yearlyEGP');
        yEGPd.setAttribute('data-row-index', idx);
        yEGPd.setAttribute('data-type', 'egp');
        yEGPd.setAttribute('data-original', Math.round(yEGP));
        yEGPd.addEventListener('click', function() { makeEditable(this, row, isBiz, div); });
        div.append(mUSDd,yUSDd,mEGPd,yEGPd);
        // delete
        const del=document.createElement('div'); 
        del.innerHTML='<button class="delete-btn" data-del aria-label="Delete">\
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" class="w-4 h-4"><path d="M7 9h10M9 9v8m6-8v8M5 6h14l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6Zm3-3h8l1 3H7l1-3Z"/></svg></button>';
        div.appendChild(del);

        // wire inputs
        const nameInp=nameDiv.querySelector('input'); nameInp.addEventListener('input', ()=>{ row.name=nameInp.value; save('name-input'); });
        const costInp=costDiv.querySelector('.cost-input');
        costInp.addEventListener('input', ()=>{ 
          row.cost=Number(costInp.value||0); 
          save('cost-input'); 
        });
        
        // Update calculations when user finishes typing
        costInp.addEventListener('blur', ()=>{ 
          updateRowCalculations(div, row, isBiz);
          renderKPIs();
        });
        if(isBiz){ const dateInp=div.querySelector('input[type="date"]'); if(dateInp){ dateInp.addEventListener('change', ()=>{ row.next=dateInp.value; save('date-input'); }); } }
        const iconBtn=iconDiv.querySelector('[data-choose-icon]');
        iconBtn.addEventListener('click', ()=> openIconPicker(arr, idx));
        const delBtn=del.querySelector('[data-del]'); 
        delBtn.addEventListener('click', async ()=>{ 
          if(delBtn.classList.contains('delete-confirm')){
            // If the row has an ID, delete it from Supabase first
            if (row.id && currentUser && supabaseReady) {
              const tableName = isBiz ? 'business_expenses' : 'personal_expenses';
              const { error } = await window.supabaseClient
                .from(tableName)
                .delete()
                .eq('id', row.id);
              
              if (error) {
                console.error(`Error deleting ${tableName} record:`, error);
                showNotification(`Failed to delete ${isBiz ? 'business' : 'personal'} expense`, 'error', 2000);
                return; // Don't delete locally if Supabase delete failed
              } else {
                console.log(`Successfully deleted ${tableName} record:`, row.id);
                showNotification(`${isBiz ? 'Business' : 'Personal'} expense deleted`, 'success', 1000);
              }
            }
            
            // Remove from local state
            arr.splice(idx,1); 
            saveToLocal(); // Save locally as well
            renderAll();
          } else {
            delBtn.classList.add('delete-confirm');
            delBtn.innerHTML = 'Sure?';
            setTimeout(()=>{
              delBtn.classList.remove('delete-confirm');
              delBtn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" class="w-4 h-4"><path d="M7 9h10M9 9v8m6-8v8M5 6h14l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6Zm3-3h8l1 3H7l1-3Z"/></svg>';
            }, 3000);
          }
        });
        // Removed auto-add row on Enter key to prevent unwanted row creation

      wrap.appendChild(div);
    });

      // sums
      const sumEl=document.getElementById(containerId==='list-personal'?'sum-personal':'sum-biz');
      const t=totals(arr);
      let sumHTML='';
      // drag handle column
      sumHTML += '<div></div>';
      // icon column (present for both personal and biz)
      sumHTML += '<div></div>';
      // label
      sumHTML += '<div class="font-medium" style="color:var(--muted)">Totals</div>';
      // spacer columns before computed values (Cost USD, Status, Billing, Next for Biz)
      if(isBiz){ sumHTML += '<div></div><div></div><div></div><div></div>'; } // Cost, Status, Billing, Next
      else { sumHTML += '<div></div><div></div><div></div>'; } // Cost, Status, Billing
      // computed sum cells
      sumHTML += '<div class="font-semibold">$'+nfINT.format(t.mUSD)+'</div>';
      sumHTML += '<div class="font-semibold">$'+nfINT.format(t.yUSD)+'</div>';
      sumHTML += '<div class="font-semibold">EGP '+nfINT.format(Math.round(t.mEGP))+'</div>';
      sumHTML += '<div class="font-semibold">EGP '+nfINT.format(Math.round(t.yEGP))+'</div>';
      // delete column spacer
      sumHTML += '<div></div>';
      sumEl.innerHTML=sumHTML;
    }


  function renderIncomeList(containerId, arr) {
    const wrap = document.getElementById(containerId);
    if (!wrap) return;
    wrap.innerHTML = '';
    
    arr.forEach((row, idx) => {
      const mUSD = rowIncomeMonthlyUSD(row);
      const yUSD = rowIncomeYearlyUSD(row);
      const mEGP = usdToEgp(mUSD);
      const yEGP = usdToEgp(yUSD);
      
      const div = document.createElement('div');
      div.className = 'row row-income row-draggable row-drop-zone';
      div.setAttribute('data-row-index', idx);
      div.setAttribute('draggable', 'true');
      div.__rowData = row; // Store row data for tag system
      
      // Drag handle
      const dragHandleDiv = document.createElement('div');
      dragHandleDiv.className = 'drag-handle';
      dragHandleDiv.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="w-4 h-4"><path d="M8 6h8M8 12h8M8 18h8"/></svg>';
      dragHandleDiv.title = 'Drag to reorder';
      dragHandleDiv.setAttribute('draggable', 'true');
      
      // Make the drag handle work by delegating to the row
      dragHandleDiv.addEventListener('dragstart', (e) => {
        e.stopPropagation();
        // Transfer the drag to the parent row
        const rowDragEvent = new DragEvent('dragstart', {
          bubbles: true,
          cancelable: true,
          dataTransfer: e.dataTransfer
        });
        // Set the target to the row element
        Object.defineProperty(rowDragEvent, 'target', { value: div, enumerable: true });
        div.dispatchEvent(rowDragEvent);
      });
      
      // Icon cell
      const iconName = row.icon || 'fa:dollar-sign';
      let iconHTML = '';
      if (iconName.startsWith('custom-image:')) {
        const imageData = iconName.replace('custom-image:', '');
        iconHTML = `<img src="${imageData}" />`;
      } else if (iconName.startsWith('fa-glyph:')) {
        const unicode = iconName.replace('fa-glyph:', '');
        iconHTML = `<i class="fa-solid" style="font-family:'Font Awesome 7 Free'; color:inherit;">&#x${unicode};</i>`;
      } else {
        const cleanIconName = iconName.replace(/^(fa-solid|fa-regular|fa:)/, '');
        const isBrand = ['amazon','apple','google','microsoft','facebook','twitter','instagram','linkedin','youtube','github','reddit','discord','slack','telegram','whatsapp','dropbox','stripe','paypal','visa','mastercard','bitcoin','dribbble','behance','figma','trello','wordpress','medium','chrome','firefox','android','spotify','netflix','adobe','shopify','wix','zoom','skype','docker','aws','gitlab','bitbucket','stackoverflow','codepen','npm','node-js','react','vue','angular','html5','css3','js','python','java','git','webflow'].includes(cleanIconName);
        const iconClass = isBrand ? 'fa-brands' : 'fa-solid';
        iconHTML = `<i class="${iconClass} fa-${cleanIconName}" style="color:inherit;"></i>`;
      }
      const iconDiv = document.createElement('div');
      iconDiv.className = 'icon-cell';
      iconDiv.innerHTML = `<button type="button" title="Change icon" data-choose-icon>${iconHTML}</button>`;
      
      // Name input
      const nameDiv = document.createElement('div');
      const nameInput = document.createElement('input');
      nameInput.className = 'input';
      nameInput.type = 'text';
      nameInput.value = row.name || '';
      nameInput.placeholder = 'Project name';
      nameInput.style.fontSize = '0.7rem';
      nameInput.style.padding = '0.4rem 0.6rem';
      nameInput.style.borderRadius = '8px';
      nameInput.addEventListener('input', function() {
        console.log('Income name input changed:', this.value);
        row.name = this.value;
        saveInputValue('projectName', this.value);
        instantSaveIncomeRow(row, currentYear);
      });
      addAutocompleteToInput(nameInput, 'projectName');
      nameDiv.appendChild(nameInput);
      
      // Modern Tags input with selection system
      const tagsDiv = document.createElement('div');
      const tagsWrapper = document.createElement('div');
      tagsWrapper.className = 'tag-input-wrapper';
      
      // Create chips for existing tags
      const existingTags = (row.tags || '').split(',').filter(tag => tag.trim());
      existingTags.forEach(tag => {
        const chip = createTagChip(tag.trim());
        tagsWrapper.appendChild(chip);
      });
      
      const tagsInput = document.createElement('input');
      tagsInput.className = 'tag-input';
      tagsInput.type = 'text';
      tagsInput.placeholder = '';
      tagsInput.addEventListener('input', function() {
        handleTagInput(this, tagsWrapper, row);
        instantSaveIncomeRow(row, currentYear); // Instant save when tags are modified
      });
      tagsInput.addEventListener('keydown', function(e) {
        handleTagKeydown(e, this, tagsWrapper, row);
      });
      tagsInput.addEventListener('focus', function() {
        showTagSuggestions(this, tagsWrapper);
      });
      tagsInput.addEventListener('blur', function() {
        setTimeout(() => hideTagSuggestions(tagsWrapper), 150);
      });
      
      // Store row reference for tag system
      tagsWrapper.__rowData = row;
      
      tagsWrapper.appendChild(tagsInput);
      tagsDiv.appendChild(tagsWrapper);
      
      // Date input (month and day only, with current year)
      const dateDiv = document.createElement('div');
      dateDiv.style.position = 'relative';
      
      const dateInput = document.createElement('input');
      dateInput.className = 'input date-input-minimal';
      dateInput.type = 'date';
      dateInput.placeholder = 'MM-DD';
      dateInput.style.fontSize = '0.75rem';
      dateInput.style.padding = '0.5rem 0.75rem';
      dateInput.style.borderRadius = '8px';
      
      // Set value with current year if no date exists
      if (row.date) {
        dateInput.value = row.date;
      } else {
        // Set to current year with today's month and day
        const today = new Date();
        const year = parseInt(currentYear) || today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const day = String(today.getDate()).padStart(2, '0');
        dateInput.value = `${year}-${month}-${day}`;
        row.date = dateInput.value;
      }
      
      dateInput.addEventListener('change', function() {
        // Ensure the year is set to current year
        const selectedDate = new Date(this.value);
        const year = parseInt(currentYear) || new Date().getFullYear();
        selectedDate.setFullYear(year);
        const finalYear = selectedDate.getFullYear();
        const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
        const day = String(selectedDate.getDate()).padStart(2, '0');
        const fullDate = `${finalYear}-${month}-${day}`;
        
        row.date = fullDate;
        this.value = fullDate;
        instantSaveIncomeRow(row, currentYear);
      });
      dateDiv.appendChild(dateInput);
      
      
      // All Payment input
      const allPaymentDiv = document.createElement('div');
      const allPaymentInput = document.createElement('input');
      allPaymentInput.className = 'input cost-input';
      allPaymentInput.type = 'number';
      allPaymentInput.step = '0.01';
      allPaymentInput.value = (row.allPayment || 0).toFixed(2);
      allPaymentInput.placeholder = 'Total $';
      allPaymentInput.style.fontSize = '0.75rem';
      allPaymentInput.style.padding = '0.5rem 0.75rem';
      allPaymentInput.style.borderRadius = '8px';
      allPaymentInput.addEventListener('input', function() {
        console.log('All payment input changed:', this.value);
        row.allPayment = Number(this.value) || 0;
        instantSaveIncomeRow(row, currentYear);
        updateIncomeRowCalculations(div, row);
      });
      allPaymentDiv.innerHTML = '<div class="cost-input-wrapper"></div>';
      const allPaymentWrapper = allPaymentDiv.querySelector('.cost-input-wrapper');
      const allPaymentDollarDisplay = document.createElement('span');
      allPaymentDollarDisplay.className = 'cost-dollar-display';
      allPaymentDollarDisplay.textContent = '$';
      allPaymentWrapper.appendChild(allPaymentDollarDisplay);
      allPaymentWrapper.appendChild(allPaymentInput);
      
      // Paid USD input
      const paidUsdDiv = document.createElement('div');
      const paidUsdInput = document.createElement('input');
      paidUsdInput.className = 'input cost-input';
      paidUsdInput.type = 'number';
      paidUsdInput.step = '0.01';
      paidUsdInput.value = (row.paidUsd || 0).toFixed(2);
      paidUsdInput.placeholder = 'Paid $';
      paidUsdInput.style.fontSize = '0.75rem';
      paidUsdInput.style.padding = '0.5rem 0.75rem';
      paidUsdInput.style.borderRadius = '8px';
      paidUsdInput.addEventListener('input', function() {
        console.log('Paid USD input changed:', this.value);
        row.paidUsd = Number(this.value) || 0;
        instantSaveIncomeRow(row, currentYear);
        updateIncomeRowCalculations(div, row);
      });
      paidUsdDiv.innerHTML = '<div class="cost-input-wrapper"></div>';
      const paidUsdWrapper = paidUsdDiv.querySelector('.cost-input-wrapper');
      const paidUsdDollarDisplay = document.createElement('span');
      paidUsdDollarDisplay.className = 'cost-dollar-display';
      paidUsdDollarDisplay.textContent = '$';
      paidUsdWrapper.appendChild(paidUsdDollarDisplay);
      paidUsdWrapper.appendChild(paidUsdInput);
      
      // Paid EGP (calculated)
      const paidEgpDiv = document.createElement('div');
      paidEgpDiv.className = 'paid-egp-cell editable-value';
      paidEgpDiv.textContent = 'EGP ' + nfINT.format(Math.round((row.paidEgp || (row.paidUsd || 0) * state.fx)));
      paidEgpDiv.setAttribute('data-field', 'paidEgp');
      paidEgpDiv.setAttribute('data-row-id', row.id || '');
      paidEgpDiv.setAttribute('data-year', currentYear);
      
      // Method select - minimal modern design
      const methodDiv = document.createElement('div');
      const methodDropdown = document.createElement('div');
      methodDropdown.className = 'method-dropdown-minimal';
      
      const methodTrigger = document.createElement('button');
      methodTrigger.className = 'method-trigger-minimal';
      methodTrigger.innerHTML = `
        <span class="method-text">${row.method || 'Bank Transfer'}</span>
        <svg class="method-arrow" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M6 9l6 6 6-6"/>
        </svg>
      `;
      
      const methodMenu = document.createElement('div');
      methodMenu.className = 'method-menu-minimal';
      
      // Add custom input section at the top
      const customInputSection = document.createElement('div');
      customInputSection.className = 'method-custom-section';
      customInputSection.style.cssText = 'padding: 0.5rem; border-bottom: 1px solid var(--stroke); margin-bottom: 0.25rem;';
      
      const customInput = document.createElement('input');
      customInput.type = 'text';
      customInput.placeholder = 'Add custom method...';
      customInput.className = 'method-custom-input';
      customInput.style.cssText = 'width: 100%; padding: 0.25rem 0.5rem; font-size: 0.7rem; border: 1px solid var(--stroke); border-radius: 4px; background: var(--card); color: var(--fg); outline: none;';
      
      customInput.addEventListener('keydown', function(e) {
        if (e.key === 'Enter') {
          e.preventDefault();
          const value = this.value.trim();
          if (value) {
            addCustomMethodOption(value);
            this.value = '';
            // Refresh the dropdown
            refreshMethodDropdown();
          }
        }
      });
      
      // Function to refresh the entire dropdown
      const refreshMethodDropdown = () => {
        methodMenu.innerHTML = '';
        methodMenu.appendChild(customInputSection);
        renderMethodOptions(methodMenu, row, methodDropdown);
      };
      
      customInputSection.appendChild(customInput);
      methodMenu.appendChild(customInputSection);
      
      // Function to render method options
      const renderMethodOptions = (container, rowData, dropdown) => {
        const options = getAllMethodOptions();
        const customOptions = getCustomMethodOptions();
        
      options.forEach(option => {
        const item = document.createElement('div');
        item.className = 'method-item-minimal';
          item.style.cssText = 'display: flex; align-items: center; justify-content: space-between; padding: 0.5rem; cursor: pointer; transition: all 0.2s ease;';
          
          if (option === (rowData.method || 'Bank Transfer')) {
          item.classList.add('selected');
        }
          
          const itemText = document.createElement('span');
          itemText.textContent = option;
          itemText.style.flex = '1';
          
          item.appendChild(itemText);
          
          // Add remove button for custom options only
          if (customOptions.includes(option)) {
            const removeBtn = document.createElement('button');
            removeBtn.innerHTML = '×';
            removeBtn.className = 'method-remove-btn';
            removeBtn.style.cssText = 'background: none; border: none; color: var(--muted); cursor: pointer; padding: 0.125rem 0.25rem; border-radius: 2px; font-size: 0.8rem; margin-left: 0.5rem; transition: all 0.2s ease;';
            removeBtn.title = 'Remove this option';
            
            removeBtn.addEventListener('click', function(e) {
              e.preventDefault();
              e.stopPropagation();
              removeCustomMethodOption(option);
              // Refresh the dropdown
              refreshMethodDropdown();
            });
            
            removeBtn.addEventListener('mouseenter', function() {
              this.style.backgroundColor = 'var(--hover)';
              this.style.color = 'var(--fg)';
            });
            
            removeBtn.addEventListener('mouseleave', function() {
              this.style.backgroundColor = 'transparent';
              this.style.color = 'var(--muted)';
            });
            
            item.appendChild(removeBtn);
          }
          
        item.addEventListener('click', function(e) {
          e.preventDefault();
          e.stopPropagation();
          
            rowData.method = option;
          methodTrigger.querySelector('.method-text').textContent = option;
          methodMenu.querySelectorAll('.method-item-minimal').forEach(i => i.classList.remove('selected'));
          this.classList.add('selected');
          methodDropdown.classList.remove('open');
          methodMenu.classList.remove('show');
            instantSaveIncomeRow(rowData, currentYear);
        });
          
          container.appendChild(item);
      });
      };
      
      // Initial render
      renderMethodOptions(methodMenu, row, methodDropdown);
      
      methodTrigger.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        
        // Close other dropdowns first
        document.querySelectorAll('.method-dropdown-minimal.open').forEach(dd => {
          if (dd !== methodDropdown) {
            dd.classList.remove('open');
            const menu = dd.querySelector('.method-menu-minimal');
            if (menu) {
              menu.classList.remove('show');
              menu.remove(); // Remove from document.body
            }
          }
        });
        
        methodDropdown.classList.toggle('open');
        
        if (methodMenu.classList.contains('show')) {
          methodMenu.classList.remove('show');
        } else {
          // Position dropdown based on available space
          positionDropdown(methodTrigger, methodMenu);
          methodMenu.classList.add('show');
        }
      });
      
      methodDropdown.appendChild(methodTrigger);
      methodDropdown.appendChild(methodMenu);
      methodDiv.appendChild(methodDropdown);
      
      // Close dropdown when clicking outside
      document.addEventListener('click', function(e) {
        if (!methodDropdown.contains(e.target)) {
          methodDropdown.classList.remove('open');
          methodMenu.classList.remove('show');
        }
      });
      
      
      // Delete button
      const deleteDiv = document.createElement('div');
      deleteDiv.innerHTML = '<button class="delete-btn" data-del aria-label="Delete">\
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" class="w-4 h-4"><path d="M7 9h10M9 9v8m6-8v8M5 6h14l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6Zm3-3h8l1 3H7l1-3Z"/></svg></button>';
      
      const delBtn = deleteDiv.querySelector('[data-del]');
      delBtn.addEventListener('click', function() {
        if (delBtn.classList.contains('delete-confirm')) {
          // If the row has an ID, delete it from Supabase
          if (row.id && currentUser && supabaseReady) {
            window.supabaseClient
              .from('income')
              .delete()
              .eq('id', row.id)
              .then(({ error }) => {
                if (error) {
                  console.error('Error deleting income record:', error);
                  showNotification('Failed to delete income', 'error', 2000);
                } else {
                  console.log('Successfully deleted income record:', row.id);
                  showNotification('Income deleted', 'success', 1000);
                }
              });
          }
          arr.splice(idx, 1);
          saveToLocal(); // Save locally as well
          renderAll();
        } else {
          delBtn.classList.add('delete-confirm');
          delBtn.innerHTML = 'Confirm';
          setTimeout(() => {
            delBtn.classList.remove('delete-confirm');
            delBtn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" class="w-4 h-4"><path d="M7 9h10M9 9v8m6-8v8M5 6h14l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6Zm3-3h8l1 3H7l1-3Z"/></svg>';
          }, 3000);
        }
      });
      
      // Add icon picker event listener
      const iconBtn = iconDiv.querySelector('[data-choose-icon]');
      iconBtn.addEventListener('click', () => openIconPicker(arr, idx));
      
      // Append all cells
      div.appendChild(dragHandleDiv);
      div.appendChild(iconDiv);
      div.appendChild(nameDiv);
      div.appendChild(tagsDiv);
      div.appendChild(dateDiv);
      div.appendChild(allPaymentDiv);
      div.appendChild(paidUsdDiv);
      div.appendChild(paidEgpDiv);
      
      // Add click event listener for PAID EGP editing
      paidEgpDiv.addEventListener('click', function() {
        if (this.classList.contains('editing')) return;
        
        this.classList.add('editing');
        const currentValue = row.paidEgp || (row.paidUsd || 0) * state.fx;
        
        const input = document.createElement('input');
        input.type = 'number';
        input.value = Math.round(currentValue);
        input.className = 'editable-input';
        input.style.textAlign = 'left';
        input.style.padding = '0.25rem 0.5rem';
        input.style.fontSize = '0.65rem';
        input.style.minWidth = '60px';
        
        const originalContent = this.textContent;
        this.textContent = '';
        this.appendChild(input);
        input.focus();
        input.select();
        
        const saveEdit = () => {
          const newValue = parseFloat(input.value) || 0;
          row.paidEgp = newValue;
          
          // Update the state as well
          const year = currentYear;
          const stateRowIndex = (state.income[year] || []).findIndex(stateRow => 
            stateRow.id === row.id || 
            (stateRow.name === row.name && stateRow.date === row.date)
          );
          
          if (stateRowIndex !== -1) {
            state.income[year][stateRowIndex].paidEgp = newValue;
          }
          
          // Update the display
          this.textContent = 'EGP ' + nfINT.format(Math.round(newValue));
          this.classList.remove('editing');
          
          // Save to cloud using direct save, with fallback to local save
          try {
            saveIncomeRowDirectly(row, currentYear);
          } catch (error) {
            console.warn('Cloud save failed, saving locally:', error);
            saveToLocal();
            showNotification('Saved locally (cloud sync failed)', 'warning', 2000);
          }
        };
        
        const cancelEdit = () => {
          this.textContent = originalContent;
          this.classList.remove('editing');
        };
        
        input.addEventListener('blur', saveEdit);
        input.addEventListener('keydown', function(e) {
          if (e.key === 'Enter') {
            e.preventDefault();
            saveEdit();
          } else if (e.key === 'Escape') {
            e.preventDefault();
            cancelEdit();
          }
        });
      });
      div.appendChild(methodDiv);
      div.appendChild(deleteDiv);
      
      wrap.appendChild(div);
    });
    
    // Update income sum
    const sumEl = document.getElementById('sum-income');
    if (sumEl) {
      const totalAllPayment = arr.reduce((sum, r) => sum + (Number(r.allPayment) || 0), 0);
      const totalPaidUsd = arr.reduce((sum, r) => sum + (Number(r.paidUsd) || 0), 0);
      const totalPaidEgp = totalPaidUsd * state.fx;
      
      let sumHTML = '';
      sumHTML += '<div></div>'; // drag handle
      sumHTML += '<div></div>'; // icon
      sumHTML += '<div style="font-weight: 600;">Total</div>'; // project name
      sumHTML += '<div></div>'; // tags
      sumHTML += '<div></div>'; // date
      sumHTML += `<div class="font-semibold">$${nfINT.format(totalAllPayment)}</div>`; // all payment
      sumHTML += `<div class="font-semibold">$${nfINT.format(totalPaidUsd)}</div>`; // paid usd
      sumHTML += `<div class="font-semibold">EGP ${nfINT.format(Math.round(totalPaidEgp))}</div>`; // paid egp
      sumHTML += '<div></div>'; // method
      sumHTML += '<div></div>'; // delete
      sumEl.innerHTML = sumHTML;
    }
    
    // Apply lock state to newly rendered income rows
    updateInputsLockState();
  }
  
  function updateIncomeRowCalculations(rowEl, row) {
    const paidEgp = row.paidEgp || (row.paidUsd || 0) * state.fx;
    
    const paidEgpCell = rowEl.querySelector('.paid-egp-cell');
    
    if (paidEgpCell) paidEgpCell.textContent = 'EGP ' + nfINT.format(Math.round(paidEgp));
  }

  function renderAll(){
      renderList('list-personal', state.personal, false);
      renderList('list-biz', state.biz, true);
      const currentYearData = state.income[currentYear] || [];
      renderIncomeList('list-income', currentYearData);
    renderKPIs();
    updateGridTemplate();
    
    // Apply lock state to all inputs after rendering
    updateInputsLockState();
    
    // Re-add event listeners after rendering
    addRowButtonListeners();
    
    // Ensure all inputs have instant cloud sync after rendering
    setTimeout(() => {
      ensureLiveSaveOnAllInputs();
      ensureInstantSyncOnToggles();
    }, 100);
    
    // Apply custom date picker to any new date inputs
    if (typeof applyDatePickerToNewInputs === 'function') {
      applyDatePickerToNewInputs();
    }
  }

  function updateGridTemplate() {
    // For Personal table (no Next column)
    const personalTemplate = `24px 32px 1.5fr .8fr .8fr .8fr ${columnOrder.map(() => '1fr').join(' ')} 32px`;
    document.querySelectorAll('.row:not(.row-biz):not(.row-income)').forEach(row => {
      row.style.gridTemplateColumns = personalTemplate;
    });
    
    // For Biz table (with Next column)
    const bizTemplate = `24px 32px 1.4fr .8fr .8fr .8fr .8fr ${columnOrder.map(() => '.9fr').join(' ')} 32px`;
    document.querySelectorAll('.row-biz').forEach(row => {
      row.style.gridTemplateColumns = bizTemplate;
    });
    
    // For Income table (responsive structure)
    let incomeTemplate;
    if (window.innerWidth <= 480) {
      incomeTemplate = `16px 20px 1fr 1.2fr 80px 70px 70px 80px 1fr 20px`;
    } else if (window.innerWidth <= 768) {
      incomeTemplate = `18px 24px 1fr 1.2fr 100px 85px 85px 100px 1fr 24px`;
    } else {
      incomeTemplate = `20px 28px 1fr 1.2fr 120px 100px 100px 120px 1fr 28px`;
    }
    
    document.querySelectorAll('.row-income').forEach(row => {
      row.style.gridTemplateColumns = incomeTemplate;
    });
  }

    // Settings modal
    $('#btnSettings').addEventListener('click', ()=>{ 
      $('#inputFx').value = state.fx; 
      $('#inputIncludeAnnual').value = state.includeAnnualInMonthly ? 'true' : 'false';
      $('#inputDeleteConfirm').value = '';
      $('#btnDeleteAll').disabled = true;
      $('#settings').showModal(); 
    });
    
    // Click outside to close modal
    $('#settings').addEventListener('click', (e) => {
      if (e.target === $('#settings')) {
        $('#settings').close();
      }
    });
    // Real-time exchange rate updates
    $('#inputFx').addEventListener('input', function() {
      state.fx = Number(this.value) || state.fx;
      save('fx-rate');
      // Update only EGP calculations without re-rendering inputs
      updateAllCalculationsWithoutRerender();
    });
    
    // Real-time Include Annual setting updates
    $('#inputIncludeAnnual').addEventListener('change', function() {
      state.includeAnnualInMonthly = this.value === 'true';
      updateAutosaveStatus();
      save('include-annual-setting');
      // Update only calculations without re-rendering inputs
      updateAllCalculationsWithoutRerender();
    });
    
    $('#btnSaveSettings').addEventListener('click', (e)=>{ 
      e.preventDefault(); 
      state.fx = Number($('#inputFx').value||state.fx); 
      state.includeAnnualInMonthly = $('#inputIncludeAnnual').value === 'true';
      updateAutosaveStatus();
      save(); 
      // Update only calculations without re-rendering inputs
      updateAllCalculationsWithoutRerender();
      $('#settings').close(); 
    });
    
    // Update only the calculated values in a specific row
    function updateRowCalculations(rowElement, row, isBiz) {
      const mUSD = rowMonthlyUSD(row);
      const yUSD = rowYearlyUSD(row);
      const mEGP = mUSD * state.fx;
      const yEGP = yUSD * state.fx;
      
      // Update the calculated columns in this row using new wrapper structure
      const financialWrappers = rowElement.querySelectorAll('.financial-input-wrapper');
      if (financialWrappers.length >= 4) {
        // Monthly USD - update value span
        const mUSDValue = financialWrappers[0].querySelector('.financial-value');
        if (mUSDValue) {
          mUSDValue.textContent = Math.round(mUSD).toLocaleString();
          financialWrappers[0].setAttribute('data-original', Math.round(mUSD));
        }
        
        // Yearly USD - update value span
        const yUSDValue = financialWrappers[1].querySelector('.financial-value');
        if (yUSDValue) {
          yUSDValue.textContent = Math.round(yUSD).toLocaleString();
          financialWrappers[1].setAttribute('data-original', Math.round(yUSD));
        }
        
        // Monthly EGP - update value span
        const mEGPValue = financialWrappers[2].querySelector('.financial-value');
        if (mEGPValue) {
          mEGPValue.textContent = Math.round(mEGP).toLocaleString();
          financialWrappers[2].setAttribute('data-original', Math.round(mEGP));
        }
        
        // Yearly EGP - update value span
        const yEGPValue = financialWrappers[3].querySelector('.financial-value');
        if (yEGPValue) {
          yEGPValue.textContent = Math.round(yEGP).toLocaleString();
          financialWrappers[3].setAttribute('data-original', Math.round(yEGP));
        }
      }
      
      // Update KPIs and analytics
      renderKPIs();
    }

    // Make a calculated value editable
    function makeEditable(element, row, isBiz, rowElement) {
      if (element.classList.contains('editing')) return;
      
      const field = element.getAttribute('data-field');
      const currentValue = element.getAttribute('data-original');
      const type = element.getAttribute('data-type');
      
      // Create input field that replaces the value span but keeps the symbol
      const input = document.createElement('input');
      input.type = 'number';
      input.step = '1';
      input.className = 'editable-input';
      input.value = Math.round(parseFloat(currentValue));
      
      // Find the value span and replace it with input
      const valueSpan = element.querySelector('.financial-value');
      if (valueSpan) {
        valueSpan.style.display = 'none';
        element.appendChild(input);
      } else {
        // Fallback for old structure
        element.innerHTML = '';
        element.appendChild(input);
      }
      
      element.classList.add('editing');
      
      // Focus and select
      input.focus();
      input.select();
      
      // Real-time updates as you type (like cost input) - without losing focus
      input.addEventListener('input', function() {
        const newValue = Math.round(parseFloat(this.value));
        if (!isNaN(newValue)) {
          updateCalculatedValueRealtime(element, row, field, newValue, type, isBiz, rowElement);
        }
      });
      
      // Handle save on blur or enter
      const saveValue = () => {
        const newValue = Math.round(parseFloat(input.value));
        if (!isNaN(newValue) && newValue !== Math.round(parseFloat(currentValue))) {
          updateCalculatedValue(element, row, field, newValue, type, isBiz, rowElement);
        }
        
        // Restore the value span and remove input
        const valueSpan = element.querySelector('.financial-value');
        if (valueSpan) {
          valueSpan.style.display = '';
          input.remove();
        }
        
        element.classList.remove('editing');
      };
      
      input.addEventListener('blur', saveValue);
      input.addEventListener('keydown', function(e) {
        if (e.key === 'Enter') {
          e.preventDefault();
          saveValue();
        } else if (e.key === 'Escape') {
          e.preventDefault();
          
          // Restore the value span and remove input
          const valueSpan = element.querySelector('.financial-value');
          if (valueSpan) {
            valueSpan.style.display = '';
            input.remove();
          }
          
          element.classList.remove('editing');
          updateRowCalculations(rowElement, row, isBiz);
        }
      });
    }

    // Update calculated value and recalculate others - real-time version that preserves focus
    function updateCalculatedValueRealtime(element, row, field, newValue, type, isBiz, rowElement) {
      let newBaseCost = row.cost;
      
      // Store the exact value the user typed for the field being edited
      if (field === 'monthlyUSD') {
        row.monthlyUSD = Math.max(0, newValue);
        const monthlyUSD = row.monthlyUSD;
        if (row.billing === 'Monthly') {
          newBaseCost = monthlyUSD;
        } else if (row.billing === 'Annually') {
          newBaseCost = monthlyUSD * 12;
        }
      } else if (field === 'yearlyUSD') {
        row.yearlyUSD = Math.max(0, newValue);
        const yearlyUSD = row.yearlyUSD;
        if (row.billing === 'Monthly') {
          newBaseCost = yearlyUSD / 12;
        } else if (row.billing === 'Annually') {
          newBaseCost = yearlyUSD;
        }
      } else if (field === 'monthlyEGP') {
        // Store the exact EGP value the user typed
        row.monthlyEGP = Math.max(0, newValue);
        const monthlyEGP = row.monthlyEGP;
        const monthlyUSD = monthlyEGP / state.fx;
        if (row.billing === 'Monthly') {
          newBaseCost = monthlyUSD;
        } else if (row.billing === 'Annually') {
          newBaseCost = monthlyUSD * 12;
        }
      } else if (field === 'yearlyEGP') {
        // Store the exact EGP value the user typed
        row.yearlyEGP = Math.max(0, newValue);
        const yearlyEGP = row.yearlyEGP;
        const yearlyUSD = yearlyEGP / state.fx;
        if (row.billing === 'Monthly') {
          newBaseCost = yearlyUSD / 12;
        } else if (row.billing === 'Annually') {
          newBaseCost = yearlyUSD;
        }
      }
      
      // Update the base cost
      row.cost = newBaseCost;
      
      // Update the cost input field to match the new base cost in real-time
      const costInput = rowElement.querySelector('.cost-input');
      if (costInput) {
        costInput.value = newBaseCost;
        // Trigger visual update to show the change
        costInput.style.backgroundColor = '#e8f5e8';
        setTimeout(() => {
          costInput.style.backgroundColor = '';
        }, 200);
      }
      
      // Calculate other values (but don't recalculate the field being edited)
      if (field !== 'monthlyUSD') {
        row.monthlyUSD = row.billing === 'Monthly' ? row.cost : row.cost / 12;
      }
      if (field !== 'yearlyUSD') {
        row.yearlyUSD = row.billing === 'Yearly' ? row.cost : row.cost * 12;
      }
      if (field !== 'monthlyEGP') {
        row.monthlyEGP = row.monthlyUSD * state.fx;
      }
      if (field !== 'yearlyEGP') {
        row.yearlyEGP = row.yearlyUSD * state.fx;
      }
      
      // Update ALL calculated values in real-time as you type
      const calculatedDivs = rowElement.querySelectorAll('.text-sm');
      if (calculatedDivs.length >= 4) {
        // Monthly USD - always update with current value
        const monthlyUSDValue = field === 'monthlyUSD' ? newValue : row.monthlyUSD;
        calculatedDivs[0].textContent = '$' + Math.round(monthlyUSDValue).toLocaleString();
        calculatedDivs[0].setAttribute('data-original', Math.round(monthlyUSDValue));
        // Visual feedback for real-time updates
        if (field !== 'monthlyUSD') {
          calculatedDivs[0].style.backgroundColor = '#e8f5e8';
          setTimeout(() => calculatedDivs[0].style.backgroundColor = '', 300);
        }
        
        // Yearly USD - always update with current value
        const yearlyUSDValue = field === 'yearlyUSD' ? newValue : row.yearlyUSD;
        calculatedDivs[1].textContent = '$' + Math.round(yearlyUSDValue).toLocaleString();
        calculatedDivs[1].setAttribute('data-original', Math.round(yearlyUSDValue));
        // Visual feedback for real-time updates
        if (field !== 'yearlyUSD') {
          calculatedDivs[1].style.backgroundColor = '#e8f5e8';
          setTimeout(() => calculatedDivs[1].style.backgroundColor = '', 300);
        }
        
        // Monthly EGP - always update with current value
        const monthlyEGPValue = field === 'monthlyEGP' ? newValue : row.monthlyEGP;
        calculatedDivs[2].textContent = 'EGP ' + Math.round(monthlyEGPValue).toLocaleString();
        calculatedDivs[2].setAttribute('data-original', Math.round(monthlyEGPValue));
        // Visual feedback for real-time updates
        if (field !== 'monthlyEGP') {
          calculatedDivs[2].style.backgroundColor = '#e8f5e8';
          setTimeout(() => calculatedDivs[2].style.backgroundColor = '', 300);
        }
        
        // Yearly EGP - always update with current value
        const yearlyEGPValue = field === 'yearlyEGP' ? newValue : row.yearlyEGP;
        calculatedDivs[3].textContent = 'EGP ' + Math.round(yearlyEGPValue).toLocaleString();
        calculatedDivs[3].setAttribute('data-original', Math.round(yearlyEGPValue));
        // Visual feedback for real-time updates
        if (field !== 'yearlyEGP') {
          calculatedDivs[3].style.backgroundColor = '#e8f5e8';
          setTimeout(() => calculatedDivs[3].style.backgroundColor = '', 300);
        }
      }
      
      // Save the updated state with instant cloud sync for financial inputs
      instantSaveExpenseRow(row, isBiz);
      
      // Clear cache and update KPIs only (no full re-render)
      clearCalculationCache();
      renderKPIs();
    }

    // Update calculated value and recalculate others - full version for final save
    function updateCalculatedValue(element, row, field, newValue, type, isBiz, rowElement) {
      let newBaseCost = row.cost;
      
      // Store the exact value the user typed for the field being edited
      if (field === 'monthlyUSD') {
        row.monthlyUSD = Math.max(0, newValue);
        const monthlyUSD = row.monthlyUSD;
        if (row.billing === 'Monthly') {
          newBaseCost = monthlyUSD;
        } else if (row.billing === 'Annually') {
          newBaseCost = monthlyUSD * 12;
        }
      } else if (field === 'yearlyUSD') {
        row.yearlyUSD = Math.max(0, newValue);
        const yearlyUSD = row.yearlyUSD;
        if (row.billing === 'Monthly') {
          newBaseCost = yearlyUSD / 12;
        } else if (row.billing === 'Annually') {
          newBaseCost = yearlyUSD;
        }
      } else if (field === 'monthlyEGP') {
        // Store the exact EGP value the user typed
        row.monthlyEGP = Math.max(0, newValue);
        const monthlyEGP = row.monthlyEGP;
        const monthlyUSD = monthlyEGP / state.fx;
        if (row.billing === 'Monthly') {
          newBaseCost = monthlyUSD;
        } else if (row.billing === 'Annually') {
          newBaseCost = monthlyUSD * 12;
        }
      } else if (field === 'yearlyEGP') {
        // Store the exact EGP value the user typed
        row.yearlyEGP = Math.max(0, newValue);
        const yearlyEGP = row.yearlyEGP;
        const yearlyUSD = yearlyEGP / state.fx;
        if (row.billing === 'Monthly') {
          newBaseCost = yearlyUSD / 12;
        } else if (row.billing === 'Annually') {
          newBaseCost = yearlyUSD;
        }
      }
      
      // Update the base cost
      row.cost = newBaseCost;
      
      // Update the cost input field to match the new base cost
      const costInput = rowElement.querySelector('.cost-input');
      if (costInput) {
        costInput.value = newBaseCost;
      }
      
      // Calculate other values (but don't recalculate the field being edited)
      if (field !== 'monthlyUSD') {
        row.monthlyUSD = row.billing === 'Monthly' ? row.cost : row.cost / 12;
      }
      if (field !== 'yearlyUSD') {
        row.yearlyUSD = row.billing === 'Yearly' ? row.cost : row.cost * 12;
      }
      if (field !== 'monthlyEGP') {
        row.monthlyEGP = row.monthlyUSD * state.fx;
      }
      if (field !== 'yearlyEGP') {
        row.yearlyEGP = row.yearlyUSD * state.fx;
      }
      
      // Save the updated state with instant cloud sync for financial inputs
      instantSaveExpenseRow(row, isBiz);
      
      // Re-render this row's calculations
      updateRowCalculations(rowElement, row, isBiz);
    }
    
    // Update autosave status indicator
    function updateAutosaveStatus() {
      const status = document.getElementById('autosaveStatus');
      if (status) {
        status.textContent = '● Live Save enabled';
        status.className = 'autosave-status enabled';
      }
    }

    // Enhanced function to ensure all inputs have instant cloud sync
    function ensureLiveSaveOnAllInputs() {
      console.log('Ensuring instant cloud sync on all inputs...');
      
      // Add live save to any input that might not have it
      const allInputs = document.querySelectorAll('input[type="text"], input[type="number"], input[type="date"]');
      allInputs.forEach(input => {
        // Skip if already has live save
        if (input.hasAttribute('data-live-save')) return;
        
        // Add live save based on input type and context
        const inputType = input.type;
        const className = input.className;
        let source = 'unknown-input';
        
        if (className.includes('cost-input')) {
          source = 'cost-input';
        } else if (className.includes('tag-input')) {
          source = 'tag-input';
        } else if (inputType === 'date') {
          source = 'date-input';
        } else if (inputType === 'number') {
          source = 'number-input';
        } else if (inputType === 'text') {
          source = 'text-input';
        }
        
        // Add event listener for instant cloud sync
        input.addEventListener('input', function() {
          console.log('Instant sync triggered from input:', source, this.value);
          
          // Update the corresponding data based on context
          const rowElement = input.closest('.row, .row-biz, .row-income');
          if (rowElement) {
            const rowIndex = Array.from(rowElement.parentNode.children).indexOf(rowElement) - 1; // -1 for header
            const isBiz = rowElement.classList.contains('row-biz');
            const isIncome = rowElement.classList.contains('row-income');
            
            if (isIncome) {
              // Handle income row updates
              const year = currentYear;
              if (state.income[year] && state.income[year][rowIndex]) {
                const row = state.income[year][rowIndex];
                if (className.includes('cost-input') || input.placeholder.includes('$')) {
                  row.paidUsd = Number(input.value) || 0;
                } else if (input.placeholder.includes('Total')) {
                  row.allPayment = Number(input.value) || 0;
                } else {
                  row.name = input.value;
                }
                instantSaveIncomeRow(row, year);
              }
            } else {
              // Handle expense row updates
              const arr = isBiz ? state.biz : state.personal;
              if (arr && arr[rowIndex]) {
                const row = arr[rowIndex];
                if (className.includes('cost-input')) {
                  row.cost = Number(input.value) || 0;
                } else {
                  row.name = input.value;
                }
                instantSaveExpenseRow(row, isBiz);
                updateRowCalculations(rowElement, row, isBiz);
                renderKPIs();
              }
            }
          } else {
            // General input (like FX rate) - use instant save
            instantSaveAll(source);
          }
        });
        
        // Mark as having live save
        input.setAttribute('data-live-save', 'true');
      });
      
      console.log('Instant cloud sync ensured on all inputs');
    }
    
    // Ensure all toggles (status, billing) have instant cloud sync
    function ensureInstantSyncOnToggles() {
      console.log('Ensuring instant cloud sync on all toggles...');
      
      // Find all status and billing toggles
      const statusToggles = document.querySelectorAll('[data-status-toggle]:not([data-instant-sync])');
      const billingToggles = document.querySelectorAll('[data-billing-toggle]:not([data-instant-sync])');
      
      statusToggles.forEach(toggle => {
        toggle.addEventListener('click', function() {
          console.log('Instant sync triggered from status toggle');
          const rowElement = this.closest('.row, .row-biz');
          if (rowElement) {
            const rowIndex = Array.from(rowElement.parentNode.children).indexOf(rowElement) - 1;
            const isBiz = rowElement.classList.contains('row-biz');
            const row = isBiz ? state.biz[rowIndex] : state.personal[rowIndex];
            if (row) {
              instantSaveExpenseRow(row, isBiz);
            }
          }
        });
        toggle.setAttribute('data-instant-sync', 'true');
      });
      
      billingToggles.forEach(toggle => {
        toggle.addEventListener('click', function() {
          console.log('Instant sync triggered from billing toggle');
          const rowElement = this.closest('.row, .row-biz');
          if (rowElement) {
            const rowIndex = Array.from(rowElement.parentNode.children).indexOf(rowElement) - 1;
            const isBiz = rowElement.classList.contains('row-biz');
            const row = isBiz ? state.biz[rowIndex] : state.personal[rowIndex];
            if (row) {
              instantSaveExpenseRow(row, isBiz);
            }
          }
        });
        toggle.setAttribute('data-instant-sync', 'true');
      });
      
      console.log(`Instant sync ensured on ${statusToggles.length} status toggles and ${billingToggles.length} billing toggles`);
    }
    
    // Performance optimization: Debounced rendering
    let renderTimeout = null;
    function debouncedRender() {
      if (renderTimeout) {
        clearTimeout(renderTimeout);
      }
      renderTimeout = setTimeout(() => {
        renderAll();
        renderTimeout = null;
      }, 50); // 50ms debounce for rendering
    }
    
    // Performance optimization: Cached calculations
    let calculationCache = new Map();
    function getCachedCalculation(key, calculationFn) {
      if (calculationCache.has(key)) {
        return calculationCache.get(key);
      }
      const result = calculationFn();
      calculationCache.set(key, result);
      return result;
    }
    
    // Clear cache when data changes
    function clearCalculationCache() {
      calculationCache.clear();
    }
    
    // Performance optimization: Batch DOM updates
    function batchDOMUpdates(updates) {
      // Use requestAnimationFrame for smooth updates
      requestAnimationFrame(() => {
        updates.forEach(update => update());
      });
    }
    
    function updateSettingsUI() {
      // Update FX rate display
      const fxDisplay = document.getElementById('fxDisplay');
      if (fxDisplay) {
        fxDisplay.textContent = state.fx.toFixed(4);
      }
      
      // Update autosave status
      updateAutosaveStatus();
      
      // Update theme if needed
      if (state.theme === 'light') {
        document.documentElement.setAttribute('data-theme', 'light');
      } else {
        document.documentElement.setAttribute('data-theme', 'dark');
      }
      
      // Update Include Annual in Monthly setting
      const includeAnnualSelect = document.getElementById('inputIncludeAnnual');
      if (includeAnnualSelect) {
        includeAnnualSelect.value = state.includeAnnualInMonthly ? 'true' : 'false';
        console.log('Updated Include Annual setting in UI:', state.includeAnnualInMonthly);
      }
      
      // Update calculations without re-rendering inputs
      updateAllCalculationsWithoutRerender();
    }
    
    function updateAllCalculationsWithoutRerender() {
      // Update all EGP values in existing rows without re-rendering
      const personalRows = document.querySelectorAll('#list-personal .row');
      personalRows.forEach((rowEl, idx) => {
        const rowData = state.personal[idx];
        if (rowData) {
          updateRowCalculations(rowEl, rowData, false);
        }
      });
      
      const bizRows = document.querySelectorAll('#list-biz .row');
      bizRows.forEach((rowEl, idx) => {
        const rowData = state.biz[idx];
        if (rowData) {
          updateRowCalculations(rowEl, rowData, true);
        }
      });
      
      // Update KPIs
      renderKPIs();
    }
    
    
    // Refresh FX rate button
    // Currency refresh function
    async function refreshCurrencyRate(showFeedback = true) {
      const btn = $('#btnRefreshFx');
      const originalContent = btn.innerHTML;
      
      if (showFeedback) {
      btn.innerHTML = '<svg class="w-3 h-3 animate-spin" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12a9 9 0 11-6.364-6.364"/></svg>';
      btn.disabled = true;
      }
      
      try {
        // Try to fetch live USD/EGP rate from a free API
        const response = await fetch('https://api.exchangerate-api.com/v4/latest/USD');
        const data = await response.json();
        const newRate = data.rates.EGP;
        if (newRate && newRate > 0) {
          $('#inputFx').value = newRate.toFixed(4);
          state.fx = newRate;
          
          if (showFeedback) {
          // Show success feedback
          btn.style.background = '#10b981';
          btn.style.borderColor = '#10b981';
          setTimeout(() => {
            btn.style.background = '';
            btn.style.borderColor = '';
          }, 2000);
          }
          
          // Save the new rate
          save();
          return true;
        } else {
          throw new Error('Invalid rate received');
        }
      } catch (error) {
        console.log('Failed to fetch live rate, using fallback');
        // Fallback to a reasonable rate if API fails
        $('#inputFx').value = '48.1843';
        state.fx = 48.1843;
        
        if (showFeedback) {
        btn.style.background = '#f59e0b';
        btn.style.borderColor = '#f59e0b';
        setTimeout(() => {
          btn.style.background = '';
          btn.style.borderColor = '';
        }, 2000);
        }
        
        save();
        return false;
      } finally {
        if (showFeedback) {
        btn.innerHTML = originalContent;
        btn.disabled = false;
      }
      }
    }
    
    // Refresh FX rate button
    $('#btnRefreshFx').addEventListener('click', () => refreshCurrencyRate(true));
    
    // Auto-refresh currency every 10 seconds
    setInterval(() => {
      refreshCurrencyRate(false);
    }, 10000);
    
    // Enhanced Export/Import functionality - moved inside DOMContentLoaded
    setTimeout(() => {
      const exportBtn = $('#btnExportData');
      const importBtn = $('#btnImportData');
      
      if (exportBtn) {
        exportBtn.addEventListener('click', ()=>{
          console.log('Export button clicked');
          showExportOptions();
        });
        console.log('Export button event listener added');
      } else {
        console.error('Export button not found!');
      }
      
      if (importBtn) {
        importBtn.addEventListener('click', ()=>{
          console.log('Import button clicked');
          showImportOptions();
        });
        console.log('Import button event listener added');
      } else {
        console.error('Import button not found!');
      }
    }, 100);
    
    function showExportOptions() {
      const modal = document.createElement('div');
      modal.className = 'modal-overlay';
      modal.innerHTML = `
        <div class="modal-content" style="max-width: 400px;">
          <h3 style="color: var(--fg); margin-bottom: 1rem;">Export Data</h3>
          <p style="color: var(--muted); margin-bottom: 1rem; font-size: 0.8rem;">Choose which data to export:</p>
          
          <div style="display: flex; flex-direction: column; gap: 0.5rem; margin-bottom: 1rem;">
            <label style="display: flex; align-items: center; gap: 0.5rem; cursor: pointer;">
              <input type="checkbox" id="exportPersonal" checked style="accent-color: var(--primary);">
              <span style="color: var(--fg); font-size: 0.8rem;">Personal Expenses</span>
            </label>
            <label style="display: flex; align-items: center; gap: 0.5rem; cursor: pointer;">
              <input type="checkbox" id="exportBiz" checked style="accent-color: var(--primary);">
              <span style="color: var(--fg); font-size: 0.8rem;">Business Expenses</span>
            </label>
            <label style="display: flex; align-items: center; gap: 0.5rem; cursor: pointer;">
              <input type="checkbox" id="exportIncome" checked style="accent-color: var(--primary);">
              <span style="color: var(--fg); font-size: 0.8rem;">Income Data (All Years)</span>
            </label>
            <label style="display: flex; align-items: center; gap: 0.5rem; cursor: pointer;">
              <input type="checkbox" id="exportSettings" checked style="accent-color: var(--primary);">
              <span style="color: var(--fg); font-size: 0.8rem;">Settings & Preferences</span>
            </label>
          </div>
          
          <div style="display: flex; gap: 0.5rem; justify-content: flex-end;">
            <button id="cancelExport" class="btn btn-ghost" style="padding: 0.5rem 1rem; font-size: 0.8rem;">Cancel</button>
            <button id="confirmExport" class="btn" style="padding: 0.5rem 1rem; font-size: 0.8rem;">Export</button>
          </div>
        </div>
      `;
      
      document.body.appendChild(modal);
      
      // Event listeners
      $('#cancelExport').addEventListener('click', () => {
        document.body.removeChild(modal);
      });
      
      // Close modal when clicking outside
      modal.addEventListener('click', (e) => {
        if (e.target === modal) {
          document.body.removeChild(modal);
        }
      });
      
      $('#confirmExport').addEventListener('click', () => {
        const exportData = {};
        
        if (document.getElementById('exportPersonal').checked) {
          exportData.personal = state.personal;
        }
        if (document.getElementById('exportBiz').checked) {
          exportData.biz = state.biz;
        }
        if (document.getElementById('exportIncome').checked) {
          exportData.income = state.income;
        }
        if (document.getElementById('exportSettings').checked) {
          exportData.fx = state.fx;
          exportData.theme = state.theme;
          exportData.autosave = state.autosave;
          exportData.includeAnnualInMonthly = state.includeAnnualInMonthly;
        }
        
        const dataStr = JSON.stringify(exportData, null, 2);
      const dataBlob = new Blob([dataStr], {type: 'application/json'});
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'financial-data.json';
      link.click();
      URL.revokeObjectURL(url);
        
        document.body.removeChild(modal);
        showNotification('Data exported successfully', 'success', 2000);
      });
    }
    
    function showImportOptions() {
      const modal = document.createElement('div');
      modal.className = 'modal-overlay';
      modal.innerHTML = `
        <div class="modal-content" style="max-width: 400px;">
          <h3 style="color: var(--fg); margin-bottom: 1rem;">Import Data</h3>
          <p style="color: var(--muted); margin-bottom: 1rem; font-size: 0.8rem;">Choose which data to import:</p>
          
          <div style="display: flex; flex-direction: column; gap: 0.5rem; margin-bottom: 1rem;">
            <label style="display: flex; align-items: center; gap: 0.5rem; cursor: pointer;">
              <input type="checkbox" id="importPersonal" style="accent-color: var(--primary);">
              <span style="color: var(--fg); font-size: 0.8rem;">Personal Expenses</span>
            </label>
            <label style="display: flex; align-items: center; gap: 0.5rem; cursor: pointer;">
              <input type="checkbox" id="importBiz" style="accent-color: var(--primary);">
              <span style="color: var(--fg); font-size: 0.8rem;">Business Expenses</span>
            </label>
            <label style="display: flex; align-items: center; gap: 0.5rem; cursor: pointer;">
              <input type="checkbox" id="importIncome" style="accent-color: var(--primary);">
              <span style="color: var(--fg); font-size: 0.8rem;">Income Data (All Years)</span>
            </label>
            <label style="display: flex; align-items: center; gap: 0.5rem; cursor: pointer;">
              <input type="checkbox" id="importSettings" style="accent-color: var(--primary);">
              <span style="color: var(--fg); font-size: 0.8rem;">Settings & Preferences</span>
            </label>
          </div>
          
          <div style="margin-bottom: 1rem;">
            <label style="display: flex; align-items: center; gap: 0.5rem; cursor: pointer;">
              <input type="checkbox" id="replaceExisting" style="accent-color: var(--primary);">
              <span style="color: var(--fg); font-size: 0.8rem;">Replace existing data (otherwise merge)</span>
            </label>
          </div>
          
          <div style="display: flex; gap: 0.5rem; justify-content: flex-end;">
            <button id="cancelImport" class="btn btn-ghost" style="padding: 0.5rem 1rem; font-size: 0.8rem;">Cancel</button>
            <button id="selectFile" class="btn" style="padding: 0.5rem 1rem; font-size: 0.8rem;">Select File</button>
          </div>
        </div>
      `;
      
      document.body.appendChild(modal);
      
      // Event listeners
      $('#cancelImport').addEventListener('click', () => {
        document.body.removeChild(modal);
      });
      
      // Close modal when clicking outside
      modal.addEventListener('click', (e) => {
        if (e.target === modal) {
          document.body.removeChild(modal);
        }
      });
      
      $('#selectFile').addEventListener('click', () => {
        const fileInput = document.createElement('input');
        fileInput.type = 'file';
        fileInput.accept = '.json';
        fileInput.style.display = 'none';
        
        fileInput.addEventListener('change', (e) => {
          const file = e.target.files[0];
          if (!file) return;
          
          const reader = new FileReader();
          reader.onload = (e) => {
            try {
              const importedData = JSON.parse(e.target.result);
              const replaceExisting = document.getElementById('replaceExisting').checked;
              
              // Import selected data
              if (document.getElementById('importPersonal').checked && importedData.personal) {
                if (replaceExisting) {
                  state.personal = importedData.personal;
                } else {
                  state.personal = [...state.personal, ...importedData.personal];
                }
                // Clear IDs for new data
                state.personal.forEach(item => delete item.id);
              }
              
              if (document.getElementById('importBiz').checked && importedData.biz) {
                if (replaceExisting) {
                  state.biz = importedData.biz;
                } else {
                  state.biz = [...state.biz, ...importedData.biz];
                }
                // Clear IDs for new data
                state.biz.forEach(item => delete item.id);
              }
              
              if (document.getElementById('importIncome').checked && importedData.income) {
                if (replaceExisting) {
                  state.income = importedData.income;
                } else {
                  // Merge income data by year
                  Object.keys(importedData.income).forEach(year => {
                    if (!state.income[year]) {
                      state.income[year] = [];
                    }
                    state.income[year] = [...state.income[year], ...importedData.income[year]];
                    // Clear IDs for new data to ensure they get saved as new records
                    state.income[year].forEach(item => {
                      delete item.id;
                    });
                  });
                }
                
                // Update available years to include imported years
                const importedYears = Object.keys(importedData.income).map(year => parseInt(year));
                const currentYears = Object.keys(state.income).map(year => parseInt(year));
                const allYears = [...new Set([...currentYears, ...importedYears])].sort((a, b) => a - b);
                
                
                // Update year tabs UI to show imported years
                createYearTabsFromData(state.income);
                
                // Save imported income rows to Supabase sequentially
                if (currentUser && supabaseReady) {
                  // Force all imported rows to be treated as new by clearing their IDs
                  const cleanedImportData = {};
                  Object.keys(importedData.income).forEach(year => {
                    cleanedImportData[year] = (state.income[year] || []).map(row => {
                      const cleanRow = { ...row };
                      delete cleanRow.id; // Ensure no ID exists
                      return cleanRow;
                    });
                  });
                  
                  saveImportedIncomeSequentially(cleanedImportData);
                } else {
                  showNotification('Imported data saved locally only - please sign in to sync to cloud', 'warning', 4000);
                }
              }
              
              if (document.getElementById('importSettings').checked) {
                if (importedData.fx) state.fx = importedData.fx;
                if (importedData.theme) state.theme = importedData.theme;
                if (importedData.autosave) state.autosave = importedData.autosave;
                if (importedData.includeAnnualInMonthly !== undefined) state.includeAnnualInMonthly = importedData.includeAnnualInMonthly;
              }
              
              save();
              renderAll();
              document.body.removeChild(modal);
              showNotification('Data imported successfully', 'success', 2000);
              
            } catch (error) {
              showNotification('Invalid file format', 'error', 3000);
            }
          };
          reader.readAsText(file);
        });
        
        document.body.appendChild(fileInput);
        fileInput.click();
        document.body.removeChild(fileInput);
      });
    }
    
    // Keep the old file input for backward compatibility
    $('#fileInput').addEventListener('change', (e)=>{
      const file = e.target.files[0];
      if (!file) return;
      
      const reader = new FileReader();
      reader.onload = (e)=>{
        try {
          const importedData = JSON.parse(e.target.result);
          if (confirm('This will replace all current data. Continue?')) {
            state = importedData;
            // Clear IDs for new data to be created in Firebase
            state.personal.forEach(item => delete item.id);
            state.biz.forEach(item => delete item.id);
            save();
            renderAll();
            showNotification('Data imported', 'success', 2000);
          }
        } catch (error) {
          showNotification('Invalid file format', 'error', 3000);
        }
      };
      reader.readAsText(file);
    });
    
    async function clearAllData() {
      // Reset state to default
      state = structuredClone(defaultState);
      
      if (currentUser && supabaseReady) {
        try {
          // Delete backup data from Supabase
          const { error } = await window.supabaseClient
            .from('backups')
            .delete()
            .eq('user_id', currentUser.id);
          
          if (error) throw error;
          
          showNotification('All cloud data deleted', 'success', 3000);
        } catch (error) {
          console.error('Error clearing Supabase data:', error);
          showNotification('Error clearing cloud data', 'error', 3000);
        }
      } else {
        // Clear all localStorage
        localStorage.clear();
        showNotification('All local data deleted', 'success', 3000);
      }
      
      // Re-render everything
      renderAll();
      
      // Close settings modal
      $('#settings').close();
    }
    
    // Delete all data functionality
    $('#inputDeleteConfirm').addEventListener('input', (e)=>{
      const btn = $('#btnDeleteAll');
      btn.disabled = e.target.value !== 'DELETE';
    });
    
    $('#btnDeleteAll').addEventListener('click', ()=>{
      if ($('#inputDeleteConfirm').value === 'DELETE') {
        if (confirm('Are you absolutely sure? This will permanently delete ALL data and cannot be undone!')) {
          clearAllData();
          showNotification('All data deleted', 'success', 3000);
        }
      }
    });



  // Add individual event listeners to add row buttons to prevent unwanted row addition during refresh
    function addRowButtonListeners() {
      // Remove existing event listeners first to prevent duplicates
      const buttons = document.querySelectorAll('[data-add-row]');
      buttons.forEach(btn => {
        // Clone and replace to remove all event listeners
        const newBtn = btn.cloneNode(true);
        btn.parentNode.replaceChild(newBtn, btn);
      });
      
      // Personal expenses add row button
      const personalAddBtn = document.querySelector('[data-add-row="personal"]');
      if (personalAddBtn) {
        personalAddBtn.addEventListener('click', (e) => {
          e.preventDefault();
          e.stopPropagation();
          console.log('Personal add row clicked');
          addRow('personal');
        });
      }
      
      // Business expenses add row button
      const bizAddBtn = document.querySelector('[data-add-row="biz"]');
      if (bizAddBtn) {
        bizAddBtn.addEventListener('click', (e) => {
          e.preventDefault();
          e.stopPropagation();
          console.log('Business add row clicked');
          addRow('biz');
        });
      }
      
      // Income add row button
      const incomeAddBtn = document.querySelector('[data-add-row="income"]');
      if (incomeAddBtn) {
        incomeAddBtn.addEventListener('click', (e) => {
          e.preventDefault();
          e.stopPropagation();
          console.log('Income add row clicked for year:', currentYear);
          addRow('income');
        });
      }
    }
    
    // Add event listeners when page loads
    addRowButtonListeners();

  // Global dropdown close handler
  document.addEventListener('click', function(e) {
    // Close all method dropdowns (income table)
    document.querySelectorAll('.method-dropdown-minimal.open').forEach(dropdown => {
      if (!dropdown.contains(e.target)) {
        dropdown.classList.remove('open');
        dropdown.querySelector('.method-menu-minimal').classList.remove('show');
      }
    });
  });

     // KPI Card Analytics - Click to expand
     document.addEventListener('click', (e) => {
       const kpiCard = e.target.closest('.kpi[data-analytics]');
       if (kpiCard && !e.target.closest('.analytics-close') && !e.target.closest('.analytics-content')) {
         // Close any other expanded cards
         document.querySelectorAll('.kpi.expanded').forEach(card => {
           if (card !== kpiCard) {
             card.classList.remove('expanded');
           }
         });
         
         // Toggle current card
         kpiCard.classList.toggle('expanded');
       }
     });

     // Close analytics when clicking close button
     document.addEventListener('click', (e) => {
       if (e.target.matches('[data-close-analytics]')) {
         const kpiCard = e.target.closest('.kpi');
         if (kpiCard) {
           kpiCard.classList.remove('expanded');
         }
       }
     });

     // Close analytics when clicking outside
     document.addEventListener('click', (e) => {
       if (!e.target.closest('.kpi') && !e.target.closest('.analytics-content')) {
         document.querySelectorAll('.kpi.expanded').forEach(card => {
           card.classList.remove('expanded');
         });
       }
     });

    // Note: renderAll() is now called after data loading in loadUserData() or loadLocalData()
    // Initial render will happen after authentication check completes

    // Note: Using built-in sticky headers with position: sticky on .row-head elements
    

    // Drag and Drop functionality for financial columns
    let draggedElement = null;
    let draggedColumn = null;
    
    function updateColumnOrder() {
      localStorage.setItem('columnOrder', JSON.stringify(columnOrder));
      applyColumnOrder();
    }
    
    function applyColumnOrder() {
      // Apply to both Personal and Biz tables
      ['', '-biz'].forEach(suffix => {
        const headerRow = document.querySelector(`.row-head${suffix}`);
        if (!headerRow) return;
        
        const financialColumns = headerRow.querySelectorAll('.financial-column');
        const newOrder = [...financialColumns].sort((a, b) => {
          const aIndex = columnOrder.indexOf(a.dataset.column);
          const bIndex = columnOrder.indexOf(b.dataset.column);
          return aIndex - bIndex;
        });
        
        // Reorder the columns in the header
        financialColumns.forEach(col => {
          const newCol = newOrder.find(c => c.dataset.column === col.dataset.column);
          if (newCol && newCol !== col) {
            col.parentNode.insertBefore(newCol, col.nextSibling);
          }
        });
      });
      
      // Update CSS grid template columns based on new order
      updateGridTemplate();
    }
    
    
    // Add drag event listeners
    document.addEventListener('dragstart', (e) => {
      if (e.target.classList.contains('draggable-header')) {
        draggedElement = e.target;
        draggedColumn = e.target.dataset.column;
        e.target.classList.add('dragging');
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/html', e.target.outerHTML);
      }
    });
    
    document.addEventListener('dragend', (e) => {
      if (e.target.classList.contains('draggable-header')) {
        e.target.classList.remove('dragging');
        draggedElement = null;
        draggedColumn = null;
        // Remove all drag-over classes
        document.querySelectorAll('.drop-zone').forEach(el => el.classList.remove('drag-over'));
      }
    });
    
    document.addEventListener('dragover', (e) => {
      e.preventDefault();
      if (e.target.classList.contains('financial-column') && e.target !== draggedElement) {
        e.target.classList.add('drag-over');
      }
    });
    
    document.addEventListener('dragleave', (e) => {
      if (e.target.classList.contains('financial-column')) {
        e.target.classList.remove('drag-over');
      }
    });
    
    document.addEventListener('drop', (e) => {
      e.preventDefault();
      if (e.target.classList.contains('financial-column') && e.target !== draggedElement) {
        e.target.classList.remove('drag-over');
        
        const targetColumn = e.target.dataset.column;
        const draggedIndex = columnOrder.indexOf(draggedColumn);
        const targetIndex = columnOrder.indexOf(targetColumn);
        
        if (draggedIndex !== -1 && targetIndex !== -1) {
          // Remove dragged column from its current position
          columnOrder.splice(draggedIndex, 1);
          // Insert it at the new position
          const newIndex = draggedIndex < targetIndex ? targetIndex - 1 : targetIndex;
          columnOrder.splice(newIndex, 0, draggedColumn);
          
          updateColumnOrder();
        }
      }
    });
    
    // Show loading skeletons for first 2 seconds
    const loadingSkeleton = document.getElementById('loading-skeleton');
    const loadingSkeletonBiz = document.getElementById('loading-skeleton-biz');
    
    if (loadingSkeleton) {
      loadingSkeleton.classList.remove('hidden');
    }
    if (loadingSkeletonBiz) {
      loadingSkeletonBiz.classList.remove('hidden');
    }
    
    // Hide skeletons after minimum loading time
    setTimeout(() => {
      if (loadingSkeleton) {
        loadingSkeleton.classList.add('hidden');
      }
      if (loadingSkeletonBiz) {
        loadingSkeletonBiz.classList.add('hidden');
      }
    }, 2000);
    
    // Initialize column order on page load (after renderAll)
    applyColumnOrder();

    // Row drag and drop functionality
    let draggedRow = null;
    let draggedRowIndex = null;
    let draggedRowArray = null;

    // Add row drag event listeners
    document.addEventListener('dragstart', (e) => {
      if (e.target.classList.contains('row-draggable') || e.target.closest('.row-draggable')) {
        const rowElement = e.target.classList.contains('row-draggable') ? e.target : e.target.closest('.row-draggable');
        draggedRow = rowElement;
        draggedRowIndex = parseInt(rowElement.getAttribute('data-row-index'));
        if (rowElement.closest('#list-personal')) {
          draggedRowArray = state.personal;
        } else if (rowElement.closest('#list-biz')) {
          draggedRowArray = state.biz;
        } else if (rowElement.closest('#list-income')) {
          draggedRowArray = state.income[currentYear] || [];
        }
        rowElement.classList.add('dragging');
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/plain', ''); // Prevent default drag behavior
        
        // Create a custom drag image (invisible)
        const dragImage = document.createElement('div');
        dragImage.style.position = 'absolute';
        dragImage.style.top = '-1000px';
        dragImage.style.left = '-1000px';
        dragImage.style.width = '1px';
        dragImage.style.height = '1px';
        dragImage.style.background = 'transparent';
        document.body.appendChild(dragImage);
        e.dataTransfer.setDragImage(dragImage, 0, 0);
        
        // Clean up the drag image after a short delay
        setTimeout(() => {
          if (document.body.contains(dragImage)) {
            document.body.removeChild(dragImage);
          }
        }, 0);
      }
    });

    document.addEventListener('dragend', (e) => {
      if (e.target.classList.contains('row-draggable') || e.target.closest('.row-draggable')) {
        const rowElement = e.target.classList.contains('row-draggable') ? e.target : e.target.closest('.row-draggable');
        rowElement.classList.remove('dragging');
        draggedRow = null;
        draggedRowIndex = null;
        draggedRowArray = null;
        // Remove all drag-over classes
        document.querySelectorAll('.row-drop-zone').forEach(el => el.classList.remove('drag-over'));
      }
    });

    document.addEventListener('dragover', (e) => {
      e.preventDefault();
      const dropZone = e.target.classList.contains('row-drop-zone') ? e.target : e.target.closest('.row-drop-zone');
      if (dropZone && dropZone !== draggedRow) {
        dropZone.classList.add('drag-over');
      }
    });

    document.addEventListener('dragleave', (e) => {
      const dropZone = e.target.classList.contains('row-drop-zone') ? e.target : e.target.closest('.row-drop-zone');
      if (dropZone) {
        dropZone.classList.remove('drag-over');
      }
    });

    document.addEventListener('drop', (e) => {
      e.preventDefault();
      const dropZone = e.target.classList.contains('row-drop-zone') ? e.target : e.target.closest('.row-drop-zone');
      if (dropZone && dropZone !== draggedRow) {
        dropZone.classList.remove('drag-over');
        
        const targetRowIndex = parseInt(dropZone.getAttribute('data-row-index'));
        let targetArray;
        if (dropZone.closest('#list-personal')) {
          targetArray = state.personal;
        } else if (dropZone.closest('#list-biz')) {
          targetArray = state.biz;
        } else if (dropZone.closest('#list-income')) {
          targetArray = state.income[currentYear] || [];
        }
        
        // Only allow drops within the same table
        if (draggedRowArray === targetArray && draggedRowIndex !== targetRowIndex) {
          // Remove the dragged item from its current position
          const draggedItem = draggedRowArray.splice(draggedRowIndex, 1)[0];
          
          // Adjust target index if we're moving down
          const adjustedTargetIndex = draggedRowIndex < targetRowIndex ? targetRowIndex - 1 : targetRowIndex;
          
          // Insert the item at the new position
          draggedRowArray.splice(adjustedTargetIndex, 0, draggedItem);
          
          // Save and re-render
          if (dropZone.closest('#list-income')) {
            // Use specific save for income table
            saveToLocal();
            renderAll();
            showNotification('Income row reordered', 'success', 1500);
          } else {
            // Use regular save for other tables
          save();
          renderAll();
          showNotification('Row reordered', 'success', 1500);
          }
        }
      }
    });

    // Tag system helper functions
    function createTagChip(tagText) {
      const chip = document.createElement('span');
      chip.className = 'tag-chip';
      
      // Create text span
      const textSpan = document.createElement('span');
      textSpan.textContent = tagText;
      textSpan.style.flex = '1';
      textSpan.style.whiteSpace = 'nowrap';
      
      // Create remove button
      const removeBtn = document.createElement('button');
      removeBtn.className = 'tag-chip-remove';
      removeBtn.innerHTML = '×';
      removeBtn.style.flexShrink = '0';
      removeBtn.style.marginLeft = '4px';
      
      // Add event listener for remove button
      removeBtn.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        // Remove the chip
        
        // Try multiple ways to find the wrapper
        let wrapper = chip.closest('.tag-input-wrapper');
        if (!wrapper) {
          // Try finding by parent elements
          wrapper = chip.parentElement?.closest('.tag-input-wrapper');
        }
        if (!wrapper) {
          // Try finding by looking up the DOM tree
          let parent = chip.parentElement;
          while (parent && !wrapper) {
            if (parent.classList?.contains('tag-input-wrapper')) {
              wrapper = parent;
              break;
            }
            parent = parent.parentElement;
          }
        }
        
        // If still no wrapper, try searching the entire document for tag-input-wrapper near this chip
        if (!wrapper) {
          const allWrappers = document.querySelectorAll('.tag-input-wrapper');
          
          // Find the wrapper that contains this chip
          for (let w of allWrappers) {
            if (w.contains(chip)) {
              wrapper = w;
              break;
            }
          }
        }
        
        if (wrapper) {
          const rowElement = wrapper.closest('.row-income');
          
          if (rowElement) {
            let rowData = rowElement.__rowData;
            
            // If no __rowData, try to find it by looking at the row structure
            if (!rowData) {
              // Try to find the row data by looking at the table structure
              const allRows = document.querySelectorAll('.row-income');
              const rowIndex = Array.from(allRows).indexOf(rowElement);
              
              if (rowIndex !== -1 && state.income[currentYear] && state.income[currentYear][rowIndex]) {
                rowData = state.income[currentYear][rowIndex];
              }
            }
            
            if (rowData) {
              // Remove the chip first
              chip.remove();
              // Then update the tags
              updateRowTags(wrapper, rowData);
            } else {
              // Still remove the chip even if we can't update
              chip.remove();
            }
          } else {
            chip.remove();
          }
        } else {
          chip.remove();
          
          // Fallback: try to update state manually by finding the row
          const allRows = document.querySelectorAll('.row-income');
          for (let i = 0; i < allRows.length; i++) {
            const row = allRows[i];
            if (row.contains(chip)) {
              if (state.income[currentYear] && state.income[currentYear][i]) {
                const rowData = state.income[currentYear][i];
                
                // Get all remaining tags from this row
                const remainingChips = row.querySelectorAll('.tag-chip');
                const remainingTags = Array.from(remainingChips).map(c => {
                  const textSpan = c.querySelector('span:first-child');
                  return textSpan ? textSpan.textContent.trim() : '';
                }).filter(tag => tag);
                
                rowData.tags = remainingTags.join(',');
                
                // Save directly
                saveIncomeRowDirectly(rowData, currentYear);
                break;
              }
            }
          }
        }
      });
      
      chip.appendChild(textSpan);
      chip.appendChild(removeBtn);
      
      return chip;
    }
    
    function handleTagInput(input, wrapper, row) {
      const value = input.value.trim();
      if (value.includes(',')) {
        const tags = value.split(',').map(tag => tag.trim()).filter(tag => tag);
        const currentTagCount = wrapper.querySelectorAll('.tag-chip').length;
        const maxTags = 5; // Maximum number of tags allowed
        
        tags.forEach(tag => {
          if (!isTagAlreadyAdded(wrapper, tag) && currentTagCount < maxTags) {
            const chip = createTagChip(tag);
            wrapper.insertBefore(chip, input);
            currentTagCount++;
          }
        });
        input.value = '';
        
        // Use stored row data or fallback to parameter
        const rowData = wrapper.__rowData || row;
        if (rowData) {
          updateRowTags(wrapper, rowData);
        }
        
        // Update placeholder if max tags reached
        if (wrapper.querySelectorAll('.tag-chip').length >= maxTags) {
          input.placeholder = '';
          input.disabled = true;
        }
      } else if (value.length > 0) {
        // Show suggestions as user types
        showTagSuggestions(input, wrapper);
      } else {
        // Hide suggestions when input is empty
        hideTagSuggestions(wrapper);
      }
    }
    
    function handleTagKeydown(e, input, wrapper, row) {
      if (e.key === 'Enter' || e.key === ',') {
        e.preventDefault();
        const value = input.value.trim();
        const currentTagCount = wrapper.querySelectorAll('.tag-chip').length;
        const maxTags = 5;
        
        if (value && !isTagAlreadyAdded(wrapper, value) && currentTagCount < maxTags) {
          const chip = createTagChip(value);
          wrapper.insertBefore(chip, input);
          input.value = '';
          
          // Use stored row data or fallback to parameter
          const rowData = wrapper.__rowData || row;
          if (rowData) {
            updateRowTags(wrapper, rowData);
          }
          
          // Update placeholder if max tags reached
          if (wrapper.querySelectorAll('.tag-chip').length >= maxTags) {
            input.placeholder = '';
            input.disabled = true;
          }
        }
      } else if (e.key === 'Backspace' && input.value === '') {
        const chips = wrapper.querySelectorAll('.tag-chip');
        if (chips.length > 0) {
          const lastChip = chips[chips.length - 1];
          lastChip.remove();
          
          // Use stored row data or fallback to parameter
          const rowData = wrapper.__rowData || row;
          if (rowData) {
            updateRowTags(wrapper, rowData);
          }
          
          // Re-enable input if under max tags
          if (wrapper.querySelectorAll('.tag-chip').length < 5) {
            input.placeholder = '';
            input.disabled = false;
          }
        }
      }
    }
    
    function isTagAlreadyAdded(wrapper, tag) {
      const chips = wrapper.querySelectorAll('.tag-chip');
      return Array.from(chips).some(chip => {
        const textSpan = chip.querySelector('span:first-child');
        return textSpan && textSpan.textContent.trim() === tag;
      });
    }
    
    function updateRowTags(wrapper, row) {
      const chips = wrapper.querySelectorAll('.tag-chip');
      const tags = Array.from(chips).map(chip => {
        const textSpan = chip.querySelector('span:first-child');
        return textSpan ? textSpan.textContent.trim() : '';
      }).filter(tag => tag);
      row.tags = tags.join(',');
      
      // Add expanded class if 3+ tags
      if (tags.length >= 3) {
        wrapper.classList.add('expanded');
      } else {
        wrapper.classList.remove('expanded');
      }
      
      // Update the row in the state as well
      if (wrapper.closest('.row-income')) {
        const year = currentYear;
        const stateRowIndex = (state.income[year] || []).findIndex(stateRow => 
          stateRow.id === row.id || 
          (stateRow.name === row.name && stateRow.date === row.date)
        );
        
        if (stateRowIndex !== -1) {
          // Update the state row with the new tags
          state.income[year][stateRowIndex].tags = row.tags;
        }
        
        // Use direct save for tag removal to ensure immediate sync
        saveIncomeRowDirectly(row, year);
        
        // Force a small delay then refresh the UI to ensure sync
        setTimeout(() => {
          renderAll();
        }, 500);
      } else {
        save();
      }
    }
    
    function showTagSuggestions(input, wrapper) {
      hideTagSuggestions(wrapper); // Remove existing dropdown
      
      const dropdown = document.createElement('div');
      dropdown.className = 'tag-dropdown';
      
      // Get all existing tags from all income rows
      const allTags = getAllExistingTags();
      
      const inputValue = input.value.toLowerCase().trim();
      
      // Filter and show suggestions
      const filteredTags = allTags.filter(tag => 
        tag.toLowerCase().includes(inputValue) && 
        !isTagAlreadyAdded(wrapper, tag)
      ).slice(0, 8); // Limit to 8 suggestions
      
      
      if (filteredTags.length === 0) {
        return;
      }
      
      filteredTags.forEach(tag => {
        const suggestion = document.createElement('div');
        suggestion.className = 'tag-suggestion';
        suggestion.innerHTML = `
          <span>${tag}</span>
          <span class="tag-suggestion-count">${getTagCount(tag)}</span>
        `;
        suggestion.addEventListener('click', () => {
          if (!isTagAlreadyAdded(wrapper, tag)) {
            const chip = createTagChip(tag);
            wrapper.insertBefore(chip, input);
            
            // Use stored row data or find from DOM
            let rowData = wrapper.__rowData;
            if (!rowData) {
              const rowElement = input.closest('.row-income');
              if (rowElement && rowElement.__rowData) {
                rowData = rowElement.__rowData;
              }
            }
            
            if (rowData) {
              updateRowTags(wrapper, rowData);
            }
            input.value = '';
          }
          hideTagSuggestions(wrapper);
        });
        dropdown.appendChild(suggestion);
      });
      
      // Position dropdown based on available space
      positionDropdown(input, dropdown);
      
      // Append dropdown to the wrapper (relative positioning)
      wrapper.appendChild(dropdown);
      
      // Show dropdown
      setTimeout(() => {
        dropdown.classList.add('show');
      }, 10);
    }
    
    function hideTagSuggestions(wrapper) {
      const dropdown = wrapper.querySelector('.tag-dropdown');
      if (dropdown) {
        dropdown.remove();
      }
    }
    
    function getAllExistingTags() {
      const allTags = [];
      
      // Get tags from all income years
      Object.values(state.income).forEach(yearData => {
        yearData.forEach(row => {
          if (row.tags) {
            const tags = row.tags.split(',').map(tag => tag.trim()).filter(tag => tag);
            allTags.push(...tags);
          }
        });
      });
      
      // Get tags from personal expenses
      if (state.personal) {
        state.personal.forEach(row => {
          if (row.tags) {
            const tags = row.tags.split(',').map(tag => tag.trim()).filter(tag => tag);
            allTags.push(...tags);
          }
        });
      }
      
      // Get tags from business expenses
      if (state.biz) {
        state.biz.forEach(row => {
          if (row.tags) {
            const tags = row.tags.split(',').map(tag => tag.trim()).filter(tag => tag);
            allTags.push(...tags);
          }
        });
      }
      
      // Count occurrences and return unique tags sorted by frequency
      const tagCounts = {};
      allTags.forEach(tag => {
        tagCounts[tag] = (tagCounts[tag] || 0) + 1;
      });
      
      return Object.keys(tagCounts).sort((a, b) => tagCounts[b] - tagCounts[a]);
    }
    
    function getTagCount(tag) {
      let count = 0;
      
      // Count from income
      Object.values(state.income).forEach(yearData => {
        yearData.forEach(row => {
          if (row.tags) {
            const tags = row.tags.split(',').map(t => t.trim());
            if (tags.includes(tag)) count++;
          }
        });
      });
      
      // Count from personal expenses
      if (state.personal) {
        state.personal.forEach(row => {
          if (row.tags) {
            const tags = row.tags.split(',').map(t => t.trim());
            if (tags.includes(tag)) count++;
          }
        });
      }
      
      // Count from business expenses
      if (state.biz) {
        state.biz.forEach(row => {
          if (row.tags) {
            const tags = row.tags.split(',').map(t => t.trim());
            if (tags.includes(tag)) count++;
          }
        });
      }
      
      return count;
    }

    // tiny tests
    (function(){
      function eq(a,b,msg){ if(Math.abs(a-b)>1e-6) console.error('TEST FAIL',msg,a,b); else console.log('TEST OK',msg); }
      const sample=[{cost:120,billing:'Monthly',status:'Active'},{cost:1200,billing:'Annually',status:'Active'}];
      eq(rowMonthlyUSD(sample[0]),120,'mUSD monthly');
      eq(rowMonthlyUSD(sample[1]),100,'mUSD annual');
      eq(rowYearlyUSD(sample[0]),1440,'yUSD monthly');
      eq(rowYearlyUSD(sample[1]),1200,'yUSD annual');
    })();
  });

  // Custom Date Picker functionality
  let customDatePicker = null;
  let currentDatePickerInput = null;
  let currentDatePickerDate = new Date();
  let isDatePickerOpen = false;
  let datePickerTimeout = null;

  function initCustomDatePicker() {
    console.log('Initializing custom date picker...');
    customDatePicker = document.getElementById('customDatePicker');
    const monthSelect = document.getElementById('monthSelect');
    const yearSelect = document.getElementById('yearSelect');
    const prevMonthBtn = document.getElementById('prevMonth');
    const nextMonthBtn = document.getElementById('nextMonth');
    const clearDateBtn = document.getElementById('clearDate');
    const todayDateBtn = document.getElementById('todayDate');
    const datePickerDays = document.getElementById('datePickerDays');
    
    // Debug: Check if elements exist
    console.log('Elements found:', {
      customDatePicker: !!customDatePicker,
      monthSelect: !!monthSelect,
      yearSelect: !!yearSelect,
      prevMonthBtn: !!prevMonthBtn,
      nextMonthBtn: !!nextMonthBtn,
      clearDateBtn: !!clearDateBtn,
      todayDateBtn: !!todayDateBtn,
      datePickerDays: !!datePickerDays
    });
    
    if (!customDatePicker) {
      console.error('Custom date picker element not found!');
      return;
    }
    if (!monthSelect || !yearSelect) {
      console.error('Month or year select elements not found!');
      return;
    }
    
    console.log('Custom date picker initialized successfully');

    // Populate month select
    const months = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    
    months.forEach((month, index) => {
      const option = document.createElement('option');
      option.value = index;
      option.textContent = month;
      monthSelect.appendChild(option);
    });

    // Populate year select (current year ± 10)
    const currentYear = new Date().getFullYear();
    for (let year = currentYear - 10; year <= currentYear + 10; year++) {
      const option = document.createElement('option');
      option.value = year;
      option.textContent = year;
      yearSelect.appendChild(option);
    }

    // Event listeners
    monthSelect.addEventListener('change', () => {
      currentDatePickerDate.setMonth(parseInt(monthSelect.value));
      renderDatePickerDays();
    });

    yearSelect.addEventListener('change', () => {
      currentDatePickerDate.setFullYear(parseInt(yearSelect.value));
      renderDatePickerDays();
    });

    prevMonthBtn.addEventListener('click', () => {
      currentDatePickerDate.setMonth(currentDatePickerDate.getMonth() - 1);
      updateDatePickerHeader();
      renderDatePickerDays();
    });

    nextMonthBtn.addEventListener('click', () => {
      currentDatePickerDate.setMonth(currentDatePickerDate.getMonth() + 1);
      updateDatePickerHeader();
      renderDatePickerDays();
    });

    clearDateBtn.addEventListener('click', () => {
      if (currentDatePickerInput) {
        currentDatePickerInput.value = '';
        currentDatePickerInput.dispatchEvent(new Event('change'));
      }
      hideCustomDatePicker();
    });

    todayDateBtn.addEventListener('click', () => {
      const today = new Date();
      selectDate(today);
    });

    // Close on backdrop click - not needed for dropdown
    // customDatePicker.addEventListener('click', (e) => {
    //   if (e.target === customDatePicker) {
    //     hideCustomDatePicker();
    //   }
    // });

    // Close date picker when clicking outside
    document.addEventListener('click', (e) => {
      if (customDatePicker.classList.contains('show') && 
          !e.target.closest('.custom-date-picker-modal') && 
          e.target.type !== 'date') {
        hideCustomDatePicker();
      }
    });
  }

  function showCustomDatePicker(inputElement) {
    console.log('showCustomDatePicker called with:', inputElement);
    
    // Prevent rapid opening/closing
    if (isDatePickerOpen) {
      console.log('Date picker already open, ignoring');
      return;
    }
    
    if (!customDatePicker) {
      console.error('Custom date picker not initialized!');
      return;
    }
    
    // Clear any existing timeout
    if (datePickerTimeout) {
      clearTimeout(datePickerTimeout);
    }
    
    // Add small delay to prevent rapid clicks
    datePickerTimeout = setTimeout(() => {
    currentDatePickerInput = inputElement;
    const currentValue = inputElement.value;
    
    if (currentValue) {
      const date = new Date(currentValue);
      if (!isNaN(date.getTime())) {
        currentDatePickerDate = date;
      }
    } else {
      currentDatePickerDate = new Date();
    }

    updateDatePickerHeader();
    renderDatePickerDays();
      
      // Simple positioning - just show it
      const datePickerModal = customDatePicker;
      
      // Reset all styles
      datePickerModal.style.position = 'fixed';
      datePickerModal.style.top = '50%';
      datePickerModal.style.left = '50%';
      datePickerModal.style.transform = 'translate(-50%, -50%)';
      datePickerModal.style.zIndex = '999999';
      datePickerModal.style.width = '240px';
      datePickerModal.style.display = 'block';
      
      // Make sure it's in the body
      if (datePickerModal.parentNode !== document.body) {
        document.body.appendChild(datePickerModal);
      }
      
      datePickerModal.classList.add('show');
      isDatePickerOpen = true;
      console.log('Date picker should now be visible in center of screen');
      
      // Prevent body scroll when date picker is open
      document.body.style.overflow = 'hidden';
      
      // Add click handler to close when clicking backdrop
      const backdropClickHandler = (e) => {
        if (e.target === datePickerModal || e.target.classList.contains('custom-date-picker-modal')) {
          hideCustomDatePicker();
          datePickerModal.removeEventListener('click', backdropClickHandler);
        }
      };
      
      // Remove any existing handler first
      datePickerModal.removeEventListener('click', backdropClickHandler);
      datePickerModal.addEventListener('click', backdropClickHandler);
    }, 100); // 100ms delay
  }

  function hideCustomDatePicker() {
    if (!isDatePickerOpen) {
      return; // Already closed
    }
    
    customDatePicker.classList.remove('show');
    customDatePicker.style.display = 'none';
    currentDatePickerInput = null;
    isDatePickerOpen = false;
    
    // Restore body scroll
    document.body.style.overflow = '';
    
    // Clear any pending timeout
    if (datePickerTimeout) {
      clearTimeout(datePickerTimeout);
      datePickerTimeout = null;
    }
  }

  function updateDatePickerHeader() {
    const monthSelect = document.getElementById('monthSelect');
    const yearSelect = document.getElementById('yearSelect');
    
    monthSelect.value = currentDatePickerDate.getMonth();
    yearSelect.value = currentDatePickerDate.getFullYear();
  }

  function renderDatePickerDays() {
    const datePickerDays = document.getElementById('datePickerDays');
    datePickerDays.innerHTML = '';

    const year = currentDatePickerDate.getFullYear();
    const month = currentDatePickerDate.getMonth();
    const today = new Date();
    
    // Get first day of month and number of days
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      const prevMonthDay = new Date(year, month, -startingDayOfWeek + i + 1);
      const dayElement = createDayElement(prevMonthDay.getDate(), true, false);
      datePickerDays.appendChild(dayElement);
    }

    // Add days of the current month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const isToday = date.toDateString() === today.toDateString();
      const isSelected = currentDatePickerInput && 
        currentDatePickerInput.value === formatDateForInput(date);
      
      const dayElement = createDayElement(day, false, isToday, isSelected);
      datePickerDays.appendChild(dayElement);
    }

    // Add empty cells for days after the last day of the month
    const remainingCells = 42 - (startingDayOfWeek + daysInMonth);
    for (let i = 1; i <= remainingCells; i++) {
      const nextMonthDay = new Date(year, month + 1, i);
      const dayElement = createDayElement(nextMonthDay.getDate(), true, false);
      datePickerDays.appendChild(dayElement);
    }
  }

  function createDayElement(day, isOtherMonth, isToday = false, isSelected = false) {
    const dayElement = document.createElement('div');
    dayElement.className = 'date-day';
    dayElement.textContent = day;
    
    if (isOtherMonth) {
      dayElement.classList.add('other-month');
    }
    if (isToday) {
      dayElement.classList.add('today');
    }
    if (isSelected) {
      dayElement.classList.add('selected');
    }

    if (!isOtherMonth) {
      dayElement.addEventListener('click', () => {
        const year = currentDatePickerDate.getFullYear();
        const month = currentDatePickerDate.getMonth();
        const selectedDate = new Date(year, month, day);
        selectDate(selectedDate);
      });
    }

    return dayElement;
  }

  function selectDate(date) {
    console.log('selectDate called with:', date);
    
    if (currentDatePickerInput) {
      // Get the actual date in YYYY-MM-DD format
      const actualDate = formatDateForInput(date);
      
      console.log('Setting date:', {
        input: currentDatePickerInput,
        actualDate: actualDate,
        originalDate: date
      });
      
      // Set the actual date value (this is what the form will use)
      currentDatePickerInput.value = actualDate;
      
      // Trigger change event to notify other parts of the app
      currentDatePickerInput.dispatchEvent(new Event('change', { bubbles: true }));
      
      // Also trigger input event for real-time updates
      currentDatePickerInput.dispatchEvent(new Event('input', { bubbles: true }));
      
      console.log('Date set successfully:', currentDatePickerInput.value);
    }
    hideCustomDatePicker();
  }

  function formatDateForInput(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
  

  // Override default date input behavior
  function overrideDateInputs() {
    // Prevent default date input behavior more aggressively
    document.addEventListener('click', (e) => {
      if (e.target.type === 'date') {
        e.preventDefault();
        e.stopPropagation();
        showCustomDatePicker(e.target);
        return false;
      }
    }, true);

    // Handle focus events
    document.addEventListener('focus', (e) => {
      if (e.target.type === 'date') {
        e.preventDefault();
        e.stopPropagation();
        showCustomDatePicker(e.target);
        return false;
      }
    }, true);

    // Handle mousedown events
    document.addEventListener('mousedown', (e) => {
      if (e.target.type === 'date') {
        e.preventDefault();
        e.stopPropagation();
        showCustomDatePicker(e.target);
        return false;
      }
    }, true);

    // Handle touch events for mobile
    document.addEventListener('touchstart', (e) => {
      if (e.target.type === 'date') {
        e.preventDefault();
        e.stopPropagation();
        showCustomDatePicker(e.target);
        return false;
      }
    }, true);

    // Disable native date picker on all date inputs
    document.addEventListener('DOMContentLoaded', () => {
      const dateInputs = document.querySelectorAll('input[type="date"]');
      dateInputs.forEach(input => {
        input.addEventListener('focus', (e) => {
          e.preventDefault();
          e.stopPropagation();
          showCustomDatePicker(input);
          return false;
        });
        
        input.addEventListener('click', (e) => {
          e.preventDefault();
          e.stopPropagation();
          showCustomDatePicker(input);
          return false;
        });
        
        // Prevent native picker but keep icon visible
        input.style.cursor = 'pointer';
        input.addEventListener('focus', (e) => {
          e.preventDefault();
          e.stopPropagation();
          showCustomDatePicker(input);
          return false;
        });
      });
    });
  }

  // Function to apply date picker overrides to new inputs
  function applyDatePickerToNewInputs() {
    const dateInputs = document.querySelectorAll('input[type="date"]:not([data-custom-picker-applied])');
    dateInputs.forEach(input => {
      input.setAttribute('data-custom-picker-applied', 'true');
      input.style.cursor = 'pointer';
      
      // Set placeholder text instead of clearing value
      input.placeholder = 'Select date';
      
      // Prevent all default behaviors with debouncing
      const debouncedShow = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (!isDatePickerOpen) {
        showCustomDatePicker(input);
        }
        return false;
      };
      
      input.addEventListener('focus', debouncedShow);
      input.addEventListener('click', debouncedShow);
      input.addEventListener('mousedown', debouncedShow);
      input.addEventListener('keydown', debouncedShow);
      
      // Also add click handler to the parent container
      const container = input.closest('.date-input-wrapper') || input.parentElement;
      if (container) {
        container.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        showCustomDatePicker(input);
        return false;
      });
      }
    });
  }

  // Function to position dropdown based on available space and row position
  function positionDropdown(trigger, menu) {
    const triggerRect = trigger.getBoundingClientRect();
    const menuHeight = 200; // Approximate menu height
    const viewportHeight = window.innerHeight;
    const spaceBelow = viewportHeight - triggerRect.bottom;
    const spaceAbove = triggerRect.top;
    
    // Check if this is in the last two rows of any table
    const isLastTwoRows = isInLastTwoRows(trigger);
    
    // Reset any previous positioning
    menu.style.top = '';
    menu.style.bottom = '';
    menu.style.transform = '';
    
    // Always position above for last two rows, or if there's not enough space below
    if (isLastTwoRows || (spaceBelow < menuHeight && spaceAbove > spaceBelow)) {
      // Position above the trigger
      menu.style.bottom = '100%';
      menu.style.top = 'auto';
      menu.style.transform = 'translateY(-4px)';
    } else {
      // Position below the trigger (default)
      menu.style.top = '100%';
      menu.style.bottom = 'auto';
      menu.style.transform = 'translateY(4px)';
    }
  }
  
  // Function to check if trigger is in the last two rows of any table
  function isInLastTwoRows(trigger) {
    // Find the table container
    const table = trigger.closest('.table');
    if (!table) return false;
    
    // Get all data rows (excluding header and sum rows)
    const dataRows = Array.from(table.querySelectorAll('.row:not(.row-head):not(.row-sum)'));
    if (dataRows.length < 2) return false;
    
    // Find the current row
    const currentRow = trigger.closest('.row:not(.row-head):not(.row-sum)');
    if (!currentRow) return false;
    
    // Get the index of current row
    const currentIndex = dataRows.indexOf(currentRow);
    
    // Check if it's in the last two rows
    return currentIndex >= dataRows.length - 2;
  }

  // Function to check if paid_egp field exists in database
  async function checkDatabaseSchema() {
    if (!currentUser || !supabaseReady) return false;
    
    try {
      // Try to select paid_egp field to see if it exists
      const { data, error } = await window.supabaseClient
        .from('income')
        .select('paid_egp')
        .limit(1);
      
      if (error && error.code === 'PGRST116') {
        console.warn('paid_egp field does not exist in database schema');
        return false;
      }
      
      console.log('paid_egp field exists in database');
      return true;
    } catch (error) {
      console.error('Error checking database schema:', error);
      return false;
    }
  }

  // Initialize custom date picker when DOM is loaded
  document.addEventListener('DOMContentLoaded', () => {
    initCustomDatePicker();
    overrideDateInputs();
    applyDatePickerToNewInputs();
    
    // Fix mobile logo display
    fixMobileLogo();
    
    // Initialize lock state
    updateLockIcon();
    updateInputsLockState();
    
    // Check database schema on load
    if (currentUser && supabaseReady) {
      checkDatabaseSchema();
    }
  });
  
  // Fix mobile logo display
  function fixMobileLogo() {
    const logoImg = document.querySelector('header img');
    const mobileLogo = document.querySelector('.mobile-logo');
    
    if (logoImg && mobileLogo) {
      // Check if image loads successfully
      logoImg.addEventListener('load', () => {
        mobileLogo.style.display = 'none';
      });
      
      logoImg.addEventListener('error', () => {
        mobileLogo.style.display = 'block';
        logoImg.style.display = 'none';
      });
      
      // For mobile devices, show text logo by default
      if (window.innerWidth <= 768) {
        mobileLogo.style.display = 'block';
        logoImg.style.display = 'none';
      }
    }
  }
  
  // Test function to manually open date picker
  window.testDatePicker = function() {
    console.log('Testing date picker...');
    console.log('customDatePicker element:', customDatePicker);
    
    if (!customDatePicker) {
      console.error('Date picker not initialized!');
      return;
    }
    
    // Just show it directly
    customDatePicker.style.display = 'block';
    customDatePicker.classList.add('show');
    console.log('Date picker should be visible now');
  };
  
  // Test function to manually set a date
  window.testDateSelection = function() {
    const testInput = document.querySelector('input[type="date"]');
    if (testInput) {
      const testDate = new Date(2025, 0, 15); // January 15, 2025
      console.log('Testing date selection with:', testDate);
      selectDate(testDate);
    } else {
      console.log('No date input found for testing');
    }
  };
  
  // Also add a simple click handler to any date input
  window.addEventListener('load', function() {
    setTimeout(() => {
      const dateInputs = document.querySelectorAll('input[type="date"]');
      console.log('Found date inputs:', dateInputs.length);
      
      dateInputs.forEach((input, index) => {
        input.addEventListener('click', function(e) {
          console.log('Date input clicked:', index);
          e.preventDefault();
          showCustomDatePicker(input);
        });
      });
    }, 1000);
  });

  // Re-apply date picker overrides when new content is added
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.type === 'childList') {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === 1) { // Element node
            if (node.tagName === 'INPUT' && node.type === 'date') {
              applyDatePickerToNewInputs();
            } else if (node.querySelectorAll) {
              const dateInputs = node.querySelectorAll('input[type="date"]');
              if (dateInputs.length > 0) {
                applyDatePickerToNewInputs();
              }
            }
          }
        });
      }
    });
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true
  });


