const Game = {
    money: 5000,
    employees: [],
    components: [],
    selectedEmp: null,

    // --- 調整與新增變數 ---
    gameHour: 8.0,           // 遊戲從早上 8 點開始
    timeSpeed: 0.001,        // 修正 3：時間流速調慢 (原本 0.005 太快)
    projectProgress: 0,      
    projectGoal: 100,        
    projectReward: 5000,     
    
    // 修正 4 & 5：定義網格大小與佈局範圍
    gridSize: 50,            // 網格大小 50x50
    officePadding: 60,       // 離邊界的距離

    init() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.resize();
        window.addEventListener('resize', () => this.resize());
        
        // 點擊偵測
        this.canvas.addEventListener('mousedown', (e) => this.handleClick(e));
        
        // 初始設備：使用網格對齊的位置
        this.components.push(new OfficeComponent(Date.now(), 'Door', 50, 250));
        this.components.push(new OfficeComponent(Date.now() + 1, 'PC', 150, 150));
        this.components.push(new OfficeComponent(Date.now() + 2, 'Desk', 150, 250));
        
        this.loop();
    },

    resize() {
        this.canvas.width = this.canvas.parentElement.clientWidth;
        this.canvas.height = this.canvas.parentElement.clientHeight;
    },

    // 修正 4 & 5：核心邏輯 - 尋找不重疊且對齊網格的座標
    getValidPosition() {
        let x, y, isOverlap;
        let attempts = 0;
        const maxAttempts = 100;

        do {
            // 計算畫布內可用的網格區域
            const cols = Math.floor((this.canvas.width - this.officePadding * 2) / this.gridSize);
            const rows = Math.floor((this.canvas.height - this.officePadding * 2) / this.gridSize);
            
            // 隨機選取一個網格點並對齊
            const col = Math.floor(Math.random() * cols);
            const row = Math.floor(Math.random() * rows);
            
            x = this.officePadding + col * this.gridSize;
            y = this.officePadding + row * this.gridSize;

            // 檢查該座標是否已經有其他元件
            isOverlap = this.components.some(c => 
                Math.abs(c.x - x) < this.gridSize && Math.abs(c.y - y) < this.gridSize
            );

            attempts++;
        } while (isOverlap && attempts < maxAttempts);

        return { x, y };
    },

    // 招募員工：從門口進來
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
        // 取得第一個門的位置，如果沒門則預設
        const door = this.components.find(c => c.type === 'Door');
        return door ? { x: door.x, y: door.y } : { x: 50, y: 50 };
    },

    // 購買電腦：使用網格對齊邏輯
    buyPC() {
        if (this.money >= 500) {
            const pos = this.getValidPosition();
            this.money -= 500;
            this.components.push(new OfficeComponent(Date.now(), 'PC', pos.x, pos.y));
            this.updateUI();
        }
    },

    // 購買辦公桌：使用網格對齊邏輯
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

    handleClick(e) {
        const rect = this.canvas.getBoundingClientRect();
        const mx = e.clientX - rect.left;
        const my = e.clientY - rect.top;

        this.selectedEmp = this.employees.find(emp => 
            Math.sqrt((mx - emp.x)**2 + (my - emp.y)**2) < 20
        );
        
        if (this.selectedEmp) UI.showPanel(this.selectedEmp);
        else UI.hidePanel();
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
        this.employees.forEach(emp => {
            // 只有正在工作且對象是 PC 的 IT 員能產出進度
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
        
        // 1. 更新遊戲時間：調慢後的流速
        this.gameHour += this.timeSpeed;
        if (this.gameHour >= 24) {
            this.gameHour = 0; 
        }

        // 2. 畫網格背景：視覺上對齊 gridSize
        this.ctx.strokeStyle = '#334155';
        this.ctx.lineWidth = 0.5;
        for(let i=0; i<this.canvas.width; i+=this.gridSize) {
            this.ctx.beginPath(); this.ctx.moveTo(i,0); this.ctx.lineTo(i,this.canvas.height); this.ctx.stroke();
        }
        for(let j=0; j<this.canvas.height; j+=this.gridSize) {
            this.ctx.beginPath(); this.ctx.moveTo(0,j); this.ctx.lineTo(this.canvas.width,j); this.ctx.stroke();
        }

        // 3. 繪製所有設備
        this.components.forEach(c => c.draw(this.ctx));

        // 4. 更新並繪製員工
        this.employees.forEach(e => {
            // 修正：現在傳入 currentHour，Employee.js 內的鎖定邏輯會生效
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
