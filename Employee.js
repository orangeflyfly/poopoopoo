const Game = {
    money: 5000,
    employees: [],
    components: [],
    selectedEmp: null,
    
    init() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.resize();
        window.addEventListener('resize', () => this.resize());
        
        // 點擊偵測
        this.canvas.addEventListener('mousedown', (e) => this.handleClick(e));
        
        // 初始設備
        this.components.push(new OfficeComponent(Date.now(), 'PC', 200, 200));
        
        this.loop();
    },

    resize() {
        this.canvas.width = this.canvas.parentElement.clientWidth;
        this.canvas.height = this.canvas.parentElement.clientHeight;
    },

    recruit() {
        if (this.money >= 1000) {
            this.money -= 1000;
            const type = Math.random() > 0.5 ? 'IT' : 'Admin';
            const names = ['艾力克斯', '貝拉', '查理', '黛安娜'];
            const newEmp = new Employee(
                Date.now(), 
                names[Math.floor(Math.random()*names.length)],
                Math.random() * this.canvas.width,
                Math.random() * this.canvas.height,
                type
            );
            this.employees.push(newEmp);
            this.updateUI();
        }
    },

    buyPC() {
        if (this.money >= 500) {
            this.money -= 500;
            this.components.push(new OfficeComponent(Date.now(), 'PC', Math.random()*600+50, Math.random()*400+50));
            this.updateUI();
        }
    },

    // 修正部分：補上購置桌椅的邏輯
    buyDesk() {
        if (this.money >= 300) {
            this.money -= 300;
            // 這裡 type 必須為 'Desk' 才能觸發 Employee.js 裡的 Admin 邏輯判斷
            this.components.push(new OfficeComponent(Date.now(), 'Desk', Math.random()*600+50, Math.random()*400+50));
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
    },

    loop() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // 畫網格
        this.ctx.strokeStyle = '#334155';
        this.ctx.lineWidth = 0.5;
        for(let i=0; i<this.canvas.width; i+=50) {
            this.ctx.beginPath(); this.ctx.moveTo(i,0); this.ctx.lineTo(i,this.canvas.height); this.ctx.stroke();
        }

        this.components.forEach(c => c.draw(this.ctx));
        this.employees.forEach(e => {
            e.update(this.components);
            e.draw(this.ctx, e === this.selectedEmp);
        });

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
        document.getElementById('bar-stress').style.width = `${emp.stress * 5}%`;
    }
};

window.onload = () => Game.init();
