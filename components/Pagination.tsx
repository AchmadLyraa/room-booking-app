"use client";

import React from "react";

interface PaginationProps {
  itemsPerPage: number;
  totalItems: number;
  paginate: (pageNumber: number) => void;
  currentPage: number;
}

export default function Pagination({
  itemsPerPage,
  totalItems,
  paginate,
  currentPage,
}: PaginationProps) {
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  if (totalPages <= 1) return null;

  const pageNumbers = [];
  const maxPagesToShow = 5;
  let startPage = Math.max(1, currentPage - Math.floor(maxPagesToShow / 2));
  let endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);

  if (endPage - startPage < maxPagesToShow - 1) {
    startPage = Math.max(1, endPage - maxPagesToShow + 1);
  }

  for (let i = startPage; i <= endPage; i++) {
    pageNumbers.push(i);
  }

  return (
    <nav className="flex items-center justify-center gap-2">
      <button
        onClick={() => paginate(1)}
        disabled={currentPage === 1}
        className="px-3 py-2 border rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
        title="First page"
      >
        {"<<"}
      </button>

      <button
        onClick={() => paginate(currentPage - 1)}
        disabled={currentPage === 1}
        className="px-3 py-2 border rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
        title="Previous page"
      >
        {"<"}
      </button>

      <div className="flex gap-1">
        {startPage > 1 && (
          <>
            <button
              onClick={() => paginate(1)}
              className="px-3 py-2 border rounded hover:bg-gray-100"
            >
              1
            </button>
            {startPage > 2 && <span className="px-2 py-2">...</span>}
          </>
        )}

        {pageNumbers.map((pageNumber) => (
          <button
            key={pageNumber}
            onClick={() => paginate(pageNumber)}
            className={`px-3 py-2 border rounded ${
              currentPage === pageNumber
                ? "bg-blue-500 text-white border-blue-500"
                : "hover:bg-gray-100"
            }`}
          >
            {pageNumber}
          </button>
        ))}

        {endPage < totalPages && (
          <>
            {endPage < totalPages - 1 && <span className="px-2 py-2">...</span>}
            <button
              onClick={() => paginate(totalPages)}
              className="px-3 py-2 border rounded hover:bg-gray-100"
            >
              {totalPages}
            </button>
          </>
        )}
      </div>

      <button
        onClick={() => paginate(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="px-3 py-2 border rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
        title="Next page"
      >
        {">"}
      </button>

      <button
        onClick={() => paginate(totalPages)}
        disabled={currentPage === totalPages}
        className="px-3 py-2 border rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
        title="Last page"
      >
        {">>"}
      </button>

      <span className="ml-4 text-sm text-gray-600">
        Page {currentPage} of {totalPages} ({totalItems} items)
      </span>
    </nav>
  );
}
