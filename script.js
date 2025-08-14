
// Calendar data and constants
const calendars = {
  igbo: ["Eke", "Orie", "Afor", "Nkwo"],
  yoruba: ["Ọjọ́ Ifá", "Ọjọ́ Ọ̀rìṣà", "Ọjọ́ Ọ̀ṣun", "Ọjọ́ Ẹ̀bọra"]
};

const msPerDay = 24 * 60 * 60 * 1000;

// Known reference: 12 Aug 2025
const referenceMap = {
  igbo: { date: "2025-08-12", dayIndex: 1 }, // Orie
  yoruba: { date: "2025-08-12", dayIndex: 1 } // Ọjọ́ Ọ̀rìṣà
};

// DOM elements
let elements = {};

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
  initializeElements();
  addEventListeners();
});

function initializeElements() {
  elements = {
    calendarType: document.getElementById('calendarType'),
    referenceDay: document.getElementById('referenceDay'),
    referenceDate: document.getElementById('referenceDate'),
    targetDate: document.getElementById('targetDate'),
    findBtn: document.getElementById('findBtn'),
    result: document.getElementById('result'),
    resultDay: document.querySelector('.result-day')
  };
}

function addEventListeners() {
  // Add smooth animations when showing/hiding elements
  elements.result.addEventListener('animationend', function(e) {
    if (e.animationName === 'fadeInUp') {
      this.style.animation = '';
    }
  });
}

// Utility functions
function parseDateAsUTC(dateString) {
  if (!dateString) return null;
  const [year, month, day] = dateString.split('-').map(Number);
  return new Date(Date.UTC(year, month - 1, day));
}

function safeModulo(n, m) {
  return ((n % m) + m) % m;
}

function formatDateToYYYYMMDD(date) {
  return date.toISOString().split('T')[0];
}

function showNotification(message, type = 'info') {
  // Create a simple notification system
  const notification = document.createElement('div');
  notification.className = `notification notification-${type}`;
  notification.textContent = message;
  
  // Add notification styles
  Object.assign(notification.style, {
    position: 'fixed',
    top: '20px',
    right: '20px',
    padding: '16px 24px',
    borderRadius: '12px',
    backgroundColor: type === 'error' ? '#ff6b6b' : '#667eea',
    color: 'white',
    fontWeight: '600',
    boxShadow: '0 8px 25px rgba(0, 0, 0, 0.15)',
    zIndex: '1000',
    animation: 'slideInRight 0.3s ease',
    maxWidth: '300px'
  });
  
  document.body.appendChild(notification);
  
  // Remove notification after 3 seconds
  setTimeout(() => {
    notification.style.animation = 'slideOutRight 0.3s ease';
    setTimeout(() => {
      document.body.removeChild(notification);
    }, 300);
  }, 3000);
}

// Add CSS for notification animations
const notificationStyles = document.createElement('style');
notificationStyles.textContent = `
  @keyframes slideInRight {
    from {
      opacity: 0;
      transform: translateX(100%);
    }
    to {
      opacity: 1;
      transform: translateX(0);
    }
  }
  
  @keyframes slideOutRight {
    from {
      opacity: 1;
      transform: translateX(0);
    }
    to {
      opacity: 0;
      transform: translateX(100%);
    }
  }
`;
document.head.appendChild(notificationStyles);

// Main functions
function updateDays() {
  const type = elements.calendarType.value;
  
  // Reset form state
  elements.referenceDay.innerHTML = "";
  
  if (!type) {
    disableElements();
    return;
  }

  // Add loading animation
  elements.calendarType.style.transform = 'scale(0.98)';
  setTimeout(() => {
    elements.calendarType.style.transform = 'scale(1)';
  }, 150);

  // Populate days for selected calendar
  elements.referenceDay.innerHTML = calendars[type]
    .map((day, i) => `<option value="${i}">${day}</option>`)
    .join('');

  // Set today's date as default for both inputs
  const today = new Date();
  const todayStr = formatDateToYYYYMMDD(today);
  elements.referenceDate.value = todayStr;
  elements.targetDate.value = todayStr;

  // Determine today's ancestral day using known reference mapping
  const baseRef = referenceMap[type];
  const baseRefDate = parseDateAsUTC(baseRef.date);
  const todayUTC = parseDateAsUTC(todayStr);
  const diffDays = Math.round((todayUTC - baseRefDate) / msPerDay);
  const offset = safeModulo(diffDays, 4);
  const todayDayIndex = (baseRef.dayIndex + offset) % 4;

  // Auto-select correct ancestral day
  elements.referenceDay.value = todayDayIndex;

  // Enable inputs with animation
  enableElements();
  
  showNotification(`${type.charAt(0).toUpperCase() + type.slice(1)} calendar selected!`);
}

function disableElements() {
  elements.referenceDay.disabled = true;
  elements.referenceDate.disabled = true;
  elements.targetDate.disabled = true;
  elements.findBtn.disabled = true;
}

function enableElements() {
  elements.referenceDay.disabled = false;
  elements.referenceDate.disabled = false;
  elements.targetDate.disabled = false;
  elements.findBtn.disabled = false;
  
  // Add subtle animation to enabled elements
  [elements.referenceDay, elements.referenceDate, elements.targetDate].forEach((el, index) => {
    setTimeout(() => {
      el.style.animation = 'fadeIn 0.3s ease';
    }, index * 100);
  });
}

function findMarketDay() {
  const type = elements.calendarType.value;
  const marketDays = calendars[type];
  const refDayIndex = parseInt(elements.referenceDay.value);
  const referenceDate = parseDateAsUTC(elements.referenceDate.value);
  const targetDate = parseDateAsUTC(elements.targetDate.value);

  if (!referenceDate || !targetDate) {
    showNotification("Please select both dates.", "error");
    return;
  }

  // Add loading animation to button
  elements.findBtn.style.transform = 'scale(0.95)';
  elements.findBtn.innerHTML = '<span class="btn-icon">⏳</span> Calculating...';
  
  setTimeout(() => {
    const diffDays = Math.round((targetDate - referenceDate) / msPerDay);
    const offset = safeModulo(diffDays, 4);
    const targetIndex = (refDayIndex + offset) % 4;
    const resultDay = marketDays[targetIndex];

    // Update result
    elements.resultDay.textContent = resultDay;
    elements.result.style.display = "block";
    elements.result.style.animation = "fadeInUp 0.6s ease";

    // Reset button
    elements.findBtn.style.transform = 'scale(1)';
    elements.findBtn.innerHTML = '<span class="btn-icon">🔍</span> Find Ancestral Day';
    
    showNotification("Ancestral day found!");
  }, 800);
}

function resetForm() {
  // Add reset animation
  elements.result.style.animation = 'fadeOut 0.3s ease';
  
  setTimeout(() => {
    elements.calendarType.selectedIndex = 0;
    elements.referenceDay.innerHTML = "";
    elements.referenceDate.value = "";
    elements.targetDate.value = "";
    elements.result.style.display = "none";
    
    disableElements();
    
    showNotification("Form reset!");
  }, 300);
}

// Add fadeOut animation
const additionalStyles = document.createElement('style');
additionalStyles.textContent = `
  @keyframes fadeOut {
    from { opacity: 1; transform: translateY(0); }
    to { opacity: 0; transform: translateY(-20px); }
  }
`;
document.head.appendChild(additionalStyles);
