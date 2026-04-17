class Employee {
    constructor(id, name, x, y, specialty, traitName = "勤奮") {
        this.id = id;
        this.name = name;
        this.x = x;
        this.y = y;
        this.specialty = specialty; 
        
        // --- 靈魂注入：從 Config 讀取性格 DNA ---
        this.traitName = traitName;
        const traitData = GAME_CONFIG.TRAITS[traitName] || GAME_CONFIG.TRAITS["勤奮"];
        this.traits = traitData; 

        // 核心屬性 (受性格影響初始值)
        this.iq = 10 + Math.random() * 20;
        this.eff = 10 + Math.random() * 20;
        this.stamina = 100;         
        this.maxStamina = 100;      
        this.stress = 0;
        
        // 狀態與行為控制
        this.state = 'IDLE';        
        this.target = null;
        this.speed = 1.2 + (this.eff / 100);
        this.radius = 12;

        // --- 新增：行為決策變數 ---
        this.stateTimer = 0;        // 狀態計時器，確保行為有持續性 (不抽筋)
        this.currentSpeech = "";    // 當前說的話
        this.speechTimer = 0;       // 話語顯示時間
    }

    /**
     * 隨機合成對話系統
     * @param {string} type 狀態類型 (WORKING, SLACKING, etc.)
     */
    generateSentence(type) {
        const chunks = GAME_CONFIG.DIALOGUE_CHUNKS;
        const intro = chunks.INTRO[Math.floor(Math.random() * chunks.INTRO.length)];
        const outro = chunks.OUTRO[Math.floor(Math.random() * chunks.OUTRO.length)];
        
        let action = "";
        let detail = "";

        if (type === 'WORKING') {
            action = chunks.WORKING[Math.floor(Math.random() * chunks.WORKING.length)];
            detail = chunks.WORKING_ACTION[Math.floor(Math.random() * chunks.WORKING_ACTION.length)];
        } else {
            action = chunks.SLACKING[Math.floor(Math.random() * chunks.SLACKING.length)];
            detail = chunks.SLACKING_ACTION[Math.floor(Math.random() * chunks.SLACKING_ACTION.length)];
        }

        return `${intro}${action}${detail}${outro}`;
    }

    update(components, currentHour) {
        const isWorkTime = currentHour >= 8 && currentHour < 17;
        
        // 計時器遞減
        if (this.stateTimer > 0) this.stateTimer--;
        if (this.speechTimer > 0) this.speechTimer--;

        // 狀態重置邏輯
        if (isWorkTime && this.state === 'OFF_WORK') {
            this.state = 'IDLE';
        }

        if (!isWorkTime && this.state !== 'OFF_WORK') {
            this.state = 'GOING_HOME';
        }

        // 只有在計時器歸零時，才進行下一次「思考」
        if (this.stateTimer <= 0) {
            this.think(components, isWorkTime);
        }

        this.move();
        
        if (this.state === 'OFF_WORK') {
            this.stamina = Math.min(this.maxStamina, this.stamina + 0.5); 
        }
    }

    think(components, isWorkTime) {
        // 1. 下班優先
        if (this.state === 'GOING_HOME') {
            const doors = components.filter(c => c.type === 'Door');
            if (doors.length > 0) {
                this.target = doors.reduce((prev, curr) => {
                    const distPrev = Math.sqrt((prev.x-this.x)**2 + (prev.y-this.y)**2);
                    const distCurr = Math.sqrt((curr.x-this.x)**2 + (curr.y-this.y)**2);
                    return distCurr < distPrev ? curr : prev;
                });
            }
            return;
        }

        if (this.state === 'OFF_WORK') return;

        // --- 性格決策：計算開爛欲望 ---
        // 懶散權重越高，體力還很高的時候就會想開爛
        const slackDesire = (100 - this.stamina) * this.traits.slackWeight + (Math.random() * 20);
        
        if (slackDesire > 70 && isWorkTime) {
            this.state = 'SLACKING'; // 進入「開爛」狀態
            this.target = null;
            this.stateTimer = 180 + Math.random() * 200; // 爛在原地一段時間
            
            // 有機率說話
            if (Math.random() < this.traits.chatChance + 0.2) {
                this.currentSpeech = this.generateSentence('SLACKING');
                this.speechTimer = 120;
            }
            return;
        }

        // 2. 體力過低強制訓練 (不受性格影響，這是生存本能)
        if (this.stamina < 15 && isWorkTime) {
            this.state = 'TRAINING';
            const gym = components.find(c => c.type === 'Gym');
            this.target = gym || components[Math.floor(Math.random() * components.length)];
            return;
        }

        // 3. 正常工作邏輯 (受工作意願權重影響)
        if (!this.target && isWorkTime) {
            const workChance = Math.random() * this.traits.workWeight;
            if (workChance > 0.3) {
                this.state = 'WORKING';
                const matched = components.filter(c => 
                    (this.specialty === 'IT' && c.type === 'PC') || 
                    (this.specialty === 'Admin' && c.type === 'Desk')
                );
                this.target = matched.length > 0 
                    ? matched[Math.floor(Math.random() * matched.length)]
                    : components.find(c => c.type === 'PC' || c.type === 'Desk');
                
                // 工作時也有機率自言自語
                if (Math.random() < 0.05) {
                    this.currentSpeech = this.generateSentence('WORKING');
                    this.speechTimer = 100;
                }
            } else {
                this.state = 'IDLE';
                this.stateTimer = 60; // 發呆一下再決定
            }
        }
    }

    move() {
        if (this.state === 'OFF_WORK' || this.state === 'SLACKING') return;
        if (!this.target) return;

        const dx = (this.target.x + 20) - this.x;
        const dy = (this.target.y + 20) - this.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist > 5) {
            const staminaFactor = this.stamina > 0 ? (this.stamina / 100) * 0.5 + 0.5 : 0.2;
            this.x += (dx / dist) * this.speed * staminaFactor;
            this.y += (dy / dist) * this.speed * staminaFactor;
        } else {
            this.interact();
        }
    }

    interact() {
        if (!this.target) return;

        switch (this.target.type) {
            case 'PC':
                this.iq += 0.05;
                this.stamina -= 0.1;
                this.stress += 0.02 * this.traits.stressGain; // 壓力累積受性格影響
                break;
            case 'Desk':
                this.eff += 0.05;
                this.stamina -= 0.08;
                this.stress += 0.01 * this.traits.stressGain;
                break;
            case 'Gym':
                this.stamina += 0.3;
                this.maxStamina += 0.01;
                if (this.stamina >= this.maxStamina) {
                    this.stamina = this.maxStamina;
                    this.target = null;
                }
                break;
            case 'Door':
                if (this.state === 'GOING_HOME') {
                    this.state = 'OFF_WORK';
                    this.x = this.target.x;
                    this.y = this.target.y;
                    this.target = null;
                }
                break;
        }

        if (this.stress > 60 || this.stamina <= 0) {
            this.target = null;
            this.state = 'IDLE';
            this.stateTimer = 120;
        }
    }

    draw(ctx, isSelected) {
        if (this.state === 'OFF_WORK') return;

        ctx.save();
        
        // 1. 繪製選中效果
        if (isSelected) {
            ctx.shadowBlur = 15;
            ctx.shadowColor = this.traits.color;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius + 5, 0, Math.PI * 2);
            ctx.strokeStyle = this.traits.color;
            ctx.lineWidth = 3;
            ctx.stroke();
        }

        // 2. 繪製身體 (顏色現在反映性格)
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = this.traits.color; 
        ctx.fill();
        ctx.strokeStyle = 'white';
        ctx.lineWidth = 2;
        ctx.stroke();

        // 3. 繪製體力條
        const barW = 24;
        ctx.fillStyle = '#334155';
        ctx.fillRect(this.x - barW/2, this.y - 20, barW, 4);
        ctx.fillStyle = this.stamina < 20 ? '#f87171' : '#4ade80';
        ctx.fillRect(this.x - barW/2, this.y - 20, barW * (this.stamina / this.maxStamina), 4);

        // 4. 繪製名字與性格標籤
        ctx.fillStyle = "white";
        ctx.font = "10px Arial";
        ctx.textAlign = "center";
        ctx.fillText(`${this.name} (${this.traitName})`, this.x, this.y + 25);

        // 5. --- 情緒氣泡與對話系統 ---
        let emoji = "";
        if (this.state === 'GOING_HOME') emoji = "🏃";
        else if (this.stamina < 15) emoji = "😫";
        else if (this.state === 'SLACKING') emoji = "🚬";
        else if (this.state === 'WORKING') emoji = "💻";
        else if (this.state === 'TRAINING') emoji = "💪";

        // 顯示 Emoji
        if (emoji) {
            ctx.font = '16px Arial';
            ctx.fillText(emoji, this.x, this.y - 28);
        }

        // 顯示合成對話 (如果有)
        if (this.speechTimer > 0 && this.currentSpeech) {
            ctx.font = '12px Microsoft JhengHei';
            const textWidth = ctx.measureText(this.currentSpeech).width;
            
            // 對話框背景
            ctx.fillStyle = "rgba(0,0,0,0.7)";
            ctx.fillRect(this.x - textWidth/2 - 5, this.y - 55, textWidth + 10, 20);
            
            // 對話文字
            ctx.fillStyle = "white";
            ctx.fillText(this.currentSpeech, this.x, this.y - 41);
        }

        ctx.restore();
    }
}
