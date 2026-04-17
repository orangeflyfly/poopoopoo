// Config.js - 宗門靈魂與物資資料庫
const GAME_CONFIG = {
    // 1. 性格特質定義 (決定行為權重與視覺顏色)
    TRAITS: {
        "勤奮": {
            workWeight: 1.5,    // 工作意願加成
            slackWeight: 0.3,   // 偷懶機率極低
            chatChance: 0.05,   // 不愛聊天
            stressGain: 1.2,    // 容易累積壓力
            color: "#38bdf8"    // 專屬顏色 (科技藍)
        },
        "懶散": {
            workWeight: 0.5,
            slackWeight: 2.5,   // 極度容易開爛
            chatChance: 0.3,    // 喜歡找人八卦
            stressGain: 0.4,    // 壓力大也不在乎
            color: "#f87171"    // 專屬顏色 (壓力紅)
        },
        "社交": {
            workWeight: 1.0,
            slackWeight: 1.0,
            chatChance: 3.0,    // 社交頻率極高
            stressGain: 0.8,
            color: "#4ade80"    // 專屬顏色 (體力綠)
        }
    },

    // 2. 對話碎片段 (用於自我生成對話系統)
    // 結構：[開場語] + [事件/主體] + [動作/描述] + [心情/結尾]
    DIALOGUE_CHUNKS: {
        INTRO: ["師兄，", "說起來，", "哎呀，", "老實說... ", "", "那個，"],
        
        // 工作時的台詞
        WORKING: ["這代碼", "這次的修行", "目前的進度", "手上的任務", "這份卷宗"],
        WORKING_ACTION: ["寫得好痛苦", "快要突破了", "簡決是天書", "還差一點點", "邏輯全亂了"],
        
        // 擺爛/開爛時的台詞
        SLACKING: ["偷懶的時候", "這附近的風景", "躺平的感覺", "什麼都不做", "摳腳的時候"],
        SLACKING_ACTION: ["真是最棒的", "其實也很有道理", "能感悟天道", "比寫代碼好多了", "心靈被洗滌了"],

        // 社交聊天時的台詞 (新加入)
        CHATTING: ["大家，", "那個...", "說起來，", "剛才看到...", "這宗門"],
        CHATTING_ACTION: ["最近修煉如何", "聽說山下有個八卦", "靈氣是不是變稀薄了", "老闆好像在看這裡", "昨晚有人沒回來"],
        
        OUTRO: ["對吧？", "你覺得呢？", "... 算了。", "加油吧。", "呵呵。", "真是無趣。", "你說是吧！"]
    },

    // 3. 固定角色名單 (招募時會依序請出這幾位靈魂人物)
    FIXED_CHARACTERS: [
        { id: 1, name: "大師兄", trait: "勤奮", specialty: "IT" },
        { id: 2, name: "二師弟", trait: "懶散", specialty: "IT" },
        { id: 3, name: "小師妹", trait: "社交", specialty: "Admin" }
    ],

    // 4. 設備外觀與標籤定義 (新加入，供 Component.js 讀取)
    COMPONENTS: {
        'PC': { 
            name: "開發終端", 
            mainColor: '#38bdf8', 
            bgColor: 'rgba(56, 189, 248, 0.2)', 
            icon: "💻" 
        },
        'Desk': { 
            name: "行政辦公桌", 
            mainColor: '#fbbf24', 
            bgColor: 'rgba(251, 191, 36, 0.2)', 
            icon: "🛋️" 
        },
        'Gym': { 
            name: "靈氣健身房", 
            mainColor: '#a855f7', 
            bgColor: 'rgba(168, 85, 247, 0.2)', 
            icon: "🏋️" 
        },
        'Door': { 
            name: "宗門大門", 
            mainColor: '#10b981', 
            bgColor: 'rgba(16, 185, 129, 0.2)', 
            icon: "🚪" 
        }
    }
};

// 為了讓 HTML 抓得到，我們把它掛在 window 下
window.GAME_CONFIG = GAME_CONFIG;
