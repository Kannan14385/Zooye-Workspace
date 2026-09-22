import React, { useState } from 'react';
import { Plus, Search, Trash2, ArrowUpDown, CheckCircle2 } from 'lucide-react';
import { DatabaseRow } from '../types';
import { TEAM_MEMBERS } from '../data/initialData';

interface DatabaseTableProps {
  rows: DatabaseRow[];
  onChange: (rows: DatabaseRow[]) => void;
}

const STATUS_OPTIONS: Array<DatabaseRow['status']> = [
  'Not Started',
  'In Progress',
  'Completed',
  'On Hold',
];

const STATUS_BADGES: Record<DatabaseRow['status'], string> = {
  'Not Started': 'bg-stone-100 text-stone-700 border-stone-200',
  'In Progress': 'bg-sky-50 text-sky-800 border-sky-200',
  Completed: 'bg-emerald-50 text-emerald-800 border-emerald-200',
  'On Hold': 'bg-amber-50 text-amber-800 border-amber-200',
};

const PRIORITY_BADGES: Record<DatabaseRow['priority'], string> = {
  Low: 'text-stone-600 bg-stone-50 border-stone-200',
  Medium: 'text-blue-700 bg-blue-50 border-blue-200',
  High: 'text-rose-700 bg-rose-50 border-rose-200',
};

export const DatabaseTable: React.FC<DatabaseTableProps> = ({ rows, onChange }) => {
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [sortField, setSortField] = useState<keyof DatabaseRow>('targetDate');
  const [sortAsc, setSortAsc] = useState(true);

  const categories = Array.from(new Set(rows.map((r) => r.category)));

  const handleUpdateCell = (id: string, updates: Partial<DatabaseRow>) => {
    onChange(rows.map((r) => (r.id === id ? { ...r, ...updates } : r)));
  };

  const handleAddRow = () => {
    const newRow: DatabaseRow = {
      id: 'row-' + Math.random().toString(36).substring(2, 9),
      title: 'New Office Goal or Objective',
      category: 'General',
      status: 'Not Started',
      owner: TEAM_MEMBERS[0].name,
      priority: 'Medium',
      targetDate: 'End of Quarter',
      progress: 0,
    };
    onChange([...rows, newRow]);
  };

  const handleDeleteRow = (id: string) => {
    onChange(rows.filter((r) => r.id !== id));
  };

  const filtered = rows.filter((r) => {
    const matchSearch =
      r.title.toLowerCase().includes(search.toLowerCase()) ||
      r.owner.toLowerCase().includes(search.toLowerCase()) ||
      r.category.toLowerCase().includes(search.toLowerCase());
    const matchCat = categoryFilter === 'all' || r.category === categoryFilter;
    return matchSearch && matchCat;
  });

  const sorted = [...filtered].sort((a, b) => {
    const valA = a[sortField];
    const valB = b[sortField];
    if (typeof valA === 'number' && typeof valB === 'number') {
      return sortAsc ? valA - valB : valB - valA;
    }
    return sortAsc
      ? String(valA).localeCompare(String(valB))
      : String(valB).localeCompare(String(valA));
  });

  const toggleSort = (field: keyof DatabaseRow) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(true);
    }
  };

  return (
    <div className="w-full pb-20">
      {/* Table Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4 pb-3 border-b border-stone-200">
        <div className="flex items-center gap-2 flex-1 min-w-[240px]">
          <div className="relative w-full max-w-xs">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-stone-600" />
            <input
              id="table-search-input"
              type="text"
              placeholder="Filter objectives, owners..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full text-xs pl-8 pr-3 py-1.5 bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-stone-400"
            />
          </div>

          <select
            id="table-category-filter"
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="text-xs py-1.5 px-2.5 bg-stone-50 border border-stone-200 rounded-lg text-stone-700 focus:outline-none"
          >
            <option value="all">All Departments</option>
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        <button
          type="button"
          id="table-add-row-btn"
          onClick={handleAddRow}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-stone-900 text-white rounded-lg text-xs font-medium hover:bg-stone-800 transition-colors shadow-xs"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Objective</span>
        </button>
      </div>

      {/* Main Table */}
      <div className="overflow-x-auto border border-stone-200 rounded-xl shadow-xs bg-white">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-stone-50/80 border-b border-stone-200 text-stone-600 font-semibold select-none">
              <th className="p-3 w-8 text-center border-r border-stone-100">#</th>
              <th
                onClick={() => toggleSort('title')}
                className="p-3 cursor-pointer hover:bg-stone-100/60 border-r border-stone-100 min-w-[260px]"
              >
                <div className="flex items-center gap-1.5">
                  <span>Objective / Key Result</span>
                  <ArrowUpDown className="w-3 h-3 text-stone-600" />
                </div>
              </th>
              <th
                onClick={() => toggleSort('category')}
                className="p-3 cursor-pointer hover:bg-stone-100/60 border-r border-stone-100 min-w-[130px]"
              >
                <div className="flex items-center gap-1.5">
                  <span>Department</span>
                  <ArrowUpDown className="w-3 h-3 text-stone-600" />
                </div>
              </th>
              <th
                onClick={() => toggleSort('status')}
                className="p-3 cursor-pointer hover:bg-stone-100/60 border-r border-stone-100 min-w-[130px]"
              >
                <div className="flex items-center gap-1.5">
                  <span>Status</span>
                  <ArrowUpDown className="w-3 h-3 text-stone-600" />
                </div>
              </th>
              <th className="p-3 border-r border-stone-100 min-w-[130px]">Owner</th>
              <th className="p-3 border-r border-stone-100 min-w-[100px]">Priority</th>
              <th
                onClick={() => toggleSort('progress')}
                className="p-3 cursor-pointer hover:bg-stone-100/60 border-r border-stone-100 min-w-[150px]"
              >
                <div className="flex items-center gap-1.5">
                  <span>Progress</span>
                  <ArrowUpDown className="w-3 h-3 text-stone-600" />
                </div>
              </th>
              <th className="p-3 border-r border-stone-100 min-w-[110px]">Target</th>
              <th className="p-3 w-10 text-center"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100 text-stone-800">
            {sorted.map((row, idx) => (
              <tr key={row.id} className="hover:bg-stone-50/50 group transition-colors">
                <td className="p-3 text-center text-stone-600 border-r border-stone-100 font-mono text-[11px]">
                  {idx + 1}
                </td>
                {/* Title */}
                <td className="p-3 border-r border-stone-100 font-medium">
                  <input
                    type="text"
                    value={row.title}
                    onChange={(e) => handleUpdateCell(row.id, { title: e.target.value })}
                    className="w-full bg-transparent focus:outline-none focus:bg-white focus:ring-1 focus:ring-stone-300 rounded px-1 -mx-1"
                  />
                </td>
                {/* Category */}
                <td className="p-3 border-r border-stone-100">
                  <span className="px-2 py-0.5 rounded-md bg-stone-100 text-stone-700 font-medium text-[11px]">
                    {row.category}
                  </span>
                </td>
                {/* Status */}
                <td className="p-3 border-r border-stone-100">
                  <select
                    value={row.status}
                    onChange={(e) =>
                      handleUpdateCell(row.id, {
                        status: e.target.value as DatabaseRow['status'],
                        progress: e.target.value === 'Completed' ? 100 : row.progress,
                      })
                    }
                    className={`text-[11px] font-medium px-2 py-1 rounded-md border focus:outline-none cursor-pointer ${
                      STATUS_BADGES[row.status]
                    }`}
                  >
                    {STATUS_OPTIONS.map((st) => (
                      <option key={st} value={st}>
                        {st}
                      </option>
                    ))}
                  </select>
                </td>
                {/* Owner */}
                <td className="p-3 border-r border-stone-100">
                  <select
                    value={row.owner}
                    onChange={(e) => handleUpdateCell(row.id, { owner: e.target.value })}
                    className="text-xs text-stone-700 bg-transparent focus:outline-none cursor-pointer"
                  >
                    {TEAM_MEMBERS.map((m) => (
                      <option key={m.id} value={m.name}>
                        {m.name}
                      </option>
                    ))}
                  </select>
                </td>
                {/* Priority */}
                <td className="p-3 border-r border-stone-100">
                  <select
                    value={row.priority}
                    onChange={(e) =>
                      handleUpdateCell(row.id, {
                        priority: e.target.value as DatabaseRow['priority'],
                      })
                    }
                    className={`text-[10px] font-semibold px-1.5 py-0.5 rounded border focus:outline-none cursor-pointer ${
                      PRIORITY_BADGES[row.priority]
                    }`}
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                  </select>
                </td>
                {/* Progress Bar & Slider */}
                <td className="p-3 border-r border-stone-100">
                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-stone-100 rounded-full h-2 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${
                          row.progress >= 100 ? 'bg-emerald-500' : 'bg-stone-900'
                        }`}
                        style={{ width: `${Math.min(100, Math.max(0, row.progress))}%` }}
                      />
                    </div>
                    <input
                      type="number"
                      min={0}
                      max={100}
                      value={row.progress}
                      onChange={(e) =>
                        handleUpdateCell(row.id, {
                          progress: Number(e.target.value),
                          status: Number(e.target.value) >= 100 ? 'Completed' : row.status,
                        })
                      }
                      className="w-10 text-[11px] font-mono text-right bg-transparent focus:outline-none"
                    />
                    <span className="text-[11px] text-stone-600 -ml-1">%</span>
                  </div>
                </td>
                {/* Target Date */}
                <td className="p-3 border-r border-stone-100">
                  <input
                    type="text"
                    value={row.targetDate}
                    onChange={(e) => handleUpdateCell(row.id, { targetDate: e.target.value })}
                    className="w-full text-xs text-stone-600 bg-transparent focus:outline-none"
                  />
                </td>
                {/* Actions */}
                <td className="p-3 text-center">
                  <button
                    type="button"
                    title="Delete row"
                    onClick={() => handleDeleteRow(row.id)}
                    className="opacity-0 group-hover:opacity-100 p-1 text-stone-600 hover:text-red-600 transition-opacity"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {sorted.length === 0 && (
          <div className="py-12 text-center text-xs text-stone-600">
            No matching rows found in this database.
          </div>
        )}

        <div className="p-2.5 bg-stone-50 border-t border-stone-200 flex items-center justify-between text-xs text-stone-600">
          <span>{sorted.length} total objectives tracked</span>
          <button
            type="button"
            onClick={handleAddRow}
            className="hover:text-stone-900 font-medium flex items-center gap-1 text-[11px]"
          >
            <Plus className="w-3 h-3" /> Add Row
          </button>
        </div>
      </div>
    </div>
  );
};
