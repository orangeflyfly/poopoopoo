class OfficeComponent {
    constructor(id, type, x, y) {
        this.id = id;
        this.type = type; // 'PC', 'Desk', 'Gym', 'Door'
        this.x = x;
        this.y = y;
        this.size = 40;
    }

    draw(ctx) {
        let mainColor = '';
        let bgColor = '';

        // 根據類型決定顏色
        switch (this.type) {
            case 'PC':
                mainColor = '#38bdf8'; // 科技藍
                bgColor = 'rgba(56, 189, 248, 0.2)';
                break;
            case 'Desk':
                mainColor = '#fbbf24'; // 行政黃
                bgColor = 'rgba(251, 191, 36, 0.2)';
                break;
            case 'Gym':
                mainColor = '#a855f7'; // 健身紫
                bgColor = 'rgba(168, 85, 247, 0.2)';
                break;
            case 'Door':
                mainColor = '#10b981'; // 出入口綠
                bgColor = 'rgba(16, 185, 129, 0.2)';
                break;
            default:
                mainColor = '#94a3b8';
                bgColor = 'rgba(148, 163, 184, 0.2)';
        }

        ctx.save();

        // 繪製設備外框
        ctx.strokeStyle = mainColor;
        ctx.lineWidth = 2;
        ctx.strokeRect(this.x, this.y, this.size, this.size);

        // 繪製設備背景填充
        ctx.fillStyle = bgColor;
        ctx.fillRect(this.x, this.y, this.size, this.size);

        // 針對 'Door' 做一點視覺區隔（加個發光感，表示那是出口）
        if (this.type === 'Door') {
            ctx.shadowBlur = 10;
            ctx.shadowColor = mainColor;
            ctx.strokeRect(this.x + 5, this.y + 5, this.size - 10, this.size - 10);
        }

        // 繪製文字標籤
        ctx.fillStyle = 'white';
        ctx.font = 'bold 10px Arial';
        ctx.textAlign = 'center';
        // 將文字置中於方塊內
        ctx.fillText(this.type, this.x + this.size / 2, this.y + this.size / 2 + 5);

        ctx.restore();
    }
}
