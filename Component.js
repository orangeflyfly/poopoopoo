class OfficeComponent {
    constructor(id, type, x, y) {
        this.id = id;
        this.type = type; // 'PC', 'Desk'
        this.x = x;
        this.y = y;
        this.size = 40;
    }

    draw(ctx) {
        ctx.fillStyle = this.type === 'PC' ? 'rgba(56, 189, 248, 0.2)' : 'rgba(251, 191, 36, 0.2)';
        ctx.strokeStyle = this.type === 'PC' ? '#38bdf8' : '#fbbf24';
        ctx.lineWidth = 2;
        ctx.strokeRect(this.x, this.y, this.size, this.size);
        ctx.fillRect(this.x, this.y, this.size, this.size);
        
        ctx.fillStyle = 'white';
        ctx.font = '10px Arial';
        ctx.fillText(this.type, this.x + 5, this.y + 25);
    }
}
