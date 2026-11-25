import { Search, SlidersHorizontal, X } from 'lucide-react'
import { categories, regions, zones } from '../data/regions'
import { useApp } from '../context/AppContext'

export function FilterBar({ filters, onChange, count }) {
  const { t } = useApp()
  const options = { state: regions.map((region) => region.name), category: categories, zone: zones }
  const Select = ({ field, label }) => <label className="filter-select"><span>{label}</span><select value={filters[field]} onChange={(event) => onChange({ ...filters, [field]: event.target.value })}><option value="All">{t.all}</option>{options[field].filter((item) => item !== 'All').map((item) => <option key={item}>{item}</option>)}</select></label>
  return <div className="themed-surface rounded-3xl p-3 shadow-[0_10px_35px_-25px_rgba(7,28,60,0.3)]">
    <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
      <label className="relative min-w-0 flex-1"><Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" size={18} /><input value={filters.query} onChange={(event) => onChange({ ...filters, query: event.target.value })} placeholder={t.searchPlaceholder} className="input !pl-11" /></label>
      <div className="grid grid-cols-3 gap-2 sm:flex"><Select field="state" label={t.state} /><Select field="category" label={t.category} /><Select field="zone" label={t.zone} /></div>
      <button onClick={() => onChange({ query: '', state: 'All', category: 'All', zone: 'All' })} className="inline-flex items-center justify-center gap-1.5 rounded-xl px-3 py-3 text-xs font-bold text-[var(--text-muted)] hover:bg-[var(--bg-card-soft)]"><X size={15} />{t.clear}</button>
    </div>
    <div className="mt-2 flex items-center gap-2 px-2 text-xs text-[var(--text-muted)]"><SlidersHorizontal size={13} /><strong className="text-[var(--text-primary)]">{count}</strong> {t.destination}</div>
  </div>
}
