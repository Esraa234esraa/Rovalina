import { Minus, Plus, Trash2 } from 'lucide-react';

export default function CartItemCard({ item, onDecrease, onIncrease, onRemove }) {
  return (
    <div className="card p-4 flex flex-col sm:flex-row gap-4 items-center">
      <img src={item.image} alt={item.name} className="w-20 h-20 object-cover rounded-lg" />
      <div className="flex-1 w-full">
        <h3 className="font-semibold text-ink-800 dark:text-secondary-100">{item.name}</h3>
        <p className="text-sm text-ink-500 dark:text-secondary-300">{item.price} ج.م</p>
      </div>
      <div className="flex flex-row sm:flex-col items-center gap-2 w-full sm:w-auto justify-center">
        <div className="flex items-center gap-2 justify-center w-full sm:w-auto">
          <button className="p-2 rounded bg-surface-200" onClick={onDecrease}>
            <Minus className="w-4 h-4" />
          </button>
          <span className="w-8 text-center">{item.quantity}</span>
          <button className="p-2 rounded bg-surface-200" onClick={onIncrease}>
            <Plus className="w-4 h-4" />
          </button>
        </div>
        <button className="p-2 rounded bg-red-100 text-red-700 mt-2 sm:mt-0" onClick={onRemove}>
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
