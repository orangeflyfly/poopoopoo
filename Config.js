// Config.js - 宗門靈魂資料庫
const GAME_CONFIG = {
    // 1. 性格特質定義 (決定行為權重)
    TRAITS: {
        "勤奮": {
            workWeight: 1.5,    // 工作意願加成
            slackWeight: 0.3,   // 偷懶機率極低
            chatChance: 0.05,   // 不愛聊天
            stressGain: 1.2,    // 容易累積壓力
            color: "#38bdf8"    // 專屬顏色 (藍)
        },
        "懶散": {
            workWeight: 0.5,
            slackWeight: 2.5,   // 極度容易開爛
            chatChance: 0.3,    // 喜歡找人八卦
            stressGain: 0.4,    // 壓力大也不在乎
            color: "#f87171"    // 專屬顏色 (紅)
        },
        "社交": {
            workWeight: 1.0,
            slackWeight: 1.0,
            chatChance: 3.0,    // 社交頻率極高
            stressGain: 0.8,
            color: "#4ade80"    // 專屬顏色 (綠)
        }
    },

    // 2. 對話碎片段 (用於自我生成對話)
    // 結構：[開場語] + [事件描述] + [心情/結尾]
    DIALOGUE_CHUNKS: {
        INTRO: ["師兄，", "說起來，", "哎呀，", "老實說... ", ""],
        
        WORKING: ["這代碼", "這次的修行", "目前的進度", "手上的任務"],
        WORKING_ACTION: ["寫得好痛苦", "快要突破了", "簡直是天書", "還差一點點"],
        
        SLACKING: ["偷懶的時候", "這附近的風景", "躺平的感覺", "什麼都不做"],
        SLACKING_ACTION: ["真是最棒的", "其實也很有道理", "能感悟天道", "比寫代碼好多了"],
        
        OUTRO: ["對吧？", "你覺得呢？", "... 算了。", "加油吧。", "呵呵。"]
    },

    // 3. 固定角色名單 (預設 3 位，你可以自行新增)
    FIXED_CHARACTERS: [
        { id: 1, name: "大師兄", trait: "勤奮", specialty: "IT" },
        { id: 2, name: "二師弟", trait: "懶散", specialty: "IT" },
        { id: 3, name: "小師妹", trait: "社交", specialty: "Admin" }
    ]
};

// 為了讓 HTML 抓得到，我們把它掛在 window 下 (如果是 Module 模式才需要)
window.GAME_CONFIG = GAME_CONFIG;
