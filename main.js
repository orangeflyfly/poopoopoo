const Game = {
    money: 5000,
    employees: [],
    components: [],
    selectedEmp: null,

    // --- 遊戲狀態變數 ---
    gameHour: 8.0,
    timeSpeed: 0.001,
    projectProgress: 0,
    projectGoal: 100,
    projectReward: 5000,

    // --- 佈局與網格變數 ---
    gridSize: 50,
    officePadding: 60,

    // --- 新增：裝修模式相關變數 ---
    isEditMode: false,          // 是否處於裝修模式
    draggingComponent: null,    // 當前正在拖曳的元件
    dragOffset: { x: 0, y: 0 }, // 滑鼠點擊位置與元件左上角的偏移量
    originalPos: { x: 0, y: 0 }, // 拖曳前的原始位置（用於重疊時彈回）

    init() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.resize();
        window.addEventListener('resize', () => this.resize());
        
        // 註冊滑鼠事件
        this.canvas.addEventListener('mousedown', (e) => this.handleMouseDown(e));
        this.canvas.addEventListener('mousemove', (e) => this.handleMouseMove(e));
        this.canvas.addEventListener('mouseup', (e) => this.handleMouseUp(e));
        
        // 初始設備
        this.components.push(new OfficeComponent(Date.now(), 'Door', 50, 250));
        this.components.push(new OfficeComponent(Date.now() + 1, 'PC', 150, 150));
        this.components.push(new OfficeComponent(Date.now() + 2, 'Desk', 150, 250));
        
        this.loop();
    },

    resize() {
        this.canvas.width = this.canvas.parentElement.clientWidth;
        this.canvas.height = this.canvas.parentElement.clientHeight;
    },

    // --- 新增：切換裝修模式 ---
    toggleEditMode() {
        this.isEditMode = !this.isEditMode;
        const btn = document.getElementById('edit-mode-btn');
        const container = document.getElementById('game-container');

        if (this.isEditMode) {
            btn.innerText = "🛠️ 裝修模式：ON";
            btn.classList.add('active');
            container.classList.add('edit-mode-active');
            this.selectedEmp = null; // 進入裝修模式時取消選取員工
            UI.hidePanel();
        } else {
            btn.innerText = "🛠️ 裝修模式：OFF";
            btn.classList.remove('active');
            container.classList.remove('edit-mode-active');
            this.draggingComponent = null;
        }
    },

    // --- 修正：滑鼠按下邏輯 ---
    handleMouseDown(e) {
        const rect = this.canvas.getBoundingClientRect();
        const mx = e.clientX - rect.left;
        const my = e.clientY - rect.top;

        if (this.isEditMode) {
            // 裝修模式：優先偵測是否點擊到元件進行拖曳
            const hitComponent = this.components.find(c => 
                mx >= c.x && mx <= c.x + c.size &&
                my >= c.y && my <= c.y + c.size
            );

            if (hitComponent) {
                this.draggingComponent = hitComponent;
                this.originalPos = { x: hitComponent.x, y: hitComponent.y };
                this.dragOffset = { x: mx - hitComponent.x, y: my - hitComponent.y };
            }
        } else {
            // 一般模式：選取員工
            this.selectedEmp = this.employees.find(emp => 
                Math.sqrt((mx - emp.x)**2 + (my - emp.y)**2) < 20
            );
            
            if (this.selectedEmp) UI.showPanel(this.selectedEmp);
            else UI.hidePanel();
        }
    },

    // --- 新增：滑鼠移動邏輯（實現拖曳與網格吸附） ---
    handleMouseMove(e) {
        if (!this.isEditMode || !this.draggingComponent) return;

        const rect = this.canvas.getBoundingClientRect();
        const mx = e.clientX - rect.left;
        const my = e.clientY - rect.top;

        // 計算新座標並即時對齊網格
        let newX = mx - this.dragOffset.x;
        let newY = my - this.dragOffset.y;

        // 網格吸附邏輯
        this.draggingComponent.x = Math.round(newX / this.gridSize) * this.gridSize;
        this.draggingComponent.y = Math.round(newY / this.gridSize) * this.gridSize;
    },

    // --- 新增：滑鼠鬆開邏輯（碰撞檢查） ---
    handleMouseUp(e) {
        if (!this.isEditMode || !this.draggingComponent) return;

        // 檢查放置位置是否與其他元件重疊
        const isOverlap = this.components.some(c => 
            c !== this.draggingComponent && 
            c.x === this.draggingComponent.x && 
            c.y === this.draggingComponent.y
        );

        // 如果重疊，彈回原始位置
        if (isOverlap) {
            this.draggingComponent.x = this.originalPos.x;
            this.draggingComponent.y = this.originalPos.y;
            console.log("位置重疊，元件已彈回！");
        }

        this.draggingComponent = null;
    },

    getValidPosition() {
        let x, y, isOverlap;
        let attempts = 0;
        const maxAttempts = 100;

        do {
            const cols = Math.floor((this.canvas.width - this.officePadding * 2) / this.gridSize);
            const rows = Math.floor((this.canvas.height - this.officePadding * 2) / this.gridSize);
            const col = Math.floor(Math.random() * cols);
            const row = Math.floor(Math.random() * rows);
            
            x = this.officePadding + col * this.gridSize;
            y = this.officePadding + row * this.gridSize;

            isOverlap = this.components.some(c => 
                Math.abs(c.x - x) < this.gridSize && Math.abs(c.y - y) < this.gridSize
            );
            attempts++;
        } while (isOverlap && attempts < maxAttempts);

        return { x, y };
    },

    recruit() {
        if (this.money >= 1000) {
            this.money -= 1000;
            const type = Math.random() > 0.5 ? 'IT' : 'Admin';
            const names = ['艾力克斯', '貝拉', '查理', '黛安娜', '愛德華'];
            const doorPos = this.getDoorPosition();
            
            const newEmp = new Employee(
                Date.now(), 
                names[Math.floor(Math.random() * names.length)],
                doorPos.x,
                doorPos.y,
                type
            );
            this.employees.push(newEmp);
            this.updateUI();
        }
    },

    getDoorPosition() {
        const door = this.components.find(c => c.type === 'Door');
        return door ? { x: door.x, y: door.y } : { x: 50, y: 50 };
    },

    buyPC() {
        if (this.money >= 500) {
            const pos = this.getValidPosition();
            this.money -= 500;
            this.components.push(new OfficeComponent(Date.now(), 'PC', pos.x, pos.y));
            this.updateUI();
        }
    },

    buyDesk() {
        if (this.money >= 300) {
            const pos = this.getValidPosition();
            this.money -= 300;
            this.components.push(new OfficeComponent(Date.now(), 'Desk', pos.x, pos.y));
            this.updateUI();
        }
    },

    buyGym() {
        if (this.money >= 800) {
            const pos = this.getValidPosition();
            this.money -= 800;
            this.components.push(new OfficeComponent(Date.now(), 'Gym', pos.x, pos.y));
            this.updateUI();
        }
    },

    buyDoor() {
        if (this.money >= 500) {
            const pos = this.getValidPosition();
            this.money -= 500;
            this.components.push(new OfficeComponent(Date.now(), 'Door', pos.x, pos.y));
            this.updateUI();
        }
    },

    updateUI() {
        document.getElementById('money-display').innerText = Math.floor(this.money);
        document.getElementById('staff-count').innerText = this.employees.length;
        
        if(document.getElementById('game-time')) {
            const h = Math.floor(this.gameHour);
            const m = Math.floor((this.gameHour % 1) * 60);
            document.getElementById('game-time').innerText = `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
        }
        if(document.getElementById('project-progress')) {
            document.getElementById('project-progress').style.width = `${this.projectProgress}%`;
        }
    },

    handleProjects() {
        // 如果是裝修模式，暫停專案進度
        if (this.isEditMode) return;

        this.employees.forEach(emp => {
            if (emp.state === 'WORKING' && emp.target && emp.target.type === 'PC') {
                this.projectProgress += (emp.iq / 1000);
            }
        });

        if (this.projectProgress >= this.projectGoal) {
            this.money += this.projectReward;
            this.projectProgress = 0; 
            this.updateUI();
        }
    },

    loop() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // 1. 更新遊戲時間 (裝修模式時時間停止)
        if (!this.isEditMode) {
            this.gameHour += this.timeSpeed;
            if (this.gameHour >= 24) this.gameHour = 0;
        }

        // 2. 畫網格背景
        this.ctx.strokeStyle = '#334155';
        this.ctx.lineWidth = 0.5;
        for(let i=0; i<this.canvas.width; i+=this.gridSize) {
            this.ctx.beginPath(); this.ctx.moveTo(i,0); this.ctx.lineTo(i,this.canvas.height); this.ctx.stroke();
        }
        for(let j=0; j<this.canvas.height; j+=this.gridSize) {
            this.ctx.beginPath(); this.ctx.moveTo(0,j); this.ctx.lineTo(this.canvas.width,j); this.ctx.stroke();
        }

        // 3. 繪製設備
        this.components.forEach(c => {
            // 如果是正在拖曳的元件，畫一個發光效果
            if (c === this.draggingComponent) {
                this.ctx.shadowBlur = 15;
                this.ctx.shadowColor = '#ec4899';
            }
            c.draw(this.ctx);
            this.ctx.shadowBlur = 0;
        });

        // 4. 更新並繪製員工
        this.employees.forEach(e => {
            // 如果是裝修模式，員工可以選擇原地踏步或繼續工作，這裡我們讓他們繼續，
            // 這樣你可以即時測試搬動設備後，員工路徑的自動修正。
            e.update(this.components, this.gameHour);
            e.draw(this.ctx, e === this.selectedEmp);
        });

        // 5. 處理專案邏輯
        this.handleProjects();

        // 6. 更新 UI 與面板
        this.updateUI();
        if (this.selectedEmp) UI.updatePanel(this.selectedEmp);
        
        requestAnimationFrame(() => this.loop());
    }
};

const UI = {
    showPanel(emp) {
        document.getElementById('info-panel').classList.remove('hidden');
        document.getElementById('p-name').innerText = emp.name;
        document.getElementById('p-specialty').innerText = `專業：${emp.specialty}`;
    },
    hidePanel() {
        document.getElementById('info-panel').classList.add('hidden');
    },
    updatePanel(emp) {
        document.getElementById('bar-iq').style.width = `${Math.min(emp.iq, 100)}%`;
        document.getElementById('bar-eff').style.width = `${Math.min(emp.eff, 100)}%`;
        if(document.getElementById('bar-stress')) {
            document.getElementById('bar-stress').style.width = `${Math.min(emp.stress, 100)}%`;
        }
        if(document.getElementById('bar-stamina')) {
            document.getElementById('bar-stamina').style.width = `${(emp.stamina / emp.maxStamina) * 100}%`;
        }
    }
};

window.onload = () => Game.init();
