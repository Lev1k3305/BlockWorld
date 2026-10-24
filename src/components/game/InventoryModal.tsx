import React from 'react';
import { X, Gem, Star, Compass, Sparkles } from 'lucide-react';
import { HeroType, QuestState } from '../../game/types';
import { birthdayConfig } from '../../config/birthdayConfig';

interface InventoryModalProps {
  questState: QuestState;
  heroType: HeroType;
  onClose: () => void;
}

export const InventoryModal: React.FC<InventoryModalProps> = ({
  questState,
  heroType,
  onClose,
}) => {
  const hero = heroType === 'sister' ? birthdayConfig.heroes.sister : birthdayConfig.heroes.brother;
  const totalCrystals = birthdayConfig.questItems.totalCrystals;
  const totalStars = birthdayConfig.questItems.totalStars;

  const crystalList = [
    {
      id: 'crystal_parkour',
      name: 'Кристалл небесного паркура',
      color: 'text-sky-300 border-sky-500/50 bg-sky-950/40',
      desc: 'Наполнен чистым ветром парящих вершин. Найден на высоких каменных столбах паркура.',
      collected: !!questState.crystalsCollected['crystal_parkour'],
    },
    {
      id: 'crystal_cave',
      name: 'Кристалл скрытой пещеры',
      color: 'text-emerald-300 border-emerald-500/50 bg-emerald-950/40',
      desc: 'Хранит древнюю силу земли и кристаллов. Обнаружен в глубинах пещеры на северо-восточном холме.',
      collected: !!questState.crystalsCollected['crystal_cave'],
    },
    {
      id: 'crystal_waterfall',
      name: 'Кристалл грота водопада',
      color: 'text-purple-300 border-purple-500/50 bg-purple-950/40',
      desc: 'Сверкает первозданной чистотой горного потока. Скрыт за каскадом бирюзового водопада.',
      collected: !!questState.crystalsCollected['crystal_waterfall'],
    },
  ];

  const starsCount = Object.values(questState.starsCollected).filter(Boolean).length;
  const collectedCrystalsCount = Object.values(questState.crystalsCollected).filter(Boolean).length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-lg bg-slate-900 border-2 border-slate-700 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 bg-slate-800/90 border-b border-slate-700">
          <div className="flex items-center gap-2">
            <Compass className="w-5 h-5 text-amber-400" />
            <h2 className="text-base sm:text-lg font-bold font-fun text-white">Инвентарь приключений</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700 transition-colors touch-btn"
            title="Закрыть"
            aria-label="Закрыть"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto space-y-5">
          {/* Active Hero Summary */}
          <div className="p-3.5 bg-slate-800/50 rounded-2xl border border-slate-700/60 flex items-center gap-3.5">
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center text-xl font-bold shadow-md shrink-0"
              style={{ backgroundColor: hero.outfitColor }}
            >
              {heroType === 'sister' ? '✨' : '♞'}
            </div>
            <div>
              <div className="text-sm font-bold text-white flex items-center gap-2">
                <span>{hero.name}</span>
                <span className="text-xs text-amber-300 font-mono bg-amber-950/60 px-1.5 py-0.5 rounded border border-amber-600/30">
                  {hero.age} лет
                </span>
              </div>
              <p className="text-xs text-slate-300 font-fun font-semibold">{hero.role}</p>
              <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">{hero.description}</p>
            </div>
          </div>

          {/* Crystals Section */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2.5 flex items-center gap-1.5">
              <Gem className="w-4 h-4 text-sky-400" />
              Магические кристаллы острова ({collectedCrystalsCount}/{totalCrystals})
            </h3>
            <div className="grid grid-cols-1 gap-2.5">
              {crystalList.map((c) => (
                <div
                  key={c.id}
                  className={`p-3 rounded-2xl border flex items-start gap-3 transition-all ${
                    c.collected ? c.color : 'border-slate-800 bg-slate-950/50 opacity-60'
                  }`}
                >
                  <div className={`p-2 rounded-xl ${c.collected ? 'bg-black/30' : 'bg-slate-800'}`}>
                    <Gem className={`w-5 h-5 ${c.collected ? 'text-current animate-pulse' : 'text-slate-600'}`} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-100">{c.name}</span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-black/40">
                        {c.collected ? 'Найден' : 'Не найден'}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-300 mt-1 leading-relaxed">
                      {c.collected ? c.desc : 'Исследуйте остров, чтобы отыскать этот кристалл.'}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Birthday Stars Section */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
              <Star className="w-4 h-4 text-amber-400" />
              Праздничные звёзды ({starsCount}/{totalStars})
            </h3>
            <div className="flex items-center gap-2 p-3 bg-slate-950/60 rounded-2xl border border-slate-800">
              {[1, 2, 3, 4, 5].map((idx) => {
                const isCollected = !!questState.starsCollected[`star_${idx}`];
                return (
                  <div
                    key={idx}
                    className={`flex-1 flex flex-col items-center justify-center py-2 rounded-xl border text-center ${
                      isCollected
                        ? 'border-amber-500/40 bg-amber-500/10 text-amber-300'
                        : 'border-slate-800 bg-slate-900/60 text-slate-600'
                    }`}
                  >
                    <Star className={`w-5 h-5 ${isCollected ? 'fill-amber-400 text-amber-400' : 'text-slate-600'}`} />
                    <span className="text-[10px] font-mono mt-1">#{idx}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Heart of the Island Lore */}
          <div className="p-3.5 bg-gradient-to-r from-purple-950/40 to-slate-900 rounded-2xl border border-purple-500/30 text-xs">
            <div className="font-bold text-purple-300 flex items-center gap-1.5 mb-1">
              <Sparkles className="w-4 h-4 text-purple-400" />
              Сердце острова
            </div>
            <p className="text-slate-300 text-[11px] leading-relaxed">
              {questState.heartRestored
                ? 'Сердце острова сияет чистой магией! Открылся древний портал в праздничный зал с подарками.'
                : `Соберите ${totalCrystals} кристалла и активируйте центральный монолит, чтобы восстановить Сердце острова.`}
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-800/80 border-t border-slate-700 text-center">
          <button
            onClick={onClose}
            className="w-full py-3 bg-slate-700 hover:bg-slate-600 active:scale-95 text-white font-bold rounded-2xl transition-all touch-btn text-sm font-fun"
          >
            Вернуться к приключению
          </button>
        </div>
      </div>
    </div>
  );
};
