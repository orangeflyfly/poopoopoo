class Employee {
    constructor(id, name, x, y, specialty) {
        this.id = id;
        this.name = name;
        this.x = x;
        this.y = y;
        this.specialty = specialty; // 'IT', 'Admin'
        
        // 核心屬性
        this.iq = 10 + Math.random() * 20;
        this.eff = 10 + Math.random() * 20;
        this.stamina = 100;         // 當前體力
        this.maxStamina = 100;      // 體力上限 (可透過健身房提升)
        this.stress = 0;
        
        // 狀態與行為控制
        this.state = 'IDLE';        // IDLE, WORKING, TRAINING, RESTING, GOING_HOME, OFF_WORK
        this.target = null;
        this.speed = 1.2 + (this.eff / 100);
        this.radius = 12;
    }

    /**
     * @param {Array} components 所有的設備清單
     * @param {number} currentHour 當前遊戲小時 (0-23)
     */
    update(components, currentHour) {
        const isWorkTime = currentHour >= 8 && currentHour < 17;
        
        // 修正：如果是上班時間且目前是下班狀態，則重置狀態準備上班
        if (isWorkTime && this.state === 'OFF_WORK') {
            this.state = 'IDLE';
        }

        // 修正：只有在「非上班時間」且「還沒進入 OFF_WORK 狀態」時，才切換到 GOING_HOME
        if (!isWorkTime && this.state !== 'OFF_WORK') {
            this.state = 'GOING_HOME';
        }

        this.think(components, isWorkTime);
        this.move();
        
        // 體力自然消耗與恢復的基礎邏輯（非工作狀態下的小量變化）
        if (this.state === 'OFF_WORK') {
            this.stamina = Math.min(this.maxStamina, this.stamina + 0.5); // 在家休息恢復快
        }
    }

    think(components, isWorkTime) {
        // 1. 下班邏輯優先權最高
        if (this.state === 'GOING_HOME') {
            // 修正：尋找最近的門，而不是第一個
            const doors = components.filter(c => c.type === 'Door');
            if (doors.length > 0) {
                let closestDoor = null;
                let minDist = Infinity;

                doors.forEach(door => {
                    const d = Math.sqrt((door.x - this.x) ** 2 + (door.y - this.y) ** 2);
                    if (d < minDist) {
                        minDist = d;
                        closestDoor = door;
                    }
                });
                this.target = closestDoor;
            }
            return;
        }

        // 如果已經下班，不進行後續思考
        if (this.state === 'OFF_WORK') return;

        // 2. 如果體力太低 (<20)，強制尋找健身房或休息區
        if (this.stamina < 20 && isWorkTime) {
            this.state = 'TRAINING';
            const gym = components.find(c => c.type === 'Gym');
            if (gym) {
                this.target = gym;
            } else {
                this.target = components[Math.floor(Math.random() * components.length)];
            }
            return;
        }

        // 3. 正常工作邏輯
        if (!this.target && isWorkTime) {
            this.state = 'WORKING';
            const matched = components.filter(c => 
                (this.specialty === 'IT' && c.type === 'PC') || 
                (this.specialty === 'Admin' && c.type === 'Desk')
            );
            
            this.target = matched.length > 0 
                ? matched[Math.floor(Math.random() * matched.length)]
                : components.find(c => c.type === 'PC' || c.type === 'Desk');
        }
    }

    move() {
        if (!this.target || this.state === 'OFF_WORK') return;

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
                this.stress += 0.02;
                break;
            
            case 'Desk':
                this.eff += 0.05;
                this.stamina -= 0.08;
                this.stress += 0.01;
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

        if (this.stress > 50 || this.stamina <= 0) {
            this.target = null;
        }
    }

    draw(ctx, isSelected) {
        if (this.state === 'OFF_WORK') return;

        ctx.save();
        
        // 1. 選中光圈
        if (isSelected) {
            ctx.shadowBlur = 15;
            ctx.shadowColor = '#38bdf8';
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius + 5, 0, Math.PI * 2);
            ctx.strokeStyle = '#38bdf8';
            ctx.lineWidth = 3;
            ctx.stroke();
        }

        // 2. 繪製職員主體
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        
        if (this.stamina < 20) {
            ctx.fillStyle = '#f87171'; // 累了變紅色
        } else if (this.state === 'TRAINING') {
            ctx.fillStyle = '#4ade80'; // 健身變綠色
        } else {
            ctx.fillStyle = this.specialty === 'IT' ? '#38bdf8' : '#fbbf24';
        }
        
        ctx.fill();
        ctx.strokeStyle = 'white';
        ctx.lineWidth = 2;
        ctx.stroke();

        // 3. 繪製體力條
        const barW = 20;
        ctx.fillStyle = '#334155';
        ctx.fillRect(this.x - barW/2, this.y - 20, barW, 4);
        ctx.fillStyle = '#4ade80';
        ctx.fillRect(this.x - barW/2, this.y - 20, barW * (this.stamina / this.maxStamina), 4);

        // --- 新增：情緒氣泡顯示系統 ---
        let emoji = "";
        
        // 優先權判斷：下班 > 體力危險 > 壓力大 > 動作狀態
        if (this.state === 'GOING_HOME') {
            emoji = "🏃";
        } else if (this.stamina < 15) {
            emoji = "😫";
        } else if (this.stress > 40) {
            emoji = "🤯";
        } else if (this.state === 'TRAINING') {
            emoji = "💪";
        } else if (this.state === 'WORKING') {
            emoji = this.specialty === 'IT' ? "💻" : "✍️";
        } else if (this.state === 'IDLE') {
            emoji = "❓";
        }

        if (emoji !== "") {
            ctx.font = '16px Arial';
            ctx.textAlign = 'center';
            // 繪製在體力條上方 (y - 35)
            ctx.fillText(emoji, this.x, this.y - 30);
        }

        ctx.restore();
    }
}
