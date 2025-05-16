document.addEventListener('DOMContentLoaded', () => {
    // --- 全局状态和数据 ---
    let monthlyIncome = 0;
    let budgetSettings = { // 预算占比
        food: 0, clothing: 0, housing: 0, transport: 0,
        learning: 0, entertainment: 0, savings: 0
    };
    let actualBudgets = {}; // 各类别实际预算金额
    let expenses = []; // { date, category, amount, description }

    const CATEGORIES = {
        food: "食", clothing: "衣", housing: "住", transport: "行",
        learning: "学", entertainment: "娱", savings: "储蓄"
    };

    // --- DOM Elements (根据当前页面获取) ---
    // 首页元素
    const monthlyIncomeInput = document.getElementById('monthly-income');
    // const budgetPercentageInputs = document.querySelectorAll('.budget-percentage'); // Old
    const budgetPercentageSliders = document.querySelectorAll('.budget-percentage-slider'); // New
    // const totalPercentageSpan = document.getElementById('total-percentage'); // Old, replaced by total-percentage-value and progress bar
    const totalPercentageValueSpan = document.getElementById('total-percentage-value'); // New
    const totalPercentageBar = document.getElementById('total-percentage-bar'); // New
    const saveSetupButton = document.getElementById('save-setup');
    const quickSetupButton = document.getElementById('quick-setup');
    const budgetOverviewContainer = document.getElementById('budget-overview-container');

    // 记录页元素
    const expenseDateInput = document.getElementById('expense-date');
    const expenseCategorySelect = document.getElementById('expense-category');
    const expenseAmountInput = document.getElementById('expense-amount');
    const expenseDescriptionInput = document.getElementById('expense-description');
    const addExpenseButton = document.getElementById('add-expense');
    const budgetStatusContainer = document.getElementById('budget-status-container');

    // 总结页元素
    const summaryTotalIncomeSpan = document.getElementById('summary-total-income');
    const summaryTotalExpenseSpan = document.getElementById('summary-total-expense');
    const summaryTotalRemainingSpan = document.getElementById('summary-total-remaining');
    const categorySummaryContainer = document.getElementById('category-summary-container');
    const expenseChartCanvas = document.getElementById('expense-chart');
    const suggestionText = document.getElementById('suggestion-text'); // Existing suggestion text element

    // 新增：收入建议容器
    const incomeSuggestionsContainer = document.getElementById('income-level-suggestions-container');


    // --- 收入分级与消费建议数据 ---
    const incomeLevelsData = [
        {
            level: 1, minIncome: 1200,
            percentages: { clothing: 7, food: 50, housing: 25, transport: 8, learning: 3, entertainment: 2, savings: 5 },
            advice: {
                clothing: "购买基础款、耐用衣物；关注二手市场或亲友赠与；学习基础缝补，延长衣物寿命。",
                food: "以在家做饭为主，多选择当季平价蔬果；学习营养搭配，保证基本健康；减少外食和零食。",
                housing: "学生宿舍或与人合租床位；选择城市非核心区域的廉租房；确保基本安全卫生。",
                transport: "以公共交通（公交、地铁）、自行车或步行为主；办理交通月卡或学生卡优惠。",
                learning: "利用图书馆、免费在线课程、公益讲座等资源；购买二手教材。",
                entertainment: "参与免费社群活动、公园锻炼、阅读；利用学生优惠参与部分文化活动。",
                savings: "尝试小额储蓄，培养储蓄习惯；哪怕每月存50-100元，建立应急意识。"
            }
        },
        {
            level: 2, minIncome: 1800,
            percentages: { clothing: 7, food: 45, housing: 25, transport: 8, learning: 4, entertainment: 3, savings: 8 },
            advice: {
                clothing: "类似上一级；可适当关注打折季购入必需品；学习基础色彩搭配，让简单衣物焕发活力。",
                food: "继续以在家做饭为主，可适当增加蛋白质摄入（蛋奶、豆制品）；学习简单的烹饪技巧，提高生活质量。",
                housing: "与人合租，分摊房租和水电；留意政府青年公寓或公租房信息。",
                transport: "优先公共交通；若工作距离近，考虑二手自行车。",
                learning: "购买实用技能类书籍；参与线上免费或低成本的职业技能培训。",
                entertainment: "参与社区组织的文体活动；与朋友进行低成本聚会，如家庭影院、户外野餐。",
                savings: "坚持小额储蓄，目标是建立1个月生活费的应急金。"
            }
        },
        {
            level: 3, minIncome: 2500,
            percentages: { clothing: 7, food: 40, housing: 25, transport: 8, learning: 5, entertainment: 5, savings: 10 },
            advice: {
                clothing: "注重性价比，选择快时尚品牌的基础款和打折品；学习一衣多搭技巧。",
                food: "控制外卖频率，每周可有1-2次经济型外卖；学习做几道拿手菜，周末改善伙食。",
                housing: "在保证安全前提下，选择离工作地点稍远但租金较低的合租房。",
                transport: "充分利用公共交通网络；尝试错峰出行节省时间。",
                learning: "购买行业相关书籍或订阅付费专栏；考虑报名单科的线上技能提升课程。",
                entertainment: "每月可有1-2次平价电影或小型展览；培养一项低成本爱好，如跑步、绘画。",
                savings: "开始建立紧急备用金（3个月生活费）；可尝试货币基金等低风险理财。"
            }
        },
        {
            level: 4, minIncome: 3500,
            percentages: { clothing: 8, food: 35, housing: 25, transport: 9, learning: 6, entertainment: 7, savings: 10 },
            advice: {
                clothing: "可购入少量品质稍好的通勤装；关注品牌特卖会或奥特莱斯。",
                food: "平衡在家做饭与外食，工作日午餐可考虑自带或公司食堂（若有）；周末可尝试自己制作健康餐。",
                housing: "若条件允许，可考虑合租房中的单间，提高生活私密性。",
                transport: "公共交通为主，若通勤距离远且公共交通不便，可考虑合伙拼车。",
                learning: "每年可规划1-2个短期职业技能培训班；开始为子女早期教育（若有）做少量信息储备。",
                entertainment: "增加与朋友的社交活动，如聚餐（AA制）、看演出；每年可规划1-2次短途周边游。",
                savings: "积极储蓄，目标覆盖3-6个月生活费；开始了解定期存款、国债等稳健理财产品。"
            }
        },
        {
            level: 5, minIncome: 5000,
            percentages: { clothing: 8, food: 30, housing: 25, transport: 10, learning: 8, entertainment: 9, savings: 10 },
            advice: {
                clothing: "建立基本衣橱，包含四季经典款；学习辨别衣物材质，选择耐穿、易打理的。",
                food: "注重饮食均衡与健康，减少高油高盐外卖；每周可安排1-2次与家人朋友外出就餐（选择性价比餐厅）。",
                housing: "可考虑在交通便利的区域整租一居室或与少数人合租品质较好的公寓。",
                transport: "可考虑购买经济型代步工具（如电动车），若有购车打算需提前规划养车费用；或依赖打车软件的经济型服务。",
                learning: "持续进行职业技能提升和知识更新；可为子女（若有）规划早期兴趣班或购买启蒙读物。",
                entertainment: "培养固定爱好，如健身、乐器、摄影等；每年可进行1次国内长途旅行。",
                savings: "储蓄目标明确（如购房首付、大额消费）；开始配置指数基金定投。"
            }
        },
        {
            level: 6, minIncome: 7000,
            percentages: { clothing: 8, food: 28, housing: 24, transport: 10, learning: 10, entertainment: 10, savings: 10 },
            advice: {
                clothing: "添置有设计感或特定场合穿着的衣物；注重配饰（如围巾、手表）提升整体品味。",
                food: "更注重食材的新鲜度和品质；可尝试学习一些地方特色菜或烘焙；家庭聚餐可在家进行，温馨又经济。",
                housing: "可考虑月供压力较小的近郊小户型，或在市区内租住装修和管理较好的公寓。",
                transport: "若购车，需将油费、保养、保险、停车费等计入预算；日常仍可结合公共交通。",
                learning: "参加行业研讨会或专业论坛；为自己或家人规划系统的学习计划（如语言学习、考证）。",
                entertainment: "享受更高品质的娱乐，如话剧、音乐会、体育赛事；每年可规划1-2次国内深度游或1次短途出境游。",
                savings: "增加储蓄和投资比例；配置更多元的理财产品，如混合型基金、银行理财产品。"
            }
        },
        {
            level: 7, minIncome: 9000,
            percentages: { clothing: 8, food: 25, housing: 23, transport: 10, learning: 12, entertainment: 10, savings: 12 }, // Assuming savings 12% to make total 100%
            advice: {
                clothing: "关注有品质的设计师品牌或轻奢品牌入门款；开始考虑部分衣物的定制，提升合身度。",
                food: "可购买有机、绿色食品；尝试更健康的烹饪方式（蒸、烤）；偶尔体验中高端餐厅。",
                housing: "若有购房计划，积极看房并进行财务评估；租房可选择设施更完善、社区环境更好的小区。",
                transport: "考虑燃油经济性较好的合资品牌汽车；合理规划行车路线，节约油耗。",
                learning: "投入更多资源用于专业深造或管理能力提升课程；重视子女教育质量，选择优质教育资源。", // Data was partial, completed with plausible suggestion
                entertainment: "规划更有个性化的休闲活动，如主题旅行、艺术收藏入门等。", // Data was partial
                savings: "进行更长期的财务规划，考虑子女教育基金、养老储备、财富传承等；咨询专业理财顾问。" // Data was partial
            }
        }
    ];


    // --- 数据持久化 (localStorage) ---
    function saveData() {
        localStorage.setItem('monthlyIncome', monthlyIncome);
        localStorage.setItem('budgetSettings', JSON.stringify(budgetSettings));
        localStorage.setItem('expenses', JSON.stringify(expenses));
        console.log("Data saved:", { monthlyIncome, budgetSettings, expenses });
    }

    function loadData() {
        const storedIncome = localStorage.getItem('monthlyIncome');
        const storedBudgetSettings = localStorage.getItem('budgetSettings');
        const storedExpenses = localStorage.getItem('expenses');

        if (storedIncome) monthlyIncome = parseFloat(storedIncome);
        if (storedBudgetSettings) budgetSettings = JSON.parse(storedBudgetSettings);
        if (storedExpenses) expenses = JSON.parse(storedExpenses);
        
        calculateActualBudgets(); // 加载数据后计算实际预算
        console.log("Data loaded:", { monthlyIncome, budgetSettings, expenses });
    }

    // --- 核心逻辑 ---
    function calculateActualBudgets() {
        actualBudgets = {}; // 重置
        for (const category in budgetSettings) {
            if (budgetSettings.hasOwnProperty(category) && monthlyIncome > 0) {
                actualBudgets[category] = (monthlyIncome * (budgetSettings[category] / 100)).toFixed(2);
            } else {
                actualBudgets[category] = 0;
            }
        }
    }
    
    function updateBudgetPercentageDisplay() {
        // if (!totalPercentageSpan) return; // Old
        if (!totalPercentageValueSpan || !totalPercentageBar) return; // 只在首页执行

        let total = 0;
        budgetPercentageSliders.forEach(slider => {
            const category = slider.dataset.category;
            const percentage = parseFloat(slider.value) || 0;
            budgetSettings[category] = percentage; // 更新 budgetSettings
            total += percentage;

            // 更新滑块旁边的百分比显示
            const percentageDisplaySpan = document.getElementById(`percentage-display-${category}`);
            if (percentageDisplaySpan) {
                percentageDisplaySpan.textContent = percentage;
            }

            // 更新单个类别的实际预算显示
            const actualBudgetSpan = document.getElementById(`actual-budget-${category}`);
            if (actualBudgetSpan && monthlyIncome > 0) {
                actualBudgetSpan.textContent = `(￥${(monthlyIncome * (percentage / 100)).toFixed(2)})`;
            } else if (actualBudgetSpan) {
                actualBudgetSpan.textContent = `(￥0.00)`;
            }
        });

        totalPercentageValueSpan.textContent = total;
        totalPercentageBar.style.width = `${Math.min(total, 100)}%`; // Cap at 100% for display

        if (total !== 100) {
            totalPercentageValueSpan.style.color = 'red';
            totalPercentageBar.classList.add('invalid');
            totalPercentageBar.classList.remove('valid'); // Assuming you might add a 'valid' class
        } else {
            totalPercentageValueSpan.style.color = 'green';
            totalPercentageBar.classList.remove('invalid');
            totalPercentageBar.classList.add('valid'); // Or just rely on default green
            totalPercentageBar.style.backgroundColor = '#28a745'; // Ensure green
        }
        if (total > 100) { // If total exceeds 100, also mark as invalid
             totalPercentageBar.style.backgroundColor = '#dc3545'; // Red
        }


        calculateActualBudgets(); // 实时计算实际预算
    }

    function handleSaveSetup() {
        const incomeValue = parseFloat(monthlyIncomeInput.value);
        if (isNaN(incomeValue) || incomeValue <= 0) {
            alert("请输入有效的月收入！");
            return;
        }
        monthlyIncome = incomeValue;

        let totalPercentage = 0;
        // Recalculate total from budgetSettings as sliders might have been the source of truth
        for (const category in budgetSettings) {
            if (budgetSettings.hasOwnProperty(category)) {
                totalPercentage += budgetSettings[category];
            }
        }
        // budgetPercentageSliders.forEach(slider => { // Or from sliders directly
        //     totalPercentage += parseFloat(slider.value) || 0;
        // });


        if (Math.round(totalPercentage) !== 100) { // Use Math.round for potential float issues
            alert("预算总分配比例必须为 100%！当前为 " + totalPercentage.toFixed(2) + "%");
            return;
        }
        
        updateBudgetPercentageDisplay(); // 确保 budgetSettings 是最新的
        saveData();
        alert("设置已保存！");
        renderBudgetOverview(); // 更新首页概览
        renderIncomeLevelSuggestions(); // 新增：渲染收入建议
    }
    
    function handleQuickSetup() {
        // 示例快速设置
        const exampleSettings = { food: 30, clothing: 10, housing: 20, transport: 10, learning: 10, entertainment: 10, savings: 10 };
        budgetPercentageSliders.forEach(slider => {
            const category = slider.dataset.category;
            const exampleValue = exampleSettings[category] || 0;
            slider.value = exampleValue;
            // Manually trigger update for display spans
            const percentageDisplaySpan = document.getElementById(`percentage-display-${category}`);
            if (percentageDisplaySpan) {
                percentageDisplaySpan.textContent = exampleValue;
            }
        });
        if (monthlyIncomeInput) monthlyIncomeInput.value = monthlyIncomeInput.value || 5000; // 示例收入
        monthlyIncome = parseFloat(monthlyIncomeInput.value) || 5000;
        updateBudgetPercentageDisplay();
        // 不直接保存，让用户确认后点击保存
        alert("已填入快速设置示例，请确认月收入后点击“保存设置”。");
    }

    function handleAddExpense() {
        if (!expenseDateInput || !expenseCategorySelect || !expenseAmountInput) return; // 只在记录页执行

        const date = expenseDateInput.value;
        const category = expenseCategorySelect.value;
        const amount = parseFloat(expenseAmountInput.value);
        const description = expenseDescriptionInput.value.trim();

        if (!date) {
            alert("请选择日期！");
            return;
        }
        if (isNaN(amount) || amount <= 0) {
            alert("请输入有效的消费金额！");
            return;
        }
        if (!category) {
            alert("请选择消费类别！");
            return;
        }
        if (Object.keys(actualBudgets).length === 0 || !actualBudgets[category]) {
            alert("请先在首页设置预算！");
            return;
        }

        expenses.push({ date, category, amount, description });
        saveData();
        alert("消费记录已添加！");
        
        // 清空表单
        expenseAmountInput.value = '';
        expenseDescriptionInput.value = '';
        // expenseDateInput.value = ''; // 可选，或设为当天
        
        renderBudgetStatus(); // 更新预算状态显示
    }

    // --- UI 渲染函数 ---
    function renderBudgetOverview() {
        if (!budgetOverviewContainer) return; // 只在首页执行
        if (Object.keys(actualBudgets).length === 0 || monthlyIncome === 0) {
            budgetOverviewContainer.innerHTML = "<p>请先完成初始设置并保存。</p>";
            return;
        }

        let html = `<h3>月收入: ￥${monthlyIncome.toFixed(2)}</h3>`;
        for (const category in actualBudgets) {
            if (actualBudgets.hasOwnProperty(category)) {
                const budgetAmount = parseFloat(actualBudgets[category]);
                const spent = getCategorySpent(category);
                const remaining = budgetAmount - spent;
                const progress = budgetAmount > 0 ? (spent / budgetAmount) * 100 : 0;

                html += `
                    <div class="category-overview">
                        <h4>${CATEGORIES[category]} (预算: ￥${budgetAmount.toFixed(2)})</h4>
                        <p>已消费: ￥${spent.toFixed(2)}</p>
                        <p>剩余: ￥${remaining.toFixed(2)}</p>
                        <div class="progress-bar-container">
                            <div class="progress-bar ${getProgressBarClass(progress, remaining, budgetAmount)}" style="width: ${Math.min(progress, 100)}%;">
                                ${Math.min(progress, 100).toFixed(0)}%
                            </div>
                        </div>
                    </div>
                `;
            }
        }
        budgetOverviewContainer.innerHTML = html;
    }

    function renderBudgetStatus() { // 用于记录消费页面
        if (!budgetStatusContainer) return; // 只在记录页执行
        if (Object.keys(actualBudgets).length === 0) {
            budgetStatusContainer.innerHTML = "<p>请先在首页设置预算。</p>";
            return;
        }

        let html = "";
        for (const category in actualBudgets) {
            // 通常储蓄不在这里显示为可消费项，除非有特殊逻辑
            if (actualBudgets.hasOwnProperty(category) && category !== 'savings') { 
                const budgetAmount = parseFloat(actualBudgets[category]);
                const spent = getCategorySpent(category);
                const remaining = budgetAmount - spent;
                const progress = budgetAmount > 0 ? (spent / budgetAmount) * 100 : 0;

                html += `
                    <div class="category-status">
                        <h4>${CATEGORIES[category]} (预算: ￥${budgetAmount.toFixed(2)})</h4>
                        <p>剩余: ￥${remaining.toFixed(2)}</p>
                        <div class="progress-bar-container">
                            <div class="progress-bar ${getProgressBarClass(progress, remaining, budgetAmount)}" style="width: ${Math.min(progress, 100)}%;">
                                ${Math.min(progress, 100).toFixed(0)}%
                            </div>
                        </div>
                        ${remaining < 0 ? '<p style="color:red;">已超支!</p>' : ''}
                        ${progress > 80 && progress <= 90 && remaining > 0 ? '<p style="color:orange;">预算接近临界!</p>' : ''}
                        ${progress > 90 && remaining > 0 ? '<p style="color:red;">预算即将用尽!</p>' : ''}
                    </div>
                `;
            }
        }
        budgetStatusContainer.innerHTML = html;
    }
    
    function getCategorySpent(category, monthYear = null) { // monthYear e.g., "2024-07"
        let totalSpent = 0;
        const currentMonthYear = monthYear || new Date().toISOString().slice(0, 7);

        expenses.forEach(expense => {
            if (expense.category === category && expense.date.startsWith(currentMonthYear)) {
                totalSpent += expense.amount;
            }
        });
        return totalSpent;
    }

    function getProgressBarClass(progress, remaining, budgetAmount) {
        if (budgetAmount <= 0) return ''; // 没有预算则无状态
        if (remaining < 0) return 'danger'; // 超支
        if (progress > 90) return 'danger'; // 红色：超过90%
        if (progress > 80) return 'warning'; // 黄色：超过80%
        return ''; // 绿色 (默认)
    }

    function renderSummaryPage() {
        if (!summaryTotalIncomeSpan) return; // 只在总结页执行

        const currentMonthYear = new Date().toISOString().slice(0, 7); // 例如 "2024-07"
        
        summaryTotalIncomeSpan.textContent = monthlyIncome.toFixed(2);

        let totalMonthExpense = 0;
        const categoryExpenses = {};
        for (const cat in CATEGORIES) { categoryExpenses[cat] = 0; }

        expenses.forEach(expense => {
            if (expense.date.startsWith(currentMonthYear)) {
                totalMonthExpense += expense.amount;
                if (categoryExpenses.hasOwnProperty(expense.category)) {
                    categoryExpenses[expense.category] += expense.amount;
                }
            }
        });

        summaryTotalExpenseSpan.textContent = totalMonthExpense.toFixed(2);
        const remainingBalance = monthlyIncome - totalMonthExpense;
        summaryTotalRemainingSpan.textContent = remainingBalance.toFixed(2);
        if (remainingBalance < 0) {
            summaryTotalRemainingSpan.classList.add('negative');
        } else {
            summaryTotalRemainingSpan.classList.remove('negative');
        }


        let categorySummaryHtml = "";
        const chartLabels = [];
        const chartData = [];
        const chartColors = []; // For pie chart

        const predefinedColors = ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40', '#C9CBCF'];


        let colorIndex = 0;
        for (const category in categoryExpenses) {
            if (CATEGORIES.hasOwnProperty(category)) {
                const spent = categoryExpenses[category];
                const percentage = totalMonthExpense > 0 ? (spent / totalMonthExpense * 100).toFixed(1) : 0;
                categorySummaryHtml += `
                    <div>
                        <strong>${CATEGORIES[category]}:</strong> ￥${spent.toFixed(2)} (${percentage}%)
                    </div>`;
                if (spent > 0) { // 只将有消费的类别加入图表
                    chartLabels.push(CATEGORIES[category]);
                    chartData.push(spent);
                    chartColors.push(predefinedColors[colorIndex % predefinedColors.length]);
                    colorIndex++;
                }
            }
        }
        categorySummaryContainer.innerHTML = categorySummaryHtml;

        // 渲染图表 (需要 Chart.js 或其他库)
        if (expenseChartCanvas && typeof Chart !== 'undefined') {
            // 销毁旧图表实例（如果存在）
            if (window.myExpenseChart instanceof Chart) {
                window.myExpenseChart.destroy();
            }
            const ctx = expenseChartCanvas.getContext('2d');
            window.myExpenseChart = new Chart(ctx, {
                type: 'pie', // 或 'bar'
                data: {
                    labels: chartLabels,
                    datasets: [{
                        label: '本月消费分布',
                        data: chartData,
                        backgroundColor: chartColors,
                        hoverOffset: 4
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false, // 可以调整图表大小
                    plugins: {
                        legend: {
                            position: 'top',
                        },
                        title: {
                            display: true,
                            text: '本月消费分布图'
                        }
                    }
                }
            });
        } else if (expenseChartCanvas) {
            expenseChartCanvas.parentElement.innerHTML = "<p>图表库 (例如 Chart.js) 未加载，无法显示图表。</p>";
        }
        
        // 消费建议 (简单示例)
        let suggestions = "消费情况良好。";
        if (totalMonthExpense > monthlyIncome) {
            suggestions = "注意！本月总支出已超出总收入，请检查各项开支。";
        } else {
            let highSpendingCategories = [];
            for (const category in categoryExpenses) {
                if (actualBudgets[category] && categoryExpenses[category] > parseFloat(actualBudgets[category])) {
                    highSpendingCategories.push(CATEGORIES[category]);
                }
            }
            if (highSpendingCategories.length > 0) {
                suggestions = `以下类别超出预算：${highSpendingCategories.join('、')}。建议下月调整预算或控制消费。`;
            }
        }
        suggestionText.textContent = suggestions;
    }


    // --- 新增：收入建议相关函数 ---
    function findMatchingIncomeLevelIndex(currentIncome) {
        if (currentIncome <= 0) return -1; // 无效收入

        let matchedIndex = -1;
        // 从最高级别开始匹配，找到第一个低于或等于用户收入的级别
        for (let i = incomeLevelsData.length - 1; i >= 0; i--) {
            if (currentIncome >= incomeLevelsData[i].minIncome) {
                matchedIndex = i;
                break;
            }
        }
        // 如果收入低于所有定义的最低级别，则匹配最低级别
        if (matchedIndex === -1 && incomeLevelsData.length > 0) {
            // matchedIndex = 0; // 或者返回-1表示无精确匹配，让调用者决定如何处理
            return -1; // 表示没有找到合适的级别，或者收入过低
        }
        return matchedIndex;
    }

    function getIncomeSuggestions() {
        const matchedIndex = findMatchingIncomeLevelIndex(monthlyIncome);
        if (matchedIndex === -1) {
            return []; // 没有匹配到或收入过低
        }

        const suggestionsToShow = [];
        // 添加匹配到的级别
        suggestionsToShow.push(incomeLevelsData[matchedIndex]);

        // 添加最多三个更低的级别
        for (let i = 1; i <= 3; i++) {
            const lowerIndex = matchedIndex - i;
            if (lowerIndex >= 0) {
                suggestionsToShow.push(incomeLevelsData[lowerIndex]);
            } else {
                break; // 没有更低的级别了
            }
        }
        return suggestionsToShow;
    }

    function renderIncomeLevelSuggestions() {
        if (!incomeSuggestionsContainer) return; // 只在首页执行

        if (monthlyIncome <= 0) {
            incomeSuggestionsContainer.innerHTML = "<p>请输入并保存您的月收入以查看建议。</p>";
            return;
        }

        const suggestions = getIncomeSuggestions();

        if (suggestions.length === 0) {
            incomeSuggestionsContainer.innerHTML = "<p>根据您当前的收入，暂无匹配的消费建议。或您的收入低于建议系统的最低标准。</p>";
            return;
        }

        let html = "";
        suggestions.forEach((levelData, index) => {
            let titlePrefix = "";
            if (index === 0) {
                titlePrefix = "当前匹配级别";
            } else {
                titlePrefix = `低 ${index} 级参考`;
            }

            html += `<div class="income-suggestion-level">`;
            html += `<h4>${titlePrefix} (级别 ${levelData.level} - 月收入参考: ￥${levelData.minIncome}+)</h4>`;
            html += `<div class="suggestion-details">`;

            for (const categoryKey in CATEGORIES) {
                if (levelData.percentages.hasOwnProperty(categoryKey) && levelData.advice.hasOwnProperty(categoryKey)) {
                    html += `<div class="suggestion-category-item">
                                <strong>${CATEGORIES[categoryKey]} (建议占比: ${levelData.percentages[categoryKey]}%)</strong>
                                <p>${levelData.advice[categoryKey]}</p>
                             </div>`;
                }
            }
            html += `</div></div>`; // close suggestion-details and income-suggestion-level
        });
        incomeSuggestionsContainer.innerHTML = html;
    }


    // --- 初始化和事件监听 ---
    function init() {
        loadData(); // 加载已有数据

        // 根据当前页面路径执行特定初始化
        const path = window.location.pathname.split("/").pop();

        if (path === 'index.html' || path === '') { // 首页
            if (monthlyIncomeInput) monthlyIncomeInput.value = monthlyIncome > 0 ? monthlyIncome : '';
            
            budgetPercentageSliders.forEach(slider => {
                const category = slider.dataset.category;
                if (budgetSettings[category] !== undefined) {
                    slider.value = budgetSettings[category];
                    // Update display span as well
                    const percentageDisplaySpan = document.getElementById(`percentage-display-${category}`);
                    if (percentageDisplaySpan) {
                        percentageDisplaySpan.textContent = budgetSettings[category];
                    }
                } else { // Ensure sliders for new categories (if any) default to 0
                    slider.value = 0;
                    const percentageDisplaySpan = document.getElementById(`percentage-display-${category}`);
                    if (percentageDisplaySpan) {
                        percentageDisplaySpan.textContent = 0;
                    }
                }
            });

            updateBudgetPercentageDisplay(); // 更新百分比和实际预算显示
            renderBudgetOverview(); // 渲染预算概览
            renderIncomeLevelSuggestions(); // 新增：页面加载时也尝试渲染建议

            if (saveSetupButton) saveSetupButton.addEventListener('click', handleSaveSetup);
            if (quickSetupButton) quickSetupButton.addEventListener('click', handleQuickSetup);
            if (monthlyIncomeInput) monthlyIncomeInput.addEventListener('input', updateBudgetPercentageDisplay);
            
            budgetPercentageSliders.forEach(slider => {
                slider.addEventListener('input', updateBudgetPercentageDisplay); // 'input' event for live updates
            });
        } else if (path === 'record.html') { // 记录页
            if (expenseDateInput) expenseDateInput.valueAsDate = new Date(); // 默认当天
            renderBudgetStatus();
            if (addExpenseButton) addExpenseButton.addEventListener('click', handleAddExpense);
        } else if (path === 'summary.html') { // 总结页
            renderSummaryPage();
        }
    }

    init(); // 页面加载时执行初始化
});