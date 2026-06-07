import React, { useState } from 'react';
import { useGameState } from '../../context/GameStateContext';
import { ShoppingBag, Coins, Check, Lock } from 'lucide-react';

interface CosmeticItem {
  id: string;
  name: string;
  cost: number;
  category: 'hat' | 'outfit' | 'weaponSkin' | 'trail' | 'vfx';
  description: string;
}

const SHOP_ITEMS: CosmeticItem[] = [
  // Hats
  { id: 'classic_hat', name: 'Safari Explorer Hat', cost: 0, category: 'hat', description: 'Kani\'s iconic classic adventurer sun-brim hat.' },
  { id: 'ranger_cap', name: 'Elite Ranger Beret', cost: 150, category: 'hat', description: 'Red military beret worn by deep-cover operatives.' },
  { id: 'golden_hat', name: 'Golden Kani Crown', cost: 400, category: 'hat', description: 'A massive 24k gold crown fit for the king of mascot shooters.' },
  { id: 'tactical_helmet', name: 'Assault Mech Visor', cost: 800, category: 'hat', description: 'Robotic helmet with tactical green HUD lenses.' },

  // Outfits
  { id: 'classic_outfit', name: 'Safari Explorer Suit', cost: 0, category: 'outfit', description: 'Classic safari adventure shirt with utility cargo loops.' },
  { id: 'steel_armor', name: 'Steel Plated Armor', cost: 300, category: 'outfit', description: 'Bulletproof steel composite plating covering the chest.' },
  { id: 'jungle_camo', name: 'Jungle Outpost Camo', cost: 600, category: 'outfit', description: 'Olive green camouflage jacket designed for tactical stealth.' },
  { id: 'carbon_suit', name: 'Carbon Fiber Exosuit', cost: 1200, category: 'outfit', description: 'Advanced mechanical body armor harness with power boosters.' },

  // Weapon Skins
  { id: 'default_skin', name: 'Factory Matte Grey', cost: 0, category: 'weaponSkin', description: 'Standard issue dark gunmetal plating.' },
  { id: 'gold_skin', name: 'Gold Trimmed Muzzle', cost: 500, category: 'weaponSkin', description: 'High-polish custom gold electroplated barrel coating.' },
  { id: 'neon_skin', name: 'Neon Toxic Reactor', cost: 1000, category: 'weaponSkin', description: 'Toxic green radioactive striping that glows in low-light.' },
];

export const ShopTab: React.FC = () => {
  const { userProfile, buyCosmetic, equipCosmetic } = useGameState();
  const [activeCategory, setActiveCategory] = useState<'hat' | 'outfit' | 'weaponSkin'>('hat');

  const filteredItems = SHOP_ITEMS.filter(item => item.category === activeCategory);

  const handleAction = (item: CosmeticItem) => {
    const isUnlocked = userProfile.unlockedCosmetics.includes(item.id) || item.cost === 0;

    if (isUnlocked) {
      // Equip item
      equipCosmetic(item.category, item.id);
    } else {
      // Purchase item
      buyCosmetic(item.id, item.cost);
    }
  };

  return (
    <div className="font-mono text-zinc-300">
      <div className="flex justify-between items-center mb-2">
        <h2 className="text-md font-black text-kani-green flex items-center gap-2">
          <ShoppingBag className="w-5 h-5 text-kani-green" />
          KANI CUSTOMS UPGRADES
        </h2>
        <div className="flex items-center gap-1.5 bg-zinc-900 border border-zinc-800 px-3 py-1 rounded text-xs">
          <Coins className="w-4 h-4 text-kani-green" />
          <span className="text-kani-green font-bold">{userProfile.coins} COINS</span>
        </div>
      </div>
      
      <p className="text-xs text-zinc-400 mb-6">
        Unlock aesthetic cosmetics (hats, explorer suits, weapon barrels) to customize Kani. Cosmetic upgrades do not affect stats.
      </p>

      {/* Category selector */}
      <div className="flex gap-2 mb-6 border-b border-zinc-900 pb-3">
        {(['hat', 'outfit', 'weaponSkin'] as const).map(cat => {
          let label = 'Hats';
          if (cat === 'outfit') label = 'Outfits';
          if (cat === 'weaponSkin') label = 'Weapon Skins';

          return (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-1.5 rounded text-xs font-bold transition-all ${
                activeCategory === cat 
                  ? 'bg-kani-green text-black shadow-[0_0_10px_rgba(182,120,255,0.25)]' 
                  : 'bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-850'
              }`}
            >
              {label}
            </button>
          );
        })}
      </div>

      {/* Item grid layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredItems.map(item => {
          const isUnlocked = userProfile.unlockedCosmetics.includes(item.id) || item.cost === 0;
          const isEquipped = userProfile.activeCosmetics[item.category] === item.id;
          const canAfford = userProfile.coins >= item.cost;

          return (
            <div 
              key={item.id}
              className={`p-4 border rounded-lg flex justify-between items-center gap-4 bg-zinc-950-60 transition-all ${
                isEquipped 
                  ? 'border-kani-30 bg-kani-5' 
                  : 'border-zinc-800'
              }`}
            >
              <div className="flex-grow">
                <div className="flex items-center gap-2">
                  <h4 className="text-xs font-bold text-white uppercase">{item.name}</h4>
                  {isEquipped && (
                    <span className="text-[8px] bg-green-500-10 text-green-400 border border-green-500-20 px-1.5 py-0.5 rounded font-bold">
                      EQUIPPED
                    </span>
                  )}
                </div>
                <p className="text-[10px] text-zinc-400 mt-1 max-w-sm">
                  {item.description}
                </p>
                {item.cost > 0 && !isUnlocked && (
                  <div className="flex items-center gap-1 mt-2 text-[10px] text-kani-green font-black">
                    <Coins className="w-3 h-3 text-kani-green" />
                    <span>{item.cost} COINS</span>
                  </div>
                )}
              </div>

              <button
                onClick={() => handleAction(item)}
                disabled={!isUnlocked && !canAfford}
                className={`px-4 py-2 text-xs font-bold rounded tracking-wider shrink-0 transition-all ${
                  isEquipped 
                    ? 'bg-green-700-20 text-green-500 border border-green-800-40 cursor-default' 
                    : isUnlocked 
                      ? 'bg-zinc-900 border border-zinc-800 text-white hover:bg-zinc-800' 
                      : canAfford 
                        ? 'bg-kani-green text-black hover:bg-purple-600 shadow-[0_0_10px_rgba(182,120,255,0.3)]' 
                        : 'bg-zinc-950 border border-zinc-900 text-zinc-650 cursor-not-allowed'
                }`}
              >
                {isEquipped ? (
                  <Check className="w-4 h-4 mx-auto" />
                ) : isUnlocked ? (
                  'EQUIP'
                ) : canAfford ? (
                  'BUY'
                ) : (
                  <span className="flex items-center gap-1">
                    <Lock className="w-3.5 h-3.5" />
                    LOCKED
                  </span>
                )}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};
export default ShopTab;
