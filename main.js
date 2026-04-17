const Game = {
    money: 5000,
    employees: [],
    components: [],
    selectedEmp: null,

    // --- 新增：遊戲時間與專案系統變數 ---
    gameHour: 8.0,           // 遊戲從早上 8 點開始
    timeSpeed: 0.005,        // 時間流逝速度
    projectProgress: 0,      // 當前專案進度 (0-100)
    projectGoal: 100,        // 專案目標
    projectReward: 5000,     // 完成專案後的獎金

    init() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.resize();
        window.addEventListener('resize', () => this.resize());
        
        // 點擊偵測
        this.canvas.addEventListener('mousedown', (e) => this.handleClick(e));
        
        // 初始設備：給予一個初始的門、一台電腦與一張桌子
        this.components.push(new OfficeComponent(Date.now(), 'Door', 50, 250));
        this.components.push(new OfficeComponent(Date.now() + 1, 'PC', 200, 200));
        this.components.push(new OfficeComponent(Date.now() + 2, 'Desk', 200, 350));
        
        this.loop();
    },

    resize() {
        this.canvas.width = this.canvas.parentElement.clientWidth;
        this.canvas.height = this.canvas.parentElement.clientHeight;
    },

    // 招募員工
    recruit() {
        if (this.money >= 1000) {
            this.money -= 1000;
            const type = Math.random() > 0.5 ? 'IT' : 'Admin';
            const names = ['艾力克斯', '貝拉', '查理', '黛安娜', '愛德華'];
            const newEmp = new Employee(
                Date.now(), 
                names[Math.floor(Math.random() * names.length)],
                // 員工從「門」的位置進入公司，如果沒門就在左側生成
                this.getDoorPosition().x,
                this.getDoorPosition().y,
                type
            );
            this.employees.push(newEmp);
            this.updateUI();
        }
    },

    // 取得門的位置邏輯
    getDoorPosition() {
        const door = this.components.find(c => c.type === 'Door');
        return door ? { x: door.x, y: door.y } : { x: 50, y: 50 };
    },

    // 購買電腦
    buyPC() {
        if (this.money >= 500) {
            this.money -= 500;
            this.components.push(new OfficeComponent(Date.now(), 'PC', Math.random() * (this.canvas.width - 100) + 50, Math.random() * (this.canvas.height - 150) + 50));
            this.updateUI();
        }
    },

    // 購買辦公桌
    buyDesk() {
        if (this.money >= 300) {
            this.money -= 300;
            this.components.push(new OfficeComponent(Date.now(), 'Desk', Math.random() * (this.canvas.width - 100) + 50, Math.random() * (this.canvas.height - 150) + 50));
            this.updateUI();
        }
    },

    // --- 新增：購買健身房 ---
    buyGym() {
        if (this.money >= 800) {
            this.money -= 800;
            this.components.push(new OfficeComponent(Date.now(), 'Gym', Math.random() * (this.canvas.width - 100) + 50, Math.random() * (this.canvas.height - 150) + 50));
            this.updateUI();
        }
    },

    // --- 新增：購買門 (如果玩家想換位置) ---
    buyDoor() {
        if (this.money >= 500) {
            this.money -= 500;
            this.components.push(new OfficeComponent(Date.now(), 'Door', Math.random() * (this.canvas.width - 100) + 50, Math.random() * (this.canvas.height - 150) + 50));
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
        
        // 更新時間與專案進度顯示 (假設 index.html 有這些 ID)
        if(document.getElementById('game-time')) {
            const h = Math.floor(this.gameHour);
            const m = Math.floor((this.gameHour % 1) * 60);
            document.getElementById('game-time').innerText = `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
        }
        if(document.getElementById('project-progress')) {
            document.getElementById('project-progress').style.width = `${this.projectProgress}%`;
        }
    },

    // --- 新增：處理專案進度與賺錢 ---
    handleProjects() {
        this.employees.forEach(emp => {
            // 只有正在用電腦的 IT 人員能推進專案
            if (emp.state === 'WORKING' && emp.target && emp.target.type === 'PC') {
                // 進度增加量取決於員工智力 (IQ)
                this.projectProgress += (emp.iq / 1000);
            }
        });

        // 專案完成
        if (this.projectProgress >= this.projectGoal) {
            this.money += this.projectReward;
            this.projectProgress = 0; // 重置專案，準備下一個
            this.updateUI();
            console.log("專案完成！獲得獎金:", this.projectReward);
        }
    },

    loop() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // 1. 更新遊戲時間
        this.gameHour += this.timeSpeed;
        if (this.gameHour >= 24) {
            this.gameHour = 0; // 進入第二天
        }

        // 2. 畫網格背景
        this.ctx.strokeStyle = '#334155';
        this.ctx.lineWidth = 0.5;
        for(let i=0; i<this.canvas.width; i+=50) {
            this.ctx.beginPath(); this.ctx.moveTo(i,0); this.ctx.lineTo(i,this.canvas.height); this.ctx.stroke();
        }

        // 3. 繪製所有設備
        this.components.forEach(c => c.draw(this.ctx));

        // 4. 更新並繪製所有員工
        this.employees.forEach(e => {
            // 傳入當前的小時，讓員工決定要上班、工作還是下班
            e.update(this.components, Math.floor(this.gameHour));
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
        // 壓力條與體力條更新
        if(document.getElementById('bar-stress')) {
            document.getElementById('bar-stress').style.width = `${Math.min(emp.stress, 100)}%`;
        }
        if(document.getElementById('bar-stamina')) {
            document.getElementById('bar-stamina').style.width = `${(emp.stamina / emp.maxStamina) * 100}%`;
        }
    }
};

window.onload = () => Game.init();
