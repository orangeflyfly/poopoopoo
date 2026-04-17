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

        // --- 行為決策與對話變數 ---
        this.stateTimer = 0;        
        this.currentSpeech = "";    
        this.speechTimer = 0;       
        this.socialCooldown = 0;    // 社交冷卻時間
    }

    /**
     * 隨機合成對話系統
     * @param {string} type 狀態類型
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
        } else if (type === 'CHATTING') {
            // 聊天時隨機從聊天或開爛詞庫抽取
            const pool = ["CHATTING", "SLACKING"];
            const selected = pool[Math.floor(Math.random() * pool.length)];
            action = chunks[selected] ? chunks[selected][Math.floor(Math.random() * chunks[selected].length)] : "聊點什麼";
            detail = chunks[selected + "_ACTION"] ? chunks[selected + "_ACTION"][Math.floor(Math.random() * chunks[selected + "_ACTION"].length)] : "...";
        } else {
            action = chunks.SLACKING[Math.floor(Math.random() * chunks.SLACKING.length)];
            detail = chunks.SLACKING_ACTION[Math.floor(Math.random() * chunks.SLACKING_ACTION.length)];
        }

        return `${intro}${action}${detail}${outro}`;
    }

    /**
     * 社交偵測邏輯：尋找附近是否有同伴並開啟對話
     */
    checkSocial(allEmployees) {
        // 下班、趕路或冷卻中不社交
        if (this.socialCooldown > 0 || this.state === 'OFF_WORK' || this.state === 'GOING_HOME') return;

        // 尋找 40 像素內的同伴 (排除自己、下班者與冷卻中的人)
        const neighbor = allEmployees.find(other => {
            if (other === this || other.state === 'OFF_WORK' || other.socialCooldown > 0) return false;
            const d = Math.sqrt((other.x - this.x)**2 + (other.y - this.y)**2);
            return d < 40; 
        });

        // 根據雙方社交機率進行「握手」
        if (neighbor) {
            const chance = (this.traits.chatChance + neighbor.traits.chatChance) / 2;
            if (Math.random() < chance) {
                this.startChat(neighbor);
                neighbor.startChat(this);
            }
        }
    }

    /**
     * 開始聊天狀態
     */
    startChat(partner) {
        this.state = 'CHATTING';
        this.target = null;
        this.stateTimer = 120 + Math.random() * 100; // 聊天持續時間
        this.socialCooldown = 600; // 聊完後冷卻 10 秒
        
        this.currentSpeech = this.generateSentence('CHATTING');
        this.speechTimer = 100;

        // 根據性格調整聊天後的影響
        if (this.traitName === "社交") {
            this.stress = Math.max(0, this.stress - 5); // 社交達人聊天減壓
        } else if (this.traitName === "勤奮") {
            this.stress += 2; // 勤奮的人覺得被打擾，壓力微升
        }
    }

    update(components, currentHour, allEmployees) {
        const isWorkTime = currentHour >= 8 && currentHour < 17;
        
        // 計時器遞減
        if (this.stateTimer > 0) this.stateTimer--;
        if (this.speechTimer > 0) this.speechTimer--;
        if (this.socialCooldown > 0) this.socialCooldown--;

        // 狀態重置邏輯
        if (isWorkTime && this.state === 'OFF_WORK') {
            this.state = 'IDLE';
        }

        if (!isWorkTime && this.state !== 'OFF_WORK') {
            this.state = 'GOING_HOME';
        }

        // 只有在計時器歸零時，才進行下一次決策
        if (this.stateTimer <= 0) {
            // 如果不在工作中，嘗試社交
            if (this.state !== 'WORKING' && this.state !== 'TRAINING') {
                this.checkSocial(allEmployees);
            }

            // 如果沒進入聊天狀態，才進行一般思考
            if (this.state !== 'CHATTING') {
                this.think(components, isWorkTime);
            }
        }

        this.move();
        
        if (this.state === 'OFF_WORK') {
            this.stamina = Math.min(this.maxStamina, this.stamina + 0.5); 
        }
    }

    think(components, isWorkTime) {
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

        // 性格決策：計算開爛欲望
        const slackDesire = (100 - this.stamina) * this.traits.slackWeight + (Math.random() * 20);
        
        if (slackDesire > 70 && isWorkTime) {
            this.state = 'SLACKING'; 
            this.target = null;
            this.stateTimer = 180 + Math.random() * 200; 
            
            if (Math.random() < this.traits.chatChance + 0.2) {
                this.currentSpeech = this.generateSentence('SLACKING');
                this.speechTimer = 120;
            }
            return;
        }

        if (this.stamina < 15 && isWorkTime) {
            this.state = 'TRAINING';
            const gym = components.find(c => c.type === 'Gym');
            this.target = gym || components[Math.floor(Math.random() * components.length)];
            return;
        }

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
                
                if (Math.random() < 0.05) {
                    this.currentSpeech = this.generateSentence('WORKING');
                    this.speechTimer = 100;
                }
            } else {
                this.state = 'IDLE';
                this.stateTimer = 60;
            }
        }
    }

    move() {
        // 聊天、開爛與下班時不移動
        if (this.state === 'OFF_WORK' || this.state === 'SLACKING' || this.state === 'CHATTING') return;
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
                this.stress += 0.02 * this.traits.stressGain;
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
        
        if (isSelected) {
            ctx.shadowBlur = 15;
            ctx.shadowColor = this.traits.color;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius + 5, 0, Math.PI * 2);
            ctx.strokeStyle = this.traits.color;
            ctx.lineWidth = 3;
            ctx.stroke();
        }

        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = this.traits.color; 
        ctx.fill();
        ctx.strokeStyle = 'white';
        ctx.lineWidth = 2;
        ctx.stroke();

        const barW = 24;
        ctx.fillStyle = '#334155';
        ctx.fillRect(this.x - barW/2, this.y - 20, barW, 4);
        ctx.fillStyle = this.stamina < 20 ? '#f87171' : '#4ade80';
        ctx.fillRect(this.x - barW/2, this.y - 20, barW * (this.stamina / this.maxStamina), 4);

        ctx.fillStyle = "white";
        ctx.font = "10px Arial";
        ctx.textAlign = "center";
        ctx.fillText(`${this.name} (${this.traitName})`, this.x, this.y + 25);

        let emoji = "";
        if (this.state === 'GOING_HOME') emoji = "🏃";
        else if (this.stamina < 15) emoji = "😫";
        else if (this.state === 'SLACKING') emoji = "🚬";
        else if (this.state === 'WORKING') emoji = "💻";
        else if (this.state === 'TRAINING') emoji = "💪";
        else if (this.state === 'CHATTING') emoji = "💬";

        if (emoji) {
            ctx.font = '16px Arial';
            ctx.fillText(emoji, this.x, this.y - 28);
        }

        if (this.speechTimer > 0 && this.currentSpeech) {
            ctx.font = '12px Microsoft JhengHei';
            const textWidth = ctx.measureText(this.currentSpeech).width;
            ctx.fillStyle = "rgba(0,0,0,0.7)";
            ctx.fillRect(this.x - textWidth/2 - 5, this.y - 55, textWidth + 10, 20);
            ctx.fillStyle = "white";
            ctx.fillText(this.currentSpeech, this.x, this.y - 41);
        }

        ctx.restore();
    }
}
