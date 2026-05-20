/* ============================================
   슬기로운 식비생활 - Application Logic
   팀 식비 플래너 v1.0
   ============================================ */

// ============================================
// 1. CONSTANTS & CONFIGURATION
// ============================================

/** 2026 Korean Public Holidays (name: date) */
const HOLIDAYS_2026 = {
    '2026-01-01': '신정',
    '2026-02-16': '설날 연휴',
    '2026-02-17': '설날',
    '2026-02-18': '설날 연휴',
    '2026-03-01': '삼일절',
    '2026-03-02': '삼일절 대체공휴일',
    '2026-05-05': '어린이날',
    '2026-05-25': '부처님오신날 대체공휴일',
    '2026-06-06': '현충일',
    '2026-06-08': '현충일 대체공휴일',
    '2026-08-15': '광복절',
    '2026-08-17': '광복절 대체공휴일',
    '2026-09-24': '추석 연휴',
    '2026-09-25': '추석',
    '2026-09-26': '추석 연휴',
    '2026-10-03': '개천절',
    '2026-10-05': '개천절 대체공휴일',
    '2026-10-09': '한글날',
    '2026-12-25': '크리스마스',
};

/** Restaurant recommendations by price range */
const RESTAURANTS = {
    under8000: {
        defaultName: 'JTBC구내식당',
        emoji: '🏢',
        nearby: ['CJ ENM구내식당', '상암사옥 구내식당', 'MBC구내식당'],
    },
    under9000: {
        defaultName: '모모분식',
        emoji: '🍜',
        nearby: ['상암김밥천국', '오봉도시락 DMC점', '신김밥 상암점'],
    },
    under10000: {
        defaultName: '김밥앤라면',
        emoji: '🍲',
        nearby: ['역전우동 상암점', '한솥 DMC점', '감탄떡볶이 상암점'],
    },
    under12000: {
        defaultName: '회사 반경 50M내 식당',
        emoji: '🏪',
        nearby: ['한촌설렁탕 상암점', '칼국수와족발 DMC점', '스노우폭스 상암점'],
    },
    over12000: {
        defaultName: '먹고싶은거 왠만한건 괜찮음',
        emoji: '🎉',
        nearby: ['새마을식당 DMC점', '본죽&비빔밥 상암점', '육쌈냉면 상암점'],
    },
};

/** Budget health messages */
const HEALTH_MESSAGES = {
    critical: [
        '💀 흑흑, 극한의 절약 모드 돌입! JTBC 구내식당이나 편의점 삼김이 우리를 부르고 있어요...😭',
        '🥺 대표님... 예산 건강이 매우 위독해요! 사이드 메뉴 추가는 잠시 마음속에 접어두기로 약속해요! 🙅‍♀️',
        '🫠 비상비상! 오늘 점심은 강제 다이어트 코스인가요? 소식가의 마음으로 이겨내 봐요! 💪',
    ],
    tight: [
        '😅 조금 빠듯하네요! 우리 영양가 있는 가성비 킹, 분식으로 대동단결해 볼까요? 🍜',
        '🍜 뜨끈한 라면에 김밥 한 줄, 이것이 바로 소소하지만 확실한 행복! 든든하게 아껴봐요! ✨',
        '💪 지갑은 얇아도 우리 팀 케미는 두꺼우니까요! 가성비 맛집 지도를 펼칠 시간입니다! 🗺️',
    ],
    moderate: [
        '🙂 딱 적당하고 무난한 예산이에요! 1만원 안팎의 든든한 국밥이나 백반 어때요? 🍲',
        '🍲 상암동의 숨은 맛집을 탐방하기에 가장 대중적인 예산! 맛있게 식사하세요~ 👍',
        '👍 평범하지만 가장 알찬 식사 시간! 오늘 하루도 든든하게 먹고 화이팅해요! 🔥',
    ],
    good: [
        '😊 예산에 여유가 돌고 있어요! 오늘은 조금 더 맛있는 곳으로 발걸음을 옮겨볼까요? 🍽️',
        '✨ 1인 평균 1만원 이상! 서브웨이 꿀조합에 토핑 추가도 거뜬한 행복한 날이에요! 🥪',
        '🍽️ 예산 건강도 아주 양호! 오늘 점심 메뉴 선택권은 대표님께 드립니다! 맛있는 거 골라주세요~ 💚',
    ],
    great: [
        '🎉 대박! 예산이 엄청 넉넉해요! 오늘 점심은 무조건 고기나 초밥 각인데요? 🍣🍗',
        '🥳 와~ 지갑에 햇살이 가득! 이 틈을 타서 커피에 디저트까지 풀코스로 팀원들 사기 충전 고고! ☕🍰',
        '💚 대표님 최고! 풍요로운 예산 덕분에 팀원들 입가에 미소가 끊이지 않겠어요! 오늘 맛집 탐방 출발! 🚀',
    ],
};

/** Scope labels */
const SCOPE_LABELS = {
    monthly: '월',
    quarterly: '분기',
    annual: '연간',
};

// ============================================
// 2. STATE MANAGEMENT
// ============================================

const today = new Date();
today.setHours(0, 0, 0, 0);

let state = {
    budget: 0,
    teamSize: 9,
    baseDate: new Date(today),
    budgetScope: 'monthly',
    excludedDates: [],
    disabledHolidays: [], // holidays the user un-toggled
    editedDays: {},       // { 'YYYY-MM-DD': perPersonAmount }
    viewYear: today.getFullYear(),
    viewMonth: today.getMonth(),
    // per-day random restaurant cache
    nearbyCache: {},
};

/** Save state to localStorage */
function saveState() {
    try {
        const toSave = {
            budget: state.budget,
            teamSize: state.teamSize,
            baseDate: formatDate(state.baseDate),
            budgetScope: state.budgetScope,
            excludedDates: state.excludedDates,
            disabledHolidays: state.disabledHolidays,
            editedDays: state.editedDays,
            nearbyCache: state.nearbyCache,
        };
        localStorage.setItem('mealPlannerState', JSON.stringify(toSave));
    } catch (e) { /* silently fail */ }
}

/** Load state from localStorage */
function loadState() {
    try {
        const saved = localStorage.getItem('mealPlannerState');
        if (!saved) return;
        const data = JSON.parse(saved);
        if (data.budget != null) state.budget = Number(data.budget);
        if (data.teamSize) state.teamSize = Number(data.teamSize);
        if (data.baseDate) state.baseDate = parseDate(data.baseDate);
        if (data.budgetScope) state.budgetScope = data.budgetScope;
        if (data.excludedDates) state.excludedDates = data.excludedDates;
        if (data.disabledHolidays) state.disabledHolidays = data.disabledHolidays;
        if (data.editedDays) state.editedDays = data.editedDays;
        if (data.nearbyCache) state.nearbyCache = data.nearbyCache;
    } catch (e) { /* silently fail */ }
}

// ============================================
// 3. UTILITY FUNCTIONS
// ============================================

/** Animate numerical text change smoothly */
function animateValue(elementId, endValue, formatFn) {
    const el = document.getElementById(elementId);
    if (!el) return;

    // Parse current value from text
    const currentText = el.textContent || '';
    const rawNum = currentText.replace(/[^0-9]/g, '');
    const startValue = parseInt(rawNum, 10) || 0;

    if (startValue === endValue) {
        el.textContent = formatFn(endValue);
        return;
    }

    // Add pop animation class
    el.classList.remove('stat-pop');
    void el.offsetWidth; // trigger reflow
    el.classList.add('stat-pop');

    const duration = 400; // ms
    let startTime = null;

    function updateNumber(timestamp) {
        if (!startTime) startTime = timestamp;
        const progress = Math.min((timestamp - startTime) / duration, 1);
        // Easing out quad
        const easeProgress = progress * (2 - progress);
        const current = Math.floor(startValue + (endValue - startValue) * easeProgress);

        el.textContent = formatFn(current);

        if (progress < 1) {
            window.requestAnimationFrame(updateNumber);
        } else {
            el.textContent = formatFn(endValue);
        }
    }
    window.requestAnimationFrame(updateNumber);
}

/** Format Date object to 'YYYY-MM-DD' */
function formatDate(date) {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
}

/** Parse 'YYYY-MM-DD' to Date object */
function parseDate(str) {
    const [y, m, d] = str.split('-').map(Number);
    return new Date(y, m - 1, d);
}

/** Format number with commas */
function formatNumber(num) {
    return Math.floor(num).toLocaleString('ko-KR');
}

/** Format as currency */
function formatCurrency(num) {
    return '₩' + formatNumber(num);
}

/** Format date in Korean style */
function formatDateKo(dateStr) {
    const d = parseDate(dateStr);
    const weekdays = ['일', '월', '화', '수', '목', '금', '토'];
    return `${d.getMonth() + 1}/${d.getDate()} (${weekdays[d.getDay()]})`;
}

/** Check if a date string is a holiday (and not disabled by user) */
function isHoliday(dateStr) {
    if (state.disabledHolidays.includes(dateStr)) return false;
    return HOLIDAYS_2026[dateStr] != null;
}

/** Get holiday name */
function getHolidayName(dateStr) {
    return HOLIDAYS_2026[dateStr] || null;
}

/** Check if a date is in excluded list */
function isExcluded(dateStr) {
    return state.excludedDates.includes(dateStr);
}

/** Check if a date is a weekend (Sat=6, Sun=0) */
function isWeekend(date) {
    const day = date.getDay();
    return day === 0 || day === 6;
}

/** Check if a date is a business day */
function isBusinessDay(date) {
    const dateStr = formatDate(date);
    return !isWeekend(date) && !isHoliday(dateStr) && !isExcluded(dateStr);
}

// ============================================
// 4. CALCULATION FUNCTIONS
// ============================================

/** Get end date based on budget scope */
function getEndDate() {
    const base = state.baseDate;
    switch (state.budgetScope) {
        case 'monthly':
            return new Date(base.getFullYear(), base.getMonth() + 1, 0);
        case 'quarterly': {
            const quarter = Math.floor(base.getMonth() / 3);
            return new Date(base.getFullYear(), (quarter + 1) * 3, 0);
        }
        case 'annual':
            return new Date(base.getFullYear(), 11, 31);
        default:
            return new Date(base.getFullYear(), base.getMonth() + 1, 0);
    }
}

/** Get list of business day date strings between start and end (inclusive) */
function getBusinessDaysList(startDate, endDate) {
    const days = [];
    const current = new Date(startDate);
    current.setHours(0, 0, 0, 0);
    const end = new Date(endDate);
    end.setHours(0, 0, 0, 0);

    while (current <= end) {
        if (isBusinessDay(current)) {
            days.push(formatDate(current));
        }
        current.setDate(current.getDate() + 1);
    }
    return days;
}

/**
 * Calculate daily budgets for all business days in scope.
 * Returns: { avgPerPerson, remainingDays, totalBusinessDays, businessDays, dailyBudgets }
 */
function calculateBudgets() {
    const endDate = getEndDate();
    const businessDays = getBusinessDaysList(state.baseDate, endDate);
    const totalBusinessDays = businessDays.length;

    if (state.budget <= 0 || state.teamSize <= 0 || totalBusinessDays <= 0) {
        return {
            avgPerPerson: 0,
            remainingDays: totalBusinessDays,
            totalBusinessDays,
            businessDays,
            dailyBudgets: {},
        };
    }

    // Per person total budget
    const perPersonTotal = state.budget / state.teamSize;

    // Sum edited per-person amounts for days in range
    let editedSum = 0;
    let editedCount = 0;
    businessDays.forEach(dateStr => {
        if (state.editedDays[dateStr] !== undefined) {
            editedSum += state.editedDays[dateStr];
            editedCount++;
        }
    });

    const uneditedDays = totalBusinessDays - editedCount;
    const remainingPerPerson = perPersonTotal - editedSum;
    const avgPerPerson = uneditedDays > 0 ? Math.floor(remainingPerPerson / uneditedDays) : 0;

    // Build daily budgets map
    const dailyBudgets = {};
    businessDays.forEach(dateStr => {
        dailyBudgets[dateStr] = state.editedDays[dateStr] !== undefined
            ? state.editedDays[dateStr]
            : avgPerPerson;
    });

    return {
        avgPerPerson,
        remainingDays: uneditedDays,
        totalBusinessDays,
        businessDays,
        dailyBudgets,
    };
}

// ============================================
// 5. RESTAURANT RECOMMENDATION
// ============================================

/** Get price range tier for an amount */
function getPriceTier(amount) {
    if (amount < 8000) return 'under8000';
    if (amount < 9000) return 'under9000';
    if (amount < 10000) return 'under10000';
    if (amount < 12000) return 'under12000';
    return 'over12000';
}

/** Get restaurant recommendation */
function getRestaurant(amount, dateStr) {
    const tier = getPriceTier(amount);
    const data = RESTAURANTS[tier];

    // Get or generate random nearby restaurant for this date+tier
    const cacheKey = `${dateStr}_${tier}`;
    if (!state.nearbyCache[cacheKey]) {
        const idx = Math.floor(Math.random() * data.nearby.length);
        state.nearbyCache[cacheKey] = data.nearby[idx];
    }
    const nearbyName = state.nearbyCache[cacheKey];

    return {
        defaultName: data.defaultName,
        emoji: data.emoji,
        nearbyName,
        tier,
        needsWarning: amount < 12000,
    };
}

/** Get budget level CSS class */
function getLevelClass(amount) {
    if (amount < 8000) return 'level-critical';
    if (amount < 9000) return 'level-tight';
    if (amount < 10000) return 'level-moderate';
    if (amount < 12000) return 'level-good';
    return 'level-great';
}

// ============================================
// 6. UI RENDERING
// ============================================

/** DOM element cache */
const $ = (id) => document.getElementById(id);

/** Render everything */
function renderAll() {
    const result = calculateBudgets();
    renderDashboard(result);
    renderMessage(result);
    renderCalendar(result);
    renderCalendarSummary(result);
    renderSettings();
    saveState();
}

/** Render dashboard stats */
function renderDashboard(result) {
    // Budget input - only set if different (to avoid cursor jump)
    const budgetInput = $('budgetInput');
    if (document.activeElement !== budgetInput) {
        budgetInput.value = state.budget > 0 ? formatNumber(state.budget) : '';
    }

    // Daily budget
    if (result.avgPerPerson > 0) {
        animateValue('dailyBudgetValue', result.avgPerPerson, formatCurrency);
    } else {
        $('dailyBudgetValue').textContent = '₩ —';
    }

    // Remaining days
    if (result.totalBusinessDays > 0) {
        animateValue('remainingDaysValue', result.totalBusinessDays, val => `${val}일`);
    } else {
        $('remainingDaysValue').textContent = '— 일';
    }

    // Health gauge
    const healthPercent = result.avgPerPerson > 0
        ? Math.min(100, (result.avgPerPerson / 15000) * 100)
        : 0;
    $('healthFill').style.width = `${healthPercent}%`;

    let healthText = '입력 대기';
    let healthEmoji = '🔋';
    let characterImg = 'https://raw.githubusercontent.com/wonseokjung/solopreneur-ai-agents/main/agents/youngja/assets/youngja_coffee.png';
    let statusClass = 'default';

    if (result.avgPerPerson > 0) {
        if (result.avgPerPerson < 8000) { 
            healthText = '위험'; 
            healthEmoji = '🔴'; 
            characterImg = 'https://raw.githubusercontent.com/wonseokjung/solopreneur-ai-agents/main/agents/youngja/assets/youngja_panic.png';
            statusClass = 'critical';
        }
        else if (result.avgPerPerson < 9000) { 
            healthText = '빠듯'; 
            healthEmoji = '🟠'; 
            characterImg = 'https://raw.githubusercontent.com/wonseokjung/solopreneur-ai-agents/main/agents/youngja/assets/youngja_thinking.png';
            statusClass = 'tight';
        }
        else if (result.avgPerPerson < 10000) { 
            healthText = '보통'; 
            healthEmoji = '🟡'; 
            characterImg = 'https://raw.githubusercontent.com/wonseokjung/solopreneur-ai-agents/main/agents/youngja/assets/youngja_hello.png';
            statusClass = 'moderate';
        }
        else if (result.avgPerPerson < 12000) { 
            healthText = '양호'; 
            healthEmoji = '🟢'; 
            characterImg = 'https://raw.githubusercontent.com/wonseokjung/solopreneur-ai-agents/main/agents/youngja/assets/youngja_thumbsup.png';
            statusClass = 'good';
        }
        else { 
            healthText = '넉넉'; 
            healthEmoji = '💚'; 
            characterImg = 'https://raw.githubusercontent.com/wonseokjung/solopreneur-ai-agents/main/agents/youngja/assets/youngja_excited.png';
            statusClass = 'great';
        }
    }
    $('healthLabel').textContent = healthText;
    
    // Character Avatar Image & Class update
    const charImgEl = $('healthCharacterImg');
    const charWrapperEl = $('healthCharacterWrapper');
    if (charImgEl && charWrapperEl) {
        if (charImgEl.src !== characterImg) {
            charImgEl.src = characterImg;
        }
        charWrapperEl.className = 'health-character-wrapper ' + statusClass;
    }

    // Scope buttons
    document.querySelectorAll('.scope-btn').forEach(btn => {
        const isActive = btn.dataset.scope === state.budgetScope;
        btn.classList.toggle('active', isActive);
        btn.setAttribute('aria-checked', isActive);
    });

    // Color the daily budget value
    if (result.avgPerPerson > 0) {
        const levelClass = getLevelClass(result.avgPerPerson);
        const colorMap = {
            'level-critical': 'var(--level-critical)',
            'level-tight': 'var(--level-tight)',
            'level-moderate': 'var(--level-moderate)',
            'level-good': 'var(--level-good)',
            'level-great': 'var(--level-great)',
        };
        $('dailyBudgetValue').style.color = colorMap[levelClass] || '';
    } else {
        $('dailyBudgetValue').style.color = '';
    }
}

/** Render daily message */
function renderMessage(result) {
    const banner = $('messageBanner');
    if (!banner) return;

    let newText = '';
    if (result.avgPerPerson <= 0) {
        newText = '예산을 입력하면 오늘의 한마디를 알려드릴게요!';
    } else {
        let category;
        if (result.avgPerPerson < 8000) category = 'critical';
        else if (result.avgPerPerson < 9000) category = 'tight';
        else if (result.avgPerPerson < 10000) category = 'moderate';
        else if (result.avgPerPerson < 12000) category = 'good';
        else category = 'great';

        const messages = HEALTH_MESSAGES[category];
        const dayOfYear = Math.floor((today - new Date(today.getFullYear(), 0, 0)) / 86400000);
        const idx = dayOfYear % messages.length;
        newText = messages[idx];
    }

    // Only animate if text actually changed to avoid annoying vibration
    if ($('messageText').textContent !== newText) {
        $('messageText').textContent = newText;
        banner.classList.remove('pop-active');
        void banner.offsetWidth; // trigger reflow
        banner.classList.add('pop-active');
    }
}

/** Render calendar grid */
function renderCalendar(result) {
    const year = state.viewYear;
    const month = state.viewMonth;

    // Update title
    $('monthTitle').textContent = `${year}년 ${month + 1}월`;

    // Get first day of month and number of days
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();

    // Monday = 0, ... Sunday = 6
    let startDayOfWeek = firstDay.getDay() - 1;
    if (startDayOfWeek < 0) startDayOfWeek = 6;

    // Previous month days to fill
    const prevMonthLast = new Date(year, month, 0);
    const prevMonthDays = prevMonthLast.getDate();

    const grid = $('calendarGrid');
    grid.innerHTML = '';

    // Previous month filler days
    for (let i = startDayOfWeek - 1; i >= 0; i--) {
        const dayNum = prevMonthDays - i;
        const cell = createDayCell(dayNum, year, month - 1, result, true);
        grid.appendChild(cell);
    }

    // Current month days
    for (let d = 1; d <= daysInMonth; d++) {
        const cell = createDayCell(d, year, month, result, false);
        grid.appendChild(cell);
    }

    // Next month filler days
    const totalCells = grid.children.length;
    const remainingCells = (7 - (totalCells % 7)) % 7;
    for (let d = 1; d <= remainingCells; d++) {
        const cell = createDayCell(d, year, month + 1, result, true);
        grid.appendChild(cell);
    }
}

/** Create a single day cell element */
function createDayCell(dayNum, year, month, result, isOtherMonth) {
    const date = new Date(year, month, dayNum);
    const dateStr = formatDate(date);
    const cell = document.createElement('div');
    cell.className = 'day-cell';

    if (isOtherMonth) {
        cell.classList.add('other-month');
    }

    // Check properties
    const isTodayDate = formatDate(today) === dateStr;
    const weekend = isWeekend(date);
    const holiday = !isOtherMonth && isHoliday(dateStr);
    const excluded = !isOtherMonth && isExcluded(dateStr);
    const businessDay = !isOtherMonth && isBusinessDay(date);
    const isEdited = state.editedDays[dateStr] !== undefined;
    const holidayName = getHolidayName(dateStr);

    if (isTodayDate) cell.classList.add('today');
    if (weekend) cell.classList.add('weekend');
    if (holiday) cell.classList.add('holiday');
    if (excluded) cell.classList.add('excluded');
    if (isEdited) cell.classList.add('edited');

    // Day number
    const dayNumEl = document.createElement('div');
    dayNumEl.className = 'day-number';
    dayNumEl.textContent = dayNum;
    cell.appendChild(dayNumEl);

    // Holiday name
    if (holiday && holidayName) {
        const holEl = document.createElement('div');
        holEl.className = 'holiday-name';
        holEl.textContent = holidayName;
        cell.appendChild(holEl);
    }

    // Excluded label
    if (excluded && !holiday) {
        const exEl = document.createElement('div');
        exEl.className = 'holiday-name';
        exEl.textContent = '제외일';
        cell.appendChild(exEl);
    }

    // Budget & restaurant for business days
    if (businessDay && !isOtherMonth && result.dailyBudgets[dateStr] !== undefined) {
        const amount = result.dailyBudgets[dateStr];
        const levelClass = getLevelClass(amount);
        cell.classList.add(levelClass);
        cell.classList.add('business-day');

        // Budget row
        const budgetRow = document.createElement('div');
        budgetRow.className = 'day-budget';

        const amountEl = document.createElement('span');
        amountEl.className = 'day-amount';
        amountEl.textContent = formatCurrency(amount);
        budgetRow.appendChild(amountEl);

        // Warning icon for < 12000
        if (amount < 12000 && amount > 0) {
            const warnIcon = document.createElement('span');
            warnIcon.className = 'warning-icon';
            warnIcon.textContent = '!';
            warnIcon.setAttribute('role', 'button');
            warnIcon.setAttribute('aria-label', '주의: 사이드 메뉴 금지');

            warnIcon.addEventListener('mouseenter', (e) => showWarningPopup(e));
            warnIcon.addEventListener('mouseleave', () => hideWarningPopup());
            warnIcon.addEventListener('touchstart', (e) => {
                e.preventDefault();
                showWarningPopup(e);
                setTimeout(hideWarningPopup, 2500);
            });

            budgetRow.appendChild(warnIcon);
        }

        cell.appendChild(budgetRow);

        // Restaurant recommendation
        const restaurant = getRestaurant(amount, dateStr);
        const restEl = document.createElement('div');
        restEl.className = 'day-restaurant';
        restEl.textContent = `${restaurant.emoji} ${restaurant.defaultName}`;
        cell.appendChild(restEl);

        // Random nearby restaurant
        const nearbyEl = document.createElement('div');
        nearbyEl.className = 'day-restaurant';
        nearbyEl.style.opacity = '0.6';
        nearbyEl.textContent = `📍 ${restaurant.nearbyName}`;
        cell.appendChild(nearbyEl);

        // Click to edit
        cell.addEventListener('click', () => openEditModal(dateStr, amount));
    }

    return cell;
}

/** Render calendar summary footer */
function renderCalendarSummary(result) {
    const year = state.viewYear;
    const month = state.viewMonth;

    // Count business days in the viewed month
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const monthBusinessDays = getBusinessDaysList(firstDay, lastDay);

    $('summaryBusinessDays').textContent = `${monthBusinessDays.length}일`;

    // Total cost for this month
    let totalCost = 0;
    let editedCount = 0;
    monthBusinessDays.forEach(dateStr => {
        if (result.dailyBudgets[dateStr] !== undefined) {
            totalCost += result.dailyBudgets[dateStr] * state.teamSize;
        }
        if (state.editedDays[dateStr] !== undefined) {
            editedCount++;
        }
    });

    if (totalCost > 0) {
        animateValue('summaryTotalCost', totalCost, formatCurrency);
    } else {
        $('summaryTotalCost').textContent = '—';
    }

    animateValue('summaryEditedDays', editedCount, val => `${val}일`);
}

/** Render settings panel */
function renderSettings() {
    // Base date
    const baseDateInput = $('baseDateInput');
    if (document.activeElement !== baseDateInput) {
        baseDateInput.value = formatDate(state.baseDate);
    }

    // Team size
    $('teamSizeDisplay').textContent = `${state.teamSize}명`;

    // Excluded dates list
    const excludedList = $('excludedList');
    excludedList.innerHTML = '';
    state.excludedDates.sort().forEach(dateStr => {
        const li = document.createElement('li');
        li.innerHTML = `
            <span>${formatDateKo(dateStr)}</span>
            <button class="remove-btn" data-date="${dateStr}" aria-label="${dateStr} 제거">✕</button>
        `;
        excludedList.appendChild(li);
    });

    // Bind remove buttons
    excludedList.querySelectorAll('.remove-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            state.excludedDates = state.excludedDates.filter(d => d !== btn.dataset.date);
            renderAll();
        });
    });

    // Holiday list
    const holidayList = $('holidayList');
    holidayList.innerHTML = '';
    Object.entries(HOLIDAYS_2026).forEach(([dateStr, name]) => {
        const li = document.createElement('li');
        const isDisabled = state.disabledHolidays.includes(dateStr);
        if (isDisabled) li.classList.add('disabled-holiday');
        li.innerHTML = `
            <span>${formatDateKo(dateStr)} ${name}</span>
            <span>${isDisabled ? '⬜' : '✅'}</span>
        `;
        li.addEventListener('click', () => {
            if (isDisabled) {
                state.disabledHolidays = state.disabledHolidays.filter(d => d !== dateStr);
            } else {
                state.disabledHolidays.push(dateStr);
            }
            renderAll();
        });
        holidayList.appendChild(li);
    });
}

// ============================================
// 7. WARNING POPUP
// ============================================

function showWarningPopup(e) {
    const popup = $('warningPopup');
    const rect = e.target.getBoundingClientRect();

    // Position popup near the icon
    let left = rect.left + rect.width / 2 - 100;
    let top = rect.bottom + 8;

    // Keep within viewport
    if (left < 10) left = 10;
    if (left + 200 > window.innerWidth) left = window.innerWidth - 210;
    if (top + 200 > window.innerHeight) top = rect.top - 208;

    popup.style.left = `${left}px`;
    popup.style.top = `${top}px`;
    popup.classList.add('visible');
}

function hideWarningPopup() {
    $('warningPopup').classList.remove('visible');
}

// ============================================
// 8. EDIT MODAL
// ============================================

let editingDateStr = null;

function openEditModal(dateStr, currentAmount) {
    editingDateStr = dateStr;
    $('editModalDate').textContent = formatDateKo(dateStr);
    $('editModalCurrent').textContent = `현재 금액: ${formatCurrency(currentAmount)}/1인`;
    $('editAmountInput').value = '';
    $('editModalOverlay').classList.add('open');
    setTimeout(() => $('editAmountInput').focus(), 200);
}

function closeEditModal() {
    editingDateStr = null;
    $('editModalOverlay').classList.remove('open');
}

function saveEditAmount() {
    if (!editingDateStr) return;
    const raw = $('editAmountInput').value.replace(/[^0-9]/g, '');
    const amount = parseInt(raw, 10);
    if (isNaN(amount) || amount < 0) {
        alert('올바른 금액을 입력해주세요!');
        return;
    }
    state.editedDays[editingDateStr] = amount;
    closeEditModal();
    renderAll();
}

function resetEditAmount() {
    if (!editingDateStr) return;
    delete state.editedDays[editingDateStr];
    closeEditModal();
    renderAll();
}

// ============================================
// 9. EVENT HANDLERS
// ============================================

function setupEventHandlers() {
    // Budget input
    $('budgetInput').addEventListener('input', (e) => {
        const raw = e.target.value.replace(/[^0-9]/g, '');
        state.budget = parseInt(raw, 10) || 0;
        // Format with commas while typing
        if (raw) {
            const cursorPos = e.target.selectionStart;
            const oldLen = e.target.value.length;
            e.target.value = formatNumber(parseInt(raw, 10));
            const newLen = e.target.value.length;
            e.target.setSelectionRange(cursorPos + (newLen - oldLen), cursorPos + (newLen - oldLen));
        }
        renderAll();
    });

    // Scope selector
    document.querySelectorAll('.scope-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            state.budgetScope = btn.dataset.scope;
            renderAll();
        });
    });

    // Month navigation
    $('prevMonth').addEventListener('click', () => {
        state.viewMonth--;
        if (state.viewMonth < 0) {
            state.viewMonth = 11;
            state.viewYear--;
        }
        renderAll();
    });

    $('nextMonth').addEventListener('click', () => {
        state.viewMonth++;
        if (state.viewMonth > 11) {
            state.viewMonth = 0;
            state.viewYear++;
        }
        renderAll();
    });

    // Settings panel toggle
    $('settingsToggle').addEventListener('click', toggleSettings);
    $('settingsClose').addEventListener('click', toggleSettings);
    $('settingsOverlay').addEventListener('click', toggleSettings);

    // Base date
    $('baseDateInput').addEventListener('change', (e) => {
        if (e.target.value) {
            state.baseDate = parseDate(e.target.value);
            renderAll();
        }
    });

    // Team size stepper
    $('teamMinus').addEventListener('click', () => {
        if (state.teamSize > 1) {
            state.teamSize--;
            renderAll();
        }
    });

    $('teamPlus').addEventListener('click', () => {
        state.teamSize++;
        renderAll();
    });

    // Add exclude date
    $('addExcludeDate').addEventListener('click', () => {
        const val = $('excludeDateInput').value;
        if (val && !state.excludedDates.includes(val)) {
            state.excludedDates.push(val);
            $('excludeDateInput').value = '';
            renderAll();
        }
    });

    // Edit modal buttons
    $('editCancel').addEventListener('click', closeEditModal);
    $('editReset').addEventListener('click', resetEditAmount);
    $('editSave').addEventListener('click', saveEditAmount);
    $('editModalOverlay').addEventListener('click', (e) => {
        if (e.target === $('editModalOverlay')) closeEditModal();
    });

    // Edit input - format with commas
    $('editAmountInput').addEventListener('input', (e) => {
        const raw = e.target.value.replace(/[^0-9]/g, '');
        if (raw) {
            const cursorPos = e.target.selectionStart;
            const oldLen = e.target.value.length;
            e.target.value = formatNumber(parseInt(raw, 10));
            const newLen = e.target.value.length;
            e.target.setSelectionRange(cursorPos + (newLen - oldLen), cursorPos + (newLen - oldLen));
        }
    });

    // Enter key on edit modal
    $('editAmountInput').addEventListener('keydown', (e) => {
        if (e.key === 'Enter') saveEditAmount();
        if (e.key === 'Escape') closeEditModal();
    });

    // Enter key on budget input
    $('budgetInput').addEventListener('keydown', (e) => {
        if (e.key === 'Enter') e.target.blur();
    });

    // Keyboard shortcut: Escape to close settings
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            if ($('editModalOverlay').classList.contains('open')) {
                closeEditModal();
            } else if ($('settingsPanel').classList.contains('open')) {
                toggleSettings();
            }
        }
    });
}

/** Toggle settings panel */
function toggleSettings() {
    const panel = $('settingsPanel');
    const overlay = $('settingsOverlay');
    const isOpen = panel.classList.contains('open');
    panel.classList.toggle('open', !isOpen);
    overlay.classList.toggle('open', !isOpen);
}

// ============================================
// 10. INITIALIZATION
// ============================================

function init() {
    loadState();

    // Set view to base date's month (Synchronized with loaded baseDate from LocalStorage!)
    state.viewYear = state.baseDate.getFullYear();
    state.viewMonth = state.baseDate.getMonth();

    setupEventHandlers();
    renderAll();
}

document.addEventListener('DOMContentLoaded', init);
