'use client';
import { forwardRef } from 'react';
import { Monogram } from '../ui';
import { MenuIcon, PlusIcon, RefreshIcon, SearchIcon, StarIcon } from '../icons';

const EntryList = forwardRef(function EntryList(
  { title, items, total, strengths, selectedId, onSelect, query, setQuery, loading, onRefresh, onNew, onMenu },
  searchRef
) {
  return (
    <section className="flex min-w-0 flex-1 flex-col border-r border-line lg:w-[360px] lg:flex-none xl:w-[400px]">
      {/* Search bar */}
      <div className="flex h-14 items-center gap-2 border-b border-line px-3">
        <button className="icon-btn md:hidden" onClick={onMenu} aria-label="Open menu">
          <MenuIcon />
        </button>
        <div className="relative flex-1">
          <SearchIcon className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-faint" />
          <input
            ref={searchRef}
            type="search"
            className="input h-9 border-transparent bg-raised pl-8 pr-9 hover:border-line"
            placeholder="Search vault"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            aria-label="Search vault"
          />
          <span className="kbd pointer-events-none absolute right-2 top-1/2 hidden -translate-y-1/2 md:inline-flex">/</span>
        </div>
        <button className="icon-btn md:hidden" onClick={onNew} aria-label="New item">
          <PlusIcon />
        </button>
      </div>

      {/* List header */}
      <div className="flex h-10 items-center justify-between px-4">
        <p className="truncate text-xs font-medium text-muted">
          {title}
          <span className="ml-2 font-mono text-faint">
            {query ? `${items.length} of ${total}` : items.length}
          </span>
        </p>
        <button
          className="icon-btn h-7 w-7"
          onClick={onRefresh}
          disabled={loading}
          title="Refresh"
          aria-label="Refresh"
        >
          <RefreshIcon className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Items */}
      <div className="flex-1 overflow-y-auto px-2 pb-4" role="listbox" aria-label="Vault items">
        {loading && items.length === 0 ? (
          <Skeleton />
        ) : items.length === 0 ? (
          <Empty query={query} total={total} onNew={onNew} />
        ) : (
          <ul className="space-y-px">
            {items.map((item) => {
              const active = item.id === selectedId;
              const weak = strengths[item.id] === 'weak';
              return (
                <li key={item.id}>
                  <button
                    role="option"
                    aria-selected={active}
                    data-id={item.id}
                    onClick={() => onSelect(item.id)}
                    className={`relative flex w-full items-center gap-3 rounded-md px-2.5 py-2 text-left transition-colors ${
                      active ? 'bg-raised' : 'hover:bg-raised/50'
                    }`}
                  >
                    {active && <span className="absolute inset-y-2 left-0 w-0.5 rounded-full bg-accent" />}
                    <Monogram name={item.website || '?'} />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-fg">{item.website || 'Untitled'}</p>
                      <p className="truncate text-xs text-muted">{item.username || '—'}</p>
                    </div>
                    <div className="flex shrink-0 items-center gap-1.5">
                      {weak && (
                        <span className="rounded bg-warn/10 px-1.5 py-0.5 font-mono text-2xs text-warn">weak</span>
                      )}
                      {item.favorite && <StarIcon filled className="h-3.5 w-3.5 text-warn" />}
                    </div>
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </section>
  );
});

export default EntryList;

function Skeleton() {
  return (
    <ul className="space-y-px">
      {[0, 1, 2, 3, 4].map((i) => (
        <li key={i} className="flex items-center gap-3 px-2.5 py-2">
          <span className="h-8 w-8 animate-pulse rounded-md bg-raised" />
          <span className="flex-1 space-y-1.5">
            <span className="block h-3 w-1/2 animate-pulse rounded bg-raised" />
            <span className="block h-2.5 w-1/3 animate-pulse rounded bg-raised" />
          </span>
        </li>
      ))}
    </ul>
  );
}

function Empty({ query, total, onNew }) {
  if (query) {
    return (
      <div className="px-4 py-16 text-center">
        <p className="text-sm text-fg">No matches for “{query}”</p>
        <p className="mt-1 text-xs text-muted">Search looks at website, username and folder.</p>
      </div>
    );
  }
  if (total > 0) {
    return (
      <div className="px-4 py-16 text-center">
        <p className="text-sm text-fg">Nothing here</p>
        <p className="mt-1 text-xs text-muted">No items match this view.</p>
      </div>
    );
  }
  return (
    <div className="px-4 py-16 text-center">
      <p className="text-sm text-fg">Your vault is empty</p>
      <p className="mx-auto mt-1 max-w-[16rem] text-xs leading-relaxed text-muted">
        Items are encrypted in this browser before they are saved.
      </p>
      <button className="btn-secondary mt-5" onClick={onNew}>
        <PlusIcon />
        Add first item
      </button>
    </div>
  );
}
