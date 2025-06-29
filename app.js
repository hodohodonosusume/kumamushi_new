// ゲーム状態管理
class TardigradeGame {
    constructor() {
        // ゲーム状態
        this.gameState = {
            environment: {
                humidity: 65,
                temperature: 20,
                sunlight: 'middle' // low, middle, high
            },
            colony: [], // プレイヤーのクマムシコロニー（最大8匹）
            collection: new Set(), // 発見済みのクマムシID
            discoveredSpecies: new Map(), // 発見済み種の詳細情報
            threatLevel: 25,
            nextAttackTime: Date.now() + 180 * 60 * 1000, // 180分後
            defensePositions: [null, null, null, null]
        };

        // クマムシデータベース
        this.tardigradeDatabase = this.initializeTardigradeDatabase();
        
        // 苔エリアデータ
        this.mossAreas = {
            urban: { name: 'ギンゴケ', humidity: 40, temperature: 25, species: [1, 2, 3, 4, 5] },
            forest: { name: 'ハイゴケ', humidity: 80, temperature: 18, species: [6, 7, 8, 9, 10] },
            desert: { name: 'スナゴケ', humidity: 20, temperature: 35, species: [11, 12, 13, 14, 15] },
            wetland: { name: 'ミズゴケ', humidity: 95, temperature: 15, species: [16, 17, 18, 19, 20] },
            alpine: { name: '雪上コケ', humidity: 70, temperature: 5, species: [21, 22, 23, 24, 25] }
        };

        // 初期データ設定
        this.labRecords = new Map();   // key: 個体 id, value: 実験履歴
        this.currentScreen = 'main';
        this.selectedParents = [null, null];

        this.addInitialTardigrades();
        
        this.currentScreen = 'main';
        this.selectedParents = [null, null];
        
        this.initializeEventListeners();
        this.updateUI();
        this.startGameLoop();
    }

    // 初期クマムシを追加
    addInitialTardigrades() {
        // 最初から数匹のクマムシを持っている
        const initialSpecies = [1, 2, 6]; // ヒメクマムシ、マルクマムシ、ヨコヅナクマムシ
        
        initialSpecies.forEach(speciesId => {
            this.gameState.collection.add(speciesId);
            const newTardigrade = {
                id: Date.now() + Math.random(),
                speciesId: speciesId,
                cryptobiosis: false,
                nutrition: Math.floor(Math.random() * 30) + 70, // 70-100
                age: Math.floor(Math.random() * 100)
            };
            this.gameState.colony.push(newTardigrade);
        });
    }

    // クマムシアイコン生成
    getTardigradeIcon(speciesId) {
        const icons = {
            1: '🐻', 2: '🧸', 3: '🐾', 4: '🐱', 5: '🐨',
            6: '🦔', 7: '🐹', 8: '🐭', 9: '🐰', 10: '🐿️',
            11: '🦘', 12: '🦫', 13: '🦝', 14: '🐺', 15: '🦊',
            16: '🐸', 17: '🦎', 18: '🐢', 19: '🐧', 20: '🦆',
            21: '❄️', 22: '🧊', 23: '⛄', 24: '🌨️', 25: '🔮',
            26: '💎', 27: '🌟', 28: '✨', 29: '🌈', 30: '🔥',
            31: '⚡', 32: '🌊', 33: '🌪️', 34: '🌋', 35: '💥',
            36: '🔥', 37: '🐉', 38: '👹', 39: '🦈', 40: '🐍',
            41: '🌌', 42: '🌠', 43: '💫', 44: '🎆', 45: '🔮',
            46: '🎭', 47: '🎪', 48: '🎨', 49: '🎯', 50: '🏆'
        };
        return icons[speciesId] || '🐻';
    }

    // クマムシデータベースの初期化
    initializeTardigradeDatabase() {
        const database = new Map();
        
        // 50種類のクマムシを生成
        const species = [
            { name: 'ヒメクマムシ', scientific: 'Echiniscus granulatus', rarity: 'コモン' },
            { name: 'マルクマムシ', scientific: 'Echiniscus blumi', rarity: 'コモン' },
            { name: 'トゲクマムシ', scientific: 'Echiniscus spiniger', rarity: 'コモン' },
            { name: 'コケクマムシ', scientific: 'Bryodelphax parvulus', rarity: 'コモン' },
            { name: 'チビクマムシ', scientific: 'Milnesium minutum', rarity: 'コモン' },
            { name: 'ヨコヅナクマムシ', scientific: 'Ramazzottius varieornatus', rarity: 'アンコモン' },
            { name: 'フタバクマムシ', scientific: 'Diphascon bullatum', rarity: 'アンコモン' },
            { name: 'ミドリクマムシ', scientific: 'Hypsibius dujardini', rarity: 'アンコモン' },
            { name: 'ハイイロクマムシ', scientific: 'Macrobiotus hufelandi', rarity: 'アンコモン' },
            { name: 'アカクマムシ', scientific: 'Ramazzottius oberhaeuseri', rarity: 'アンコモン' },
            { name: 'サバククマムシ', scientific: 'Xerobiotus pseudohufelandi', rarity: 'アンコモン' },
            { name: 'カタクマムシ', scientific: 'Richtersius coronifer', rarity: 'アンコモン' },
            { name: 'ツノクマムシ', scientific: 'Cornechiniscus holmeni', rarity: 'アンコモン' },
            { name: 'イワクマムシ', scientific: 'Petrobiotus montanus', rarity: 'アンコモン' },
            { name: 'キバナクマムシ', scientific: 'Flavobiotus basiatus', rarity: 'アンコモン' },
            { name: 'ミズクマムシ', scientific: 'Thulinius aquaticus', rarity: 'レア' },
            { name: 'ドゥジャルダンヤマクマムシ', scientific: 'Hypsibius dujardini', rarity: 'レア' },
            { name: 'クロクマムシ', scientific: 'Mesobiotus niger', rarity: 'レア' },
            { name: 'シロクマムシ', scientific: 'Albobiotus albus', rarity: 'レア' },
            { name: 'キンクマムシ', scientific: 'Aurobiotus aureus', rarity: 'レア' },
            { name: 'ユキクマムシ', scientific: 'Cryobiotus arcticus', rarity: 'レア' },
            { name: 'グレイシャークマムシ', scientific: 'Glacierobiotus frigidus', rarity: 'レア' },
            { name: 'アルプスクマムシ', scientific: 'Alpobiotus montanus', rarity: 'レア' },
            { name: 'コオリクマムシ', scientific: 'Cryoconicus glacialis', rarity: 'レア' },
            { name: 'セッカクマムシ', scientific: 'Nivobiotus nivalis', rarity: 'レア' },
            { name: 'ガラスクマムシ', scientific: 'Vitreus transparens', rarity: 'エピック' },
            { name: 'クリスタルクマムシ', scientific: 'Crystallinus magnificus', rarity: 'エピック' },
            { name: 'ダイヤクマムシ', scientific: 'Diamanteus sparkles', rarity: 'エピック' },
            { name: 'プリズムクマムシ', scientific: 'Prismaticus rainbow', rarity: 'エピック' },
            { name: 'オーロラクマムシ', scientific: 'Aurorabiotus borealis', rarity: 'エピック' },
            { name: 'ファイアクマムシ', scientific: 'Ignis flammeus', rarity: 'エピック' },
            { name: 'タイタンクマムシ', scientific: 'Gigantatardigrade titanicus', rarity: 'エピック' },
            { name: 'アトラスクマムシ', scientific: 'Atlasium colossus', rarity: 'エピック' },
            { name: 'ヘラクレスクマムシ', scientific: 'Herculeus maximus', rarity: 'エピック' },
            { name: 'ゼウスクマムシ', scientific: 'Zeusium thunderbolt', rarity: 'エピック' },
            { name: 'フェニックスクマムシ', scientific: 'Phoenixbiotus immortalis', rarity: 'レジェンダリー' },
            { name: 'ドラゴンクマムシ', scientific: 'Draconius legendarius', rarity: 'レジェンダリー' },
            { name: 'オニクマムシ', scientific: 'Milnesium tardigradum', rarity: 'レジェンダリー' },
            { name: 'カニバルクマムシ', scientific: 'Cannibalus predator', rarity: 'レジェンダリー' },
            { name: 'ハンタークマムシ', scientific: 'Predatorium hunter', rarity: 'レジェンダリー' },
            { name: 'アルティメットクマムシ', scientific: 'Ultimatum supremus', rarity: 'レジェンダリー' },
            { name: 'コズミッククマムシ', scientific: 'Cosmicus universalis', rarity: 'レジェンダリー' },
            { name: 'エターナルクマムシ', scientific: 'Eternus infinite', rarity: 'レジェンダリー' },
            { name: 'セレスティアルクマムシ', scientific: 'Celestialis divine', rarity: 'レジェンダリー' },
            { name: 'ミラクルクマムシ', scientific: 'Miraculum wonderous', rarity: 'レジェンダリー' },
            { name: 'アーティファクトクマムシ', scientific: 'Artifactum mysticus', rarity: 'レジェンダリー' },
            { name: 'レリッククマムシ', scientific: 'Reliquum ancientus', rarity: 'レジェンダリー' },
            { name: 'プライモーディアルクマムシ', scientific: 'Primordialis genesis', rarity: 'レジェンダリー' },
            { name: 'トランセンデントクマムシ', scientific: 'Transcendentis beyond', rarity: 'レジェンダリー' },
            { name: 'オムニクマムシ', scientific: 'Omnipotens absolute', rarity: 'レジェンダリー' }
        ];

        species.forEach((spec, index) => {
            const id = index + 1;
            const stats = this.generateStats(spec.rarity);
            database.set(id, {
                id,
                name: spec.name,
                scientificName: spec.scientific,
                rarity: spec.rarity,
                stats,
                size: (Math.random() * 0.7 + 0.1).toFixed(2) + 'mm',
                color: this.generateColor(spec.rarity),
                discoveryRate: this.getDiscoveryRate(spec.rarity),
                abilities: this.generateAbilities(spec.rarity),
                cryptobiosisRate: Math.random() * 0.13 + 0.85, // 85-98%
                description: this.generateDescription(spec.name, spec.rarity)
            });
        });

        return database;
    }

    generateDescription(name, rarity) {
        const descriptions = {
            'コモン': [
                '身近な環境でよく見られる基本的なクマムシです。',
                '都市部の苔に生息する丈夫な種です。',
                '初心者におすすめの飼いやすいクマムシです。'
            ],
            'アンコモン': [
                '特殊な環境に適応した優秀なクマムシです。',
                '乾燥耐性に優れ、厳しい環境でも生存できます。',
                '独特の形態を持つ興味深い種です。'
            ],
            'レア': [
                '発見が困難な貴重な種です。',
                '美しい色彩を持つ希少なクマムシです。',
                '特殊な能力を持つ注目の種です。'
            ],
            'エピック': [
                '伝説級の能力を持つ超希少種です。',
                '驚異的な生存能力を誇る神秘的なクマムシです。',
                '研究者の間でも話題となる幻の種です。'
            ],
            'レジェンダリー': [
                '神話に登場するほど神秘的な最高級のクマムシです。',
                'すべての限界を超越した究極の生命体です。',
                '宇宙の神秘を体現する奇跡のクマムシです。'
            ]
        };
        
        const descArray = descriptions[rarity];
        return descArray[Math.floor(Math.random() * descArray.length)];
    }

    generateStats(rarity) {
        const baseStats = {
            'コモン': { min: 10, max: 30 },
            'アンコモン': { min: 25, max: 50 },
            'レア': { min: 45, max: 70 },
            'エピック': { min: 65, max: 85 },
            'レジェンダリー': { min: 80, max: 100 }
        };

        const range = baseStats[rarity];
        return {
            dryResistance: Math.floor(Math.random() * (range.max - range.min) + range.min),
            coldResistance: Math.floor(Math.random() * (range.max - range.min) + range.min),
            heatResistance: Math.floor(Math.random() * (range.max - range.min) + range.min),
            mobility: Math.floor(Math.random() * (range.max - range.min) + range.min),
            nutrition: 100
        };
    }

    generateColor(rarity) {
        const colors = {
            'コモン': ['透明', '淡褐色', '灰色'],
            'アンコモン': ['茶褐色', '薄緑', '青白'],
            'レア': ['深緑', '青色', '紫色'],
            'エピック': ['虹色', '金色', '銀色'],
            'レジェンダリー': ['血赤', '深紫', '黄金', '宇宙色']
        };
        const colorArray = colors[rarity];
        return colorArray[Math.floor(Math.random() * colorArray.length)];
    }

    getDiscoveryRate(rarity) {
        const rates = {
            'コモン': '25%',
            'アンコモン': '12%',
            'レア': '5%',
            'エピック': '2%',
            'レジェンダリー': '0.5%'
        };
        return rates[rarity];
    }

    generateAbilities(rarity) {
        const abilities = {
            'コモン': ['基本生存'],
            'アンコモン': ['乾燥耐性', '低温耐性', '高速移動'],
            'レア': ['超乾燥耐性', '氷結耐性', '結晶化'],
            'エピック': ['透明化', '巨大化', '分裂', '再生'],
            'レジェンダリー': ['捕食', '共食い', '不死', '次元移動', '時間停止']
        };
        const abilityArray = abilities[rarity];
        return abilityArray[Math.floor(Math.random() * abilityArray.length)];
    }

    // イベントリスナーの初期化
    initializeEventListeners() {
        // 画面遷移
        document.getElementById('explore-btn').addEventListener('click', () => this.showScreen('explore'));
        document.getElementById('collection-btn').addEventListener('click', () => this.showScreen('collection'));
        document.getElementById('breeding-btn').addEventListener('click', () => this.showScreen('breeding'));
        document.getElementById('defense-btn').addEventListener('click', () => this.showScreen('defense'));

        // 戻るボタン
        document.getElementById('back-to-main').addEventListener('click', () => this.showScreen('main'));
        document.getElementById('back-to-main-2').addEventListener('click', () => this.showScreen('main'));
        document.getElementById('back-to-main-3').addEventListener('click', () => this.showScreen('main'));
        document.getElementById('back-to-main-4').addEventListener('click', () => this.showScreen('main'));

        // クリプトビオシス
        document.getElementById('cryptobiosis-all').addEventListener('click', () => this.triggerCryptobiosis(true));
        document.getElementById('revive-all').addEventListener('click', () => this.reviveAll());

        // 探索
        document.querySelectorAll('.explore-area-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const area = e.target.closest('.moss-area').dataset.area;
                this.exploreArea(area);
            });
        });

        // 図鑑フィルター
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                this.filterCollection(e.target.dataset.rarity);
            });
        });

        // 合成
        document.getElementById('breed-btn').addEventListener('click', () => this.performBreeding());

        // モーダル
        document.getElementById('modal-close').addEventListener('click', () => this.closeModal());
        document.getElementById('modal-close-btn').addEventListener('click', () => this.closeModal());
        document.getElementById('result-close-btn').addEventListener('click', () => this.closeResultModal());

        // モーダル外クリックで閉じる
        document.getElementById('detail-modal').addEventListener('click', (e) => {
            if (e.target.id === 'detail-modal') this.closeModal();
        });
        document.getElementById('result-modal').addEventListener('click', (e) => {
            if (e.target.id === 'result-modal') this.closeResultModal();
        });
    }

    // 画面表示切り替え
    showScreen(screenName) {
        document.querySelectorAll('.screen, .game-main').forEach(screen => {
            screen.style.display = 'none';
        });

        if (screenName === 'main') {
            document.getElementById('main-screen').style.display = 'block';
        } else {
            document.getElementById(`${screenName}-screen`).style.display = 'block';
        }

        this.currentScreen = screenName;
        
        if (screenName === 'collection') {
            this.updateCollectionDisplay();
        } else if (screenName === 'breeding') {
            this.updateBreedingDisplay();
        } else if (screenName === 'defense') {
            this.updateDefenseDisplay();
        }
    }

    // UI更新
    updateUI() {
        this.updateEnvironmentStatus();
        this.updateColonyDisplay();
        this.updateCollectionCount();
    }

    updateEnvironmentStatus() {
        document.getElementById('humidity').textContent = `${this.gameState.environment.humidity.toFixed(0)}%`;
        document.getElementById('temperature').textContent = `${this.gameState.environment.temperature.toFixed(0)}°C`;
        document.getElementById('sunlight').textContent = this.getSunlightText();
    }

    getSunlightText() {
        const levels = { low: '弱', middle: '中', high: '強' };
        return levels[this.gameState.environment.sunlight];
    }

    updateColonyDisplay() {
        const grid = document.getElementById('colony-grid');
        grid.innerHTML = '';

        // 8スロット作成
        for (let i = 0; i < 8; i++) {
            const slot = document.createElement('div');
            slot.className = 'tardigrade-slot';
            
            if (i < this.gameState.colony.length) {
                const tardigrade = this.gameState.colony[i];
                const species = this.tardigradeDatabase.get(tardigrade.speciesId);
                
                slot.classList.add(`rarity-${this.getRarityClass(species.rarity)}`);
                if (tardigrade.cryptobiosis) {
                    slot.classList.add('cryptobiosis');
                }
                
                slot.innerHTML = `
                    <div class="tardigrade-icon">${this.getTardigradeIcon(tardigrade.speciesId)}</div>
                    <div class="tardigrade-name">${species.name}</div>
                    <div class="tardigrade-stats">
                        <small>栄養: ${tardigrade.nutrition}/100</small>
                        <small>年齢: ${tardigrade.age}日</small>
                    </div>
                `;
                
                slot.addEventListener('click', () => this.showTardigradeDetail(tardigrade));
            } else {
                slot.classList.add('empty');
                slot.innerHTML = `
                    <div class="slot-placeholder">
                        <div style="font-size: 2rem; margin-bottom: 8px;">➕</div>
                        <div>空きスロット</div>
                    </div>
                `;
            }
            
            grid.appendChild(slot);
        }

        document.getElementById('empty-slots').textContent = 8 - this.gameState.colony.length;
    }

    getRarityClass(rarity) {
        const classes = {
            'コモン': 'common',
            'アンコモン': 'uncommon',
            'レア': 'rare',
            'エピック': 'epic',
            'レジェンダリー': 'legendary'
        };
        return classes[rarity] || 'common';
    }

    updateCollectionCount() {
        document.getElementById('collection-count').textContent = 
            `${this.gameState.collection.size}/50`;
    }

    // 探索システム
    exploreArea(areaName) {
        const area = this.mossAreas[areaName];
        const discoveryChance = Math.random();
        
        // 発見判定
        if (discoveryChance < 0.4) { // 40%の確率で発見
            const speciesPool = area.species;
            const randomSpeciesId = speciesPool[Math.floor(Math.random() * speciesPool.length)];
            
            // より高い確率でレア種も発見できるようにする
            const allSpecies = Array.from(this.tardigradeDatabase.keys());
            const finalSpeciesId = Math.random() < 0.1 ? 
                allSpecies[Math.floor(Math.random() * allSpecies.length)] : randomSpeciesId;
            
            this.discoverTardigrade(finalSpeciesId);
        } else {
            this.showResultModal('探索結果', `${area.name}を探索しましたが、クマムシは見つかりませんでした...`, 'info');
        }
    }

    discoverTardigrade(speciesId) {
        const species = this.tardigradeDatabase.get(speciesId);
        const isNewDiscovery = !this.gameState.collection.has(speciesId);
        
        // コレクションに追加
        this.gameState.collection.add(speciesId);
        
        // コロニーに空きがあれば追加
        if (this.gameState.colony.length < 8) {
            const newTardigrade = {
                id: Date.now() + Math.random(),
                speciesId: speciesId,
                cryptobiosis: false,
                nutrition: Math.floor(Math.random() * 30) + 70,
                age: 0
            };
            this.gameState.colony.push(newTardigrade);
        }

        const message = isNewDiscovery 
            ? `🎉 新種発見！<br><strong>${species.name}</strong> を発見しました！<br><em>${species.scientificName}</em><br><br>${species.description}`
            : `${species.name} を再発見しました！`;
        
        this.showResultModal('発見！', message, 'success');
        this.updateUI();
        
        if (isNewDiscovery) {
            this.triggerDiscoveryEffect();
        }
    }

    triggerDiscoveryEffect() {
        // 発見エフェクト
        const effect = document.getElementById('cryptobiosis-effect');
        effect.style.background = 'linear-gradient(45deg, #ffd700, #ffed4e)';
        effect.classList.add('active');
        
        setTimeout(() => {
            effect.classList.remove('active');
        }, 2000);
    }

    // 図鑑システム
    updateCollectionDisplay() {
        const grid = document.getElementById('collection-grid');
        grid.innerHTML = '';

        this.tardigradeDatabase.forEach((species, id) => {
            const entry = document.createElement('div');
            entry.className = 'collection-entry';
            entry.classList.add(this.gameState.collection.has(id) ? 'discovered' : 'undiscovered');
            
            const rarityClass = this.getRarityClass(species.rarity);
            entry.innerHTML = `
                <div class="rarity-badge ${rarityClass}">${species.rarity}</div>
                <div class="tardigrade-icon">${this.gameState.collection.has(id) ? this.getTardigradeIcon(id) : '❓'}</div>
                <div class="tardigrade-name">${this.gameState.collection.has(id) ? species.name : '???'}</div>
                <div class="scientific-name">${this.gameState.collection.has(id) ? species.scientificName : '???'}</div>
                <div class="discovery-rate">発見率: ${this.gameState.collection.has(id) ? species.discoveryRate : '???'}</div>
            `;
            
            if (this.gameState.collection.has(id)) {
                entry.addEventListener('click', () => this.showSpeciesDetail(species));
            }
            
            grid.appendChild(entry);
        });
    }

    filterCollection(rarity) {
        const entries = document.querySelectorAll('.collection-entry');
        entries.forEach(entry => {
            if (rarity === 'all') {
                entry.style.display = 'block';
            } else {
                const badge = entry.querySelector('.rarity-badge');
                if (badge && badge.textContent === rarity) {
                    entry.style.display = 'block';
                } else {
                    entry.style.display = 'none';
                }
            }
        });
    }

    // 合成システム
    updateBreedingDisplay() {
        const selectionDiv = document.getElementById('breeding-selection');
        selectionDiv.innerHTML = '';

        if (this.gameState.colony.length === 0) {
            selectionDiv.innerHTML = '<p style="text-align: center; color: var(--color-text-secondary);">合成できるクマムシがいません。まずは探索でクマムシを発見しましょう！</p>';
            return;
        }

        this.gameState.colony.forEach(tardigrade => {
            const species = this.tardigradeDatabase.get(tardigrade.speciesId);
            const option = document.createElement('div');
            option.className = 'breeding-option';
            option.innerHTML = `
                <div class="tardigrade-icon">${this.getTardigradeIcon(tardigrade.speciesId)}</div>
                <div style="font-size: 10px;">${species.name}</div>
                <div style="font-size: 8px;">${species.rarity}</div>
            `;
            
            option.addEventListener('click', () => this.selectParent(tardigrade));
            selectionDiv.appendChild(option);
        });

        this.updateBreedingUI();
    }

    selectParent(tardigrade) {
        if (this.selectedParents[0] === null) {
            this.selectedParents[0] = tardigrade;
        } else if (this.selectedParents[1] === null && this.selectedParents[0] !== tardigrade) {
            this.selectedParents[1] = tardigrade;
        } else {
            this.selectedParents = [tardigrade, null];
        }
        
        this.updateBreedingUI();
    }

    updateBreedingUI() {
        // 親1
        const parent1Slot = document.getElementById('parent1');
        if (this.selectedParents[0]) {
            const species1 = this.tardigradeDatabase.get(this.selectedParents[0].speciesId);
            parent1Slot.innerHTML = `
                <div class="tardigrade-icon">${this.getTardigradeIcon(this.selectedParents[0].speciesId)}</div>
                <div style="font-size: 10px;">${species1.name}</div>
            `;
            parent1Slot.classList.add('selected');
        } else {
            parent1Slot.innerHTML = '<div class="slot-placeholder">親1を選択</div>';
            parent1Slot.classList.remove('selected');
        }

        // 親2
        const parent2Slot = document.getElementById('parent2');
        if (this.selectedParents[1]) {
            const species2 = this.tardigradeDatabase.get(this.selectedParents[1].speciesId);
            parent2Slot.innerHTML = `
                <div class="tardigrade-icon">${this.getTardigradeIcon(this.selectedParents[1].speciesId)}</div>
                <div style="font-size: 10px;">${species2.name}</div>
            `;
            parent2Slot.classList.add('selected');
        } else {
            parent2Slot.innerHTML = '<div class="slot-placeholder">親2を選択</div>';
            parent2Slot.classList.remove('selected');
        }

        // 成功率計算
        const successRate = this.calculateBreedingSuccess();
        document.getElementById('success-rate').textContent = `成功率: ${successRate}%`;
        
        // 結果予測
        const resultSlot = document.getElementById('breeding-result');
        if (this.selectedParents[0] && this.selectedParents[1]) {
            resultSlot.innerHTML = `
                <div class="tardigrade-icon">✨</div>
                <div style="font-size: 10px;">新個体</div>
            `;
        } else {
            resultSlot.innerHTML = '<div class="slot-placeholder">？</div>';
        }
        
        // 合成ボタン
        const breedBtn = document.getElementById('breed-btn');
        breedBtn.disabled = !this.selectedParents[0] || !this.selectedParents[1];
    }

    calculateBreedingSuccess() {
        if (!this.selectedParents[0] || !this.selectedParents[1]) return 0;
        
        const species1 = this.tardigradeDatabase.get(this.selectedParents[0].speciesId);
        const species2 = this.tardigradeDatabase.get(this.selectedParents[1].speciesId);
        
        if (species1.id === species2.id) return 95; // 同種
        if (species1.rarity === species2.rarity) return 70; // 同レア度
        return 30; // 異種
    }

    performBreeding() {
        if (this.gameState.colony.length >= 8) {
            this.showResultModal('合成失敗', 'コロニーが満杯です！空きスロットを作ってください。', 'error');
            return;
        }

        const successRate = this.calculateBreedingSuccess();
        const success = Math.random() * 100 < successRate;
        
        if (success) {
            // 新個体生成
            let newSpeciesId;
            const species1 = this.tardigradeDatabase.get(this.selectedParents[0].speciesId);
            const species2 = this.tardigradeDatabase.get(this.selectedParents[1].speciesId);
            
            if (species1.id === species2.id) {
                // 同種の場合、改良個体
                newSpeciesId = species1.id;
            } else {
                // 異種の場合、ランダム選択またはレアハイブリッド
                if (Math.random() < 0.15) { // 15%でレアハイブリッド
                    newSpeciesId = this.createHybrid(species1, species2);
                } else {
                    newSpeciesId = Math.random() < 0.5 ? species1.id : species2.id;
                }
            }
            
            const newTardigrade = {
                id: Date.now() + Math.random(),
                speciesId: newSpeciesId,
                cryptobiosis: false,
                nutrition: 100,
                age: 0
            };
            this.gameState.colony.push(newTardigrade);
            this.gameState.collection.add(newSpeciesId);
            
            const newSpecies = this.tardigradeDatabase.get(newSpeciesId);
            this.showResultModal('合成成功！', `🎉 ${newSpecies.name} が誕生しました！<br><br>${newSpecies.description}`, 'success');
        } else {
            this.showResultModal('合成失敗', '合成に失敗しました...<br>再度挑戦してください。', 'error');
        }
        
        this.selectedParents = [null, null];
        this.updateBreedingUI();
        this.updateUI();
    }

    createHybrid(species1, species2) {
        // 両親より高レア度の新種IDを返す
        const allSpecies = Array.from(this.tardigradeDatabase.values());
        const rareSpecies = allSpecies.filter(s => 
            s.rarity === 'エピック' || s.rarity === 'レジェンダリー'
        );
        const selectedSpecies = rareSpecies[Math.floor(Math.random() * rareSpecies.length)];
        return selectedSpecies.id;
    }

    // クリプトビオシスシステム
    triggerCryptobiosis(all = false) {
        if (all) {
            this.gameState.colony.forEach(tardigrade => {
                tardigrade.cryptobiosis = true;
            });
            this.showResultModal('クリプトビオシス', '全てのクマムシがクリプトビオシス状態になりました。', 'info');
        }
        
        this.updateUI();
    }

    reviveAll() {
        let revivedCount = 0;
        let failedCount = 0;
        
        this.gameState.colony = this.gameState.colony.filter(tardigrade => {
            if (tardigrade.cryptobiosis) {
                const species = this.tardigradeDatabase.get(tardigrade.speciesId);
                const success = Math.random() < species.cryptobiosisRate;
                
                if (success) {
                    tardigrade.cryptobiosis = false;
                    revivedCount++;
                    return true;
                } else {
                    failedCount++;
                    return false;
                }
            }
            return true;
        });

        this.showReviveEffect();
        this.updateUI();
        
        let message = '';
        if (revivedCount > 0) {
            message += `${revivedCount}匹が復活しました！`;
        }
        if (failedCount > 0) {
            message += `\n${failedCount}匹が復活に失敗しました...`;
        }
        
        if (revivedCount > 0 || failedCount > 0) {
            this.showResultModal('復活結果', message, revivedCount > failedCount ? 'success' : 'warning');
        }
    }

    showReviveEffect() {
        const effect = document.getElementById('cryptobiosis-effect');
        effect.style.background = 'linear-gradient(45deg, #4fc3f7, #29b6f6)';
        effect.classList.add('active');
        
        setTimeout(() => {
            effect.classList.remove('active');
        }, 1000);

        document.querySelectorAll('.tardigrade-slot').forEach(slot => {
            if (!slot.classList.contains('cryptobiosis')) {
                slot.classList.add('reviving');
                setTimeout(() => slot.classList.remove('reviving'), 2000);
            }
        });
    }

    // 防衛システム
    updateDefenseDisplay() {
        this.updateThreatMeter();
        this.updateDefenseGrid();
        this.updateAttackTimer();
    }

    updateThreatMeter() {
        const threatBar = document.querySelector('.threat-bar');
        threatBar.style.width = `${this.gameState.threatLevel}%`;
    }

    updateDefenseGrid() {
        const grid = document.getElementById('defense-grid');
        grid.innerHTML = '';

        for (let i = 0; i < 4; i++) {
            const position = document.createElement('div');
            position.className = 'defense-position';
            
            if (this.gameState.defensePositions[i]) {
                const defender = this.gameState.defensePositions[i];
                const species = this.tardigradeDatabase.get(defender.speciesId);
                position.classList.add('occupied');
                position.innerHTML = `
                    <div class="tardigrade-icon">${this.getTardigradeIcon(defender.speciesId)}</div>
                    <div style="font-size: 10px;">${species.name}</div>
                `;
            } else {
                position.innerHTML = '<div class="slot-placeholder">防衛ポジション<br>（空き）</div>';
                position.addEventListener('click', () => this.selectDefender(i));
            }
            
            grid.appendChild(position);
        }
    }

    updateAttackTimer() {
        const timeLeft = Math.max(0, this.gameState.nextAttackTime - Date.now());
        const minutes = Math.floor(timeLeft / 60000);
        document.getElementById('next-attack').textContent = `${minutes}分`;
    }

    selectDefender(position) {
        // 防衛に適したクマムシを選択
        const availableDefenders = this.gameState.colony.filter(t => {
            const species = this.tardigradeDatabase.get(t.speciesId);
            return species.rarity === 'エピック' || species.rarity === 'レジェンダリー' || 
                   species.abilities.includes('捕食') || species.abilities.includes('共食い');
        });

        if (availableDefenders.length > 0) {
            this.gameState.defensePositions[position] = availableDefenders[0];
            this.updateDefenseGrid();
            this.showResultModal('防衛配置', `${this.tardigradeDatabase.get(availableDefenders[0].speciesId).name}を配置しました！`, 'success');
        } else {
            this.showResultModal('防衛配置', '防衛に適したクマムシがいません。レア度の高いクマムシを探索で見つけてください！', 'info');
        }
    }

    // モーダル管理
    showTardigradeDetail(tardigrade) {
        const species = this.tardigradeDatabase.get(tardigrade.speciesId);
        this.showModal(
            species.name,
            `
                <div style="text-align: center; margin-bottom: 16px;">
                    <div style="font-size: 4rem;">${this.getTardigradeIcon(tardigrade.speciesId)}</div>
                </div>
                <p><strong>学名:</strong> ${species.scientificName}</p>
                <p><strong>レア度:</strong> <span style="color: var(--color-primary);">${species.rarity}</span></p>
                <p><strong>サイズ:</strong> ${species.size}</p>
                <p><strong>色:</strong> ${species.color}</p>
                <p><strong>特殊能力:</strong> ${species.abilities}</p>
                <p><strong>説明:</strong> ${species.description}</p>
                <hr style="margin: 16px 0;">
                <p><strong>栄養状態:</strong> ${tardigrade.nutrition}/100</p>
                <p><strong>年齢:</strong> ${tardigrade.age}日</p>
                <p><strong>状態:</strong> ${tardigrade.cryptobiosis ? 'クリプトビオシス中' : '活動中'}</p>
                <div style="margin-top: 16px; display: flex; gap: 8px; flex-wrap: wrap;">
                    <button class="btn btn--primary" onclick="game.feedTardigrade('${tardigrade.id}')">🍽️ 餌を与える</button>
                    <button class="btn btn--secondary" onclick="game.toggleCryptobiosis('${tardigrade.id}')">${tardigrade.cryptobiosis ? '💧 復活' : '💤 休眠'}</button>
                </div>
            `
        );
    }

    showSpeciesDetail(species) {
        this.showModal(
            species.name,
            `
                <div style="text-align: center; margin-bottom: 16px;">
                    <div style="font-size: 4rem;">${this.getTardigradeIcon(species.id)}</div>
                </div>
                <p><strong>学名:</strong> <em>${species.scientificName}</em></p>
                <p><strong>レア度:</strong> <span style="color: var(--color-primary);">${species.rarity}</span></p>
                <p><strong>サイズ:</strong> ${species.size}</p>
                <p><strong>色:</strong> ${species.color}</p>
                <p><strong>特殊能力:</strong> ${species.abilities}</p>
                <p><strong>発見率:</strong> ${species.discoveryRate}</p>
                <p><strong>クリプトビオシス成功率:</strong> ${(species.cryptobiosisRate * 100).toFixed(1)}%</p>
                <hr style="margin: 16px 0;">
                <p><strong>説明:</strong></p>
                <p style="font-style: italic; color: var(--color-text-secondary);">${species.description}</p>
            `
        );
    }

    showModal(title, content) {
        document.getElementById('modal-title').textContent = title;
        document.getElementById('modal-body').innerHTML = content;
        document.getElementById('detail-modal').classList.add('active');
    }

    closeModal() {
        document.getElementById('detail-modal').classList.remove('active');
    }

    showResultModal(title, message, type) {
        document.getElementById('result-title').textContent = title;
        document.getElementById('result-body').innerHTML = `
            <div style="text-align: center;">
                <div style="font-size: 3rem; margin-bottom: 16px;">
                    ${type === 'success' ? '✅' : type === 'error' ? '❌' : type === 'warning' ? '⚠️' : 'ℹ️'}
                </div>
                <div>${message}</div>
            </div>
        `;
        document.getElementById('result-modal').classList.add('active');
    }

    closeResultModal() {
        document.getElementById('result-modal').classList.remove('active');
    }
        releaseTardigrade(tardigradeId) {
        const idx = this.gameState.colony.findIndex(t => t.id === tardigradeId);
        if (idx === -1) return;
        if (!confirm('このクマムシを逃がしますか？元に戻せません。')) return;
        this.gameState.colony.splice(idx, 1);    // コロニーから削除
        this.updateColonyDisplay();
    }

    /* ====== ★★ 新機能：耐性研究ラボ ★★ ====== */
    openLab() {
        this.showScreen('lab');
        this.updateLabDisplay();
    }

    updateLabDisplay() {
        const list = document.getElementById('lab-tardigrade-list');
        list.innerHTML = '';
        if (this.gameState.colony.length === 0) {
            list.innerHTML = '<p>コロニーにクマムシがいません。</p>';
            return;
        }
        this.gameState.colony.forEach(t => {
            const species = this.tardigradeDatabase.get(t.speciesId);
            const div = document.createElement('div');
            div.className = 'lab-entry';
            div.innerHTML = `
                <div class="lab-header">
                    <span class="lab-icon">${this.getTardigradeIcon(species.id)}</span>
                    <span class="lab-name">${species.name}</span>
                    <button class="btn--outline btn--sm release-btn" data-id="${t.id}">逃がす</button>
                </div>
                <div class="lab-stats">
                    乾燥耐性:${species.stats.dryResistance}　
                    寒冷耐性:${species.stats.coldResistance}　
                    熱耐性:${species.stats.heatResistance}
                </div>
                <div class="lab-actions" data-id="${t.id}">
                    <button class="btn--secondary btn--sm exp-btn" data-type="hit">叩く</button>
                    <button class="btn--secondary btn--sm exp-btn" data-type="heat">加熱</button>
                    <button class="btn--secondary btn--sm exp-btn" data-type="cold">冷却</button>
                </div>
            `;
            list.appendChild(div);
        });
    }

    performExperiment(tardigradeId, expType) {
        const t = this.gameState.colony.find(x => x.id === tardigradeId);
        if (!t) return;
        const species = this.tardigradeDatabase.get(t.speciesId);
        const statMap = {
            hit: species.stats.mobility,          // 物理衝撃を mobility で代用
            heat: species.stats.heatResistance,
            cold: species.stats.coldResistance
        };
        const targetStat = statMap[expType] || 0;
        const threshold = Math.floor(Math.random() * 100) + 1; // 1-100
        const success = targetStat >= threshold;

        /* --- 結果保存 --- */
        if (!this.labRecords.has(t.id)) this.labRecords.set(t.id, {});
        const rec = this.labRecords.get(t.id);
        rec[expType] = success ? (rec[expType] || 0) + 1 : (rec[expType] || 0);

        /* --- 成功／失敗処理 --- */
        if (success) {
            this.showResultModal('実験成功', `${species.name} は実験に耐えました！記録 +1`, 'success');
        } else {
            this.showResultModal('実験失敗', `${species.name} は耐えられず死亡しました…`, 'error');
            // 死亡扱い → コロニーから削除
            this.releaseTardigrade(t.id);
        }
        this.updateLabDisplay();
    }

    // ゲームループ
    startGameLoop() {
        setInterval(() => {
            this.updateEnvironment();
            this.updateNutrition();
            this.checkAttacks();
            if (this.currentScreen === 'main') {
                this.updateUI();
            }
        }, 60000); // 1分ごと
    }

    updateEnvironment() {
        // 環境の自然変化
        this.gameState.environment.humidity += (Math.random() - 0.5) * 5;
        this.gameState.environment.humidity = Math.max(0, Math.min(100, this.gameState.environment.humidity));
        
        this.gameState.environment.temperature += (Math.random() - 0.5) * 3;
        this.gameState.environment.temperature = Math.max(-10, Math.min(50, this.gameState.environment.temperature));
    }

    updateNutrition() {
        this.gameState.colony.forEach(tardigrade => {
            if (!tardigrade.cryptobiosis) {
                tardigrade.nutrition = Math.max(0, tardigrade.nutrition - 0.5);
                tardigrade.age++;
            }
        });
    }

    checkAttacks() {
        if (Date.now() >= this.gameState.nextAttackTime) {
            this.triggerAttack();
            this.gameState.nextAttackTime = Date.now() + (Math.random() * 180 + 180) * 60 * 1000; // 3-6時間
        }
        
        this.gameState.threatLevel = Math.min(100, this.gameState.threatLevel + 0.5);
    }

    triggerAttack() {
        const attackPower = Math.floor(Math.random() * 50) + 25;
        const defenseBonus = this.calculateDefenseBonus();
        
        if (attackPower > defenseBonus) {
            // 攻撃成功 - クマムシを失う可能性
            const casualties = Math.floor(Math.random() * 2) + 1;
            const originalLength = this.gameState.colony.length;
            
            for (let i = 0; i < casualties && this.gameState.colony.length > 0; i++) {
                const randomIndex = Math.floor(Math.random() * this.gameState.colony.length);
                this.gameState.colony.splice(randomIndex, 1);
            }
            
            const actualCasualties = originalLength - this.gameState.colony.length;
            this.showResultModal('🚨 攻撃発生！', `共食いクマムシの攻撃により${actualCasualties}匹が失われました！<br>防衛システムを強化してください。`, 'error');
        } else {
            this.showResultModal('🛡️ 防衛成功！', '攻撃を見事に跳ね返しました！<br>防衛クマムシたちが活躍しました。', 'success');
        }
        
        this.gameState.threatLevel = 0;
    }

    calculateDefenseBonus() {
        return this.gameState.defensePositions.filter(p => p !== null).length * 25;
    }

    // ユーティリティメソッド
    feedTardigrade(tardigradeId) {
        const tardigrade = this.gameState.colony.find(t => t.id == tardigradeId);
        if (tardigrade) {
            tardigrade.nutrition = Math.min(100, tardigrade.nutrition + 30);
            this.updateUI();
            this.closeModal();
            this.showResultModal('給餌完了', `栄養が回復しました！<br>栄養値: ${tardigrade.nutrition}/100`, 'success');
        }
    }

    toggleCryptobiosis(tardigradeId) {
        const tardigrade = this.gameState.colony.find(t => t.id == tardigradeId);
        if (tardigrade) {
            tardigrade.cryptobiosis = !tardigrade.cryptobiosis;
            this.updateUI();
            this.closeModal();
            
            if (tardigrade.cryptobiosis) {
                this.showResultModal('クリプトビオシス', 'クマムシが休眠状態に入りました。', 'info');
            } else {
                const species = this.tardigradeDatabase.get(tardigrade.speciesId);
                const success = Math.random() < species.cryptobiosisRate;
                
                if (success) {
                    this.showResultModal('復活成功', 'クマムシが元気に復活しました！', 'success');
                    this.showReviveEffect();
                } else {
                    // 復活失敗
                    const index = this.gameState.colony.findIndex(t => t.id == tardigradeId);
                    this.gameState.colony.splice(index, 1);
                    this.showResultModal('復活失敗', 'クマムシが復活に失敗しました...', 'error');
                }
            }
        }
    }
        updateColonyDisplay() {
        const grid = document.getElementById('colony-grid');
        grid.innerHTML = '';
        for (let i = 0; i < 8; i++) {
            const slot = document.createElement('div');
            slot.className = 'tardigrade-slot';
            if (i < this.gameState.colony.length) {
                const tardigrade = this.gameState.colony[i];
                const species = this.tardigradeDatabase.get(tardigrade.speciesId);
                slot.classList.add(`rarity-${this.getRarityClass(species.rarity)}`);
                if (tardigrade.cryptobiosis) slot.classList.add('cryptobiosis');
                slot.innerHTML = `
                    <div class="tardigrade-icon">${this.getTardigradeIcon(species.id)}</div>
                    <div class="tardigrade-name">${species.name}</div>
                    <button class="btn--outline btn--sm release-btn" data-id="${tardigrade.id}">逃がす</button>
                `;
            } else {
                slot.classList.add('empty');
                slot.textContent = '空きスロット';
            }
            grid.appendChild(slot);
        }
        /* ↓ 逃がすボタンのイベント委任 */
        grid.querySelectorAll('.release-btn').forEach(btn => {
            btn.addEventListener('click', e => {
                const tid = Number(e.target.dataset.id);
                this.releaseTardigrade(tid);
            });
        });
    }

    /* ====== ★★ 合成後に親を消す ★★ ====== */
    performBreeding() {
        if (!this.selectedParents[0] || !this.selectedParents[1]) {
            alert('親を 2 匹選択してください');
            return;
        }
        // 元ロジック：成功率計算→新個体生成
        /* ...既存の成功判定＆子個体生成コード... */

        /* 親個体を削除 */
        this.selectedParents.forEach(parentId => {
            const idx = this.gameState.colony.findIndex(t => t.id === parentId);
            if (idx > -1) this.gameState.colony.splice(idx, 1);
        });
        this.selectedParents = [null, null];
        this.updateBreedingDisplay();
        this.updateColonyDisplay();
    }

    /* ====== ★★ イベントリスナー追加 ★★ ====== */
    initializeEventListeners() {
        /* 既存リスナー… */                                     // main/explore/breeding など[1]
        document.getElementById('explore-btn').addEventListener('click', () => this.showScreen('explore'));
        /* ----- 新規 ----- */
        document.getElementById('lab-btn').addEventListener('click', () => this.openLab());
        /* 研究ラボ内ボタンは毎回描画後に付与 */
        document.getElementById('lab-tardigrade-list').addEventListener('click', e => {
            if (e.target.classList.contains('exp-btn')) {
                const id = Number(e.target.parentElement.dataset.id);
                const type = e.target.dataset.type;
                this.performExperiment(id, type);
            } else if (e.target.classList.contains('release-btn')) {
                const id = Number(e.target.dataset.id);
                this.releaseTardigrade(id);
            }
        });
    }

    /* ====== ★★ 画面遷移に lab を追加 ★★ ====== */
    showScreen(screenName) {
        document.querySelectorAll('.screen, .game-main').forEach(s => s.style.display = 'none');
        if (screenName === 'main') {
            document.getElementById('main-screen').style.display = 'block';
        } else {
            document.getElementById(`${screenName}-screen`).style.display = 'block';
        }
        this.currentScreen = screenName;
        if (screenName === 'collection') this.updateCollectionDisplay();
        if (screenName === 'breeding') this.updateBreedingDisplay();
        if (screenName === 'defense') this.updateDefenseDisplay();
    }
}

// ゲーム初期化
let game;
document.addEventListener('DOMContentLoaded', () => {
    game = new TardigradeGame();
});