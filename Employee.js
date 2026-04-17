class Employee {
    constructor(id, name, x, y, specialty) {
        this.id = id;
        this.name = name;
        this.x = x;
        this.y = y;
        this.specialty = specialty; // 'IT', 'Admin'
        this.iq = 10 + Math.random() * 20;
        this.eff = 10 + Math.random() * 20;
        this.stress = 0;
        
        this.target = null;
        this.speed = 1.2 + (this.eff / 100);
        this.radius = 12;
    }

    update(components) {
        this.think(components);
        this.move();
    }

    think(components) {
        if (!this.target && components.length > 0) {
            // 自動判斷：根據專長優先找對應設備
            const matched = components.filter(c => 
                (this.specialty === 'IT' && c.type === 'PC') || 
                (this.specialty === 'Admin' && c.type === 'Desk')
            );
            
            this.target = matched.length > 0 
                ? matched[Math.floor(Math.random() * matched.length)]
                : components[Math.floor(Math.random() * components.length)];
        }
    }

    move() {
        if (!this.target) return;
        const dx = (this.target.x + 20) - this.x;
        const dy = (this.target.y + 20) - this.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist > 5) {
            this.x += (dx / dist) * this.speed;
            this.y += (dy / dist) * this.speed;
        } else {
            // 到達並工作
            this.work();
        }
    }

    work() {
        if (this.target.type === 'PC') this.iq += 0.05;
        if (this.target.type === 'Desk') this.eff += 0.05;
        this.stress += 0.02;
        
        // 累了就放手去下一個
        if (this.stress > 20) {
            this.target = null;
            this.stress = 0;
        }
    }

    draw(ctx, isSelected) {
        ctx.save();
        // 選中光圈
        if (isSelected) {
            ctx.shadowBlur = 15;
            ctx.shadowColor = '#38bdf8';
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius + 5, 0, Math.PI * 2);
            ctx.strokeStyle = '#38bdf8';
            ctx.stroke();
        }

        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = this.specialty === 'IT' ? '#38bdf8' : '#fbbf24';
        ctx.fill();
        ctx.restore();
    }
}
