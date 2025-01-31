import React from 'react';
import { Filter, SortDesc } from 'lucide-react';

const FilterSort = ({ 
  filterOptions, 
  sortOption, 
  onFilterChange, 
  onSortChange,
  onSearchChange,
  searchTerm
}) => {
  return (
    <div className="filter-sort">
      <div className="filter-sort__container">
        {/* Search */}
        <div className="filter-sort__search">
          <input
            type="text"
            placeholder="Search polls by description..."
            className="filter-sort__search-input"
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>
        
        {/* Filters and Sort */}
        <div className="filter-sort__controls">
          <select 
            className="filter-sort__select"
            value={filterOptions.status}
            onChange={(e) => onFilterChange('status', e.target.value)}
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="ended">Ended</option>
            <option value="not-started">Not Started</option>
          </select>
          
          <select
            className="filter-sort__select"
            value={filterOptions.voteRange}
            onChange={(e) => onFilterChange('voteRange', e.target.value)}
          >
            <option value="all">All Votes</option>
            <option value="0-10">0-10</option>
            <option value="11-50">11-50</option>
            <option value="50+">50+</option>
          </select>

          <select
            className="filter-sort__select"
            value={sortOption}
            onChange={(e) => onSortChange(e.target.value)}
          >
            <option value="newest">Newest</option>
            <option value="oldest">Oldest</option>
            <option value="ending-soon">Ending Soon</option>
            <option value="most-votes">Most Votes</option>
            <option value="alphabetical">A-Z</option>
          </select>
        </div>
      </div>
    </div>
  );
};

export default FilterSort;