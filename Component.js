class OfficeComponent {
    constructor(id, type, x, y) {
        this.id = id;
        this.type = type; // 'PC', 'Desk', 'Gym', 'Door'
        this.x = x;
        this.y = y;
        this.size = 40;   // 設備顯示大小
    }

    /**
     * 繪製組件
     * @param {CanvasRenderingContext2D} ctx 
     */
    draw(ctx) {
        // --- 靈魂注入：從 Config 讀取外觀設定 ---
        // 這樣以後你改 Config，這裡就會自動變色、變圖示
        const config = (window.GAME_CONFIG && GAME_CONFIG.COMPONENTS) 
            ? GAME_CONFIG.COMPONENTS[this.type] 
            : null;

        // 安全回退機制：如果 Config 沒定義，使用預設灰色
        const mainColor = config ? config.mainColor : '#94a3b8';
        const bgColor = config ? config.bgColor : 'rgba(148, 163, 184, 0.2)';
        const icon = config ? config.icon : '❓';
        const displayName = config ? (config.name || this.type) : this.type;

        ctx.save();

        // 修正：計算置中偏移量
        // 假設網格是 50x50，設備是 40x40，我們位移 5px 讓它完美居中
        const offset = 5;
        const drawX = this.x + offset;
        const drawY = this.y + offset;

        // 1. 繪製陰影 (讓設備有立體感)
        ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
        ctx.shadowBlur = 4;
        ctx.shadowOffsetMax = 2;

        // 2. 繪製設備背景填充 (使用圓角矩形)
        ctx.fillStyle = bgColor;
        ctx.beginPath();
        // Canvas 的 roundRect 是現代瀏覽器的標準，增加精緻感
        if (ctx.roundRect) {
            ctx.roundRect(drawX, drawY, this.size, this.size, 8);
        } else {
            ctx.rect(drawX, drawY, this.size, this.size);
        }
        ctx.fill();

        // 3. 繪製設備外框
        ctx.shadowBlur = 0; // 關閉文字與邊框的陰影
        ctx.strokeStyle = mainColor;
        ctx.lineWidth = 2;
        ctx.stroke();

        // 4. 針對 'Door' 做發光感強化 (表示這是出口/入口)
        if (this.type === 'Door') {
            ctx.save();
            ctx.shadowBlur = 12;
            ctx.shadowColor = mainColor;
            ctx.lineWidth = 1;
            ctx.strokeRect(drawX + 4, drawY + 4, this.size - 8, this.size - 8);
            ctx.restore();
        }

        // 5. 繪製設備圖示 (Emoji)
        ctx.font = '22px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(icon, drawX + this.size / 2, drawY + this.size / 2 - 2);

        // 6. 繪製底部的文字標籤
        ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        ctx.font = 'bold 9px "Segoe UI", Arial';
        ctx.textAlign = 'center';
        
        // 將名稱畫在方塊正下方，不擋住 Emoji
        ctx.fillText(displayName, drawX + this.size / 2, drawY + this.size + 10);

        ctx.restore();
    }
}
